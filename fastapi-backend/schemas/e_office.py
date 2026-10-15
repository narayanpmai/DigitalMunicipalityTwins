from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class EOfficeFileBase(BaseModel):
    file_no: str
    subject: str
    classification: Optional[str] = 'General'
    status: Optional[str] = 'Open'
    created_by_branch: Optional[str] = None
    current_owner_id: Optional[str] = None

class EOfficeFileCreate(EOfficeFileBase):
    pass

class EOfficeFileResponse(EOfficeFileBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class TippaniBase(BaseModel):
    file_id: str
    darta_id: Optional[str] = None
    subject: str
    content_html: str
    status: Optional[str] = 'Draft'
    initiated_by: str

class TippaniCreate(TippaniBase):
    pass

class TippaniResponse(TippaniBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class FileMovementBase(BaseModel):
    file_id: str
    from_employee_id: str
    to_employee_id: str
    action_requested: Optional[str] = None
    remarks: Optional[str] = None

class FileMovementCreate(FileMovementBase):
    pass

class FileMovementResponse(FileMovementBase):
    id: str
    tenant_id: Optional[str] = None
    is_read: bool
    action_taken_date: Optional[datetime] = None
    dispatched_at: datetime
    class Config:
        from_attributes = True


class DigitalSignatureBase(BaseModel):
    document_id: str
    document_type: str
    signed_by: str
    cert_thumbprint: str
    signature_payload: str

class DigitalSignatureCreate(DigitalSignatureBase):
    pass

class DigitalSignatureResponse(DigitalSignatureBase):
    id: str
    tenant_id: Optional[str] = None
    signed_at: datetime
    class Config:
        from_attributes = True
