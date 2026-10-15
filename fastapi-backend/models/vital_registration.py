from sqlalchemy import Column, String, Integer, Boolean, Float, Date, DateTime, JSON, ForeignKey, Numeric
from core.database import Base
from datetime import datetime

class VitalEvent(Base):
    __tablename__ = 'vital_events'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    registration_no = Column(String, unique=True, name='registrationNo')
    event_type = Column(String, default='जन्म दर्ता', name='eventType')
    status = Column(String, default='आवेदन प्राप्त')
    person_name = Column(String, name='personName')
    person_name_en = Column(String, nullable=True, name='personNameEn')
    gender = Column(String, nullable=True)
    event_date_bs = Column(String, nullable=True, name='eventDateBs')
    event_place = Column(String, nullable=True, name='eventPlace')
    father_name = Column(String, nullable=True, name='fatherName')
    mother_name = Column(String, nullable=True, name='motherName')
    spouse_name = Column(String, nullable=True, name='spouseName')
    applicant_name = Column(String, name='applicantName')
    applicant_relation = Column(String, nullable=True, name='applicantRelation')
    applicant_citizenship = Column(String, nullable=True, name='applicantCitizenship')
    applicant_phone = Column(String, nullable=True, name='applicantPhone')
    ward_number = Column(Integer, default=1, name='wardNumber')
    registration_date_bs = Column(String, nullable=True, name='registrationDateBs')
    issued_date_bs = Column(String, nullable=True, name='issuedDateBs')
    registrar_name = Column(String, nullable=True, name='registrarName')
    qr_code = Column(String, nullable=True, name='qrCode')
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')
