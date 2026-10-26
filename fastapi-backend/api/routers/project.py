from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict
from core.database import get_db
from core.tenant import get_tenant_context, TenantContext
from models.project import Project
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/projects",
    tags=["Projects & Infrastructure (योजना तथा पूर्वाधार विकास)"]
)


@router.get('/stats')
def get_projects_stats():
    return {'total': 0}

# ---------------------------------------------------------------------------
# Realistic Seed Dataset for Panchpokhari Thangpal Gaupalika (Wards 1 - 8)
# Legal basis: LGOA 2074 Schedule 8 (स्थानीय स्तरका विकास आयोजना तथा परियोजनाहरू)
# ---------------------------------------------------------------------------

INITIAL_PROJECTS = [
    {
        "id": "proj-w1-01",
        "projectCode": "PPK-W01-2081-RD01",
        "project_code": "PPK-W01-2081-RD01",
        "name": "बासखर्क किबी पकेट कृषि सडक स्तरोन्नति तथा ग्राभेल कार्य",
        "nameEn": "Baaskharka Kiwi Pocket Agro-Road Upgrade",
        "wardNumber": 1,
        "ward_number": 1,
        "sector": "पूर्वाधार (सडक)",
        "status": "ongoing",
        "budget": 2500000.0,
        "allocatedBudget": 2500000.0,
        "expenditureAmount": 1850000.0,
        "fundingSource": "गाउँपालिका आन्तरिक स्रोत",
        "budgetSource": "गाउँपालिका आन्तरिक स्रोत",
        "budget_source": "गाउँपालिका आन्तरिक स्रोत",
        "fiscalYear": "२०८१/०८२",
        "fiscal_year": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "startDateBs": "२०८१-०४-१५",
        "completionDateBs": "२०८१-०९-३०",
        "agreementDateBs": "२०८१-०४-१०",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ",
        "committeeName": "बासखर्क किबी सडक निर्माण उपभोक्ता समिति",
        "committeeChair": "सरिता तामाङ",
        "committeeSecretary": "राम प्रसाद सापकोटा",
        "committeeTreasurer": "चमेली तामाङ",
        "committeePhone": "९८४१२२३३४४",
        "palikaGrant": 2200000.0,
        "communityContribution": 300000.0,
        "totalAgreementAmount": 2500000.0,
        "paidAmount": 1500000.0,
        "financialProgress": 60.0,
        "progressPercentage": 75.0,
        "physicalProgressPercent": 75.0,
        "physicalProgress": 75.0,
        "beneficiaryCount": 420,
        "householdsCount": 85,
        "location": "बासखर्क किबी बगैँचा क्षेत्र",
        "latitude": 27.9450,
        "longitude": 85.6130,
        "responsibleEngineer": "ई. सन्तोष अर्याल",
        "engineerPhone": "९८५१०२२३३४",
        "monitoringRecommendation": "approved_for_installment",
        "remarks": "दोस्रो किस्ता भुक्तानीका लागि प्राविधिक नापी किताब (MB) स्वीकृत",
    },
    {
        "id": "proj-w2-01",
        "projectCode": "PPK-W02-2081-WS02",
        "project_code": "PPK-W02-2081-WS02",
        "name": "बरुवा खानेपानी मुहान संरक्षण तथा एक घर एक धारा विस्तार",
        "nameEn": "Baruwa Drinking Water Source Protection & Tap Extension",
        "wardNumber": 2,
        "ward_number": 2,
        "sector": "खानेपानी तथा सरसफाइ",
        "status": "ongoing",
        "budget": 3500000.0,
        "allocatedBudget": 3500000.0,
        "expenditureAmount": 2400000.0,
        "fundingSource": "प्रदेश समपूरक अनुदान",
        "budgetSource": "प्रदेश समपूरक अनुदान",
        "budget_source": "प्रदेश समपूरक अनुदान",
        "fiscalYear": "२०८१/०८२",
        "fiscal_year": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "startDateBs": "२०८१-०५-०१",
        "completionDateBs": "२०८१-१०-१५",
        "agreementDateBs": "२०८१-०४-२५",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ",
        "committeeName": "बरुवा खानेपानी उपभोक्ता तथा सरसफाइ समिति",
        "committeeChair": "दावा छिरिङ शेर्पा",
        "committeeSecretary": "कमला गुरुङ",
        "committeeTreasurer": "निमा शेर्पा",
        "committeePhone": "९८६००१२३४५",
        "palikaGrant": 3000000.0,
        "communityContribution": 500000.0,
        "totalAgreementAmount": 3500000.0,
        "paidAmount": 2100000.0,
        "financialProgress": 60.0,
        "progressPercentage": 68.0,
        "physicalProgressPercent": 68.0,
        "physicalProgress": 68.0,
        "beneficiaryCount": 650,
        "householdsCount": 130,
        "location": "बरुवा मुख्य बस्ती",
        "latitude": 27.9880,
        "longitude": 85.6310,
        "responsibleEngineer": "ई. सुवास खतिवडा",
        "engineerPhone": "९८४१५५६६७७",
        "monitoringRecommendation": "approved_for_installment",
        "remarks": "रिजर्भ्वायर ट्यांकी निर्माण सम्पन्न, पाइपलाइन बिछ्याउने कार्य जारी",
    },
    {
        "id": "proj-w3-01",
        "projectCode": "PPK-W03-2081-TR03",
        "project_code": "PPK-W03-2081-TR03",
        "name": "भोताङ-छिमिटि-पाँचपोखरी पदमार्ग स्तरोन्नति तथा रेलिङ निर्माण",
        "nameEn": "Bhotang-Panchpokhari Trekking Trail Safety Upgrade",
        "wardNumber": 3,
        "ward_number": 3,
        "sector": "पर्यटन तथा पूर्वाधार",
        "status": "ongoing",
        "budget": 4500000.0,
        "allocatedBudget": 4500000.0,
        "expenditureAmount": 3800000.0,
        "fundingSource": "संघीय विशेष अनुदान",
        "budgetSource": "संघीय विशेष अनुदान",
        "budget_source": "संघीय विशेष अनुदान",
        "fiscalYear": "२०८१/०८२",
        "fiscal_year": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "startDateBs": "२०८१-०४-०१",
        "completionDateBs": "२०८१-०८-३०",
        "agreementDateBs": "२०८१-०३-२५",
        "agreementStatus": "सम्पन्न हुने चरणमा",
        "committeeName": "पाँचपोखरी पदमार्ग निर्माण समिति",
        "committeeChair": "पासाङ दोर्जे ह्योल्मो",
        "committeeSecretary": "सूर्य बहादुर तामाङ",
        "committeeTreasurer": "डोल्मा शेर्पा",
        "committeePhone": "९८५१०९८७६५",
        "palikaGrant": 4000000.0,
        "communityContribution": 500000.0,
        "totalAgreementAmount": 4500000.0,
        "paidAmount": 3600000.0,
        "financialProgress": 80.0,
        "progressPercentage": 88.0,
        "physicalProgressPercent": 88.0,
        "physicalProgress": 88.0,
        "beneficiaryCount": 12000,
        "householdsCount": 240,
        "location": "छिमिटि देखि पाँचपोखरी क्षेत्र",
        "latitude": 27.9789,
        "longitude": 85.6123,
        "responsibleEngineer": "ई. सन्तोष अर्याल",
        "engineerPhone": "९८५१०२२३३४",
        "monitoringRecommendation": "approved_for_installment",
        "remarks": "भीमढुङ्गा क्षेत्रमा स्टिल रेलिङ तथा ढुङ्गाको सिँढी निर्माण ८८% सम्पन्न",
    },
    {
        "id": "proj-w4-01",
        "projectCode": "PPK-W04-2081-BD04",
        "project_code": "PPK-W04-2081-BD04",
        "name": "थाङपालकोट मानेखर्क आधारभूत स्वास्थ्य सेवा केन्द्र भवन निर्माण",
        "nameEn": "Manekharka Basic Health Center Building Construction",
        "wardNumber": 4,
        "ward_number": 4,
        "sector": "भवन तथा सहरी विकास",
        "status": "completed",
        "budget": 6000000.0,
        "allocatedBudget": 6000000.0,
        "expenditureAmount": 5950000.0,
        "fundingSource": "गाउँपालिका समपूरक कोष",
        "budgetSource": "गाउँपालिका समपूरक कोष",
        "budget_source": "गाउँपालिका समपूरक कोष",
        "fiscalYear": "२०८१/०८२",
        "fiscal_year": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "ठेक्का (Contract)",
        "startDateBs": "२०८०-१०-१५",
        "completionDateBs": "२०८१-०४-३०",
        "agreementDateBs": "२०८०-१०-०५",
        "agreementStatus": "सम्पन्न (फरफारक प्रमाणित)",
        "committeeName": "जुगल कन्स्ट्रक्सन प्रा.लि.",
        "committeeChair": "ठेकेदार प्रतिनिधि: विजय लामा",
        "committeePhone": "९८४१००८८९९",
        "palikaGrant": 6000000.0,
        "communityContribution": 0.0,
        "totalAgreementAmount": 5950000.0,
        "paidAmount": 5950000.0,
        "financialProgress": 100.0,
        "progressPercentage": 100.0,
        "physicalProgressPercent": 100.0,
        "physicalProgress": 100.0,
        "beneficiaryCount": 1850,
        "householdsCount": 380,
        "location": "मानेखर्क बजार",
        "latitude": 27.9610,
        "longitude": 85.5980,
        "responsibleEngineer": "ई. सुवास खतिवडा",
        "engineerPhone": "९८४१५५६६७७",
        "monitoringRecommendation": "approved_for_installment",
        "remarks": "भवन निर्माण सम्पन्न, प्राविधिक परीक्षण तथा फरफारक अनुमोदन",
    },
    {
        "id": "proj-w5-01",
        "projectCode": "PPK-W05-2081-IR05",
        "project_code": "PPK-W05-2081-IR05",
        "name": "गुन्सा सिँचाइ कुलो निर्माण तथा कृषि उत्पादकत्व वृद्धि आयोजना",
        "nameEn": "Gunsa Irrigation Canal Construction & Agro Support",
        "wardNumber": 5,
        "ward_number": 5,
        "sector": "सिँचाइ तथा ऊर्जा",
        "status": "ongoing",
        "budget": 1800000.0,
        "allocatedBudget": 1800000.0,
        "expenditureAmount": 1200000.0,
        "fundingSource": "वडास्तरीय बजेट",
        "budgetSource": "वडास्तरीय बजेट",
        "budget_source": "वडास्तरीय बजेट",
        "fiscalYear": "२०८१/०८२",
        "fiscal_year": "२०८१/०८२",
        "level": "वडास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "startDateBs": "२०८१-०५-१०",
        "completionDateBs": "२०८१-१०-३०",
        "agreementDateBs": "२०८१-०५-०१",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ",
        "committeeName": "गुन्सा सिँचाइ कुलो उपभोक्ता समिति",
        "committeeChair": "कृष्ण बहादुर पण्डित",
        "committeeSecretary": "गीता न्यौपाने",
        "committeeTreasurer": "हरि प्रसाद पराजुली",
        "committeePhone": "९८४१६६७७८८",
        "palikaGrant": 1600000.0,
        "communityContribution": 200000.0,
        "totalAgreementAmount": 1800000.0,
        "paidAmount": 900000.0,
        "financialProgress": 50.0,
        "progressPercentage": 62.0,
        "physicalProgressPercent": 62.0,
        "physicalProgress": 62.0,
        "beneficiaryCount": 380,
        "householdsCount": 75,
        "location": "गुन्सा फाँट",
        "latitude": 27.9234,
        "longitude": 85.5801,
        "responsibleEngineer": "ई. सन्तोष अर्याल",
        "engineerPhone": "९८५१०२२३३४",
        "monitoringRecommendation": "approved_for_installment",
        "remarks": "६०० मिटर पक्की कुलो ढलान सम्पन्न",
    },
    {
        "id": "proj-w6-01",
        "projectCode": "PPK-W06-2081-AD06",
        "project_code": "PPK-W06-2081-AD06",
        "name": "थाङपालधाप गाउँपालिका प्रशासनिक परिसर पर्खाल तथा ल्यान्डस्केपिङ",
        "nameEn": "Thangpaldhap Municipal Complex Compound Wall & Landscaping",
        "wardNumber": 6,
        "ward_number": 6,
        "sector": "भवन तथा सहरी विकास",
        "status": "ongoing",
        "budget": 2800000.0,
        "allocatedBudget": 2800000.0,
        "expenditureAmount": 1950000.0,
        "fundingSource": "गाउँपालिका आन्तरिक स्रोत",
        "budgetSource": "गाउँपालिका आन्तरिक स्रोत",
        "budget_source": "गाउँपालिका आन्तरिक स्रोत",
        "fiscalYear": "२०८१/०८२",
        "fiscal_year": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "startDateBs": "२०८१-०४-२५",
        "completionDateBs": "२०८१-०९-१५",
        "agreementDateBs": "२०८१-०४-१५",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ",
        "committeeName": "प्रशासनिक परिसर सौन्दर्यीकरण समिति",
        "committeeChair": "सुरेश कुमार श्रेष्ठ",
        "committeeSecretary": "सुनिता तामाङ",
        "committeeTreasurer": "चन्द्र बहादुर थापा",
        "committeePhone": "९८४१२२९९००",
        "palikaGrant": 2500000.0,
        "communityContribution": 300000.0,
        "totalAgreementAmount": 2800000.0,
        "paidAmount": 1600000.0,
        "financialProgress": 57.0,
        "progressPercentage": 70.0,
        "physicalProgressPercent": 70.0,
        "physicalProgress": 70.0,
        "beneficiaryCount": 21000,
        "householdsCount": 4200,
        "location": "थाङपालधाप गाउँपालिका केन्द्र",
        "latitude": 27.9398,
        "longitude": 85.5921,
        "responsibleEngineer": "ई. सुवास खतिवडा",
        "engineerPhone": "९८४१५५६६७७",
        "monitoringRecommendation": "approved_for_installment",
        "remarks": "पर्खाल तथा मुख्य प्रवेशद्वार निर्माण कार्य अन्तिम चरणमा",
    },
    {
        "id": "proj-w7-01",
        "projectCode": "PPK-W07-2081-RD07",
        "project_code": "PPK-W07-2081-RD07",
        "name": "भोटेनाम्लाङ-तिपेनी बजार मुख्य सडक पक्की नाली तथा आरसीसी ढलान",
        "nameEn": "Bhotenamlang-Tipeni Market Road Drainage & RCC Pavement",
        "wardNumber": 7,
        "ward_number": 7,
        "sector": "पूर्वाधार (सडक)",
        "status": "ongoing",
        "budget": 3200000.0,
        "allocatedBudget": 3200000.0,
        "expenditureAmount": 2100000.0,
        "fundingSource": "प्रदेश विशेष अनुदान",
        "budgetSource": "प्रदेश विशेष अनुदान",
        "budget_source": "प्रदेश विशेष अनुदान",
        "fiscalYear": "२०८१/०८२",
        "fiscal_year": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "startDateBs": "२०८१-०५-०१",
        "completionDateBs": "२०८१-१०-२०",
        "agreementDateBs": "२०८१-०४-२०",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ",
        "committeeName": "तिपेनी बजार ढलान उपभोक्ता समिति",
        "committeeChair": "टेक बहादुर तामाङ",
        "committeeSecretary": "राजु दनुवार",
        "committeeTreasurer": "सविता श्रेष्ठ",
        "committeePhone": "९८४९३३२२११",
        "palikaGrant": 2800000.0,
        "communityContribution": 400000.0,
        "totalAgreementAmount": 3200000.0,
        "paidAmount": 1800000.0,
        "financialProgress": 56.0,
        "progressPercentage": 65.0,
        "physicalProgressPercent": 65.0,
        "physicalProgress": 65.0,
        "beneficiaryCount": 1400,
        "householdsCount": 280,
        "location": "तिपेनी मुख्य बजार",
        "latitude": 27.9117,
        "longitude": 85.5692,
        "responsibleEngineer": "ई. सन्तोष अर्याल",
        "engineerPhone": "९८५१०२२३३४",
        "monitoringRecommendation": "approved_for_installment",
        "remarks": "बजार क्षेत्रमा ३५० मिटर नाली र ढलान कार्य जारी",
    },
    {
        "id": "proj-w8-01",
        "projectCode": "PPK-W08-2081-BR08",
        "project_code": "PPK-W08-2081-BR08",
        "name": "लाँगर्चे खोला झोलुङ्गे पुल तथा सुरक्षित गोरेटो बाटो निर्माण",
        "nameEn": "Langarche Suspension Bridge & Safe Trail Construction",
        "wardNumber": 8,
        "ward_number": 8,
        "sector": "पूर्वाधार (पुल/पदमार्ग)",
        "status": "planned",
        "budget": 2000000.0,
        "allocatedBudget": 2000000.0,
        "expenditureAmount": 0.0,
        "fundingSource": "गाउँपालिका आन्तरिक स्रोत",
        "budgetSource": "गाउँपालिका आन्तरिक स्रोत",
        "budget_source": "गाउँपालिका आन्तरिक स्रोत",
        "fiscalYear": "२०८१/०८२",
        "fiscal_year": "२०८१/०८२",
        "level": "वडास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "startDateBs": "२०८१-०६-०१",
        "completionDateBs": "२०८१-११-३०",
        "agreementDateBs": "२०८१-०५-२५",
        "agreementStatus": "सम्झौता हुन बाँकी",
        "committeeName": "लाँगर्चे खोला झोलुङ्गे पुल उपभोक्ता समिति",
        "committeeChair": "ईश्वर पाण्डे",
        "committeeSecretary": "कमल गुरुङ",
        "committeeTreasurer": "पार्वती खत्री",
        "committeePhone": "९८५१०१२३०९",
        "palikaGrant": 1800000.0,
        "communityContribution": 200000.0,
        "totalAgreementAmount": 2000000.0,
        "paidAmount": 0.0,
        "financialProgress": 0.0,
        "progressPercentage": 0.0,
        "physicalProgressPercent": 0.0,
        "physicalProgress": 0.0,
        "beneficiaryCount": 520,
        "householdsCount": 105,
        "location": "लाँगर्चे खोला दोभान",
        "latitude": 27.9087,
        "longitude": 85.5745,
        "responsibleEngineer": "ई. सुवास खतिवडा",
        "engineerPhone": "९८४१५५६६७७",
        "monitoringRecommendation": "pending",
        "remarks": "उपभोक्ता भेला सम्पन्न भई सम्झौताको प्रक्रियामा रहेको",
    }
]

