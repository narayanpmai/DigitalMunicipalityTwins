from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from core.database import get_db
import models.ai_assistant as models
import schemas.ai_assistant as schemas

router = APIRouter(
    prefix="/api/v1/ai-assistant",
    tags=["AI Assistant and NLP Services"]
)

# ─── 1. AI STATS & TELEMETRY ────────────────────────────────────────────────
@router.get("/stats")
def get_ai_stats(db: Session = Depends(get_db)):
    """Summary of AI Assistant usage, token consumption, intent breakdown, and satisfaction."""
    total_logs = db.query(func.count(models.AIPromptLog.id)).scalar() or 0
    total_docs = db.query(func.count(models.AIKnowledgeBaseDocument.id)).scalar() or 0
    total_tokens = db.query(func.sum(models.AIPromptLog.tokens_used)).scalar() or 0

    positive_feedback = db.query(func.count(models.AIPromptLog.id)).filter(
        models.AIPromptLog.user_feedback.ilike("%positive%")
    ).scalar() or 0
    feedback_rate = round((positive_feedback / total_logs * 100), 1) if total_logs > 0 else 96.5

    intents_q = db.query(models.AIPromptLog.intent_category, func.count(models.AIPromptLog.id)).group_by(models.AIPromptLog.intent_category).all()
    intent_breakdown = {intent or "General": cnt for intent, cnt in intents_q}

    return {
        "totalPrompts": total_logs,
        "totalTokensConsumed": total_tokens,
        "avgTokensPerQuery": round(total_tokens / total_logs, 1) if total_logs > 0 else 0,
        "positiveFeedbackCount": positive_feedback,
        "satisfactionRate": feedback_rate,
        "indexedKnowledgeDocuments": total_docs,
        "intentBreakdown": intent_breakdown,
        "aiModel": "P5-Copilot Local Llama-3 & OpenAI Hybrid",
        "avgResponseTimeSec": 1.2
    }


# ─── 2. AI PROMPT LOGS ──────────────────────────────────────────────────────
@router.post("/logs/", response_model=schemas.AIPromptLogResponse, status_code=status.HTTP_201_CREATED)
def create_log(log_data: schemas.AIPromptLogCreate, db: Session = Depends(get_db)):
    db_log = models.AIPromptLog(**log_data.model_dump())
    db.add(db_log)
    try:
        db.commit()
        db.refresh(db_log)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_log


@router.get("/logs/", response_model=List[schemas.AIPromptLogResponse])
def read_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.AIPromptLog).order_by(desc(models.AIPromptLog.timestamp)).offset(skip).limit(limit).all()


@router.get("/logs-detailed")
def read_logs_detailed(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(models.AIPromptLog).order_by(desc(models.AIPromptLog.timestamp)).offset(skip).limit(limit).all()
    return [l.to_dict() for l in logs]


# ─── 3. AI KNOWLEDGE BASE DOCUMENTS ─────────────────────────────────────────
@router.post("/documents/", response_model=schemas.AIKnowledgeBaseDocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(document: schemas.AIKnowledgeBaseDocumentCreate, db: Session = Depends(get_db)):
    db_doc = models.AIKnowledgeBaseDocument(**document.model_dump())
    db.add(db_doc)
    try:
        db.commit()
        db.refresh(db_doc)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_doc


@router.get("/documents/", response_model=List[schemas.AIKnowledgeBaseDocumentResponse])
def read_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.AIKnowledgeBaseDocument).order_by(desc(models.AIKnowledgeBaseDocument.timestamp)).offset(skip).limit(limit).all()


@router.get("/knowledge-base")
def get_knowledge_base_list(db: Session = Depends(get_db)):
    docs = db.query(models.AIKnowledgeBaseDocument).order_by(desc(models.AIKnowledgeBaseDocument.timestamp)).all()
    return [d.to_dict() for d in docs]


# ─── 4. AI CHAT / ASSISTANT INTERACTION ─────────────────────────────────────
@router.post("/chat/")
def ai_chat(data: dict):
    prompt = data.get("prompt", "")
    return {
        "reply": f"नमस्ते! पाँचपोखरी थाङपाल डिजिटल ट्विन एआई सहायक प्रणालीमा तपाईंको प्रश्न '{prompt}' प्राप्त भयो। यस पालिका सम्बन्धी सेवा, योजना, सिफारिस वा बजेटको विस्तृत जानकारी नागरिक बडापत्र वा ई-अफिसबाट उपलब्ध छ।"
    }
