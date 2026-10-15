from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.rti import RtiRequest

router = APIRouter(
    prefix="/api/v1/rti",
    tags=["Right to Information - RTI (सूचनाको हक)"]
)


@router.get("")
@router.get("/")
@router.get("/requests")
@router.get("/requests/")
def get_rti_requests(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RtiRequest)
    if status and status != "all":
        query = query.filter(RtiRequest.status == status)

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (RtiRequest.request_no.ilike(s)) |
            (RtiRequest.applicant_name.ilike(s)) |
            (RtiRequest.subject.ilike(s)) |
            (RtiRequest.requested_information.ilike(s))
        )

    records = query.order_by(desc(RtiRequest.created_at)).all()
    return [r.to_dict() for r in records]


@router.get("/stats")
def get_rti_stats(db: Session = Depends(get_db)):
    records = db.query(RtiRequest).all()
    total = len(records)
    pending = len([r for r in records if r.status == "pending"])
    in_progress = len([r for r in records if r.status == "in_progress"])
    provided = len([r for r in records if r.status == "info_provided"])
    rejected = len([r for r in records if r.status == "rejected"])

    return {
        "total": total,
        "pending": pending,
        "inProgress": in_progress,
        "infoProvided": provided,
        "rejected": rejected,
        "resolutionRate": round((provided / total * 100), 1) if total > 0 else 0.0
    }


@router.get("/track/{query}")
def track_rti(query: str, db: Session = Depends(get_db)):
    req = find_rti(query, db)
    if not req:
        raise HTTPException(status_code=404, detail="RTI Request not found")
    return req.to_dict()


@router.post("")
@router.post("/")
@router.post("/requests")
@router.post("/requests/")
def create_rti_request(payload: Dict[str, Any], db: Session = Depends(get_db)):
    rid = uuid.uuid4()
    count = db.query(RtiRequest).count() + 1
    req_no = payload.get("requestNo") or f"PPK-RTI-2081-{str(count).zfill(4)}"
    token = payload.get("trackingToken") or str(uuid.uuid4().int)[:6]

    new_req = RtiRequest(
        id=rid,
        request_no=req_no,
        applicant_name=payload.get("applicantName", "नागरिक"),
        applicant_phone=payload.get("applicantPhone"),
        applicant_email=payload.get("applicantEmail"),
        applicant_address=payload.get("applicantAddress", "पाँचपोखरी थाङपाल"),
        subject=payload.get("subject", "सूचना माग सम्बन्धी"),
        requested_information=payload.get("requestedInformation", ""),
        purpose=payload.get("purpose", "सार्वजनिक सरोकार"),
        format=payload.get("format", "electronic"),
        status="pending",
        assigned_officer="सूचना अधिकारी (Information Officer)",
        assigned_department="प्रशासन तथा आन्तरिक व्यवस्थापन शाखा",
        filing_date_bs="२०८१-०५-०१",
        legal_deadline_bs="२०८१-०५-१६",
        action_taken_notes="",
        attachment_url=payload.get("attachmentUrl"),
        tracking_token=token,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req.to_dict()


@router.get("/{id}")
@router.get("/requests/{id}")
def get_rti_request(id: str, db: Session = Depends(get_db)):
    req = find_rti(id, db)
    if not req:
        raise HTTPException(status_code=404, detail="RTI Request not found")
    return req.to_dict()


@router.put("/{id}")
@router.put("/requests/{id}")
def update_rti_request(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    req = find_rti(id, db)
    if not req:
        raise HTTPException(status_code=404, detail="RTI Request not found")

    if "status" in payload: req.status = payload["status"]
    if "assignedOfficer" in payload: req.assigned_officer = payload["assignedOfficer"]
    if "assignedDepartment" in payload: req.assigned_department = payload["assignedDepartment"]
    if "actionTakenNotes" in payload: req.action_taken_notes = payload["actionTakenNotes"]
    if "attachmentUrl" in payload: req.attachment_url = payload["attachmentUrl"]

    req.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return req.to_dict()


def find_rti(id_or_query: str, db: Session) -> Optional[RtiRequest]:
    try:
        tid = uuid.UUID(id_or_query)
        r = db.query(RtiRequest).filter(RtiRequest.id == tid).first()
        if r: return r
    except ValueError:
        pass

    return db.query(RtiRequest).filter(
        (RtiRequest.request_no == id_or_query) |
        (RtiRequest.tracking_token == id_or_query) |
        (RtiRequest.applicant_phone == id_or_query)
    ).first()
