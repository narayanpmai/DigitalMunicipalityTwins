import uuid
import datetime
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import text

from core.database import get_db
from models.darta_chalani import Darta, Chalani
from core.tenant import TenantContext, get_tenant_context

router = APIRouter(
    prefix="/api/v1/darta-chalani",
    tags=["Darta Chalani (दर्ता तथा चलानी प्रणाली)"]
)

# Also expose secondary routers for legacy endpoints
legacy_darta_router = APIRouter(
    prefix="/api/v1/darta",
    tags=["Darta (Legacy)"]
)

legacy_chalani_router = APIRouter(
    prefix="/api/v1/chalani",
    tags=["Chalani (Legacy)"]
)

def to_ne_digit(num: int) -> str:
    ne_map = {'0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९'}
    return ''.join(ne_map.get(d, d) for d in str(num))

def from_ne_digit(s: Any) -> int:
    if not s:
        return 0
    ne_map = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'}
    clean = ''.join(ne_map.get(c, c if c.isdigit() else '') for c in str(s))
    return int(clean) if clean else 0

def serialize_darta(d: Darta) -> Dict[str, Any]:
    return {
        "id": str(d.id),
        "tenantId": getattr(d, 'tenant_id', None),
        "registrationNo": d.registration_no,
        "fiscalYear": d.fiscal_year or "२०८१/०८२",
        "registeredDate": d.registered_date or "",
        "registeredDateAd": d.registered_date_ad or "",
        "registeredTime": d.registered_time or "",
        "letterRefNo": d.letter_ref_no or "",
        "senderChalaniNo": d.sender_chalani_no or "",
        "letterDate": d.letter_date or "",
        "senderName": d.sender_name or "",
        "senderAddress": d.sender_address or "",
        "senderContact": d.sender_contact or "",
        "senderEmail": d.sender_email or "",
        "subject": d.subject or "",
        "classification": d.classification or "साधारण",
        "department": d.department or d.assigned_branch or "प्रशासन तथा सामान्य सेवा शाखा",
        "assignedBranch": d.assigned_branch or d.department or "प्रशासन तथा सामान्य सेवा शाखा",
        "assignedOfficer": d.assigned_officer or "",
        "tokAdesh": d.tok_adesh or "",
        "tokGivenBy": d.tok_given_by or "",
        "tokDate": d.tok_date or "",
        "deadlineDate": d.deadline_date or "",
        "priority": d.priority or "साधारण",
        "verificationCode": d.verification_code or f"PKP-D-{d.fiscal_year or '2081'}-{d.registration_no}",
        "tippaniNotes": d.tippani_notes or "",
        "pageCount": d.page_count or 1,
        "deliveryMethod": d.delivery_method or "हातै",
        "attachmentUrl": d.attachment_url or "",
        "status": d.status or "दर्ता भएको",
        "approvalStatus": d.approval_status or "approved",
        "approvedBy": d.approved_by or "",
        "approvedAt": d.approved_at.isoformat() if d.approved_at else None,
        "rejectionReason": d.rejection_reason or "",
        "completionDate": d.completion_date or "",
        "remarks": d.remarks or "",
        "createdAt": d.created_at.isoformat() if d.created_at else None,
        "updatedAt": d.updated_at.isoformat() if d.updated_at else None
    }

def serialize_chalani(c: Chalani) -> Dict[str, Any]:
    return {
        "id": str(c.id),
        "tenantId": getattr(c, 'tenant_id', None),
        "dispatchNo": c.dispatch_no,
        "fiscalYear": c.fiscal_year or "२०८१/०८२",
        "dispatchDate": c.dispatch_date or "",
        "dispatchDateAd": c.dispatch_date_ad or "",
        "dispatchTime": c.dispatch_time or "",
        "letterRefNo": c.letter_ref_no or "",
        "receiverName": c.receiver_name or "",
        "receiverAddress": c.receiver_address or "",
        "receiverContact": c.receiver_contact or "",
        "receiverEmail": c.receiver_email or "",
        "subject": c.subject or "",
        "department": c.department or "प्रशासन शाखा",
        "signedBy": c.signed_by or "प्रमुख प्रशासकीय अधिकृत",
        "classification": c.classification or "साधारण",
        "priority": c.priority or "साधारण",
        "verificationCode": c.verification_code or f"PKP-C-{c.fiscal_year or '2081'}-{c.dispatch_no}",
        "letterBody": c.letter_body or "",
        "deliveryMethod": c.delivery_method or "ईमेल / दर्ता पत्र",
        "postalTicketAmount": float(c.postal_ticket_amount or 0),
        "pageCount": c.page_count or 1,
        "carbonCopy": c.carbon_copy or "",
        "attachmentUrl": c.attachment_url or "",
        "status": c.status or "चलानी भएको",
        "approvalStatus": c.approval_status or "approved",
        "approvedBy": c.approved_by or "",
        "approvedAt": c.approved_at.isoformat() if c.approved_at else None,
        "rejectionReason": c.rejection_reason or "",
        "receivedBy": c.received_by or "",
        "remarks": c.remarks or "",
        "createdAt": c.created_at.isoformat() if c.created_at else None,
        "updatedAt": c.updated_at.isoformat() if c.updated_at else None
    }

