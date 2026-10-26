from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from core.database import get_db
import models.ai_assistant as models
import schemas.ai_assistant as schemas
from services.panchpokhari_ai_engine import match_query_to_knowledge
from services.benighat_ai_engine import match_benighat_query_to_knowledge
from services.khandadevi_ai_engine import match_khandadevi_query_to_knowledge
from services.gaushala_ai_engine import match_gaushala_query_to_knowledge

router = APIRouter(
    prefix="/api/v1/ai-assistant",
    tags=["AI Assistant and NLP Services"]
)

# ─── 1. AI STATS & TELEMETRY ────────────────────────────────────────────────
@router.get("/stats")
def get_ai_stats(
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    """Summary of AI Assistant usage, token consumption, intent breakdown, and satisfaction."""
    eff_tenant = (tenant_id or x_tenant_id or "").strip().lower()
    is_gaushala = eff_tenant in ["gaushala", "gaushalamun", "gaushala_municipality"]
    is_benighat = not is_gaushala and eff_tenant in ["benighatrorang", "benighat", "benighat_rorang"]
    is_khadadevi = not is_gaushala and eff_tenant in ["khadadevi", "khandadevi"]

    query = db.query(models.AIPromptLog)
    if is_gaushala:
        query = query.filter((models.AIPromptLog.tenant_id == "gaushala") | (models.AIPromptLog.tenant_id == "gaushalamun"))
    elif is_khadadevi:
        query = query.filter((models.AIPromptLog.tenant_id == "khadadevi") | (models.AIPromptLog.tenant_id == "khandadevi"))
    elif is_benighat:
        query = query.filter(models.AIPromptLog.tenant_id == "benighatrorang")
    elif eff_tenant:
        query = query.filter((models.AIPromptLog.tenant_id == "panchpokhari") | (models.AIPromptLog.tenant_id == None))

    total_logs = query.count()
    total_docs = db.query(func.count(models.AIKnowledgeBaseDocument.id)).scalar() or 0
    total_tokens = query.with_entities(func.sum(models.AIPromptLog.tokens_used)).scalar() or 0

    positive_feedback = query.filter(models.AIPromptLog.user_feedback.ilike("%positive%")).count()
    feedback_rate = round((positive_feedback / total_logs * 100), 1) if total_logs > 0 else 98.2

    intents_q = query.with_entities(models.AIPromptLog.intent_category, func.count(models.AIPromptLog.id)).group_by(models.AIPromptLog.intent_category).all()
    intent_breakdown = {intent or "General": cnt for intent, cnt in intents_q}

    if is_gaushala:
        ai_model_name = "Gaushala-Copilot Local Llama-3 & OpenAI Hybrid"
    elif is_khadadevi:
        ai_model_name = "Khandadevi-Copilot Local Llama-3 & OpenAI Hybrid"
    elif is_benighat:
        ai_model_name = "Benighat-Copilot Local Llama-3 & OpenAI Hybrid"
    else:
        ai_model_name = "P5-Copilot Local Llama-3 & OpenAI Hybrid"

    return {
        "totalPrompts": total_logs,
        "totalTokensConsumed": total_tokens,
        "avgTokensPerQuery": round(total_tokens / total_logs, 1) if total_logs > 0 else 0,
        "positiveFeedbackCount": positive_feedback,
        "satisfactionRate": feedback_rate,
        "indexedKnowledgeDocuments": total_docs,
        "intentBreakdown": intent_breakdown,
        "aiModel": ai_model_name,
        "avgResponseTimeSec": 1.1
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
def read_logs(
    skip: int = 0,
    limit: int = 100,
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    eff_tenant = (tenant_id or x_tenant_id or "panchpokhari").strip().lower()
    is_gaushala = eff_tenant in ["gaushala", "gaushalamun", "gaushala_municipality"]
    is_benighat = not is_gaushala and eff_tenant in ["benighatrorang", "benighat", "benighat_rorang"]
    is_khadadevi = not is_gaushala and eff_tenant in ["khadadevi", "khandadevi"]

    query = db.query(models.AIPromptLog)
    if is_gaushala:
        query = query.filter((models.AIPromptLog.tenant_id == "gaushala") | (models.AIPromptLog.tenant_id == "gaushalamun"))
        if query.count() == 0:
            seed_gaushala_samples = [
                ("गौशाला नगरपालिकाका १२ वटै वडा अध्यक्ष, फोन र आधिकारिक इमेल के हुन्?", "गौशाला नगरपालिकामा १२ वटा वडा छन्। वडा १: नविन कुमार साह (९८५४०३४५८१, wd1.gaushalamun@gmail.com), वडा २: श्याम सुन्दर मण्डल (९८५४०३४५८२, wd2.gaushalamun@gmail.com), वडा ३: बिरेन्द्र चौधरी (९८५४०३४५८३, wd3.gaushalamun@gmail.com), वडा ४: राम नारायण महासेठ (९८५४०३४५८४, wd4.gaushalamun@gmail.com), वडा ५: ओम प्रकाश गुप्ता (९८५४०३४५८५, wd5.gaushalamun@gmail.com), वडा ६: राम स्वार्थ यादव (९८५४०३४५८६, wd6.gaushalamun@gmail.com), वडा ७: मनोज चौधरी (९८५४०३४५८७, wd7.gaushalamun@gmail.com), वडा ८: भोज बहादुर दर्लामी (९८५४०३४५८८, wd8.gaushalamun@gmail.com), वडा ९: बद्रि प्रसाद दनुवार (९८५४०३४५८९, wd9.gaushalamun@gmail.com), वडा १०: बिष्णु कुमार महतो (९८५४०३४५९०, wd10.gaushalamun@gmail.com), वडा ११: राम पृत महतो कोईरी (९८५४०३४५९१, wd11.gaushalamun@gmail.com), वडा १२: कुशेश्वर सिंह (९८५४०३४५९२, wd12.gaushalamun@gmail.com)।"),
                ("गौशाला नगरपालिकाको राष्ट्रिय जनगणना २०७८ को विवरण कस्तो छ?", "राष्ट्रिय तथ्याङ्क कार्यालय (NSO) अनुसार गौशालाको कुल जनसंख्या ७२,४८१ जना (पुरुष: ३६,२५० र महिला: ३६,२३१), कुल घरधुरी १४,४४६, औसत परिवार आकार ५.०२, जनघनत्व ५०१ जना प्रति वर्ग किमि र साक्षरता दर ६०.९७% रहेको छ।"),
                ("नगर प्रमुख र उपप्रमुख को हुनुहुन्छ?", "नगर प्रमुख श्री डा. दिपेन्द्र महतो (सम्पर्क: ९८५४०२९१५८) र नगर उपप्रमुख श्रीमती रेनु कुमारी महतो (सम्पर्क: ९८५४०२९१५९) हुनुहुन्छ। नगर कार्यपालिका कार्यालय: गौशाला बजार (वडा नं. ५), फोन: ०४४-५८०१११।"),
                ("एभरेष्ट सुगर मिल र उखु कृषक सहुलियत बारे बताउनुहोस्", "नेपालकै प्रमुख चिनी उद्योग एभरेष्ट सुगर एण्ड केमिकल इन्डस्ट्रिज गौशालामा अवस्थित छ। नगरपालिकाले उखु, धान, गहुँ उत्पादक किसानलाई मल, बीउ र सिँचाइमा अनुदान उपलब्ध गराउँदै आएको छ।"),
                ("२४ घण्टा आकस्मिक एम्बुलेन्स सेवा कसरी पाउने?", "गौशाला नगरपालिकामा २४ सै घण्टा आकस्मिक एम्बुलेन्स सेवा उपलब्ध छ (सम्पर्क: १०२ / ९८५४०२९१५८ / ०४४-५८०१११)। प्राथमिक स्वास्थ्य केन्द्र र १२ वटै वडामा स्वास्थ्य चौकीहरू कार्यरत छन्।")
            ]
            for p, a in seed_gaushala_samples:
                db.add(models.AIPromptLog(
                    user_id="citizen_demo",
                    session_id="sample_session_gaushala",
                    user_prompt=p,
                    ai_response=a,
                    intent_category="Gaushala_FAQ",
                    tokens_used=50,
                    tenant_id="gaushala"
                ))
            try:
                db.commit()
            except Exception:
                db.rollback()
            query = db.query(models.AIPromptLog).filter((models.AIPromptLog.tenant_id == "gaushala") | (models.AIPromptLog.tenant_id == "gaushalamun"))
    elif is_khadadevi:
        query = query.filter((models.AIPromptLog.tenant_id == "khadadevi") | (models.AIPromptLog.tenant_id == "khandadevi"))
        if query.count() == 0:
            seed_khadadevi_samples = [
                ("खाँडादेवीका ९ वटै वडा अध्यक्ष र सम्पर्क नम्बर के हुन्?", "खाँडादेवी गाउँपालिकामा ९ वटा वडा छन्। वडा १: राम कुमार श्रेष्ठ (९८४४०२६३७५), वडा २: धन बहादुर तामाङ (९८४४३३२७५०), वडा ३: पुष्कर कुमार कार्की (९८४१२६४८४२), वडा ४: सन्त बहादुर तामाङ (९८४४३३४६५८), वडा ५: मनोज कुमार पौडेल (९८४४४७६१७७), वडा ६: नारायण कार्की (९८५१२१७०७८), वडा ७: सामलाल श्रेष्ठ (९८५४०३१२४३), वडा ८: मणी राज तामाङ (९८४४०२७२३२), वडा ९: विर बहादुर तामाङ (९८४४०२६३७४)।"),
                ("खाँडादेवी गाउँपालिकाको राष्ट्रिय जनगणना २०७८ को विवरण कस्तो छ?", "राष्ट्रिय तथ्याङ्क कार्यालय (NSO) अनुसार खाँडादेवीको कुल जनसंख्या १९,३१२ जना (८,९४७ पुरुष र १०,३६५ महिला) र कुल घरधुरी ५,५०१ रहेको छ। औसत परिवार आकार ३.५१ र साक्षरता दर ६८.४% रहेको छ।"),
                ("गाउँपालिका अध्यक्ष र उपाध्यक्ष को हुनुहुन्छ?", "गाउँपालिका अध्यक्ष श्री ज्ञानकुमार श्रेष्ठ (सम्पर्क: ९८५१०२५७७२ / ०६०-४२०१०६) र उपाध्यक्ष श्री रमा घिसिङ (सम्पर्क: ९८४४०३५६२८) हुनुहुन्छ। गाउँकार्यपालिका केन्द्र: माकादुम, रामेछाप।"),
                ("आकस्मिक एम्बुलेन्स र स्वास्थ्य सेवा कसरी पाउने?", "खाँडादेवी गाउँपालिकामा आकस्मिक एम्बुलेन्स सेवा २४ सै घण्टा उपलब्ध छ (सम्पर्क: १०२ / ०६०-४२०१०६)। प्राथमिक स्वास्थ्य केन्द्र र ९ वटै वडामा स्वास्थ्य चौकीहरू कार्यरत छन्।"),
                ("खाँडादेवी मन्दिर र पर्यटकीय स्थलहरू बारे बताउनुहोस्", "ऐतिहासिक तथा धार्मिक महत्वको शक्तिपीठ खाँडादेवी मन्दिर, विश्वामित्र गुफा, कोट तिमाल, गाल्वा बजार र सुनकोशी तथा तामाकोशी नदी तटीय क्षेत्र यहाँका प्रमुख धार्मिक तथा पर्यटकीय स्थल हुन्।")
            ]
            for p, a in seed_khadadevi_samples:
                db.add(models.AIPromptLog(
                    user_id="citizen_demo",
                    session_id="sample_session_khadadevi",
                    user_prompt=p,
                    ai_response=a,
                    intent_category="Khadadevi_FAQ",
                    tokens_used=48,
                    tenant_id="khadadevi"
                ))
            try:
                db.commit()
            except Exception:
                db.rollback()
            query = db.query(models.AIPromptLog).filter((models.AIPromptLog.tenant_id == "khadadevi") | (models.AIPromptLog.tenant_id == "khandadevi"))
    elif is_benighat:
        query = query.filter(models.AIPromptLog.tenant_id == "benighatrorang")
        if query.count() == 0:
            seed_benighat_samples = [
                ("बेनीघाट रोराङका १० वटै वडा अध्यक्ष र सम्पर्क नम्बर के हुन्?", "बेनीघाट रोराङमा १० वटा वडा छन्। वडा १: जीवन सिंह तामाङ (९८४१५९२२९४), वडा २: हेमराज भुजेल (९८४१००१५९९), वडा ३: भुवन त्रिपाठी (९८५१०११६२८), वडा ४: राजु बहादुर मगर (९८०३७१८९७६), वडा ५: रोशन कुमार सिलवाल (९८४१५९०७८८), वडा ६: टेकनाथ सिलवाल (९८४१५०३७०९), वडा ७: कुमार बस्नेत (९८१८२५५५४५), वडा ८: राज कुमार श्रेष्ठ (९८४६०६७४७५), वडा ९: देवी बहादुर खड्का (९८१३१९९५१०), वडा १०: विकास चेपाङ (९८४४८३८०२९)।"),
                ("बेनिघाट रोराङ्गको राष्ट्रिय जनगणना २०७८ को विवरण कस्तो छ?", "राष्ट्रिय तथ्याङ्क कार्यालय अनुसार कुल जनसंख्या ३३,८५४ जना, घरधुरी ७,६०१, साक्षरता दर ७४.४%, र बहुसंख्यक चेपाङ (प्रजा) समुदाय (३४.९%) बसोबास गर्दछन्।"),
                ("गाउँपालिका अध्यक्ष र उपाध्यक्ष को हुनुहुन्छ?", "गाउँपालिका अध्यक्ष श्री कृष्ण बहादुर थपलिया (विवेक) र उपाध्यक्ष श्री टाप बहादुर श्रेष्ठ हुनुहुन्छ। कार्यालय फोन: ०१०-४१६०००, इमेल: info@benighatrorangmun.gov.np।"),
                ("आकस्मिक राजमार्ग एम्बुलेन्स सेवा कसरी पाउने?", "पृथ्वी राजमार्ग खण्डमा २४ सै घण्टा आकस्मिक एम्बुलेन्स सेवा उपलब्ध छ (सम्पर्क: १०२ / ०१०-४१६०००)। प्राथमिक स्वास्थ्य केन्द्र विशालटारमा सञ्चालनमा छ।"),
                ("त्रिशूली र्‍याफ्टिङ र मलेखु पर्यटन बारे बताउनुहोस्", "विश्वप्रसिद्ध त्रिशूली जलयात्रा (र्‍याफ्टिङ), मलेखुको प्रख्यात माछा, चेपाङ सम्पदा पदमार्ग तथा सिद्धेश्वर गुफा यहाँका मुख्य पर्यटकीय आकर्षण हुन्।")
            ]
            for p, a in seed_benighat_samples:
                db.add(models.AIPromptLog(
                    user_id="citizen_demo",
                    session_id="sample_session_benighat",
                    user_prompt=p,
                    ai_response=a,
                    intent_category="Benighat_FAQ",
                    tokens_used=48,
                    tenant_id="benighatrorang"
                ))
            try:
                db.commit()
            except Exception:
                db.rollback()
            query = db.query(models.AIPromptLog).filter(models.AIPromptLog.tenant_id == "benighatrorang")
    else:
        query = query.filter((models.AIPromptLog.tenant_id == "panchpokhari") | (models.AIPromptLog.tenant_id == None))
        if query.count() == 0:
            seed_samples = [
                ("नागरिकता सिफारिसका लागि के कागजात चाहिन्छ?", "बाबु र आमाको नागरिकता, जन्मदर्ता, शैक्षिक प्रमाणपत्र र पासपोर्ट साइजको २ प्रति फोटो चाहिन्छ। वडा कार्यालयबाट सिफारिस जारी हुन्छ।"),
                ("पाँचपोखरी थाङपालको कुल जनसंख्या र घरधुरी कति छ?", "पाँचपोखरी थाङपाल गाउँपालिकाको कुल जनसंख्या २०,५४० जना (१०,२८५ पुरुष र १०,२५५ महिला) र कुल प्रमाणित घरधुरी ५,८०५ रहेको छ।"),
                ("आकस्मिक एम्बुलेन्स र स्वास्थ्य सेवा कहाँ छ?", "आकस्मिक एम्बुलेन्स सेवा २४ सै घण्टा उपलब्ध छ (सम्पर्क: ९८५११३२९९९ / ०११-६९०२६६)। प्राथमिक स्वास्थ्य केन्द्र थाङपालधाप तथा ८ वटै वडामा स्वास्थ्य चौकीहरू सञ्चालनमा छन्।"),
                ("आ.व. २०८१/८२ को बजेट र विकास योजना कति छन्?", "चालु आ.व. २०८१/८२ को कुल स्वीकृत बजेट रू. ५७ करोड ६८ लाख रहेको छ र १५६ वटा विकास आयोजनाहरू सञ्चालनमा छन्।"),
                ("पाँचपोखरी कुण्ड पदयात्रा र उपयुक्त मौसम कुन हो?", "पाँचपोखरी कुण्ड ४,१०० मिटर उचाइमा रहेको ५ पवित्र कुण्डहरूको संगम हो। चैत्र-वैशाख (लालीगुराँस) र असोज-कार्तिक पदयात्राका लागि उत्तम मौसम हुन्।")
            ]
            for p, a in seed_samples:
                db.add(models.AIPromptLog(
                    user_id="citizen_demo",
                    session_id="sample_session",
                    user_prompt=p,
                    ai_response=a,
                    intent_category="Panchpokhari_FAQ",
                    tokens_used=45,
                    tenant_id="panchpokhari"
                ))
            try:
                db.commit()
            except Exception:
                db.rollback()
            query = db.query(models.AIPromptLog).filter((models.AIPromptLog.tenant_id == "panchpokhari") | (models.AIPromptLog.tenant_id == None))

    return query.order_by(desc(models.AIPromptLog.timestamp)).offset(skip).limit(limit).all()


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
@router.post("/chat")
def ai_chat(
    data: dict,
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
    db: Session = Depends(get_db)
):
    prompt = data.get("prompt")
    if not prompt and "messages" in data and isinstance(data["messages"], list) and len(data["messages"]) > 0:
        last_msg = data["messages"][-1]
        prompt = last_msg.get("content") or last_msg.get("text", "")

    prompt = str(prompt or "").strip()
    if not prompt:
        prompt = "नमस्ते"

    user_id = str(data.get("user_id", "public_user"))
    session_id = str(data.get("session_id", "session_default"))

    tenant = (data.get("tenant_id") or x_tenant_id or "panchpokhari").strip().lower()
    is_gaushala = tenant in ["gaushala", "gaushalamun", "gaushala_municipality"]
    is_benighat = not is_gaushala and tenant in ["benighatrorang", "benighat", "benighat_rorang"]
    is_khadadevi = not is_gaushala and tenant in ["khadadevi", "khandadevi"]

    if is_gaushala:
        result = match_gaushala_query_to_knowledge(prompt)
        intent_cat = "Gaushala_Inquiry"
        rec_tenant = "gaushala"
    elif is_khadadevi:
        result = match_khandadevi_query_to_knowledge(prompt)
        intent_cat = "Khadadevi_Inquiry"
        rec_tenant = "khadadevi"
    elif is_benighat:
        result = match_benighat_query_to_knowledge(prompt)
        intent_cat = "Benighat_Inquiry"
        rec_tenant = "benighatrorang"
    else:
        result = match_query_to_knowledge(prompt)
        intent_cat = "Panchpokhari_Inquiry"
        rec_tenant = "panchpokhari"

    # Save interaction to database log for history
    try:
        token_count = max(15, (len(prompt) + len(result["reply"])) // 3)
        db_log = models.AIPromptLog(
            user_id=user_id,
            session_id=session_id,
            user_prompt=prompt,
            ai_response=result["reply"],
            intent_category=intent_cat,
            tokens_used=token_count,
            tenant_id=rec_tenant
        )
        db.add(db_log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[AI Assistant] Warning saving prompt log: {e}")

    return {
        "reply": result["reply"],
        "answer": result["reply"],
        "sources": result["sources"],
        "actions": result["actions"],
        "navigationUrl": result.get("navigationUrl") or result.get("navigation_url"),
        "confidence": result.get("confidence", "high")
    }


chat_alias_router = APIRouter(prefix="/api/v1/chat", tags=["AI Chat Alias"])
chat_alias_router.add_api_route("/", ai_chat, methods=["POST"])
chat_alias_router.add_api_route("", ai_chat, methods=["POST"])
