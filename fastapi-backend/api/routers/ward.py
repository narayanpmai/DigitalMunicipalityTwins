from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from core.database import get_db
from models.ward import Ward
from models.representative import Representative

router = APIRouter(
    prefix="/api/v1/wards",
    tags=["Wards (वडा कार्यालयहरू)"]
)


@router.get("")
@router.get("/")
def get_wards(
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    eff_tenant = tenant_id or x_tenant_id
    query = db.query(Ward)
    if eff_tenant and eff_tenant not in ["panchpokhari", "default", "localhost", "all", "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"]:
        wards = query.filter(Ward.tenant_id == eff_tenant).order_by(Ward.ward_number).all()
        if not wards:
            for w_num in range(1, 9):
                w_id = uuid.uuid4()
                new_w = Ward(
                    id=w_id,
                    tenant_id=eff_tenant,
                    ward_number=w_num,
                    name=f"वडा नं. {w_num}",
                    ward_chair_name=f"वडाध्यक्ष (वडा नं. {w_num})",
                    chairperson=f"वडाध्यक्ष (वडा नं. {w_num})",
                    secretary="वडा सचिव",
                    population=2800 + (w_num * 140),
                    total_population=2800 + (w_num * 140),
                    male_population=1380 + (w_num * 70),
                    female_population=1420 + (w_num * 70),
                    households=640 + (w_num * 30),
                    schools=4,
                    health_posts=1,
                    is_active=True
                )
                db.add(new_w)
            db.commit()
            wards = query.filter(Ward.tenant_id == eff_tenant).order_by(Ward.ward_number).all()
        reps = db.query(Representative).filter(Representative.tenant_id == eff_tenant, Representative.is_current == True).all()
    else:
        wards = query.filter((Ward.tenant_id == "panchpokhari") | (Ward.tenant_id == "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06") | (Ward.tenant_id == None)).order_by(Ward.ward_number).all()
        reps = db.query(Representative).filter(Representative.is_current == True).all()

    rep_map = {}
    for r in reps:
        if r.ward_no is not None:
            rep_map[int(r.ward_no)] = r

    results = []
    for w in wards:
        d = w.to_dict()
        rep = rep_map.get(int(w.ward_number))
        if rep:
            d["wardChairName"] = rep.name
            d["chairperson"] = rep.name
            if rep.phone:
                d["phone"] = rep.phone
            if rep.email:
                d["email"] = rep.email
            if rep.photo_url:
                d["photoUrl"] = rep.photo_url
        d["wardNo"] = int(w.ward_number)
        results.append(d)
    return results


@router.get("/stats")
def get_ward_stats(
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    eff_tenant = tenant_id or x_tenant_id
    query = db.query(Ward)
    if eff_tenant and eff_tenant not in ["panchpokhari", "default", "localhost", "all", "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"]:
        wards = query.filter(Ward.tenant_id == eff_tenant).all()
    else:
        wards = query.filter((Ward.tenant_id == "panchpokhari") | (Ward.tenant_id == "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06") | (Ward.tenant_id == None)).all()

    total_pop = sum(int(w.total_population or w.population or 0) for w in wards)
    total_hh = sum(int(w.households or 0) for w in wards)
    total_schools = sum(int(w.schools or 0) for w in wards)
    total_hp = sum(int(w.health_posts or 0) for w in wards)
    total_area = sum(float(w.area_sq_km or 0) for w in wards)
    avg_literacy = round(sum(float(w.literacy_rate or 72.0) for w in wards) / len(wards), 1) if wards else 72.5

    return {
        "totalWards": len(wards),
        "totalPopulation": total_pop,
        "totalHouseholds": total_hh,
        "totalSchools": total_schools,
        "totalHealthPosts": total_hp,
        "totalAreaSqKm": round(total_area, 2),
        "averageLiteracyRate": avg_literacy
    }


@router.get("/{ward_number}")
def get_ward(ward_number: int, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.ward_number == ward_number).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    d = ward.to_dict()
    rep = db.query(Representative).filter(
        Representative.ward_no == ward_number,
        Representative.is_current == True
    ).first()
    if rep:
        d["wardChairName"] = rep.name
        d["chairperson"] = rep.name
        if rep.phone:
            d["phone"] = rep.phone
        if rep.email:
            d["email"] = rep.email
        if rep.photo_url:
            d["photoUrl"] = rep.photo_url
    d["wardNo"] = int(ward.ward_number)
    return d


@router.put("/{ward_number}")
def update_ward(ward_number: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.ward_number == ward_number).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")

    if "wardChairName" in payload or "chairperson" in payload:
        name = payload.get("wardChairName") or payload.get("chairperson")
        ward.ward_chair_name = name
        ward.chairperson = name
        # Also sync to representative table if exists
        rep = db.query(Representative).filter(
            Representative.ward_no == ward_number,
            Representative.is_current == True
        ).first()
        if rep:
            rep.name = name
            if "phone" in payload and payload["phone"]:
                rep.phone = payload["phone"]

    if "secretary" in payload: ward.secretary = payload["secretary"]
    if "phone" in payload: ward.phone = payload["phone"]
    if "officeLocation" in payload: ward.office_location = payload["officeLocation"]
    if "population" in payload:
        ward.population = int(payload["population"])
        ward.total_population = int(payload["population"])
    if "households" in payload: ward.households = int(payload["households"])
    if "literacyRate" in payload: ward.literacy_rate = float(payload["literacyRate"])
    if "description" in payload: ward.description = payload["description"]
    if "mainSettlement" in payload: ward.main_settlement = payload["mainSettlement"]

    ward.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ward)
    return ward.to_dict()


@router.post("")
@router.post("/")
def create_ward(payload: Dict[str, Any], db: Session = Depends(get_db)):
    w_no = int(payload.get("wardNumber", 1))
    existing = db.query(Ward).filter(Ward.ward_number == w_no).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ward with this number already exists")

    new_ward = Ward(
        id=uuid.uuid4(),
        ward_number=w_no,
        name=payload.get("name", f"वडा नं. {w_no}"),
        ward_chair_name=payload.get("wardChairName") or payload.get("chairperson"),
        chairperson=payload.get("chairperson") or payload.get("wardChairName"),
        secretary=payload.get("secretary"),
        phone=payload.get("phone"),
        office_location=payload.get("officeLocation"),
        population=int(payload.get("population", 0)),
        total_population=int(payload.get("population", 0)),
        households=int(payload.get("households", 0)),
        area_sq_km=float(payload.get("areaSqKm", 0)),
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_ward)
    db.commit()
    db.refresh(new_ward)
    return new_ward.to_dict()
