from sqlalchemy import Column, String, Integer, Numeric, DateTime
from core.database import Base
from datetime import datetime

class EmploymentLabourBank(Base):
    __tablename__ = 'employment_labour_bank'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    worker_id = Column(String, unique=True, name='workerId')
    full_name = Column(String, name='fullName')
    citizenship_no = Column(String, nullable=True, name='citizenshipNo')
    gender = Column(String, default='पुरुष')
    
    ward_number = Column(Integer, name='wardNumber')
    tole_village = Column(String, nullable=True, name='toleVillage')
    contact_phone = Column(String, nullable=True, name='contactPhone')
    
    skill_category = Column(String, default='सामान्य निर्माण श्रमिक (General Construction)', name='skillCategory')
    skill_level = Column(String, default='सामान्य (Unskilled)', name='skillLevel')
    
    daily_wage_rate = Column(Numeric(10, 2), default=850, name='dailyWageRate')
    guaranteed_days_allocated = Column(Integer, default=100, name='guaranteedDaysAllocated')
    total_days_worked = Column(Integer, default=0, name='totalDaysWorked')
    total_wage_paid = Column(Numeric(12, 2), default=0, name='totalWagePaid')
    
    allocated_project = Column(String, nullable=True, name='allocatedProject')
    
    bank_name = Column(String, nullable=True, name='bankName')
    bank_account_no = Column(String, nullable=True, name='bankAccountNo')
    
    status = Column(String, default='सूचीकृत (Registered)')
    pmep_fiscal_year = Column(String, default='२०८०/०८१', name='pmepFiscalYear')
    registered_date_bs = Column(String, nullable=True, name='registeredDateBs')
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')


class EmploymentProject(Base):
    __tablename__ = 'employment_projects'
    
    id = Column(String, primary_key=True)
    project_code = Column(String, unique=True, name='project_code')
    title = Column(String, name='title')
    ward_number = Column(Integer, name='ward_number')
    tole_village = Column(String, nullable=True, name='tole_village')
    allocated_budget = Column(Numeric(14, 2), default=0, name='allocated_budget')
    target_person_days = Column(Integer, default=100, name='target_person_days')
    completed_person_days = Column(Integer, default=0, name='completed_person_days')
    daily_wage_rate = Column(Numeric(10, 2), default=850, name='daily_wage_rate')
    workers_count = Column(Integer, default=0, name='workers_count')
    supervisor_name = Column(String, nullable=True, name='supervisor_name')
    supervisor_phone = Column(String, nullable=True, name='supervisor_phone')
    status = Column(String, default='सञ्चालनमा (In Progress)', name='status')
    fiscal_year = Column(String, default='२०८१/०८२', name='fiscal_year')
    start_date_bs = Column(String, nullable=True, name='start_date_bs')
    end_date_bs = Column(String, nullable=True, name='end_date_bs')
    created_at = Column(DateTime, default=datetime.utcnow, name='created_at')


class EmploymentWorkLog(Base):
    __tablename__ = 'employment_work_logs'
    
    id = Column(String, primary_key=True)
    worker_id = Column(String, name='worker_id')
    worker_name = Column(String, name='worker_name')
    project_title = Column(String, name='project_title')
    ward_number = Column(Integer, name='ward_number')
    work_date_bs = Column(String, name='work_date_bs')
    days_worked = Column(Integer, default=1, name='days_worked')
    daily_wage_rate = Column(Numeric(10, 2), default=850, name='daily_wage_rate')
    wage_amount = Column(Numeric(12, 2), default=850, name='wage_amount')
    payout_status = Column(String, default='भुक्तानी बाँकी (Pending)', name='payout_status')
    voucher_no = Column(String, nullable=True, name='voucher_no')
    remarks = Column(String, nullable=True, name='remarks')
    created_at = Column(DateTime, default=datetime.utcnow, name='created_at')


class EmploymentLabourDemand(Base):
    __tablename__ = 'employment_labour_demands'
    
    id = Column(String, primary_key=True)
    employer_name = Column(String, name='employer_name')
    contact_person = Column(String, nullable=True, name='contact_person')
    contact_phone = Column(String, nullable=True, name='contact_phone')
    ward_number = Column(Integer, name='ward_number')
    skill_required = Column(String, name='skill_required')
    required_count = Column(Integer, default=1, name='required_count')
    daily_wage_offered = Column(Numeric(10, 2), default=1000, name='daily_wage_offered')
    work_duration_days = Column(Integer, default=30, name='work_duration_days')
    status = Column(String, default='माग दर्ता (Registered)', name='status')
    created_at = Column(DateTime, default=datetime.utcnow, name='created_at')
