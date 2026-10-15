from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any, Dict, List
from datetime import datetime


class BoundariesSchema(BaseModel):
    east: Optional[str] = None
    west: Optional[str] = None
    north: Optional[str] = None
    south: Optional[str] = None


class LeaderSchema(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class LeadershipSchema(BaseModel):
    mayor: Optional[LeaderSchema] = None
    deputy_mayor: Optional[LeaderSchema] = Field(None, alias="deputyMayor")
    chief_officer: Optional[LeaderSchema] = Field(None, alias="chiefOfficer")
    spokesperson: Optional[LeaderSchema] = None


class MunicipalityProfileUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    name_np: Optional[str] = Field(None, alias="nameNp")
    name_en: Optional[str] = Field(None, alias="nameEn")
    district: Optional[str] = None
    province: Optional[str] = None
    type: Optional[str] = None
    headquarters: Optional[str] = None
    elevation_meters: Optional[str] = Field(None, alias="elevationMeters")
    area_sq_km: Optional[float] = Field(None, alias="areaSqKm")
    ward_count: Optional[int] = Field(None, alias="wardCount")
    introduction: Optional[str] = None
    total_population: Optional[int] = Field(None, alias="totalPopulation")
    total_households: Optional[int] = Field(None, alias="totalHouseholds")
    total_schools: Optional[int] = Field(None, alias="totalSchools")
    total_health_posts: Optional[int] = Field(None, alias="totalHealthPosts")
    geography: Optional[str] = None
    major_rivers: Optional[str] = Field(None, alias="majorRivers")
    major_religious_sites: Optional[str] = Field(None, alias="majorReligiousSites")
    major_tourist_sites: Optional[str] = Field(None, alias="majorTouristSites")
    ai_summary: Optional[str] = Field(None, alias="aiSummary")
    panorama_url: Optional[str] = Field(None, alias="panoramaUrl")
    annual_budget: Optional[str] = Field(None, alias="annualBudget")
    internal_revenue: Optional[str] = Field(None, alias="internalRevenue")
    boundaries: Optional[Any] = None
    cultural_identity: Optional[Any] = Field(None, alias="culturalIdentity")
    good_practices: Optional[Any] = Field(None, alias="goodPractices")
    leadership: Optional[Any] = None
    leaders: Optional[Any] = None


class MunicipalityProfileSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: Optional[str] = None
    tenant_id: Optional[str] = None
    name_np: Optional[str] = Field(None, alias="nameNp")
    name_en: Optional[str] = Field(None, alias="nameEn")
    district: Optional[str] = None
    province: Optional[str] = None
    type: Optional[str] = None
    headquarters: Optional[str] = None
    elevation_meters: Optional[str] = Field(None, alias="elevationMeters")
    area_sq_km: Optional[float] = Field(None, alias="areaSqKm")
    ward_count: Optional[int] = Field(None, alias="wardCount")
    introduction: Optional[str] = None
    total_population: Optional[int] = Field(None, alias="totalPopulation")
    total_households: Optional[int] = Field(None, alias="totalHouseholds")
    total_schools: Optional[int] = Field(None, alias="totalSchools")
    total_health_posts: Optional[int] = Field(None, alias="totalHealthPosts")
    geography: Optional[str] = None
    major_rivers: Optional[str] = Field(None, alias="majorRivers")
    major_religious_sites: Optional[str] = Field(None, alias="majorReligiousSites")
    major_tourist_sites: Optional[str] = Field(None, alias="majorTouristSites")
    ai_summary: Optional[str] = Field(None, alias="aiSummary")
    panorama_url: Optional[str] = Field(None, alias="panoramaUrl")
    annual_budget: Optional[str] = Field(None, alias="annualBudget")
    internal_revenue: Optional[str] = Field(None, alias="internalRevenue")
    boundaries: Optional[Any] = None
    cultural_identity: Optional[Any] = Field(None, alias="culturalIdentity")
    good_practices: Optional[Any] = Field(None, alias="goodPractices")
    leadership: Optional[Any] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")


class SectorProfileBase(BaseModel):
    sector_name: str
    description: Optional[str] = None
    stats: Optional[Any] = None
    highlights: Optional[Any] = None
    tenant_id: Optional[str] = None


class SectorProfileCreate(SectorProfileBase):
    pass


class SectorProfileUpdate(BaseModel):
    sector_name: Optional[str] = None
    description: Optional[str] = None
    stats: Optional[Any] = None
    highlights: Optional[Any] = None


class SectorProfileSchema(SectorProfileBase):
    id: Any
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

