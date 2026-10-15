from sqlalchemy import Column, String, Integer, DateTime
from core.database import Base
from datetime import datetime

class WomenChildren(Base):
    __tablename__ = 'women_children_data'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    fiscal_year = Column(String, name='fiscalYear')
    
    total_beneficiaries = Column(Integer, nullable=True, name='totalBeneficiaries')
    total_households = Column(Integer, nullable=True, name='totalHouseholds')
    
    pregnant_women = Column(Integer, nullable=True, name='pregnantWomen')
    lactating_mothers = Column(Integer, nullable=True, name='lactatingMothers')
    
    children_under_5 = Column(Integer, nullable=True, name='childrenUnder5')
    children_in_school = Column(Integer, nullable=True, name='childrenInSchool')
    malnourished_children = Column(Integer, nullable=True, name='malnourishedChildren')
    
    women_entrepreneurs = Column(Integer, nullable=True, name='womenEntrepreneurs')
    child_marriage_cases = Column(Integer, nullable=True, name='childMarriageCases')
    domestic_violence_cases = Column(Integer, nullable=True, name='domesticViolenceCases')
    
    programs = Column(String, nullable=True)
    challenges = Column(String, nullable=True)
    achievements = Column(String, nullable=True)
    
    data_collected_by = Column(String, nullable=True, name='dataCollectedBy')
    data_collected_at = Column(DateTime, nullable=True, name='dataCollectedAt')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
