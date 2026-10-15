from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal

class PlanProposalBase(BaseModel):
    fiscal_year: str
    ward_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    estimated_cost: Optional[Decimal] = Decimal('0.00')
    priority: Optional[str] = 'Normal'
    status: Optional[str] = 'Proposed'

class PlanProposalCreate(PlanProposalBase):
    pass

class PlanProposalResponse(PlanProposalBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class BudgetAllocationBase(BaseModel):
    plan_id: str
    budget_head_code: str
    source_of_fund: str
    allocated_amount: Decimal
    approved_date: Optional[date] = None

class BudgetAllocationCreate(BudgetAllocationBase):
    pass

class BudgetAllocationResponse(BudgetAllocationBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class ProcurementPlanBase(BaseModel):
    budget_id: str
    procurement_method: str
    estimated_amount: Decimal
    tender_call_date: Optional[date] = None
    bid_opening_date: Optional[date] = None

class ProcurementPlanCreate(ProcurementPlanBase):
    pass

class ProcurementPlanResponse(ProcurementPlanBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class ProjectContractBase(BaseModel):
    procurement_id: str
    contractor_type: str
    contractor_id: str
    contract_amount: Decimal
    agreement_date: date
    completion_deadline: date
    status: Optional[str] = 'Active'

class ProjectContractCreate(ProjectContractBase):
    pass

class ProjectContractResponse(ProjectContractBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class ProjectExecutionBase(BaseModel):
    contract_id: str
    project_code: str
    physical_progress_percent: Optional[Decimal] = Decimal('0.00')
    financial_progress_percent: Optional[Decimal] = Decimal('0.00')
    responsible_engineer_id: Optional[str] = None
    gis_geometry: Optional[Dict[str, Any]] = None

class ProjectExecutionCreate(ProjectExecutionBase):
    pass

class ProjectExecutionResponse(ProjectExecutionBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class MeasurementBookBase(BaseModel):
    project_id: str
    mb_date: date
    measured_by: str
    work_description: str
    quantity_completed: Decimal
    remarks: Optional[str] = None

class MeasurementBookCreate(MeasurementBookBase):
    pass

class MeasurementBookResponse(MeasurementBookBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class ProjectPaymentBase(BaseModel):
    project_id: str
    mb_id: Optional[str] = None
    payment_type: str
    gross_amount: Decimal
    deductions: Optional[Decimal] = Decimal('0.00')
    net_payable: Decimal
    payment_date: Optional[date] = None
    status: Optional[str] = 'Pending'

class ProjectPaymentCreate(ProjectPaymentBase):
    pass

class ProjectPaymentResponse(ProjectPaymentBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True


class ProjectHandoverBase(BaseModel):
    project_id: str
    completion_date: date
    total_expenditure: Decimal
    asset_generated_id: Optional[str] = None
    remarks: Optional[str] = None

class ProjectHandoverCreate(ProjectHandoverBase):
    pass

class ProjectHandoverResponse(ProjectHandoverBase):
    id: str
    tenant_id: Optional[str] = None
    class Config:
        from_attributes = True
