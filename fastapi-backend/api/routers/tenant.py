from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict
from core.database import get_db
from models.tenant import Tenant
from models.municipality import MunicipalityProfile
from models.setting import SystemSetting
from models.ward import Ward
from models.user import User, UserRole
from core.security import hash_password
from schemas.tenant import TenantSchema, TenantCreate, TenantUpdate, TenantResponse
from datetime import datetime
import uuid
import re

router = APIRouter(
    prefix="/api/v1/tenants",
    tags=["Tenants (Multi-tenancy)"]
)

DEFAULT_TENANTS = [
    {
        "id": "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06",
        "subdomain": "panchpokhari",
        "name_np": "पाँचपोखरी थाङपाल गाउँपालिका",
        "name_en": "Panchpokhari Thangpal Rural Municipality",
        "logo_url": "/images/p5-logo.png",
        "status": "active"
    },
    {
        "id": "a18b3cde-92be-5f38-bf00-2b76f15fa017",
        "subdomain": "helambu",
        "name_np": "हेलम्बु गाउँपालिका",
        "name_en": "Helambu Rural Municipality",
        "logo_url": "/images/helambu-logo.png",
        "status": "active"
    }
]

def seed_tenants_if_empty(db: Session):
    count = db.query(Tenant).count()
    if count == 0:
        for t in DEFAULT_TENANTS:
            db_t = Tenant(**t)
            db.add(db_t)
        db.commit()

def enrich_tenant_dict(t: Tenant, db: Session) -> Dict[str, Any]:
    """Helper to ensure all tenant objects have province, district, nameNp, and nameEn populated."""
    prof = db.query(MunicipalityProfile).filter(
        (MunicipalityProfile.tenant_id == t.subdomain) | 
        (MunicipalityProfile.tenant_id == t.id) |
        (MunicipalityProfile.name_np == t.name_np)
    ).first()

    province = (prof.province if prof and prof.province else None) or "बागमती प्रदेश"
    district = (prof.district if prof and prof.district else None)
    if not district:
        if t.subdomain in ["panchpokhari", "helambu", "melamchi", "indrawati"]:
            district = "सिन्धुपाल्चोक"
        elif "धादिङ" in (t.name_np or "") or t.subdomain in ["benighatrorang", "benighat", "benighat_rorang"]:
            district = "धादिङ"
        else:
            district = ""

    return {
        "id": str(t.id),
        "subdomain": t.subdomain,
        "nameNp": t.name_np,
        "name_np": t.name_np,
        "nameEn": t.name_en or t.subdomain,
        "name_en": t.name_en or t.subdomain,
        "province": province,
        "district": district,
        "logoUrl": t.logo_url or "",
        "logo_url": t.logo_url or "",
        "status": t.status or "active",
        "createdAt": t.created_at,
        "updatedAt": t.updated_at,
    }

@router.get("", response_model=List[TenantSchema])
def get_tenants(db: Session = Depends(get_db)):
    seed_tenants_if_empty(db)
    all_tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).all()
    result = []
    seen_names = set()
    for t in all_tenants:
        name_key = (t.name_np or "").strip()
        if name_key and name_key in seen_names:
            continue
        if name_key:
            seen_names.add(name_key)
        result.append(enrich_tenant_dict(t, db))
    return result

