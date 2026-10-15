from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.citizen_services import CitizenService

router = APIRouter(
    prefix="/api/v1/citizen-services",
    tags=["Citizen Services (नागरिक ई-सेवा तथा सिफारिस)"]
)

SERVICE_TYPE_MAP = {
    "birth": "birth_certificate",
    "जन्म": "birth_certificate",
    "death": "death_certificate",
    "मृत्यु": "death_certificate",
    "relationship": "relationship_certificate",
    "नाता": "relationship_certificate",
    "citizenship": "citizenship_recommendation",
    "नागरिकता": "citizenship_recommendation",
    "character": "character_certificate",
    "चारित्रिक": "character_certificate",
    "migration": "migration",
    "बसाइँ": "migration",
    "property": "property",
    "चारकिल्ला": "property",
    "घरजग्गा": "property",
    "business": "business",
    "व्यवसाय": "business",
    "other": "other"
}

def normalize_service_type(val: Optional[str]) -> str:
    if not val: return "other"
    v = val.lower().strip()
    for k, target in SERVICE_TYPE_MAP.items():
        if k in v:
            return target
    return "other"

STATUS_MAP = {
    "applied": "applied",
    "आवेदन": "applied",
    "pending": "applied",
    "processing": "processing",
    "रुजु": "processing",
    "approved": "approved",
    "स्वीकृत": "approved",
    "rejected": "rejected",
    "अस्वीकृत": "rejected",
    "delivered": "delivered",
    "जारी": "delivered"
}

def normalize_status(val: Optional[str]) -> str:
    if not val: return "applied"
    v = val.lower().strip()
    for k, target in STATUS_MAP.items():
        if k in v:
            return target
    return "applied"


DEFAULT_TEMPLATES = [
    {
        "id": "sif_citizenship",
        "code": "SIF-CIT-01",
        "title": "नेपाली नागरिकता प्रमाणपत्र सिफारिस (वंशज / प्रतिलिपि)",
        "category": "recommendation",
        "serviceType": "citizenship_recommendation",
        "department": "सम्बन्धित वडा कार्यालय",
        "feeNpr": 100,
        "timeEstimate": "सोही दिन (१-२ घण्टाभित्र)",
        "legalReference": "नेपाल नागरिकता ऐन २०६३ तथा स्थानीय सरकार सञ्चालन ऐन २०७४ दफा १२"
    },
    {
        "id": "sif_relationship",
        "code": "SIF-REL-02",
        "title": "पारिवारिक नाता प्रमाणित प्रमाणपत्र",
        "category": "recommendation",
        "serviceType": "relationship_certificate",
        "department": "सम्बन्धित वडा कार्यालय",
        "feeNpr": 500,
        "timeEstimate": "सोही दिन",
        "legalReference": "स्थानीय सरकार सञ्चालन ऐन २०७४ दफा १२ (२) (ङ) २"
    },
    {
        "id": "sif_boundaries",
        "code": "SIF-PROP-03",
        "title": "घरजग्गा चार किल्ला प्रमाणित सिफारिस",
        "category": "property",
        "serviceType": "property",
        "department": "सम्बन्धित वडा कार्यालय",
        "feeNpr": 300,
        "timeEstimate": "१-२ कार्यदिन",
        "legalReference": "स्थानीय सरकार सञ्चालन ऐन २०७४ दफा १२ (२) (ख)"
    },
    {
        "id": "sif_character",
        "code": "SIF-CHAR-04",
        "title": "चारित्रिक प्रमाणपत्र तथा असल चालचलन सिफारिस",
        "category": "recommendation",
        "serviceType": "character_certificate",
        "department": "सम्बन्धित वडा कार्यालय",
        "feeNpr": 100,
        "timeEstimate": "तत्काल",
        "legalReference": "स्थानीय सरकार सञ्चालन ऐन २०७४"
    },
    {
        "id": "sif_migration",
        "code": "SIF-MIG-05",
        "title": "बसाइँसराइ दर्ता प्रमाणपत्र तथा सिफारिस",
        "category": "vital_events",
        "serviceType": "migration",
        "department": "पञ्जीकरण तथा वडा कार्यालय",
        "feeNpr": 0,
        "timeEstimate": "सोही दिन",
        "legalReference": "व्यक्तिगत घटना दर्ता ऐन २०३३"
    },
    {
        "id": "sif_business",
        "code": "SIF-BIZ-06",
        "title": "नयाँ व्यवसाय दर्ता / सञ्चालन अनुमति सिफारिस",
        "category": "business",
        "serviceType": "business",
        "department": "उद्योग तथा राजस्व शाखा",
        "feeNpr": 500,
        "timeEstimate": "१ कार्यदिन",
        "legalReference": "स्थानीय सरकार सञ्चालन ऐन २०७४"
    }
]


