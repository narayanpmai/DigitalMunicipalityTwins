from pydantic import BaseModel, EmailStr, Field, AliasChoices, ConfigDict, computed_field
from typing import Optional, List, Any, Union
from datetime import datetime
from uuid import UUID
from models.user import UserRole


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str
    tenant_subdomain: Optional[str] = None


class PublicRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    registration_type: UserRole = UserRole.PUBLIC_CITIZEN
    specific_details: Optional[Any] = None


class RefreshTokenRequest(BaseModel):
    user_id: str
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    tenant_subdomain: Optional[str] = None
    user: Any


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# ─── User Schemas ────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: str
    full_name: str = Field(validation_alias=AliasChoices('full_name', 'fullName'))
    phone: Optional[str] = None
    role: Optional[UserRole] = UserRole.PUBLIC
    ward_number: Optional[int] = Field(default=None, validation_alias=AliasChoices('ward_number', 'wardNumber'))
    tenant_id: Optional[str] = Field(default=None, validation_alias=AliasChoices('tenant_id', 'tenantId'))
    is_active: Optional[bool] = Field(default=True, validation_alias=AliasChoices('is_active', 'isActive'))
    email_verified: Optional[bool] = Field(default=False, validation_alias=AliasChoices('email_verified', 'emailVerified'))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = Field(default=None, validation_alias=AliasChoices('full_name', 'fullName'))
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    ward_number: Optional[int] = Field(default=None, validation_alias=AliasChoices('ward_number', 'wardNumber'))
    tenant_id: Optional[str] = Field(default=None, validation_alias=AliasChoices('tenant_id', 'tenantId'))
    is_active: Optional[bool] = Field(default=None, validation_alias=AliasChoices('is_active', 'isActive'))
    email_verified: Optional[bool] = Field(default=None, validation_alias=AliasChoices('email_verified', 'emailVerified'))
    password: Optional[str] = None
    profile_photo: Optional[str] = Field(default=None, validation_alias=AliasChoices('profile_photo', 'profilePhoto'))
    preferences: Optional[Any] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class UserSchema(UserBase):
    id: Union[str, UUID]
    profile_photo: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @computed_field
    @property
    def fullName(self) -> str:
        return self.full_name

    @computed_field
    @property
    def isActive(self) -> bool:
        return bool(self.is_active) if self.is_active is not None else True

    @computed_field
    @property
    def wardNumber(self) -> Optional[int]:
        return self.ward_number

    @computed_field
    @property
    def tenantId(self) -> Optional[str]:
        return self.tenant_id

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class UserPublicSchema(BaseModel):
    id: Union[str, UUID]
    email: str
    full_name: str
    role: Optional[str] = None
    ward_number: Optional[int] = None
    tenant_id: Optional[str] = None
    is_active: Optional[bool] = None
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

    @computed_field
    @property
    def fullName(self) -> str:
        return self.full_name

    @computed_field
    @property
    def isActive(self) -> bool:
        return bool(self.is_active) if self.is_active is not None else True

    @computed_field
    @property
    def wardNumber(self) -> Optional[int]:
        return self.ward_number

    @computed_field
    @property
    def tenantId(self) -> Optional[str]:
        return self.tenant_id

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ─── Role Schemas ────────────────────────────────────────────────────────────

class RoleSchema(BaseModel):
    id: Union[str, UUID]
    name: str
    description: Optional[str] = None
    permissions: Optional[List[str]] = None
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RolePermissionsUpdate(BaseModel):
    permissions: List[str]
