from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Numeric, Boolean, JSON
from core.database import Base
from datetime import datetime

class Project(Base):
    __tablename__ = 'projects'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    project_code = Column(String, unique=True, name='projectCode')
    name = Column(String)
    name_en = Column(String, nullable=True, name='nameEn')
    description = Column(String, nullable=True)
    ward_number = Column(Integer, name='wardNumber')
    sector = Column(String)
    status = Column(String, default='planned')
    budget = Column(Numeric(15, 2))
    funding_source = Column(String, nullable=True, name='fundingSource')
    fiscal_year = Column(String, nullable=True, name='fiscalYear')
    start_date = Column(Date, nullable=True, name='startDate')
    completion_date = Column(Date, nullable=True, name='completionDate')
    contractor = Column(String, nullable=True)
    progress_percentage = Column(Numeric(5, 2), default=0, name='progressPercentage')
    beneficiary_count = Column(Integer, default=0, name='beneficiaryCount')
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    is_public = Column(Boolean, default=True, name='isPublic')
    marfat = Column(String, default='उपभोक्ता समिति')
    
    # Local Government Municipal Agreement & Committee Fields
    level = Column(String, default='गाउँपालिकास्तरीय')
    agreement_date_bs = Column(String, nullable=True, name='agreementDateBs')
    completion_date_bs = Column(String, nullable=True, name='completionDateBs')
    committee_name = Column(String, nullable=True, name='committeeName')
    committee_chair = Column(String, nullable=True, name='committeeChair')
    committee_secretary = Column(String, nullable=True, name='committeeSecretary')
    committee_treasurer = Column(String, nullable=True, name='committeeTreasurer')
    committee_phone = Column(String, nullable=True, name='committeePhone')
    palika_grant = Column(Numeric(15, 2), default=0, name='palikaGrant')
    community_contribution = Column(Numeric(15, 2), default=0, name='communityContribution')
    total_agreement_amount = Column(Numeric(15, 2), default=0, name='totalAgreementAmount')
    paid_amount = Column(Numeric(15, 2), default=0, name='paidAmount')
    financial_progress = Column(Numeric(5, 2), default=0, name='financialProgress')
    agreement_status = Column(String, default='सम्झौता हुन बाँकी', name='agreementStatus')
    budget_source = Column(String, nullable=True, name='budgetSource')
    budget_sub_head = Column(String, nullable=True, name='budgetSubHead')
    
    # Workflow Stages
    installment_details = Column(JSON, nullable=True, name='installmentDetails')
    monitoring_records = Column(JSON, nullable=True, name='monitoringRecords')
    measurement_book = Column(JSON, nullable=True, name='measurementBook')
    social_audit = Column(JSON, nullable=True, name='socialAudit')
    farfarak_details = Column(JSON, nullable=True, name='farfarakDetails')
    responsible_engineer = Column(String, nullable=True, name='responsibleEngineer')
    engineer_phone = Column(String, nullable=True, name='engineerPhone')
    monitoring_recommendation = Column(String, default='pending', name='monitoringRecommendation')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')
