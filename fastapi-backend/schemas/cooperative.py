from pydantic import BaseModel, Field, field_serializer
from typing import Optional, List, Union, Any
from datetime import datetime
from uuid import UUID

class CooperativeBase(BaseModel):
    name: str = Field(..., example="पाँचपोखरी बचत तथा ऋण सहकारी संस्था लि.")
    name_en: Optional[str] = Field(None, example="Panchpokhari Saving & Credit Coop Ltd.")
    coop_type: str = Field(default="बचत तथा ऋण", example="बचत तथा ऋण")
    status: str = Field(default="सञ्चालनमा")
    ward_number: int = Field(default=1, ge=1, le=15)
    tole_address: Optional[str] = None
    working_area: Optional[str] = "वडा नं १-८ (पालिकास्तर)"
    registration_date_bs: Optional[str] = "२०६८/०४/१२"
    pan_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = 27.9500
    longitude: Optional[float] = 85.6500
    chairperson_name: Optional[str] = None
    chairperson_phone: Optional[str] = None
    manager_name: Optional[str] = None
    manager_phone: Optional[str] = None
    total_members_male: int = 0
    total_members_female: int = 0
    total_members: int = 0
    share_capital: float = 0.0
    total_deposit: float = 0.0
    total_loan_outstanding: float = 0.0
    reserve_fund: float = 0.0
    risk_level: str = "सामान्य (Low Risk)"
    liquidity_ratio: float = 15.0
    npl_ratio: float = 2.5
    last_agm_date_bs: Optional[str] = None
    last_audit_fiscal_year: Optional[str] = None
    copomis_code: Optional[str] = None
    copomis_sync_status: Optional[str] = "प्रमाणीकरण बाँकी"

class CooperativeCreate(CooperativeBase):
    pass

class CooperativeUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    coop_type: Optional[str] = None
    status: Optional[str] = None
    ward_number: Optional[int] = None
    tole_address: Optional[str] = None
    working_area: Optional[str] = None
    registration_date_bs: Optional[str] = None
    pan_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    chairperson_name: Optional[str] = None
    chairperson_phone: Optional[str] = None
    manager_name: Optional[str] = None
    manager_phone: Optional[str] = None
    total_members_male: Optional[int] = None
    total_members_female: Optional[int] = None
    total_members: Optional[int] = None
    share_capital: Optional[float] = None
    total_deposit: Optional[float] = None
    total_loan_outstanding: Optional[float] = None
    reserve_fund: Optional[float] = None
    risk_level: Optional[str] = None
    liquidity_ratio: Optional[float] = None
    npl_ratio: Optional[float] = None
    last_agm_date_bs: Optional[str] = None
    last_audit_fiscal_year: Optional[str] = None
    copomis_code: Optional[str] = None
    copomis_sync_status: Optional[str] = None

class CooperativeFinancialReportCreate(BaseModel):
    cooperative_id: str
    fiscal_year: str
    period_type: str = "त्रैमासिक"
    period_name: str
    report_date_bs: Optional[str] = None
    share_capital: float = 0.0
    reserve_funds: float = 0.0
    total_deposits: float = 0.0
    total_loans: float = 0.0
    performing_loans: float = 0.0
    non_performing_loans: float = 0.0
    liquid_assets: float = 0.0
    total_assets: float = 0.0
    net_profit_loss: float = 0.0
    submitted_by: Optional[str] = None

class CooperativeInspectionCreate(BaseModel):
    cooperative_id: str
    inspection_date_bs: str
    inspector_name: str
    inspector_designation: Optional[str] = "सहकारी अधिकृत/निरीक्षक"
    inspection_type: Optional[str] = "नियमित स्थलगत निरीक्षण"
    compliance_score: float = 80.0
    findings_summary: Optional[str] = None
    directives_issued: Optional[str] = None
    status: Optional[str] = "सुझाव कार्यान्वयनमा"

class CooperativeOut(CooperativeBase):
    id: Union[str, UUID]
    registration_no: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('id')
    def serialize_id(self, v: Union[str, UUID]) -> str:
        return str(v)

    class Config:
        from_attributes = True

class CooperativeAnalyticsSummary(BaseModel):
    total_cooperatives: int
    active_cooperatives: int
    problematic_cooperatives: int
    total_members: int
    total_male_members: int
    total_female_members: int
    total_share_capital: float
    total_deposits: float
    total_loans: float
    average_liquidity_ratio: float
    average_npl_ratio: float
    by_type: dict
    by_ward: dict
    by_risk: dict


class CooperativeMemberCreate(BaseModel):
    cooperative_id: str
    member_name: str
    citizenship_no: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = "महिला"
    ward_number: int = 1
    tole_address: Optional[str] = None
    household_matrix_no: Optional[str] = None
    shares_count: int = 10
    savings_balance: float = 0.0
    loan_balance: float = 0.0
    loan_status: str = "नियमित"


class CooperativeMemberOut(BaseModel):
    id: Union[str, UUID]
    cooperative_id: Union[str, UUID]
    member_name: str
    citizenship_no: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    ward_number: int
    tole_address: Optional[str] = None
    household_matrix_no: Optional[str] = None
    shares_count: int
    savings_balance: float
    loan_balance: float
    loan_status: str
    is_dual_borrower: bool

    @field_serializer('id', 'cooperative_id')
    def serialize_ids(self, v: Union[str, UUID]) -> str:
        return str(v)

    class Config:
        from_attributes = True


class CooperativeNoticeCreate(BaseModel):
    cooperative_id: str
    notice_type: str = "साधारण सभा ताकेता"
    issue_date_bs: str
    deadline_date_bs: Optional[str] = None
    title: str
    content: str
    directives: Optional[str] = None
    recipient_phone: Optional[str] = None
    sms_sent: bool = True


class CooperativeNoticeOut(BaseModel):
    id: Union[str, UUID]
    cooperative_id: Union[str, UUID]
    notice_no: str
    notice_type: str
    issue_date_bs: str
    deadline_date_bs: Optional[str] = None
    title: str
    content: str
    directives: Optional[str] = None
    status: str
    sms_sent: bool
    recipient_phone: Optional[str] = None
    issued_by: str
    created_at: Optional[datetime] = None

    @field_serializer('id', 'cooperative_id')
    def serialize_ids(self, v: Union[str, UUID]) -> str:
        return str(v)

    class Config:
        from_attributes = True


class DualBorrowerCrossCheckItem(BaseModel):
    member_name: str
    citizenship_no: Optional[str] = None
    phone: Optional[str] = None
    ward_number: int
    total_loans_taken: float
    cooperatives_involved: List[str]
    cooperative_count: int
    risk_level: str # 'उच्च जोखिम (Multi-loan Alert)', 'मध्यम'


class DualBorrowerCrossCheckResponse(BaseModel):
    total_flagged_individuals: int
    total_dual_loan_exposure: float
    flagged_members: List[DualBorrowerCrossCheckItem]
    financial_inclusion_by_ward: dict

