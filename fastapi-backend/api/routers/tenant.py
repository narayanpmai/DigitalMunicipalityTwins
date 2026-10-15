from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.tenant import Tenant
from schemas.tenant import TenantSchema, TenantCreate, TenantUpdate
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

@router.get("", response_model=List[TenantSchema])
def get_tenants(db: Session = Depends(get_db)):
    seed_tenants_if_empty(db)
    return db.query(Tenant).all()

@router.get("/current", response_model=TenantSchema)
def get_current_tenant(
    subdomain: Optional[str] = Query("panchpokhari", description="Tenant subdomain identifier"),
    db: Session = Depends(get_db)
):
    seed_tenants_if_empty(db)
    tenant = db.query(Tenant).filter(Tenant.subdomain == subdomain).first()
    if not tenant:
        tenant = db.query(Tenant).filter(Tenant.subdomain == "panchpokhari").first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Current tenant not found")
    return tenant

@router.get("/{id}", response_model=TenantSchema)
def get_tenant(id: str, db: Session = Depends(get_db)):
    seed_tenants_if_empty(db)
    tenant = db.query(Tenant).filter(
        (Tenant.id == id) | (Tenant.subdomain == id)
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.post("/register", response_model=TenantSchema)
def register_tenant(data: TenantCreate, db: Session = Depends(get_db)):
    subdomain = data.subdomain
    if not subdomain and data.name_en:
        subdomain = re.sub(r'[^a-z0-9]', '', data.name_en.lower())
    if not subdomain:
        subdomain = f"tenant-{int(datetime.utcnow().timestamp())}"
        
    exists = db.query(Tenant).filter(Tenant.subdomain == subdomain).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Tenant with subdomain '{subdomain}' already exists")
        
    db_tenant = Tenant(
        id=str(uuid.uuid4()),
        subdomain=subdomain,
        name_np=data.name_np,
        name_en=data.name_en,
        logo_url=data.logo_url,
        status=data.status or "active"
    )
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

@router.put("/{id}", response_model=TenantSchema)
def update_tenant(id: str, data: TenantUpdate, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(
        (Tenant.id == id) | (Tenant.subdomain == id)
    ).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tenant, key, value)
        
    db.commit()
    db.refresh(tenant)
    return tenant

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
    return tenant
