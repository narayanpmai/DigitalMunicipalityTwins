from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class EBPSApplicationBase(BaseModel):
    application_no: str
    landowner_citizen_id: str
    consultant_id: str
    kitta_no: str
    ward_id: str
    land_area_sqm: float
    building_type: str
    structure_type: str
    total_floors: float
    status: Optional[str] = 'Draft'
    gis_polygon: Optional[Dict[str, Any]] = None

class EBPSApplicationCreate(EBPSApplicationBase):
    pass

class EBPSApplicationResponse(EBPSApplicationBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class EBPSDesignScrutinyBase(BaseModel):
    application_id: str
    proposed_far: float
    allowed_far: float
    proposed_ground_coverage: float
    allowed_ground_coverage: float
    road_width_ft: float
    setback_front_ft: float
    setback_rear_ft: float
    setback_side_ft: float
    is_code_compliant: Optional[bool] = False
    engineer_id: str
    remarks: Optional[str] = None

class EBPSDesignScrutinyCreate(EBPSDesignScrutinyBase):
    pass

class EBPSDesignScrutinyResponse(EBPSDesignScrutinyBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class EBPSWorkflowStepBase(BaseModel):
    application_id: str
    step_name: str
    action_by: str
    outcome: str
    comments: Optional[str] = None
    attachment_urls: Optional[List[str]] = None

class EBPSWorkflowStepCreate(EBPSWorkflowStepBase):
    pass

class EBPSWorkflowStepResponse(EBPSWorkflowStepBase):
    id: str
    tenant_id: Optional[str] = None
    action_date: datetime
    class Config:
        from_attributes = True


class EBPSFieldInspectionBase(BaseModel):
    application_id: str
    inspection_type: str
    inspector_id: str
    gps_coordinates: Optional[Dict[str, Any]] = None
    photos: Optional[List[str]] = None
    is_approved: Optional[bool] = False
    remarks: Optional[str] = None

class EBPSFieldInspectionCreate(EBPSFieldInspectionBase):
    pass

class EBPSFieldInspectionResponse(EBPSFieldInspectionBase):
    id: str
    tenant_id: Optional[str] = None
    inspection_date: datetime
    class Config:
        from_attributes = True
