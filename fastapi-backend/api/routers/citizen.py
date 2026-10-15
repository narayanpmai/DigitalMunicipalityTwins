from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Dict, Any
from core.database import get_db
from models.citizen import Citizen
from schemas.citizen import (
    CitizenSchema,
    CitizenCreate,
    CitizenPublicRegister,
    CitizenVerify,
    CitizenPublicSchema,
    CitizenStats
)
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/api/v1/citizens",
    tags=["Citizens"]
)

def mask_phone(phone: Optional[str]) -> Optional[str]:
    if not phone or len(phone) < 6:
        return phone or ""
    return f"{phone[:4]}***{phone[-3:]}"

def mask_id(doc_id: Optional[str]) -> Optional[str]:
    if not doc_id or len(doc_id) < 5:
        return doc_id or ""
    return f"{doc_id[:3]}****{doc_id[-2:]}"

@router.get("/public", response_model=List[CitizenPublicSchema])
def get_public_citizens(
    search: Optional[str] = Query(None),
    ward: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Citizen).filter(Citizen.deleted_at == None)
    if ward:
        query = query.filter(Citizen.ward_number == ward)
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Citizen.full_name).like(term),
                func.lower(Citizen.full_name_en).like(term),
                func.lower(Citizen.citizenship_no).like(term),
                func.lower(Citizen.national_id).like(term),
                func.lower(Citizen.phone).like(term)
            )
        )
    citizens = query.order_by(Citizen.created_at.desc()).all()
    results = []
    for c in citizens:
        meta = c.meta or {}
        v_status = meta.get("verificationStatus", "VERIFIED")
        is_pub = meta.get("isPublic", True)
        if v_status == "VERIFIED" and is_pub is not False:
            results.append(
                CitizenPublicSchema(
                    id=str(c.id),
                    citizen_code=meta.get("citizenCode", f"CIT-2081-{str(c.id)[:4]}"),
                    full_name=c.full_name,
                    full_name_en=c.full_name_en,
                    gender=c.gender,
                    ward_number=c.ward_number,
                    address=c.address,
                    tole=c.tole,
                    occupation=c.occupation,
                    targeted_group=meta.get("targetedGroup"),
                    phone=mask_phone(c.phone),
                    national_id=mask_id(c.national_id),
                    citizenship_no=mask_id(c.citizenship_no),
                    verification_status="VERIFIED",
                    created_at=c.created_at
                )
            )
    return results

@router.get("/stats", response_model=CitizenStats)
def get_stats(db: Session = Depends(get_db)):
    base_query = db.query(Citizen).filter(Citizen.deleted_at == None)
    total = base_query.count()
    
    by_ward_raw = (
        db.query(Citizen.ward_number, func.count(Citizen.id))
        .filter(Citizen.deleted_at == None)
        .group_by(Citizen.ward_number)
        .all()
    )
    by_ward = [{"ward": w, "count": cnt} for w, cnt in by_ward_raw if w is not None]
    
    by_gender_raw = (
        db.query(Citizen.gender, func.count(Citizen.id))
        .filter(Citizen.deleted_at == None)
        .group_by(Citizen.gender)
        .all()
    )
    by_gender = [{"gender": g, "count": cnt} for g, cnt in by_gender_raw if g is not None]
    
    return CitizenStats(total=total, by_ward=by_ward, by_gender=by_gender)

@router.post("/public-register", response_model=CitizenSchema)
def public_register(data: CitizenPublicRegister, db: Session = Depends(get_db)):
    count = db.query(Citizen).count()
    citizen_code = f"CIT-2081-{str(count + 1).zfill(4)}"
    citizen_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat()
    
    meta = {
        "citizenCode": citizen_code,
        "verificationStatus": "PENDING",
        "source": "PUBLIC_PORTAL",
        "isPublic": False,
        "registeredAt": now_iso,
        "bloodGroup": data.blood_group or "O+",
        "maritalStatus": data.marital_status or "विवाहित",
        "targetedGroup": data.targeted_group or "सामान्य नागरिक (General)",
        "servicePurpose": data.service_purpose or "नागरिक लगत दर्ता (अनलाइन)",
        "servicesHistory": [
            {"date": now_iso.split("T")[0], "service": "सार्वजनिक अनलाइन दर्ता (प्रतिक्षारत)"}
        ]
    }
    
    db_citizen = Citizen(
        id=citizen_id,
        full_name=data.full_name,
        full_name_en=data.full_name_en,
        citizenship_no=data.citizenship_no,
        national_id=data.national_id,
        phone=data.phone,
        email=data.email,
        gender=data.gender,
        date_of_birth=data.date_of_birth,
        ward_number=data.ward_number,
        address=data.address,
        tole=data.tole,
        father_name=data.father_name,
        mother_name=data.mother_name,
        spouse_name=data.spouse_name,
        occupation=data.occupation,
        education=data.education,
        is_active=True,
        meta=meta
    )
    db.add(db_citizen)
    db.commit()
    db.refresh(db_citizen)
    return db_citizen