def _to_camel_project(p: Any) -> Dict[str, Any]:
    if isinstance(p, dict):
        d = dict(p)
    else:
        d = {
            "id": getattr(p, "id", str(uuid.uuid4())),
            "projectCode": getattr(p, "project_code", ""),
            "name": getattr(p, "name", ""),
            "nameEn": getattr(p, "name_en", None),
            "description": getattr(p, "description", None),
            "wardNumber": getattr(p, "ward_number", 1),
            "sector": getattr(p, "sector", "पूर्वाधार"),
            "status": getattr(p, "status", "planned"),
            "budget": float(getattr(p, "budget", 0) or 0),
            "allocatedBudget": float(getattr(p, "budget", 0) or 0),
            "fundingSource": getattr(p, "funding_source", None),
            "fiscalYear": getattr(p, "fiscal_year", "२०८१/०८२"),
            "startDate": str(getattr(p, "start_date", "") or ""),
            "completionDate": str(getattr(p, "completion_date", "") or ""),
            "contractor": getattr(p, "contractor", None),
            "progressPercentage": float(getattr(p, "progress_percentage", 0) or 0),
            "physicalProgressPercent": float(getattr(p, "progress_percentage", 0) or 0),
            "physicalProgress": float(getattr(p, "progress_percentage", 0) or 0),
            "beneficiaryCount": getattr(p, "beneficiary_count", 0),
            "latitude": getattr(p, "latitude", None),
            "longitude": getattr(p, "longitude", None),
            "location": getattr(p, "location", None),
            "isPublic": getattr(p, "is_public", True),
            "marfat": getattr(p, "marfat", "उपभोक्ता समिति"),
            "level": getattr(p, "level", "गाउँपालिकास्तरीय"),
            "agreementDateBs": getattr(p, "agreement_date_bs", None),
            "completionDateBs": getattr(p, "completion_date_bs", None),
            "committeeName": getattr(p, "committee_name", None),
            "committeeChair": getattr(p, "committee_chair", None),
            "committeeSecretary": getattr(p, "committee_secretary", None),
            "committeeTreasurer": getattr(p, "committee_treasurer", None),
            "committeePhone": getattr(p, "committee_phone", None),
            "palikaGrant": float(getattr(p, "palika_grant", 0) or 0),
            "communityContribution": float(getattr(p, "community_contribution", 0) or 0),
            "totalAgreementAmount": float(getattr(p, "total_agreement_amount", 0) or 0),
            "paidAmount": float(getattr(p, "paid_amount", 0) or 0),
            "financialProgress": float(getattr(p, "financial_progress", 0) or 0),
            "agreementStatus": getattr(p, "agreement_status", "सम्झौता हुन बाँकी"),
            "budgetSource": getattr(p, "budget_source", None),
            "budgetSubHead": getattr(p, "budget_sub_head", None),
            "responsibleEngineer": getattr(p, "responsible_engineer", None),
            "engineerPhone": getattr(p, "engineer_phone", None),
            "monitoringRecommendation": getattr(p, "monitoring_recommendation", "pending"),
            "installmentDetails": getattr(p, "installment_details", None),
            "monitoringRecords": getattr(p, "monitoring_records", None),
            "measurementBook": getattr(p, "measurement_book", None),
            "socialAudit": getattr(p, "social_audit", None),
            "farfarakDetails": getattr(p, "farfarak_details", None),
            "createdAt": getattr(p, "created_at", datetime.utcnow()).isoformat() if hasattr(getattr(p, "created_at", None), "isoformat") else str(getattr(p, "created_at", "")),
        }

    # Ensure camelCase aliases exist
    if "ward_number" in d and "wardNumber" not in d: d["wardNumber"] = d["ward_number"]
    if "project_code" in d and "projectCode" not in d: d["projectCode"] = d["project_code"]
    if "funding_source" in d and "fundingSource" not in d: d["fundingSource"] = d["funding_source"]
    if "fiscal_year" in d and "fiscalYear" not in d: d["fiscalYear"] = d["fiscal_year"]
    if "budget_source" in d and "budgetSource" not in d: d["budgetSource"] = d["budget_source"]
    if "budget" in d and "allocatedBudget" not in d: d["allocatedBudget"] = d["budget"]
    if "progress_percentage" in d and "progressPercentage" not in d: d["progressPercentage"] = d["progress_percentage"]
    if "progressPercentage" in d and "physicalProgressPercent" not in d: d["physicalProgressPercent"] = d["progressPercentage"]
    if "progressPercentage" in d and "physicalProgress" not in d: d["physicalProgress"] = d["progressPercentage"]
    return d