# -------------------------------------------------------------
# DARTA ENDPOINTS
# -------------------------------------------------------------

@router.get("/darta")
@legacy_darta_router.get("")
def get_darta_list(
    fiscalYear: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Darta), Darta)
    if fiscalYear and fiscalYear != 'all':
        query = query.filter(Darta.fiscal_year == fiscalYear)
    if branch and branch != 'all':
        query = query.filter((Darta.assigned_branch == branch) | (Darta.department == branch))
    if status and status != 'all':
        query = query.filter(Darta.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Darta.subject.ilike(s)) |
            (Darta.sender_name.ilike(s)) |
            (Darta.registration_no.ilike(s)) |
            (Darta.letter_ref_no.ilike(s))
        )
    records = query.order_by(Darta.created_at.desc()).all()
    return [serialize_darta(r) for r in records]

@router.post("/darta")
@legacy_darta_router.post("")
def create_darta(
    payload: Dict[str, Any] = Body(...), 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    reg_no = payload.get("registrationNo") or payload.get("registration_no")
    fy = payload.get("fiscalYear") or payload.get("fiscal_year") or "२०८१/०८२"
    eff_tenant = payload.get("tenant_id") or payload.get("tenantId") or ctx.effective_tenant_id
    
    # Auto-generate registration number if missing
    if not reg_no:
        existing = ctx.filter_query(db.query(Darta).filter(Darta.fiscal_year == fy), Darta).all()
        max_num = max([from_ne_digit(x.registration_no) for x in existing] + [0])
        reg_no = to_ne_digit(max_num + 1)
        
    new_id = str(uuid.uuid4())
    v_code = payload.get("verificationCode") or f"PKP-D-{fy.replace('/', '-')}-{reg_no}"
    
    db_darta = Darta(
        id=new_id,
        tenant_id=eff_tenant,
        registration_no=str(reg_no),
        fiscal_year=fy,
        registered_date=payload.get("registeredDate") or payload.get("entryDateBs") or "२०८१-०४-०१",
        registered_date_ad=payload.get("registeredDateAd") or payload.get("letterDateAd"),
        registered_time=payload.get("registeredTime") or payload.get("entryTime"),
        letter_ref_no=payload.get("letterRefNo") or payload.get("letterNo") or str(reg_no),
        sender_chalani_no=payload.get("senderChalaniNo"),
        letter_date=payload.get("letterDate") or payload.get("letterDateBs"),
        sender_name=payload.get("senderName") or payload.get("senderOrganization") or "अज्ञात",
        sender_address=payload.get("senderAddress"),
        sender_contact=payload.get("senderContact"),
        sender_email=payload.get("senderEmail"),
        subject=payload.get("subject") or "बिषय उल्लेख नभएको",
        classification=payload.get("classification") or "साधारण",
        department=payload.get("department") or payload.get("assignedBranch") or "प्रशासन तथा सामान्य सेवा शाखा",
        assigned_branch=payload.get("assignedBranch") or payload.get("department") or "प्रशासन तथा सामान्य सेवा शाखा",
        assigned_officer=payload.get("assignedOfficer"),
        priority=payload.get("priority") or payload.get("classification") or "साधारण",
        verification_code=v_code,
        page_count=int(payload.get("pageCount") or 1),
        delivery_method=payload.get("deliveryMethod") or "हातै",
        attachment_url=payload.get("attachmentUrl"),
        status=payload.get("status") or "दर्ता भएको",
        approval_status=payload.get("approvalStatus") or "approved",
        remarks=payload.get("remarks")
    )
    db.add(db_darta)
    db.commit()
    db.refresh(db_darta)
    return serialize_darta(db_darta)


@router.get("/darta/{id}")
@legacy_darta_router.get("/{id}")
def get_darta_by_id(id: str, db: Session = Depends(get_db)):
    d = db.query(Darta).filter((Darta.id == id) | (Darta.registration_no == id)).first()
    if not d:
        raise HTTPException(status_code=404, detail="दर्ता रेकर्ड फेला परेन")
    return serialize_darta(d)

@router.put("/darta/{id}")
def update_darta(id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    d = db.query(Darta).filter((Darta.id == id) | (Darta.registration_no == id)).first()
    if not d:
        raise HTTPException(status_code=404, detail="दर्ता रेकर्ड फेला परेन")
    
    field_map = {
        "registrationNo": "registration_no",
        "fiscalYear": "fiscal_year",
        "registeredDate": "registered_date",
        "registeredDateAd": "registered_date_ad",
        "registeredTime": "registered_time",
        "letterRefNo": "letter_ref_no",
        "senderChalaniNo": "sender_chalani_no",
        "letterDate": "letter_date",
        "senderName": "sender_name",
        "senderOrganization": "sender_name",
        "senderAddress": "sender_address",
        "senderContact": "sender_contact",
        "senderEmail": "sender_email",
        "subject": "subject",
        "classification": "classification",
        "department": "department",
        "assignedBranch": "assigned_branch",
        "assignedOfficer": "assigned_officer",
        "priority": "priority",
        "pageCount": "page_count",
        "deliveryMethod": "delivery_method",
        "remarks": "remarks",
        "status": "status"
    }
    
    for payload_key, model_attr in field_map.items():
        if payload_key in payload:
            val = payload[payload_key]
            if model_attr == "page_count" and val is not None:
                val = int(val)
            setattr(d, model_attr, val)
            
    db.commit()
    db.refresh(d)
    return serialize_darta(d)

@router.delete("/darta/{id}")
def delete_darta(id: str, db: Session = Depends(get_db)):
    d = db.query(Darta).filter((Darta.id == id) | (Darta.registration_no == id)).first()
    if not d:
        raise HTTPException(status_code=404, detail="दर्ता रेकर्ड फेला परेन")
    db.delete(d)
    db.commit()
    return {"message": "दर्ता सफलतापूर्वक हटाइयो", "id": id}

@router.post("/darta/{id}/approval")
def set_darta_approval(id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    d = db.query(Darta).filter((Darta.id == id) | (Darta.registration_no == id)).first()
    if not d:
        raise HTTPException(status_code=404, detail="दर्ता रेकर्ड फेला परेन")
    
    d.approval_status = payload.get("approvalStatus") or "approved"
    d.rejection_reason = payload.get("reason")
    d.approved_by = payload.get("approvedBy") or "प्रमुख प्रशासकीय अधिकृत"
    d.approved_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(d)
    return serialize_darta(d)

@router.post("/darta/{id}/tok-aadesh")
def set_darta_tok_aadesh(id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    d = db.query(Darta).filter((Darta.id == id) | (Darta.registration_no == id)).first()
    if not d:
        raise HTTPException(status_code=404, detail="दर्ता रेकर्ड फेला परेन")
        
    d.tok_adesh = payload.get("tokAdesh")
    if payload.get("assignedBranch"):
        d.assigned_branch = payload.get("assignedBranch")
        d.department = payload.get("assignedBranch")
    if payload.get("assignedOfficer"):
        d.assigned_officer = payload.get("assignedOfficer")
    d.tok_date = payload.get("tokDate")
    d.deadline_date = payload.get("deadlineDate")
    if payload.get("priority"):
        d.priority = payload.get("priority")
    d.tok_given_by = payload.get("tokGivenBy") or "प्रमुख प्रशासकीय अधिकृत"
    d.status = "तोक आदेश भएको"
    
    db.commit()
    db.refresh(d)
    return serialize_darta(d)

@router.post("/darta/{id}/complete")
def complete_darta(id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    d = db.query(Darta).filter((Darta.id == id) | (Darta.registration_no == id)).first()
    if not d:
        raise HTTPException(status_code=404, detail="दर्ता रेकर्ड फेला परेन")
        
    d.status = "फर्स्यौट भएको"
    d.completion_date = payload.get("completionDate") or datetime.date.today().isoformat()
    if payload.get("completionNotes"):
        d.remarks = (d.remarks or "") + " | फर्स्यौट टिप्पणी: " + payload.get("completionNotes")
        
    db.commit()
    db.refresh(d)
    return serialize_darta(d)

# -------------------------------------------------------------
# CHALANI ENDPOINTS
# -------------------------------------------------------------

@router.get("/chalani")
@legacy_chalani_router.get("")
def get_chalani_list(
    fiscalYear: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    query = ctx.filter_query(db.query(Chalani), Chalani)
    if fiscalYear and fiscalYear != 'all':
        query = query.filter(Chalani.fiscal_year == fiscalYear)
    if department and department != 'all':
        query = query.filter(Chalani.department == department)
    if status and status != 'all':
        query = query.filter(Chalani.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Chalani.subject.ilike(s)) |
            (Chalani.receiver_name.ilike(s)) |
            (Chalani.dispatch_no.ilike(s)) |
            (Chalani.letter_ref_no.ilike(s))
        )
    records = query.order_by(Chalani.created_at.desc()).all()
    return [serialize_chalani(r) for r in records]

@router.post("/chalani")
def create_chalani(
    payload: Dict[str, Any] = Body(...), 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    dispatch_no = payload.get("dispatchNo") or payload.get("chalaniNo")
    fy = payload.get("fiscalYear") or payload.get("fiscal_year") or "२०८१/०८२"
    eff_tenant = payload.get("tenant_id") or payload.get("tenantId") or ctx.effective_tenant_id
    
    if not dispatch_no:
        existing = ctx.filter_query(db.query(Chalani).filter(Chalani.fiscal_year == fy), Chalani).all()
        max_num = max([from_ne_digit(x.dispatch_no) for x in existing] + [0])
        dispatch_no = to_ne_digit(max_num + 1)
        
    new_id = str(uuid.uuid4())
    v_code = payload.get("verificationCode") or f"PKP-C-{fy.replace('/', '-')}-{dispatch_no}"
    
    db_chalani = Chalani(
        id=new_id,
        tenant_id=eff_tenant,
        dispatch_no=str(dispatch_no),
        fiscal_year=fy,
        dispatch_date=payload.get("dispatchDate") or payload.get("entryDateBs") or "२०८१-०४-०१",
        dispatch_date_ad=payload.get("dispatchDateAd") or payload.get("letterDateAd"),
        dispatch_time=payload.get("dispatchTime") or payload.get("entryTime"),
        letter_ref_no=payload.get("letterRefNo") or str(dispatch_no),
        receiver_name=payload.get("receiverName") or payload.get("recipientOrganization") or "अज्ञात",
        receiver_address=payload.get("receiverAddress") or payload.get("recipientAddress"),
        receiver_contact=payload.get("receiverContact") or payload.get("recipientContact"),
        receiver_email=payload.get("receiverEmail"),
        subject=payload.get("subject") or "बिषय उल्लेख नभएको",
        department=payload.get("department") or "प्रशासन शाखा",
        signed_by=payload.get("signedBy") or "प्रमुख प्रशासकीय अधिकृत",
        classification=payload.get("classification") or "साधारण",
        priority=payload.get("priority") or "साधारण",
        verification_code=v_code,
        letter_body=payload.get("letterBody"),
        delivery_method=payload.get("deliveryMethod") or "ईमेल / दर्ता पत्र",
        postal_ticket_amount=float(payload.get("postalTicketAmount") or 0),
        page_count=int(payload.get("pageCount") or 1),
        carbon_copy=payload.get("carbonCopy"),
        attachment_url=payload.get("attachmentUrl"),
        status=payload.get("status") or "चलानी भएको",
        approval_status=payload.get("approvalStatus") or "approved",
        remarks=payload.get("remarks")
    )
    db.add(db_chalani)
    db.commit()
    db.refresh(db_chalani)
    return serialize_chalani(db_chalani)

@router.get("/chalani/{id}")
def get_chalani_by_id(id: str, db: Session = Depends(get_db)):
    c = db.query(Chalani).filter((Chalani.id == id) | (Chalani.dispatch_no == id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="चलानी रेकर्ड फेला परेन")
    return serialize_chalani(c)

@router.put("/chalani/{id}")
def update_chalani(id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    c = db.query(Chalani).filter((Chalani.id == id) | (Chalani.dispatch_no == id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="चलानी रेकर्ड फेला परेन")
        
    field_map = {
        "dispatchNo": "dispatch_no",
        "fiscalYear": "fiscal_year",
        "dispatchDate": "dispatch_date",
        "dispatchDateAd": "dispatch_date_ad",
        "dispatchTime": "dispatch_time",
        "letterRefNo": "letter_ref_no",
        "receiverName": "receiver_name",
        "recipientOrganization": "receiver_name",
        "receiverAddress": "receiver_address",
        "recipientAddress": "receiver_address",
        "receiverContact": "receiver_contact",
        "recipientContact": "receiver_contact",
        "subject": "subject",
        "department": "department",
        "signedBy": "signed_by",
        "classification": "classification",
        "priority": "priority",
        "deliveryMethod": "delivery_method",
        "pageCount": "page_count",
        "remarks": "remarks",
        "status": "status"
    }
    
    for payload_key, model_attr in field_map.items():
        if payload_key in payload:
            val = payload[payload_key]
            if model_attr == "page_count" and val is not None:
                val = int(val)
            setattr(c, model_attr, val)
            
    db.commit()
    db.refresh(c)
    return serialize_chalani(c)

@router.delete("/chalani/{id}")
def delete_chalani(id: str, db: Session = Depends(get_db)):
    c = db.query(Chalani).filter((Chalani.id == id) | (Chalani.dispatch_no == id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="चलानी रेकर्ड फेला परेन")
    db.delete(c)
    db.commit()
    return {"message": "चलानी सफलतापूर्वक हटाइयो", "id": id}

@router.post("/chalani/{id}/approval")
def set_chalani_approval(id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    c = db.query(Chalani).filter((Chalani.id == id) | (Chalani.dispatch_no == id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="चलानी रेकर्ड फेला परेन")
        
    c.approval_status = payload.get("approvalStatus") or "approved"
    c.rejection_reason = payload.get("reason")
    c.approved_by = payload.get("approvedBy") or "प्रमुख प्रशासकीय अधिकृत"
    c.approved_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(c)
    return serialize_chalani(c)

# -------------------------------------------------------------
# UTILITY / STATS / NEXT NUMBERS ENDPOINTS
# -------------------------------------------------------------

@router.get("/next-numbers")
def get_next_numbers(
    fiscalYear: Optional[str] = Query(None), 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    fy = fiscalYear or "२०८१/०८२"
    dartas = ctx.filter_query(db.query(Darta).filter(Darta.fiscal_year == fy), Darta).all()
    chalanis = ctx.filter_query(db.query(Chalani).filter(Chalani.fiscal_year == fy), Chalani).all()
    
    max_darta = max([from_ne_digit(d.registration_no) for d in dartas] + [0])
    max_chalani = max([from_ne_digit(c.dispatch_no) for c in chalanis] + [0])
    
    return {
        "nextDartaNo": to_ne_digit(max_darta + 1),
        "nextChalaniNo": to_ne_digit(max_chalani + 1),
        "fiscalYear": fy
    }

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    dartas = ctx.filter_query(db.query(Darta), Darta).all()
    chalanis = ctx.filter_query(db.query(Chalani), Chalani).all()
    
    total_darta = len(dartas)
    total_chalani = len(chalanis)
    
    approved_darta = sum(1 for d in dartas if d.approval_status == 'approved')
    approved_chalani = sum(1 for c in chalanis if c.approval_status == 'approved')
    
    pending_darta = sum(1 for d in dartas if d.approval_status not in ['approved', 'rejected'])

    pending_chalani = sum(1 for c in chalanis if c.approval_status not in ['approved', 'rejected'])
    
    completed_darta = sum(1 for d in dartas if d.status == 'फर्स्यौट भएको')
    
    return {
        "totalDarta": total_darta,
        "totalChalani": total_chalani,
        "approvedCount": approved_darta + approved_chalani,
        "pendingCount": pending_darta + pending_chalani,
        "completedDarta": completed_darta
    }

@router.get("/verify/{code}")
def verify_record(code: str, db: Session = Depends(get_db)):
    # Search in Darta
    d = db.query(Darta).filter(
        (Darta.verification_code == code) |
        (Darta.registration_no == code)
    ).first()
    if d:
        return {
            "verified": True,
            "type": "darta",
            "title": "दर्ता प्रमाणीकरण विवरण",
            "record": serialize_darta(d)
        }
        
    # Search in Chalani
    c = db.query(Chalani).filter(
        (Chalani.verification_code == code) |
        (Chalani.dispatch_no == code)
    ).first()
    if c:
        return {
            "verified": True,
            "type": "chalani",
            "title": "चलानी प्रमाणीकरण विवरण",
            "record": serialize_chalani(c)
        }
        
    return {
        "verified": False,
        "message": f"प्रमाणीकरण कोड '{code}' भएको कुनै पनि आधिकारिक दर्ता वा चलानी फेला परेन।"
    }


@router.get('')
def get_darta_chalani_list():
    return []
