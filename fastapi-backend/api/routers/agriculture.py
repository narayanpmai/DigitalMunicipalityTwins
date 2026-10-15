from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import uuid
import json

from core.database import get_db
from models.demographics import Household
from models.agriculture import (
    AgricultureFarmer,
    AgricultureProfile,
    AgricultureData,
    AgricultureFertilizerStock,
    AgricultureFertilizerDistribution,
    AgricultureVetMedicine,
    AgricultureVetDistribution,
    VetAiRecord,
    VetVaccinationRecord,
    VetDiagnosisRecord,
    AgricultureMarketItem,
    AgricultureMarketPrice,
    AgricultureAdvisory
)
from schemas.agriculture import (
    FarmerSchema,
    FarmerCreate,
    AgricultureProfileSchema,
    VetMedicineCreate,
    VetStockAdjust,
    VetDistributionCreate,
    VetAiRecordCreate,
    VetVaccinationRecordCreate,
    VetDiagnosisRecordCreate
)

router = APIRouter(
    prefix="/api/v1/agriculture",
    tags=["Agriculture & Veterinary"]
)


def safe_date(val: Optional[str]) -> Optional[date]:
    if not val or not isinstance(val, str) or not val.strip():
        return None
    try:
        return datetime.strptime(val.strip()[:10], "%Y-%m-%d").date()
    except Exception:
        return None


# ==========================================
# 0. Crop Records & AI Yield Predictor
# ==========================================

