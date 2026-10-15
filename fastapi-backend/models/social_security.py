from sqlalchemy import Column, String, Integer, Numeric, DateTime
from core.database import Base
from datetime import datetime

class SocialSecurityBeneficiary(Base):
    __tablename__ = 'social_security_beneficiaries'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    beneficiary_id = Column(String, unique=True, name='beneficiaryId')
    full_name = Column(String, name='fullName')
    full_name_en = Column(String, nullable=True, name='fullNameEn')
    
    citizenship_or_nid_no = Column(String, name='citizenshipOrNidNo')
    category = Column(String, default='जेष्ठ नागरिक (६८ वर्ष माथि)')
    ward_number = Column(Integer, name='wardNumber')
    
    tole_village = Column(String, nullable=True, name='toleVillage')
    gender = Column(String, nullable=True)
    date_of_birth_bs = Column(String, nullable=True, name='dateOfBirthBs')
    contact_phone = Column(String, nullable=True, name='contactPhone')
    guardian_name = Column(String, nullable=True, name='guardianName')
    
    bank_name = Column(String, nullable=True, name='bankName')
    bank_account_no = Column(String, nullable=True, name='bankAccountNo')
    
    monthly_allowance_npr = Column(Numeric(10, 2), default=4000, name='monthlyAllowanceNPR')
    quarterly_allowance_npr = Column(Numeric(10, 2), default=12000, name='quarterlyAllowanceNPR')
    
    status = Column(String, default='सक्रिय')
    fiscal_year = Column(String, default='२०८१/०८२', nullable=True, name='fiscalYear')
    
    renewal_date_bs = Column(String, nullable=True, name='renewalDateBs')
    cancellation_date_bs = Column(String, nullable=True, name='cancellationDateBs')
    cancellation_reason = Column(String, nullable=True, name='cancellationReason')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