@router.get("")
@router.get("/")
def get_services(
    status: Optional[str] = None,
    serviceType: Optional[str] = None,
    type: Optional[str] = None,
    ward: Optional[str] = None,
    wardNumber: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CitizenService)
    
    if status and status != "all":
        query = query.filter(CitizenService.status == normalize_status(status))
        
    stype = serviceType or type
    if stype and stype != "all":
        query = query.filter(CitizenService.service_type == normalize_service_type(stype))

    w_val = wardNumber or ward
    if w_val and w_val != "all":
        try:
            w_int = int(w_val)
            query = query.filter(CitizenService.ward_number == w_int)
        except ValueError:
            pass

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (CitizenService.application_no.ilike(s)) |
            (CitizenService.applicant_name.ilike(s)) |
            (CitizenService.applicant_phone.ilike(s)) |
            (CitizenService.purpose.ilike(s)) |
            (CitizenService.certificate_no.ilike(s))
        )

    records = query.order_by(desc(CitizenService.created_at)).all()
    return [r.to_dict() for r in records]


@router.get("/stats")
def get_services_stats(db: Session = Depends(get_db)):
    records = db.query(CitizenService).all()
    total = len(records)
    
    status_counts: Dict[str, int] = {}
    type_counts: Dict[str, int] = {}

    for r in records:
        st = r.status or "applied"
        status_counts[st] = status_counts.get(st, 0) + 1
        
        tp = r.service_type or "other"
        type_counts[tp] = type_counts.get(tp, 0) + 1

    by_status = [{"status": k, "count": v} for k, v in status_counts.items()]
    by_type = [{"type": k, "count": v} for k, v in type_counts.items()]

    return {
        "total": total,
        "byStatus": by_status,
        "byType": by_type
    }


@router.get("/templates")
def get_service_templates():
    return DEFAULT_TEMPLATES


@router.get("/track/{application_no}")
def track_service_application(application_no: str, db: Session = Depends(get_db)):
    service = find_service(application_no, db)
    if not service:
        raise HTTPException(status_code=404, detail="Service application not found")
    return service.to_dict()


@router.post("")
@router.post("/")
def create_service_application(payload: Dict[str, Any], db: Session = Depends(get_db)):
    sid = uuid.uuid4()
    count = db.query(CitizenService).count() + 1
    app_no = payload.get("applicationNo") or f"SVC-2081-{String_pad(count, 5)}"

    stype = normalize_service_type(payload.get("serviceType") or payload.get("type"))
    stat = normalize_status(payload.get("status", "applied"))

    fee_val = float(payload.get("fee") or payload.get("feeNpr") or 100.0)

    new_app = CitizenService(
        id=sid,
        application_no=app_no,
        service_type=stype,
        status=stat,
        applicant_name=payload.get("applicantName", "नागरिक"),
        applicant_phone=payload.get("applicantPhone"),
        ward_number=int(payload.get("wardNumber") or 1),
        purpose=payload.get("purpose") or payload.get("subject", ""),
        processed_by=payload.get("processedBy"),
        fee=fee_val,
        remarks=payload.get("remarks"),
        certificate_no=payload.get("certificateNo"),
        dispatch_no=payload.get("dispatchNo"),
        form_data=payload.get("formData") or {},
        documents=payload.get("documents") or [],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app.to_dict()


def String_pad(n: int, width: int = 5) -> str:
    return str(n).zfill(width)


@router.get("/{id}")
def get_service_application(id: str, db: Session = Depends(get_db)):
    service = find_service(id, db)
    if not service:
        raise HTTPException(status_code=404, detail="Application not found")
    return service.to_dict()


@router.put("/{id}")
def update_service_application(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    service = find_service(id, db)
    if not service:
        raise HTTPException(status_code=404, detail="Application not found")

    if "status" in payload:
        new_stat = normalize_status(payload["status"])
        service.status = new_stat
        if new_stat in ["approved", "processing"] and not service.processed_at:
            service.processed_at = datetime.utcnow()
        if new_stat == "delivered" and not service.delivered_at:
            service.delivered_at = datetime.utcnow()

    if "processedBy" in payload: service.processed_by = payload["processedBy"]
    if "remarks" in payload: service.remarks = payload["remarks"]
    if "certificateNo" in payload: service.certificate_no = payload["certificateNo"]
    if "dispatchNo" in payload: service.dispatch_no = payload["dispatchNo"]
    if "fee" in payload: service.fee = float(payload["fee"])
    if "formData" in payload: service.form_data = payload["formData"]
    if "documents" in payload: service.documents = payload["documents"]

    service.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(service)
    return service.to_dict()


@router.delete("/{id}")
def delete_service_application(id: str, db: Session = Depends(get_db)):
    service = find_service(id, db)
    if not service:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(service)
    db.commit()
    return {"message": "Application deleted successfully", "id": str(service.id)}


def find_service(id_or_appno: str, db: Session) -> Optional[CitizenService]:
    try:
        tid = uuid.UUID(id_or_appno)
        s = db.query(CitizenService).filter(CitizenService.id == tid).first()
        if s: return s
    except ValueError:
        pass

    return db.query(CitizenService).filter(
        (CitizenService.application_no == id_or_appno) |
        (CitizenService.certificate_no == id_or_appno)
    ).first()
