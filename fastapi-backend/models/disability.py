from sqlalchemy import Column, String, Integer, Numeric, DateTime
from core.database import Base
from datetime import datetime

class DisabilityRecord(Base):
    __tablename__ = 'disability_data'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    fiscal_year = Column(String, name='fiscalYear')
    
    total_beneficiaries = Column(Integer, nullable=True, name='totalBeneficiaries')
    total_households = Column(Integer, nullable=True, name='totalHouseholds')
    
    physical_disability = Column(Integer, nullable=True, name='physicalDisability')
    visual_impairment = Column(Integer, nullable=True, name='visualImpairment')
    hearing_impairment = Column(Integer, nullable=True, name='hearingImpairment')
    intellectual_disability = Column(Integer, nullable=True, name='intellectualDisability')
    multiple_disabilities = Column(Integer, nullable=True, name='multipleDisabilities')
    
    allowance_recipients = Column(Integer, nullable=True, name='allowanceRecipients')
    total_allowance_amount = Column(Numeric(10, 2), nullable=True, name='totalAllowanceAmount')
    
    in_school = Column(Integer, nullable=True, name='inSchool')
    employed = Column(Integer, nullable=True)
    
    programs = Column(String, nullable=True)
    challenges = Column(String, nullable=True)
    achievements = Column(String, nullable=True)
    
    data_collected_by = Column(String, nullable=True, name='dataCollectedBy')
    data_collected_at = Column(DateTime, nullable=True, name='dataCollectedAt')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