@router.get("/current", response_model=TenantSchema)
def get_current_tenant(
    request: Request,
    subdomain: Optional[str] = Query(None, description="Tenant subdomain identifier"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    seed_tenants_if_empty(db)
    eff_subdomain = (subdomain or x_tenant_id or "").strip()

    if not eff_subdomain:
        from api.routers.auth import _get_token_payload
        payload = _get_token_payload(request)
        if payload and payload.get("sub"):
            u = db.query(User).filter(User.id == payload.get("sub"), User.deleted_at == None).first()
            if u and u.tenant_id and u.tenant_id not in ("all", "*"):
                eff_subdomain = u.tenant_id

    if not eff_subdomain:
        eff_subdomain = "panchpokhari"

    tenant = db.query(Tenant).filter(
        (Tenant.subdomain == eff_subdomain) | (Tenant.id == eff_subdomain)
    ).first()
    if not tenant:
        tenant = db.query(Tenant).filter(Tenant.subdomain == "panchpokhari").first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Current tenant not found")
    return enrich_tenant_dict(tenant, db)

@router.get("/{id}", response_model=TenantSchema)
def get_tenant(id: str, db: Session = Depends(get_db)):
    seed_tenants_if_empty(db)
    tenant = db.query(Tenant).filter(
        (Tenant.id == id) | (Tenant.subdomain == id)
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return enrich_tenant_dict(tenant, db)

@router.post("/register")
def register_tenant(data: TenantCreate, db: Session = Depends(get_db)):
    """नयाँ पालिका दर्ता गर्नुहोस् र स्वचालित रूपमा सम्पूर्ण डिजिटल प्रोफाइल, सेटिङ तथा वडाहरू सिर्जना गर्नुहोस्"""
    name_np = (data.name_np or data.nameNp or "").strip()
    name_en = (data.name_en or data.nameEn or "").strip()
    subdomain = (data.subdomain or "").strip().lower()
    province = (data.province or "बागमती प्रदेश").strip()
    district = (data.district or "").strip()
    admin_email = (data.admin_email or data.adminEmail or "").strip()

    if not name_np:
        raise HTTPException(status_code=400, detail="पालिकाको नाम अनिवार्य छ।")

    if not subdomain and name_en:
        subdomain = re.sub(r'[^a-z0-9]', '', name_en.lower())
    if not subdomain:
        subdomain = f"palika-{int(datetime.utcnow().timestamp())}"

    # Check existence
    exists = db.query(Tenant).filter(Tenant.subdomain == subdomain).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"पालिका सबडोमेन '{subdomain}' पहिले नै दर्ता भइसकेको छ।")

    # Clean official name formatting
    palika_type = "गाउँपालिका"
    if any(k in name_np for k in ["महानगरपालिका", "उपमहानगरपालिका", "नगरपालिका"]):
        if "महानगरपालिका" in name_np:
            palika_type = "महानगरपालिका"
        elif "उपमहानगरपालिका" in name_np:
            palika_type = "उपमहानगरपालिका"
        elif "नगरपालिका" in name_np:
            palika_type = "नगरपालिका"
        clean_name_np = name_np
    else:
        clean_name_np = f"{name_np} गाउँपालिका"

    if not name_en:
        name_en = subdomain.replace('-', ' ').title()
    
    clean_name_en = name_en
    if "Municipality" not in clean_name_en and "Rural" not in clean_name_en:
        clean_name_en = f"{clean_name_en} Rural Municipality" if palika_type == "गाउँपालिका" else f"{clean_name_en} Municipality"

    tenant_id = str(uuid.uuid4())
    db_tenant = Tenant(
        id=tenant_id,
        subdomain=subdomain,
        name_np=clean_name_np,
        name_en=clean_name_en,
        logo_url=data.logo_url or data.logoUrl or "/images/p5-logo.png",
        status=data.status or "active"
    )
    db.add(db_tenant)

    # ──────────────────────────────────────────────────────────────────────────
    # 1. AUTOMATIC PROFILE GENERATION (स्वचालित डिजिटल प्रोफाइल सिर्जना)
    # ──────────────────────────────────────────────────────────────────────────
    existing_prof = db.query(MunicipalityProfile).filter(
        (MunicipalityProfile.tenant_id == subdomain) | (MunicipalityProfile.name_np == clean_name_np)
    ).first()

    if not existing_prof:
        auto_profile = MunicipalityProfile(
            id=str(uuid.uuid4()),
            tenant_id=subdomain,
            name_np=clean_name_np,
            name_en=clean_name_en,
            district=district or "सिन्धुपाल्चोक",
            province=province or "बागमती प्रदेश",
            type=palika_type,
            headquarters=f"{name_np} केन्द्र, {district}",
            ward_count=8,
            area_sq_km=154.25,
            elevation_meters="५५० मी. देखि २,६०० मी.",
            introduction=(
                f"{clean_name_np} नेपालको {province} अन्तर्गत {district} जिल्लामा अवस्थित "
                f"प्राकृतिक, पर्यटकीय, कृषि तथा ऐतिहासिक सम्पदाले समृद्ध स्थानीय तह हो। "
                f"नागरिक सेवा प्रवाहलाई द्रुत, पारदर्शी तथा प्रविधिमैत्री बनाउन म्युनिसिपल डिजिटल ट्विन्स प्रणाली स्थापना गरिएको छ।"
            ),
            total_population=24500,
            total_households=5600,
            total_schools=32,
            total_health_posts=8,
            geography=f"{district} जिल्लाको पहाडी तथा नदी तटीय भूभाग",
            major_rivers="स्थानीय नदी, खोलानाला तथा जलाधार",
            major_religious_sites=f"{clean_name_np} क्षेत्रका ऐतिहासिक मन्दिर, गुम्बा तथा धार्मिक स्थल",
            major_tourist_sites=f"{clean_name_np} पदमार्ग, भ्यु-पोइन्ट तथा पर्यटकीय गन्तव्य",
            annual_budget="रु. ५२.३० करोड",
            internal_revenue="रु. २.१५ करोड",
            boundaries={
                "east": f"{district} छिमेकी पालिका",
                "west": f"{district} छिमेकी पालिका",
                "north": f"{district} उत्तरी भूभाग",
                "south": f"{district} दक्षिणी सिमाना"
            },
            cultural_identity=[
                {
                    "title": f"{clean_name_np} मौलिक कला तथा संस्कृति",
                    "desc": f"{district} जिल्लाको परम्परागत चाडपर्व, भेषभूषा तथा सांस्कृतिक धरोहर।",
                    "icon": "mountain",
                    "color": "#1e40af"
                },
                {
                    "title": "कृषि तथा जैविक उत्पादन",
                    "desc": "स्थानीय कृषि बाली, फलफूल खेती, पशुपालन तथा जैविक उत्पादन।",
                    "icon": "apple",
                    "color": "#059669"
                },
                {
                    "title": "प्राकृतिक सौन्दर्य तथा पर्यटन",
                    "desc": "हरियाली पहाडी सौन्दर्य, नदी किनारा तथा पर्यटकीय पदमार्गहरू।",
                    "icon": "waves",
                    "color": "#059669"
                }
            ],
            good_practices=[
                {"title": "डिजिटल सेवा प्रवाह", "desc": "अनलाइन सिफारिस, डिजिटल नागरिक बडापत्र तथा ई-गभर्नेन्स लागू।"},
                {"title": "नागरिक गुनासो द्रुत सम्बोधन", "desc": "नागरिकका गुनासोको तत्काल दर्ता र समाधान प्रक्रिया।"},
                {"title": "दिगो विकास आयोजना", "desc": "सबै वडामा सन्तुलित पूर्वाधार र सहभागितामूलक योजना कार्यान्वयन।"}
            ],
            demographics={
                "totalPopulation": 24500,
                "male": 12100,
                "female": 12400,
                "households": 5600,
                "totalGpsHouses": 5150,
                "highRiskHouses": 72,
                "literacyRate": 68.5,
                "maleLiteracyRate": 74.2,
                "femaleLiteracyRate": 62.8,
                "economicallyActive": 9800,
                "averageFamilySize": 4.37,
                "sexRatio": 97.6,
                "density": 158.8
            },
            ai_summary=(
                f"{clean_name_np} {province}को {district} जिल्लामा अवस्थित गतिशील स्थानीय तह हो। "
                f"डिजिटल ट्विन प्रणालीमार्फत यस पालिकाको सम्पूर्ण कमान्ड, पूर्वाधार तथा नागरिक सेवा एकीकृत गरिएको छ।"
            )
        )
        db.add(auto_profile)

    # ──────────────────────────────────────────────────────────────────────────
    # 2. AUTOMATIC SYSTEM SETTINGS (प्रणाली सेटिङ्स स्थापना)
    # ──────────────────────────────────────────────────────────────────────────
    settings_to_seed = [
        ("palika_name", clean_name_np),
        ("palika_name_en", clean_name_en),
        ("province", province),
        ("district", district),
        ("headquarters", f"{name_np} केन्द्र, {district}"),
        ("admin_email", admin_email or f"admin@{subdomain}.gov.np"),
        ("email", admin_email or f"info@{subdomain}.gov.np"),
        ("phone", "०१-XXXXXX"),
        ("website", f"https://{subdomain}.digitaltwin.gov.np"),
        ("address", f"गाउँ कार्यपालिकाको कार्यालय, {clean_name_np}, {district}"),
        ("slogan", "आधुनिक, सुशासनयुक्त र समृद्ध पालिका"),
        ("total_wards", "8"),
        ("active_fiscal_year", "२०८१/०८२"),
    ]
    for key, val in settings_to_seed:
        db.add(SystemSetting(
            id=str(uuid.uuid4()),
            tenant_id=subdomain,
            key=key,
            value=val,
            description=f"Auto-generated configuration for {subdomain}"
        ))

    # ──────────────────────────────────────────────────────────────────────────
    # 3. AUTOMATIC DEFAULT WARDS SEEDING (८ वटा वडाहरू स्वतः सिर्जना)
    # ──────────────────────────────────────────────────────────────────────────
    for w_num in range(1, 9):
        w_id = uuid.uuid4()
        new_ward = Ward(
            id=w_id,
            tenant_id=subdomain,
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
        db.add(new_ward)

    # ──────────────────────────────────────────────────────────────────────────
    # 4. AUTOMATIC ADMIN USER SEEDING (पालिका प्रशासक खाता सिर्जना)
    # ──────────────────────────────────────────────────────────────────────────
    if admin_email:
        existing_u = db.query(User).filter(User.email == admin_email, User.tenant_id == subdomain).first()
        if not existing_u:
            hashed_pwd = hash_password("Admin@123")
            admin_user = User(
                id=str(uuid.uuid4()),
                tenant_id=subdomain,
                email=admin_email,
                password=hashed_pwd,
                full_name=f"{clean_name_np} प्रशासक",
                role=UserRole.ADMIN,
                is_active=True,
                email_verified=True
            )
            db.add(admin_user)

    db.commit()
    db.refresh(db_tenant)

    enriched = enrich_tenant_dict(db_tenant, db)
    return {
        "success": True,
        "message": f"पालिका '{clean_name_np}' र यसको डिजिटल प्रोफाइल सफलतापूर्वक सिर्जना भयो!",
        "data": enriched,
        **enriched
    }

@router.put("/{id}", response_model=TenantSchema)
def update_tenant(id: str, data: TenantUpdate, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(
        (Tenant.id == id) | (Tenant.subdomain == id)
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    update_data = data.model_dump(exclude_unset=True)
    if "nameNp" in update_data and not update_data.get("name_np"):
        update_data["name_np"] = update_data["nameNp"]
    if "nameEn" in update_data and not update_data.get("name_en"):
        update_data["name_en"] = update_data["nameEn"]
    if "logoUrl" in update_data and not update_data.get("logo_url"):
        update_data["logo_url"] = update_data["logoUrl"]

    for key, value in update_data.items():
        if hasattr(tenant, key) and value is not None:
            setattr(tenant, key, value)
        
    db.commit()
    db.refresh(tenant)
    return enrich_tenant_dict(tenant, db)

@router.post("/{id}/toggle-status", response_model=TenantSchema)
def toggle_tenant_status(id: str, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(
        (Tenant.id == id) | (Tenant.subdomain == id)
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    tenant.status = "inactive" if tenant.status == "active" else "active"
    db.commit()
    db.refresh(tenant)
    return enrich_tenant_dict(tenant, db)

