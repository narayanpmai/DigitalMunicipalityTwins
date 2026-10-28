"""
Health Module Database Models — aligned with ACTUAL database columns
Municipal Digital Twins v2.0
"""
from sqlalchemy import (
    Column, String, Integer, Boolean, Float, Date, DateTime,
    JSON, Numeric, Text
)
from sqlalchemy.orm import synonym
from core.database import Base
from datetime import datetime


class HealthFacility(Base):
    """health_facilities — camelCase DB columns"""
    __tablename__ = 'health_facilities'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    name = Column(String)
    name_en = Column(String, nullable=True, name='nameEn')
    ward_number = Column(Integer, name='wardNumber')
    type = Column(String, default='health_post')
    total_beds = Column(Integer, default=0, name='totalBeds')
    has_ambulance = Column(Boolean, default=True, name='hasAmbulance')
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    gis_data = Column(JSON, nullable=True, name='gisData')
    order_no = Column(Integer, nullable=True, name='orderNo')
    address = Column(String, default='पाँचपोखरी थाङपाल गा.पा.')
    location = Column(String, nullable=True)
    category_nepali = Column(String, nullable=True, name='categoryNepali')
    designation = Column(String, nullable=True)
    chief_name = Column(String, nullable=True, name='chiefName')
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')


class AmbulanceContact(Base):
    """health_ambulances — snake_case DB columns"""
    __tablename__ = 'health_ambulances'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    driver_name = Column(String)
    vehicle_number = Column(String)
    contact_number = Column(String)
    station_location = Column(String)
    ward_number = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True)


class PatientRecord(Base):
    """health_patients — snake_case DB columns"""
    __tablename__ = 'health_patients'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    patient_no = Column(String, unique=True)
    first_name = Column(String)
    last_name = Column(String)
    full_name = Column(String)
    age = Column(Integer)
    gender = Column(String, default='female')
    phone = Column(String, nullable=True)
    ward_number = Column(Integer, default=1)
    address = Column(String, default='पाँचपोखरी थाङपाल गाउँपालिका')
    citizenship_or_nin = Column(String, nullable=True)
    has_health_insurance = Column(Boolean, default=False)
    insurance_number = Column(String, nullable=True)
    health_facility_name = Column(String, default='पाँचपोखरी आधारभूत अस्पताल')
    department = Column(String, default='सामान्य चिकित्सा (General OPD)')
    attending_doctor = Column(String, nullable=True)
    ticket_fee = Column(Numeric, default=0)
    ticket_status = Column(String, default='active')
    blood_pressure = Column(String, nullable=True)
    pulse_rate = Column(String, nullable=True)
    temperature_f = Column(String, nullable=True)
    spo2_percent = Column(String, nullable=True)
    weight_kg = Column(String, nullable=True)
    chief_complaint = Column(Text, nullable=True)
    provisional_diagnosis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')


class IpdAdmission(Base):
    """health_ipd_admissions — snake_case DB columns"""
    __tablename__ = 'health_ipd_admissions'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    admission_no = Column(String, nullable=True)
    patient_id = Column(String, nullable=True)
    patient_name = Column(String)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)
    health_facility_name = Column(String, nullable=True)
    ward_number = Column(Integer, default=0)
    bed_number = Column(String)
    admission_date = Column(String)
    admitting_doctor = Column(String, nullable=True)   # DB col: admitting_doctor
    diagnosis = Column(Text, nullable=True)
    status = Column(String, default='admitted')
    discharge_date = Column(String, nullable=True)
    treatment_summary = Column(Text, nullable=True)
    has_insurance = Column(Boolean, nullable=True)
    insurance_no = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    # Expose as patient_no for compat
    patient_no = synonym('patient_id')


class HealthDischargeSummary(Base):
    """health_discharge_summaries"""
    __tablename__ = 'health_discharge_summaries'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    discharge_no = Column(String, nullable=True)
    admission_id = Column(String)
    admission_no = Column(String, nullable=True)
    patient_no = Column(String, nullable=True)
    patient_name = Column(String)
    bed_number = Column(String, nullable=True)
    admission_date = Column(String, nullable=True)
    discharge_date = Column(String)
    attending_doctor = Column(String, nullable=True)
    provisional_diagnosis = Column(String, nullable=True)
    final_diagnosis = Column(Text, nullable=True)
    treatment_given = Column(Text, nullable=True)
    condition_at_discharge = Column(String, nullable=True)
    follow_up_date = Column(String, nullable=True)
    doctor_advice = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')


class LabTestRecord(Base):
    """health_lab_tests — snake_case DB columns"""
    __tablename__ = 'health_lab_tests'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    test_order_no = Column(String, nullable=True)
    patient_id = Column(String, nullable=True)
    patient_name = Column(String)
    test_name = Column(String)
    test_category = Column(String, default='general')
    health_facility_name = Column(String, nullable=True)
    requested_by = Column(String, nullable=True)
    ordered_by = Column(String, nullable=True)
    result_summary = Column(Text, nullable=True)
    results = Column(JSON, nullable=True)
    status = Column(String, default='ordered')
    fee = Column(Numeric, default=0)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    patient_no = synonym('patient_id')
    category = synonym('test_category')
    price = synonym('fee')


