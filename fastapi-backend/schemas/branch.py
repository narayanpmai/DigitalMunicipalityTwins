from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Union
from datetime import datetime
import uuid
import json

class BranchBase(BaseModel):
    name: str
    code: Optional[str] = None
    type: str = 'palika'
    ward_number: Optional[int] = None
    description: Optional[str] = None
    roles_and_responsibilities: Optional[List[str]] = None
    head_employee_name: Optional[str] = None
    head_employee_id: Optional[str] = None
    contact_phone: Optional[str] = None
    email: Optional[str] = None
    is_information_officer_branch: bool = False
    is_grievance_officer_branch: bool = False
    status: str = 'active'
    
    @field_validator('roles_and_responsibilities', mode='before')
    def parse_roles(cls, v):
        if isinstance(v, str):
            try:
                # Try parsing as JSON array
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                # Fallback to comma separated or just treat as single element
                if ',' in v:
                    return [x.strip() for x in v.split(',')]
                return [v]
        return v

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    type: Optional[str] = None
    ward_number: Optional[int] = None
    description: Optional[str] = None
    roles_and_responsibilities: Optional[List[str]] = None
    head_employee_name: Optional[str] = None
    head_employee_id: Optional[str] = None
    contact_phone: Optional[str] = None
    email: Optional[str] = None
    is_information_officer_branch: Optional[bool] = None
    is_grievance_officer_branch: Optional[bool] = None
    status: Optional[str] = None

class BranchSchema(BranchBase):
    id: Union[str, uuid.UUID]
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
