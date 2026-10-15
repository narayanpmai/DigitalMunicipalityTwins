from fastapi import APIRouter, Request, Header
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/rag", tags=["AI & RAG"])

class RagQueryRequest(BaseModel):
    question: str
    language: Optional[str] = "ne"
    ward_filter: Optional[int] = None
    tenant_id: Optional[str] = None # For Multi-tenant RAG Segmentation

class RagQueryResponse(BaseModel):
    answer: str
    confidence_score: float
    sources: List[str]
    suggested_actions: List[str]
    navigation_url: Optional[str] = None

# Simulated Vector DB with Metadata Filtering (Segmentation)
# In production, this would be a query to pgvector/Chroma like:
# collection.query(query_embeddings, where={"tenant_id": req.tenant_id})
MUNICIPAL_KNOWLEDGE_DB = {
    "panchpokhari": [
        {
            "keywords": ["पर्यटन", "पाँचपोखरी", "ताल", "आमा याङ्ग्री"],
            "answer_ne": "पाँचपोखरी विश्वकै नवौं अग्लो स्थानमा रहेको (४,१०० मिटर) ५ वटा पवित्र कुण्डहरूको संगम हो। आमा याङ्ग्री पिक (३,७७१ मिटर) बाट लाङटाङ हिमश्रृङ्खलाको अवलोकन गर्न सकिन्छ।",
            "sources": ["पाँचपोखरी पर्यटन गुरुयोजना २०८०"],
            "actions": ["पर्यटन पदमार्ग हेर्नुहोस्", "३D भर्चुअल भ्रमण"],
            "navigation_url": "/tourism"
        }
    ],
    "helambu": [
        {
            "keywords": ["पर्यटन", "स्याउ", "हेलम्बु", "पदमार्ग"],
            "answer_ne": "हेलम्बु गाउँपालिका स्याउ उत्पादन र पदमार्ग (Helambu Trek) को लागि प्रख्यात छ। यहाँको प्रमुख पर्यटकीय गन्तव्य आमा याङ्ग्री, मेलम्ची घ्याङ र तार्केघ्याङ हुन्।",
            "sources": ["हेलम्बु पर्यटन प्रोफाइल"],
            "actions": ["पर्यटन पदमार्ग हेर्नुहोस्"],
            "navigation_url": "/tourism"
        }
    ],
    "narayan": [
        {
            "keywords": ["जन्म दर्ता", "जन्मदर्ता", "कागजात", "नागरिक बडापत्र"],
            "answer_ne": "जन्म दर्ता गर्नको लागि निम्न कागजातहरू चाहिन्छ: १. अस्पतालमा जन्मिएको भए अस्पतालको प्रमाणपत्र, २. बाबु/आमाको नागरिकताको प्रतिलिपि, ३. सूचकको नागरिकता। यो सेवा वडा कार्यालयबाट निःशुल्क (३५ दिन भित्र) प्राप्त गर्न सकिन्छ।",
            "sources": ["नारायण नगरपालिका - नागरिक बडापत्र २०८०"],
            "actions": ["अनलाइन फारम भर्नुहोस्", "वडा कार्यालय खोज्नुहोस्"],
            "navigation_url": "/services/vital-registration"
        },
        {
            "keywords": ["कर", "सम्पत्ति कर", "घरजग्गा कर", "छुट"],
            "answer_ne": "नारायण नगरपालिकामा आ.व. २०८०/८१ को लागि सम्पत्ति करमा पुष मसान्त भित्र तिरेमा १०% छुटको व्यवस्था छ। करको दर घरको प्रकार र जग्गाको मूल्यांकन अनुसार फरक पर्छ।",
            "sources": ["आर्थिक ऐन २०८० - नारायण नगरपालिका"],
            "actions": ["कर हिसाब गर्नुहोस्", "अनलाइन कर तिर्नुहोस्"],
            "navigation_url": "/revenue/property-tax"
        },
        {
            "keywords": ["मेयर", "प्रमुख", "सम्पर्क", "फोन"],
            "answer_ne": "नारायण नगरपालिकाको नगर प्रमुख (मेयर) को सचिवालयमा सम्पर्क गर्न ०८९-४२०००० मा फोन गर्न सक्नुहुन्छ। इमेल: info@narayanmun.gov.np",
            "sources": ["नगरपालिका सम्पर्क निर्देशिका"],
            "actions": ["सम्पर्क डाइरेक्टरी हेर्नुहोस्"],
            "navigation_url": "/contact"
        }
    ]
}

@router.post("/query", response_model=RagQueryResponse)
async def query_rag(req: RagQueryRequest, x_tenant_id: Optional[str] = Header(None)):
    q = req.question.lower()
    
    # RAG Segmentation: Identify correct tenant context
    tenant = req.tenant_id or x_tenant_id or "narayan"
    
    import re
    # 1. NLP Entity Extraction (Extract Ward Number)
    ward_match = re.search(r'वडा\s*(नं|नम्बर|no)?\s*(\d+|[१२३४५६७८९०]+)', q)
    extracted_ward = None
    if ward_match:
        extracted_ward = ward_match.group(2)
        nepali_to_eng = {'१':'1', '२':'2', '३':'3', '४':'4', '५':'5', '६':'6', '७':'7', '८':'8', '९':'9', '०':'0'}
        for ne, en in nepali_to_eng.items():
            extracted_ward = extracted_ward.replace(ne, en)
            
    # 2. Dynamic Response Generation based on NLP Intent & Entity
    if any(w in q for w in ['बजेट', 'योजना']) and extracted_ward:
        return RagQueryResponse(
            answer=f"वडा नं {extracted_ward} मा पूर्वाधार आयोजनाहरू सञ्चालनमा छन्। विस्तृत विवरण 'योजना तथा बजेट' ड्यासबोर्डमा हेर्न सक्नुहुन्छ।",
            confidence_score=0.92,
            sources=["योजना व्यवस्थापन प्रणाली (PMS)"],
            suggested_actions=["योजना सूची हेर्नुहोस्"],
            navigation_url="/projects"
        )
        
    # 3. RAG Search filtered by Tenant
    tenant_knowledge = MUNICIPAL_KNOWLEDGE_DB.get(tenant, [])
    matched_entry = None
    for item in tenant_knowledge:
        if any(kw in q for kw in item["keywords"]):
            matched_entry = item
            break
            
    if matched_entry:
        return RagQueryResponse(
            answer=matched_entry["answer_ne"],
            confidence_score=0.88,
            sources=matched_entry["sources"],
            suggested_actions=matched_entry["actions"],
            navigation_url=matched_entry.get("navigation_url")
        )
    
    # Fallback AI answer segmented by tenant
    return RagQueryResponse(
        answer=f"तपाईंको प्रश्न '{req.question}' सम्बन्धी विवरण सम्बन्धित पालिका कार्यालयबाट उपलब्ध हुन सक्दछ।",
        confidence_score=0.75,
        sources=[f"{tenant.capitalize()} एकीकृत डिजिटल ट्विन डाटाबेस"],
        suggested_actions=["नागरिक बडापत्र हेर्नुहोस्", "गुनासो दर्ता गर्नुहोस्"],
        navigation_url="/badapatra"
    )
