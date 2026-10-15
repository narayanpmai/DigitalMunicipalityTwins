from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class BadapatraServiceItem(BaseModel):
    id: Any
    type: Optional[str] = 'palika'
    sourceType: Optional[str] = 'palika'
    isWardLevel: Optional[bool] = False
    category: Optional[str] = None
    serviceCategory: Optional[str] = None
    title: Optional[str] = None
    serviceName: Optional[str] = None
    serviceNameEn: Optional[str] = None
    departmentId: Optional[Any] = None
    departmentName: Optional[str] = None
    provider: Optional[str] = None
    wardId: Optional[Any] = None
    wardNo: Optional[Any] = None
    serviceTime: Optional[str] = None
    processingTime: Optional[str] = None
    price: Optional[str] = None
    fee: Optional[str] = None
    official: Optional[str] = None
    responsibleOfficial: Optional[str] = None
    room: Optional[str] = None
    roomNo: Optional[str] = None
    document: Optional[str] = None
    requiredDocuments: Optional[List[str]] = None
    remarks: Optional[str] = None
    procedure: Optional[str] = None
    processSteps: Optional[List[str]] = None
    contactNo: Optional[str] = None
    icon: Optional[str] = None
    isActive: bool = True

class BadapatraDepartment(BaseModel):
    id: Any
    name: str
    nameEn: Optional[str] = None
    roomNo: Optional[str] = None
    headName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None

class BadapatraOfficial(BaseModel):
    id: Any

    name: str
    designation: str
    departmentName: Optional[str] = None
    wardNo: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    photo: Optional[str] = None
    roomNo: Optional[str] = None

class BadapatraSummaryStats(BaseModel):
    totalServices: int
    wardServicesCount: int
    palikaServicesCount: int
    departmentsCount: int
    officialsCount: int

class BadapatraSummaryResponse(BaseModel):
    success: bool = True
    municipality: str
    sourceUrl: Optional[str] = None
    lastSync: Optional[str] = None
    stats: BadapatraSummaryStats

class BadapatraServicesListResponse(BaseModel):
    success: bool = True
    count: int
    data: List[BadapatraServiceItem]
    result: List[BadapatraServiceItem]

class BadapatraDepartmentsResponse(BaseModel):
    success: bool = True
    count: int
    data: List[BadapatraDepartment]
    result: List[BadapatraDepartment]

class BadapatraOfficialsResponse(BaseModel):
    success: bool = True
    count: int
    data: List[BadapatraOfficial]
    result: List[BadapatraOfficial]