class HealthPrescription(Base):
    """health_prescriptions — mixed case DB columns"""
    __tablename__ = 'health_prescriptions'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    rx_number = Column(String, nullable=True)
    patient_id = Column(String, nullable=True)
    patient_no = Column(String, nullable=True)
    patient_name = Column(String)
    ward_number = Column(Integer, default=0)
    doctor_name = Column(String, nullable=True)   # DB: doctor_name
    department = Column(String, nullable=True)
    diagnosis = Column(Text, nullable=True)
    medicines = Column(JSON, default=list)
    dispense_status = Column(String, default='pending')  # DB: dispense_status
    dispensed_at = Column(DateTime, nullable=True)
    dispensed_by = Column(String, nullable=True)
    is_insured = Column(Boolean, default=False)
    insurance_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    @property
    def status(self):
        return self.dispense_status

    @property
    def prescribed_by(self):
        return self.doctor_name


class HealthDhis2Report(Base):
    """health_dhis2_reports — snake_case DB columns"""
    __tablename__ = 'health_dhis2_reports'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    fiscal_year = Column(String)
    month_nepali = Column(String)
    health_facility_name = Column(String)
    ward_number = Column(Integer)
    dhis2_org_unit_id = Column(String, nullable=True)
    total_opd_visits = Column(Integer, default=0)
    male_opd_visits = Column(Integer, default=0)
    female_opd_visits = Column(Integer, default=0)
    emergency_visits = Column(Integer, default=0)
    first_anc_visits = Column(Integer, default=0)
    four_anc_protocol_visits = Column(Integer, default=0)
    institutional_deliveries = Column(Integer, default=0)
    pnc_visits = Column(Integer, default=0)
    fully_immunized_children = Column(Integer, default=0)
    growth_monitored_children = Column(Integer, default=0)
    diarrhea_cases = Column(Integer, default=0)
    ari_pneumonia_cases = Column(Integer, default=0)
    hypertension_diabetes_cases = Column(Integer, default=0)
    mental_health_cases = Column(Integer, default=0)
    reported_by = Column(String, nullable=True)
    sync_status = Column(String, default='pending')
    synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')


class MedicineStockItem(Base):
    """health_medicines — camelCase DB columns"""
    __tablename__ = 'health_medicines'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    medicine_name = Column(String, name='medicineName')
    generic_name = Column(String, nullable=True, name='genericName')
    category = Column(String, default='essential')
    health_facility_name = Column(String, name='healthFacilityName')
    ward_number = Column(Integer, default=0, name='wardNumber')
    batch_no = Column(String, nullable=True, name='batchNo')
    unit = Column(String, default='ट्याब्लेट')
    stock_quantity = Column(Integer, default=0, name='stockQuantity')
    minimum_required_stock = Column(Integer, default=0, name='minimumRequiredStock')
    expiry_date = Column(String, nullable=True, name='expiryDate')
    status = Column(String, default='sufficient')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')


class HealthSupplier(Base):
    """health_suppliers — snake_case DB columns"""
    __tablename__ = 'health_suppliers'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    supplier_name = Column(String)
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    pan_vat_number = Column(String, nullable=True)   # DB: pan_vat_number
    bank_name = Column(String, nullable=True)
    bank_account_no = Column(String, nullable=True)
    status = Column(String, default='active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deleted_at')

    @property
    def is_active(self):
        return self.status == 'active'

    @property
    def pan_number(self):
        return self.pan_vat_number


class HealthPurchase(Base):
    """health_purchases — snake_case DB columns"""
    __tablename__ = 'health_purchases'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    grn_no = Column(String, nullable=True)
    invoice_no = Column(String, nullable=True)
    supplier_id = Column(String, nullable=True)
    supplier_name = Column(String)
    purchase_date_bs = Column(String, nullable=True)
    purchase_date_ad = Column(String, nullable=True)
    health_facility_name = Column(String, nullable=True)
    ward_number = Column(Integer, nullable=True)
    sub_total = Column(Numeric, default=0)
    discount_amount = Column(Numeric, default=0)
    tax_amount = Column(Numeric, default=0)
    total_amount = Column(Numeric, default=0)
    payment_status = Column(String, default='paid')
    received_by = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deleted_at')

    @property
    def invoice_number(self):
        return self.invoice_no

    @property
    def paid_amount(self):
        return self.total_amount


