from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String)
    entity_type = Column(String, name='entityType')
    entity_id = Column(String, nullable=True, name='entityId')
    user_id = Column(String, nullable=True, name='userId')
    user_email = Column(String, nullable=True, name='userEmail')
    user_role = Column(String, nullable=True, name='userRole')
    ip_address = Column(String, nullable=True, name='ipAddress')
    user_agent = Column(String, nullable=True, name='userAgent')
    old_values = Column(JSON, nullable=True, name='oldValues')
    new_values = Column(JSON, nullable=True, name='newValues')
    description = Column(Text, nullable=True)
    success = Column(Boolean, default=True)
    error_message = Column(String, nullable=True, name='errorMessage')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "action": self.action,
            "entityType": self.entity_type,
            "entityId": self.entity_id,
            "userId": self.user_id,
            "userEmail": self.user_email or "",
            "userRole": self.user_role or "Staff",
            "ipAddress": self.ip_address or "127.0.0.1",
            "userAgent": self.user_agent or "",
            "oldValues": self.old_values or {},
            "newValues": self.new_values or {},
            "description": self.description or "",
            "success": bool(self.success),
            "errorMessage": self.error_message,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
