from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from core.database import get_db
from models.setting import SystemSetting
from schemas.setting import SettingSchema, SettingCreate, SettingUpdate
import uuid

router = APIRouter(
    prefix="/api/v1/settings",
    tags=["Settings (System Configuration)"]
)

TENANT_SETTING_DEFAULTS: Dict[str, Dict[str, str]] = {
    "panchpokhari": {
        "palika_name": "पाँचपोखरी थाङपाल गाउँपालिका",
        "palika_name_en": "Panchpokhari Thangpal Rural Municipality",
        "slogan": "आधुनिक, सुशासनयुक्त र समृद्ध पालिका",
        "province": "बागमती प्रदेश",
        "district": "सिन्धुपाल्चोक",
        "headquarters": "थाङपालधाप, मानेखर्क",
        "email": "info@panchpokharimun.gov.np",
        "phone": "०११-६९०१२३",
        "website": "https://panchpokharimun.gov.np",
        "address": "गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप, सिन्धुपाल्चोक",
        "total_wards": "8",
        "logo_url": "/panchpokhari-logo.png",
    },
    "helambu": {
        "palika_name": "हेलम्बु गाउँपालिका",
        "palika_name_en": "Helambu Rural Municipality",
        "slogan": "प्रकृति, संस्कृति र समृद्धिको पालिका",
        "province": "बागमती प्रदेश",
        "district": "सिन्धुपाल्चोक",
        "headquarters": "मेलम्ची",
        "email": "info@helambu.gov.np",
        "phone": "",
        "website": "https://helambu.gov.np",
        "address": "गाउँ कार्यपालिकाको कार्यालय, हेलम्बु, सिन्धुपाल्चोक",
        "total_wards": "7",
        "logo_url": "",
    },
    "melamchi": {
        "palika_name": "मेलम्ची नगरपालिका",
        "palika_name_en": "Melamchi Municipality",
        "slogan": "विकास, सेवा र सुशासन",
        "province": "बागमती प्रदेश",
        "district": "सिन्धुपाल्चोक",
        "headquarters": "मेलम्ची",
        "email": "info@melamchimun.gov.np",
        "phone": "",
        "website": "https://melamchimun.gov.np",
        "address": "नगर कार्यपालिकाको कार्यालय, मेलम्ची, सिन्धुपाल्चोक",
        "total_wards": "12",
        "logo_url": "",
    },
    "indrawati": {
        "palika_name": "इन्द्रावती गाउँपालिका",
        "palika_name_en": "Indrawati Rural Municipality",
        "slogan": "सेवा र विकासको पालिका",
        "province": "बागमती प्रदेश",
        "district": "सिन्धुपाल्चोक",
        "headquarters": "चौतारा",
        "email": "info@indrawati.gov.np",
        "phone": "",
        "website": "",
        "address": "गाउँ कार्यपालिकाको कार्यालय, इन्द्रावती, सिन्धुपाल्चोक",
        "total_wards": "6",
        "logo_url": "",
    },
    "gaushala": {
        "palika_name": "गौशाला नगरपालिका",
        "palika_name_en": "Gaushala Municipality",
        "slogan": "कृषि, उद्योग र समृद्धिको सहर: हाम्रो गौशाला नगर",
        "province": "मधेश प्रदेश",
        "district": "महोत्तरी",
        "headquarters": "गौशाला बजार, महोत्तरी",
        "email": "gaushalamun@gmail.com",
        "phone": "०४४-५८०१११",
        "website": "https://gaushalamun.gov.np",
        "address": "नगर कार्यपालिकाको कार्यालय, गौशाला, महोत्तरी, मधेश प्रदेश",
        "total_wards": "12",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png",
    },
    "gaushalamun": {
        "palika_name": "गौशाला नगरपालिका",
        "palika_name_en": "Gaushala Municipality",
        "slogan": "कृषि, उद्योग र समृद्धिको सहर: हाम्रो गौशाला नगर",
        "province": "मधेश प्रदेश",
        "district": "महोत्तरी",
        "headquarters": "गौशाला बजार, महोत्तरी",
        "email": "gaushalamun@gmail.com",
        "phone": "०४४-५८०१११",
        "website": "https://gaushalamun.gov.np",
        "address": "नगर कार्यपालिकाको कार्यालय, गौशाला, महोत्तरी, मधेश प्रदेश",
        "total_wards": "12",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png",
    },
    "khadadevi": {
        "palika_name": "खाँडादेवी गाउँपालिका",
        "palika_name_en": "Khandadevi Rural Municipality",
        "slogan": "सुन्दर, सभ्य र समृद्ध खाँडादेवी !!!",
        "province": "बागमती प्रदेश",
        "district": "रामेछाप",
        "headquarters": "माकादुम, रामेछाप",
        "email": "khandadevimunicipality@gmail.com",
        "phone": "०६०-४२०१०६",
        "website": "https://khandadevimun.gov.np",
        "address": "गाउँ कार्यपालिकाको कार्यालय, माकादुम, रामेछाप",
        "total_wards": "9",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png",
    },
    "benighatrorang": {
        "palika_name": "बेनिघाट रोराङ्ग गाउँपालिका",
        "palika_name_en": "Benighat Rorang Rural Municipality",
        "slogan": "कृषि, पर्यटन र पूर्वाधार: समृद्ध बेनीघाट रोराङ्गको आधार",
        "province": "बागमती प्रदेश",
        "district": "धादिङ",
        "headquarters": "विशालटार, धादिङ",
        "email": "benighatrorangmun@gmail.com",
        "phone": "०१०-५२९००१",
        "website": "https://benighatrorangmun.gov.np",
        "address": "गाउँ कार्यपालिकाको कार्यालय, विशालटार, धादिङ",
        "total_wards": "10",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png",
    },
    "galchhi": {
        "palika_name": "गल्छी गाउँपालिका",
        "palika_name_en": "Galchhi Rural Municipality",
        "slogan": "कृषि, पर्यटन र पूर्वाधार: समृद्ध गल्छीको आधार",
        "province": "बागमती प्रदेश",
        "district": "धादिङ",
        "headquarters": "बैरेनी, धादिङ",
        "email": "galchhimun@gmail.com",
        "phone": "०१०-४०००११",
        "website": "https://galchhimun.gov.np",
        "address": "गाउँ कार्यपालिकाको कार्यालय, बैरेनी, धादिङ",
        "total_wards": "8",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png",
    },
}

