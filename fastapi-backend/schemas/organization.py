from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class OrganizationSchema(BaseModel):
    id: str
    name: str
    type: str = 'ngo'
    registration_no: Optional[str] = None
    chairperson: Optional[str] = None
    phone: Optional[str] = None
    status: str = 'active'
    is_active: bool = True
    
    class Config:
        from_attributes = True

class OrganizationCreate(BaseModel):
    name: str
    name_en: Optional[str] = None
    type: str = 'ngo'
    registration_no: Optional[str] = None
    registration_date: Optional[str] = None
    pan: Optional[str] = None
    chairperson: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    ward_number: Optional[int] = None
    sector: Optional[str] = None
    status: str = 'active'
