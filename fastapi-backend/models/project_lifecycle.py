from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, Numeric, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class PlanProposal(Base):
    __tablename__ = 'proj_plan_proposals'
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    fiscal_year = Column(String, nullable=False)
    ward_id = Column(String, nullable=True) # Can be municipal level
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    estimated_cost = Column(Numeric(15, 2), default=0)
    priority = Column(String, default='Normal')
    status = Column(String, default='Proposed') # Proposed, Selected, Rejected
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    budget_allocations = relationship("BudgetAllocation", back_populates="plan")


class BudgetAllocation(Base):
    __tablename__ = 'proj_budget_allocations'
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String, ForeignKey('proj_plan_proposals.id'), nullable=False)
    budget_head_code = Column(String, nullable=False)
    source_of_fund = Column(String, nullable=False) # Internal, Federal, Provincial
    allocated_amount = Column(Numeric(15, 2), nullable=False)
    approved_date = Column(Date, nullable=True)
    
    plan = relationship("PlanProposal", back_populates="budget_allocations")
    procurement_plans = relationship("ProcurementPlan", back_populates="budget")


class ProcurementPlan(Base):
    __tablename__ = 'proj_procurement_plans'
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    budget_id = Column(String, ForeignKey('proj_budget_allocations.id'), nullable=False)
    procurement_method = Column(String, nullable=False) # Consumer Committee, Sealed Quotation, NCB
    estimated_amount = Column(Numeric(15, 2), nullable=False)
    tender_call_date = Column(Date, nullable=True)
    bid_opening_date = Column(Date, nullable=True)
    
    budget = relationship("BudgetAllocation", back_populates="procurement_plans")
    contracts = relationship("ProjectContract", back_populates="procurement")


class ProjectContract(Base):
    __tablename__ = 'proj_contracts'
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    procurement_id = Column(String, ForeignKey('proj_procurement_plans.id'), nullable=False)
    contractor_type = Column(String, nullable=False) # Committee, Company
    contractor_id = Column(String, nullable=False) # Links to BusinessMaster or OrganizationMaster
    contract_amount = Column(Numeric(15, 2), nullable=False)
    agreement_date = Column(Date, nullable=False)
    completion_deadline = Column(Date, nullable=False)
    status = Column(String, default='Active')
    
    procurement = relationship("ProcurementPlan", back_populates="contracts")
    executions = relationship("ProjectExecution", back_populates="contract")


class ProjectExecution(Base):
    __tablename__ = 'proj_executions'
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id = Column(String, ForeignKey('proj_contracts.id'), nullable=False)
    project_code = Column(String, unique=True, index=True, nullable=False)
    physical_progress_percent = Column(Numeric(5, 2), default=0)
    financial_progress_percent = Column(Numeric(5, 2), default=0)
    responsible_engineer_id = Column(String, nullable=True)
    gis_geometry = Column(JSON, nullable=True)
    
    contract = relationship("ProjectContract", back_populates="executions")
    measurements = relationship("MeasurementBook", back_populates="project")
    payments = relationship("ProjectPayment", back_populates="project")
    handover = relationship("ProjectHandover", back_populates="project", uselist=False)


class MeasurementBook(Base):
    __tablename__ = 'proj_measurement_books'
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey('proj_executions.id'), nullable=False)
    mb_date = Column(Date, nullable=False)
    measured_by = Column(String, nullable=False) # Employee ID
    work_description = Column(Text, nullable=False)
    quantity_completed = Column(Numeric(15, 2), nullable=False)
    remarks = Column(Text, nullable=True)
    
    project = relationship("ProjectExecution", back_populates="measurements")
    payments = relationship("ProjectPayment", back_populates="measurement")


class ProjectPayment(Base):
    __tablename__ = 'proj_payments'
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey('proj_executions.id'), nullable=False)
    mb_id = Column(String, ForeignKey('proj_measurement_books.id'), nullable=True)
    payment_type = Column(String, nullable=False) # Advance, Running Bill, Final
    gross_amount = Column(Numeric(15, 2), nullable=False)
    deductions = Column(Numeric(15, 2), default=0)
    net_payable = Column(Numeric(15, 2), nullable=False)
    payment_date = Column(Date, nullable=True)
    status = Column(String, default='Pending') # Pending, Approved, Paid
    
    project = relationship("ProjectExecution", back_populates="payments")
    measurement = relationship("MeasurementBook", back_populates="payments")


class ProjectHandover(Base):
    __tablename__ = 'proj_handovers'
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey('proj_executions.id'), unique=True, nullable=False)
    completion_date = Column(Date, nullable=False)
    total_expenditure = Column(Numeric(15, 2), nullable=False)
    asset_generated_id = Column(String, nullable=True) # Links to AssetMaster
    remarks = Column(Text, nullable=True)
    
    project = relationship("ProjectExecution", back_populates="handover")
