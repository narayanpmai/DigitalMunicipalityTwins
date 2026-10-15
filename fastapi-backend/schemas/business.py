from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BusinessSchema(BaseModel):
    registration_no: str
    business_name: str
    category: str = 'अन्य स्थानीय उद्यम'
    firm_type: str = 'एकलौटी फर्म'
    status: str = 'आवेदन पेश भएको'
    proprietor_name: str
    proprietor_phone: Optional[str] = None
    ward_number: int = 1
    initial_capital: float = 0
    license_fee: float = 0
    
    class Config:
        from_attributes = True

class BusinessCreate(BaseModel):
    business_name: str
    category: str = 'अन्य स्थानीय उद्यम'
    firm_type: str = 'एकलौटी फर्म'
    proprietor_name: str
    proprietor_phone: Optional[str] = None
    ward_number: int = 1
    initial_capital: float = 0
