from pydantic import BaseModel, Field
from typing import Optional, List, Any, Union
from datetime import datetime
import uuid


class HeritageSiteBase(BaseModel):
    site_id: Optional[str] = Field(None, alias="siteId")
    name_en: Optional[str] = Field(None, alias="nameEn")
    name_np: str = Field(..., alias="nameNp")
    type: Optional[str] = 'धार्मिक/प्राकृतिक'
    ward_number: Optional[int] = Field(None, alias="wardNumber")
    description: Optional[str] = None
    introduction: Optional[str] = None
    importance: Optional[str] = None
    photos: Optional[Union[List[str], str]] = None
    video_url: Optional[str] = Field(None, alias="videoUrl")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = 'Active'

    class Config:
        allow_population_by_field_name = True


class HeritageSiteCreate(HeritageSiteBase):
    pass


class HeritageSiteSchema(HeritageSiteBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        from_attributes = True
        allow_population_by_field_name = True


class MuseumAssetBase(BaseModel):
    asset_id: Optional[str] = Field(None, alias="assetId")
    name_np: str = Field(..., alias="nameNp")
    name_en: Optional[str] = Field(None, alias="nameEn")
    category: str = 'ऐतिहासिक कलाकृति'
    sub_category: Optional[str] = Field(None, alias="subCategory")
    history: Optional[str] = None
    usage: Optional[str] = None
    origin: Optional[str] = None
    estimated_period: Optional[str] = Field(None, alias="estimatedPeriod")
    material: Optional[str] = None
    condition: Optional[str] = 'सामान्य राम्रो'
    museum_location: Optional[str] = Field(None, alias="museumLocation")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    video_url: Optional[str] = Field(None, alias="videoUrl")
    audio_url: Optional[str] = Field(None, alias="audioUrl")
    model3d_url: Optional[str] = Field(None, alias="model3dUrl")
    qr_code_url: Optional[str] = Field(None, alias="qrCodeUrl")
    verification_status: Optional[str] = Field('Published', alias="verificationStatus")

    class Config:
        allow_population_by_field_name = True


class MuseumAssetCreate(MuseumAssetBase):
    pass


class MuseumAssetUpdate(BaseModel):
    name_np: Optional[str] = Field(None, alias="nameNp")
    name_en: Optional[str] = Field(None, alias="nameEn")
    category: Optional[str] = None
    sub_category: Optional[str] = Field(None, alias="subCategory")
    history: Optional[str] = None
    usage: Optional[str] = None
    origin: Optional[str] = None
    estimated_period: Optional[str] = Field(None, alias="estimatedPeriod")
    material: Optional[str] = None
    condition: Optional[str] = None
    museum_location: Optional[str] = Field(None, alias="museumLocation")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    video_url: Optional[str] = Field(None, alias="videoUrl")
    audio_url: Optional[str] = Field(None, alias="audioUrl")
    model3d_url: Optional[str] = Field(None, alias="model3dUrl")
    qr_code_url: Optional[str] = Field(None, alias="qrCodeUrl")
    verification_status: Optional[str] = Field(None, alias="verificationStatus")

    class Config:
        allow_population_by_field_name = True


class MuseumAssetSchema(MuseumAssetBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")

    class Config:
        from_attributes = True
        allow_population_by_field_name = True


class MuseumStatsSchema(BaseModel):
    total: int
    published: int
    verified: int
    draft: int
    needsRestoration: int
    with3dModel: Optional[int] = 0
    withAudio: Optional[int] = 0
