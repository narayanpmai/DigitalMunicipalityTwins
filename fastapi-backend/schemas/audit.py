from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class AuditLogSchema(BaseModel):
    id: str
    action: str
    entity_type: str
    user_email: Optional[str] = None
    success: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AuditLogCreate(BaseModel):
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None
