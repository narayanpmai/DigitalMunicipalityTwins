from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Numeric, Text, Boolean
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid

class Cooperative(Base):
    __tablename__ = 'cooperatives'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=True, default="default")
    registration_no = Column(String, unique=True, index=True, nullable=False, name='registrationNo')
    copomis_code = Column(String, unique=True, nullable=True, name='copomisCode')
    name = Column(String, nullable=False)
    name_en = Column(String, nullable=True, name='nameEn')
    coop_type = Column(String, default='बचत तथा ऋण', name='coopType') # बचत तथा ऋण, कृषि, बहुउद्देश्यीय, दुग्ध, उपभोक्ता, आदि
    status = Column(String, default='सञ्चालनमा') # सञ्चालनमा, समस्याग्रस्त, निष्क्रिय, खारेजी प्रक्रियामा
    ward_number = Column(Integer, default=1, name='wardNumber')
    tole_address = Column(String, nullable=True, name='toleAddress')
    working_area = Column(String, default='वडा नं १-८ (पालिकास्तर)', name='workingArea')
    registration_date_bs = Column(String, nullable=True, name='registrationDateBs')
    pan_number = Column(String, nullable=True, name='panNumber')
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Leadership & Management
    chairperson_name = Column(String, nullable=True, name='chairpersonName')
    chairperson_phone = Column(String, nullable=True, name='chairpersonPhone')
    manager_name = Column(String, nullable=True, name='managerName')
    manager_phone = Column(String, nullable=True, name='managerPhone')
    
    # Membership Demographics
    total_members_male = Column(Integer, default=0, name='totalMembersMale')
    total_members_female = Column(Integer, default=0, name='totalMembersFemale')
    total_members = Column(Integer, default=0, name='totalMembers')
    
    # Key Financial Figures (NPR)
    share_capital = Column(Numeric(15, 2), default=0, name='shareCapital')
    total_deposit = Column(Numeric(15, 2), default=0, name='totalDeposit')
    total_loan_outstanding = Column(Numeric(15, 2), default=0, name='totalLoanOutstanding')
    reserve_fund = Column(Numeric(15, 2), default=0, name='reserveFund')
    
    # Regulatory & Risk Classification
    risk_level = Column(String, default='सामान्य (Low Risk)', name='riskLevel') # न्यून जोखिम (Low), मध्यम (Moderate), उच्च जोखिम (High), गम्भीर (Critical)
    liquidity_ratio = Column(Float, default=15.0, name='liquidityRatio') # तरलता %
    npl_ratio = Column(Float, default=2.5, name='nplRatio') # खराब कर्जा %
    last_agm_date_bs = Column(String, nullable=True, name='lastAgmDateBs')
    last_audit_fiscal_year = Column(String, nullable=True, name='lastAuditFiscalYear')
    copomis_sync_status = Column(String, default='प्रमाणीकरण बाँकी', name='copomisSyncStatus') # सिंक भएको, पेन्डिङ, प्रमाणीकरण बाँकी
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    # Relationships
    financial_reports = relationship("CooperativeFinancialReport", back_populates="cooperative", cascade="all, delete-orphan")
    inspections = relationship("CooperativeInspection", back_populates="cooperative", cascade="all, delete-orphan")
    members = relationship("CooperativeMember", back_populates="cooperative", cascade="all, delete-orphan")
    notices = relationship("CooperativeRegulatoryNotice", back_populates="cooperative", cascade="all, delete-orphan")


class CooperativeFinancialReport(Base):
    __tablename__ = 'cooperative_financial_reports'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cooperative_id = Column(String, ForeignKey('cooperatives.id', ondelete='CASCADE'), nullable=False, name='cooperativeId')
    fiscal_year = Column(String, nullable=False, name='fiscalYear') # उदा. २०८०/८१, २०८१/८२
    period_type = Column(String, default='त्रैमासिक', name='periodType') # मासिक, त्रैमासिक, वार्षिक
    period_name = Column(String, nullable=False, name='periodName') # प्रथम त्रैमास, असार मसान्त, आदि
    report_date_bs = Column(String, nullable=True, name='reportDateBs')
    
    # Balance Sheet & Operations (NPR)
    share_capital = Column(Numeric(15, 2), default=0, name='shareCapital')
    reserve_funds = Column(Numeric(15, 2), default=0, name='reserveFunds')
    total_deposits = Column(Numeric(15, 2), default=0, name='totalDeposits')
    total_loans = Column(Numeric(15, 2), default=0, name='totalLoans')
    performing_loans = Column(Numeric(15, 2), default=0, name='performingLoans')
    non_performing_loans = Column(Numeric(15, 2), default=0, name='nonPerformingLoans') # NPL
    liquid_assets = Column(Numeric(15, 2), default=0, name='liquidAssets') # नगद तथा बैंक मौज्दात
    total_assets = Column(Numeric(15, 2), default=0, name='totalAssets')
    net_profit_loss = Column(Numeric(15, 2), default=0, name='netProfitLoss')
    
    # Calculated PEARLS Ratios
    liquidity_ratio = Column(Float, default=0.0, name='liquidityRatio') # Liquid Assets / Deposits * 100
    npl_ratio = Column(Float, default=0.0, name='nplRatio') # NPL / Loans * 100
    capital_adequacy_ratio = Column(Float, default=0.0, name='capitalAdequacyRatio')
    
    copomis_exported = Column(Boolean, default=False, name='copomisExported')
    submitted_by = Column(String, nullable=True, name='submittedBy')
    verified_by = Column(String, nullable=True, name='verifiedBy')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    cooperative = relationship("Cooperative", back_populates="financial_reports")


