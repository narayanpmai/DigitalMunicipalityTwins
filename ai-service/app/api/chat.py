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

@router.post("/", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty")
        
    last_message = req.messages[-1].content
    
    # 1. Apply System Prompt / Persona (Conceptual)
    system_prompt = f"""You are the official AI Assistant for {req.tenant_id.capitalize()} Municipality. 
    Answer in {req.language}. Do not hallucinate."""
    
    # 2. Intent Detection (Mock LLM Router)
    reply = ""
    sources = []
    actions = []
    
    import re
    ward_match = re.search(r'वडा.*(\d+|[१-९])', last_message)
    
    # Map tenant_id to actual Nepali Name
    palika_names = {
        "panchpokhari": "पाँचपोखरी थाङपाल गाउँपालिका",
        "narayan": "नारायण नगरपालिका"
    }
    palika_name_np = palika_names.get(req.tenant_id, "हाम्रो पालिका")
    
    if "जनसंख्या" in last_message and ward_match:
        # LLM decides to call a tool!
        ward_no_str = ward_match.group(1)
        nepali_to_eng = {'१':'1', '२':'2', '३':'3', '४':'4', '५':'5', '६':'6', '७':'7', '८':'8', '९':'9'}
        ward_no = int(nepali_to_eng.get(ward_no_str, ward_no_str))
        
        # Execute DB Tool
        db_result = tool_get_ward_population(ward_no)
        
        # Format response
        reply = f"{palika_name_np} वडा नं {db_result['ward']} को कुल जनसंख्या {db_result['population']} रहेको छ।"
        sources = ["डिजिटल ट्विन लाइभ डेटाबेस (Live Database)"]
        actions = ["विस्तृत जनसांख्यिकीय रिपोर्ट हेर्नुहोस्"]
        
    elif "जन्म दर्ता" in last_message or "नागरिक बडापत्र" in last_message or "नागरिकता" in last_message:
        # LLM decides to use RAG Knowledge Base
        reply = "सेवा लिनको लागि निम्न कागजातहरू चाहिन्छ: १. अस्पताल वा सम्बन्धित कार्यालयको प्रमाणपत्र, २. बाबु/आमाको नागरिकता। यो सेवा वडा कार्यालयबाट निःशुल्क प्राप्त गर्न सकिन्छ।"
        sources = [f"{palika_name_np} - नागरिक बडापत्र २०८०"]
        actions = ["अनलाइन फारम भर्नुहोस्"]
        
    elif "मेयर" in last_message or "अध्यक्ष" in last_message or "प्रमुख" in last_message:
        reply = f"{palika_name_np}को प्रमुख/अध्यक्षको सचिवालयमा सम्पर्क गर्न पालिकाको आधिकारिक फोन नम्बरमा सम्पर्क गर्न सक्नुहुन्छ वा 'सम्पर्क' बटन थिच्नुहोस्।"
        sources = ["नगरपालिका सम्पर्क निर्देशिका"]
        
    else:
        # Generic persona fallback based on System Prompt
        reply = f"म {palika_name_np}को डिजिटल असिस्टेन्ट हुँ। मेरो काम नागरिकहरूलाई छिटो, सही र भरपर्दो जानकारी दिनु हो। मैले कसरी सहयोग गर्न सक्छु? (राजनीतिक वा विवादास्पद विषयमा म टिप्पणी गर्दिन।)"

        
    return ChatResponse(
        reply=reply,
        sources=sources,
        actions=actions
    )
