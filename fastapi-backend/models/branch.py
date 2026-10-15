from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON
from core.database import Base
from datetime import datetime

class Branch(Base):
    __tablename__ = 'branches'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    type = Column(String, default='palika')  # 'palika' | 'ward'
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    description = Column(String, nullable=True)
    roles_and_responsibilities = Column(JSON, nullable=True, name='rolesAndResponsibilities')
    head_employee_name = Column(String, nullable=True, name='headEmployeeName')
    head_employee_id = Column(String, nullable=True, name='headEmployeeId')
    contact_phone = Column(String, nullable=True, name='contactPhone')
    email = Column(String, nullable=True)
    is_information_officer_branch = Column(Boolean, default=False, name='isInformationOfficerBranch')
    is_grievance_officer_branch = Column(Boolean, default=False, name='isGrievanceOfficerBranch')
    status = Column(String, default='active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
