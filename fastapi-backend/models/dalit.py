from sqlalchemy import Column, String, Integer, DateTime
from core.database import Base
from datetime import datetime

class DalitRecord(Base):
    __tablename__ = 'dalit_data'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    fiscal_year = Column(String, name='fiscalYear')
    
    total_beneficiaries = Column(Integer, nullable=True, name='totalBeneficiaries')
    total_households = Column(Integer, nullable=True, name='totalHouseholds')
    
    total_dalit_population = Column(Integer, nullable=True, name='totalDalitPopulation')
    dalit_households = Column(Integer, nullable=True, name='dalitHouseholds')
    
    dalit_students = Column(Integer, nullable=True, name='dalitStudents')
    scholarship_recipients = Column(Integer, nullable=True, name='scholarshipRecipients')
    
    employed_in_government = Column(Integer, nullable=True, name='employedInGovernment')
    discrimination_cases = Column(Integer, nullable=True, name='discriminationCases')
    
    programs = Column(String, nullable=True)
    challenges = Column(String, nullable=True)
    achievements = Column(String, nullable=True)
    
    data_collected_by = Column(String, nullable=True, name='dataCollectedBy')
    data_collected_at = Column(DateTime, nullable=True, name='dataCollectedAt')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
