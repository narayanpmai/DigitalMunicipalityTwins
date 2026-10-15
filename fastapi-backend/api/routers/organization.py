from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.organization import Organization

router = APIRouter(
    prefix="/api/v1/organizations",
    tags=["Organizations (संघ-संस्थाहरू)"]
)


@router.get("")
@router.get("/")
def get_organizations(
    type: Optional[str] = None,
    status: Optional[str] = None,
    wardNo: Optional[str] = None,
    wardNumber: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Organization).filter(Organization.deleted_at.is_(None))

    if type and type != "all":
        query = query.filter(Organization.type == type)
    if status and status != "all":
        query = query.filter(Organization.status == status)

    w_val = wardNo or wardNumber
    if w_val and w_val != "all":
        try:
            w_int = int(w_val)
            query = query.filter(Organization.ward_number == w_int)
        except ValueError:
            pass

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (Organization.name.ilike(s)) |
            (Organization.name_en.ilike(s)) |
            (Organization.registration_no.ilike(s)) |
            (Organization.chairperson.ilike(s)) |
            (Organization.pan.ilike(s)) |
            (Organization.sector.ilike(s))
        )

    records = query.order_by(desc(Organization.created_at)).all()
    return [o.to_dict() for o in records]


@router.get("/stats")
def get_organizations_stats(db: Session = Depends(get_db)):
    orgs = db.query(Organization).filter(Organization.deleted_at.is_(None)).all()
    total = len(orgs)
    active = len([o for o in orgs if o.status == "active"])
    
    by_type: Dict[str, int] = {}
    by_ward: Dict[str, int] = {f"वडा {w}": 0 for w in range(1, 9)}

    for o in orgs:
        t = o.type or "ngo"
        by_type[t] = by_type.get(t, 0) + 1
        w = o.ward_number or 1
        wk = f"वडा {w}"
        by_ward[wk] = by_ward.get(wk, 0) + 1

    return {
        "total": total,
        "active": active,
        "inactive": total - active,
        "byType": by_type,
        "byWard": by_ward
    }


@router.post("")
@router.post("/")
def create_organization(payload: Dict[str, Any], db: Session = Depends(get_db)):
    oid = uuid.uuid4()
    count = db.query(Organization).count() + 1
    reg_no = payload.get("registrationNo") or f"{count}/२०८१"

    new_org = Organization(
        id=oid,
        name=payload.get("name", "नयाँ संस्था"),
        name_en=payload.get("nameEn", ""),
        type=payload.get("type", "ngo"),
        registration_no=reg_no,
        registration_date=payload.get("registrationDate", "२०८१/०१/०१"),
        suchikrit_miti=payload.get("suchikritMiti", "२०८१/०१/१५"),
        registration_nikaya=payload.get("registrationNikaya", "गाउँ कार्यपालिकाको कार्यालय / जि.प्र.का. सिन्धुपाल्चोक"),
        pan=payload.get("pan", ""),
        chairperson=payload.get("chairperson", ""),
        contact_person=payload.get("contactPerson", ""),
        phone=payload.get("phone", ""),
        tele_phone=payload.get("telePhone", ""),
        email=payload.get("email", ""),
        district=payload.get("district", "सिन्धुपाल्चोक"),
        municipality=payload.get("municipality", "पाँचपोखरी थाङपाल गाउँपालिका"),
        address=payload.get("address", ""),
        ward_number=int(payload.get("wardNumber") or 1),
        sector=payload.get("sector", "सामाजिक विकास तथा वातावरण"),
        objectives=payload.get("objectives", ""),
        status=payload.get("status", "active"),
        is_active=True,
        registration_certificate_url=payload.get("registrationCertificateUrl"),
        pan_certificate_url=payload.get("panCertificateUrl"),
        logo_url=payload.get("logoUrl"),
        members=payload.get("members") or [],
        renewals=payload.get("renewals") or [],
        agreements=payload.get("agreements") or [],
        programs=payload.get("programs") or [],
        audits=payload.get("audits") or [],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return new_org.to_dict()


@router.get("/{id}")
def get_organization(id: str, db: Session = Depends(get_db)):
    org = find_org(id, db)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org.to_dict()


@router.put("/{id}")
def update_organization(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    org = find_org(id, db)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if "name" in payload: org.name = payload["name"]
    if "nameEn" in payload: org.name_en = payload["nameEn"]
    if "type" in payload: org.type = payload["type"]
    if "status" in payload: org.status = payload["status"]
    if "chairperson" in payload: org.chairperson = payload["chairperson"]
    if "contactPerson" in payload: org.contact_person = payload["contactPerson"]
    if "phone" in payload: org.phone = payload["phone"]
    if "email" in payload: org.email = payload["email"]
    if "wardNumber" in payload: org.ward_number = int(payload["wardNumber"])
    if "sector" in payload: org.sector = payload["sector"]
    if "objectives" in payload: org.objectives = payload["objectives"]
    if "members" in payload: org.members = payload["members"]
    if "renewals" in payload: org.renewals = payload["renewals"]
    if "agreements" in payload: org.agreements = payload["agreements"]
    if "programs" in payload: org.programs = payload["programs"]
    if "audits" in payload: org.audits = payload["audits"]

    org.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(org)
    return org.to_dict()


@router.delete("/{id}")
def delete_organization(id: str, db: Session = Depends(get_db)):
    org = find_org(id, db)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.deleted_at = datetime.utcnow()
    db.commit()
    return {"success": True, "id": str(org.id)}


def find_org(id_str: str, db: Session) -> Optional[Organization]:
    try:
        tid = uuid.UUID(id_str)
        o = db.query(Organization).filter(Organization.id == tid, Organization.deleted_at.is_(None)).first()
        if o: return o
    except ValueError:
        pass

    return db.query(Organization).filter(
        (Organization.registration_no == id_str) |
        (Organization.name.ilike(f"%{id_str}%")),
        Organization.deleted_at.is_(None)
    ).first()
