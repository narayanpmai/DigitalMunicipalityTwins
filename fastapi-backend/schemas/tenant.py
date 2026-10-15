from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TenantBase(BaseModel):
    subdomain: Optional[str] = None
    name_np: str
    name_en: str
    logo_url: Optional[str] = None
    status: str = 'active'

class TenantCreate(TenantBase):
    admin_email: Optional[str] = None

class TenantUpdate(BaseModel):
    subdomain: Optional[str] = None
    name_np: Optional[str] = None
    name_en: Optional[str] = None
    logo_url: Optional[str] = None
    status: Optional[str] = None

from typing import Optional, Any
from datetime import datetime

class TenantSchema(TenantBase):
    id: Any
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

