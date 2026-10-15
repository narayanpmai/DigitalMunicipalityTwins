from pydantic import BaseModel, Field, field_serializer
from typing import Optional, Union, Any, List
from datetime import datetime
from uuid import UUID

class EmployeeBase(BaseModel):
    employee_id: Optional[str] = Field(None, alias="employeeId")
    full_name: str = Field(..., alias="fullName")
    department: str
    designation: str
    employment_type: str = Field('स्थायी (Permanent)', alias="employmentType")
    contact_phone: Optional[str] = Field(None, alias="contactPhone")
    email: Optional[str] = None
    user_id: Optional[str] = Field(None, alias="userId")
    is_department_head: bool = Field(False, alias="isDepartmentHead")
    is_information_officer: bool = Field(False, alias="isInformationOfficer")
    is_grievance_officer: bool = Field(False, alias="isGrievanceOfficer")
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    national_id_no: Optional[str] = Field(None, alias="nationalIdNo")
    dob_bs: Optional[str] = Field(None, alias="dobBs")
    gender: Optional[str] = 'पुरुष'
    blood_group: Optional[str] = Field('A+', alias="bloodGroup")
    permanent_address: Optional[str] = Field(None, alias="permanentAddress")
    temporary_address: Optional[str] = Field(None, alias="temporaryAddress")
    emergency_contact: Optional[str] = Field(None, alias="emergencyContact")
    level_grade: Optional[str] = Field(None, alias="levelGrade")
    service_group: Optional[str] = Field(None, alias="serviceGroup")
    branch_code: Optional[str] = Field(None, alias="branchCode")
    employee_tor: Optional[str] = Field(None, alias="employeeTor")
    branch_tor: Optional[str] = Field(None, alias="branchTor")
    appointment_date_bs: Optional[str] = Field(None, alias="appointmentDateBs")
    appointment_letter_url: Optional[str] = Field(None, alias="appointmentLetterUrl")
    appointment_letter_name: Optional[str] = Field(None, alias="appointmentLetterName")
    service_status: str = Field('कार्यरत (Active)', alias="serviceStatus")
    transfer_target_type: Optional[str] = Field(None, alias="transferTargetType")
    transfer_target_province: Optional[str] = Field(None, alias="transferTargetProvince")
    transfer_target_district: Optional[str] = Field(None, alias="transferTargetDistrict")
    transfer_target_palika: Optional[str] = Field(None, alias="transferTargetPalika")
    transfer_date_bs: Optional[str] = Field(None, alias="transferDateBs")
    transfer_decision_no: Optional[str] = Field(None, alias="transferDecisionNo")
    ramana_date_bs: Optional[str] = Field(None, alias="ramanaDateBs")
    ramana_letter_url: Optional[str] = Field(None, alias="ramanaLetterUrl")
    ramana_letter_name: Optional[str] = Field(None, alias="ramanaLetterName")
    documents: Optional[List[Any]] = Field(default_factory=list)
    join_date_bs: Optional[str] = Field(None, alias="joinDateBs")
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    status: str = 'Active'

    class Config:
        populate_by_name = True
        from_attributes = True

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    employee_id: Optional[str] = Field(None, alias="employeeId")
    full_name: Optional[str] = Field(None, alias="fullName")
    department: Optional[str] = None
    designation: Optional[str] = None
    employment_type: Optional[str] = Field(None, alias="employmentType")
    contact_phone: Optional[str] = Field(None, alias="contactPhone")
    email: Optional[str] = None
    user_id: Optional[str] = Field(None, alias="userId")
    is_department_head: Optional[bool] = Field(None, alias="isDepartmentHead")
    is_information_officer: Optional[bool] = Field(None, alias="isInformationOfficer")
    is_grievance_officer: Optional[bool] = Field(None, alias="isGrievanceOfficer")
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    national_id_no: Optional[str] = Field(None, alias="nationalIdNo")
    dob_bs: Optional[str] = Field(None, alias="dobBs")
    gender: Optional[str] = None
    blood_group: Optional[str] = Field(None, alias="bloodGroup")
    permanent_address: Optional[str] = Field(None, alias="permanentAddress")
    temporary_address: Optional[str] = Field(None, alias="temporaryAddress")
    emergency_contact: Optional[str] = Field(None, alias="emergencyContact")
    level_grade: Optional[str] = Field(None, alias="levelGrade")
    service_group: Optional[str] = Field(None, alias="serviceGroup")
    branch_code: Optional[str] = Field(None, alias="branchCode")
    employee_tor: Optional[str] = Field(None, alias="employeeTor")
    branch_tor: Optional[str] = Field(None, alias="branchTor")
    appointment_date_bs: Optional[str] = Field(None, alias="appointmentDateBs")
    appointment_letter_url: Optional[str] = Field(None, alias="appointmentLetterUrl")
    appointment_letter_name: Optional[str] = Field(None, alias="appointmentLetterName")
    service_status: Optional[str] = Field(None, alias="serviceStatus")
    transfer_target_type: Optional[str] = Field(None, alias="transferTargetType")
    transfer_target_province: Optional[str] = Field(None, alias="transferTargetProvince")
    transfer_target_district: Optional[str] = Field(None, alias="transferTargetDistrict")
    transfer_target_palika: Optional[str] = Field(None, alias="transferTargetPalika")
    transfer_date_bs: Optional[str] = Field(None, alias="transferDateBs")
    transfer_decision_no: Optional[str] = Field(None, alias="transferDecisionNo")
    ramana_date_bs: Optional[str] = Field(None, alias="ramanaDateBs")
    ramana_letter_url: Optional[str] = Field(None, alias="ramanaLetterUrl")
    ramana_letter_name: Optional[str] = Field(None, alias="ramanaLetterName")
    documents: Optional[List[Any]] = None
    join_date_bs: Optional[str] = Field(None, alias="joinDateBs")
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    status: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class EmployeeSchema(EmployeeBase):
    id: Union[str, UUID]
    tenant_id: Optional[str] = None
    employeeId: Optional[str] = None
    fullName: Optional[str] = None
    employmentType: Optional[str] = None
    contactPhone: Optional[str] = None
    isDepartmentHead: Optional[bool] = None
    isInformationOfficer: Optional[bool] = None
    isGrievanceOfficer: Optional[bool] = None
    citizenshipNo: Optional[str] = None
    nationalIdNo: Optional[str] = None
    dobBs: Optional[str] = None
    bloodGroup: Optional[str] = None
    permanentAddress: Optional[str] = None
    temporaryAddress: Optional[str] = None
    emergencyContact: Optional[str] = None
    levelGrade: Optional[str] = None
    serviceGroup: Optional[str] = None
    branchCode: Optional[str] = None
    employeeTor: Optional[str] = None
    branchTor: Optional[str] = None
    appointmentDateBs: Optional[str] = None
    appointmentLetterUrl: Optional[str] = None
    appointmentLetterName: Optional[str] = None
    serviceStatus: Optional[str] = None
    transferTargetType: Optional[str] = None
    transferTargetProvince: Optional[str] = None
    transferTargetDistrict: Optional[str] = None
    transferTargetPalika: Optional[str] = None
    transferDateBs: Optional[str] = None
    transferDecisionNo: Optional[str] = None
    ramanaDateBs: Optional[str] = None
    ramanaLetterUrl: Optional[str] = None
    ramanaLetterName: Optional[str] = None
    joinDateBs: Optional[str] = None
    photoUrl: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('id')
    def serialize_id(self, v: Union[str, UUID]) -> str:
        return str(v)

    class Config:
        populate_by_name = True
        from_attributes = True
