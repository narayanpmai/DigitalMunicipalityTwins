from pydantic import BaseModel
from typing import Optional, Union, Any
from uuid import UUID
from datetime import datetime

class SocialSecurityBeneficiarySchema(BaseModel):
    id: Any
    beneficiary_id: str
    full_name: str
    full_name_en: Optional[str] = None
    citizenship_or_nid_no: Optional[str] = None
    category: str = 'जेष्ठ नागरिक (६८ वर्ष माथि)'
    ward_number: int = 1
    tole_village: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth_bs: Optional[str] = None
    contact_phone: Optional[str] = None
    guardian_name: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    monthly_allowance_npr: Optional[float] = 4000.0
    quarterly_allowance_npr: Optional[float] = 12000.0
    status: str = 'सक्रिय'
    fiscal_year: Optional[str] = '२०८१/०८२'
    renewal_date_bs: Optional[str] = None
    
    class Config:
        from_attributes = True

class SocialSecurityBeneficiaryCreate(BaseModel):
    beneficiary_id: Optional[str] = None
    full_name: str
    full_name_en: Optional[str] = None
    citizenship_or_nid_no: str
    category: str = 'जेष्ठ नागरिक (६८ वर्ष माथि)'
    ward_number: int = 1
    tole_village: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth_bs: Optional[str] = None
    contact_phone: Optional[str] = None
    guardian_name: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    monthly_allowance_npr: Optional[float] = 4000.0
    quarterly_allowance_npr: Optional[float] = 12000.0
    status: str = 'सक्रिय'
    fiscal_year: Optional[str] = '२०८१/०८२'
    renewal_date_bs: Optional[str] = None

class SocialSecurityBeneficiaryUpdate(BaseModel):
    full_name: Optional[str] = None
    full_name_en: Optional[str] = None
    citizenship_or_nid_no: Optional[str] = None
    category: Optional[str] = None
    ward_number: Optional[int] = None
    tole_village: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth_bs: Optional[str] = None
    contact_phone: Optional[str] = None
    guardian_name: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    monthly_allowance_npr: Optional[float] = None
    quarterly_allowance_npr: Optional[float] = None
    status: Optional[str] = None
    fiscal_year: Optional[str] = None
    renewal_date_bs: Optional[str] = None
