from sqlalchemy import Column, String, Integer, Numeric, DateTime, Date
from core.database import Base
from datetime import datetime

class Contract(Base):
    __tablename__ = 'contracts'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    contract_no = Column(String, name='contractNo')
    title = Column(String)
    contractor_name = Column(String, nullable=True, name='contractorName')
    contractor_phone = Column(String, nullable=True, name='contractorPhone')
    contractor_pan = Column(String, nullable=True, name='contractorPAN')
    status = Column(String, default='draft')
    
    contract_amount = Column(Numeric(15, 2), default=0, name='contractAmount')
    paid_amount = Column(Numeric(15, 2), default=0, name='paidAmount')
    
    fiscal_year = Column(String, nullable=True, name='fiscalYear')
    project_id = Column(String, nullable=True, name='projectId')
    sector = Column(String, nullable=True)
    
    start_date = Column(Date, nullable=True, name='startDate')
    end_date = Column(Date, nullable=True, name='endDate')
    completion_date = Column(Date, nullable=True, name='completionDate')
    
    progress_percent = Column(Integer, default=0, name='progressPercent')
    description = Column(String, nullable=True)
    document_url = Column(String, nullable=True, name='documentUrl')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')
