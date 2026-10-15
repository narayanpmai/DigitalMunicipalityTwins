from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class SocialInclusionRecordSchema(BaseModel):
    id: str
    category: str
    title: str
    ward_number: int
    beneficiaries_count: int
    status: str
    
    class Config:
        from_attributes = True

class SocialInclusionRecordCreate(BaseModel):
    category: str = 'women_children'
    ward_number: int = 1
    fiscal_year: str = '२०८१/०८२'
    title: str
    service_type: Optional[str] = None
    sub_category: Optional[str] = None
    beneficiaries_count: int = 0
    female_beneficiaries: int = 0
    male_beneficiaries: int = 0
    disability_card_type: Optional[str] = None
    target_group: Optional[str] = None
    budget_allocated: float = 0.0
    budget_spent: float = 0.0
    coordinator_name: Optional[str] = None
    coordinator_phone: Optional[str] = None
    location: Optional[str] = None
    address: str = 'पाँचपोखरी थाङपाल गा.पा.'
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = 'regular'
    remarks: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
