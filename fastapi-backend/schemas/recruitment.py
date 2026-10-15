from pydantic import BaseModel, Field
from typing import Optional, Any, List
from datetime import datetime

class VacancyAnnouncementSchema(BaseModel):
    id: Any
    vacancy_no: str = Field(alias="vacancyNo", default="")
    title: str
    service_group: str = Field(alias="serviceGroup", default="प्रशासन/प्राविधिक")
    level: str = Field(default="सहायक पाँचौं (Assistant 5th)")
    openings_count: int = Field(1, alias="openingsCount")
    employment_type: str = Field("करार सेवा (Contract)", alias="employmentType")
    application_fee: float = Field(500.0, alias="applicationFee")
    min_qualification: str = Field(alias="minQualification")
    publish_date_bs: str = Field(alias="publishDateBs")
    deadline_date_bs: str = Field(alias="deadlineDateBs")
    exam_date_bs: Optional[str] = Field(None, alias="examDateBs")
    status: Optional[str] = "खुला (Active)"
    description: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class VacancyAnnouncementCreate(BaseModel):
    vacancy_no: Optional[str] = Field(None, alias="vacancyNo")
    title: str
    service_group: Optional[str] = Field("प्रशासन/प्राविधिक", alias="serviceGroup")
    level: Optional[str] = "सहायक पाँचौं (Assistant 5th)"
    openings_count: Optional[int] = Field(1, alias="openingsCount")
    employment_type: Optional[str] = Field("करार सेवा (Contract)", alias="employmentType")
    application_fee: Optional[float] = Field(500.0, alias="applicationFee")
    min_qualification: str = Field(alias="minQualification")
    publish_date_bs: str = Field(alias="publishDateBs")
    deadline_date_bs: str = Field(alias="deadlineDateBs")
    exam_date_bs: Optional[str] = Field(None, alias="examDateBs")
    status: Optional[str] = "खुला (Active)"
    description: Optional[str] = None

    class Config:
        populate_by_name = True


