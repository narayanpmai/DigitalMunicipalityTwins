from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
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
    request: Request,
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    eff_tenant = (tenant_id or x_tenant_id or "").strip()
    if not eff_tenant:
        from api.routers.auth import _get_token_payload
        from models.user import User
        payload = _get_token_payload(request)
        if payload and payload.get("sub"):
            u = db.query(User).filter(User.id == payload.get("sub"), User.deleted_at == None).first()
            if u and u.tenant_id and u.tenant_id not in ("all", "*"):
                eff_tenant = u.tenant_id

    query = db.query(Ward)
    if eff_tenant and eff_tenant not in ["panchpokhari", "default", "localhost", "all", "digitaltwin", "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"]:
        if eff_tenant in ["gaushala", "gaushalamun", "gaushala_municipality"]:
            wards = query.filter(Ward.tenant_id == "gaushala").order_by(Ward.ward_number).all()
        else:
            wards = query.filter(Ward.tenant_id == eff_tenant).order_by(Ward.ward_number).all()
        if not wards:
            if eff_tenant in ["khadadevi", "khandadevi"]:
                KHADADEVI_OFFICIAL_WARDS = [
                    {"ward": 1, "name": "राकाथुम", "chair": "राम कुमार श्रेष्ठ", "pop": 2602, "male": 1225, "female": 1377, "hh": 742, "phone": "०६०-४२०१०१"},
                    {"ward": 2, "name": "मझुवा", "chair": "केशव कुमार प्रधान", "pop": 1476, "male": 666, "female": 810, "hh": 421, "phone": "०६०-४२०१०२"},
                    {"ward": 3, "name": "भीरपानी (सित्खा/गाल्पा)", "chair": "पुष्कर कुमार कार्की", "pop": 2377, "male": 1091, "female": 1286, "hh": 677, "phone": "०६०-४२०१०३"},
                    {"ward": 4, "name": "आमडाँडा (भीरपानी/पकरबास)", "chair": "कृष्ण प्रसाद पौडेल", "pop": 3128, "male": 1503, "female": 1625, "hh": 891, "phone": "०६०-४२०१०४"},
                    {"ward": 5, "name": "पकरबास", "chair": "मनोज पौडेल", "pop": 1949, "male": 912, "female": 1037, "hh": 555, "phone": "०६०-४२०१०५"},
                    {"ward": 6, "name": "माकादुम (गाउँपालिका केन्द्र)", "chair": "नारायण कार्की", "pop": 1601, "male": 743, "female": 858, "hh": 456, "phone": "०६०-४२०१०६"},
                    {"ward": 7, "name": "खाँडादेवी (ऐतिहासिक मन्दिर)", "chair": "सिरे तामाङ", "pop": 3003, "male": 1405, "female": 1598, "hh": 855, "phone": "०६०-४२०१०७"},
                    {"ward": 8, "name": "गागल–भदौरे", "chair": "जङ्ग लाल तामाङ", "pop": 1722, "male": 795, "female": 927, "hh": 490, "phone": "०६०-४२०१०८"},
                    {"ward": 9, "name": "पिङ्खुरी", "chair": "अकल बहादुर भण्डारी", "pop": 1454, "male": 655, "female": 799, "hh": 414, "phone": "०६०-४२०१०९"}
                ]
                for w in KHADADEVI_OFFICIAL_WARDS:
                    db.add(Ward(
                        id=uuid.uuid4(),
                        tenant_id=eff_tenant,
                        ward_number=w["ward"],
                        name=f"वडा नं. {w['ward']} ({w['name']})",
                        ward_chair_name=w["chair"],
                        chairperson=w["chair"],
                        secretary="वडा सचिव",
                        phone=w["phone"],
                        population=w["pop"],
                        total_population=w["pop"],
                        male_population=w["male"],
                        female_population=w["female"],
                        households=w["hh"],
                        schools=5,
                        health_posts=1,
                        is_active=True
                    ))
            elif eff_tenant in ["gaushala", "gaushalamun", "gaushala_municipality"]:
                GAUSHALA_OFFICIAL_WARDS = [
                    {"ward": 1, "name": "रामनगर (उत्तरी क्षेत्र)", "chair": "नविन कुमार साह", "pop": 7638, "male": 3845, "female": 3793, "hh": 1520, "phone": "९८५४०३४५८१"},
                    {"ward": 2, "name": "निगौल (बजार क्षेत्र)", "chair": "श्याम सुन्दर मण्डल", "pop": 8613, "male": 4166, "female": 4447, "hh": 1715, "phone": "९८५४०३४५८२"},
                    {"ward": 3, "name": "बेलगाछी (उत्तरी बस्ती)", "chair": "बिरेन्द्र चौधरी", "pop": 4234, "male": 2148, "female": 2086, "hh": 843, "phone": "९८५४०३४५८३"},
                    {"ward": 4, "name": "रजखोर / भरतपुर", "chair": "राम नारायण महासेठ", "pop": 8194, "male": 4138, "female": 4056, "hh": 1632, "phone": "९८५४०३४५८४"},
                    {"ward": 5, "name": "गौशाला बजार (केन्द्र)", "chair": "ओम प्रकाश गुप्ता", "pop": 7702, "male": 3916, "female": 3786, "hh": 1534, "phone": "९८५४०३४५८५"},
                    {"ward": 6, "name": "फुलकाहा", "chair": "राम स्वार्थ यादव", "pop": 3180, "male": 1615, "female": 1565, "hh": 633, "phone": "९८५४०३४५८६"},
                    {"ward": 7, "name": "मनहर्वा", "chair": "मनोज चौधरी", "pop": 4446, "male": 2243, "female": 2203, "hh": 885, "phone": "९८५४०३४५८७"},
                    {"ward": 8, "name": "कुसमारी / रामनगर", "chair": "भोज बहादुर दर्लामी", "pop": 5827, "male": 2916, "female": 2911, "hh": 1160, "phone": "९८५४०३४५८८"},
                    {"ward": 9, "name": "डुमरिया", "chair": "बद्रि प्रसाद दनुवार", "pop": 5822, "male": 2885, "female": 2937, "hh": 1159, "phone": "९८५४०३४५८९"},
                    {"ward": 10, "name": "भरतपुर / बटौवा", "chair": "बिष्णु कुमार महतो", "pop": 6236, "male": 3085, "female": 3151, "hh": 1242, "phone": "९८५४०३४५९०"},
                    {"ward": 11, "name": "लक्ष्मीनिया", "chair": "राम पृत महतो कोईरी", "pop": 5833, "male": 2901, "female": 2932, "hh": 1162, "phone": "९८५४०३४५९१"},
                    {"ward": 12, "name": "कान्तिबजार", "chair": "कुशेश्वर सिंह", "pop": 4756, "male": 2392, "female": 2364, "hh": 961, "phone": "९८५४०३४५९२"}
                ]
                for w in GAUSHALA_OFFICIAL_WARDS:
                    db.add(Ward(
                        id=uuid.uuid4(),
                        tenant_id=eff_tenant,
                        ward_number=w["ward"],
                        name=f"वडा नं. {w['ward']} ({w['name']})",
                        ward_chair_name=w["chair"],
                        chairperson=w["chair"],
                        secretary="वडा सचिव",
                        phone=w["phone"],
                        population=w["pop"],
                        total_population=w["pop"],
                        male_population=w["male"],
                        female_population=w["female"],
                        households=w["hh"],
                        schools=5,
                        health_posts=1,
                        is_active=True
                    ))
            else:
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
