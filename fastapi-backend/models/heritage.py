"""
Heritage and Cultural Museum Database Models
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Aligned with PostgreSQL schema
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid


class HeritageSite(Base):
    __tablename__ = 'heritage_sites'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(String, nullable=True, name='siteId')
    name_en = Column(String, nullable=True, name='nameEn')
    name_np = Column(String, nullable=False, name='nameNp')
    type = Column(String, default='धार्मिक/प्राकृतिक')
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    description = Column(Text, nullable=True)
    introduction = Column(Text, nullable=True)
    importance = Column(Text, nullable=True)
    photos = Column(Text, nullable=True)  # Comma-separated URLs or JSON string
    video_url = Column(String, nullable=True, name='videoUrl')
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default='Active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        photos_list = []
        if self.photos:
            if isinstance(self.photos, list):
                photos_list = self.photos
            elif isinstance(self.photos, str):
                photos_list = [p.strip() for p in self.photos.split(',') if p.strip()]

        return {
            "id": str(self.id),
            "siteId": self.site_id or f"SIT-{str(self.id)[:6]}",
            "nameEn": self.name_en or "",
            "nameNp": self.name_np,
            "type": self.type or "धार्मिक/प्राकृतिक",
            "wardNumber": self.ward_number,
            "description": self.description or "",
            "introduction": self.introduction or "",
            "importance": self.importance or "",
            "photos": photos_list,
            "photoUrl": photos_list[0] if photos_list else "",
            "videoUrl": self.video_url or "",
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status or "Active",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class MuseumAsset(Base):
    __tablename__ = 'museum_assets'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(String, nullable=True, name='assetId')
    name_en = Column(String, nullable=True, name='nameEn')
    name_np = Column(String, nullable=False, name='nameNp')
    category = Column(String, default='ऐतिहासिक कलाकृति')
    sub_category = Column(String, nullable=True, name='subCategory')
    history = Column(Text, nullable=True)
    usage = Column(Text, nullable=True)
    origin = Column(String, nullable=True)
    estimated_period = Column(String, nullable=True, name='estimatedPeriod')
    material = Column(String, nullable=True)
    condition = Column(String, default='सामान्य राम्रो')
    museum_location = Column(String, nullable=True, name='museumLocation')
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    photo_url = Column(Text, nullable=True, name='photoUrl')
    video_url = Column(Text, nullable=True, name='videoUrl')
    audio_url = Column(Text, nullable=True, name='audioUrl')
    model3d_url = Column(Text, nullable=True, name='model3dUrl')
    qr_code_url = Column(Text, nullable=True, name='qrCodeUrl')
    verification_status = Column(String, default='Published', name='verificationStatus')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "assetId": self.asset_id or f"MUS-{str(self.id)[:6]}",
            "nameNp": self.name_np,
            "nameEn": self.name_en or "",
            "name": self.name_np,
            "category": self.category or "ऐतिहासिक कलाकृति",
            "subCategory": self.sub_category or "",
            "history": self.history or "",
            "usage": self.usage or "",
            "origin": self.origin or "",
            "estimatedPeriod": self.estimated_period or "",
            "era": self.estimated_period or "",
            "material": self.material or "",
            "condition": self.condition or "सामान्य राम्रो",
            "museumLocation": self.museum_location or "",
            "latitude": self.latitude,
            "longitude": self.longitude,
            "photoUrl": self.photo_url or "",
            "videoUrl": self.video_url or "",
            "audioUrl": self.audio_url or "",
            "model3dUrl": self.model3d_url or "",
            "qrCodeUrl": self.qr_code_url or "",
            "verificationStatus": self.verification_status or "Published",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class CulturalRecord(Base):
    __tablename__ = 'cultural_records'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    record_id = Column(String, nullable=False, unique=True, name='recordId')
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    interviewee_name = Column(String, nullable=True, name='intervieweeName')
    interviewer_name = Column(String, nullable=True, name='interviewerName')
    interview_date = Column(DateTime, nullable=True, name='interviewDate')
    audio_url = Column(String, nullable=True, name='audioUrl')
    video_url = Column(String, nullable=True, name='videoUrl')
    transcript_url = Column(String, nullable=True, name='transcriptUrl')
    verification_status = Column(String, default='Draft', nullable=False, name='verificationStatus')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenant_id": self.tenant_id,
            "recordId": self.record_id,
            "title": self.title,
            "type": self.type,
            "description": self.description or "",
            "location": self.location or "",
            "latitude": self.latitude,
            "longitude": self.longitude,
            "intervieweeName": self.interviewee_name or "",
            "interviewerName": self.interviewer_name or "",
            "interviewDate": self.interview_date.isoformat() if self.interview_date else None,
            "audioUrl": self.audio_url or "",
            "videoUrl": self.video_url or "",
            "transcriptUrl": self.transcript_url or "",
            "verificationStatus": self.verification_status or "Draft",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

