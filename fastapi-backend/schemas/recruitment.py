from pydantic import BaseModel, Field
from typing import Optional, Any, List, Dict
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
    inclusive_group_fee: Optional[float] = Field(200.0, alias="inclusiveGroupFee")
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
    inclusive_group_fee: Optional[float] = Field(200.0, alias="inclusiveGroupFee")
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
    inclusive_categories: Optional[str] = Field(None, alias="inclusiveCategories")
    
    # Payment lifecycle
    payment_method: Optional[str] = Field("Fonepay QR / ConnectIPS / eSewa", alias="paymentMethod")
    payment_voucher_no: Optional[str] = Field(None, alias="paymentVoucherNo")
    payment_status: Optional[str] = Field("UNPAID", alias="paymentStatus")
    receipt_no: Optional[str] = Field(None, alias="receiptNo")
    paid_amount: Optional[float] = Field(0.0, alias="paidAmount")
    paid_at: Optional[datetime] = Field(None, alias="paidAt")
    
    # Review & Status
    status: Optional[str] = "विचाराधीन (Pending)"
    application_status: Optional[str] = Field("SUBMITTED", alias="applicationStatus")
    rejection_reason: Optional[str] = Field(None, alias="rejectionReason")
    admit_card_roll_no: Optional[str] = Field(None, alias="admitCardRollNo")
    exam_center: Optional[str] = Field(None, alias="examCenter")
    exam_date_time: Optional[str] = Field(None, alias="examDateTime")
    
    # Uploads
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    signature_url: Optional[str] = Field(None, alias="signatureUrl")
    citizenship_doc_url: Optional[str] = Field(None, alias="citizenshipDocUrl")
    qualification_doc_url: Optional[str] = Field(None, alias="qualificationDocUrl")
    council_doc_url: Optional[str] = Field(None, alias="councilDocUrl")
    experience_doc_url: Optional[str] = Field(None, alias="experienceDocUrl")
    payment_voucher_doc_url: Optional[str] = Field(None, alias="paymentVoucherDocUrl")
    documents_json: Optional[str] = Field(None, alias="documentsJson")
    onboarded_employee_id: Optional[str] = Field(None, alias="onboardedEmployeeId")
    onboarded_at: Optional[datetime] = Field(None, alias="onboardedAt")
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
    inclusive_categories: Optional[str] = Field(None, alias="inclusiveCategories")
    payment_method: Optional[str] = Field("Fonepay QR / ConnectIPS / eSewa", alias="paymentMethod")
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
    inclusive_group_fee: Optional[float] = Field(None, alias="inclusiveGroupFee")
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
    inclusive_categories: Optional[str] = Field(None, alias="inclusiveCategories")
    payment_method: Optional[str] = Field(None, alias="paymentMethod")
    payment_voucher_no: Optional[str] = Field(None, alias="paymentVoucherNo")
    payment_status: Optional[str] = Field(None, alias="paymentStatus")
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


# ==============================================================
# PAYMENT & GATEWAY SCHEMAS
# ==============================================================

class PaymentInitiateRequest(BaseModel):
    application_id: Optional[str] = Field(None, alias="applicationId")
    application_no: Optional[str] = Field(None, alias="applicationNo")
    gateway: str = Field("FONEPAY", description="FONEPAY, CONNECTIPS, ESEWA, KHALTI, BANK_VOUCHER")
    voucher_no: Optional[str] = Field(None, alias="voucherNo")

    class Config:
        populate_by_name = True


class PaymentInitiateResponse(BaseModel):
    success: bool
    transaction_uuid: str = Field(alias="transactionUuid")
    application_no: str = Field(alias="applicationNo")
    gateway: str
    amount: float
    qr_data: Optional[str] = Field(None, alias="qrData")
    checkout_url: Optional[str] = Field(None, alias="checkoutUrl")
    parameters: Optional[Dict[str, Any]] = None
    message: str

    class Config:
        populate_by_name = True


class PaymentVerifyRequest(BaseModel):
    transaction_uuid: str = Field(alias="transactionUuid")
    gateway: str
    gateway_ref_id: Optional[str] = Field(None, alias="gatewayRefId")
    mock_auto_approve: Optional[bool] = Field(False, alias="mockAutoApprove")

    class Config:
        populate_by_name = True


class PaymentVerifyResponse(BaseModel):
    success: bool
    message: str
    transaction_uuid: str = Field(alias="transactionUuid")
    receipt_no: Optional[str] = Field(None, alias="receiptNo")
    application_no: str = Field(alias="applicationNo")
    paid_amount: float = Field(alias="paidAmount")
    payment_status: str = Field(alias="paymentStatus")
    paid_at: Optional[str] = Field(None, alias="paidAt")

    class Config:
        populate_by_name = True


class OfficialReceiptSchema(BaseModel):
    receipt_no: str = Field(alias="receiptNo")
    application_no: str = Field(alias="applicationNo")
    transaction_uuid: str = Field(alias="transactionUuid")
    full_name_np: str = Field(alias="fullNameNp")
    full_name_en: Optional[str] = Field(None, alias="fullNameEn")
    post_title: str = Field(alias="postTitle")
    vacancy_no: str = Field(alias="vacancyNo")
    citizenship_no: Optional[str] = Field(None, alias="citizenshipNo")
    contact_phone: str = Field(alias="contactPhone")
    amount: float
    fee_breakdown: Dict[str, Any] = Field(alias="feeBreakdown")
    revenue_title: str = Field("कर्मचारी पदपूर्ति तथा दरखास्त दस्तुर (शीर्षक १४२२९)", alias="revenueTitle")
    gateway: str
    payment_status: str = Field(alias="paymentStatus")
    paid_at: str = Field(alias="paidAt")
    verification_qr: str = Field(alias="verificationQr")

    class Config:
        populate_by_name = True


class AuditLogSchema(BaseModel):
    id: str
    entity_type: str = Field(alias="entityType")
    entity_id: str = Field(alias="entityId")
    action: str
    performed_by: str = Field(alias="performedBy")
    ip_address: Optional[str] = Field(None, alias="ipAddress")
    details: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class RefundCreateRequest(BaseModel):
    payment_id: Optional[str] = Field(None, alias="paymentId")
    application_no: str = Field(alias="applicationNo")
    refund_amount: float = Field(alias="refundAmount")
    reason: str
    bank_info: Optional[str] = Field(None, alias="bankInfo")

    class Config:
        populate_by_name = True


class OnboardToHrmsRequest(BaseModel):
    employee_id: Optional[str] = Field(None, alias="employeeId")
    department: str = Field("प्रशासन शाखा", alias="department")
    designation: Optional[str] = Field(None, alias="designation")
    level_grade: Optional[str] = Field(None, alias="levelGrade")
    service_group: Optional[str] = Field("प्रशासन / प्राविधिक", alias="serviceGroup")
    employment_type: Optional[str] = Field("करार सेवा (Contract)", alias="employmentType")
    appointment_date_bs: Optional[str] = Field(None, alias="appointmentDateBs")
    join_date_bs: Optional[str] = Field(None, alias="joinDateBs")
    remarks: Optional[str] = None

    class Config:
        populate_by_name = True

