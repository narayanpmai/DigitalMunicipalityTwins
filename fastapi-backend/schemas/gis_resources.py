from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class PublicLandMasterBase(BaseModel):
    kitta_no: Optional[str] = None
    ward_id: Optional[str] = None
    area_sqm: Optional[float] = None
    land_type: str
    current_use: Optional[str] = None
    encroachment_details: Optional[str] = None
    gis_polygon: Optional[Dict[str, Any]] = None

class PublicLandMasterCreate(PublicLandMasterBase):
    pass

class PublicLandMasterResponse(PublicLandMasterBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class NaturalResourceMasterBase(BaseModel):
    resource_type: str
    name: str
    ward_id: Optional[str] = None
    area_or_length: Optional[float] = None
    conservation_status: Optional[str] = None
    management_committee_id: Optional[str] = None
    gis_geometry: Optional[Dict[str, Any]] = None

class NaturalResourceMasterCreate(NaturalResourceMasterBase):
    pass

class NaturalResourceMasterResponse(NaturalResourceMasterBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class TourismHeritageMasterBase(BaseModel):
    name: str
    category: str
    historical_significance: Optional[str] = None
    visitor_count_annual: Optional[int] = 0
    gis_geometry: Optional[Dict[str, Any]] = None
    photos: Optional[List[str]] = None

class TourismHeritageMasterCreate(TourismHeritageMasterBase):
    pass

class TourismHeritageMasterResponse(TourismHeritageMasterBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class EnvironmentalRiskZoneBase(BaseModel):
    risk_type: str
    severity_level: str
    mitigation_status: Optional[str] = None
    gis_polygon: Dict[str, Any]

class EnvironmentalRiskZoneCreate(EnvironmentalRiskZoneBase):
    pass

class EnvironmentalRiskZoneResponse(EnvironmentalRiskZoneBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
