from pydantic import BaseModel, model_validator
from typing import Optional, Any
from datetime import datetime

class TenantBase(BaseModel):
    subdomain: Optional[str] = None
    name_np: Optional[str] = None
    name_en: Optional[str] = None
    nameNp: Optional[str] = None
    nameEn: Optional[str] = None
    logo_url: Optional[str] = None
    logoUrl: Optional[str] = None
    province: Optional[str] = None
    district: Optional[str] = None
    status: str = 'active'

    class Config:
        populate_by_name = True

class TenantCreate(BaseModel):
    subdomain: Optional[str] = None
    name_np: Optional[str] = None
    name_en: Optional[str] = None
    nameNp: Optional[str] = None
    nameEn: Optional[str] = None
    province: Optional[str] = None
    district: Optional[str] = None
    admin_email: Optional[str] = None
    adminEmail: Optional[str] = None
    logo_url: Optional[str] = None
    logoUrl: Optional[str] = None
    status: str = 'active'

    @model_validator(mode='after')
    def normalize_fields(self):
        self.name_np = self.name_np or self.nameNp or ""
        self.name_en = self.name_en or self.nameEn or self.subdomain or ""
        self.nameNp = self.name_np
        self.nameEn = self.name_en
        self.admin_email = self.admin_email or self.adminEmail or ""
        self.adminEmail = self.admin_email
        self.logo_url = self.logo_url or self.logoUrl or ""
        self.logoUrl = self.logo_url
        return self

class TenantUpdate(BaseModel):
    subdomain: Optional[str] = None
    name_np: Optional[str] = None
    name_en: Optional[str] = None
    nameNp: Optional[str] = None
    nameEn: Optional[str] = None
    province: Optional[str] = None
    district: Optional[str] = None
    admin_email: Optional[str] = None
    adminEmail: Optional[str] = None
    logo_url: Optional[str] = None
    logoUrl: Optional[str] = None
    status: Optional[str] = None

class TenantSchema(BaseModel):
    id: Any
    subdomain: Optional[str] = None
    name_np: Optional[str] = None
    name_en: Optional[str] = None
    nameNp: Optional[str] = None
    nameEn: Optional[str] = None
    province: Optional[str] = None
    district: Optional[str] = None
    admin_email: Optional[str] = None
    adminEmail: Optional[str] = None
    logo_url: Optional[str] = None
    logoUrl: Optional[str] = None
    status: str = 'active'
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class TenantResponse(BaseModel):
    success: bool = True
    message: str = "सफलतापूर्वक सम्पन्न भयो"
    data: Optional[Any] = None
    id: Optional[str] = None
    subdomain: Optional[str] = None
    name_np: Optional[str] = None
    name_en: Optional[str] = None
    nameNp: Optional[str] = None
    nameEn: Optional[str] = None
    province: Optional[str] = None
    district: Optional[str] = None
    admin_email: Optional[str] = None
    adminEmail: Optional[str] = None
    logo_url: Optional[str] = None
    logoUrl: Optional[str] = None
    status: str = 'active'


