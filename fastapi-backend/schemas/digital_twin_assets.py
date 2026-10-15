from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal

class UnifiedAssetBase(BaseModel):
    asset_code: str
    asset_type: str
    category: str
    name: str
    description: Optional[str] = None
    acquisition_date: Optional[date] = None
    acquisition_cost: Optional[Decimal] = Decimal('0.00')
    current_condition: Optional[str] = 'Operational'
    project_source_id: Optional[str] = None
    gis_geometry: Optional[Dict[str, Any]] = None

class UnifiedAssetCreate(UnifiedAssetBase):
    pass

class UnifiedAssetResponse(UnifiedAssetBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class AssetMaintenanceLogBase(BaseModel):
    asset_id: str
    maintenance_date: date
    maintenance_type: str
    performed_by: Optional[str] = None
    cost: Optional[Decimal] = Decimal('0.00')
    description: str
    next_due_date: Optional[date] = None

class AssetMaintenanceLogCreate(AssetMaintenanceLogBase):
    pass

class AssetMaintenanceLogResponse(AssetMaintenanceLogBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class AssetInspectionBase(BaseModel):
    asset_id: str
    inspection_date: date
    inspector_id: str
    findings: str
    condition_rating: Optional[int] = None
    photos: Optional[List[str]] = None

class AssetInspectionCreate(AssetInspectionBase):
    pass

class AssetInspectionResponse(AssetInspectionBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class AssetAssignmentBase(BaseModel):
    asset_id: str
    assigned_to: str
    assigned_date: date
    returned_date: Optional[date] = None
    condition_at_assignment: Optional[str] = None

class AssetAssignmentCreate(AssetAssignmentBase):
    pass

class AssetAssignmentResponse(AssetAssignmentBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True
