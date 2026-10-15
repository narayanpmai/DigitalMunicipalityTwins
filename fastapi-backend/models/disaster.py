"""
Disaster Management Module Database Models
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Aligned with actual PostgreSQL schema
"""
from sqlalchemy import Column, String, Integer, Float, Numeric, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid


class DisasterEvent(Base):
    __tablename__ = 'disaster_events'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    type = Column(String, default='other')
    severity = Column(String, default='medium')
    status = Column(String, default='active')
    description = Column(Text, nullable=True)

    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    ward_number = Column(Integer, nullable=True, name='wardNumber')

    reporter_name = Column(String, nullable=True, name='reporterName')
    reporter_phone = Column(String, nullable=True, name='reporterPhone')
    incident_date_bs = Column(String, nullable=True, name='incidentDateBs')

    affected_households = Column(Integer, default=0, name='affectedHouseholds')
    affected_people = Column(Integer, default=0, name='affectedPeople')
    human_casualties = Column(Integer, default=0, name='humanCasualties')
    missing_persons = Column(Integer, default=0, name='missingPersons')
    injured_count = Column(Integer, default=0, name='injuredCount')
    livestock_loss_count = Column(Integer, default=0, name='livestockLossCount')
    fully_damaged_houses = Column(Integer, default=0, name='fullyDamagedHouses')
    partially_damaged_houses = Column(Integer, default=0, name='partiallyDamagedHouses')
    estimated_loss_npr = Column(Numeric(15, 2), default=0, name='estimatedLossNPR')

    relief_status = Column(String, default='आवश्यक', name='reliefStatus')
    relief_materials = Column(Text, nullable=True, name='reliefMaterials')
    relief_disbursed_npr = Column(Numeric(15, 2), default=0, name='reliefDisbursedNPR')
    rescue_team = Column(String, nullable=True, name='rescueTeam')
    tols_settlement = Column(String, nullable=True, name='tolsSettlement')

    resolved_at = Column(DateTime, nullable=True, name='resolvedAt')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "type": self.type or "other",
            "severity": self.severity or "medium",
            "status": self.status or "active",
            "description": self.description or "",
            "lat": self.lat,
            "lng": self.lng,
            "wardNumber": self.ward_number or 1,
            "reporterName": self.reporter_name or "",
            "reporterPhone": self.reporter_phone or "",
            "incidentDateBs": self.incident_date_bs or "",
            "affectedHouseholds": self.affected_households or 0,
            "affectedPeople": self.affected_people or 0,
            "humanCasualties": self.human_casualties or 0,
            "missingPersons": self.missing_persons or 0,
            "injuredCount": self.injured_count or 0,
            "livestockLossCount": self.livestock_loss_count or 0,
            "fullyDamagedHouses": self.fully_damaged_houses or 0,
            "partiallyDamagedHouses": self.partially_damaged_houses or 0,
            "estimatedLossNPR": float(self.estimated_loss_npr or 0),
            "reliefStatus": self.relief_status or "आवश्यक",
            "reliefMaterials": self.relief_materials or "",
            "reliefDisbursedNPR": float(self.relief_disbursed_npr or 0),
            "rescueTeam": self.rescue_team or "",
            "tolsSettlement": self.tols_settlement or "",
            "resolvedAt": self.resolved_at.isoformat() if self.resolved_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class Shelter(Base):
    __tablename__ = 'shelters'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    ward_number = Column(Integer, default=1, name='ward_number')
    location = Column(String, nullable=True)
    capacity = Column(Integer, default=0)
    has_water = Column(Boolean, default=True, name='has_water')
    has_power_backup = Column(Boolean, default=False, name='has_power_backup')
    contact_person = Column(String, nullable=True, name='contact_person')
    contact_phone = Column(String, nullable=True, name='contact_phone')
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    status = Column(String, default='active')
    facilities_description = Column(String, nullable=True, name='facilities_description')
    created_at = Column(DateTime, default=datetime.utcnow, name='created_at')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updated_at')

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "wardNumber": self.ward_number or 1,
            "location": self.location or "",
            "capacity": self.capacity or 0,
            "hasWater": bool(self.has_water),
            "hasPowerBackup": bool(self.has_power_backup),
            "contactPerson": self.contact_person or "",
            "contactPhone": self.contact_phone or "",
            "lat": self.lat,
            "lng": self.lng,
            "latitude": self.lat,
            "longitude": self.lng,
            "status": self.status or "active",
            "facilitiesDescription": self.facilities_description or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class EmergencyContact(Base):
    __tablename__ = 'emergency_contacts'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    role = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    department = Column(String, nullable=True)
    category = Column(String, default='other')
    is_available_24_7 = Column(Boolean, default=True, name='isAvailable24_7')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "role": self.role or "",
            "phone": self.phone or "",
            "wardNumber": self.ward_number or 0,
            "department": self.department or "",
            "category": self.category or "other",
            "isAvailable24_7": bool(self.is_available_24_7),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class ReliefInventory(Base):
    __tablename__ = 'disaster_relief_inventory'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_name = Column(String, nullable=False, name='itemName')
    category = Column(String, default='shelter')
    quantity = Column(Integer, default=0)
    unit = Column(String, default='थान')
    warehouse_location = Column(String, nullable=True, name='warehouseLocation')
    ward_number = Column(Integer, default=1, name='wardNumber')
    condition = Column(String, default='good')
    last_updated_bs = Column(String, nullable=True, name='lastUpdatedBs')
    contact_person = Column(String, nullable=True, name='contactPerson')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "itemName": self.item_name,
            "category": self.category or "shelter",
            "quantity": self.quantity or 0,
            "unit": self.unit or "थान",
            "warehouseLocation": self.warehouse_location or "",
            "wardNumber": self.ward_number or 1,
            "condition": self.condition or "good",
            "lastUpdatedBs": self.last_updated_bs or "२०८१-०५-१०",
            "contactPerson": self.contact_person or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class DisasterReliefFund(Base):
    __tablename__ = 'disaster_relief_funds'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    disaster_title = Column(String, nullable=False, name='disasterTitle')
    ward_number = Column(Integer, default=1, name='wardNumber')
    beneficiary_name = Column(String, nullable=False, name='beneficiaryName')
    citizenship_no = Column(String, nullable=True, name='citizenshipNo')
    family_count = Column(Integer, default=1, name='familyCount')
    relief_type = Column(String, default='नगद राहत (DBT)', name='reliefType')
    amount_npr = Column(Numeric(15, 2), default=0, name='amountNPR')
    distribution_date_bs = Column(String, nullable=True, name='distributionDateBs')
    disbursed_by_officer = Column(String, nullable=True, name='disbursedByOfficer')
    voucher_no = Column(String, nullable=True, name='voucherNo')
    status = Column(String, default='वितरण सम्पन्न')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "disasterTitle": self.disaster_title,
            "wardNumber": self.ward_number or 1,
            "beneficiaryName": self.beneficiary_name,
            "citizenshipNo": self.citizenship_no or "",
            "familyCount": self.family_count or 1,
            "reliefType": self.relief_type or "नगद राहत (DBT)",
            "amountNPR": float(self.amount_npr or 0),
            "distributionDateBs": self.distribution_date_bs or "२०८१-०५-०४",
            "disbursedByOfficer": self.disbursed_by_officer or "",
            "voucherNo": self.voucher_no or "",
            "status": self.status or "वितरण सम्पन्न",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class VulnerableSettlement(Base):
    __tablename__ = 'vulnerable_settlements'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    settlement_name = Column(String, nullable=False, name='settlementName')
    ward_number = Column(Integer, default=1, name='wardNumber')
    hazard_type = Column(String, default='पहिरो (Landslide)', name='hazardType')
    risk_level = Column(String, default='उच्च', name='riskLevel')
    at_risk_households = Column(Integer, default=0, name='atRiskHouseholds')
    at_risk_population = Column(Integer, default=0, name='atRiskPopulation')
    resettlement_priority = Column(String, default='पूर्वतयारी तथा सतर्कता', name='resettlementPriority')
    safe_shelter_name = Column(String, nullable=True, name='safeShelterName')
    focal_person = Column(String, nullable=True, name='focalPerson')
    focal_person_phone = Column(String, nullable=True, name='focalPersonPhone')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "settlementName": self.settlement_name,
            "wardNumber": self.ward_number or 1,
            "hazardType": self.hazard_type or "पहिरो (Landslide)",
            "riskLevel": self.risk_level or "उच्च",
            "atRiskHouseholds": self.at_risk_households or 0,
            "atRiskPopulation": self.at_risk_population or 0,
            "resettlementPriority": self.resettlement_priority or "पूर्वतयारी तथा सतर्कता",
            "safeShelterName": self.safe_shelter_name or "",
            "focalPerson": self.focal_person or "",
            "focalPersonPhone": self.focal_person_phone or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
