from sqlalchemy import Column, String, Integer, Boolean, Float, Date, DateTime, JSON, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime

class Household(Base):
    __tablename__ = 'household_registries'

    id = Column(String, primary_key=True, index=True)
    tenant_id = Column(String, nullable=True)
    matrix_house_no = Column(String(64), unique=True, index=True, name='matrixHouseNo')
    legacy_house_no = Column(String(64), nullable=True, name='legacyHouseNo')
    former_vdc = Column(String(100), nullable=True, name='formerVdc')
    citizenship_no = Column(String(50), nullable=True, name='citizenshipNo')
    ethnicity = Column(String(100), nullable=True)
    storeys = Column(Integer, default=2, nullable=True)
    toilet_type = Column(String(100), nullable=True, name='toiletType')
    cooking_fuel = Column(String(100), nullable=True, name='cookingFuel')
    
    # ── १. जग्गा तथा कानुनी स्वामित्व (Land & Cadastral) ──
    cadastral_parcel_no = Column(String(50), nullable=True, name='cadastralParcelNo')
    land_ownership = Column(String(100), nullable=True, name='landOwnership')
    
    # ── २. आवास संरचना तथा भवन संहिता (NBC & Reconstruction) ──
    building_permit_status = Column(String(100), nullable=True, name='buildingPermitStatus')
    reconstruction_status = Column(String(100), nullable=True, name='reconstructionStatus')
    
    # ── ३. खानेपानी शुद्धीकरण (WASH Purification) ──
    water_purification = Column(String(100), nullable=True, name='waterPurification')
    
    # ── ४. विपद् तथा सुरक्षित आश्रयस्थल दूरी (Evacuation Access) ──
    safe_shelter_distance_mins = Column(Integer, default=15, nullable=True, name='safeShelterDistanceMins')
    
    # ── ५. सामाजिक सुरक्षा, अपाङ्गता तथा लक्षित वर्ग (Vulnerability & Social Security) ──
    disability_count = Column(Integer, default=0, nullable=True, name='disabilityCount')
    disability_card_type = Column(String(50), nullable=True, name='disabilityCardType')
    social_security_count = Column(Integer, default=0, nullable=True, name='socialSecurityCount')
    foreign_migrants_count = Column(Integer, default=0, nullable=True, name='foreignMigrantsCount')
    
    ward_number = Column(Integer, name='wardNumber')
    sequence = Column(Integer, default=1)
    household_name = Column(String(200), name='householdName')
    contact_phone = Column(String(40), nullable=True, name='contactPhone')
    head_gender = Column(String(20), default='female', name='headGender')
    
    family_members = Column(JSON, default=list, name='familyMembers')
    gps_lat = Column(Numeric(10, 7), nullable=True, name='gpsLat')
    gps_lon = Column(Numeric(10, 7), nullable=True, name='gpsLon')
    tole = Column(String, nullable=True)
    address = Column(String, default='पाँचपोखरी थाङपाल गाउँपालिका')
    house_type = Column(String, default='semi-permanent', name='houseType')
    drinking_water_source = Column(String, default='धाराको पानी (Piped Water)', name='drinkingWaterSource')
    
    is_at_risk = Column(Boolean, default=False, name='isAtRisk')
    is_riverbank_house = Column(Boolean, default=False, name='isRiverbankHouse')
    risk_score = Column(Integer, default=1, name='riskScore')
    risk_level = Column(String(20), default='low', name='riskLevel')
    risk_details = Column(String, nullable=True, name='riskDetails')
    
    qr_token = Column(String(64), unique=True, name='qrToken')
    verification_status = Column(String(20), default='approved', name='verificationStatus')
    verification_remarks = Column(String, nullable=True, name='verificationRemarks')
    verified_at = Column(DateTime, nullable=True, name='verifiedAt')
    submitted_by_public = Column(Boolean, default=False, name='submittedByPublic')
    meta_data = Column(JSON, nullable=True, name='meta')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

class DemographicCategory(Base):
    __tablename__ = 'demographic_categories'
    
    id = Column(String, primary_key=True)
    code = Column(String(64), unique=True)
    name = Column(String(160))
    name_en = Column(String(160), nullable=True)
    description = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    indicators = relationship("DemographicIndicator", back_populates="category")

class DemographicIndicator(Base):
    __tablename__ = 'demographic_indicators'
    
    id = Column(String, primary_key=True)
    code = Column(String(80), unique=True)
    name = Column(String(200))
    name_en = Column(String(200), nullable=True)
    description = Column(String, nullable=True)
    unit_type = Column(String(20), default='count')
    source_year = Column(Integer, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    category_id = Column(String, ForeignKey('demographic_categories.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    category = relationship("DemographicCategory", back_populates="indicators")
    values = relationship("DemographicValue", back_populates="indicator")

class DemographicValue(Base):
    __tablename__ = 'demographic_values'
    
    id = Column(String, primary_key=True)
    tenant_id = Column(String, nullable=True)
    local_level_name = Column(String, default='Panchpokhari Thangpal')
    indicator_id = Column(String, ForeignKey('demographic_indicators.id'))
    segment_key = Column(String(64), default='total')
    segment_label = Column(String(120), default='Total')
    ward_number = Column(Integer, nullable=True)
    value_number = Column(Numeric(20, 4), nullable=True)
    value_text = Column(String, nullable=True)
    source_note = Column(String, nullable=True)
    captured_on = Column(Date, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    indicator = relationship("DemographicIndicator", back_populates="values")
