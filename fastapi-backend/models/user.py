from sqlalchemy import Column, String, Boolean, Integer, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from core.database import Base
from datetime import datetime
import enum
import uuid


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    CAO = "cao"
    IT_ADMIN = "it_admin"
    PLANNING_OFFICER = "planning_officer"
    REVENUE_OFFICER = "revenue_officer"
    EDUCATION_OFFICER = "education_officer"
    HEALTH_OFFICER = "health_officer"
    AGRICULTURE_OFFICER = "agriculture_officer"
    TOURISM_OFFICER = "tourism_officer"
    DISASTER_OFFICER = "disaster_officer"
    WARD_USER = "ward_user"
    DATA_ENTRY = "data_entry"
    PUBLIC = "public"
    PUBLIC_CITIZEN = "public_citizen"
    PUBLIC_CONTRACTOR = "public_contractor"
    PUBLIC_ENGINEER = "public_engineer"
    PUBLIC_BUSINESS = "public_business"
    TOURIST = "tourist"
    ACCOUNTANT = "accountant"
    ENGINEER = "engineer"
    MEDICAL_OFFICER = "medical_officer"
    LAB_TECHNICIAN = "lab_technician"
    PHARMACIST = "pharmacist"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_users_tenant_email"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, name="tenant_id")

    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=False, name="fullName")
    phone = Column(String, nullable=True)
    role = Column(String, default=UserRole.PUBLIC)
    ward_number = Column(Integer, nullable=True, name="wardNumber")
    is_active = Column(Boolean, default=True, name="isActive")
    email_verified = Column(Boolean, default=False, name="emailVerified")
    refresh_token = Column(String, nullable=True, name="refreshToken")
    last_login_at = Column(DateTime, nullable=True, name="lastLoginAt")
    last_login_ip = Column(String, nullable=True, name="lastLoginIp")
    profile_photo = Column(String, nullable=True, name="profilePhoto")
    preferences = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, name="createdAt")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name="updatedAt")
    deleted_at = Column(DateTime, nullable=True, name="deletedAt")

    @property
    def fullName(self):
        return self.full_name

    @fullName.setter
    def fullName(self, value):
        self.full_name = value

    @property
    def isActive(self):
        return self.is_active

    @isActive.setter
    def isActive(self, value):
        self.is_active = value

    @property
    def wardNumber(self):
        return self.ward_number

    @wardNumber.setter
    def wardNumber(self, value):
        self.ward_number = value

    @property
    def tenantId(self):
        return self.tenant_id

    @tenantId.setter
    def tenantId(self, value):
        self.tenant_id = value


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_roles_tenant_name"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, name="tenant_id")
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    permissions = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, name="createdAt")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name="updatedAt")
