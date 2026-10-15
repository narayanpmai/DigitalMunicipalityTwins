from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class FarmerSchema(BaseModel):
    farmer_id: str
    full_name: str
    gender: str = 'पुरुष'
    ward_number: int
    farmer_category: str = 'साना किसान (२-१० रोपनी)'
    land_area_ropani: float = 3.5
    major_crops: Optional[str] = None
    livestock_details: Optional[str] = None
    status: str = 'प्रमाणित (Verified)'
    
    class Config:
        from_attributes = True

class FarmerCreate(BaseModel):
    full_name: str
    ward_number: int
    gender: str = 'पुरुष'
    contact_phone: Optional[str] = None
    farmer_category: str = 'साना किसान (२-१० रोपनी)'
    land_area_ropani: float = 3.5

class AgricultureProfileSchema(BaseModel):
    household_id: str
    land_area_hectares: float = 0.0
    farmer_category: str = 'small'
    main_crops: Optional[List[str]] = None
    livestock_details: Optional[Dict[str, int]] = {}
    
    class Config:
        from_attributes = True


class VetMedicineCreate(BaseModel):
    medicineName: str
    batchNumber: Optional[str] = None
    manufactureDate: Optional[str] = None
    expiryDate: Optional[str] = None
    stockQuantity: int = 0
    unit: str = "भाइल (Vials)"


class VetStockAdjust(BaseModel):
    amount: int
    type: str = "add"  # "add" or "reduce"


class VetDistributionCreate(BaseModel):
    medicineId: str
    farmerId: str
    animalType: Optional[str] = "गाई (Cow)"
    quantityGiven: int = 1
    distributedDate: Optional[str] = None
    remarks: Optional[str] = None


class VetAiRecordCreate(BaseModel):
    id: Optional[str] = None
    farmerName: str
    contactPhone: Optional[str] = None
    wardNumber: int = 1
    animalType: str = "गाई (Cow)"
    breed: str
    strawNumber: str
    aiDateBs: str
    expectedCalvingDateBs: Optional[str] = None
    technicianName: str
    status: Optional[str] = "निरीक्षण बाँकी (Pending)"
    remarks: Optional[str] = None


class VetVaccinationRecordCreate(BaseModel):
    id: Optional[str] = None
    vaccineName: str
    earTagNumber: str
    animalType: str = "बाख्रा (Goat)"
    farmerName: str
    wardNumber: int = 1
    vaccinatedDateBs: str
    boosterDueDateBs: Optional[str] = None
    batchNumber: Optional[str] = None
    technicianName: str
    status: Optional[str] = "सम्पन्न (Completed)"


class VetDiagnosisRecordCreate(BaseModel):
    id: Optional[str] = None
    farmerName: str
    wardNumber: int = 1
    animalType: str = "गाई (Cow)"
    symptoms: str
    suspectedDisease: str
    prescribedMedicine: str
    dosageInstructions: str
    doctorTechnician: str
    dateBs: str
    followUpDateBs: Optional[str] = None
    status: Optional[str] = "उपचार जारी (Under Treatment)"

