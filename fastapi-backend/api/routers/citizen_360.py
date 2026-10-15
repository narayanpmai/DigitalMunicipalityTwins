"""
Citizen 360 & Household Socio-Economic Profile Router
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Provides unified 360-degree citizen & household views, socio-economic survey analytics,
MDM master data access, and citizen service application history.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Any, Dict
from core.database import get_db
from models.master_data import (
    WardMaster, ToleMaster, AddressMaster, HouseholdMaster, CitizenMaster
)
from models.citizen_360 import (
    HouseholdSocioEconomicProfile, CitizenApplicationLog
)
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/citizen-360",
    tags=["Citizen 360 & Household Socio-Economic Profile"]
)


# ── 1. STATS & ANALYTICS ────────────────────────────────────────────────────
@router.get("/stats")
def get_c360_stats(db: Session = Depends(get_db)):
    total_hh = db.query(HouseholdMaster).filter(HouseholdMaster.deleted_at.is_(None)).count()
    total_cit = db.query(CitizenMaster).filter(CitizenMaster.deleted_at.is_(None)).count()

    profiles = db.query(HouseholdSocioEconomicProfile).all()
    total_profiles = len(profiles)

    vulnerable_count = sum(1 for p in profiles if (p.vulnerability_score or 0) >= 60)
    bank_count = sum(1 for p in profiles if p.has_bank_account)
    insurance_count = sum(1 for p in profiles if p.has_health_insurance)
    internet_count = sum(1 for p in profiles if p.has_internet_access)

    bank_rate = round((bank_count / max(total_profiles, 1)) * 100, 1) if total_profiles else 82.5
    insurance_rate = round((insurance_count / max(total_profiles, 1)) * 100, 1) if total_profiles else 68.4
    internet_rate = round((internet_count / max(total_profiles, 1)) * 100, 1) if total_profiles else 75.0

    risk_counts = {}
    for p in profiles:
        r = p.disaster_risk_category or "Low"
        risk_counts[r] = risk_counts.get(r, 0) + 1

    income_counts = {}
    for p in profiles:
        inc = p.annual_income_bracket or "अन्य"
        income_counts[inc] = income_counts.get(inc, 0) + 1

    occupation_counts = {}
    for p in profiles:
        occ = p.primary_occupation or "अन्य"
        occupation_counts[occ] = occupation_counts.get(occ, 0) + 1

    applications = db.query(CitizenApplicationLog).all()
    total_apps = len(applications)
    approved_apps = sum(1 for a in applications if a.status == "Approved")
    pending_apps = sum(1 for a in applications if a.status in ["Pending", "In Review"])

    return {
        "totalHouseholds": total_hh,
        "totalCitizens": total_cit,
        "totalSurveyedProfiles": total_profiles,
        "vulnerableHouseholds": vulnerable_count,
        "bankAccountCoverageRate": bank_rate,
        "healthInsuranceCoverageRate": insurance_rate,
        "internetAccessRate": internet_rate,
        "disasterRiskBreakdown": risk_counts,
        "incomeBreakdown": income_counts,
        "occupationBreakdown": occupation_counts,
        "totalApplications": total_apps,
        "approvedApplications": approved_apps,
        "pendingApplications": pending_apps,
    }


# ── 2. HOUSEHOLDS LIST & PROFILE ────────────────────────────────────────────
@router.get("/households")
@router.get("/households/")
def get_households(
    ward_id: Optional[str] = Query(None),
    disaster_risk: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(HouseholdMaster).filter(HouseholdMaster.deleted_at.is_(None))

    if ward_id and ward_id != "all":
        # Link address -> ward_id
        addr_ids = [a.id for a in db.query(AddressMaster.id).filter(AddressMaster.ward_id == ward_id).all()]
        query = query.filter(HouseholdMaster.address_id.in_(addr_ids))

    households = query.all()
    
    # Preload maps for rapid assembly
    addresses = {a.id: a for a in db.query(AddressMaster).all()}
    toles = {t.id: t.tole_name for t in db.query(ToleMaster).all()}
    citizens = {c.id: f"{c.first_name} {c.middle_name or ''} {c.last_name}".replace("  ", " ").strip() for c in db.query(CitizenMaster).all()}
    socio_profiles = {p.household_id: p for p in db.query(HouseholdSocioEconomicProfile).all()}

    results = []
    for hh in households:
        addr = addresses.get(hh.address_id)
        tole_name = toles.get(addr.tole_id) if addr else "थाङपाल"
        head_name = citizens.get(hh.head_of_household_id) or "घरान्ते मुखिया"
        se = socio_profiles.get(hh.id)

        if disaster_risk and disaster_risk != "all":
            if not se or se.disaster_risk_category != disaster_risk:
                continue

        if search:
            s_term = search.lower()
            matches = (
                s_term in (hh.household_number or "").lower() or
                s_term in head_name.lower() or
                s_term in tole_name.lower() or
                (se and s_term in (se.primary_occupation or "").lower())
            )
            if not matches:
                continue

        results.append({
            "id": hh.id,
            "householdNumber": hh.household_number,
            "headCitizenId": hh.head_of_household_id,
            "headName": head_name,
            "toleName": tole_name,
            "wardId": addr.ward_id if addr else "ward-01",
            "wardNumber": int(addr.ward_id.replace("ward-0", "").replace("ward-", "")) if addr and addr.ward_id else 1,
            "waterSource": hh.water_source,
            "electricityType": hh.electricity_type,
            "fuelType": hh.fuel_type,
            "toiletType": hh.toilet_type,
            "familyMembersCount": (hh.meta_data or {}).get("familyMembersCount", 4),
            "socioEconomic": se.to_dict() if se else None,
            "latitude": addr.latitude if addr else None,
            "longitude": addr.longitude if addr else None,
        })

    return results


@router.get("/households/{household_id}")
def get_household_detail(household_id: str, db: Session = Depends(get_db)):
    hh = db.query(HouseholdMaster).filter(HouseholdMaster.id == household_id).first()
    if not hh:
        raise HTTPException(status_code=404, detail="घरधुरी फेला परेन।")

    addr = db.query(AddressMaster).filter(AddressMaster.id == hh.address_id).first()
    tole = db.query(ToleMaster).filter(ToleMaster.id == addr.tole_id).first() if addr else None
    head = db.query(CitizenMaster).filter(CitizenMaster.id == hh.head_of_household_id).first()
    members = db.query(CitizenMaster).filter(CitizenMaster.household_id == hh.id).all()
    se = db.query(HouseholdSocioEconomicProfile).filter(HouseholdSocioEconomicProfile.household_id == hh.id).first()

    return {
        "id": hh.id,
        "householdNumber": hh.household_number,
        "waterSource": hh.water_source,
        "electricityType": hh.electricity_type,
        "fuelType": hh.fuel_type,
        "toiletType": hh.toilet_type,
        "metaData": hh.meta_data or {},
        "address": {
            "id": addr.id if addr else None,
            "wardId": addr.ward_id if addr else None,
            "toleName": tole.tole_name if tole else "थाङपाल",
            "streetName": addr.street_name if addr else "",
            "houseNumber": addr.house_number if addr else "",
            "latitude": addr.latitude if addr else None,
            "longitude": addr.longitude if addr else None,
        },
        "headOfHousehold": {
            "id": head.id if head else None,
            "name": f"{head.first_name} {head.middle_name or ''} {head.last_name}".replace("  ", " ").strip() if head else "अनुपलब्ध",
            "citizenshipNo": head.citizenship_no if head else "",
            "mobileNo": head.mobile_no if head else "",
        },
        "members": [
            {
                "id": m.id,
                "name": f"{m.first_name} {m.middle_name or ''} {m.last_name}".replace("  ", " ").strip(),
                "gender": m.gender,
                "dobBs": m.dob_bs,
                "relationshipToHead": m.relationship_to_head or "सदस्य",
                "citizenshipNo": m.citizenship_no or "",
                "mobileNo": m.mobile_no or "",
            }
            for m in members
        ],
        "socioEconomic": se.to_dict() if se else None
    }


@router.put("/households/{household_id}/socio-economic")
def update_household_socio_economic(
    household_id: str,
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    hh = db.query(HouseholdMaster).filter(HouseholdMaster.id == household_id).first()
    if not hh:
        raise HTTPException(status_code=404, detail="घरधुरी फेला परेन।")

    se = db.query(HouseholdSocioEconomicProfile).filter(HouseholdSocioEconomicProfile.household_id == household_id).first()
    if not se:
        se = HouseholdSocioEconomicProfile(
            tenant_id="panchpokhari",
            id=f"se-{str(uuid.uuid4())[:8]}",
            household_id=household_id,
            created_at=datetime.utcnow()
        )
        db.add(se)

    if "annual_income_bracket" in data: se.annual_income_bracket = data["annual_income_bracket"]
    if "primary_occupation" in data: se.primary_occupation = data["primary_occupation"]
    if "land_ownership_area_sqm" in data: se.land_ownership_area_sqm = float(data["land_ownership_area_sqm"] or 0)
    if "livestock_count" in data: se.livestock_count = data["livestock_count"]
    if "has_bank_account" in data: se.has_bank_account = bool(data["has_bank_account"])
    if "has_health_insurance" in data: se.has_health_insurance = bool(data["has_health_insurance"])
    if "has_internet_access" in data: se.has_internet_access = bool(data["has_internet_access"])
    if "vulnerability_score" in data: se.vulnerability_score = int(data["vulnerability_score"] or 0)
    if "disaster_risk_category" in data: se.disaster_risk_category = data["disaster_risk_category"]

    se.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(se)
        return se.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"सामाजिक-आर्थिक सर्वेक्षण सुरक्षित हुन सकेन: {str(e)}")


# ── 3. CITIZENS 360 & SERVICE APPLICATIONS ──────────────────────────────────
@router.get("/citizens")
def get_c360_citizens(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(CitizenMaster).filter(CitizenMaster.deleted_at.is_(None))
    if search:
        s_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                CitizenMaster.first_name.ilike(s_term),
                CitizenMaster.last_name.ilike(s_term),
                CitizenMaster.citizenship_no.ilike(s_term),
                CitizenMaster.mobile_no.ilike(s_term),
            )
        )
    citizens = query.all()

    results = []
    for c in citizens:
        results.append({
            "id": c.id,
            "fullName": f"{c.first_name} {c.middle_name or ''} {c.last_name}".replace("  ", " ").strip(),
            "gender": c.gender or "पुरुष",
            "dobBs": c.dob_bs or "२०३५-०१-०१",
            "citizenshipNo": c.citizenship_no or "",
            "nationalId": c.national_id or "",
            "mobileNo": c.mobile_no or "",
            "relationshipToHead": c.relationship_to_head or "घरमुली",
            "householdId": c.household_id,
        })
    return results


@router.get("/citizens/{citizen_id}/360")
def get_citizen_360_profile(citizen_id: str, db: Session = Depends(get_db)):
    cit = db.query(CitizenMaster).filter(CitizenMaster.id == citizen_id).first()
    if not cit:
        raise HTTPException(status_code=404, detail="नागरिक फेला परेन।")

    hh = db.query(HouseholdMaster).filter(HouseholdMaster.id == cit.household_id).first() if cit.household_id else None
    addr = db.query(AddressMaster).filter(AddressMaster.id == hh.address_id).first() if hh else None
    se = db.query(HouseholdSocioEconomicProfile).filter(HouseholdSocioEconomicProfile.household_id == hh.id).first() if hh else None
    applications = db.query(CitizenApplicationLog).filter(CitizenApplicationLog.citizen_id == citizen_id).all()

    return {
        "citizen": {
            "id": cit.id,
            "fullName": f"{cit.first_name} {cit.middle_name or ''} {cit.last_name}".replace("  ", " ").strip(),
            "fullNameEn": cit.full_name_en,
            "gender": cit.gender,
            "dobBs": cit.dob_bs,
            "citizenshipNo": cit.citizenship_no,
            "nationalId": cit.national_id,
            "mobileNo": cit.mobile_no,
            "relationshipToHead": cit.relationship_to_head,
        },
        "household": {
            "id": hh.id if hh else None,
            "householdNumber": hh.household_number if hh else "",
            "waterSource": hh.water_source if hh else "",
            "toiletType": hh.toilet_type if hh else "",
            "address": addr.street_name if addr else "पाँचपोखरी थाङपाल",
        } if hh else None,
        "socioEconomic": se.to_dict() if se else None,
        "applications": [a.to_dict() for a in applications],
    }


@router.get("/applications")
def get_c360_applications(
    citizen_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(CitizenApplicationLog)
    if citizen_id and citizen_id != "all":
        query = query.filter(CitizenApplicationLog.citizen_id == citizen_id)
    if status and status != "all":
        query = query.filter(CitizenApplicationLog.status == status)
    if search:
        s_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                CitizenApplicationLog.service_module.ilike(s_term),
                CitizenApplicationLog.application_ref_no.ilike(s_term),
            )
        )

    apps = query.order_by(CitizenApplicationLog.created_at.desc()).all()
    citizens = {c.id: f"{c.first_name} {c.middle_name or ''} {c.last_name}".replace("  ", " ").strip() for c in db.query(CitizenMaster).all()}

    results = []
    for a in apps:
        item = a.to_dict()
        item["citizenName"] = citizens.get(a.citizen_id) or "नागरिक"
        results.append(item)
    return results


@router.post("/applications", status_code=status.HTTP_201_CREATED)
def create_c360_application(data: Dict[str, Any], db: Session = Depends(get_db)):
    citizen_id = data.get("citizenId") or data.get("citizen_id")
    service_module = data.get("serviceModule") or data.get("service_module")
    if not citizen_id or not service_module:
        raise HTTPException(status_code=400, detail="नागरिक ID र सेवा मोड्युल अनिवार्य छ।")

    app_id = f"capp-{str(uuid.uuid4())[:8]}"
    ref_no = data.get("applicationRefNo") or f"P5-APP-2081-{str(uuid.uuid4())[:6].upper()}"

    app_log = CitizenApplicationLog(
        tenant_id="panchpokhari",
        id=app_id,
        citizen_id=citizen_id,
        service_module=service_module,
        application_ref_no=ref_no,
        application_date=datetime.utcnow().date(),
        status=data.get("status", "Pending"),
        created_at=datetime.utcnow()
    )

    try:
        db.add(app_log)
        db.commit()
        db.refresh(app_log)
        return app_log.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"आवेदन रेकर्ड गर्न सकिएन: {str(e)}")