class CooperativeInspection(Base):
    __tablename__ = 'cooperative_inspections'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cooperative_id = Column(String, ForeignKey('cooperatives.id', ondelete='CASCADE'), nullable=False, name='cooperativeId')
    inspection_date_bs = Column(String, nullable=False, name='inspectionDateBs')
    inspector_name = Column(String, nullable=False, name='inspectorName')
    inspector_designation = Column(String, default='सहकारी अधिकृत/निरीक्षक', name='inspectorDesignation')
    inspection_type = Column(String, default='नियमित स्थलगत निरीक्षण', name='inspectionType') # नियमित, आकस्मिक, उजुरी छानबिन
    compliance_score = Column(Float, default=80.0, name='complianceScore') # १०० मा प्राप्तांक
    findings_summary = Column(Text, nullable=True, name='findingsSummary')
    directives_issued = Column(Text, nullable=True, name='directivesIssued')
    status = Column(String, default='सुझाव कार्यान्वयनमा') # सुझाव कार्यान्वयनमा, फलोअप आवश्यक, सम्पन्न
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    cooperative = relationship("Cooperative", back_populates="inspections")


class CooperativeMember(Base):
    __tablename__ = 'cooperative_members'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cooperative_id = Column(String, ForeignKey('cooperatives.id', ondelete='CASCADE'), nullable=False, name='cooperativeId')
    member_name = Column(String, nullable=False, name='memberName')
    citizenship_no = Column(String, index=True, nullable=True, name='citizenshipNo')
    phone = Column(String, index=True, nullable=True)
    gender = Column(String, default='महिला')
    ward_number = Column(Integer, default=1, name='wardNumber')
    tole_address = Column(String, nullable=True, name='toleAddress')
    household_matrix_no = Column(String, nullable=True, name='householdMatrixNo') # Linked to Household registry
    
    shares_count = Column(Integer, default=10, name='sharesCount')
    savings_balance = Column(Numeric(15, 2), default=0, name='savingsBalance')
    loan_balance = Column(Numeric(15, 2), default=0, name='loanBalance')
    loan_status = Column(String, default='नियमित', name='loanStatus') # नियमित, भाखा नाघेको, ऋण नभएको
    is_dual_borrower = Column(Boolean, default=False, name='isDualBorrower')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    cooperative = relationship("Cooperative", back_populates="members")


class CooperativeRegulatoryNotice(Base):
    __tablename__ = 'cooperative_regulatory_notices'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cooperative_id = Column(String, ForeignKey('cooperatives.id', ondelete='CASCADE'), nullable=False, name='cooperativeId')
    notice_no = Column(String, unique=True, nullable=False, name='noticeNo') # उदा. PPK-NOTICE-2081-01
    notice_type = Column(String, nullable=False, name='noticeType') # साधारण सभा ताकेता, तरलता सुधार निर्देशन, खराब कर्जा असुली, वित्तीय विवरण माग
    issue_date_bs = Column(String, nullable=False, name='issueDateBs')
    deadline_date_bs = Column(String, nullable=True, name='deadlineDateBs')
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    directives = Column(Text, nullable=True)
    status = Column(String, default='जारी गरिएको') # जारी गरिएको, म्याद समाप्त, अनुपालन भएको
    sms_sent = Column(Boolean, default=True, name='smsSent')
    recipient_phone = Column(String, nullable=True, name='recipientPhone')
    issued_by = Column(String, default='गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा', name='issuedBy')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    cooperative = relationship("Cooperative", back_populates="notices")