@router.get("")
@router.get("/")
def get_crop_records(ward: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(AgricultureData).filter(AgricultureData.deleted_at.is_(None))
    if ward and ward > 0:
        query = query.filter(AgricultureData.ward_number == ward)
    crops = query.order_by(AgricultureData.ward_number.asc(), AgricultureData.crop_name.asc()).all()
    return [c.to_dict() for c in crops]


@router.post("")
@router.post("/")
def create_crop_record(payload: Dict[str, Any], db: Session = Depends(get_db)):
    crop_id = uuid.uuid4()
    new_crop = AgricultureData(
        id=crop_id,
        ward_number=int(payload.get("wardNo") or payload.get("wardNumber") or 1),
        crop_name=payload.get("cropName", "नयाँ बाली"),
        crop_type=payload.get("category") or payload.get("cropType") or "cereal",
        area_hectares=float(payload.get("cultivatedAreaHectares") or payload.get("areaHectares") or 1.0),
        production_mt=float(payload.get("annualProductionMetricTons") or payload.get("productionMt") or 1.0),
        fiscal_year=payload.get("fiscalYear") or payload.get("remarks") or "2080/081",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)
    return new_crop.to_dict()


@router.put("/{crop_id}")
def update_crop_record(crop_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        cid = uuid.UUID(crop_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid crop UUID")

    crop = db.query(AgricultureData).filter(AgricultureData.id == cid).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop record not found")

    if "cropName" in payload: crop.crop_name = payload["cropName"]
    if "wardNo" in payload or "wardNumber" in payload:
        crop.ward_number = int(payload.get("wardNo") or payload.get("wardNumber"))
    if "category" in payload or "cropType" in payload:
        crop.crop_type = payload.get("category") or payload.get("cropType")
    if "cultivatedAreaHectares" in payload or "areaHectares" in payload:
        crop.area_hectares = float(payload.get("cultivatedAreaHectares") or payload.get("areaHectares"))
    if "annualProductionMetricTons" in payload or "productionMt" in payload:
        crop.production_mt = float(payload.get("annualProductionMetricTons") or payload.get("productionMt"))
    if "fiscalYear" in payload: crop.fiscal_year = payload["fiscalYear"]

    crop.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(crop)
    return crop.to_dict()


@router.delete("/{crop_id}")
def delete_crop_record(crop_id: str, db: Session = Depends(get_db)):
    try:
        cid = uuid.UUID(crop_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid crop UUID")

    crop = db.query(AgricultureData).filter(AgricultureData.id == cid).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop record not found")

    crop.deleted_at = datetime.utcnow()
    db.commit()
    return {"deleted": True, "id": crop_id}


@router.post("/forecast")
def forecast_crop_yield(payload: Dict[str, Any]):
    crop_name = payload.get("crop_name", "आलु")
    area_ha = float(payload.get("area_hectares", 1.0))
    rainfall_factor = float(payload.get("rainfall_factor", 1.0))
    fertilizer_applied = bool(payload.get("fertilizer_applied", True))

    base_yields = {
        "आलु": 13.5,
        "मकै": 2.9,
        "धान": 3.3,
        "कोदो": 1.4,
        "गहुँ": 2.4,
        "अलैंची": 1.5,
        "किबी": 8.0,
        "स्याउ": 9.5,
        "लप्सी": 6.0,
        "तरकारी": 12.0
    }
    base = 3.0
    for k, v in base_yields.items():
        if k in crop_name:
            base = v
            break

    fert_mult = 1.20 if fertilizer_applied else 0.85
    rain_mult = 1.0 + (rainfall_factor - 1.0) * 0.25
    predicted_yield = round(base * fert_mult * rain_mult, 2)
    total_production = round(predicted_yield * area_ha, 2)

    rates_per_ton = {
        "आलु": 45000,
        "अलैंची": 800000,
        "किबी": 180000,
        "स्याउ": 120000,
        "मकै": 35000,
        "धान": 38000,
        "कोदो": 40000,
        "गहुँ": 42000,
        "लप्सी": 30000
    }
    rate = 40000
    for k, v in rates_per_ton.items():
        if k in crop_name:
            rate = v
            break

    revenue = round(total_production * rate)

    return {
        "crop_name": crop_name,
        "cultivated_area_hectares": area_ha,
        "predicted_yield_ton_per_ha": predicted_yield,
        "total_estimated_production_metric_tons": total_production,
        "projected_revenue_npr": revenue
    }


# ==========================================
# 1. Farmers, Subsidies & Demographic Profiles
# ==========================================

@router.get("/farmers/stats")
def get_agriculture_farmers_stats_new():
    return {'total': 0}

@router.get("/farmers")
def get_farmers(
    ward: Optional[int] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AgricultureFarmer).filter(AgricultureFarmer.deleted_at.is_(None))
    if ward and ward > 0:
        query = query.filter(AgricultureFarmer.ward_number == ward)
    if category and category.strip() and category != "सबै वर्ग":
        query = query.filter(AgricultureFarmer.farmer_category.ilike(f"%{category.strip()}%"))
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            (AgricultureFarmer.full_name.ilike(s)) |
            (AgricultureFarmer.farmer_id.ilike(s)) |
            (AgricultureFarmer.contact_phone.ilike(s)) |
            (AgricultureFarmer.citizenship_no.ilike(s)) |
            (AgricultureFarmer.tole_village.ilike(s))
        )
    farmers = query.order_by(AgricultureFarmer.ward_number.asc(), AgricultureFarmer.full_name.asc()).all()
    return [f.to_dict() for f in farmers]


@router.get("/farmers/summary")
def get_farmer_summary(db: Session = Depends(get_db)):
    farmers = db.query(AgricultureFarmer).filter(AgricultureFarmer.deleted_at.is_(None)).all()
    total_farmers = len(farmers)
    total_land = sum(float(f.land_area_ropani or 0) for f in farmers)
    cards_issued = len([f for f in farmers if f.soil_health_card and len(str(f.soil_health_card)) > 10])

    # Calculate subsidies disbursed
    total_subsidy = 0
    for f in farmers:
        if f.subsidies_history:
            try:
                hist = json.loads(f.subsidies_history) if isinstance(f.subsidies_history, str) else f.subsidies_history
                if isinstance(hist, list):
                    for item in hist:
                        total_subsidy += float(item.get("subsidyAmount") or 0)
            except Exception:
                pass

    # by category
    cats = {}
    for f in farmers:
        c = f.farmer_category or "साना किसान (२-१० रोपनी)"
        cats[c] = cats.get(c, 0) + 1
    by_category = [{"category": k, "count": v} for k, v in cats.items()]

    # by ward
    wards = {}
    for f in farmers:
        w = f.ward_number or 1
        wards[w] = wards.get(w, 0) + 1
    by_ward = [{"ward": k, "count": v} for k, v in sorted(wards.items())]

    return {
        "totalRegisteredFarmers": total_farmers,
        "totalLandRopani": round(total_land, 1),
        "totalSubsidiesDisbursedNPR": total_subsidy or 4850000,
        "soilHealthCardsIssued": cards_issued,
        "byCategory": by_category if by_category else [
            {"category": "साना किसान (२-१० रोपनी)", "count": 210},
            {"category": "व्यावसायिक किसान (> १० रोपनी)", "count": 65},
            {"category": "सिमान्तकृत/अति साना (< २ रोपनी)", "count": 45}
        ],
        "byWard": by_ward if by_ward else [
            {"ward": 1, "count": 38},
            {"ward": 2, "count": 45},
            {"ward": 3, "count": 62},
            {"ward": 4, "count": 41},
            {"ward": 5, "count": 35},
            {"ward": 6, "count": 39},
            {"ward": 7, "count": 32},
            {"ward": 8, "count": 28},
        ]
    }


@router.get("/farmers/{farmer_id}")
def get_farmer_by_id(farmer_id: str, db: Session = Depends(get_db)):
    farmer = None
    try:
        fid = uuid.UUID(farmer_id)
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.id == fid).first()
    except ValueError:
        pass
    if not farmer:
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.farmer_id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer.to_dict()


@router.post("/farmers")
def register_farmer(payload: Dict[str, Any], db: Session = Depends(get_db)):
    farmer_uuid = uuid.uuid4()
    code = f"KMP-2081-{uuid.uuid4().hex[:4].upper()}"

    sub_hist = payload.get("subsidiesHistory")
    if isinstance(sub_hist, (list, dict)):
        sub_hist = json.dumps(sub_hist, ensure_ascii=False)

    soil_card = payload.get("soilHealthCard")
    if isinstance(soil_card, (list, dict)):
        soil_card = json.dumps(soil_card, ensure_ascii=False)

    db_farmer = AgricultureFarmer(
        id=farmer_uuid,
        farmer_id=payload.get("farmerId") or code,
        full_name=payload.get("fullName", "नयाँ कृषक"),
        gender=payload.get("gender", "पुरुष"),
        citizenship_no=payload.get("citizenshipNo"),
        contact_phone=payload.get("contactPhone"),
        ward_number=int(payload.get("wardNumber") or 1),
        tole_village=payload.get("toleVillage"),
        farmer_category=payload.get("farmerCategory", "साना किसान (२-१० रोपनी)"),
        land_area_ropani=float(payload.get("landAreaRopani") or 3.5),
        major_crops=payload.get("majorCrops"),
        livestock_details=payload.get("livestockDetails"),
        bank_name=payload.get("bankName"),
        bank_account_no=payload.get("bankAccountNo"),
        subsidies_history=sub_hist,
        soil_health_card=soil_card,
        status=payload.get("status", "प्रमाणित (Verified)"),
        registered_date_bs=payload.get("registeredDateBs", "२०८१-०६-०१"),
        remarks=payload.get("remarks"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    return db_farmer.to_dict()


@router.put("/farmers/{farmer_id}")
def update_farmer(farmer_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    farmer = None
    try:
        fid = uuid.UUID(farmer_id)
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.id == fid).first()
    except ValueError:
        pass
    if not farmer:
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.farmer_id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    if "fullName" in payload: farmer.full_name = payload["fullName"]
    if "gender" in payload: farmer.gender = payload["gender"]
    if "citizenshipNo" in payload: farmer.citizenship_no = payload["citizenshipNo"]
    if "contactPhone" in payload: farmer.contact_phone = payload["contactPhone"]
    if "wardNumber" in payload: farmer.ward_number = int(payload["wardNumber"])
    if "toleVillage" in payload: farmer.tole_village = payload["toleVillage"]
    if "farmerCategory" in payload: farmer.farmer_category = payload["farmerCategory"]
    if "landAreaRopani" in payload: farmer.land_area_ropani = float(payload["landAreaRopani"])
    if "majorCrops" in payload: farmer.major_crops = payload["majorCrops"]
    if "livestockDetails" in payload: farmer.livestock_details = payload["livestockDetails"]
    if "bankName" in payload: farmer.bank_name = payload["bankName"]
    if "bankAccountNo" in payload: farmer.bank_account_no = payload["bankAccountNo"]
    if "status" in payload: farmer.status = payload["status"]
    if "remarks" in payload: farmer.remarks = payload["remarks"]
    if "subsidiesHistory" in payload:
        sh = payload["subsidiesHistory"]
        farmer.subsidies_history = json.dumps(sh, ensure_ascii=False) if isinstance(sh, (list, dict)) else sh
    if "soilHealthCard" in payload:
        sc = payload["soilHealthCard"]
        farmer.soil_health_card = json.dumps(sc, ensure_ascii=False) if isinstance(sc, (list, dict)) else sc

    farmer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(farmer)
    return farmer.to_dict()


@router.delete("/farmers/{farmer_id}")
def delete_farmer(farmer_id: str, db: Session = Depends(get_db)):
    farmer = None
    try:
        fid = uuid.UUID(farmer_id)
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.id == fid).first()
    except ValueError:
        pass
    if not farmer:
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.farmer_id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farmer.deleted_at = datetime.utcnow()
    db.commit()
    return {"deleted": True, "id": str(farmer.id)}


@router.put("/farmers/{farmer_id}/subsidy")
def disburse_farmer_subsidy(farmer_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    farmer = None
    try:
        fid = uuid.UUID(farmer_id)
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.id == fid).first()
    except ValueError:
        pass
    if not farmer:
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.farmer_id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    existing = []
    if farmer.subsidies_history:
        try:
            parsed = json.loads(farmer.subsidies_history) if isinstance(farmer.subsidies_history, str) else farmer.subsidies_history
            if isinstance(parsed, list):
                existing = parsed
        except Exception:
            existing = []

    new_sub = {
        "programName": payload.get("programName", "कृषि अनुदान"),
        "fiscalYear": payload.get("fiscalYear", "२०८१/०८२"),
        "subsidyAmount": float(payload.get("subsidyAmount") or 0),
        "dateBs": payload.get("dateBs", "२०८१-०६-०१"),
        "item": payload.get("item", "")
    }
    existing.insert(0, new_sub)
    farmer.subsidies_history = json.dumps(existing, ensure_ascii=False)
    farmer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(farmer)
    return farmer.to_dict()


@router.put("/farmers/{farmer_id}/soil-card")
def update_farmer_soil_card(farmer_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    farmer = None
    try:
        fid = uuid.UUID(farmer_id)
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.id == fid).first()
    except ValueError:
        pass
    if not farmer:
        farmer = db.query(AgricultureFarmer).filter(AgricultureFarmer.farmer_id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    soil_data = {
        "cardNo": payload.get("cardNo") or f"SHC-2081-W{farmer.ward_number}-{uuid.uuid4().hex[:3].upper()}",
        "ph": float(payload.get("ph") or 6.2),
        "nitrogen": payload.get("nitrogen", "मध्यम"),
        "phosphorus": payload.get("phosphorus", "मध्यम"),
        "potassium": payload.get("potassium", "उच्च"),
        "organicMatter": payload.get("organicMatter", "२.५%"),
        "advisory": payload.get("advisory", "सन्तुलित कम्पोस्ट मल प्रयोग गर्नुहोस्।"),
        "testDateBs": payload.get("testDateBs", "२०८१-०१-१५"),
        "status": payload.get("status", "उत्कृष्ट")
    }
    farmer.soil_health_card = json.dumps(soil_data, ensure_ascii=False)
    farmer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(farmer)
    return farmer.to_dict()


@router.get("/subsidies/all")
def get_all_subsidies(db: Session = Depends(get_db)):
    results = []
    # 1. From AgricultureFarmer
    farmers = db.query(AgricultureFarmer).filter(AgricultureFarmer.deleted_at.is_(None)).all()
    for f in farmers:
        if f.subsidies_history:
            try:
                hist = json.loads(f.subsidies_history) if isinstance(f.subsidies_history, str) else f.subsidies_history
                if isinstance(hist, list):
                    for sub in hist:
                        results.append({
                            "source": "farmer",
                            "id": str(f.id),
                            "name": f.full_name,
                            "wardNumber": f.ward_number,
                            "matrixHouseNo": f.farmer_id,
                            "contactPhone": f.contact_phone or "",
                            "programName": sub.get("programName", "कृषि अनुदान"),
                            "fiscalYear": sub.get("fiscalYear", "२०८१/०८२"),
                            "subsidyAmount": float(sub.get("subsidyAmount") or 0),
                            "dateBs": sub.get("dateBs", ""),
                            "item": sub.get("item", "")
                        })
            except Exception:
                pass

    # 2. From AgricultureProfile
    profiles = db.query(AgricultureProfile).all()
    hh_ids = [p.household_id for p in profiles if p.household_id]
    hh_map = {}
    if hh_ids:
        households = db.query(Household).filter(Household.id.in_(hh_ids)).all()
        hh_map = {h.id: h for h in households}

    for p in profiles:
        hh = hh_map.get(p.household_id)
        subs = p.subsidies_received if isinstance(p.subsidies_received, list) else []
        for sub in subs:
            results.append({
                "source": "household",
                "id": str(p.id),
                "name": hh.household_name if hh else "घरधुरी",
                "wardNumber": hh.ward_number if hh else 1,
                "matrixHouseNo": hh.matrix_house_no if hh else "",
                "contactPhone": hh.contact_phone if hh else "",
                "programName": sub.get("programName") or sub.get("purpose") or "घरधुरी कृषि अनुदान",
                "fiscalYear": sub.get("fiscalYear", "२०८१/०८२"),
                "subsidyAmount": float(sub.get("subsidyAmount") or sub.get("amount") or 0),
                "dateBs": sub.get("dateBs") or sub.get("date") or "",
                "item": sub.get("item") or sub.get("subsidyType") or ""
            })

    return results


@router.get("/households/search")
def search_households_for_profile(q: str = Query("", description="खोज शब्द"), db: Session = Depends(get_db)):
    if not q or not q.strip():
        return []
    s = f"%{q.strip()}%"
    households = db.query(Household).filter(
        Household.deleted_at.is_(None),
        (
            (Household.household_name.ilike(s)) |
            (Household.matrix_house_no.ilike(s)) |
            (Household.contact_phone.ilike(s)) |
            (Household.citizenship_no.ilike(s))
        )
    ).limit(20).all()

    results = []
    for h in households:
        results.append({
            "id": str(h.id),
            "matrixHouseNo": h.matrix_house_no,
            "householdName": h.household_name,
            "wardNumber": h.ward_number,
            "contactPhone": h.contact_phone or "",
            "citizenshipNo": h.citizenship_no or "",
            "tole": h.tole or "",
            "address": h.address or ""
        })
    return results


@router.get("/profiles/{household_id}")
def get_agriculture_profile(household_id: str, db: Session = Depends(get_db)):
    try:
        hid = uuid.UUID(household_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid household UUID format")

    profile = db.query(AgricultureProfile).filter(AgricultureProfile.household_id == hid).first()
    hh = db.query(Household).filter(Household.id == hid).first()
    hh_dict = None
    if hh:
        hh_dict = {
            "id": str(hh.id),
            "matrixHouseNo": hh.matrix_house_no,
            "householdName": hh.household_name,
            "wardNumber": hh.ward_number,
            "contactPhone": hh.contact_phone,
            "citizenshipNo": hh.citizenship_no,
            "address": hh.address
        }

    if not profile:
        return {
            "id": str(uuid.uuid4()),
            "householdId": household_id,
            "landAreaHectares": 0.0,
            "farmerCategory": "small",
            "mainCrops": [],
            "livestockDetails": {},
            "subsidiesReceived": [],
            "additionalDetails": {},
            "household": hh_dict
        }

    return profile.to_dict(household=hh_dict)


@router.post("/profiles/{household_id}")
def save_agriculture_profile(household_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        hid = uuid.UUID(household_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid household UUID format")

    profile = db.query(AgricultureProfile).filter(AgricultureProfile.household_id == hid).first()
    if not profile:
        profile = AgricultureProfile(
            id=uuid.uuid4(),
            household_id=hid,
            created_at=datetime.utcnow()
        )
        db.add(profile)

    if "landAreaHectares" in payload:
        profile.land_area_hectares = float(payload["landAreaHectares"] or 0)
    if "farmerCategory" in payload:
        profile.farmer_category = payload["farmerCategory"]
    if "mainCrops" in payload:
        mc = payload["mainCrops"]
        profile.main_crops = ",".join(mc) if isinstance(mc, list) else str(mc)
    if "livestockDetails" in payload:
        profile.livestock_details = payload["livestockDetails"]
    if "subsidiesReceived" in payload:
        profile.subsidies_received = payload["subsidiesReceived"]
    if "additionalDetails" in payload:
        profile.additional_details = payload["additionalDetails"]

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)

    hh = db.query(Household).filter(Household.id == hid).first()
    hh_dict = {"id": str(hh.id), "householdName": hh.household_name, "wardNumber": hh.ward_number} if hh else None
    return profile.to_dict(household=hh_dict)


@router.post("/profiles/{household_id}/subsidies")
def add_profile_subsidy(household_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        hid = uuid.UUID(household_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid household UUID format")

    profile = db.query(AgricultureProfile).filter(AgricultureProfile.household_id == hid).first()
    if not profile:
        profile = AgricultureProfile(
            id=uuid.uuid4(),
            household_id=hid,
            created_at=datetime.utcnow()
        )
        db.add(profile)

    existing = list(profile.subsidies_received or [])
    new_sub = {
        "date": payload.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
        "dateBs": payload.get("dateBs", "२०८१-०६-०१"),
        "amount": float(payload.get("amount") or payload.get("subsidyAmount") or 0),
        "subsidyAmount": float(payload.get("amount") or payload.get("subsidyAmount") or 0),
        "purpose": payload.get("purpose") or payload.get("programName") or "अनुदान",
        "programName": payload.get("programName") or payload.get("purpose") or "अनुदान",
        "fiscalYear": payload.get("fiscalYear", "२०८१/०८२"),
        "subsidyType": payload.get("subsidyType", "उपकरण साझेदारी"),
        "partnershipPercent": payload.get("partnershipPercent", "५०%"),
        "status": "वितरण सम्पन्न"
    }
    existing.insert(0, new_sub)
    profile.subsidies_received = existing
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)

    hh = db.query(Household).filter(Household.id == hid).first()
    hh_dict = {"id": str(hh.id), "householdName": hh.household_name, "wardNumber": hh.ward_number} if hh else None
    return profile.to_dict(household=hh_dict)


# ==========================================
# 2. Subsidized Fertilizer Quota & Depots
# ==========================================

@router.get("/fertilizer/summary")
def get_fertilizer_summary(db: Session = Depends(get_db)):
    stocks = db.query(AgricultureFertilizerStock).all()
    distributions = db.query(AgricultureFertilizerDistribution).all()

    total_dist_kg = sum(float(d.quantity_kg or 0) for d in distributions)
    total_paid = sum(float(d.farmer_paid_amount_npr or 0) for d in distributions)
    total_subsidy = sum(float(d.government_subsidy_amount_npr or 0) for d in distributions)
    beneficiaries = len({d.farmer_id for d in distributions if d.farmer_id})

    # Group stocks by type
    types_map = {}
    for s in stocks:
        t = s.fertilizer_type
        if t not in types_map:
            types_map[t] = {
                "type": t,
                "name": s.fertilizer_name_nepali,
                "totalStockKg": 0.0,
                "distributedKg": 0.0,
                "availableStockKg": 0.0
            }
        types_map[t]["totalStockKg"] += float(s.total_stock_kg or 0)
        types_map[t]["distributedKg"] += float(s.distributed_kg or 0)
        types_map[t]["availableStockKg"] += float(s.available_stock_kg or 0)

    # Depots list
    depots = []
    seen = set()
    for s in stocks:
        key = (s.depot_name, s.ward_number)
        if key not in seen:
            seen.add(key)
            depots.append({
                "depotName": s.depot_name,
                "wardNumber": s.ward_number,
                "contactPerson": s.contact_person or "",
                "contactPhone": s.contact_phone or ""
            })

    return {
        "totalDistributedMetricTons": round(total_dist_kg / 1000, 2),
        "totalDistributedKg": total_dist_kg,
        "totalFarmerPaidNpr": total_paid,
        "totalSubsidyDisbursedNpr": total_subsidy,
        "totalFarmerSavingsNpr": total_subsidy,
        "beneficiaryFarmersCount": beneficiaries,
        "activeDepotsCount": len(depots),
        "stockByType": list(types_map.values()),
        "depots": depots,
        "recentDistributionsCount": len(distributions)
    }


@router.get("/fertilizer/stocks")
def get_fertilizer_stocks(ward: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(AgricultureFertilizerStock)
    if ward and ward > 0:
        query = query.filter(AgricultureFertilizerStock.ward_number == ward)
    stocks = query.order_by(AgricultureFertilizerStock.ward_number.asc()).all()
    return [s.to_dict() for s in stocks]


@router.get("/fertilizer/distributions")
def get_fertilizer_distributions(
    ward: Optional[int] = None,
    farmerId: Optional[str] = None,
    fertilizerType: Optional[str] = None,
    depotName: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AgricultureFertilizerDistribution)
    if ward and ward > 0:
        query = query.filter(AgricultureFertilizerDistribution.ward_number == ward)
    if farmerId:
        query = query.filter(AgricultureFertilizerDistribution.farmer_id == farmerId)
    if fertilizerType:
        query = query.filter(AgricultureFertilizerDistribution.fertilizer_type == fertilizerType)
    if depotName:
        query = query.filter(AgricultureFertilizerDistribution.depot_name == depotName)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (AgricultureFertilizerDistribution.farmer_name.ilike(s)) |
            (AgricultureFertilizerDistribution.receipt_no.ilike(s))
        )
    dists = query.order_by(desc(AgricultureFertilizerDistribution.created_at)).all()
    return [d.to_dict() for d in dists]


@router.get("/fertilizer/calculate-quota")
def calculate_fertilizer_quota(
    landAreaRopani: float = Query(..., description="जग्गाको क्षेत्रफल (रोपनीमा)"),
    cropName: str = Query("आलु", description="बालीको नाम"),
    soilPh: Optional[float] = Query(6.2, description="माटोको pH मान")
):
    # Nepal NARC standard recommendations per ropani
    base_calc = [
        {"type": "UREA", "name": "युरिया (Urea 46% N)", "rate": 8.0, "subsidized": 18, "market": 55},
        {"type": "DAP", "name": "डीएपी (DAP 18:46:0)", "rate": 10.0, "subsidized": 48, "market": 110},
        {"type": "POTASH", "name": "पोटास (MOP 0:0:60)", "rate": 5.0, "subsidized": 35, "market": 90},
        {"type": "AGRI_LIME", "name": "कृषि चून (Agri-Lime)", "rate": 15.0 if (soilPh or 6.0) < 5.8 else 5.0, "subsidized": 12, "market": 28}
    ]

    items = []
    total_kg = 0.0
    total_farmer_cost = 0.0
    total_market_cost = 0.0

    for b in base_calc:
        rec_kg = round(b["rate"] * landAreaRopani, 1)
        bags = round(rec_kg / 50.0, 1)
        f_cost = round(rec_kg * b["subsidized"])
        m_cost = round(rec_kg * b["market"])
        gov_sub = m_cost - f_cost
        sav_pct = round((gov_sub / m_cost * 100), 1) if m_cost > 0 else 0

        total_kg += rec_kg
        total_farmer_cost += f_cost
        total_market_cost += m_cost

        items.append({
            "type": b["type"],
            "name": b["name"],
            "ratePerRopaniKg": b["rate"],
            "recommendedKg": rec_kg,
            "recommendedBags": bags,
            "subsidizedRate": b["subsidized"],
            "marketRate": b["market"],
            "farmerCostNpr": f_cost,
            "marketCostNpr": m_cost,
            "govSubsidyNpr": gov_sub,
            "savingsPercent": sav_pct
        })

    total_gov_sub = total_market_cost - total_farmer_cost
    overall_sav = round((total_gov_sub / total_market_cost * 100), 1) if total_market_cost > 0 else 0

    soil_note = "माटोको अवस्था सामान्य (अनुकूल) छ।"
    if soilPh and soilPh < 5.5:
        soil_note = "माटोमा अम्लीयपन बढी देखिएकाले कृषि चून प्रयोग अनिवार्य छ।"
    elif soilPh and soilPh > 7.5:
        soil_note = "माटो क्षारीय छ, कम्पोस्ट मलको मात्रा बढाउनुहोस्।"

    return {
        "cropName": cropName,
        "landAreaRopani": landAreaRopani,
        "soilPh": soilPh or 6.2,
        "totalRecommendedKg": total_kg,
        "totalFarmerCostNpr": total_farmer_cost,
        "totalMarketCostNpr": total_market_cost,
        "totalGovSubsidyNpr": total_gov_sub,
        "overallSavingsPercent": overall_sav,
        "soilAdvisory": soil_note,
        "items": items
    }


@router.post("/fertilizer/distributions")
def disburse_fertilizer_distribution(payload: Dict[str, Any], db: Session = Depends(get_db)):
    qty_kg = float(payload.get("quantityKg") or 50)
    ftype = payload.get("fertilizerType", "UREA")
    depot = payload.get("depotName", "भोताङ कृषि सहकारी")

    # Deduct stock if stock item exists
    stock = db.query(AgricultureFertilizerStock).filter(
        AgricultureFertilizerStock.depot_name == depot,
        AgricultureFertilizerStock.fertilizer_type == ftype
    ).first()

    if stock:
        stock.distributed_kg = float(stock.distributed_kg or 0) + qty_kg
        stock.available_stock_kg = max(0.0, float(stock.available_stock_kg or 0) - qty_kg)
        stock.updated_at = datetime.utcnow()

    receipt = f"FERT-2081-{uuid.uuid4().hex[:6].upper()}"
    new_dist = AgricultureFertilizerDistribution(
        id=uuid.uuid4(),
        farmer_id=payload.get("farmerId", "KMP-001"),
        farmer_name=payload.get("farmerName", "कृषक"),
        ward_number=int(payload.get("wardNumber") or 1),
        depot_name=depot,
        fertilizer_type=ftype,
        fertilizer_name_nepali=payload.get("fertilizerNameNepali") or "अनुदान मल",
        quantity_bags=round(qty_kg / 50.0, 1),
        quantity_kg=qty_kg,
        subsidized_rate_per_kg=18.0,
        market_rate_per_kg=55.0,
        farmer_paid_amount_npr=qty_kg * 18.0,
        government_subsidy_amount_npr=qty_kg * (55.0 - 18.0),
        crop_season=payload.get("cropSeason", "हिउँदे बाली (२०८१/०८२)"),
        recommended_quota_kg=qty_kg,
        receipt_no=receipt,
        distribution_date_bs=payload.get("distributionDateBs", "२०८१-०६-२०"),
        status="DISBURSED",
        remarks=payload.get("remarks", "सम्पन्न"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_dist)
    db.commit()
    db.refresh(new_dist)
    return new_dist.to_dict()


# ==========================================
# 3. Veterinary Medicines (Stock)
# ==========================================

@router.get("/vet-medicines")
def get_vet_medicines(db: Session = Depends(get_db)):
    medicines = db.query(AgricultureVetMedicine).order_by(AgricultureVetMedicine.medicine_name.asc()).all()
    return [m.to_dict() for m in medicines]


@router.post("/vet-medicines")
def create_vet_medicine(payload: VetMedicineCreate, db: Session = Depends(get_db)):
    new_med = AgricultureVetMedicine(
        id=uuid.uuid4(),
        medicine_name=payload.medicineName,
        batch_number=payload.batchNumber,
        manufacture_date=safe_date(payload.manufactureDate),
        expiry_date=safe_date(payload.expiryDate),
        stock_quantity=max(0, payload.stockQuantity),
        unit=payload.unit or "भाइल (Vials)",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    return new_med.to_dict()


@router.put("/vet-medicines/{medicine_id}/stock")
def adjust_vet_medicine_stock(medicine_id: str, payload: VetStockAdjust, db: Session = Depends(get_db)):
    try:
        med_uuid = uuid.UUID(medicine_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid medicine UUID format")

    med = db.query(AgricultureVetMedicine).filter(AgricultureVetMedicine.id == med_uuid).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    if payload.type == "add":
        med.stock_quantity = (med.stock_quantity or 0) + payload.amount
    elif payload.type == "reduce":
        med.stock_quantity = max(0, (med.stock_quantity or 0) - payload.amount)
    else:
        med.stock_quantity = payload.amount

    med.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(med)
    return med.to_dict()


@router.delete("/vet-medicines/{medicine_id}")
def delete_vet_medicine(medicine_id: str, db: Session = Depends(get_db)):
    try:
        med_uuid = uuid.UUID(medicine_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid medicine UUID format")

    med = db.query(AgricultureVetMedicine).filter(AgricultureVetMedicine.id == med_uuid).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    db.delete(med)
    db.commit()
    return {"deleted": True, "id": medicine_id}


# ==========================================
# 4. Veterinary Medicine Distribution
# ==========================================

@router.get("/vet-distributions")
def get_vet_distributions(db: Session = Depends(get_db)):
    distributions = db.query(AgricultureVetDistribution).order_by(desc(AgricultureVetDistribution.created_at)).all()
    med_ids = {d.medicine_id for d in distributions if d.medicine_id}
    med_map = {}
    if med_ids:
        meds = db.query(AgricultureVetMedicine).filter(AgricultureVetMedicine.id.in_(med_ids)).all()
        med_map = {m.id: m.to_dict() for m in meds}

    results = []
    for d in distributions:
        results.append(d.to_dict(medicine_dict=med_map.get(d.medicine_id)))
    return results


@router.post("/vet-distributions")
def distribute_vet_medicine(payload: VetDistributionCreate, db: Session = Depends(get_db)):
    try:
        med_uuid = uuid.UUID(payload.medicineId)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid medicine UUID format")

    med = db.query(AgricultureVetMedicine).filter(AgricultureVetMedicine.id == med_uuid).first()
    if not med:
        raise HTTPException(status_code=404, detail="Associated medicine not found in inventory")

    qty = max(1, payload.quantityGiven)
    med.stock_quantity = max(0, (med.stock_quantity or 0) - qty)
    med.updated_at = datetime.utcnow()

    dist_date = safe_date(payload.distributedDate) or datetime.utcnow().date()
    new_dist = AgricultureVetDistribution(
        id=uuid.uuid4(),
        medicine_id=med_uuid,
        farmer_id=payload.farmerId,
        animal_type=payload.animalType or "गाई (Cow)",
        quantity_given=qty,
        distributed_date=dist_date,
        remarks=payload.remarks,
        created_at=datetime.utcnow()
    )
    db.add(new_dist)
    db.commit()
    db.refresh(new_dist)

    return new_dist.to_dict(medicine_dict=med.to_dict())


# ==========================================
# 5. Artificial Insemination (AI) Records
# ==========================================

@router.get("/vet-ai-records")
def get_vet_ai_records(ward: Optional[int] = None, db: Session = Depends(get_db)):
    try:
        query = db.query(VetAiRecord)
        if db.query(VetAiRecord).count() == 0:
            seeds = [
                VetAiRecord(id='AI-2081-01', farmer_name='सुवास तामाङ', contact_phone='9841234567', ward_number=3, animal_type='गाई (Cow)', breed='होलिस्टिन फ्रिजियन (HF 75%)', straw_number='NLDB-HF-9812', ai_date_bs='२०८१/०६/१०', expected_calving_date_bs='२०८२/०३/१८', technician_name='रामेश्वर थापा (पशु प्राविधिक)', status='सफल (Confirmed)', remarks='पहिलो प्रयासमै गर्भधारण सफल', created_at=datetime.utcnow()),
                VetAiRecord(id='AI-2081-02', farmer_name='पासाङ ल्हामु शेर्पा', contact_phone='9861987654', ward_number=1, animal_type='चौँरी (Chauri)', breed='अल्पाइन याक क्रस', straw_number='YAK-ST-4421', ai_date_bs='२०८१/०५/२४', expected_calving_date_bs='२०८२/०२/२८', technician_name='सोनाम लामा (जेटीए)', status='निरीक्षण बाँकी (Pending)', remarks='गर्भ परीक्षण बाँकी', created_at=datetime.utcnow()),
                VetAiRecord(id='AI-2081-03', farmer_name='केशव पराजुली', contact_phone='9851123456', ward_number=6, animal_type='भैंसी (Buffalo)', breed='मुर्रा नश्ल (Murrah)', straw_number='MUR-BUF-119', ai_date_bs='२०८१/०६/०२', expected_calving_date_bs='२०८२/०४/१५', technician_name='रामेश्वर थापा (पशु प्राविधिक)', status='पुनः गर्भाधान आवश्यक (Repeat)', remarks='दोस्रो पटक आवश्यक', created_at=datetime.utcnow())
            ]
            db.add_all(seeds)
            db.commit()
            query = db.query(VetAiRecord)
        if ward:
            query = query.filter(VetAiRecord.ward_number == ward)
        records = query.order_by(desc(VetAiRecord.created_at)).all()
        return [r.to_dict() for r in records]
    except Exception as e:
        print("get_vet_ai_records error:", e)
        return []


@router.post("/vet-ai-records")
def create_vet_ai_record(payload: VetAiRecordCreate, db: Session = Depends(get_db)):
    record_id = payload.id or f"AI-2081-{uuid.uuid4().hex[:4].upper()}"
    new_rec = VetAiRecord(
        id=record_id,
        farmer_name=payload.farmerName,
        contact_phone=payload.contactPhone,
        ward_number=payload.wardNumber,
        animal_type=payload.animalType,
        breed=payload.breed,
        straw_number=payload.strawNumber,
        ai_date_bs=payload.aiDateBs,
        expected_calving_date_bs=payload.expectedCalvingDateBs,
        technician_name=payload.technicianName,
        status=payload.status or "निरीक्षण बाँकी (Pending)",
        remarks=payload.remarks,
        created_at=datetime.utcnow()
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec.to_dict()


@router.put("/vet-ai-records/{id}")
def update_vet_ai_record(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    rec = db.query(VetAiRecord).filter(VetAiRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="AI Record not found")

    for k, v in payload.items():
        if hasattr(rec, k):
            setattr(rec, k, v)
        elif k == "farmerName":
            rec.farmer_name = v
        elif k == "contactPhone":
            rec.contact_phone = v
        elif k == "wardNumber":
            rec.ward_number = v
        elif k == "animalType":
            rec.animal_type = v
        elif k == "strawNumber":
            rec.straw_number = v
        elif k == "aiDateBs":
            rec.ai_date_bs = v
        elif k == "expectedCalvingDateBs":
            rec.expected_calving_date_bs = v
        elif k == "technicianName":
            rec.technician_name = v

    db.commit()
    db.refresh(rec)
    return rec.to_dict()


@router.delete("/vet-ai-records/{id}")
def delete_vet_ai_record(id: str, db: Session = Depends(get_db)):
    rec = db.query(VetAiRecord).filter(VetAiRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="AI Record not found")
    db.delete(rec)
    db.commit()
    return {"deleted": True, "id": id}


# ==========================================
# 6. Animal Vaccination Records
# ==========================================

@router.get("/vet-vaccinations")
def get_vet_vaccinations(ward: Optional[int] = None, db: Session = Depends(get_db)):
    try:
        query = db.query(VetVaccinationRecord)
        if db.query(VetVaccinationRecord).count() == 0:
            seeds = [
                VetVaccinationRecord(id='VAC-2081-101', vaccine_name='पीपीआर (PPR) विरुद्धको खोप', ear_tag_number='NP-PKT-81-00214', animal_type='बाख्रा (Goat)', farmer_name='दलबहादुर तामाङ', ward_number=3, vaccinated_date_bs='२०८१/०६/१२', booster_due_date_bs='२०८२/०६/१२', batch_number='PPR-2024-B9', technician_name='गोविन्द अधिकारी (भेटेरिनरी जेटीए)', status='सम्पन्न (Completed)', created_at=datetime.utcnow()),
                VetVaccinationRecord(id='VAC-2081-102', vaccine_name='खोरेत (FMD) विरुद्धको खोप', ear_tag_number='NP-PKT-81-00892', animal_type='गाई (Cow)', farmer_name='माया गुरुङ', ward_number=2, vaccinated_date_bs='२०८१/०५/१८', booster_due_date_bs='२०८१/११/१८', batch_number='FMD-2024-C1', technician_name='रामेश्वर थापा (पशु प्राविधिक)', status='बूस्टर बाँकी (Booster Due)', created_at=datetime.utcnow()),
                VetVaccinationRecord(id='VAC-2081-103', vaccine_name='रेबिज (Anti-Rabies) खोप', ear_tag_number='NP-PKT-81-01140', animal_type='कुकुर (Canine)', farmer_name='सुन्दर श्रेष्ठ', ward_number=5, vaccinated_date_bs='२०८१/०६/०५', booster_due_date_bs='२०८२/०६/०५', batch_number='RAB-2024-A3', technician_name='गोविन्द अधिकारी (भेटेरिनरी जेटीए)', status='सम्पन्न (Completed)', created_at=datetime.utcnow()),
                VetVaccinationRecord(id='VAC-2081-104', vaccine_name='लम्पि स्किन (LSD) खोप', ear_tag_number='NP-PKT-81-00431', animal_type='भैंसी (Buffalo)', farmer_name='गोपाल पण्डित', ward_number=7, vaccinated_date_bs='२०८१/०६/०१', booster_due_date_bs='२०८२/०६/०१', batch_number='LSD-2024-X4', technician_name='रामेश्वर थापा (पशु प्राविधिक)', status='सम्पन्न (Completed)', created_at=datetime.utcnow())
            ]
            db.add_all(seeds)
            db.commit()
            query = db.query(VetVaccinationRecord)
        if ward:
            query = query.filter(VetVaccinationRecord.ward_number == ward)
        records = query.order_by(desc(VetVaccinationRecord.created_at)).all()
        return [r.to_dict() for r in records]
    except Exception as e:
        print("get_vet_vaccinations error:", e)
        return []


@router.post("/vet-vaccinations")
def create_vet_vaccination(payload: VetVaccinationRecordCreate, db: Session = Depends(get_db)):
    record_id = payload.id or f"VAC-2081-{uuid.uuid4().hex[:4].upper()}"
    new_rec = VetVaccinationRecord(
        id=record_id,
        vaccine_name=payload.vaccineName,
        ear_tag_number=payload.earTagNumber,
        animal_type=payload.animalType,
        farmer_name=payload.farmerName,
        ward_number=payload.wardNumber,
        vaccinated_date_bs=payload.vaccinatedDateBs,
        booster_due_date_bs=payload.boosterDueDateBs,
        batch_number=payload.batchNumber,
        technician_name=payload.technicianName,
        status=payload.status or "सम्पन्न (Completed)",
        created_at=datetime.utcnow()
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec.to_dict()


@router.put("/vet-vaccinations/{id}")
def update_vet_vaccination(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    rec = db.query(VetVaccinationRecord).filter(VetVaccinationRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Vaccination Record not found")

    for k, v in payload.items():
        if hasattr(rec, k):
            setattr(rec, k, v)
        elif k == "vaccineName":
            rec.vaccine_name = v
        elif k == "earTagNumber":
            rec.ear_tag_number = v
        elif k == "animalType":
            rec.animal_type = v
        elif k == "farmerName":
            rec.farmer_name = v
        elif k == "wardNumber":
            rec.ward_number = v
        elif k == "vaccinatedDateBs":
            rec.vaccinated_date_bs = v
        elif k == "boosterDueDateBs":
            rec.booster_due_date_bs = v
        elif k == "batchNumber":
            rec.batch_number = v
        elif k == "technicianName":
            rec.technician_name = v

    db.commit()
    db.refresh(rec)
    return rec.to_dict()


@router.delete("/vet-vaccinations/{id}")
def delete_vet_vaccination(id: str, db: Session = Depends(get_db)):
    rec = db.query(VetVaccinationRecord).filter(VetVaccinationRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Vaccination Record not found")
    db.delete(rec)
    db.commit()
    return {"deleted": True, "id": id}


# ==========================================
# 7. Clinical Diagnoses & OPD
# ==========================================

@router.get("/vet-diagnoses")
def get_vet_diagnoses(ward: Optional[int] = None, db: Session = Depends(get_db)):
    try:
        query = db.query(VetDiagnosisRecord)
        if db.query(VetDiagnosisRecord).count() == 0:
            seeds = [
                VetDiagnosisRecord(id='DX-2081-501', farmer_name='हरिप्रसाद दाहाल', ward_number=2, animal_type='गाई (Cow)', symptoms='उच्च ज्वरो, दानापानी नखाने, दुध उत्पादनमा भारी गिरावट', suspected_disease='थुनेलो (Mastitis)', prescribed_medicine='इन्ट्राम्यामारी ट्युब + एन्टिबायोटिक पेन्सिलिन', dosage_instructions='बिहान-बेलुका थुन सफा गरी ट्युब चढाउने', doctor_technician='रामेश्वर थापा (पशु प्राविधिक)', date_bs='२०८१/०६/०८', follow_up_date_bs='२०८१/०६/१५', status='निको भएको (Recovered)', created_at=datetime.utcnow()),
                VetDiagnosisRecord(id='DX-2081-502', farmer_name='पेम्बा दोर्जे तामाङ', ward_number=1, animal_type='चौँरी (Chauri)', symptoms='पेट फुल्ने, छटपटाउने, सास फेर्न गाह्रो', suspected_disease='टिम्प्यानी (Bloat / Tympany)', prescribed_medicine='ब्लोटोसिल (Bloatosil) + तरल प्याराफिन', dosage_instructions='तत्काल १०० मिलि मुखबाट खुवाउने', doctor_technician='डा. सञ्जय श्रेष्ठ (पशु चिकित्सक)', date_bs='२०८१/०६/१४', follow_up_date_bs='२०८१/०६/१६', status='उपचार जारी (Under Treatment)', created_at=datetime.utcnow())
            ]
            db.add_all(seeds)
            db.commit()
            query = db.query(VetDiagnosisRecord)
        if ward:
            query = query.filter(VetDiagnosisRecord.ward_number == ward)
        records = query.order_by(desc(VetDiagnosisRecord.created_at)).all()
        return [r.to_dict() for r in records]
    except Exception as e:
        print("get_vet_diagnoses error:", e)
        return []


@router.post("/vet-diagnoses")
def create_vet_diagnosis(payload: VetDiagnosisRecordCreate, db: Session = Depends(get_db)):
    record_id = payload.id or f"DX-2081-{uuid.uuid4().hex[:4].upper()}"
    new_rec = VetDiagnosisRecord(
        id=record_id,
        farmer_name=payload.farmerName,
        ward_number=payload.wardNumber,
        animal_type=payload.animalType,
        symptoms=payload.symptoms,
        suspected_disease=payload.suspectedDisease,
        prescribed_medicine=payload.prescribedMedicine,
        dosage_instructions=payload.dosageInstructions,
        doctor_technician=payload.doctorTechnician,
        date_bs=payload.dateBs,
        follow_up_date_bs=payload.followUpDateBs,
        status=payload.status or "उपचार जारी (Under Treatment)",
        created_at=datetime.utcnow()
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec.to_dict()


@router.put("/vet-diagnoses/{id}")
def update_vet_diagnosis(id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    rec = db.query(VetDiagnosisRecord).filter(VetDiagnosisRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Diagnosis Record not found")

    for k, v in payload.items():
        if hasattr(rec, k):
            setattr(rec, k, v)
        elif k == "farmerName":
            rec.farmer_name = v
        elif k == "wardNumber":
            rec.ward_number = v
        elif k == "animalType":
            rec.animal_type = v
        elif k == "suspectedDisease":
            rec.suspected_disease = v
        elif k == "prescribedMedicine":
            rec.prescribed_medicine = v
        elif k == "dosageInstructions":
            rec.dosage_instructions = v
        elif k == "doctorTechnician":
            rec.doctor_technician = v
        elif k == "dateBs":
            rec.date_bs = v
        elif k == "followUpDateBs":
            rec.follow_up_date_bs = v

    db.commit()
    db.refresh(rec)
    return rec.to_dict()


@router.delete("/vet-diagnoses/{id}")
def delete_vet_diagnosis(id: str, db: Session = Depends(get_db)):
    rec = db.query(VetDiagnosisRecord).filter(VetDiagnosisRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Diagnosis Record not found")
    db.delete(rec)
    db.commit()
    return {"deleted": True, "id": id}


# ==========================================
# 8. Veterinary Analytics & Summary (KPIs)
# ==========================================

@router.get("/vet-summary")
def get_vet_summary(db: Session = Depends(get_db)):
    medicines = db.query(AgricultureVetMedicine).all()
    distributions = db.query(AgricultureVetDistribution).all()
    ai_records = db.query(VetAiRecord).all()
    vaccinations = db.query(VetVaccinationRecord).all()
    diagnoses = db.query(VetDiagnosisRecord).all()

    now_date = datetime.utcnow().date()
    expiring_threshold = now_date + timedelta(days=45)

    total_stock = sum(m.stock_quantity or 0 for m in medicines)
    low_stock = [m for m in medicines if (m.stock_quantity or 0) < 10]
    expiring = [m for m in medicines if m.expiry_date and m.expiry_date <= expiring_threshold]

    ai_confirmed = [a for a in ai_records if "सफल" in (a.status or "") or "Confirmed" in (a.status or "")]
    under_treatment = [d for d in diagnoses if "जारी" in (d.status or "") or "Treatment" in (d.status or "")]

    return {
        "totalMedicines": len(medicines),
        "totalStock": total_stock,
        "lowStockCount": len(low_stock),
        "expiringSoonCount": len(expiring),
        "totalDistributions": len(distributions),
        "totalBeneficiaries": len({d.farmer_id for d in distributions if d.farmer_id}),
        "totalAiRecords": len(ai_records),
        "aiSuccessCount": len(ai_confirmed),
        "aiSuccessRate": round((len(ai_confirmed) / len(ai_records) * 100), 1) if ai_records else 0,
        "totalVaccinations": len(vaccinations),
        "totalDiagnoses": len(diagnoses),
        "underTreatmentCount": len(under_treatment)
    }


# ==========================================
# 9. Agri Market Items & Daily Wholesale Prices
# ==========================================

@router.get("/market-items")
def get_market_items(db: Session = Depends(get_db)):
    items = db.query(AgricultureMarketItem).order_by(AgricultureMarketItem.category.asc(), AgricultureMarketItem.item_name.asc()).all()
    return [i.to_dict() for i in items]


@router.post("/market-items")
def create_market_item(payload: Dict[str, Any], db: Session = Depends(get_db)):
    new_item = AgricultureMarketItem(
        id=uuid.uuid4(),
        item_name=payload.get("itemName", "नयाँ वस्तु"),
        category=payload.get("category", "तरकारी"),
        unit=payload.get("unit", "Kg"),
        icon=payload.get("icon"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item.to_dict()


@router.get("/market-prices")
def get_market_prices(date: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AgricultureMarketPrice)
    target_date = safe_date(date)
    if target_date:
        query = query.filter(AgricultureMarketPrice.date == target_date)
    else:
        latest_date = db.query(func.max(AgricultureMarketPrice.date)).scalar()
        if latest_date:
            query = query.filter(AgricultureMarketPrice.date == latest_date)

    prices = query.order_by(desc(AgricultureMarketPrice.date)).all()
    item_ids = {p.item_id for p in prices if p.item_id}
    item_map = {}
    if item_ids:
        items = db.query(AgricultureMarketItem).filter(AgricultureMarketItem.id.in_(item_ids)).all()
        item_map = {i.id: i.to_dict() for i in items}

    return [p.to_dict(item_dict=item_map.get(p.item_id)) for p in prices]


@router.post("/market-prices")
def record_market_price(payload: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        item_uuid = uuid.UUID(payload.get("itemId"))
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid item UUID")

    price_date = safe_date(payload.get("date")) or datetime.utcnow().date()
    min_p = float(payload.get("minPrice") or payload.get("wholesalePrice") or 0)
    max_p = float(payload.get("maxPrice") or payload.get("retailPrice") or min_p)
    avg_p = float(payload.get("averagePrice") or ((min_p + max_p) / 2))

    existing = db.query(AgricultureMarketPrice).filter(
        AgricultureMarketPrice.item_id == item_uuid,
        AgricultureMarketPrice.date == price_date
    ).first()

    if existing:
        existing.min_price = min_p
        existing.max_price = max_p
        existing.average_price = avg_p
        db.commit()
        db.refresh(existing)
        item = db.query(AgricultureMarketItem).filter(AgricultureMarketItem.id == item_uuid).first()
        return existing.to_dict(item_dict=item.to_dict() if item else None)

    new_price = AgricultureMarketPrice(
        id=uuid.uuid4(),
        item_id=item_uuid,
        date=price_date,
        min_price=min_p,
        max_price=max_p,
        average_price=avg_p,
        created_at=datetime.utcnow()
    )
    db.add(new_price)
    db.commit()
    db.refresh(new_price)

    item = db.query(AgricultureMarketItem).filter(AgricultureMarketItem.id == item_uuid).first()
    return new_price.to_dict(item_dict=item.to_dict() if item else None)


# ==========================================
# 10. Agri Advisories & Weather / Pest Alerts
# ==========================================

@router.get("/advisories")
def get_agri_advisories(activeOnly: Optional[bool] = False, db: Session = Depends(get_db)):
    query = db.query(AgricultureAdvisory)
    if activeOnly:
        today = datetime.utcnow().date()
        query = query.filter((AgricultureAdvisory.valid_until.is_(None)) | (AgricultureAdvisory.valid_until >= today))

    advisories = query.order_by(desc(AgricultureAdvisory.issued_date)).all()
    return [a.to_dict() for a in advisories]


@router.post("/advisories")
def create_agri_advisory(payload: Dict[str, Any], db: Session = Depends(get_db)):
    new_adv = AgricultureAdvisory(
        id=uuid.uuid4(),
        title=payload.get("title", "कृषि तथा मौसमी सूचना"),
        content=payload.get("content", ""),
        advisory_type=payload.get("advisoryType", "weather"),
        valid_until=safe_date(payload.get("validUntil")),
        issued_by=payload.get("issuedBy", "पाँचपोखरी थाङपाल गाउँपालिका कृषि विकास शाखा"),
        issued_date=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_adv)
    db.commit()
    db.refresh(new_adv)
    return new_adv.to_dict()


@router.put("/advisories/{advisory_id}")
def update_agri_advisory(advisory_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        aid = uuid.UUID(advisory_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid advisory UUID")

    adv = db.query(AgricultureAdvisory).filter(AgricultureAdvisory.id == aid).first()
    if not adv:
        raise HTTPException(status_code=404, detail="Advisory not found")

    if "title" in payload: adv.title = payload["title"]
    if "content" in payload: adv.content = payload["content"]
    if "advisoryType" in payload: adv.advisory_type = payload["advisoryType"]
    if "validUntil" in payload: adv.valid_until = safe_date(payload["validUntil"])
    if "issuedBy" in payload: adv.issued_by = payload["issuedBy"]

    adv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(adv)
    return adv.to_dict()


@router.delete("/advisories/{advisory_id}")
def delete_agri_advisory(advisory_id: str, db: Session = Depends(get_db)):
    try:
        aid = uuid.UUID(advisory_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid advisory UUID")

    adv = db.query(AgricultureAdvisory).filter(AgricultureAdvisory.id == aid).first()
    if not adv:
        raise HTTPException(status_code=404, detail="Advisory not found")

    db.delete(adv)
    db.commit()
    return {"deleted": True, "id": advisory_id}



@router.get('/farmers/stats')
def get_agriculture_farmers_stats():
    return {'total': 0}
