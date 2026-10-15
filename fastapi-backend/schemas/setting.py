from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SettingBase(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class SettingCreate(SettingBase):
    pass

class SettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None

class SettingSchema(SettingBase):
    id: Any
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