class JobApplicationSchema(BaseModel):
    id: Any
    application_no: str = Field(alias="applicationNo", default="")
    vacancy_id: str = Field(alias="vacancyId")
    vacancy_no: str = Field(alias="vacancyNo")
    post_title: str = Field(alias="postTitle")
    full_name_np: str = Field(alias="fullNameNp")
    full_name_en: Optional[str] = Field(None, alias="fullNameEn")
    dob_bs: Optional[str] = Field(None, alias="dobBs")
    gender: Optional[str] = "पुरुष"
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    citizenship_district: Optional[str] = Field(None, alias="citizenshipDistrict")
    contact_phone: str = Field(alias="contactPhone")
    email: Optional[str] = None
    permanent_address: str = Field(alias="permanentAddress")
    temporary_address: Optional[str] = Field(None, alias="temporaryAddress")
    qualification_title: Optional[str] = Field(None, alias="qualificationTitle")
    board_university: Optional[str] = Field(None, alias="boardUniversity")
    passed_year_bs: Optional[str] = Field(None, alias="passedYearBs")
    division_gpa: Optional[str] = Field(None, alias="divisionGpa")
    council_reg_no: Optional[str] = Field(None, alias="councilRegNo")
    experience_years: Optional[int] = Field(0, alias="experienceYears")
    payment_method: Optional[str] = Field("eSewa / Khalti / ConnectIPS", alias="paymentMethod")
    payment_voucher_no: Optional[str] = Field(None, alias="paymentVoucherNo")
    status: Optional[str] = "विचाराधीन (Pending)"
    rejection_reason: Optional[str] = Field(None, alias="rejectionReason")
    admit_card_roll_no: Optional[str] = Field(None, alias="admitCardRollNo")
    exam_center: Optional[str] = Field(None, alias="examCenter")
    exam_date_time: Optional[str] = Field(None, alias="examDateTime")
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    signature_url: Optional[str] = Field(None, alias="signatureUrl")
    citizenship_doc_url: Optional[str] = Field(None, alias="citizenshipDocUrl")
    qualification_doc_url: Optional[str] = Field(None, alias="qualificationDocUrl")
    council_doc_url: Optional[str] = Field(None, alias="councilDocUrl")
    experience_doc_url: Optional[str] = Field(None, alias="experienceDocUrl")
    payment_voucher_doc_url: Optional[str] = Field(None, alias="paymentVoucherDocUrl")
    documents_json: Optional[str] = Field(None, alias="documentsJson")
    created_at: Optional[datetime] = Field(None, alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class JobApplicationCreate(BaseModel):
    vacancy_id: str = Field(alias="vacancyId")
    vacancy_no: Optional[str] = Field(None, alias="vacancyNo")
    post_title: Optional[str] = Field(None, alias="postTitle")
    full_name_np: str = Field(alias="fullNameNp")
    full_name_en: Optional[str] = Field(None, alias="fullNameEn")
    dob_bs: Optional[str] = Field(None, alias="dobBs")
    gender: Optional[str] = "पुरुष"
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    citizenship_district: Optional[str] = Field(None, alias="citizenshipDistrict")
    contact_phone: str = Field(alias="contactPhone")
    email: Optional[str] = None
    permanent_address: str = Field(alias="permanentAddress")
    temporary_address: Optional[str] = Field(None, alias="temporaryAddress")
    qualification_title: Optional[str] = Field(None, alias="qualificationTitle")
    board_university: Optional[str] = Field(None, alias="boardUniversity")
    passed_year_bs: Optional[str] = Field(None, alias="passedYearBs")
    division_gpa: Optional[str] = Field(None, alias="divisionGpa")
    council_reg_no: Optional[str] = Field(None, alias="councilRegNo")
    experience_years: Optional[int] = Field(0, alias="experienceYears")
    payment_method: Optional[str] = Field("eSewa / Khalti / ConnectIPS", alias="paymentMethod")
    payment_voucher_no: Optional[str] = Field(None, alias="paymentVoucherNo")
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    signature_url: Optional[str] = Field(None, alias="signatureUrl")
    citizenship_doc_url: Optional[str] = Field(None, alias="citizenshipDocUrl")
    qualification_doc_url: Optional[str] = Field(None, alias="qualificationDocUrl")
    council_doc_url: Optional[str] = Field(None, alias="councilDocUrl")
    experience_doc_url: Optional[str] = Field(None, alias="experienceDocUrl")
    payment_voucher_doc_url: Optional[str] = Field(None, alias="paymentVoucherDocUrl")
    documents_json: Optional[str] = Field(None, alias="documentsJson")

    class Config:
        populate_by_name = True


class ApplicationVerificationUpdate(BaseModel):
    status: str # स्वीकृत (Approved), अस्वीकृत (Rejected), विचाराधीन (Pending)
    rejection_reason: Optional[str] = Field(None, alias="rejectionReason")
    admit_card_roll_no: Optional[str] = Field(None, alias="admitCardRollNo")
    exam_center: Optional[str] = Field(None, alias="examCenter")
    exam_date_time: Optional[str] = Field(None, alias="examDateTime")

    class Config:
        populate_by_name = True


class VacancyAnnouncementUpdate(BaseModel):
    vacancy_no: Optional[str] = Field(None, alias="vacancyNo")
    title: Optional[str] = None
    service_group: Optional[str] = Field(None, alias="serviceGroup")
    level: Optional[str] = None
    openings_count: Optional[int] = Field(None, alias="openingsCount")
    employment_type: Optional[str] = Field(None, alias="employmentType")
    application_fee: Optional[float] = Field(None, alias="applicationFee")
    min_qualification: Optional[str] = Field(None, alias="minQualification")
    publish_date_bs: Optional[str] = Field(None, alias="publishDateBs")
    deadline_date_bs: Optional[str] = Field(None, alias="deadlineDateBs")
    exam_date_bs: Optional[str] = Field(None, alias="examDateBs")
    status: Optional[str] = None
    description: Optional[str] = None

    class Config:
        populate_by_name = True


class JobApplicationUpdate(BaseModel):
    full_name_np: Optional[str] = Field(None, alias="fullNameNp")
    full_name_en: Optional[str] = Field(None, alias="fullNameEn")
    dob_bs: Optional[str] = Field(None, alias="dobBs")
    gender: Optional[str] = None
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    citizenship_district: Optional[str] = Field(None, alias="citizenshipDistrict")
    contact_phone: Optional[str] = Field(None, alias="contactPhone")
    email: Optional[str] = None
    permanent_address: Optional[str] = Field(None, alias="permanentAddress")
    temporary_address: Optional[str] = Field(None, alias="temporaryAddress")
    qualification_title: Optional[str] = Field(None, alias="qualificationTitle")
    board_university: Optional[str] = Field(None, alias="boardUniversity")
    passed_year_bs: Optional[str] = Field(None, alias="passedYearBs")
    division_gpa: Optional[str] = Field(None, alias="divisionGpa")
    council_reg_no: Optional[str] = Field(None, alias="councilRegNo")
    experience_years: Optional[int] = Field(None, alias="experienceYears")
    payment_method: Optional[str] = Field(None, alias="paymentMethod")
    payment_voucher_no: Optional[str] = Field(None, alias="paymentVoucherNo")
    status: Optional[str] = None
    rejection_reason: Optional[str] = Field(None, alias="rejectionReason")
    admit_card_roll_no: Optional[str] = Field(None, alias="admitCardRollNo")
    exam_center: Optional[str] = Field(None, alias="examCenter")
    exam_date_time: Optional[str] = Field(None, alias="examDateTime")
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    signature_url: Optional[str] = Field(None, alias="signatureUrl")
    citizenship_doc_url: Optional[str] = Field(None, alias="citizenshipDocUrl")
    qualification_doc_url: Optional[str] = Field(None, alias="qualificationDocUrl")
    council_doc_url: Optional[str] = Field(None, alias="councilDocUrl")
    experience_doc_url: Optional[str] = Field(None, alias="experienceDocUrl")
    payment_voucher_doc_url: Optional[str] = Field(None, alias="paymentVoucherDocUrl")

    class Config:
        populate_by_name = True

