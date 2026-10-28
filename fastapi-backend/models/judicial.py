"""
Judicial Committee Database Models
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Aligned with actual PostgreSQL schema
"""
from sqlalchemy import Column, String, Integer, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid


class JudicialCase(Base):
    __tablename__ = 'judicial_cases'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_no = Column(String, unique=True, name='caseNo')
    title = Column(String, nullable=False)
    dispute_type = Column(String, default='अन्य स्थानीय विवाद', name='disputeType')
    status = Column(String, default='दर्ता भएको')

    complainant_name = Column(String, nullable=False, name='complainantName')
    complainant_phone = Column(String, nullable=True, name='complainantPhone')
    complainant_address = Column(String, nullable=True, name='complainantAddress')
    complainant_citizenship = Column(String, nullable=True, name='complainantCitizenship')
    ward_number = Column(Integer, nullable=True, default=1, name='wardNumber')

    respondent_name = Column(String, nullable=False, name='respondentName')
    respondent_phone = Column(String, nullable=True, name='respondentPhone')
    respondent_address = Column(String, nullable=True, name='respondentAddress')
    respondent_citizenship = Column(String, nullable=True, name='respondentCitizenship')

    disputed_kitta_no = Column(String, nullable=True, name='disputedKittaNo')
    claim_details = Column(Text, nullable=True, name='claimDetails')
    respondent_statement = Column(Text, nullable=True, name='respondentStatement')

    filing_date_bs = Column(String, nullable=True, name='filingDateBs')
    notice_issued_date_bs = Column(String, nullable=True, name='noticeIssuedDateBs')
    next_hearing_date_bs = Column(String, nullable=True, name='nextHearingDateBs')

    assigned_mediator_id = Column(String, nullable=True, name='assignedMediatorId')
    mediator_name = Column(String, nullable=True, name='mediatorName')
    reconciliation_notes = Column(Text, nullable=True, name='reconciliationNotes')

    verdict = Column(Text, nullable=True)
    verdict_date_bs = Column(String, nullable=True, name='verdictDateBs')
    presided_by = Column(String, nullable=True, name='presidedBy')
    final_settlement = Column(JSON, nullable=True, name='finalSettlement')

    hearings = Column(JSON, default=[])
    evidence_documents = Column(JSON, nullable=True, name='evidenceDocuments')

    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "caseNo": self.case_no,
            "title": self.title,
            "disputeType": self.dispute_type or "साँध सिमाना / जग्गा विवाद (Boundary Dispute)",
            "wardNumber": self.ward_number or 1,
            "registrationDateBs": self.filing_date_bs or "२०८१-०४-१०",
            "nextHearingDateBs": self.next_hearing_date_bs or "",
            "status": self.status or "नयाँ दर्ता (Registered)",
            "complainantName": self.complainant_name,
            "complainantPhone": self.complainant_phone or "",
            "complainantAddress": self.complainant_address or "",
            "complainantCitizenship": self.complainant_citizenship or "",
            "respondentName": self.respondent_name,
            "respondentPhone": self.respondent_phone or "",
            "respondentAddress": self.respondent_address or "",
            "respondentCitizenship": self.respondent_citizenship or "",
            "disputedKittaNo": self.disputed_kitta_no or "",
            "claimDetails": self.claim_details or "",
            "assignedMediatorId": self.assigned_mediator_id or "",
            "assignedMediatorName": self.mediator_name or "",
            "hearings": self.hearings or [],
            "verdict": self.verdict or "",
            "finalSettlement": self.final_settlement,
            "evidenceDocuments": self.evidence_documents or [],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class JudicialMediator(Base):
    __tablename__ = 'judicial_mediators'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mediator_code = Column(String, unique=True, name='mediatorCode')
    full_name = Column(String, nullable=False, name='fullName')
    ward_no = Column(Integer, default=1, name='wardNo')
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    training_institute = Column(String, nullable=True, name='trainingInstitute')
    certificate_no = Column(String, nullable=True, name='certificateNo')
    specialization = Column(String, nullable=True)
    active_cases_count = Column(Integer, default=0, name='activeCasesCount')
    resolved_cases_count = Column(Integer, default=0, name='resolvedCasesCount')
    status = Column(String, default='active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "mediatorCode": self.mediator_code or "",
            "fullName": self.full_name,
            "wardNo": self.ward_no or 1,
            "phone": self.phone or "",
            "email": self.email or "",
            "trainingInstitute": self.training_institute or "मेलमिलाप परिषद् नेपाल",
            "certificateNo": self.certificate_no or "",
            "specialization": self.specialization or "साँध सिमाना तथा सामान्य विवाद",
            "activeCasesCount": self.active_cases_count or 0,
            "resolvedCasesCount": self.resolved_cases_count or 0,
            "status": self.status or "active",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class JudicialCauseList(Base):
    __tablename__ = 'judicial_cause_list'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bench_date_bs = Column(String, nullable=False, name='benchDateBs')
    bench_time = Column(String, nullable=True, name='benchTime')
    case_id = Column(String, nullable=True, name='caseId')
    case_no = Column(String, nullable=True, name='caseNo')
    parties = Column(String, nullable=True)
    dispute_type = Column(String, nullable=True, name='disputeType')
    stage = Column(String, default='मेलमिलाप छलफल')
    bench_presided_by = Column(String, default='उपाध्यक्ष (संयोजक)', name='benchPresidedBy')
    bench_members = Column(JSON, default=[], name='benchMembers')
    status = Column(String, default='scheduled')
    result_notes = Column(Text, nullable=True, name='resultNotes')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "benchDateBs": self.bench_date_bs,
            "benchTime": self.bench_time or "दिउँसो ०१:०० बजे",
            "caseId": self.case_id or "",
            "caseNo": self.case_no or "",
            "parties": self.parties or "",
            "disputeType": self.dispute_type or "",
            "stage": self.stage or "मेलमिलाप छलफल",
            "benchPresidedBy": self.bench_presided_by or "उपाध्यक्ष (संयोजक)",
            "benchMembers": self.bench_members or ["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"],
            "status": self.status or "scheduled",
            "resultNotes": self.result_notes or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
