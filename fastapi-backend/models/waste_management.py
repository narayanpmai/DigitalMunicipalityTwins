"""
Solid Waste Management Database Models
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Aligned with actual PostgreSQL schema
"""
from sqlalchemy import Column, String, Integer, Numeric, DateTime, JSON, Float, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid


class WasteVehicle(Base):
    __tablename__ = 'waste_vehicles'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    license_plate = Column(String(50), nullable=False, name='licensePlate')
    driver_name = Column(String(100), nullable=True, name='driverName')
    route_assigned = Column(String(100), nullable=True, name='routeAssigned')
    current_lat = Column(Numeric(10, 7), nullable=True, name='currentLat')
    current_lon = Column(Numeric(10, 7), nullable=True, name='currentLon')
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "licensePlate": self.license_plate,
            "driverName": self.driver_name or "",
            "routeAssigned": self.route_assigned or "",
            "currentLat": float(self.current_lat) if self.current_lat is not None else 27.9789,
            "currentLon": float(self.current_lon) if self.current_lon is not None else 85.6123,
            "status": self.status or "active",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class WasteRate(Base):
    __tablename__ = 'waste_rates'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    waste_type = Column(String(100), nullable=False, name='wasteType')
    rate_per_kg = Column(Numeric(10, 2), nullable=False, name='ratePerKg')
    color_code = Column(String, default='#3b82f6', name='colorCode')
    is_active = Column(Boolean, default=True, name='isActive')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "wasteType": self.waste_type,
            "ratePerKg": float(self.rate_per_kg or 0),
            "colorCode": self.color_code or "#3b82f6",
            "isActive": bool(self.is_active),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class WasteSchedule(Base):
    __tablename__ = 'waste_schedules'
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    ward_no = Column(Integer, default=1, name='wardNo')
    route_code = Column(String, nullable=True, name='routeCode')
    route_name = Column(String, nullable=False, name='routeName')
    collection_days_bio = Column(String, nullable=True, name='collectionDaysBio')
    collection_days_non_bio = Column(String, nullable=True, name='collectionDaysNonBio')
    vehicle_number = Column(String, nullable=True, name='vehicleNumber')
    vehicle_type = Column(String, default='tractor', name='vehicleType')
    driver_name = Column(String, nullable=True, name='driverName')
    driver_phone = Column(String, nullable=True, name='driverPhone')
    supervisor_name = Column(String, nullable=True, name='supervisorName')
    supervisor_phone = Column(String, nullable=True, name='supervisorPhone')
    status = Column(String, default='active')
    timing = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "wardNo": self.ward_no,
            "ward_no": self.ward_no,
            "routeCode": self.route_code or "",
            "routeName": self.route_name,
            "collectionDaysBio": self.collection_days_bio or "",
            "collectionDaysNonBio": self.collection_days_non_bio or "",
            "vehicleNumber": self.vehicle_number or "",
            "vehicleType": self.vehicle_type or "tractor",
            "driverName": self.driver_name or "",
            "driverPhone": self.driver_phone or "",
            "supervisorName": self.supervisor_name or "",
            "supervisorPhone": self.supervisor_phone or "",
            "status": self.status or "active",
            "timing": self.timing or "बिहान ०६:३० - ०९:३०",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class DisposalSite(Base):
    __tablename__ = 'waste_disposal_sites'
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    site_name = Column(String, nullable=False, name='siteName')
    site_type = Column(String, default='compost_plant', name='siteType')
    ward_no = Column(Integer, default=1, name='wardNo')
    location_name = Column(String, nullable=False, name='locationName')
    total_area_ropani = Column(Float, default=5.0, name='totalAreaRopani')
    daily_capacity_tons = Column(Float, default=2.0, name='dailyCapacityTons')
    current_utilization_percent = Column(Float, default=50.0, name='currentUtilizationPercent')
    leachate_treatment = Column(String, default='active_biological', name='leachateTreatment')
    eia_registration_no = Column(String, nullable=True, name='eiaRegistrationNo')
    incharge_name = Column(String, nullable=True, name='inchargeName')
    incharge_phone = Column(String, nullable=True, name='inchargePhone')
    status = Column(String, default='operational')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "siteName": self.site_name,
            "siteType": self.site_type or "compost_plant",
            "wardNo": self.ward_no,
            "locationName": self.location_name,
            "totalAreaRopani": float(self.total_area_ropani or 0),
            "dailyCapacityTons": float(self.daily_capacity_tons or 0),
            "currentUtilizationPercent": float(self.current_utilization_percent or 0),
            "leachateTreatment": self.leachate_treatment or "active_biological",
            "eiaRegistrationNo": self.eia_registration_no or "",
            "inchargeName": self.incharge_name or "",
            "inchargePhone": self.incharge_phone or "",
            "status": self.status or "operational",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class SanitationWorker(Base):
    __tablename__ = 'waste_sanitation_workers'
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    worker_code = Column(String, nullable=True, name='workerCode')
    full_name = Column(String, nullable=False, name='fullName')
    ward_no = Column(Integer, default=1, name='wardNo')
    role = Column(String, default='sweeper')
    employment_type = Column(String, default='contract', name='employmentType')
    phone = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True, name='emergencyContact')
    ppe_kit_status = Column(String, default='distributed_complete', name='ppeKitStatus')
    ppe_distribution_date = Column(String, nullable=True, name='ppeDistributionDate')
    ppe_items = Column(JSON, nullable=True, name='ppeItems')
    last_health_checkup_date = Column(String, nullable=True, name='lastHealthCheckupDate')
    vaccination_status = Column(String, default='fully_vaccinated', name='vaccinationStatus')
    insurance_status = Column(String, default='active', name='insuranceStatus')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "workerCode": self.worker_code or "",
            "fullName": self.full_name,
            "wardNo": self.ward_no,
            "role": self.role or "sweeper",
            "employmentType": self.employment_type or "contract",
            "phone": self.phone or "",
            "emergencyContact": self.emergency_contact or "",
            "ppeKitStatus": self.ppe_kit_status or "distributed_complete",
            "ppeDistributionDate": self.ppe_distribution_date or "",
            "ppeItems": self.ppe_items or ["गमबुट", "पन्जा", "मास्क", "फ्लोरोसेन्ट ज्याकेट"],
            "lastHealthCheckupDate": self.last_health_checkup_date or "",
            "vaccinationStatus": self.vaccination_status or "fully_vaccinated",
            "insuranceStatus": self.insurance_status or "active",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class WasteAlert(Base):
    __tablename__ = 'waste_alerts'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(PG_UUID(as_uuid=True), nullable=True, name='reporter_id')
    issue_type = Column(String(255), nullable=True, name='issueType')
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    lat = Column(Numeric(10, 7), nullable=True)
    lon = Column(Numeric(10, 7), nullable=True)
    status = Column(String(20), default='pending')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "issue": self.description or self.issue_type or "फोहोर व्यवस्थापन गुनासो",
            "issueType": self.issue_type or "फोहोरमैला",
            "description": self.description or "",
            "location": self.location or "पाँचपोखरी थाङपाल",
            "reporter": "नागरिक गुनासो",
            "date": self.created_at.strftime("%Y-%m-%d") if self.created_at else datetime.utcnow().strftime("%Y-%m-%d"),
            "status": self.status or "pending",
            "lat": float(self.lat) if self.lat is not None else None,
            "lon": float(self.lon) if self.lon is not None else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class WasteWallet(Base):
    __tablename__ = 'waste_wallets'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    household_id = Column(PG_UUID(as_uuid=True), nullable=True, name='household_id')
    balance = Column(Numeric(12, 2), default=0.0)
    total_earned = Column(Numeric(12, 2), default=0.0, name='totalEarned')
    total_withdrawn = Column(Numeric(12, 2), default=0.0, name='totalWithdrawn')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self, household_name: str = None, ward: int = 1):
        return {
            "id": str(self.id),
            "householdId": str(self.household_id) if self.household_id else "",
            "name": household_name or "दावा लामा",
            "ward": ward,
            "balance": float(self.balance or 0),
            "totalEarned": float(self.total_earned or 0),
            "totalWithdrawn": float(self.total_withdrawn or 0),
            "totalRecycledKg": round(float(self.total_earned or 0) / 18.0, 1) if float(self.total_earned or 0) > 0 else 45.0,
            "date": self.updated_at.strftime("%Y-%m-%d") if self.updated_at else datetime.utcnow().strftime("%Y-%m-%d"),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class WasteTransaction(Base):
    __tablename__ = 'waste_transactions'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    household_id = Column(PG_UUID(as_uuid=True), nullable=True, name='household_id')
    waste_rate_id = Column(PG_UUID(as_uuid=True), nullable=True, name='waste_rate_id')
    weight_kg = Column(Numeric(10, 2), default=0.0, name='weightKg')
    rate_applied = Column(Numeric(10, 2), default=0.0, name='rateApplied')
    total_amount = Column(Numeric(10, 2), default=0.0, name='totalAmount')
    transaction_type = Column(String(50), default='deposit', name='transactionType')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "householdId": str(self.household_id) if self.household_id else "",
            "household_id": str(self.household_id) if self.household_id else "",
            "wasteRateId": str(self.waste_rate_id) if self.waste_rate_id else "",
            "weightKg": float(self.weight_kg or 0),
            "weight_kg": float(self.weight_kg or 0),
            "rateApplied": float(self.rate_applied or 0),
            "rate_applied": float(self.rate_applied or 0),
            "totalAmount": float(self.total_amount or 0),
            "total_amount": float(self.total_amount or 0),
            "transactionType": self.transaction_type or "deposit",
            "transaction_type": self.transaction_type or "deposit",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
