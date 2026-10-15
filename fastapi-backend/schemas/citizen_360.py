from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date, datetime

class HouseholdSocioEconomicProfileBase(BaseModel):
    household_id: str
    annual_income_bracket: Optional[str] = None
    primary_occupation: Optional[str] = None
    land_ownership_area_sqm: Optional[float] = None
    livestock_count: Optional[Dict[str, int]] = None
    has_bank_account: Optional[bool] = False
    has_health_insurance: Optional[bool] = False
    has_internet_access: Optional[bool] = False
    vulnerability_score: Optional[int] = 0
    disaster_risk_category: Optional[str] = 'Low'

class HouseholdSocioEconomicProfileCreate(HouseholdSocioEconomicProfileBase):
    pass

class HouseholdSocioEconomicProfileResponse(HouseholdSocioEconomicProfileBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class CitizenApplicationLogBase(BaseModel):
    citizen_id: str
    service_module: str
    application_ref_no: str
    application_date: date
    status: Optional[str] = 'Pending'

class CitizenApplicationLogCreate(CitizenApplicationLogBase):
    pass

class CitizenApplicationLogResponse(CitizenApplicationLogBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class WardDigitalTwinAggregation(BaseModel):
    """Schema representing the aggregated view for a Ward Dashboard."""
    ward_id: str
    ward_number: int
    total_population: int
    total_households: int
    active_projects_count: int
    total_budget_allocated: float
    total_revenue_collected: float
    high_risk_households_count: int
