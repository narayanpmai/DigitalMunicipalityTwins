from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Numeric, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

STATUS_MAP_OUT = {
    "planned": "मस्यौदा / स्वीकृतिको पर्खाइमा (Draft)",
    "advertised": "बोलपत्र आह्वान प्रकाशित (IFB Published)",
    "evaluation": "प्राविधिक तथा आर्थिक मूल्याङ्कन (Bid Evaluation)",
    "awarded": "७ दिने आशयको सूचना (Letter of Intent - LOI)",
    "contracted": "ठेक्का सम्झौता तथा कार्यान्वयन (Contract Awarded)",
    "completed": "कार्य सम्पन्न तथा फरफारक (Work Completed)",
    "cancelled": "रद्द / स्थगित (Cancelled)"
}

METHOD_MAP_OUT = {
    "open_tendering": "खुला राष्ट्रिय बोलपत्र (NCB)",
    "limited_tendering": "सीमित बोलपत्र (Limited)",
    "direct_procurement": "प्रत्यक्ष खरिद (Direct)",
    "request_for_quotation": "सिलबन्दी दरभाउ पत्र (SQ)",
    "consulting": "परामर्श सेवा (Consulting)"
}

class Procurement(Base):
    __tablename__ = 'procurements'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    procurement_no = Column(String, name='procurementNo')
    title = Column(String)
    description = Column(Text, nullable=True)
    method = Column(String, default='open_tendering')
    status = Column(String, default='planned')
    fiscal_year = Column(String, nullable=True, default='२०८१/०८२', name='fiscalYear')
    sector = Column(String, nullable=True)
    ward_no = Column(String, nullable=True, name='wardNo')
    estimated_amount = Column(Numeric(15, 2), default=0, name='estimatedAmount')
    awarded_amount = Column(Numeric(15, 2), nullable=True, name='awardedAmount')
    bid_doc_fee = Column(Numeric(10, 2), nullable=True, default=3000, name='bidDocFee')
    bid_security_amount = Column(Numeric(15, 2), nullable=True, name='bidSecurityAmount')
    performance_security_amount = Column(Numeric(15, 2), nullable=True, name='performanceSecurityAmount')
    awarded_to = Column(String, nullable=True, name='awardedTo')
    awarded_vendor_pan = Column(String, nullable=True, name='awardedVendorPan')
    advertised_date = Column(DateTime, nullable=True, name='advertisedDate')
    deadline_date = Column(DateTime, nullable=True, name='deadlineDate')
    awarded_date = Column(DateTime, nullable=True, name='awardedDate')
    advertised_date_bs = Column(String, nullable=True, name='advertisedDateBs')
    deadline_date_bs = Column(String, nullable=True, name='deadlineDateBs')
    loi_publish_date_bs = Column(String, nullable=True, name='loiPublishDateBs')
    contract_date_bs = Column(String, nullable=True, name='contractDateBs')
    completion_date_bs = Column(String, nullable=True, name='completionDateBs')
    document_url = Column(String, nullable=True, name='documentUrl')
    bidders_count = Column(Integer, default=0, name='biddersCount')
    bidders_list = Column(JSON, default=list, name='biddersList')
    running_bills = Column(JSON, default=list, name='runningBills')
    bank_details = Column(JSON, default=dict, name='bankDetails')
    documents = Column(JSON, default=list, name='documents')
    requirements = Column(JSON, default=list, name='requirements')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        est = float(self.estimated_amount or 0)
        awd = float(self.awarded_amount or 0) if self.awarded_amount else None
        savings = (est - awd) if awd and awd > 0 else 0
        savings_pct = round((savings / est * 100), 1) if est > 0 and savings > 0 else 0
        return {
            "id": str(self.id),
            "procurementNo": self.procurement_no,
            "tenderNumber": self.procurement_no,
            "title": self.title,
            "description": self.description or "",
            "method": self.method or "open_tendering",
            "procurementMethod": METHOD_MAP_OUT.get(self.method, self.method or "खुला राष्ट्रिय बोलपत्र (NCB)"),
            "status": STATUS_MAP_OUT.get(self.status, self.status or "बोलपत्र आह्वान प्रकाशित (IFB Published)"),
            "rawStatus": self.status,
            "stageLabel": STATUS_MAP_OUT.get(self.status, self.status),
            "fiscalYear": self.fiscal_year or "२०८१/०८२",
            "sector": self.sector or "पूर्वाधार विकास",
            "wardNo": self.ward_no or "समग्र पालिका",
            "estimatedAmount": est,
            "estimatedAmountNPR": est,
            "awardedAmount": awd,
            "contractAmountNPR": awd,
            "bidDocFee": float(self.bid_doc_fee or 3000),
            "bidDocFeeNPR": float(self.bid_doc_fee or 3000),
            "bidSecurityAmount": float(self.bid_security_amount or 0),
            "bidSecurityAmountNPR": float(self.bid_security_amount or 0),
            "performanceSecurityAmount": float(self.performance_security_amount or 0),
            "performanceSecurityAmountNPR": float(self.performance_security_amount or 0),
            "awardedTo": self.awarded_to or "",
            "awardedVendorName": self.awarded_to or "",
            "awardedVendorPan": self.awarded_vendor_pan or "",
            "advertisedDateBs": self.advertised_date_bs or "",
            "publishDateBs": self.advertised_date_bs or "",
            "deadlineDateBs": self.deadline_date_bs or "",
            "submissionDeadlineBs": self.deadline_date_bs or "",
            "loiPublishDateBs": self.loi_publish_date_bs or "",
            "contractDateBs": self.contract_date_bs or "",
            "completionDateBs": self.completion_date_bs or "",
            "biddersCount": int(self.bidders_count or 0),
            "biddersList": self.bidders_list if isinstance(self.bidders_list, list) else [],
            "runningBills": self.running_bills if isinstance(self.running_bills, list) else [],
            "bankDetails": self.bank_details if isinstance(self.bank_details, dict) and self.bank_details else {
                "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
                "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
                "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
            },
            "documents": self.documents if isinstance(self.documents, list) else [],
            "requirements": self.requirements if isinstance(self.requirements, list) else [],
            "costSavingsNPR": savings,
            "costSavingsPct": savings_pct,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
