"""
Education Module Database Models
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Aligned with actual PostgreSQL schema
"""
from sqlalchemy import Column, String, Integer, Boolean, Float, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid


class School(Base):
    __tablename__ = 'schools'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    name_en = Column(String, nullable=True, name='nameEn')
    ward_number = Column(Integer, default=1, name='wardNumber')
    type = Column(String, default='public')
    level = Column(String, default='basic')
    total_students = Column(Integer, default=0, name='totalStudents')
    total_teachers = Column(Integer, default=0, name='totalTeachers')
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    gis_data = Column(JSON, nullable=True, name='gisData')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')
    emis_code = Column(String, nullable=True, name='emisCode')
    principal_name = Column(String, nullable=True, name='principalName')
    contact_phone = Column(String, nullable=True, name='contactPhone')
    email = Column(String, nullable=True)
    facilities = Column(JSON, nullable=True)
    tole = Column(String, nullable=True)
    level_details = Column(String, nullable=True, name='levelDetails')
    portal_url = Column(String, nullable=True, name='portalUrl')
    male_students = Column(Integer, default=0, name='maleStudents')
    female_students = Column(Integer, default=0, name='femaleStudents')
    has_ict_lab = Column(Boolean, default=False, name='hasIctLab')
    has_library = Column(Boolean, default=False, name='hasLibrary')
    has_science_lab = Column(Boolean, default=False, name='hasScienceLab')
    has_drinking_water = Column(Boolean, default=True, name='hasDrinkingWater')
    has_electricity = Column(Boolean, default=True, name='hasElectricity')

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "nameNepali": self.name,
            "nameEn": self.name_en or "",
            "nameEnglish": self.name_en or "",
            "wardNumber": self.ward_number or 0,
            "type": self.type or "public",
            "level": self.level or "basic",
            "levelDetails": self.level_details or ("माध्यमिक (१-१०)" if self.level == "secondary" else "आधारभूत (१-८)"),
            "totalStudents": self.total_students or 0,
            "totalTeachers": self.total_teachers or 0,
            "maleStudents": self.male_students or 0,
            "femaleStudents": self.female_students or 0,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "emisCode": self.emis_code or "",
            "code": self.emis_code or "",
            "principalName": self.principal_name or "",
            "contactPhone": self.contact_phone or "",
            "contactNumber": self.contact_phone or "",
            "email": self.email or "",
            "tole": self.tole or "",
            "location": self.tole or (f"वडा नं. {self.ward_number}" if self.ward_number else ""),
            "portalUrl": self.portal_url or "",
            "hasIctLab": bool(self.has_ict_lab),
            "hasLibrary": bool(self.has_library),
            "hasScienceLab": bool(self.has_science_lab),
            "hasDrinkingWater": bool(self.has_drinking_water),
            "hasElectricity": bool(self.has_electricity),
            "facilities": self.facilities,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class Student(Base):
    __tablename__ = 'students'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False, name='fullName')
    admission_no = Column(String, nullable=True, name='admissionNo')
    school_id = Column(String, nullable=True, name='schoolId')
    class_grade = Column(String, default='कक्षा १', name='classGrade')
    roll_number = Column(Integer, default=1, name='rollNumber')
    gender = Column(String, default='छात्र')
    dob = Column(String, nullable=True)
    parent_name = Column(String, nullable=True, name='parentName')
    contact_phone = Column(String, nullable=True, name='contactPhone')
    caste_category = Column(String, default='जनजाति', name='casteCategory')
    scholarship_type = Column(String, default='छैन', name='scholarshipType')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self, school_name: str = None):
        return {
            "id": str(self.id),
            "fullName": self.full_name,
            "admissionNo": self.admission_no or "",
            "schoolId": self.school_id or "",
            "schoolName": school_name or "",
            "classGrade": self.class_grade or "कक्षा १",
            "rollNumber": self.roll_number or 1,
            "gender": self.gender or "छात्र",
            "dob": self.dob or "",
            "parentName": self.parent_name or "",
            "contactPhone": self.contact_phone or "",
            "casteCategory": self.caste_category or "जनजाति",
            "scholarshipType": self.scholarship_type or "छैन",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class Teacher(Base):
    __tablename__ = 'teachers'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False, name='fullName')
    school_id = Column(String, nullable=True, name='schoolId')
    designation = Column(String, default='शिक्षक')
    service_type = Column(String, default='स्थायी', name='serviceType')
    main_subject = Column(String, nullable=True, name='mainSubject')
    qualification = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True, name='contactPhone')
    email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
    deleted_at = Column(DateTime, nullable=True, name='deletedAt')

    def to_dict(self, school_name: str = None):
        return {
            "id": str(self.id),
            "fullName": self.full_name,
            "schoolId": self.school_id or "",
            "schoolName": school_name or "",
            "designation": self.designation or "शिक्षक",
            "serviceType": self.service_type or "स्थायी",
            "mainSubject": self.main_subject or "",
            "subject": self.main_subject or "",
            "qualification": self.qualification or "",
            "contactPhone": self.contact_phone or "",
            "contactNumber": self.contact_phone or "",
            "email": self.email or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class EducationAttendance(Base):
    __tablename__ = 'education_attendance'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(String, nullable=True)
    user_name = Column(String, nullable=True, name='userName')
    user_type = Column(String, default='teacher', name='userType')
    school_id = Column(String, nullable=True, name='schoolId')
    school_name = Column(String, nullable=True, name='schoolName')
    in_time = Column(String, nullable=True, name='inTime')
    out_time = Column(String, nullable=True, name='outTime')
    status = Column(String, default='Present')
    device_id = Column(String, nullable=True, name='deviceId')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "date": self.date,
            "userName": self.user_name,
            "userType": self.user_type,
            "schoolId": self.school_id,
            "schoolName": self.school_name,
            "inTime": self.in_time,
            "outTime": self.out_time,
            "status": self.status,
            "deviceId": self.device_id,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class EducationNutrition(Base):
    __tablename__ = 'education_nutrition'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_name = Column(String, nullable=False, name='schoolName')
    ward_number = Column(Integer, default=1, name='wardNumber')
    beneficiary_count = Column(Integer, default=0, name='beneficiaryCount')
    monthly_disbursed = Column(Float, default=0.0, name='monthlyDisbursed')
    status = Column(String, default='Active')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "schoolName": self.school_name,
            "wardNumber": self.ward_number or 0,
            "beneficiaryCount": self.beneficiary_count or 0,
            "monthlyDisbursed": self.monthly_disbursed or 0.0,
            "allocatedBudget": (self.monthly_disbursed or 0.0) * 1.1,
            "spentBudget": self.monthly_disbursed or 0.0,
            "mealMenu": "स्थानीय जाउलो/खिचडी, अण्डा र गेडागुडी",
            "fiscalYear": "२०८१/०८२",
            "month": "भाद्र",
            "status": self.status or "Active",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Assessment(Base):
    __tablename__ = 'assessments'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(String, nullable=True, name='studentId')
    student_name = Column(String, nullable=False, name='studentName')
    school_name = Column(String, nullable=True, name='schoolName')
    class_grade = Column(String, nullable=True, name='classGrade')
    exam_type = Column(String, default='वार्षिक', name='examType')
    total_marks = Column(Float, default=0.0, name='totalMarks')
    gpa = Column(Float, default=0.0)
    grade = Column(String, default='A')
    subjects_data = Column(JSON, nullable=True, name='subjectsData')
    status = Column(String, default='सफल (PROMOTED)')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "studentId": self.student_id or "",
            "studentName": self.student_name,
            "schoolName": self.school_name or "",
            "classGrade": self.class_grade or "",
            "examType": self.exam_type or "वार्षिक",
            "totalMarks": self.total_marks or 0.0,
            "gpa": round(self.gpa or 0.0, 2),
            "grade": self.grade or "A",
            "subjectsData": self.subjects_data or [],
            "status": self.status or "सफल (PROMOTED)",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
