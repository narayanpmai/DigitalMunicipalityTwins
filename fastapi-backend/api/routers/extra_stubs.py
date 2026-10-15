from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

extra_router = APIRouter(
    tags=["Extra & Stubs (अन्य सुविधाहरू)"]
)

# ── Environment Stub ──
@extra_router.get("/api/environment")
def get_environment():
    return {"module": "environment", "status": "operational", "data": []}

# ── Finance Stub ──
@extra_router.get("/api/finance")
def get_finance():
    return {"module": "finance", "status": "operational", "data": []}

# ── Feedback Stub ──
@extra_router.get("/api/feedback")
def get_feedback():
    return {"module": "feedback", "status": "operational", "data": []}

# ── Governance Stub ──
@extra_router.get("/api/governance")
def get_governance():
    return {"module": "governance", "status": "operational", "data": []}

# ── AI Proxy ──
class AIChatRequest(BaseModel):
    question: str
    language: Optional[str] = "ne"

class AIReportRequest(BaseModel):
    type: str
    data: Dict[str, Any]

@extra_router.post("/api/ai/chat")
def ai_chat(body: AIChatRequest):
    return {
        "answer": "AI सेवा हाल मर्मतमा छ वा AI Microservice मा जडान भएको छैन।",
        "source": "System API",
        "confidence": "low",
        "isEstimate": True
    }

@extra_router.post("/api/ai/report")
def ai_report(body: AIReportRequest):
    return {
        "report": f"Generated generic report for {body.type}",
        "type": body.type
    }

@extra_router.get("/api/ai/info")
def ai_info():
    return {
        "provider": "mock",
        "model": "rule-based",
        "demoMode": True
    }

@extra_router.post("/api/ai/cad-analysis")
def ai_cad_analysis():
    return {
        "success": True,
        "analysis": {
            "totalLayersFound": 45,
            "criticalLayers": {
                "WALL": {"present": True, "count": 24, "status": "pass"},
                "PILLAR": {"present": True, "count": 12, "status": "pass"}
            },
            "overallStatus": "COMPLIANT",
            "recommendation": "The submitted CAD drawings adhere to local building by-laws.",
            "processedAt": datetime.utcnow().isoformat()
        }
    }
