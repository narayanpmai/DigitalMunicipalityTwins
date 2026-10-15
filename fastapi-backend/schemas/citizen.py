from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import date, datetime

class CitizenBase(BaseModel):
    full_name: str
    full_name_en: Optional[str] = None
    citizenship_no: Optional[str] = None
    national_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    ward_number: Optional[int] = None
    address: Optional[str] = None
    tole: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    spouse_name: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    is_active: bool = True
    meta: Optional[Dict[str, Any]] = None

class CitizenCreate(CitizenBase):
    blood_group: Optional[str] = None
    marital_status: Optional[str] = None
    targeted_group: Optional[str] = None
    service_purpose: Optional[str] = None
    is_public: Optional[bool] = True

class CitizenPublicRegister(BaseModel):
    full_name: str
    full_name_en: Optional[str] = None
    citizenship_no: Optional[str] = None
    national_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    ward_number: Optional[int] = None
    address: Optional[str] = None
    tole: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    spouse_name: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    blood_group: Optional[str] = None
    marital_status: Optional[str] = None
    targeted_group: Optional[str] = None
    service_purpose: Optional[str] = None

class CitizenVerify(BaseModel):
    status: str = 'VERIFIED'  # 'VERIFIED' | 'REJECTED'
    is_public: Optional[bool] = None
    remarks: Optional[str] = None

class CitizenSchema(CitizenBase):
    id: Any
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CitizenPublicSchema(BaseModel):
    id: Any

    citizen_code: Optional[str] = None
    full_name: str
    full_name_en: Optional[str] = None
    gender: Optional[str] = None
    ward_number: Optional[int] = None
    address: Optional[str] = None
    tole: Optional[str] = None
    occupation: Optional[str] = None
    targeted_group: Optional[str] = None
    phone: Optional[str] = None
    national_id: Optional[str] = None
    citizenship_no: Optional[str] = None
    verification_status: Optional[str] = 'VERIFIED'
    created_at: Optional[datetime] = None

class CitizenStats(BaseModel):
    total: int
    by_ward: List[Dict[str, Any]]
    by_gender: List[Dict[str, Any]]
