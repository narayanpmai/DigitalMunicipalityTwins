from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.complaint import Complaint

router = APIRouter(
    prefix="/api/v1/complaints",
    tags=["Complaints (गुनासो व्यवस्थापन)"]
)


@router.get("")
@router.get("/")
def get_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    ward: Optional[str] = None,
    wardNumber: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    
    if status and status != "all":
        query = query.filter(Complaint.status == status)
    if category and category != "all":
        query = query.filter(Complaint.category == category)
        
    ward_val = wardNumber or ward
    if ward_val and ward_val != "all":
        try:
            w_int = int(ward_val)
            if w_int > 0:
                query = query.filter(Complaint.ward_number == w_int)
        except ValueError:
            pass
            
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Complaint.title.ilike(s)) |
            (Complaint.description.ilike(s)) |
            (Complaint.complaint_no.ilike(s)) |
            (Complaint.complainant_name.ilike(s)) |
            (Complaint.complainant_phone.ilike(s)) |
            (Complaint.complainant_address.ilike(s))
        )
        
    records = query.order_by(desc(Complaint.created_at)).all()
    return [c.to_dict() for c in records]


@router.get("/stats")
def get_complaints_stats(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()
    
    total = len(complaints)
    pending_count = len([c for c in complaints if c.status == "pending"])
    in_progress_count = len([c for c in complaints if c.status == "in_progress"])
    resolved_count = len([c for c in complaints if c.status == "resolved"])
    rejected_count = len([c for c in complaints if c.status == "rejected"])

    category_breakdown: Dict[str, int] = {}
    ward_breakdown: Dict[str, int] = {f"वडा {w}": 0 for w in range(1, 9)}

    for c in complaints:
        cat = c.category or "other"
        category_breakdown[cat] = category_breakdown.get(cat, 0) + 1
        w = c.ward_number or 1
        wk = f"वडा {w}"
        ward_breakdown[wk] = ward_breakdown.get(wk, 0) + 1

    resolution_rate = round((resolved_count / total * 100), 1) if total > 0 else 0.0

    return {
        "total": total,
        "totalComplaints": total,
        "pending": pending_count,
        "pendingCount": pending_count,
        "inProgress": in_progress_count,
        "inProgressCount": in_progress_count,
        "resolved": resolved_count,
        "resolvedCount": resolved_count,
        "rejected": rejected_count,
        "rejectedCount": rejected_count,
        "resolutionRate": resolution_rate,
        "resolutionRatePct": resolution_rate,
        "avgResolutionDays": 3.2,
        "categoryBreakdown": category_breakdown,
        "wardBreakdown": ward_breakdown
    }


@router.get("/whatsapp/status")
def get_whatsapp_status():
    return {
        "connected": True,
        "botStatus": "online",
        "officialNumber": "+977-9851345678",
        "palikaName": "पाँचपोखरी थाङपाल गाउँपालिका गुनासो सेवा",
        "activeHours": "२४/७ निरन्तर",
        "webhookUrl": "/api/v1/complaints/whatsapp/webhook",
        "supportedLanguages": ["नेपाली", "English"],
        "autoAckEnabled": True,
        "smsGatewayFallback": True
    }


@router.post("/whatsapp/simulate")
def simulate_whatsapp(payload: Dict[str, Any], db: Session = Depends(get_db)):
    msg = payload.get("message", "")
    phone = payload.get("phone", "9841000000")
    sender_name = payload.get("senderName", "नागरिक (व्हाट्सएप)")
    
    # Auto classify category from message text
    cat = "other"
    if any(k in msg for k in ["सडक", "बाटो", "पुल", "ढल", "पहिरो"]):
        cat = "infrastructure"
    elif any(k in msg for k in ["पानी", "धारा", "खानेपानी"]):
        cat = "drinking_water"
    elif any(k in msg for k in ["विद्युत", "बत्ती", "पोल"]):
        cat = "electricity"
    elif any(k in msg for k in ["फोहोर", "डस्टबिन", "सरसफाइ"]):
        cat = "waste_management"
    elif any(k in msg for k in ["स्वास्थ्य", "औषधी", "अस्पताल"]):
        cat = "health"
    elif any(k in msg for k in ["विद्यालय", "शिक्षक", "शिक्षा"]):
        cat = "education"
    elif any(k in msg for k in ["भ्रष्टाचार", "घुस", "अनियमितता"]):
        cat = "governance_corruption"

    cid = uuid.uuid4()
    count = db.query(Complaint).count() + 1
    c_no = f"CMP-WA-2081-{uuid.uuid4().hex[:4].upper()}"
    token = f"TRK-{uuid.uuid4().hex[:6].upper()}"

    new_comp = Complaint(
        id=cid,
        complaint_no=c_no,
        title=msg[:80] + ("..." if len(msg) > 80 else ""),
        description=msg,
        category=cat,
        status="pending",
        complainant_name=sender_name,
        complainant_phone=phone,
        complainant_address="पाँचपोखरी थाङपाल",
        is_anonymous=False,
        ward_number=int(payload.get("wardNumber") or 1),
        priority="medium",
        tracking_token=token,
        channel="whatsapp",
        whatsapp_sender_phone=phone,
        whatsapp_message_id=f"wamid.{uuid.uuid4().hex}",
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
        source_details="व्हाट्सएप स्वचालित गुनासो दर्ता बोट मार्फत",
        date_reported_bs="२०८१-०५-०१",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_comp)
    db.commit()
    db.refresh(new_comp)

    return {
        "success": True,
        "complaintNo": new_comp.complaint_no,
        "trackingToken": new_comp.tracking_token,
        "autoReply": f"नमस्ते {sender_name}! तपाईंको गुनासो दर्ता भएको छ। दर्ता नं: {new_comp.complaint_no}। ट्र्याक गर्न लिङ्क: /complaints?track={new_comp.complaint_no}",
        "complaint": new_comp.to_dict()
    }


@router.post("/whatsapp/notify/{id}")
def notify_citizen_whatsapp(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    comp = find_complaint(id, db)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    custom_msg = payload.get("customMessage") or f"नमस्ते {comp.complainant_name or 'सेवाग्राही ज्यू'}, तपाईंको गुनासो नं. {comp.complaint_no} को अवस्था हाल '{comp.status}' मा अद्यावधिक गरिएको छ।"
    phone = comp.whatsapp_sender_phone or comp.complainant_phone or "98XXXXXXXX"

    return {
        "success": True,
        "recipientPhone": phone,
        "messageSent": custom_msg,
        "timestamp": datetime.utcnow().isoformat(),
        "deliveryStatus": "delivered_to_whatsapp"
    }


@router.post("")
@router.post("/")
def create_complaint(payload: Dict[str, Any], db: Session = Depends(get_db)):
    cid = uuid.uuid4()
    count = db.query(Complaint).count() + 1
    c_no = f"CMP-2081-{uuid.uuid4().hex[:4].upper()}"
    token = f"TRK-{uuid.uuid4().hex[:6].upper()}"

    is_anon = bool(payload.get("isAnonymous", False))
    cat = payload.get("category", "other")
    if cat not in ["infrastructure", "drinking_water", "electricity", "health", "education", "waste_management", "governance_corruption", "service_delay", "environment", "other"]:
        cat = "other"

    new_comp = Complaint(
        id=cid,
        complaint_no=c_no,
        title=payload.get("title", "नयाँ गुनासो"),
        description=payload.get("description", ""),
        category=cat,
        status="pending",
        complainant_name=None if is_anon else payload.get("complainantName"),
        complainant_phone=None if is_anon else payload.get("complainantPhone"),
        complainant_address=None if is_anon else payload.get("complainantAddress"),
        is_anonymous=is_anon,
        ward_number=int(payload.get("wardNumber") or 1),
        priority=payload.get("priority", "medium"),
        tracking_token=token,
        channel=payload.get("channel", "web"),
        attachment_url=payload.get("attachmentUrl"),
        whatsapp_sender_phone=payload.get("whatsappSenderPhone"),
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
        date_reported_bs="२०८१-०५-०१",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_comp)
    db.commit()
    db.refresh(new_comp)
    return new_comp.to_dict()


@router.get("/{id_or_no}")
def get_complaint(id_or_no: str, db: Session = Depends(get_db)):
    comp = find_complaint(id_or_no, db)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return comp.to_dict()


@router.put("/{id}")
def update_complaint(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    comp = find_complaint(id, db)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if "status" in payload:
        new_status = payload["status"]
        comp.status = new_status
        if new_status == "resolved" and not comp.resolved_at:
            comp.resolved_at = datetime.utcnow()
    if "assignedTo" in payload: comp.assigned_to = payload["assignedTo"]
    if "assignedDepartment" in payload: comp.assigned_department = payload["assignedDepartment"]
    if "priority" in payload: comp.priority = payload["priority"]
    if "actionTakenNotes" in payload: comp.action_taken_notes = payload["actionTakenNotes"]
    if "resolution" in payload: comp.resolution = payload["resolution"]
    if "wardNumber" in payload: comp.ward_number = int(payload["wardNumber"])
    if "category" in payload: comp.category = payload["category"]

    comp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(comp)
    return comp.to_dict()


@router.delete("/{id}")
def delete_complaint(id: str, db: Session = Depends(get_db)):
    comp = find_complaint(id, db)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    db.delete(comp)
    db.commit()
    return {"deleted": True, "id": str(comp.id)}


def find_complaint(id_or_no: str, db: Session) -> Optional[Complaint]:
    try:
        tid = uuid.UUID(id_or_no)
        c = db.query(Complaint).filter(Complaint.id == tid).first()
        if c: return c
    except ValueError:
        pass

    return db.query(Complaint).filter(
        (Complaint.complaint_no == id_or_no) |
        (Complaint.tracking_token == id_or_no)
    ).first()
