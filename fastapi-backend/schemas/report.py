from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ReportSchema(BaseModel):
    id: str
    asset_unique_id: str
    fiscal_year: str
    module_title_nepali: str
    asset_name: str
    ward_number: int
    physical_progress_percent: int
    condition: str
    
    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    asset_unique_id: str
    plan_code: Optional[str] = None
    fiscal_year: str = '२०८०/०८१'
    period_type: str = '1_year'
    module_key: int
    module_title_nepali: str
    asset_name: str
    ward_number: int = 0
    tole_basti: Optional[str] = None
    physical_progress_percent: int = 100
    condition: str = 'good'
    thematic_data: Optional[dict] = {}