def _get_projects_dataset(db: Session, ctx: TenantContext) -> List[Dict[str, Any]]:
    try:
        query = db.query(Project)
        query = ctx.filter_query(query, Project)
        results = query.all()
        if results and len(results) > 0:
            return [_to_camel_project(p) for p in results]
    except Exception:
        pass
    if "panchpokhari" in ctx.allowed_tenant_ids or ctx.is_all:
        return [_to_camel_project(p) for p in INITIAL_PROJECTS]
    return []


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@router.get("/stats/summary")
def get_project_stats_summary(db: Session = Depends(get_db), ctx: TenantContext = Depends(get_tenant_context)):
    """Return municipal project summary statistics for dashboard and reports"""
    dataset = _get_projects_dataset(db, ctx)
    total_projects = len(dataset)
    completed = len([p for p in dataset if p.get("status") == "completed"])
    ongoing = len([p for p in dataset if p.get("status") == "ongoing"])
    planned = len([p for p in dataset if p.get("status") == "planned"])
    
    total_budget = sum(float(p.get("allocatedBudget", 0) or p.get("budget", 0) or 0) for p in dataset)
    total_expenditure = sum(float(p.get("expenditureAmount", 0) or p.get("paidAmount", 0) or 0) for p in dataset)
    avg_physical = (sum(float(p.get("progressPercentage", 0) or 0) for p in dataset) / total_projects) if total_projects else 0
    avg_financial = (total_expenditure / total_budget * 100) if total_budget else 0

    return {
        "totalProjects": total_projects,
        "completedProjects": completed,
        "ongoingProjects": ongoing,
        "plannedProjects": planned,
        "totalBudget": total_budget,
        "totalExpenditure": total_expenditure,
        "avgPhysicalProgress": round(avg_physical, 1),
        "avgFinancialProgress": round(avg_financial, 1),
    }


