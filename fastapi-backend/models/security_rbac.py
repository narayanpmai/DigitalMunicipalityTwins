from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class UserRole(Base):
    """Defines roles and their specific permissions."""
    __tablename__ = 'sec_user_roles'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role_name = Column(String, nullable=False) # e.g., 'WardChair', 'IT_Officer'
    description = Column(String, nullable=True)
    permissions = Column(JSON, nullable=False) # List of permission strings: ['view_citizen', 'edit_budget']
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    users = relationship("UserAccount", back_populates="role")

    def to_dict(self):
        return {
            "id": self.id,
            "tenantId": self.tenant_id,
            "roleName": self.role_name,
            "description": self.description or "",
            "permissions": self.permissions or [],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "usersCount": len(self.users) if self.users else 0
        }


class UserAccount(Base):
    """The actual user authentication record."""
    __tablename__ = 'sec_users'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    role_id = Column(String, ForeignKey('sec_user_roles.id'), nullable=False)
    employee_id = Column(String, nullable=True) # Links to EmployeeMaster
    ward_restriction = Column(Integer, nullable=True) # If set, limits user scope to a specific ward
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    role = relationship("UserRole", back_populates="users")

    def to_dict(self):
        return {
            "id": self.id,
            "tenantId": self.tenant_id,
            "username": self.username,
            "roleId": self.role_id,
            "roleName": self.role.role_name if self.role else None,
            "employeeId": self.employee_id,
            "wardRestriction": self.ward_restriction,
            "isActive": bool(self.is_active),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "lastLogin": self.last_login.isoformat() if self.last_login else None
        }


class SystemAuditLog(Base):
    """Immutable audit trail of all system actions."""
    __tablename__ = 'sec_audit_logs'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True, nullable=False)
    user_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False) # CREATE, UPDATE, DELETE, LOGIN
    resource_type = Column(String, nullable=False) # e.g., 'CitizenMaster'
    resource_id = Column(String, nullable=True)
    old_data = Column(JSON, nullable=True)
    new_data = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "tenantId": self.tenant_id,
            "userId": self.user_id,
            "action": self.action,
            "resourceType": self.resource_type,
            "resourceId": self.resource_id,
            "oldData": self.old_data or {},
            "newData": self.new_data or {},
            "ipAddress": self.ip_address or "127.0.0.1",
            "userAgent": self.user_agent or "",
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
