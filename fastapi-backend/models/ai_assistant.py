from sqlalchemy import Column, String, Integer, DateTime, Text
from core.database import Base
from datetime import datetime
import uuid

class AIPromptLog(Base):
    """Interaction history for the AI Assistant."""
    __tablename__ = 'ai_prompt_logs'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=False)
    session_id = Column(String, index=True, nullable=False)
    
    user_prompt = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    intent_category = Column(String, nullable=True) # Drafting, Query, General, Support
    
    tokens_used = Column(Integer, default=0)
    user_feedback = Column(String, nullable=True) # Positive, Negative
    
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenantId": self.tenant_id,
            "userId": self.user_id,
            "sessionId": self.session_id,
            "userPrompt": self.user_prompt,
            "aiResponse": self.ai_response,
            "intentCategory": self.intent_category or "General",
            "tokensUsed": self.tokens_used or 0,
            "userFeedback": self.user_feedback,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class AIKnowledgeBaseDocument(Base):
    """Tracks files uploaded specifically for AI context/RAG."""
    __tablename__ = 'ai_knowledge_base_documents'
    
    tenant_id = Column(String, index=True, nullable=True)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    document_title = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    document_type = Column(String, nullable=False) # Act, Rule, Guideline, Notice
    
    indexing_status = Column(String, default='Pending') # Pending, Indexed, Failed
    vector_reference_id = Column(String, nullable=True)
    
    uploaded_by = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenantId": self.tenant_id,
            "documentTitle": self.document_title,
            "fileUrl": self.file_url,
            "documentType": self.document_type,
            "indexingStatus": self.indexing_status or "Pending",
            "vectorReferenceId": self.vector_reference_id,
            "uploadedBy": self.uploaded_by,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
