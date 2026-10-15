from sqlalchemy import Column, String, Integer, Numeric, DateTime, Float, JSON
from core.database import Base
from datetime import datetime

class SocialInclusionRecord(Base):
    __tablename__ = 'social_inclusion_records'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    category = Column(String, default='women_children')
    ward_number = Column(Integer, default=1, name='wardNumber')
    fiscal_year = Column(String, default='२०८१/०८२', name='fiscalYear')
    
    title = Column(String)
    service_type = Column(String, nullable=True, name='serviceType')
    sub_category = Column(String, nullable=True, name='subCategory')
    
    beneficiaries_count = Column(Integer, default=0, name='beneficiariesCount')
    female_beneficiaries = Column(Integer, default=0, name='femaleBeneficiaries')
    male_beneficiaries = Column(Integer, default=0, name='maleBeneficiaries')
    
    disability_card_type = Column(String, nullable=True, name='disabilityCardType')
    target_group = Column(String, nullable=True, name='targetGroup')
    
    budget_allocated = Column(Numeric(12, 2), default=0, name='budgetAllocated')
    budget_spent = Column(Numeric(12, 2), default=0, name='budgetSpent')
    
    coordinator_name = Column(String, nullable=True, name='coordinatorName')
    coordinator_phone = Column(String, nullable=True, name='coordinatorPhone')
    
    location = Column(String, nullable=True)
    address = Column(String, default='पाँचपोखरी थाङपाल गा.पा.')
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    status = Column(String, default='regular')
    remarks = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')
