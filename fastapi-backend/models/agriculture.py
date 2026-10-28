"""
Agriculture and Veterinary Database Models
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Aligned with PostgreSQL schema
"""
from sqlalchemy import Column, String, Integer, Boolean, Float, Date, DateTime, JSON, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid


class AgricultureFarmer(Base):
    __tablename__ = 'agriculture_farmers'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(String, unique=True, name='farmerId')
    full_name = Column(String, name='fullName')
    gender = Column(String, default='पुरुष')
    citizenship_no = Column(String, nullable=True, name='citizenshipNo')
    contact_phone = Column(String, nullable=True, name='contactPhone')
    ward_number = Column(Integer, name='wardNumber')
    tole_village = Column(String, nullable=True, name='toleVillage')
    farmer_category = Column(String, default='साना किसान (२-१० रोपनी)', name='farmerCategory')
    land_area_ropani = Column(Numeric(10, 2), default=3.5, name='landAreaRopani')
    major_crops = Column(String, nullable=True, name='majorCrops')
    livestock_details = Column(String, nullable=True, name='livestockDetails')
    bank_name = Column(String, nullable=True, name='bankName')
    bank_account_no = Column(String, nullable=True, name='bankAccountNo')
    subsidies_history = Column(String, nullable=True, name='subsidiesHistory')
    soil_health_card = Column(String, nullable=True, name='soilHealthCard')
    status = Column(String, default='प्रमाणित (Verified)')
    registered_date_bs = Column(String, nullable=True, name='registeredDateBs')
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "farmerId": self.farmer_id,
            "fullName": self.full_name,
            "gender": self.gender,
            "citizenshipNo": self.citizenship_no or "",
            "contactPhone": self.contact_phone or "",
            "wardNumber": self.ward_number,
            "toleVillage": self.tole_village or "",
            "farmerCategory": self.farmer_category,
            "landAreaRopani": float(self.land_area_ropani or 0),
            "majorCrops": self.major_crops or "",
            "livestockDetails": self.livestock_details or "",
            "bankName": self.bank_name or "",
            "bankAccountNo": self.bank_account_no or "",
            "subsidiesHistory": self.subsidies_history or "",
            "soilHealthCard": self.soil_health_card or "",
            "status": self.status,
            "registeredDateBs": self.registered_date_bs or "",
            "remarks": self.remarks or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class AgricultureProfile(Base):
    __tablename__ = 'agriculture_profiles'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    household_id = Column(String, ForeignKey('household_registries.id'), name='household_id')
    land_area_hectares = Column(Numeric(10, 2), default=0, name='landAreaHectares')
    farmer_category = Column(String, default='small', name='farmerCategory')
    main_crops = Column(Text, nullable=True, name='mainCrops')
    livestock_details = Column(JSON, default={}, name='livestockDetails')
    subsidies_received = Column(JSON, default=[], name='subsidiesReceived')
    additional_details = Column(JSON, default={}, name='additionaldetails')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self, household=None):
        main_crops_list = []
        if self.main_crops:
            if isinstance(self.main_crops, list):
                main_crops_list = self.main_crops
            elif isinstance(self.main_crops, str):
                main_crops_list = [c.strip() for c in self.main_crops.split(",") if c.strip()]

        add_details = self.additional_details if isinstance(self.additional_details, dict) else {}

        return {
            "id": str(self.id),
            "householdId": str(self.household_id),
            "landAreaHectares": float(self.land_area_hectares or 0),
            "farmerCategory": self.farmer_category,
            "mainCrops": main_crops_list,
            "livestockDetails": self.livestock_details if isinstance(self.livestock_details, dict) else {},
            "subsidiesReceived": self.subsidies_received if isinstance(self.subsidies_received, list) else [],
            "additionalDetails": add_details,
            "household": household,
            "citizenshipNo": add_details.get("citizenshipNo") or (household.get("citizenshipNo") if household else ""),
            "nidNo": add_details.get("nidNo", ""),
            "kittaNo": add_details.get("kittaNo", ""),
            "landMeasurementLocal": add_details.get("landMeasurementLocal", ""),
            "irrigationType": add_details.get("irrigationType", "कुलो / नहर (Canal)"),
            "bankName": add_details.get("bankName", ""),
            "bankBranch": add_details.get("bankBranch", ""),
            "bankAccountNo": add_details.get("bankAccountNo", ""),
            "wardVerificationStatus": add_details.get("wardVerificationStatus", "प्रमाणित (Verified)"),
            "insurancePolicyNo": add_details.get("insurancePolicyNo", ""),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class AgricultureVetMedicine(Base):
    __tablename__ = 'agriculture_vet_medicines'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medicine_name = Column(String(255), nullable=False, name='medicineName')
    batch_number = Column(String(100), nullable=True, name='batchNumber')
    manufacture_date = Column(Date, nullable=True, name='manufactureDate')
    expiry_date = Column(Date, nullable=True, name='expiryDate')
    stock_quantity = Column(Integer, default=0, nullable=False, name='stockQuantity')
    unit = Column(String(50), default='भाइल (Vials)', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "medicineName": self.medicine_name,
            "batchNumber": self.batch_number or "",
            "manufactureDate": self.manufacture_date.strftime("%Y-%m-%d") if self.manufacture_date else "",
            "expiryDate": self.expiry_date.strftime("%Y-%m-%d") if self.expiry_date else "",
            "stockQuantity": self.stock_quantity,
            "unit": self.unit or "भाइल (Vials)",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class AgricultureVetDistribution(Base):
    __tablename__ = 'agriculture_vet_distributions'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medicine_id = Column(PG_UUID(as_uuid=True), nullable=False, name='medicineId')
    farmer_id = Column(String(100), nullable=False, name='farmerId')
    animal_type = Column(String(100), nullable=True, name='animalType')
    quantity_given = Column(Integer, default=1, nullable=False, name='quantityGiven')
    distributed_date = Column(Date, default=datetime.utcnow().date(), nullable=False, name='distributedDate')
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self, medicine_dict: dict = None):
        return {
            "id": str(self.id),
            "medicineId": str(self.medicine_id),
            "farmerId": self.farmer_id,
            "animalType": self.animal_type or "गाई (Cow)",
            "quantityGiven": self.quantity_given,
            "distributedDate": self.distributed_date.strftime("%Y-%m-%d") if self.distributed_date else "",
            "remarks": self.remarks or "",
            "medicine": medicine_dict,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class VetAiRecord(Base):
    __tablename__ = 'agriculture_vet_ai_records'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    farmer_name = Column(String(100), nullable=False, name='farmerName')
    contact_phone = Column(String(20), nullable=True, name='contactPhone')
    ward_number = Column(Integer, default=1, name='wardNumber')
    animal_type = Column(String(50), nullable=False, name='animalType')
    breed = Column(String(100), nullable=False)
    straw_number = Column(String(100), nullable=False, name='strawNumber')
    ai_date_bs = Column(String(50), nullable=False, name='aiDateBs')
    expected_calving_date_bs = Column(String(50), nullable=True, name='expectedCalvingDateBs')
    technician_name = Column(String(100), nullable=False, name='technicianName')
    status = Column(String(50), default='निरीक्षण बाँकी (Pending)')
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "farmerName": self.farmer_name,
            "contactPhone": self.contact_phone or "",
            "wardNumber": self.ward_number,
            "animalType": self.animal_type,
            "breed": self.breed,
            "strawNumber": self.straw_number,
            "aiDateBs": self.ai_date_bs,
            "expectedCalvingDateBs": self.expected_calving_date_bs or "",
            "technicianName": self.technician_name,
            "status": self.status,
            "remarks": self.remarks or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class VetVaccinationRecord(Base):
    __tablename__ = 'agriculture_vet_vaccinations'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    vaccine_name = Column(String(100), nullable=False, name='vaccineName')
    ear_tag_number = Column(String(50), nullable=False, name='earTagNumber')
    animal_type = Column(String(50), nullable=False, name='animalType')
    farmer_name = Column(String(100), nullable=False, name='farmerName')
    ward_number = Column(Integer, default=1, name='wardNumber')
    vaccinated_date_bs = Column(String(50), nullable=False, name='vaccinatedDateBs')
    booster_due_date_bs = Column(String(50), nullable=True, name='boosterDueDateBs')
    batch_number = Column(String(50), nullable=True, name='batchNumber')
    technician_name = Column(String(100), nullable=False, name='technicianName')
    status = Column(String(50), default='सम्पन्न (Completed)')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "vaccineName": self.vaccine_name,
            "earTagNumber": self.ear_tag_number,
            "animalType": self.animal_type,
            "farmerName": self.farmer_name,
            "wardNumber": self.ward_number,
            "vaccinatedDateBs": self.vaccinated_date_bs,
            "boosterDueDateBs": self.booster_due_date_bs or "",
            "batchNumber": self.batch_number or "",
            "technicianName": self.technician_name,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class VetDiagnosisRecord(Base):
    __tablename__ = 'agriculture_vet_diagnoses'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    farmer_name = Column(String(100), nullable=False, name='farmerName')
    ward_number = Column(Integer, default=1, name='wardNumber')
    animal_type = Column(String(50), nullable=False, name='animalType')
    symptoms = Column(Text, nullable=False)
    suspected_disease = Column(String(100), nullable=False, name='suspectedDisease')
    prescribed_medicine = Column(String(255), nullable=False, name='prescribedMedicine')
    dosage_instructions = Column(Text, nullable=False, name='dosageInstructions')
    doctor_technician = Column(String(100), nullable=False, name='doctorTechnician')
    date_bs = Column(String(50), nullable=False, name='dateBs')
    follow_up_date_bs = Column(String(50), nullable=True, name='followUpDateBs')
    status = Column(String(50), default='उपचार जारी (Under Treatment)')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "farmerName": self.farmer_name,
            "wardNumber": self.ward_number,
            "animalType": self.animal_type,
            "symptoms": self.symptoms,
            "suspectedDisease": self.suspected_disease,
            "prescribedMedicine": self.prescribed_medicine,
            "dosageInstructions": self.dosage_instructions,
            "doctorTechnician": self.doctor_technician,
            "dateBs": self.date_bs,
            "followUpDateBs": self.follow_up_date_bs or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class AgricultureData(Base):
    __tablename__ = 'agriculture_data'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ward_number = Column(Integer, nullable=False, name='wardNumber')
    crop_name = Column(String, nullable=False, name='cropName')
    crop_type = Column(String, default='cereal', name='cropType')
    area_hectares = Column(Numeric(10, 2), default=0.0, name='areaHectares')
    production_mt = Column(Numeric(10, 2), default=0.0, name='productionMt')
    fiscal_year = Column(String, default='2080/081', name='fiscalYear')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self):
        area = float(self.area_hectares or 0)
        prod = float(self.production_mt or 0)
        yield_rate = round(prod / area, 2) if area > 0 else 0
        return {
            "id": str(self.id),
            "wardNo": self.ward_number,
            "wardNumber": self.ward_number,
            "cropName": self.crop_name,
            "category": self.crop_type,
            "cropType": self.crop_type,
            "cultivatedAreaHectares": area,
            "areaHectares": area,
            "annualProductionMetricTons": prod,
            "productionMt": prod,
            "yieldPerHectare": yield_rate,
            "fiscalYear": self.fiscal_year,
            "farmerHouseholds": int(area * 4) if area > 0 else 10,
            "subsidiesProvidedNpr": int(area * 2500),
            "remarks": f"आ.व. {self.fiscal_year}",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class AgricultureFertilizerStock(Base):
    __tablename__ = 'agriculture_fertilizer_stocks'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    depot_name = Column(String, nullable=False, name='depotName')
    ward_number = Column(Integer, nullable=False, name='wardNumber')
    contact_person = Column(String, nullable=True, name='contactPerson')
    contact_phone = Column(String, nullable=True, name='contactPhone')
    fertilizer_type = Column(String, default='UREA', name='fertilizerType')
    fertilizer_name_nepali = Column(String, nullable=False, name='fertilizerNameNepali')
    total_stock_kg = Column(Numeric(12, 2), default=5000, name='totalStockKg')
    distributed_kg = Column(Numeric(12, 2), default=0, name='distributedKg')
    available_stock_kg = Column(Numeric(12, 2), default=5000, name='availableStockKg')
    subsidized_price_per_kg = Column(Numeric(10, 2), default=18, name='subsidizedPricePerKg')
    market_price_per_kg = Column(Numeric(10, 2), default=55, name='marketPricePerKg')
    fiscal_year = Column(String, default='२०८१/०८२', name='fiscalYear')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "depotName": self.depot_name,
            "wardNumber": self.ward_number,
            "contactPerson": self.contact_person or "",
            "contactPhone": self.contact_phone or "",
            "fertilizerType": self.fertilizer_type,
            "fertilizerNameNepali": self.fertilizer_name_nepali,
            "totalStockKg": float(self.total_stock_kg or 0),
            "distributedKg": float(self.distributed_kg or 0),
            "availableStockKg": float(self.available_stock_kg or 0),
            "subsidizedPricePerKg": float(self.subsidized_price_per_kg or 0),
            "marketPricePerKg": float(self.market_price_per_kg or 0),
            "fiscalYear": self.fiscal_year,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class AgricultureFertilizerDistribution(Base):
    __tablename__ = 'agriculture_fertilizer_distributions'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(String, nullable=False, name='farmerId')
    farmer_name = Column(String, nullable=False, name='farmerName')
    ward_number = Column(Integer, nullable=False, name='wardNumber')
    depot_name = Column(String, nullable=False, name='depotName')
    fertilizer_type = Column(String, default='UREA', name='fertilizerType')
    fertilizer_name_nepali = Column(String, nullable=False, name='fertilizerNameNepali')
    quantity_bags = Column(Numeric(10, 2), default=1, name='quantityBags')
    quantity_kg = Column(Numeric(10, 2), default=50, name='quantityKg')
    subsidized_rate_per_kg = Column(Numeric(10, 2), default=18, name='subsidizedRatePerKg')
    market_rate_per_kg = Column(Numeric(10, 2), default=55, name='marketRatePerKg')
    farmer_paid_amount_npr = Column(Numeric(12, 2), default=900, name='farmerPaidAmountNpr')
    government_subsidy_amount_npr = Column(Numeric(12, 2), default=1850, name='governmentSubsidyAmountNpr')
    crop_season = Column(String, default='हिउँदे आलु तथा गहुँ बाली (२०८१/०८२)', name='cropSeason')
    recommended_quota_kg = Column(Numeric(10, 2), default=50, name='recommendedQuotaKg')
    receipt_no = Column(String, nullable=False, name='receiptNo')
    distribution_date_bs = Column(String, default='२०८१-०५-१५', name='distributionDateBs')
    status = Column(String, default='DISBURSED')
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "farmerId": self.farmer_id,
            "farmerName": self.farmer_name,
            "wardNumber": self.ward_number,
            "depotName": self.depot_name,
            "fertilizerType": self.fertilizer_type,
            "fertilizerNameNepali": self.fertilizer_name_nepali,
            "quantityBags": float(self.quantity_bags or 0),
            "quantityKg": float(self.quantity_kg or 0),
            "subsidizedRatePerKg": float(self.subsidized_rate_per_kg or 0),
            "marketRatePerKg": float(self.market_rate_per_kg or 0),
            "farmerPaidAmountNpr": float(self.farmer_paid_amount_npr or 0),
            "governmentSubsidyAmountNpr": float(self.government_subsidy_amount_npr or 0),
            "cropSeason": self.crop_season,
            "recommendedQuotaKg": float(self.recommended_quota_kg or 0),
            "receiptNo": self.receipt_no,
            "distributionDateBs": self.distribution_date_bs,
            "status": self.status,
            "remarks": self.remarks or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class AgricultureMarketItem(Base):
    __tablename__ = 'agriculture_market_items'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_name = Column(String(255), nullable=False, name='itemName')
    category = Column(String(100), nullable=False)
    unit = Column(String(50), default='Kg', nullable=False)
    icon = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "itemName": self.item_name,
            "category": self.category,
            "unit": self.unit or "Kg",
            "icon": self.icon or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class AgricultureMarketPrice(Base):
    __tablename__ = 'agriculture_market_prices'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(PG_UUID(as_uuid=True), ForeignKey('agriculture_market_items.id'), nullable=False, name='itemId')
    date = Column(Date, nullable=False)
    min_price = Column(Numeric(10, 2), nullable=False, name='minPrice')
    max_price = Column(Numeric(10, 2), nullable=False, name='maxPrice')
    average_price = Column(Numeric(10, 2), nullable=True, name='averagePrice')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    def to_dict(self, item_dict: dict = None):
        min_p = float(self.min_price or 0)
        max_p = float(self.max_price or 0)
        avg_p = float(self.average_price or ((min_p + max_p) / 2))
        return {
            "id": str(self.id),
            "itemId": str(self.item_id),
            "date": self.date.strftime("%Y-%m-%d") if self.date else "",
            "minPrice": min_p,
            "maxPrice": max_p,
            "averagePrice": avg_p,
            "wholesalePrice": min_p,
            "retailPrice": max_p,
            "marketCenter": "पाँचपोखरी हाटबजार तथा संकलन केन्द्र",
            "dailyInflowQuintal": 15.5,
            "item": item_dict,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class AgricultureAdvisory(Base):
    __tablename__ = 'agriculture_advisories'
    __table_args__ = {'extend_existing': True}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    advisory_type = Column(String(50), nullable=False, name='advisoryType')
    valid_until = Column(Date, nullable=True, name='validUntil')
    issued_by = Column(String(100), nullable=True, name='issuedBy')
    issued_date = Column(DateTime, default=datetime.utcnow, nullable=False, name='issuedDate')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "content": self.content,
            "advisoryType": str(self.advisory_type),
            "targetCategory": "समग्र बाली तथा पशुपन्छी",
            "targetZone": "वडा १-८ (समग्र पालिका)",
            "assignedOfficer": "सुरेश तामाङ (कृषि अधिकृत)",
            "officerPhone": "९८५१२३४५६७",
            "smsStatus": "DELIVERED (१,२४० कृषकलाई एसएमएस प्रेषित)",
            "validUntil": self.valid_until.strftime("%Y-%m-%d") if self.valid_until else "",
            "issuedBy": self.issued_by or "पाँचपोखरी थाङपाल गाउँपालिका कृषि विकास शाखा",
            "issuedDate": self.issued_date.strftime("%Y-%m-%d") if self.issued_date else "",
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


