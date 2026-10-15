from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship, declarative_mixin, declared_attr
from sqlalchemy.sql import func
from core.database import Base
import uuid

@declarative_mixin
class AuditMixin:
    """Standard audit fields for all master tables."""
    @declared_attr
    def tenant_id(cls):
        return Column(String, index=True, nullable=True)

    @declared_attr
    def created_at(cls):
        return Column(DateTime(timezone=True), server_default=func.now())

    @declared_attr
    def updated_at(cls):
        return Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    @declared_attr
    def deleted_at(cls):
        return Column(DateTime(timezone=True), nullable=True)

    @declared_attr
    def created_by(cls):
        return Column(String, nullable=True)

    @declared_attr
    def updated_by(cls):
        return Column(String, nullable=True)


class WardMaster(Base, AuditMixin):
    __tablename__ = 'mdm_wards'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ward_number = Column(Integer, unique=True, index=True, nullable=False)
    population = Column(Integer, nullable=True)
    area_sq_km = Column(Float, nullable=True)
    boundary_geojson = Column(JSON, nullable=True)

    toles = relationship("ToleMaster", back_populates="ward")
    addresses = relationship("AddressMaster", back_populates="ward")


class ToleMaster(Base, AuditMixin):
    __tablename__ = 'mdm_toles'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ward_id = Column(String, ForeignKey('mdm_wards.id'), nullable=False)
    tole_name = Column(String, nullable=False)
    tole_name_en = Column(String, nullable=True)
    boundary_geojson = Column(JSON, nullable=True)

    ward = relationship("WardMaster", back_populates="toles")
    addresses = relationship("AddressMaster", back_populates="tole")


class AddressMaster(Base, AuditMixin):
    __tablename__ = 'mdm_addresses'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ward_id = Column(String, ForeignKey('mdm_wards.id'), nullable=False)
    tole_id = Column(String, ForeignKey('mdm_toles.id'), nullable=True)
    street_name = Column(String, nullable=True)
    house_number = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    ward = relationship("WardMaster", back_populates="addresses")
    tole = relationship("ToleMaster", back_populates="addresses")
    households = relationship("HouseholdMaster", back_populates="address")


class HouseholdMaster(Base, AuditMixin):
    __tablename__ = 'mdm_households'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    address_id = Column(String, ForeignKey('mdm_addresses.id'), nullable=False)
    head_of_household_id = Column(String, ForeignKey('mdm_citizens.id', use_alter=True, name='fk_household_head'), nullable=True)
    household_number = Column(String, unique=True, index=True)
    water_source = Column(String, nullable=True)
    electricity_type = Column(String, nullable=True)
    fuel_type = Column(String, nullable=True)
    toilet_type = Column(String, nullable=True)
    meta_data = Column(JSON, nullable=True)

    address = relationship("AddressMaster", back_populates="households")
    members = relationship("CitizenMaster", back_populates="household", foreign_keys="[CitizenMaster.household_id]")


class CitizenMaster(Base, AuditMixin):
    __tablename__ = 'mdm_citizens'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    household_id = Column(String, ForeignKey('mdm_households.id'), nullable=True)
    first_name = Column(String, nullable=False)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=False)
    full_name_en = Column(String, nullable=True)
    dob_bs = Column(String, nullable=True)
    dob_ad = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    citizenship_no = Column(String, nullable=True, index=True)
    national_id = Column(String, nullable=True, index=True)
    mobile_no = Column(String, nullable=True)
    relationship_to_head = Column(String, nullable=True)

    household = relationship("HouseholdMaster", back_populates="members", foreign_keys=[household_id])
    businesses = relationship("BusinessMaster", back_populates="owner")


class OrganizationMaster(Base, AuditMixin):
    __tablename__ = 'mdm_organizations'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_type = Column(String, nullable=False) # school, health, ngo, cooperative, committee
    name = Column(String, nullable=False)
    registration_no = Column(String, nullable=True)
    address_id = Column(String, ForeignKey('mdm_addresses.id'), nullable=True)
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    established_date_bs = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "orgType": self.org_type,
            "name": self.name,
            "registrationNo": self.registration_no or "",
            "addressId": self.address_id,
            "contactPerson": self.contact_person or "",
            "phone": self.phone or "",
            "establishedDateBs": self.established_date_bs or "",
            "tenantId": self.tenant_id,
            "createdAt": self.created_at.isoformat() if hasattr(self, 'created_at') and self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if hasattr(self, 'updated_at') and self.updated_at else None,
        }


class BusinessMaster(Base, AuditMixin):
    __tablename__ = 'mdm_businesses'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey('mdm_citizens.id'), nullable=False)
    business_name = Column(String, nullable=False)
    pan_vat_no = Column(String, nullable=True)
    registration_no = Column(String, nullable=True)
    business_type = Column(String, nullable=True)
    capital = Column(Float, nullable=True)
    address_id = Column(String, ForeignKey('mdm_addresses.id'), nullable=True)
    owner = relationship("CitizenMaster", back_populates="businesses")

    def to_dict(self):
        return {
            "id": self.id,
            "ownerId": self.owner_id,
            "businessName": self.business_name,
            "panVatNo": self.pan_vat_no,
            "registrationNo": self.registration_no,
            "businessType": self.business_type,
            "capital": self.capital,
            "addressId": self.address_id,
            "tenantId": self.tenant_id,
            "createdAt": self.created_at.isoformat() if hasattr(self, 'created_at') and self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if hasattr(self, 'updated_at') and self.updated_at else None,
        }


class AssetMaster(Base, AuditMixin):
    __tablename__ = 'mdm_assets'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_category = Column(String, nullable=False)
    asset_name = Column(String, nullable=False)
    specification = Column(Text, nullable=True)
    purchase_date = Column(Date, nullable=True)
    cost = Column(Float, nullable=True)
    condition = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "assetCategory": self.asset_category,
            "assetName": self.asset_name,
            "specification": self.specification or "",
            "purchaseDate": self.purchase_date.isoformat() if self.purchase_date else None,
            "cost": float(self.cost or 0),
            "condition": self.condition or "good",
            "assignedTo": self.assigned_to or "",
            "tenantId": self.tenant_id,
            "createdAt": self.created_at.isoformat() if hasattr(self, 'created_at') and self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if hasattr(self, 'updated_at') and self.updated_at else None,
        }


class InfrastructureMaster(Base, AuditMixin):
    __tablename__ = 'mdm_infrastructure'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    infra_type = Column(String, nullable=False) # road, bridge, building, water_source, irrigation
    name = Column(String, nullable=False)
    ward_id = Column(String, ForeignKey('mdm_wards.id'), nullable=True)
    length_or_capacity = Column(String, nullable=True)
    built_year = Column(String, nullable=True)
    geometry_geojson = Column(JSON, nullable=True) # GeoJSON representation
    status = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "infraType": self.infra_type,
            "name": self.name,
            "wardId": self.ward_id,
            "lengthOrCapacity": self.length_or_capacity or "",
            "builtYear": self.built_year or "",
            "geometryGeojson": self.geometry_geojson,
            "status": self.status or "operational",
            "tenantId": self.tenant_id,
            "createdAt": self.created_at.isoformat() if hasattr(self, 'created_at') and self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if hasattr(self, 'updated_at') and self.updated_at else None,
        }
