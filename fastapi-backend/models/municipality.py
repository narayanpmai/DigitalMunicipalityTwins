from sqlalchemy import Column, String, Integer, Float, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from core.database import Base
from datetime import datetime
import uuid


class MunicipalityProfile(Base):
    __tablename__ = 'municipality_profile'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, name='tenant_id')

    name_np = Column(String, default='पाँचपोखरी थाङपाल गाउँपालिका', name='nameNp')
    name_en = Column(String, default='Panchpokhari Thangpal Rural Municipality', name='nameEn')
    district = Column(String, default='सिन्धुपाल्चोक')
    province = Column(String, default='बागमती प्रदेश')
    type = Column(String, default='गाउँपालिका')
    headquarters = Column(String, default='थाङपालधाप')
    elevation_meters = Column(String, default='१,१०० - ४,१०० मी.', name='elevationMeters')
    area_sq_km = Column(Float, nullable=True, name='areaSqKm')
    ward_count = Column(Integer, default=8, name='wardCount')
    introduction = Column(Text, nullable=True)

    # Quick Stats
    total_population = Column(Integer, nullable=True, name='totalPopulation')
    total_households = Column(Integer, nullable=True, name='totalHouseholds')
    total_schools = Column(Integer, nullable=True, name='totalSchools')
    total_health_posts = Column(Integer, nullable=True, name='totalHealthPosts')

    # Geography
    geography = Column(Text, nullable=True)
    major_rivers = Column(Text, nullable=True, name='majorRivers')
    major_religious_sites = Column(Text, nullable=True, name='majorReligiousSites')
    major_tourist_sites = Column(Text, nullable=True, name='majorTouristSites')

    # AI & Media
    ai_summary = Column(Text, nullable=True, name='aiSummary')
    panorama_url = Column(Text, nullable=True, name='panoramaUrl')

    # Financials
    annual_budget = Column(String, default='रु. ५८.४५ करोड', name='annualBudget')
    internal_revenue = Column(String, default='रु. २.८ करोड', name='internalRevenue')

    # JSON fields
    boundaries = Column(JSONB, nullable=True)
    cultural_identity = Column(JSONB, nullable=True, name='culturalIdentity')
    good_practices = Column(JSONB, nullable=True, name='goodPractices')
    leadership = Column(JSONB, nullable=True)
    demographics = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')


class SectorProfile(Base):
    __tablename__ = 'sector_profile'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, name='tenant_id')

    sector_name = Column(String, nullable=False, name='sectorName')
    description = Column(Text, nullable=True)
    stats = Column(JSONB, nullable=True)
    highlights = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
