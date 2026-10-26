from sqlalchemy import Column, String, Integer, Numeric, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

ANNUAL_FEE_SCHEDULE = [
    {"label": "रु. ५ लाख सम्म", "maxCapital": 500000, "fee": 1500},
    {"label": "रु. ५–२५ लाख", "maxCapital": 2500000, "fee": 3500},
    {"label": "रु. २५–५० लाख", "maxCapital": 5000000, "fee": 6500},
    {"label": "रु. ५०–१ करोड", "maxCapital": 10000000, "fee": 12000},
    {"label": "रु. १ करोड माथि", "maxCapital": float("inf"), "fee": 20000},
]

def calculate_annual_fee(capital: float) -> float:
    for row in ANNUAL_FEE_SCHEDULE:
        if capital <= row["maxCapital"]:
            return float(row["fee"])
    return 20000.0


class Business(Base):
    __tablename__ = 'businesses'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_no = Column(String, unique=True, name='registrationNo')
    business_name = Column(String, name='businessName')
    business_name_en = Column(String, nullable=True, name='businessNameEn')
    category = Column(String, default='व्यापार तथा किराना पसल (Retail & Wholesale)')
    firm_type = Column(String, default='एकलौटी फर्म', name='firmType')
    status = Column(String, default='दर्ता सम्पन्न')
    proprietor_name = Column(String, name='proprietorName')
    proprietor_phone = Column(String, nullable=True, name='proprietorPhone')
    proprietor_email = Column(String, nullable=True, name='proprietorEmail')
    citizenship_no = Column(String, nullable=True, name='citizenshipNo')
    pan_number = Column(String, nullable=True, name='panNumber')
    ward_number = Column(Integer, default=1, name='wardNumber')
    tole_address = Column(String, nullable=True, name='toleAddress')
    initial_capital = Column(Numeric(15, 2), default=0, name='initialCapital')
    registration_date_bs = Column(String, nullable=True, name='registrationDateBs')
    expiry_date_bs = Column(String, nullable=True, name='expiryDateBs')
    license_fee = Column(Numeric(10, 2), default=0, name='licenseFee')
    receipt_no = Column(String, nullable=True, name='receiptNo')
    business_objectives = Column(Text, nullable=True, name='businessObjectives')
    verified_by = Column(String, nullable=True, name='verifiedBy')
    certificate_url = Column(String, nullable=True, name='certificateUrl')
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        det = self.details if isinstance(self.details, dict) else {}
        cap = float(self.initial_capital or 0)
        fee = float(self.license_fee or det.get('annualFeeNPR') or calculate_annual_fee(cap))
        
        status_val = self.status or 'दर्ता सम्पन्न'
        if 'स्वीकृत' in status_val or 'सञ्चालन' in status_val:
            status_val = 'दर्ता सम्पन्न'

        return {
            "id": str(self.id),
            "tenantId": str(self.tenant_id) if self.tenant_id else None,
            "registrationNo": self.registration_no,
            "businessName": self.business_name,
            "businessNameEn": self.business_name_en or det.get("businessNameEn", ""),
            "proprietorName": self.proprietor_name,
            "proprietorPhone": self.proprietor_phone or "",
            "proprietorCitizenshipNo": self.citizenship_no or "",
            "panNumber": self.pan_number or "",
            "vatNumber": det.get("vatNumber", ""),
            "category": self.category,
            "subCategory": det.get("subCategory", ""),
            "firmType": self.firm_type,
            "wardNumber": int(self.ward_number or 1),
            "tole": self.tole_address or det.get("tole", ""),
            "toleAddress": self.tole_address or "",
            "landOwner": det.get("landOwner", ""),
            "buildingKittaNo": det.get("buildingKittaNo", ""),
            "capitaInvestmentNPR": cap,
            "initialCapital": cap,
            "employeeCount": int(det.get("employeeCount", 3)),
            "femaleEmployeeCount": int(det.get("femaleEmployeeCount", 1)),
            "registrationDateBs": self.registration_date_bs or "२०८१-०१-०१",
            "renewalDueDateBs": det.get("renewalDueDateBs", self.expiry_date_bs or "२०८२-०३-३१"),
            "lastRenewalDateBs": det.get("lastRenewalDateBs", ""),
            "expiryDateBs": self.expiry_date_bs or "२०८२-०३-३१",
            "annualFeeNPR": fee,
            "licenseFee": fee,
            "fineNPR": float(det.get("fineNPR", 0)),
            "status": status_val,
            "paymentStatus": det.get("paymentStatus", "भुक्तानी सम्पन्न"),
            "lastReceiptNo": self.receipt_no or det.get("lastReceiptNo", ""),
            "lastPaymentGateway": det.get("lastPaymentGateway", "FONEPAY"),
            "inspectionDateBs": det.get("inspectionDateBs", ""),
            "inspectionOfficer": det.get("inspectionOfficer", ""),
            "inspectionRemarks": det.get("inspectionRemarks", ""),
            "environmentalStatus": det.get("environmentalStatus", "प्रभाव नगर्ने (Green)"),
            "certQrUrl": self.certificate_url or det.get("certQrUrl", f"/api/v1/businesses/{self.id}/qr"),
            "businessObjectives": self.business_objectives or "",
            "verifiedBy": self.verified_by or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class BusinessRenewal(Base):
    __tablename__ = 'business_renewals'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, nullable=True)
    business_id = Column(String, nullable=False)
    registration_no = Column(String, nullable=False)
    business_name = Column(String, nullable=False)
    proprietor_name = Column(String, nullable=False)
    ward_number = Column(Integer, default=1)
    fiscal_year = Column(String, default='२०८१/०८२')
    renewal_date_bs = Column(String, default='२०८१-०५-०१')
    annual_fee_npr = Column(Numeric(12, 2), default=0)
    fine_npr = Column(Numeric(12, 2), default=0)
    total_paid_npr = Column(Numeric(12, 2), default=0)
    payment_gateway = Column(String, default='FONEPAY')
    receipt_no = Column(String, nullable=True)
    renewed_by_officer = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "businessId": str(self.business_id),
            "registrationNo": self.registration_no,
            "businessName": self.business_name,
            "proprietorName": self.proprietor_name,
            "wardNumber": int(self.ward_number or 1),
            "fiscalYear": self.fiscal_year,
            "renewalDateBs": self.renewal_date_bs,
            "annualFeeNPR": float(self.annual_fee_npr or 0),
            "fineNPR": float(self.fine_npr or 0),
            "totalPaidNPR": float(self.total_paid_npr or 0),
            "paymentGateway": self.payment_gateway,
            "receiptNo": self.receipt_no or "",
            "renewedByOfficer": self.renewed_by_officer or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class BusinessInspection(Base):
    __tablename__ = 'business_inspections'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, nullable=True)

    business_id = Column(String, nullable=False)
    registration_no = Column(String, nullable=False)
    business_name = Column(String, nullable=False)
    ward_number = Column(Integer, default=1)
    inspection_date_bs = Column(String, default='२०८१-०५-०१')
    inspection_type = Column(String, default='नियमित वार्षिक')
    inspector_name = Column(String, nullable=False)
    inspector_designation = Column(String, default='राजस्व निरीक्षक')
    compliance_status = Column(String, default='अनुपालन सम्पन्न ✅')
    remarks = Column(Text, nullable=True)
    follow_up_date_bs = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "businessId": str(self.business_id),
            "registrationNo": self.registration_no,
            "businessName": self.business_name,
            "wardNumber": int(self.ward_number or 1),
            "inspectionDateBs": self.inspection_date_bs,
            "inspectionType": self.inspection_type,
            "inspectorName": self.inspector_name,
            "inspectorDesignation": self.inspector_designation,
            "complianceStatus": self.compliance_status,
            "remarks": self.remarks or "",
            "followUpDateBs": self.follow_up_date_bs or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
