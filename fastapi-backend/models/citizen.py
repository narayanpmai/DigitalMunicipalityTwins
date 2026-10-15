from sqlalchemy import Column, String, Integer, Boolean, Date, DateTime, JSON
from core.database import Base
from datetime import datetime

class Citizen(Base):
    __tablename__ = 'citizens'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    full_name = Column(String, nullable=False, name='fullName')
    full_name_en = Column(String, nullable=True, name='fullNameEn')
    citizenship_no = Column(String, nullable=True, name='citizenshipNo')
    national_id = Column(String, nullable=True, name='nationalId')
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    gender = Column(String, nullable=True)  # 'male' | 'female' | 'other'
    date_of_birth = Column(Date, nullable=True, name='dateOfBirth')
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    address = Column(String, nullable=True)
    tole = Column(String, nullable=True)
    father_name = Column(String, nullable=True, name='fatherName')
    mother_name = Column(String, nullable=True, name='motherName')
    spouse_name = Column(String, nullable=True, name='spouseName')
    occupation = Column(String, nullable=True)
    education = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, name='isActive')
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')
