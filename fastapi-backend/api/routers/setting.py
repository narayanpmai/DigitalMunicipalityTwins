from fastapi import APIRouter, Depends, HTTPException, Query, Header
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
    }
}

UUID_TO_SUBDOMAIN = {
    "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06": "panchpokhari",
    "82b27265-df98-47aa-a47d-5350ce5ffbbc": "helambu",
    "c7a7e816-96bd-4f13-82c9-1ac60a9de34d": "melamchi",
    "31f59d30-75b5-4553-b0f3-200314bd3716": "melamchimunicipality",
    "c916d698-037a-4179-9018-e9d18f7b49aa": "indrawati",
}

def resolve_subdomain(tenant_id: Optional[str]) -> str:
    if not tenant_id:
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

        defaults = {
            "palika_name": palika_np,
            "palika_name_en": palika_en,
            "slogan": "आधुनिक, सुशासनयुक्त र समृद्ध पालिका",
            "province": prov,
            "district": dist,
            "headquarters": hq,
            "email": f"info@{subdomain}.gov.np",
            "phone": "",
            "website": f"https://{subdomain}.gov.np",
            "address": f"गाउँ कार्यपालिकाको कार्यालय, {palika_np}, {dist}",
            "total_wards": str(prof.ward_count if prof else 8),
            "logo_url": (t.logo_url if t else "") or "/images/p5-logo.png",
        }

    result = dict(defaults)

    query = db.query(SystemSetting)
    if tenant_id or subdomain:
        eff = tenant_id or subdomain
        query = query.filter((SystemSetting.tenant_id == eff) | (SystemSetting.tenant_id == subdomain) | (SystemSetting.tenant_id == None))
    else:
        query = query.filter(SystemSetting.tenant_id == None)

    for item in query.all():
        if item.value is not None:
            result[item.key] = item.value
    return result


@router.get("", response_model=Dict[str, str])
@router.get("", response_model=Dict[str, str])
def get_all_settings(
    tenant_id: Optional[str] = Query(None, description="Optional tenant UUID or subdomain"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = tenant_id or x_tenant_id
    return get_tenant_merged_settings(effective_tenant, db)

@router.get("/public", response_model=Dict[str, str])
def get_public_settings(
    tenant_id: Optional[str] = Query(None, description="Optional tenant UUID or subdomain"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    effective_tenant = tenant_id or x_tenant_id
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
