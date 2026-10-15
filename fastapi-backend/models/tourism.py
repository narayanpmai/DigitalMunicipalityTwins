from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Boolean, Numeric
from core.database import Base
from datetime import datetime
import json

class Destination(Base):
    __tablename__ = 'tourism_destinations'
    __table_args__ = {'extend_existing': True}
    
    id = Column(String, primary_key=True)
    name = Column(String)
    name_en = Column(String, nullable=True, name='nameEn')
    ward_no = Column(Integer, nullable=True, name='wardNo')
    altitude_meters = Column(Integer, nullable=True, name='altitudeMeters')
    category = Column(String)
    description = Column(String)
    best_season = Column(String, nullable=True, name='bestSeason')
    trek_duration = Column(String, nullable=True, name='trekDuration')
    highlights = Column(JSON, nullable=True)
    image_url = Column(String, nullable=True, name='imageUrl')
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        h = self.highlights
        if isinstance(h, str):
            try: h = json.loads(h)
            except: h = [h]
        return {
            "id": self.id,
            "name": self.name,
            "nameEn": self.name_en or "",
            "wardNo": self.ward_no or 3,
            "altitudeMeters": self.altitude_meters or 2500,
            "category": self.category,
            "description": self.description or "",
            "bestSeason": self.best_season or "बाह्रै महिना",
            "trekDuration": self.trek_duration or "१-२ दिन",
            "highlights": h or [],
            "imageUrl": self.image_url or "",
            "lat": self.lat,
            "lng": self.lng,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class Hotel(Base):
    __tablename__ = 'tourism_hotels'
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    name = Column(String)
    type = Column(String, default='homestay')
    homestay_type = Column(String, nullable=True, name='homestayType')
    classification = Column(String, nullable=True)
    ward_no = Column(Integer, nullable=True, name='wardNo')
    owner_name = Column(String, nullable=True, name='ownerName')
    proprietor_name = Column(String, nullable=True, name='proprietorName')
    contact_number = Column(String, nullable=True, name='contactNumber')
    phone = Column(String, nullable=True)
    palika_reg_no = Column(String, nullable=True, name='palikaRegNo')
    operator_pan_or_citizenship = Column(String, nullable=True, name='operatorPanOrCitizenship')
    total_rooms = Column(Integer, default=5, name='totalRooms')
    bed_capacity = Column(Integer, default=10, name='bedCapacity')
    capacity = Column(Integer, default=10)
    price_per_night = Column(String, nullable=True, name='pricePerNight')
    amenities = Column(JSON, nullable=True)
    status = Column(String, default='active')
    image_url = Column(String, nullable=True, name='imageUrl')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        a = self.amenities
        if isinstance(a, str):
            try: a = json.loads(a)
            except: a = [a]
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type or "homestay",
            "homestayType": self.homestay_type or "community_homestay",
            "classification": self.classification or "क",
            "wardNo": self.ward_no or 3,
            "ownerName": self.owner_name or self.proprietor_name or "",
            "proprietorName": self.proprietor_name or self.owner_name or "",
            "contactNumber": self.contact_number or self.phone or "",
            "phone": self.phone or self.contact_number or "",
            "palikaRegNo": self.palika_reg_no or f"पाँच-पर्यटन-०३/२०८१",
            "operatorPanOrCitizenship": self.operator_pan_or_citizenship or "",
            "totalRooms": self.total_rooms or 5,
            "bedCapacity": self.bed_capacity or self.capacity or 10,
            "capacity": self.capacity or self.bed_capacity or 10,
            "pricePerNight": self.price_per_night or "१,५००",
            "amenities": a or ["तातो पानी", "स्थानीय खाना"],
            "status": self.status or "active",
            "imageUrl": self.image_url or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class TouristLog(Base):
    __tablename__ = 'tourism_tourist_logs'
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    tourist_name = Column(String, name='touristName')
    country = Column(String, default='Nepal')
    gender = Column(String, nullable=True)
    age_group = Column(String, nullable=True, name='ageGroup')
    purpose = Column(String, default='Trekking')
    entry_date = Column(String, nullable=True, name='entryDate')
    exit_date = Column(String, nullable=True, name='exitDate')
    destination = Column(String, nullable=True)
    permit_number = Column(String, nullable=True, name='permitNumber')
    guide_name = Column(String, nullable=True, name='guideName')
    guide_license_no = Column(String, nullable=True, name='guideLicenseNo')
    guide_phone = Column(String, nullable=True, name='guidePhone')
    emergency_contact = Column(String, nullable=True, name='emergencyContact')
    insurance_policy_no = Column(String, nullable=True, name='insurancePolicyNo')
    entry_fee_npr = Column(Float, default=100.0, name='entryFeeNpr')
    entry_fee_status = Column(String, default='paid', name='entryFeeStatus')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": self.id,
            "touristName": self.tourist_name,
            "country": self.country,
            "gender": self.gender or "male",
            "ageGroup": self.age_group or "adult",
            "purpose": self.purpose or "Trekking",
            "entryDate": self.entry_date or "",
            "exitDate": self.exit_date or "",
            "destination": self.destination or "पाँचपोखरी ताल",
            "permitNumber": self.permit_number or "",
            "guideName": self.guide_name or "",
            "guideLicenseNo": self.guide_license_no or "",
            "guidePhone": self.guide_phone or "",
            "emergencyContact": self.emergency_contact or "",
            "insurancePolicyNo": self.insurance_policy_no or "",
            "entryFeeNpr": self.entry_fee_npr or 100.0,
            "entryFeeStatus": self.entry_fee_status or "paid",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class TourPackage(Base):
    __tablename__ = 'tourism_packages'
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    title = Column(String)
    title_en = Column(String, nullable=True, name='titleEn')
    duration_days = Column(Integer, default=3, name='durationDays')
    cost_per_person = Column(String, nullable=True, name='costPerPerson')
    difficulty = Column(String, default='मध्यम')
    destinations = Column(JSON, nullable=True)
    inclusions = Column(JSON, nullable=True)
    guide_available = Column(Boolean, default=True, name='guideAvailable')
    image_url = Column(String, nullable=True, name='imageUrl')
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, name='isActive')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        d = self.destinations
        if isinstance(d, str):
            try: d = json.loads(d)
            except: d = [d]
        inc = self.inclusions
        if isinstance(inc, str):
            try: inc = json.loads(inc)
            except: inc = [inc]
        return {
            "id": self.id,
            "title": self.title,
            "titleEn": self.title_en or "",
            "durationDays": self.duration_days,
            "costPerPerson": self.cost_per_person or "१५,०००",
            "difficulty": self.difficulty or "मध्यम",
            "destinations": d or [],
            "inclusions": inc or [],
            "guideAvailable": self.guide_available,
            "imageUrl": self.image_url or "",
            "description": self.description or "",
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class LocalProduct(Base):
    __tablename__ = 'tourism_local_products'
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    name = Column(String)
    name_en = Column(String, nullable=True, name='nameEn')
    category = Column(String)
    price = Column(String, nullable=True)
    vendor_name = Column(String, name='vendorName')
    ward_no = Column(Integer, nullable=True, name='wardNo')
    contact_number = Column(String, nullable=True, name='contactNumber')
    in_stock = Column(Boolean, default=True, name='inStock')
    image_url = Column(String, nullable=True, name='imageUrl')
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "nameEn": self.name_en or "",
            "category": self.category,
            "price": self.price or "",
            "vendorName": self.vendor_name,
            "wardNo": self.ward_no or 3,
            "contactNumber": self.contact_number or "",
            "inStock": self.in_stock,
            "imageUrl": self.image_url or "",
            "description": self.description or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class Reservation(Base):
    __tablename__ = 'tourism_reservations'
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    guest_name = Column(String, name='guestName')
    phone = Column(String)
    email = Column(String, nullable=True)
    booking_type = Column(String, default='hotel', name='bookingType')
    reference_id = Column(String, name='referenceId')
    check_in_date = Column(String, nullable=True, name='checkInDate')
    pax = Column(Integer, default=1)
    total_amount = Column(String, nullable=True, name='totalAmount')
    status = Column(String, default='pending')
    special_requests = Column(String, nullable=True, name='specialRequests')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": self.id,
            "guestName": self.guest_name,
            "phone": self.phone,
            "email": self.email or "",
            "bookingType": self.booking_type,
            "referenceId": self.reference_id,
            "checkInDate": self.check_in_date or "",
            "pax": self.pax,
            "totalAmount": self.total_amount or "",
            "status": self.status,
            "specialRequests": self.special_requests or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
