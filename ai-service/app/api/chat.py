from fastapi import APIRouter, Request, Header, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime

router = APIRouter(prefix="/chat", tags=["AI Chat Assistant"])

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    tenant_id: Optional[str] = "narayan"
    language: Optional[str] = "ne"

class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = []
    actions: List[str] = []

# Mock DB Tools
def tool_get_ward_population(ward_no: int) -> dict:
    """Live DB Tool to fetch population."""
    mock_db = {1: 3200, 2: 2800, 3: 4100, 4: 2900, 5: 4520}
    return {"ward": ward_no, "population": mock_db.get(ward_no, 3000)}

from app.api.panchpokhari_ai_engine import match_query_to_knowledge

@router.post("/", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty")
        
    last_message = req.messages[-1].content
    result = match_query_to_knowledge(last_message)
        
    return ChatResponse(
        reply=result["reply"],
        sources=result["sources"],
        actions=result["actions"]
    )

