from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserRoleBase(BaseModel):
    role_name: str
    description: Optional[str] = None
    permissions: List[str]

class UserRoleCreate(UserRoleBase):
    pass

class UserRoleResponse(UserRoleBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class UserAccountBase(BaseModel):
    username: str
    role_id: str
    employee_id: Optional[str] = None
    ward_restriction: Optional[int] = None
    is_active: Optional[bool] = True

class UserAccountCreate(UserAccountBase):
    password: str

class UserAccountResponse(UserAccountBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    class Config:
        from_attributes = True


class SystemAuditLogBase(BaseModel):
    user_id: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    old_data: Optional[Dict[str, Any]] = None
    new_data: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class SystemAuditLogCreate(SystemAuditLogBase):
    pass

class SystemAuditLogResponse(SystemAuditLogBase):
    id: str
    tenant_id: str
    timestamp: datetime
    class Config:
        from_attributes = True
