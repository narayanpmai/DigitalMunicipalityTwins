from sqlalchemy import Column, String, Integer, Numeric, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class PublicAsset(Base):
    __tablename__ = 'public_assets'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_code = Column(String, unique=True, name='assetCode')
    asset_name = Column(String, name='assetName')
    category = Column(String, default='अन्य पुँजीगत सम्पत्ति')
    malepa_form = Column(String, default='मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)', name='malepaForm')
    condition = Column(String, default='चालु अवस्थामा (Operational)')
    ward_number = Column(Integer, default=0, name='wardNumber')
    
    department = Column(String, nullable=True)
    custodian_name = Column(String, nullable=True, name='custodianName')
    location = Column(String, nullable=True)
    
    purchase_date_bs = Column(String, nullable=True, name='purchaseDateBs')
    purchase_cost = Column(Numeric(15, 2), default=0, name='purchaseCost')
    depreciation_rate_percent = Column(Numeric(5, 2), default=10.0, name='depreciationRatePercent')
    current_book_value = Column(Numeric(15, 2), default=0, name='currentBookValue')
    
    model_or_plate_no = Column(String, nullable=True, name='modelOrPlateNo')
    vendor_name = Column(String, nullable=True, name='vendorName')
    remarks = Column(Text, nullable=True)
    
    inspections = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "assetCode": self.asset_code,
            "assetName": self.asset_name,
            "category": self.category,
            "malepaForm": self.malepa_form,
            "condition": self.condition,
            "wardNumber": self.ward_number or 0,
            "department": self.department or "",
            "custodianName": self.custodian_name or "",
            "location": self.location or "",
            "purchaseDateBs": self.purchase_date_bs or "",
            "purchaseCost": float(self.purchase_cost or 0),
            "depreciationRatePercent": float(self.depreciation_rate_percent or 10),
            "currentBookValue": float(self.current_book_value or 0),
            "modelOrPlateNo": self.model_or_plate_no or "",
            "vendorName": self.vendor_name or "",
            "remarks": self.remarks or "",
            "inspections": self.inspections if isinstance(self.inspections, list) else [],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
