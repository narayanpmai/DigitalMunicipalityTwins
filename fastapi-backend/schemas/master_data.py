from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class AuditSchema(BaseModel):
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

# --- Wards ---
class WardBase(BaseModel):
    ward_number: int
    population: Optional[int] = None
    area_sq_km: Optional[float] = None
    boundary_geojson: Optional[Dict[str, Any]] = None

class WardCreate(WardBase):
    pass

class WardResponse(WardBase, AuditSchema):
    id: str
    class Config:
        from_attributes = True


# --- Toles ---
class ToleBase(BaseModel):
    ward_id: str
    tole_name: str
    tole_name_en: Optional[str] = None
    boundary_geojson: Optional[Dict[str, Any]] = None

class ToleCreate(ToleBase):
    pass

class ToleResponse(ToleBase, AuditSchema):
    id: str
    class Config:
        from_attributes = True


# --- Address ---
class AddressBase(BaseModel):
    ward_id: str
    tole_id: Optional[str] = None
    street_name: Optional[str] = None
    house_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase, AuditSchema):
    id: str
    class Config:
        from_attributes = True


# --- Citizen ---
class CitizenBase(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    full_name_en: Optional[str] = None
    dob_bs: Optional[str] = None
    dob_ad: Optional[date] = None
    gender: Optional[str] = None
    citizenship_no: Optional[str] = None
    national_id: Optional[str] = None
    mobile_no: Optional[str] = None
    relationship_to_head: Optional[str] = None
    household_id: Optional[str] = None

class CitizenCreate(CitizenBase):
    pass

class CitizenResponse(CitizenBase, AuditSchema):
    id: str
    class Config:
        from_attributes = True


# --- Household ---
class HouseholdBase(BaseModel):
    address_id: str
    head_of_household_id: Optional[str] = None
    household_number: str
    water_source: Optional[str] = None
    electricity_type: Optional[str] = None
    fuel_type: Optional[str] = None
    toilet_type: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None

class HouseholdCreate(HouseholdBase):
    pass

class HouseholdResponse(HouseholdBase, AuditSchema):
    id: str
    members: Optional[List[CitizenResponse]] = []
    class Config:
        from_attributes = True


# --- Organization ---
class OrganizationBase(BaseModel):
    org_type: str
    name: str
    registration_no: Optional[str] = None
    address_id: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    established_date_bs: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase, AuditSchema):
    id: str
    class Config:
        from_attributes = True


# --- Business ---
class BusinessBase(BaseModel):
    owner_id: str
    business_name: str
    pan_vat_no: Optional[str] = None
    registration_no: Optional[str] = None
    business_type: Optional[str] = None
    capital: Optional[float] = None
    address_id: Optional[str] = None

class BusinessCreate(BusinessBase):
    pass

class BusinessResponse(BusinessBase, AuditSchema):
    id: str
    class Config:
        from_attributes = True


# --- Asset & Infrastructure ---
class AssetBase(BaseModel):
    asset_category: str
    asset_name: str
    specification: Optional[str] = None
    purchase_date: Optional[date] = None
    cost: Optional[float] = None
    condition: Optional[str] = None
    assigned_to: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetResponse(AssetBase, AuditSchema):
    id: str
    class Config:
        from_attributes = True


class InfrastructureBase(BaseModel):
    infra_type: str
    name: str
    ward_id: Optional[str] = None
    length_or_capacity: Optional[str] = None
    built_year: Optional[str] = None
    geometry_geojson: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class InfrastructureCreate(InfrastructureBase):
    pass

class InfrastructureResponse(InfrastructureBase, AuditSchema):
    id: str
    class Config:
        from_attributes = True
