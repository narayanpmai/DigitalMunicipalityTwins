from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, JSON, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid

class Ward(Base):
    __tablename__ = 'wards'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id', default='f07c2bcc-81ad-4e27-aeff-1a65f04e9f06')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ward_number = Column(Integer, name='wardNumber')
    name = Column(String, nullable=True)
    ward_chair_name = Column(String, nullable=True, name='wardChairName')
    chairperson = Column(String, nullable=True)
    secretary = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    office_location = Column(String, nullable=True, name='officeLocation')
    population = Column(Integer, nullable=True)
    total_population = Column(Integer, nullable=True, name='totalPopulation')
    male_population = Column(Integer, nullable=True, name='malePopulation')
    female_population = Column(Integer, nullable=True, name='femalePopulation')
    households = Column(Integer, nullable=True)
    literacy_rate = Column(Numeric(5, 2), nullable=True, name='literacyRate')
    caste_distribution = Column(JSON, nullable=True, name='casteDistribution')
    age_distribution = Column(JSON, nullable=True, name='ageDistribution')
    mother_tongues = Column(JSON, nullable=True, name='motherTongues')
    schools = Column(Integer, nullable=True)
    health_posts = Column(Integer, nullable=True, name='healthPosts')
    area_sq_km = Column(Numeric(10, 4), nullable=True, name='areaSqKm')
    center_lat = Column(Numeric(10, 6), nullable=True, name='centerLat')
    center_lng = Column(Numeric(10, 6), nullable=True, name='centerLng')
    main_settlement = Column(String, nullable=True, name='mainSettlement')
    description = Column(Text, nullable=True)
    boundaries = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, name='isActive')
    panorama_url = Column(String, nullable=True, name='panoramaUrl')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        pop = self.total_population or self.population or 0
        m_pop = self.male_population or int(pop * 0.49)
        f_pop = self.female_population or (pop - m_pop)
        
        return {
            "id": str(self.id),
            "wardNumber": int(self.ward_number),
            "name": self.name or f"वडा नं. {self.ward_number}",
            "wardChairName": self.ward_chair_name or self.chairperson or "",
            "chairperson": self.chairperson or self.ward_chair_name or "",
            "secretary": self.secretary or "",
            "phone": self.phone or "",
            "officeLocation": self.office_location or "",
            "population": pop,
            "totalPopulation": pop,
            "malePopulation": m_pop,
            "femalePopulation": f_pop,
            "households": int(self.households or 0),
            "literacyRate": float(self.literacy_rate or 0) if self.literacy_rate is not None else 72.5,
            "casteDistribution": self.caste_distribution or {},
            "ageDistribution": self.age_distribution or {},
            "motherTongues": self.mother_tongues or {},
            "schools": int(self.schools or 0),
            "healthPosts": int(self.health_posts or 0),
            "areaSqKm": float(self.area_sq_km or 0),
            "centerLat": float(self.center_lat) if self.center_lat is not None else None,
            "centerLng": float(self.center_lng) if self.center_lng is not None else None,
            "mainSettlement": self.main_settlement or "",
            "description": self.description or "",
            "boundaries": self.boundaries or {},
            "isActive": bool(self.is_active),
            "panoramaUrl": self.panorama_url or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
