from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from decimal import Decimal

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

class FamilyMemberSchema(BaseModel):
    name: str
    relation: str
    gender: str
    age: int
    education: Optional[str] = None
    occupation: Optional[str] = None
    nid: Optional[str] = None

class HouseholdBase(BaseModel):
    matrix_house_no: str = Field(alias="matrixHouseNo")
    legacy_house_no: Optional[str] = Field(None, alias="legacyHouseNo")
    former_vdc: Optional[str] = Field(None, alias="formerVdc")
    ward_number: int = Field(alias="wardNumber")
    tole: Optional[str] = Field(None, alias="tole")
    household_name: str = Field(alias="householdName")
    contact_phone: Optional[str] = Field(None, alias="contactPhone")
    head_gender: str = Field('female', alias="headGender")
    family_members: List[FamilyMemberSchema] = Field([], alias="familyMembers")
    gps_lat: Optional[Decimal] = Field(None, alias="gpsLat")
    gps_lon: Optional[Decimal] = Field(None, alias="gpsLon")
    address: str = 'पाँचपोखरी थाङपाल गाउँपालिका'
    is_at_risk: bool = Field(False, alias="isAtRisk")
    risk_level: str = Field('low', alias="riskLevel")
    verification_status: str = Field('approved', alias="verificationStatus")

    class Config:
        populate_by_name = True

class HouseholdCreate(HouseholdBase):
    pass

class HouseholdResponse(HouseholdBase):
    id: Any
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class DashboardStats(BaseModel):
    total_households: int
    total_population: int
    male_count: int
    female_count: int
    at_risk_households: int
    safe_households: int
