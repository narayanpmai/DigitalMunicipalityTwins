from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class ServiceTemplateBase(BaseModel):
    service_code: str
    service_name_np: str
    required_documents: List[str]
    fee_amount: Optional[Decimal] = Decimal('0.00')
    html_pdf_template: str
    json_schema: Dict[str, Any]
    is_active: Optional[bool] = True

class ServiceTemplateCreate(ServiceTemplateBase):
    pass

class ServiceTemplateResponse(ServiceTemplateBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class ServiceApplicationBase(BaseModel):
    application_no: str
    service_template_id: str
    applicant_citizen_id: str
    ward_id: str
    submitted_data: Dict[str, Any]
    uploaded_documents: Optional[Dict[str, Any]] = None
    status: Optional[str] = 'Submitted'
    remarks_history: Optional[List[Dict[str, Any]]] = None

class ServiceApplicationCreate(ServiceApplicationBase):
    pass

class ServiceApplicationResponse(ServiceApplicationBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class ServicePaymentBase(BaseModel):
    application_id: str
    amount: Decimal
    payment_method: str
    transaction_id: Optional[str] = None
    payment_status: Optional[str] = 'Pending'
    receipt_url: Optional[str] = None

class ServicePaymentCreate(ServicePaymentBase):
    pass

class ServicePaymentResponse(ServicePaymentBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class IssuedCertificateBase(BaseModel):
    application_id: str
    certificate_no: str
    digital_signature_id: Optional[str] = None
    pdf_url: str
    qr_verification_token: str

class IssuedCertificateCreate(IssuedCertificateBase):
    pass

class IssuedCertificateResponse(IssuedCertificateBase):
    id: str
    tenant_id: Optional[str] = None
    issue_date: datetime
    class Config:
        from_attributes = True