class MedicineBatch(Base):
    __tablename__ = 'health_medicine_batches'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    medicine_name = Column(String)
    generic_name = Column(String, nullable=True)
    batch_no = Column(String)
    stock_quantity = Column(Integer, default=0)
    unit = Column(String, default='ट्याब्लेट')
    purchase_rate = Column(Numeric, default=0)
    sales_rate = Column(Numeric, default=0)
    health_facility_name = Column(String, nullable=True)
    ward_number = Column(Integer, default=6)
    expiry_date = Column(String)
    status = Column(String, default='active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deleted_at')

    @property
    def batch_number(self):
        return self.batch_no

    @property
    def quantity(self):
        return self.stock_quantity




class HealthPosSale(Base):
    """health_pos_sales — snake_case DB columns"""
    __tablename__ = 'health_pos_sales'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    bill_no = Column(String, nullable=True)
    patient_no = Column(String, nullable=True)
    patient_name = Column(String)
    ward_number = Column(Integer, default=0)
    is_insured = Column(Boolean, default=False)
    insurance_number = Column(String, nullable=True)
    sub_total = Column(Numeric, default=0)
    discount_amount = Column(Numeric, default=0)
    tax_amount = Column(Numeric, default=0)
    total_amount = Column(Numeric, default=0)
    copay_amount = Column(Numeric, default=0)
    payment_mode = Column(String, default='cash')
    biller_name = Column(String, nullable=True)
    health_facility_name = Column(String, nullable=True)
    items = Column(JSON, default=list, nullable=True)
    status = Column(String, default='completed')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    @property
    def bill_number(self):
        return self.bill_no

    @property
    def net_amount(self):
        return self.total_amount

    @property
    def cashier_name(self):
        return self.biller_name


class HealthPosReturn(Base):
    """health_pos_returns — Bill returns / refunds / credit notes"""
    __tablename__ = 'health_pos_returns'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    return_no = Column(String, unique=True)
    original_bill_no = Column(String, index=True, nullable=False)
    patient_no = Column(String, nullable=True)
    patient_name = Column(String)
    items = Column(JSON, default=list)  # list of {medicineName, batchNo, quantity, unitPrice, refundAmount}
    total_refund_amount = Column(Numeric, default=0)
    refund_mode = Column(String, default='cash')
    return_reason = Column(Text, nullable=True)
    returned_by = Column(String, nullable=True)
    health_facility_name = Column(String, nullable=True)
    ward_number = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')


class HealthInsuranceClaim(Base):
    """health_insurance_claims — snake_case DB columns"""
    __tablename__ = 'health_insurance_claims'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    claim_no = Column(String, nullable=True)
    policy_number = Column(String)
    patient_no = Column(String)
    patient_name = Column(String)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)
    claim_date_bs = Column(String, nullable=True)
    service_type = Column(String, nullable=True)
    diagnosis_name = Column(Text, nullable=True)
    total_bill_amount = Column(Numeric, default=0)
    copay_amount = Column(Numeric, default=0)
    claimed_amount = Column(Numeric, default=0)
    reimbursed_amount = Column(Numeric, nullable=True)
    claim_status = Column(String, default='submitted')
    health_facility_name = Column(String, nullable=True)
    ward_number = Column(Integer, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    @property
    def diagnosis(self):
        return self.diagnosis_name

    @property
    def insurance_company(self):
        return self.service_type


class HealthStockTransfer(Base):
    """health_stock_transfers — snake_case DB columns"""
    __tablename__ = 'health_stock_transfers'

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    transfer_no = Column(String, nullable=True)
    transfer_type = Column(String)
    from_location = Column(String)
    to_location = Column(String, nullable=True)
    medicine_name = Column(String, nullable=True)
    batch_no = Column(String, nullable=True)
    quantity = Column(Integer, default=0)
    unit = Column(String, nullable=True)
    transfer_date_bs = Column(String, nullable=True)
    requested_by = Column(String, nullable=True)
    issued_by = Column(String, nullable=True)
    status = Column(String, default='completed')
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')

    @property
    def from_facility(self):
        return self.from_location

    @property
    def to_facility(self):
        return self.to_location

    @property
    def transferred_by(self):
        return self.issued_by

    def to_dict(self):
        return {
            "id": self.id,
            "transferNo": self.transfer_no or self.id,
            "transfer_no": self.transfer_no,
            "transferType": self.transfer_type,
            "transfer_type": self.transfer_type,
            "fromLocation": self.from_location,
            "from_location": self.from_location,
            "fromFacility": self.from_location,
            "toLocation": self.to_location,
            "to_location": self.to_location,
            "toFacility": self.to_location,
            "medicineName": self.medicine_name,
            "medicine_name": self.medicine_name,
            "batchNo": self.batch_no,
            "batch_no": self.batch_no,
            "quantity": self.quantity or 0,
            "unit": self.unit or "Strip",
            "transferDateBs": self.transfer_date_bs,
            "transfer_date_bs": self.transfer_date_bs,
            "requestedBy": self.requested_by,
            "requested_by": self.requested_by,
            "issuedBy": self.issued_by,
            "issued_by": self.issued_by,
            "transferredBy": self.issued_by,
            "status": self.status or "completed",
            "remarks": self.remarks,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
