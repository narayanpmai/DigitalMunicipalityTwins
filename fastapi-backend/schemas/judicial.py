from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class JudicialCaseSchema(BaseModel):
    id: str
    case_no: str
    title: str
    dispute_type: str
    status: str
    complainant_name: str
    respondent_name: str
    
    class Config:
        from_attributes = True

class JudicialCaseCreate(BaseModel):
    case_no: str
    title: str
    dispute_type: str = 'अन्य स्थानीय विवाद'
    status: str = 'दर्ता भएको'
    complainant_name: str
    complainant_phone: Optional[str] = None
    complainant_address: Optional[str] = None
    ward_number: Optional[int] = None
    respondent_name: str
    respondent_phone: Optional[str] = None
    respondent_address: Optional[str] = None
    claim_details: str
    filing_date_bs: Optional[str] = None
