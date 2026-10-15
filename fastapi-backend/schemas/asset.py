from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class AssetSchema(BaseModel):
    id: str
    asset_code: str
    asset_name: str
    category: str
    condition: str
    ward_number: int
    purchase_cost: float
    current_book_value: float
    
    class Config:
        from_attributes = True

class AssetCreate(BaseModel):
    asset_code: str
    asset_name: str
    category: str = 'अन्य पुँजीगत सम्पत्ति'
    malepa_form: str = 'मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)'
    condition: str = 'चालु अवस्थामा (Operational)'
    ward_number: int = 0
    department: Optional[str] = None
    custodian_name: Optional[str] = None
    location: Optional[str] = None
    purchase_date_bs: Optional[str] = None
    purchase_cost: float = 0.0
    depreciation_rate_percent: float = 10.0
    current_book_value: float = 0.0
    model_or_plate_no: Optional[str] = None
    vendor_name: Optional[str] = None
    remarks: Optional[str] = None