@router.get("", response_model=Dict[str, Any])
@router.get("/", response_model=Dict[str, Any])
def get_projects(
    fiscalYear: Optional[str] = Query(None, alias="fiscalYear"),
    level: Optional[str] = Query(None),
    budgetSource: Optional[str] = Query(None, alias="budgetSource"),
    search: Optional[str] = Query(None),
    wardNumber: Optional[int] = Query(None, alias="wardNumber"),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """
    Get filtered list of municipal projects.
    Returns: { "data": [...projects], "total": count }
    """
    dataset = _get_projects_dataset(db, ctx)

    filtered = dataset
    if fiscalYear and fiscalYear.lower() != "all":
        filtered = [p for p in filtered if str(p.get("fiscalYear", "")).strip() == fiscalYear.strip()]
    if level and level.lower() != "all":
        filtered = [p for p in filtered if str(p.get("level", "")).strip() == level.strip()]
    if budgetSource and budgetSource.lower() != "all":
        filtered = [p for p in filtered if budgetSource.lower() in str(p.get("budgetSource", "")).lower() or budgetSource.lower() in str(p.get("fundingSource", "")).lower()]
    if wardNumber and wardNumber > 0:
        filtered = [p for p in filtered if p.get("wardNumber") == wardNumber or p.get("ward_number") == wardNumber]
    if status and status.lower() != "all":
        filtered = [p for p in filtered if str(p.get("status", "")).lower() == status.lower()]
    if search:
        s = search.strip().lower()
        filtered = [
            p for p in filtered
            if s in str(p.get("name", "")).lower()
            or s in str(p.get("projectCode", "")).lower()
            or s in str(p.get("location", "")).lower()
            or s in str(p.get("committeeName", "")).lower()
            or s in str(p.get("committeeChair", "")).lower()
            or s in str(p.get("sector", "")).lower()
        ]

    return {
        "data": filtered,
        "total": len(filtered),
    }


@router.get("/{id}")
def get_project_by_id(id: str, db: Session = Depends(get_db), ctx: TenantContext = Depends(get_tenant_context)):
    """Get project details by UUID or projectCode"""
    try:
        query = db.query(Project).filter((Project.id == id) | (Project.project_code == id))
        query = ctx.filter_query(query, Project)
        p = query.first()
        if p:
            return _to_camel_project(p)
    except Exception:
        pass

    if "panchpokhari" in ctx.allowed_tenant_ids or ctx.is_all:
        for p in INITIAL_PROJECTS:
            if p["id"] == id or p.get("projectCode") == id or p.get("project_code") == id:
                return _to_camel_project(p)

    raise HTTPException(status_code=404, detail="Project not found (आयोजना फेला परेन)")



@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_project(data: Dict[str, Any], db: Session = Depends(get_db), ctx: TenantContext = Depends(get_tenant_context)):
    """Register a new municipal project or agreement"""
    proj_id = str(uuid.uuid4())
    ward_num = int(data.get("wardNumber") or data.get("ward_number") or 1)
    short_hash = uuid.uuid4().hex[:4].upper()
    eff_tenant = data.get("tenant_id") or data.get("tenantId") or (None if ctx.is_all else ctx.tenant_subdomain)
    proj_code = data.get("projectCode") or data.get("project_code") or f"PRJ-W{ward_num:02d}-2081-{short_hash}"
    name = data.get("name") or "नयाँ विकास आयोजना"
    sector = data.get("sector") or "पूर्वाधार"
    budget_val = float(data.get("budget") or data.get("allocatedBudget") or 0.0)

    try:
        db_p = Project(
            id=proj_id,
            tenant_id=eff_tenant,
            project_code=proj_code,
            name=name,
            name_en=data.get("nameEn") or data.get("name_en"),
            description=data.get("description"),
            ward_number=ward_num,
            sector=sector,
            status=data.get("status", "planned"),
            budget=budget_val,
            funding_source=data.get("fundingSource") or data.get("funding_source") or data.get("budgetSource"),
            fiscal_year=data.get("fiscalYear") or data.get("fiscal_year") or "२०८१/०८२",
            contractor=data.get("contractor"),
            progress_percentage=float(data.get("progressPercentage") or data.get("physicalProgressPercent") or 0.0),
            beneficiary_count=int(data.get("beneficiaryCount") or 0),
            latitude=float(data.get("latitude")) if data.get("latitude") is not None else None,
            longitude=float(data.get("longitude")) if data.get("longitude") is not None else None,
            location=data.get("location"),
            is_public=data.get("isPublic", True),
            marfat=data.get("marfat", "उपभोक्ता समिति"),
            level=data.get("level", "गाउँपालिकास्तरीय"),
            agreement_date_bs=data.get("agreementDateBs") or data.get("agreement_date_bs"),
            completion_date_bs=data.get("completionDateBs") or data.get("completion_date_bs"),
            committee_name=data.get("committeeName") or data.get("committee_name"),
            committee_chair=data.get("committeeChair") or data.get("committee_chair"),
            committee_secretary=data.get("committeeSecretary") or data.get("committee_secretary"),
            committee_treasurer=data.get("committeeTreasurer") or data.get("committee_treasurer"),
            committee_phone=data.get("committeePhone") or data.get("committee_phone"),
            palika_grant=float(data.get("palikaGrant") or 0.0),
            community_contribution=float(data.get("communityContribution") or 0.0),
            total_agreement_amount=float(data.get("totalAgreementAmount") or budget_val),
            paid_amount=float(data.get("paidAmount") or 0.0),
            financial_progress=float(data.get("financialProgress") or 0.0),
            agreement_status=data.get("agreementStatus", "सम्झौता हुन बाँकी"),
            budget_source=data.get("budgetSource") or data.get("budget_source"),
            budget_sub_head=data.get("budgetSubHead") or data.get("budget_sub_head"),
            responsible_engineer=data.get("responsibleEngineer") or data.get("responsible_engineer"),
            engineer_phone=data.get("engineerPhone") or data.get("engineer_phone"),
            monitoring_recommendation=data.get("monitoringRecommendation", "pending"),
            installment_details=data.get("installmentDetails"),
            monitoring_records=data.get("monitoringRecords"),
            measurement_book=data.get("measurementBook"),
            social_audit=data.get("socialAudit"),
            farfarak_details=data.get("farfarakDetails"),
        )
        db.add(db_p)
        db.commit()
        db.refresh(db_p)
        return _to_camel_project(db_p)
    except Exception:
        new_item = {
            "id": proj_id,
            "projectCode": proj_code,
            "name": name,
            "wardNumber": ward_num,
            "sector": sector,
            "budget": budget_val,
            "allocatedBudget": budget_val,
            **data
        }
        INITIAL_PROJECTS.insert(0, new_item)
        return _to_camel_project(new_item)


@router.put("/{id}")
def update_project(
    id: str, 
    data: Dict[str, Any], 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Update project details, agreement, or monitoring progress"""
    try:
        query = db.query(Project).filter((Project.id == id) | (Project.project_code == id))
        query = ctx.filter_query(query, Project)
        p = query.first()
        if p:
            if "name" in data: p.name = data["name"]
            if "wardNumber" in data: p.ward_number = int(data["wardNumber"])
            if "sector" in data: p.sector = data["sector"]
            if "status" in data: p.status = data["status"]
            if "budget" in data: p.budget = float(data["budget"])
            if "allocatedBudget" in data: p.budget = float(data["allocatedBudget"])
            if "progressPercentage" in data: p.progress_percentage = float(data["progressPercentage"])
            if "physicalProgressPercent" in data: p.progress_percentage = float(data["physicalProgressPercent"])
            if "agreementDateBs" in data: p.agreement_date_bs = data["agreementDateBs"]
            if "completionDateBs" in data: p.completion_date_bs = data["completionDateBs"]
            if "committeeName" in data: p.committee_name = data["committeeName"]
            if "committeeChair" in data: p.committee_chair = data["committeeChair"]
            if "committeeSecretary" in data: p.committee_secretary = data["committeeSecretary"]
            if "committeeTreasurer" in data: p.committee_treasurer = data["committeeTreasurer"]
            if "committeePhone" in data: p.committee_phone = data["committeePhone"]
            if "palikaGrant" in data: p.palika_grant = float(data["palikaGrant"])
            if "communityContribution" in data: p.community_contribution = float(data["communityContribution"])
            if "totalAgreementAmount" in data: p.total_agreement_amount = float(data["totalAgreementAmount"])
            if "paidAmount" in data: p.paid_amount = float(data["paidAmount"])
            if "financialProgress" in data: p.financial_progress = float(data["financialProgress"])
            if "agreementStatus" in data: p.agreement_status = data["agreementStatus"]
            if "responsibleEngineer" in data: p.responsible_engineer = data["responsibleEngineer"]
            if "engineerPhone" in data: p.engineer_phone = data["engineerPhone"]
            if "monitoringRecommendation" in data: p.monitoring_recommendation = data["monitoringRecommendation"]
            if "installmentDetails" in data: p.installment_details = data["installmentDetails"]
            if "monitoringRecords" in data: p.monitoring_records = data["monitoringRecords"]
            if "measurementBook" in data: p.measurement_book = data["measurementBook"]
            if "socialAudit" in data: p.social_audit = data["socialAudit"]
            if "farfarakDetails" in data: p.farfarak_details = data["farfarakDetails"]
            db.commit()
            return _to_camel_project(p)
    except Exception:
        pass

    if "panchpokhari" in ctx.allowed_tenant_ids or ctx.is_all:
        for p in INITIAL_PROJECTS:
            if p["id"] == id or p.get("projectCode") == id or p.get("project_code") == id:
                p.update(data)
                return _to_camel_project(p)

    raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/{id}")
def delete_project(
    id: str, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """Delete a project record"""
    try:
        query = db.query(Project).filter((Project.id == id) | (Project.project_code == id))
        query = ctx.filter_query(query, Project)
        p = query.first()
        if p:
            db.delete(p)
            db.commit()
            return {"success": True, "message": "Project deleted successfully"}
    except Exception:
        pass

    if "panchpokhari" in ctx.allowed_tenant_ids or ctx.is_all:
        global INITIAL_PROJECTS
        INITIAL_PROJECTS = [p for p in INITIAL_PROJECTS if p["id"] != id and p.get("projectCode") != id]
        return {"success": True, "message": "Project deleted successfully"}

    raise HTTPException(status_code=404, detail="Project not found")

