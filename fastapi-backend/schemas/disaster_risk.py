from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class DisasterPreparednessItemBase(BaseModel):
    item_type: str
    name_or_title: str
    quantity_capacity: Optional[float] = 1.0
    current_location: Optional[str] = None
    contact_person_id: Optional[str] = None
    contact_phone: Optional[str] = None
    status: Optional[str] = 'Ready'

class DisasterPreparednessItemCreate(DisasterPreparednessItemBase):
    pass

class DisasterPreparednessItemResponse(DisasterPreparednessItemBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class DisasterIncidentBase(BaseModel):
    incident_type: str
    incident_date: datetime
    ward_id: Optional[str] = None
    severity: Optional[str] = 'Medium'
    description: str
    gis_location: Optional[Dict[str, Any]] = None
    status: Optional[str] = 'Active'

class DisasterIncidentCreate(DisasterIncidentBase):
    pass

class DisasterIncidentResponse(DisasterIncidentBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class IncidentDamageReportBase(BaseModel):
    incident_id: str
    affected_household_id: Optional[str] = None
    affected_infrastructure_id: Optional[str] = None
    human_casualties: Optional[int] = 0
    injured_count: Optional[int] = 0
    estimated_loss_amount: Optional[Decimal] = Decimal('0.00')
    relief_provided: Optional[Dict[str, Any]] = None

class IncidentDamageReportCreate(IncidentDamageReportBase):
    pass

class IncidentDamageReportResponse(IncidentDamageReportBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class RecoveryProjectBase(BaseModel):
    incident_id: str
    project_id: Optional[str] = None
    reconstruction_type: str
    beneficiary_household_id: Optional[str] = None
    recovery_status: Optional[str] = 'Planned'

class RecoveryProjectCreate(RecoveryProjectBase):
    pass

class RecoveryProjectResponse(RecoveryProjectBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
