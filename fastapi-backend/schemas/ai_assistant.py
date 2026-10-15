from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AIPromptLogBase(BaseModel):
    user_id: str
    session_id: str
    user_prompt: str
    ai_response: str
    intent_category: Optional[str] = None
    tokens_used: Optional[int] = 0
    user_feedback: Optional[str] = None

class AIPromptLogCreate(AIPromptLogBase):
    pass

class AIPromptLogResponse(AIPromptLogBase):
    id: str
    tenant_id: Optional[str] = None
    timestamp: datetime
    class Config:
        from_attributes = True


class AIKnowledgeBaseDocumentBase(BaseModel):
    document_title: str
    file_url: str
    document_type: str
    indexing_status: Optional[str] = 'Pending'
    vector_reference_id: Optional[str] = None
    uploaded_by: str

class AIKnowledgeBaseDocumentCreate(AIKnowledgeBaseDocumentBase):
    pass

class AIKnowledgeBaseDocumentResponse(AIKnowledgeBaseDocumentBase):
    id: str
    tenant_id: Optional[str] = None
    timestamp: datetime
    class Config:
        from_attributes = True
