from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HealthFacilitySchema(BaseModel):
    name: str
    ward_number: int
    type: str = 'health_post'
    total_beds: int = 0
    has_ambulance: bool = True
    address: str = 'पाँचपोखरी थाङपाल गा.पा.'
    phone: Optional[str] = None
    
    class Config:
        from_attributes = True

class PatientSchema(BaseModel):
    patient_no: str
    first_name: str
    last_name: str
    full_name: str
    age: int
    gender: str = 'female'
    phone: Optional[str] = None
    ward_number: int = 1
    has_health_insurance: bool = False
    health_facility_name: str = 'पाँचपोखरी आधारभूत अस्पताल'
    department: str = 'सामान्य चिकित्सा (General OPD)'
    
    class Config:
        from_attributes = True

class TriageUpdateSchema(BaseModel):
    blood_pressure: Optional[str] = None
    pulse_rate: Optional[str] = None
    temperature_f: Optional[str] = None
    spo2_percent: Optional[str] = None
    weight_kg: Optional[str] = None
    chief_complaint: Optional[str] = None