UUID_TO_SUBDOMAIN = {
    "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06": "panchpokhari",
    "a18b3cde-92be-5f38-bf00-2b76f15fa017": "helambu",
    "82b27265-df98-47aa-a47d-5350ce5ffbbc": "helambu",
    "e4a22081-43e7-40ae-b081-dec13630100d": "melamchi",
    "c7a7e816-96bd-4f13-82c9-1ac60a9de34d": "melamchi",
    "31f59d30-75b5-4553-b0f3-200314bd3716": "melamchimunicipality",
    "0cea29fe-1247-4ce3-840d-3a3d3d0323d6": "galchhi",
    "050b8da4-61d2-49d0-b788-0729be064b26": "benighatrorang",
    "94bf02d3-9c23-4d84-a346-6461f414bcda": "khadadevi",
    "7c9f1805-7907-4955-a138-813b9aa61499": "gaushala",
    "767297b4-deac-430b-8b32-f1010bb0f12d": "gaushalamun",
}

def resolve_subdomain(tenant_id: Optional[str]) -> str:
    if not tenant_id or tenant_id in ["digitaltwin", "default", "localhost", "all"]:
        return "panchpokhari"
    return UUID_TO_SUBDOMAIN.get(tenant_id, tenant_id)

def get_tenant_merged_settings(tenant_id: Optional[str], db: Session) -> Dict[str, str]:
    subdomain = resolve_subdomain(tenant_id)
    defaults = TENANT_SETTING_DEFAULTS.get(subdomain)
    if not defaults:
        from models.municipality import MunicipalityProfile
        from models.tenant import Tenant
        prof = db.query(MunicipalityProfile).filter(
            (MunicipalityProfile.tenant_id == subdomain) | (MunicipalityProfile.tenant_id == tenant_id)
        ).first()
        t = db.query(Tenant).filter(
            (Tenant.subdomain == subdomain) | (Tenant.id == tenant_id)
        ).first()

        palika_np = prof.name_np if prof else (t.name_np if t else "गाउँपालिका")
        palika_en = prof.name_en if prof else (t.name_en if t else "Rural Municipality")
        dist = prof.district if prof else "जिल्ला"
        prov = prof.province if prof else "बागमती प्रदेश"
        hq = prof.headquarters if prof else f"{palika_np} केन्द्र"

        slogan_val = "आधुनिक, सुशासनयुक्त र समृद्ध पालिका"
        if "गौशाला" in palika_np or subdomain in ["gaushala", "gaushalamun"]:
            slogan_val = "कृषि, उद्योग र समृद्धिको सहर: हाम्रो गौशाला नगर"
        elif "खाँडादेवी" in palika_np or subdomain in ["khadadevi", "khandadevi"]:
            slogan_val = "सुन्दर, सभ्य र समृद्ध खाँडादेवी !!!"
        elif "बेनिघाट" in palika_np or subdomain in ["benighatrorang", "benighat"]:
            slogan_val = "कृषि, पर्यटन र पूर्वाधार: समृद्ध बेनीघाट रोराङ्गको आधार"

        defaults = {
            "palika_name": palika_np,
            "palika_name_en": palika_en,
            "slogan": slogan_val,
            "province": prov,
            "district": dist,
            "headquarters": hq,
            "email": f"info@{subdomain}.gov.np",
            "phone": "",
            "website": f"https://{subdomain}.gov.np",
            "address": f"कार्यालय, {palika_np}, {dist}",
            "total_wards": str(prof.ward_count if prof else 8),
            "logo_url": (t.logo_url if t else "") or "/images/p5-logo.png",
        }

    result = dict(defaults)

    # First load global default settings (tenant_id == None)
    for item in db.query(SystemSetting).filter(SystemSetting.tenant_id == None).all():
        if item.value is not None:
            result[item.key] = item.value

    # Then override with tenant-specific settings
    eff = tenant_id or subdomain
    if eff and eff not in ["panchpokhari", "digitaltwin", "default"]:
        for item in db.query(SystemSetting).filter(
            (SystemSetting.tenant_id == eff) | (SystemSetting.tenant_id == subdomain)
        ).all():
            if item.value is not None and item.value != "":
                result[item.key] = item.value
    elif subdomain == "panchpokhari":
        for item in db.query(SystemSetting).filter(SystemSetting.tenant_id == "panchpokhari").all():
            if item.value is not None and item.value != "":
                result[item.key] = item.value
    return result


