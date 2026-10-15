from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class Organization(Base):
    __tablename__ = 'organizations'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    name_en = Column(String, nullable=True, name='nameEn')
    type = Column(String, default='ngo')
    registration_no = Column(String, nullable=True, name='registrationNo')
    registration_date = Column(String, nullable=True, name='registrationDate')
    suchikrit_miti = Column(String, nullable=True, name='suchikritMiti')
    registration_nikaya = Column(String, nullable=True, name='registrationNikaya')
    pan = Column(String, nullable=True)
    chairperson = Column(String, nullable=True)
    contact_person = Column(String, nullable=True, name='contactPerson')
    phone = Column(String, nullable=True)
    tele_phone = Column(String, nullable=True, name='telePhone')
    email = Column(String, nullable=True)
    district = Column(String, nullable=True, default='सिन्धुपाल्चोक')
    municipality = Column(String, nullable=True, default='पाँचपोखरी थाङपाल गाउँपालिका')
    address = Column(String, nullable=True)
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    sector = Column(String, nullable=True)
    objectives = Column(Text, nullable=True)
    status = Column(String, default='active')
    is_active = Column(Boolean, default=True, name='isActive')
    registration_certificate_url = Column(String, nullable=True, name='registrationCertificateUrl')
    pan_certificate_url = Column(String, nullable=True, name='panCertificateUrl')
    logo_url = Column(String, nullable=True, name='logoUrl')
    members = Column(JSON, nullable=True)
    renewals = Column(JSON, nullable=True)
    agreements = Column(JSON, nullable=True)
    programs = Column(JSON, nullable=True)
    audits = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenantId": self.tenant_id,
            "name": self.name,
            "nameEn": self.name_en or "",
            "type": self.type or "ngo",
            "registrationNo": self.registration_no or "",
            "registrationDate": self.registration_date or "",
            "suchikritMiti": self.suchikrit_miti or "",
            "registrationNikaya": self.registration_nikaya or "",
            "pan": self.pan or "",
            "chairperson": self.chairperson or "",
            "contactPerson": self.contact_person or "",
            "phone": self.phone or "",
            "telePhone": self.tele_phone or "",
            "email": self.email or "",
            "district": self.district or "सिन्धुपाल्चोक",
            "municipality": self.municipality or "पाँचपोखरी थाङपाल गाउँपालिका",
            "address": self.address or "",
            "wardNumber": int(self.ward_number or 1),
            "sector": self.sector or "",
            "objectives": self.objectives or "",
            "status": self.status or "active",
            "isActive": bool(self.is_active),
            "registrationCertificateUrl": self.registration_certificate_url or "",
            "panCertificateUrl": self.pan_certificate_url or "",
            "logoUrl": self.logo_url or "",
            "members": self.members or [],
            "renewals": self.renewals or [],
            "agreements": self.agreements or [],
            "programs": self.programs or [],
            "audits": self.audits or [],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
