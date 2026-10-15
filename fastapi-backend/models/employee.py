from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Text
from core.database import Base
from datetime import datetime

class Employee(Base):
    __tablename__ = 'employees'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    employee_id = Column(String, unique=True, name='employeeId')
    full_name = Column(String, name='fullName')
    department = Column(String)
    designation = Column(String)
    employment_type = Column(String, default='स्थायी (Permanent)', name='employmentType')
    contact_phone = Column(String, nullable=True, name='contactPhone')
    email = Column(String, nullable=True)
    user_id = Column(String, nullable=True, name='userId')
    is_department_head = Column(Boolean, default=False, name='isDepartmentHead')
    is_information_officer = Column(Boolean, default=False, name='isInformationOfficer')
    is_grievance_officer = Column(Boolean, default=False, name='isGrievanceOfficer')
    citizenship_no = Column(String, nullable=True, name='citizenshipNo')
    national_id_no = Column(String, nullable=True, name='nationalIdNo')
    dob_bs = Column(String, nullable=True, name='dobBs')
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True, name='bloodGroup')
    permanent_address = Column(String, nullable=True, name='permanentAddress')
    temporary_address = Column(String, nullable=True, name='temporaryAddress')
    emergency_contact = Column(String, nullable=True, name='emergencyContact')
    level_grade = Column(String, nullable=True, name='levelGrade')
    service_group = Column(String, nullable=True, name='serviceGroup')
    branch_code = Column(String, nullable=True, name='branchCode')
    employee_tor = Column(Text, nullable=True, name='employeeTor')
    branch_tor = Column(Text, nullable=True, name='branchTor')
    appointment_date_bs = Column(String, nullable=True, name='appointmentDateBs')
    appointment_letter_url = Column(String, nullable=True, name='appointmentLetterUrl')
    appointment_letter_name = Column(String, nullable=True, name='appointmentLetterName')
    service_status = Column(String, default='कार्यरत (Active)', name='serviceStatus')
    transfer_target_type = Column(String, nullable=True, name='transferTargetType')
    transfer_target_province = Column(String, nullable=True, name='transferTargetProvince')
    transfer_target_district = Column(String, nullable=True, name='transferTargetDistrict')
    transfer_target_palika = Column(String, nullable=True, name='transferTargetPalika')
    transfer_date_bs = Column(String, nullable=True, name='transferDateBs')
    transfer_decision_no = Column(String, nullable=True, name='transferDecisionNo')
    ramana_date_bs = Column(String, nullable=True, name='ramanaDateBs')
    ramana_letter_url = Column(String, nullable=True, name='ramanaLetterUrl')
    ramana_letter_name = Column(String, nullable=True, name='ramanaLetterName')
    documents = Column(JSON, default=list, nullable=True)
    join_date_bs = Column(String, nullable=True, name='joinDateBs')
    photo_url = Column(String, nullable=True, name='photoUrl')
    status = Column(String, default='Active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    # CamelCase property getters for frontend compatibility
    @property
    def employeeId(self): return self.employee_id
    @property
    def fullName(self): return self.full_name
    @property
    def employmentType(self): return self.employment_type
    @property
    def contactPhone(self): return self.contact_phone
    @property
    def isDepartmentHead(self): return self.is_department_head
    @property
    def isInformationOfficer(self): return self.is_information_officer
    @property
    def isGrievanceOfficer(self): return self.is_grievance_officer
    @property
    def citizenshipNo(self): return self.citizenship_no
    @property
    def nationalIdNo(self): return self.national_id_no
    @property
    def dobBs(self): return self.dob_bs
    @property
    def bloodGroup(self): return self.blood_group
    @property
    def permanentAddress(self): return self.permanent_address
    @property
    def temporaryAddress(self): return self.temporary_address
    @property
    def emergencyContact(self): return self.emergency_contact
    @property
    def levelGrade(self): return self.level_grade
    @property
    def serviceGroup(self): return self.service_group
    @property
    def branchCode(self): return self.branch_code
    @property
    def employeeTor(self): return self.employee_tor
    @property
    def branchTor(self): return self.branch_tor
    @property
    def appointmentDateBs(self): return self.appointment_date_bs
    @property
    def appointmentLetterUrl(self): return self.appointment_letter_url
    @property
    def appointmentLetterName(self): return self.appointment_letter_name
    @property
    def serviceStatus(self): return self.service_status
    @property
    def transferTargetType(self): return self.transfer_target_type
    @property
    def transferTargetProvince(self): return self.transfer_target_province
    @property
    def transferTargetDistrict(self): return self.transfer_target_district
    @property
    def transferTargetPalika(self): return self.transfer_target_palika
    @property
    def transferDateBs(self): return self.transfer_date_bs
    @property
    def transferDecisionNo(self): return self.transfer_decision_no
    @property
    def ramanaDateBs(self): return self.ramana_date_bs
    @property
    def ramanaLetterUrl(self): return self.ramana_letter_url
    @property
    def ramanaLetterName(self): return self.ramana_letter_name
    @property
    def joinDateBs(self): return self.join_date_bs
    @property
    def photoUrl(self): return self.photo_url
