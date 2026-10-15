from pydantic import BaseModel, Field
from typing import Optional, Any, Union, List, Dict
from uuid import UUID
from datetime import datetime

class EmploymentLabourBankSchema(BaseModel):
    id: Any
    worker_id: str = Field(alias="workerId", default="")
    full_name: str = Field(alias="fullName", default="")
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    gender: Optional[str] = "पुरुष"
    ward_number: int = Field(alias="wardNumber", default=1)
    tole_village: Optional[str] = Field(None, alias="toleVillage")
    contact_phone: Optional[str] = Field(None, alias="contactPhone")
    skill_category: str = Field(alias="skillCategory", default="सामान्य निर्माण श्रमिक (General Construction)")
    skill_level: Optional[str] = Field("सामान्य (Unskilled)", alias="skillLevel")
    daily_wage_rate: Optional[float] = Field(850.0, alias="dailyWageRate")
    guaranteed_days_allocated: Optional[int] = Field(100, alias="guaranteedDaysAllocated")
    total_days_worked: Optional[int] = Field(0, alias="totalDaysWorked")
    total_wage_paid: Optional[float] = Field(0.0, alias="totalWagePaid")
    allocated_project: Optional[str] = Field(None, alias="allocatedProject")
    bank_name: Optional[str] = Field(None, alias="bankName")
    bank_account_no: Optional[str] = Field(None, alias="bankAccountNo")
    status: Optional[str] = "सूचीकृत (Registered)"
    pmep_fiscal_year: Optional[str] = Field("२०८१/०८२", alias="pmepFiscalYear")
    registered_date_bs: Optional[str] = Field(None, alias="registeredDateBs")
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class EmploymentLabourBankCreate(BaseModel):
    worker_id: Optional[str] = Field(None, alias="workerId")
    full_name: str = Field(alias="fullName")
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    gender: Optional[str] = "पुरुष"
    ward_number: int = Field(alias="wardNumber", default=1)
    tole_village: Optional[str] = Field(None, alias="toleVillage")
    contact_phone: Optional[str] = Field(None, alias="contactPhone")
    skill_category: Optional[str] = Field("सामान्य निर्माण श्रमिक (General Construction)", alias="skillCategory")
    skill_level: Optional[str] = Field("सामान्य (Unskilled)", alias="skillLevel")
    daily_wage_rate: Optional[float] = Field(850.0, alias="dailyWageRate")
    guaranteed_days_allocated: Optional[int] = Field(100, alias="guaranteedDaysAllocated")
    total_days_worked: Optional[int] = Field(0, alias="totalDaysWorked")
    total_wage_paid: Optional[float] = Field(0.0, alias="totalWagePaid")
    allocated_project: Optional[str] = Field(None, alias="allocatedProject")
    bank_name: Optional[str] = Field(None, alias="bankName")
    bank_account_no: Optional[str] = Field(None, alias="bankAccountNo")
    status: Optional[str] = "सूचीकृत (Registered)"
    pmep_fiscal_year: Optional[str] = Field("२०८१/०८२", alias="pmepFiscalYear")
    registered_date_bs: Optional[str] = Field(None, alias="registeredDateBs")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class EmploymentLabourBankUpdate(BaseModel):
    full_name: Optional[str] = Field(None, alias="fullName")
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    gender: Optional[str] = None
    ward_number: Optional[int] = Field(None, alias="wardNumber")
    tole_village: Optional[str] = Field(None, alias="toleVillage")
    contact_phone: Optional[str] = Field(None, alias="contactPhone")
    skill_category: Optional[str] = Field(None, alias="skillCategory")
    skill_level: Optional[str] = Field(None, alias="skillLevel")
    daily_wage_rate: Optional[float] = Field(None, alias="dailyWageRate")
    guaranteed_days_allocated: Optional[int] = Field(None, alias="guaranteedDaysAllocated")
    total_days_worked: Optional[int] = Field(None, alias="totalDaysWorked")
    total_wage_paid: Optional[float] = Field(None, alias="totalWagePaid")
    allocated_project: Optional[str] = Field(None, alias="allocatedProject")
    bank_name: Optional[str] = Field(None, alias="bankName")
    bank_account_no: Optional[str] = Field(None, alias="bankAccountNo")
    status: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class ProjectAllocationRequest(BaseModel):
    projectTitle: str = Field(alias="project_title", default="")
    days: Optional[int] = 30
    dailyWageRate: Optional[float] = Field(alias="daily_wage_rate", default=850.0)

    class Config:
        populate_by_name = True


class WorkLogCreate(BaseModel):
    worker_id: str
    worker_name: Optional[str] = None
    project_title: str
    ward_number: Optional[int] = 1
    work_date_bs: str
    days_worked: int
    daily_wage_rate: Optional[float] = 850.0
    wage_amount: Optional[float] = None
    payout_status: Optional[str] = "भुक्तानी बाँकी (Pending)"
    voucher_no: Optional[str] = None
    remarks: Optional[str] = None


class EmploymentProjectSchema(BaseModel):
    id: Any
    project_code: str
    title: str
    ward_number: int
    tole_village: Optional[str] = None
    allocated_budget: Optional[float] = 0.0
    target_person_days: Optional[int] = 100
    completed_person_days: Optional[int] = 0
    daily_wage_rate: Optional[float] = 850.0
    workers_count: Optional[int] = 0
    supervisor_name: Optional[str] = None
    supervisor_phone: Optional[str] = None
    status: Optional[str] = "सञ्चालनमा (In Progress)"
    fiscal_year: Optional[str] = "२०८१/०८२"
    start_date_bs: Optional[str] = None
    end_date_bs: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmploymentProjectCreate(BaseModel):
    project_code: Optional[str] = None
    title: str
    ward_number: int
    tole_village: Optional[str] = None
    allocated_budget: Optional[float] = 0.0
    target_person_days: Optional[int] = 100
    daily_wage_rate: Optional[float] = 850.0
    workers_count: Optional[int] = 0
    supervisor_name: Optional[str] = None
    supervisor_phone: Optional[str] = None
    status: Optional[str] = "सञ्चालनमा (In Progress)"
    fiscal_year: Optional[str] = "२०८१/०८२"
    start_date_bs: Optional[str] = None
    end_date_bs: Optional[str] = None


class EmploymentWorkLogSchema(BaseModel):
    id: Any
    worker_id: str
    worker_name: str
    project_title: str
    ward_number: int
    work_date_bs: str
    days_worked: int
    daily_wage_rate: Optional[float] = 850.0
    wage_amount: Optional[float] = 850.0
    payout_status: Optional[str] = "भुक्तानी बाँकी (Pending)"
    voucher_no: Optional[str] = None
    remarks: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmploymentLabourDemandSchema(BaseModel):
    id: Any
    employer_name: str
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    ward_number: int
    skill_required: str
    required_count: int = 1
    daily_wage_offered: Optional[float] = 1000.0
    work_duration_days: Optional[int] = 30
    status: Optional[str] = "माग दर्ता (Registered)"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmploymentLabourDemandCreate(BaseModel):
    employer_name: str
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    ward_number: int
    skill_required: str
    required_count: int = 1
    daily_wage_offered: Optional[float] = 1000.0
    work_duration_days: Optional[int] = 30
    status: Optional[str] = "माग दर्ता (Registered)"