@router.get("", response_model=Dict[str, str])
def get_all_settings(
    request: Request,
    tenant_id: Optional[str] = Query(None, description="Optional tenant UUID or subdomain"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = tenant_id or x_tenant_id
    if not effective_tenant:
        from api.routers.auth import _get_token_payload
        from models.user import User
        payload = _get_token_payload(request)
        if payload and payload.get("sub"):
            u = db.query(User).filter(User.id == payload.get("sub"), User.deleted_at == None).first()
            if u and u.tenant_id and u.tenant_id not in ("all", "*"):
                effective_tenant = u.tenant_id

    return get_tenant_merged_settings(effective_tenant, db)

@router.get("/public", response_model=Dict[str, str])
def get_public_settings(
    request: Request,
    tenant_id: Optional[str] = Query(None, description="Optional tenant UUID or subdomain"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = tenant_id or x_tenant_id
    if not effective_tenant:
        from api.routers.auth import _get_token_payload
        from models.user import User
        payload = _get_token_payload(request)
        if payload and payload.get("sub"):
            u = db.query(User).filter(User.id == payload.get("sub"), User.deleted_at == None).first()
            if u and u.tenant_id and u.tenant_id not in ("all", "*"):
                effective_tenant = u.tenant_id

    return get_tenant_merged_settings(effective_tenant, db)

@router.get("/records", response_model=List[SettingSchema])
def get_all_records(
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = tenant_id or x_tenant_id
    query = db.query(SystemSetting)
    if effective_tenant:
        query = query.filter((SystemSetting.tenant_id == effective_tenant) | (SystemSetting.tenant_id == None))
    return query.all()

@router.get("/{key}")
def get_setting_by_key(
    key: str,
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = tenant_id or x_tenant_id
    all_settings = get_tenant_merged_settings(effective_tenant, db)
    if key in all_settings:
        return {"key": key, "value": all_settings[key]}
    raise HTTPException(status_code=404, detail=f"Setting key '{key}' not found")

@router.post("/bulk")
def update_bulk_settings(
    updates: Dict[str, Any],
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = tenant_id or x_tenant_id
    updated_keys = []

    for k, v in updates.items():
        val_str = str(v) if v is not None else None
        record = db.query(SystemSetting).filter(
            SystemSetting.key == k,
            SystemSetting.tenant_id == effective_tenant
        ).first()

        if not record:
            record = SystemSetting(
                id=str(uuid.uuid4()),
                tenant_id=effective_tenant,
                key=k,
                value=val_str
            )
            db.add(record)
        else:
            record.value = val_str
        updated_keys.append(k)

    db.commit()
    return {"success": True, "updatedKeys": updated_keys}

@router.post("", response_model=SettingSchema)
@router.post("", response_model=SettingSchema)
def create_or_update_setting(
    data: SettingCreate,
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = data.tenant_id or x_tenant_id
    record = db.query(SystemSetting).filter(
        SystemSetting.key == data.key,
        SystemSetting.tenant_id == effective_tenant
    ).first()

    if not record:
        record = SystemSetting(
            id=str(uuid.uuid4()),
            tenant_id=effective_tenant,
            key=data.key,
            value=data.value,
            description=data.description
        )
        db.add(record)
    else:
        record.value = data.value
        if data.description is not None:
            record.description = data.description

    db.commit()
    db.refresh(record)
    return record

@router.delete("/{key}")
def delete_setting(
    key: str,
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = tenant_id or x_tenant_id
    record = db.query(SystemSetting).filter(
        SystemSetting.key == key,
        SystemSetting.tenant_id == effective_tenant
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Setting not found in custom overrides")

    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Setting '{key}' deleted"}