@router.get("", response_model=List[CitizenSchema])
def get_citizens(
    search: Optional[str] = Query(None),
    ward: Optional[int] = Query(None),
    status: Optional[str] = Query(None, description="all | pending | verified | rejected"),
    db: Session = Depends(get_db)
):
    query = db.query(Citizen).filter(Citizen.deleted_at == None)
    if ward:
        query = query.filter(Citizen.ward_number == ward)
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Citizen.full_name).like(term),
                func.lower(Citizen.full_name_en).like(term),
                func.lower(Citizen.citizenship_no).like(term),
                func.lower(Citizen.national_id).like(term),
                func.lower(Citizen.phone).like(term)
            )
        )
    citizens = query.order_by(Citizen.created_at.desc()).all()
    if status and status != "all":
        target = status.upper()
        citizens = [c for c in citizens if (c.meta or {}).get("verificationStatus", "VERIFIED") == target]
    return citizens

@router.get("/{id}", response_model=CitizenSchema)
def get_citizen(id: str, db: Session = Depends(get_db)):
    citizen = db.query(Citizen).filter(Citizen.id == id, Citizen.deleted_at == None).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return citizen

@router.post("", response_model=CitizenSchema)
def create_citizen(data: CitizenCreate, db: Session = Depends(get_db)):
    count = db.query(Citizen).count()
    citizen_code = f"CIT-2081-{str(count + 1).zfill(4)}"
    citizen_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat()
    
    meta = {
        **(data.meta or {}),
        "citizenCode": citizen_code,
        "verificationStatus": "VERIFIED",
        "source": "ADMIN_ENTRY",
        "isPublic": data.is_public if data.is_public is not None else True,
        "verifiedAt": now_iso,
        "bloodGroup": data.blood_group or "O+",
        "maritalStatus": data.marital_status or "विवाहित",
        "targetedGroup": data.targeted_group or "सामान्य नागरिक (General)",
        "servicePurpose": data.service_purpose or "प्रशासनिक सेवा",
        "servicesHistory": [
            {"date": now_iso.split("T")[0], "service": data.service_purpose or "नागरिक लगत दर्ता (प्रशासन)"}
        ]
    }
    
    citizen_data = data.dict(exclude={"blood_group", "marital_status", "targeted_group", "service_purpose", "is_public", "meta"})
    db_citizen = Citizen(
        id=citizen_id,
        meta=meta,
        **citizen_data
    )
    db.add(db_citizen)
    db.commit()
    db.refresh(db_citizen)
    return db_citizen

@router.put("/{id}/verify", response_model=CitizenSchema)
def verify_citizen(id: str, verify_data: CitizenVerify, db: Session = Depends(get_db)):
    citizen = db.query(Citizen).filter(Citizen.id == id, Citizen.deleted_at == None).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
        
    status = verify_data.status or "VERIFIED"
    is_pub = verify_data.is_public if verify_data.is_public is not None else (status == "VERIFIED")
    now_iso = datetime.utcnow().isoformat()
    
    existing_meta = citizen.meta or {}
    new_meta = {
        **existing_meta,
        "verificationStatus": status,
        "isPublic": is_pub,
        "verifiedAt": now_iso,
        "verifiedBy": "पालिका प्रशासन (Admin)",
        "verificationRemarks": verify_data.remarks or ("प्रमाणीकरण सम्पन्न" if status == "VERIFIED" else "अस्वीकृत गरिएको"),
        "servicesHistory": [
            *(existing_meta.get("servicesHistory") or []),
            {
                "date": now_iso.split("T")[0],
                "service": f"प्रशासन प्रमाणीकरण: {'स्वीकृत' if status == 'VERIFIED' else 'अस्वीकृत'}{f' ({verify_data.remarks})' if verify_data.remarks else ''}"
            }
        ]
    }
    citizen.meta = new_meta
    db.commit()
    db.refresh(citizen)
    return citizen

@router.put("/{id}", response_model=CitizenSchema)
def update_citizen(id: str, data: CitizenCreate, db: Session = Depends(get_db)):
    citizen = db.query(Citizen).filter(Citizen.id == id, Citizen.deleted_at == None).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
        
    update_data = data.dict(exclude_unset=True, exclude={"blood_group", "marital_status", "targeted_group", "service_purpose", "is_public"})
    for key, value in update_data.items():
        setattr(citizen, key, value)
        
    db.commit()
    db.refresh(citizen)
    return citizen

@router.delete("/{id}")
def delete_citizen(id: str, db: Session = Depends(get_db)):
    citizen = db.query(Citizen).filter(Citizen.id == id, Citizen.deleted_at == None).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
        
    citizen.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Citizen deleted successfully"}
