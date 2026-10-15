from sqlalchemy import Column, String, Integer, Numeric, Boolean, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class ProgressIndicatorRecord(Base):
    __tablename__ = 'progress_indicator_records'
    
    tenant_id = Column(String, nullable=True, name='tenant_id', index=True)
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_unique_id = Column(String, unique=True, index=True, name='assetUniqueId')
    plan_code = Column(String, nullable=True, name='planCode')
    fiscal_year = Column(String, default='२०८०/०८१', index=True, name='fiscalYear')
    period_type = Column(String, default='1_year', name='periodType')
    module_key = Column(Integer, index=True, name='moduleKey')
    module_title_nepali = Column(String, name='moduleTitleNepali')
    asset_name = Column(String, name='assetName')
    ward_number = Column(Integer, default=0, index=True, name='wardNumber')
    tole_basti = Column(String, nullable=True, name='toleBasti')
    
    lat = Column(Numeric(10, 6), nullable=True)
    lng = Column(Numeric(10, 6), nullable=True)
    gps_accuracy = Column(Numeric(6, 2), nullable=True, name='gpsAccuracy')
    elevation_meters = Column(Numeric(8, 2), nullable=True, name='elevationMeters')
    geom_type = Column(String, default='point', name='geomType')
    geometry_coordinates = Column(JSON, nullable=True, name='geometryCoordinates')
    
    start_date = Column(String, nullable=True, name='startDate')
    completion_date = Column(String, nullable=True, name='completionDate')
    contractor_or_committee = Column(String, nullable=True, name='contractorOrCommittee')
    construction_cost = Column(Numeric(15, 2), default=0, name='constructionCost')
    expenditure_amount = Column(Numeric(15, 2), default=0, name='expenditureAmount')
    physical_progress_percent = Column(Integer, default=100, name='physicalProgressPercent')
    beneficiary_households = Column(Integer, default=0, name='beneficiaryHouseholds')
    beneficiary_population = Column(Integer, default=0, name='beneficiaryPopulation')
    
    condition = Column(String, default='good')
    last_maintenance_date = Column(String, nullable=True, name='lastMaintenanceDate')
    responsible_agency = Column(String, default='गाउँ कार्यपालिकाको कार्यालय / सम्बन्धित वडा', name='responsibleAgency')
    
    before_photo_url = Column(String, nullable=True, name='beforePhotoUrl')
    after_photo_url = Column(String, nullable=True, name='afterPhotoUrl')
    extra_photos = Column(JSON, nullable=True, name='extraPhotos')
    video_url = Column(String, nullable=True, name='videoUrl')
    drone_photo_url = Column(String, nullable=True, name='dronePhotoUrl')
    qr_code_token = Column(String, nullable=True, name='qrCodeToken')
    digital_signature = Column(String, nullable=True, name='digitalSignature')
    
    thematic_data = Column(JSON, default={}, name='thematicData')
    is_verified = Column(Boolean, default=True, name='isVerified')
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "asset_unique_id": self.asset_unique_id,
            "assetUniqueId": self.asset_unique_id,
            "plan_code": self.plan_code,
            "planCode": self.plan_code,
            "fiscal_year": self.fiscal_year,
            "fiscalYear": self.fiscal_year,
            "period_type": str(self.period_type) if self.period_type else "1_year",
            "periodType": str(self.period_type) if self.period_type else "1_year",
            "module_key": self.module_key,
            "moduleKey": self.module_key,
            "module_title_nepali": self.module_title_nepali,
            "moduleTitleNepali": self.module_title_nepali,
            "asset_name": self.asset_name,
            "assetName": self.asset_name,
            "ward_number": self.ward_number,
            "wardNumber": self.ward_number,
            "tole_basti": self.tole_basti,
            "toleBasti": self.tole_basti,
            "lat": float(self.lat) if self.lat is not None else None,
            "lng": float(self.lng) if self.lng is not None else None,
            "gps_accuracy": float(self.gps_accuracy) if self.gps_accuracy is not None else None,
            "elevation_meters": float(self.elevation_meters) if self.elevation_meters is not None else None,
            "geom_type": self.geom_type,
            "geomType": self.geom_type,
            "geometry_coordinates": self.geometry_coordinates,
            "geometryCoordinates": self.geometry_coordinates,
            "start_date": self.start_date,
            "startDate": self.start_date,
            "completion_date": self.completion_date,
            "completionDate": self.completion_date,
            "contractor_or_committee": self.contractor_or_committee,
            "contractorOrCommittee": self.contractor_or_committee,
            "construction_cost": float(self.construction_cost or 0),
            "constructionCost": float(self.construction_cost or 0),
            "expenditure_amount": float(self.expenditure_amount or 0),
            "expenditureAmount": float(self.expenditure_amount or 0),
            "physical_progress_percent": self.physical_progress_percent,
            "physicalProgressPercent": self.physical_progress_percent,
            "beneficiary_households": self.beneficiary_households,
            "beneficiaryHouseholds": self.beneficiary_households,
            "beneficiary_population": self.beneficiary_population,
            "beneficiaryPopulation": self.beneficiary_population,
            "condition": str(self.condition) if self.condition else "good",
            "last_maintenance_date": self.last_maintenance_date,
            "lastMaintenanceDate": self.last_maintenance_date,
            "responsible_agency": self.responsible_agency,
            "responsibleAgency": self.responsible_agency,
            "before_photo_url": self.before_photo_url,
            "beforePhotoUrl": self.before_photo_url,
            "after_photo_url": self.after_photo_url,
            "afterPhotoUrl": self.after_photo_url,
            "extra_photos": self.extra_photos,
            "extraPhotos": self.extra_photos,
            "video_url": self.video_url,
            "videoUrl": self.video_url,
            "drone_photo_url": self.drone_photo_url,
            "dronePhotoUrl": self.drone_photo_url,
            "qr_code_token": self.qr_code_token,
            "qrCodeToken": self.qr_code_token,
            "digital_signature": self.digital_signature,
            "digitalSignature": self.digital_signature,
            "thematic_data": self.thematic_data or {},
            "thematicData": self.thematic_data or {},
            "is_verified": self.is_verified,
            "isVerified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

