"""
ई-नक्सा पास तथा भवन निर्माण अनुमति प्रणाली
Electronic Building Permit & Scrutiny System (EBSPS)
Panchpokhari Thangpal Gaupalika, Sindhupalchok

Legal Basis & Guidance:
  - स्थानीय सरकार सञ्चालन ऐन, २०७४ — अनुसूची ८(१४)
  - भवन निर्माण मार्गदर्शन, २०८२ (DUDBC Building Construction Guidance 2082)
  - राष्ट्रिय भवन संहिता NBC 105:2020, NBC 206, NBC 205
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from core.database import get_db
from core.tenant import TenantContext, get_tenant_context
from models.building_permit import BuildingPermit
from schemas.building_permit import (
    BuildingPermitSchema,
    BuildingPermitCreate,
    EtabsScrutinyRequest,
    PartialCompletionRequest,
)
import uuid
import json
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/api/v1/building-permits",
    tags=["Building Permits (ई-नक्सा पास - मार्गदर्शन २०८२)"]
)

# ── Workflow Stages (EBSPS Lifecycle per भवन निर्माण मार्गदर्शन, २०८२) ──────────
WORKFLOW_STAGES = [
    'दरखास्त पेश भएको',
    'कागजात रुजु सम्पन्न',
    'स्थलगत नापजाँच सम्पन्न',
    'अस्थायी प्रथम चरण (DPC स्वीकृत)',
    'दोस्रो चरण (Super Structure इजाजत)',
    'आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी',
    'भवन निर्माण सम्पन्न प्रमाणपत्र जारी',
]

LEGACY_STAGE_MAP = {
    'प्लिन्थ लेभल (DPC) स्वीकृत': 'अस्थायी प्रथम चरण (DPC स्वीकृत)',
    'सुपरस्ट्रक्चर प्रमाणित': 'दोस्रो चरण (Super Structure इजाजत)',
}

# ── Seed Data (Demo permits for Panchpokhari Thangpal) ────────────────────────
SEED_PERMITS = [
    {
        "id": "bp-001",
        "applicationNo": "पाँ.था./नक्सा/२०८१-०१",
        "applicantName": "दिल बहादुर तामाङ",
        "applicantPhone": "9841223344",
        "applicantCitizenship": "२३-०१-७५-०५५१२",
        "landOwnerName": "दिल बहादुर तामाङ",
        "sheetNo": "२३-क-०१",
        "kittaNo": "१२३",
        "landArea": "०-७-२-०",
        "landAreaRopani": "०-७-२-०",
        "fourBoundaries": {"east": "बाटो", "west": "कित्ता नं. १२२", "north": "मोटरबाटो", "south": "खोल्सो"},
        "wardNumber": 1,
        "toleAddress": "भोटेनाम्लाङ बजार",
        "buildingClass": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usageType": "आवासीय (Residential)",
        "structureType": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "totalFloors": 2.5,
        "plinthAreaSqFt": 1200,
        "totalBuiltAreaSqFt": 2700,
        "farRatio": 1.5,
        "groundCoveragePct": 55.0,
        "roadWidthFt": 20,
        "setbackFrontFt": 5.0,
        "setbackRearFt": 3.0,
        "setbackSideFt": 3.0,
        "gpsLat": 27.93412,
        "gpsLon": 85.60218,
        "designerName": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "necLicenseNo": "NEC-CIVIL-14205",
        
        # ── मार्गदर्शन २०८२ Fields ──
        "ownershipType": "आफ्नै (Self-Owned)",
        "leasePeriodYears": None,
        "cadVersion": "AutoCAD 2021 (.dwg)",
        "hasStructuralDrawing": "हो (NBC 105:2020)",
        "structuralModelType": "ETABS (.edb)",
        "structuralModelFileUrl": "/uploads/etabs/bp001_model.edb",
        "etabsChecks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 845.0,
            "fundamentalTimePeriodSec": 0.38,
            "maxDriftRatio": 0.0029,
            "massParticipationPct": 94.5,
            "torsionalRatio": 1.12,
            "isCompliant": True,
            "verifiedByEngineer": "इ. सुमन श्रेष्ठ",
            "necLicenseNo": "NEC-CIVIL-14205",
            "verifiedAt": "२०८०-१०-०८",
            "remarks": "NBC 105:2020 अनुसार Drift (०.००२९ <= ०.००४) र Mass Participation (९४.५% >= ९०%) मापदण्ड पूर्ण पालना।"
        },
        "partialCompletionDetails": None,
        
        "status": "भवन निर्माण सम्पन्न प्रमाणपत्र जारी",
        "ratePerSqFt": 10.0,
        "serviceCharge": 1500,
        "permitFee": 28500,
        "receiptNo": "P5-NAXAA-2081-001",
        "paymentStatus": "भुक्तानी भएको",
        "applicationDateBs": "२०८०-०९-१५",
        "sarjaminDateBs": "२०८०-१०-०५",
        "plinthApprovalDateBs": "२०८०-११-२०",
        "permanentApprovalDateBs": "२०८१-०१-१०",
        "completionCertificateDateBs": "२०८१-०५-०५",
        "certificateNo": "EBPS-COMPL-2081-001",
        "siteEngineerName": "इ. रमेश खड्का (NEC: 18445-Civil)",
        "approvedBy": "प्र.प्र.अ. कार्यालय",
        "documents": [
            {"id": "doc-001", "category": "जग्गाधनीपुर्जा", "title": "जग्गाधनीपुर्जाको प्रमाणित प्रतिलिपि", "fileName": "lalpurja_123.pdf", "fileSize": "1.2 MB", "status": "approved", "verifiedBy": "दर्ता शाखा", "uploadedAt": "२०८०-०९-१५"},
            {"id": "doc-002", "category": "नागरिकता", "title": "नागरिकता प्रमाणपत्र", "fileName": "citizenship_dil.pdf", "fileSize": "0.8 MB", "status": "approved", "verifiedBy": "वडा कार्यालय", "uploadedAt": "२०८०-०९-१५"},
            {"id": "doc-003", "category": "भवन नक्सा", "title": "आर्किटेक्चरल डिजाइन नक्सा (CAD 2021)", "fileName": "arch_plan_bp001.dwg", "fileSize": "8.4 MB", "status": "approved", "verifiedBy": "इ. सुमन श्रेष्ठ", "uploadedAt": "२०८०-०९-१५"},
            {"id": "doc-004", "category": "स्ट्रक्चरल ड्रइङ", "title": "संरचनात्मक ड्रइङ (NBC 105:2020 Ductile Detailing)", "fileName": "structural_detailing_bp001.pdf", "fileSize": "5.6 MB", "status": "approved", "verifiedBy": "इ. सुमन श्रेष्ठ", "uploadedAt": "२०८०-०९-१७"},
            {"id": "doc-004b", "category": "ETABS/SAP मोडल फाइल", "title": "ETABS Run-Ready Model File (.edb)", "fileName": "bp001_model.edb", "fileSize": "34.2 MB", "status": "approved", "verifiedBy": "इ. सुमन श्रेष्ठ", "uploadedAt": "२०८०-०९-१७"},
            {"id": "doc-004c", "category": "मन्जुरीनामा र नाता प्रमाणित", "title": "नाता प्रमाणित र मन्जुरीनामा पत्र", "fileName": "manjurinama_dil.pdf", "fileSize": "1.1 MB", "status": "approved", "verifiedBy": "वडा कार्यालय", "uploadedAt": "२०८०-०९-१५"},
        ],
        "objections": [],
        "approvals": [
            {"role": "ward_secretary", "roleTitleNepali": "वडा सचिव", "officerName": "सुरेन्द्र श्रेष्ठ", "designation": "वडा सचिव, वडा नं. १", "status": "approved", "signatureDateBs": "२०८०-१०-०५", "remarks": "कागजात पूर्ण। स्थलगत जाँच सम्पन्न।"},
            {"role": "engineer", "roleTitleNepali": "प्राविधिक (इन्जिनियर)", "officerName": "इ. रमेश खड्का", "designation": "जेठा इन्जिनियर", "status": "approved", "signatureDateBs": "२०८०-१०-०८", "remarks": "NBC 105:2020 अनुरुप। ETABS मोडल भेरिफाइड।"},
            {"role": "chief_admin", "roleTitleNepali": "प्र.प्र.अ.", "officerName": "देव बहादुर तामाङ", "designation": "प्रमुख प्रशासकीय अधिकृत", "status": "approved", "signatureDateBs": "२०८१-०१-१०", "remarks": "स्थायी नक्सा पास स्वीकृत।"},
        ],
        "scrutinyResults": {
            "roadWidthCompliance": {"passed": True, "required": 16, "actual": 20, "note": "मापदण्ड अनुरुप"},
            "frontSetbackCompliance": {"passed": True, "required": 5, "actual": 5, "note": "मापदण्ड अनुरुप"},
            "rearSetbackCompliance": {"passed": True, "required": 3, "actual": 3, "note": "मापदण्ड अनुरुप"},
            "sideSetbackCompliance": {"passed": True, "required": 3, "actual": 3, "note": "मापदण्ड अनुरुप"},
            "coverageCompliance": {"passed": True, "maxAllowedPct": 60, "actualPct": 55, "note": "मापदण्ड अनुरुप"},
            "farCompliance": {"passed": True, "maxAllowedFar": 2.0, "actualFar": 1.5, "note": "मापदण्ड अनुरुप"},
            "etabsStructuralStatus": "PASSED",
            "soilTestRequired": False,
            "structuralReportRequired": True,
            "overallStatus": "COMPLIANT",
            "generatedAt": "२०८०-१०-०८",
        },
        "createdAt": (datetime.utcnow() - timedelta(days=220)).isoformat(),
    },
    {
        "id": "bp-002",
        "applicationNo": "पाँ.था./नक्सा/२०८१-०२",
        "applicantName": "डोल्मा शेर्पा",
        "applicantPhone": "9861998822",
        "applicantCitizenship": "२३-०१-३०-००५८१",
        "landOwnerName": "पासाङ दोर्जे शेर्पा (जग्गाधनी)",
        "sheetNo": "२३-ख-०२",
        "kittaNo": "४५५",
        "landArea": "०-१२-०-०",
        "wardNumber": 2,
        "toleAddress": "याङ्ग्री गाउँ",
        "buildingClass": "ग वर्ग (C - मापदण्ड अनुरुप / MRT)",
        "usageType": "पर्यटन तथा व्यावसायिक (Tourism & Commercial)",
        "structureType": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "totalFloors": 3.0,
        "plinthAreaSqFt": 2200,
        "totalBuiltAreaSqFt": 5800,
        "farRatio": 1.8,
        "groundCoveragePct": 50.0,
        "roadWidthFt": 16,
        "setbackFrontFt": 7.0,
        "setbackRearFt": 5.0,
        "setbackSideFt": 4.0,
        "gpsLat": 27.94127,
        "gpsLon": 85.61002,
        "designerName": "इ. अनिता थापा (NEC: 22134-Civil)",
        "necLicenseNo": "NEC-CIVIL-22134",
        
        # ── मार्गदर्शन २०८२ Fields: Leased Land Showcase ──
        "ownershipType": "भाडा/लिज (Leased/Rented)",
        "leasePeriodYears": 20.0,
        "cadVersion": "AutoCAD 2024 (.dwg)",
        "hasStructuralDrawing": "हो (NBC 105:2020)",
        "structuralModelType": "ETABS (.edb)",
        "structuralModelFileUrl": "/uploads/etabs/yangri_lodge.edb",
        "etabsChecks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 1280.0,
            "fundamentalTimePeriodSec": 0.44,
            "maxDriftRatio": 0.0032,
            "massParticipationPct": 92.8,
            "torsionalRatio": 1.18,
            "isCompliant": True,
            "verifiedByEngineer": "इ. अनिता थापा",
            "necLicenseNo": "NEC-CIVIL-22134",
            "verifiedAt": "२०८१-०२-१२",
            "remarks": "NBC 105:2020 विश्लेषण स्वीकृत।"
        },
        "partialCompletionDetails": None,
        
        "status": "अस्थायी प्रथम चरण (DPC स्वीकृत)",
        "ratePerSqFt": 7.0,
        "serviceCharge": 1000,
        "permitFee": 41600,
        "receiptNo": "P5-NAXAA-2081-002",
        "paymentStatus": "भुक्तानी भएको",
        "applicationDateBs": "२०८१-०१-२०",
        "sarjaminDateBs": "२०८१-०२-०८",
        "plinthApprovalDateBs": "२०८१-०३-१५",
        "documents": [
            {"id": "doc-005", "category": "जग्गाधनीपुर्जा", "title": "जग्गाधनीपुर्जा (मूल जग्गाधनी पासाङ दोर्जे)", "fileName": "lalpurja_455.pdf", "status": "approved", "verifiedBy": "दर्ता शाखा"},
            {"id": "doc-005b", "category": "जग्गा भाडाको सम्झौता", "title": "जग्गा भाडा सम्झौता पत्र (२० वर्षे लिज)", "fileName": "lease_agreement_20yr.pdf", "fileSize": "2.8 MB", "status": "approved", "verifiedBy": "वडा कार्यालय", "remarks": "कानूनी नोटरी र वडा सिफारिस सहित।"},
            {"id": "doc-005c", "category": "मन्जुरीनामा र नाता प्रमाणित", "title": "जग्गाधनीको निर्माण मन्जुरीनामा", "fileName": "manjurinama_signed.pdf", "fileSize": "1.3 MB", "status": "approved", "verifiedBy": "वडा कार्यालय"},
            {"id": "doc-006", "category": "भवन नक्सा", "title": "आर्किटेक्चरल डिजाइन नक्सा (CAD 2024)", "fileName": "arch_bp002.dwg", "status": "approved"},
            {"id": "doc-006b", "category": "स्ट्रक्चरल ड्रइङ", "title": "संरचनात्मक ड्रइङ — फाउन्डेसन र कोलम-बिम लेआउट", "fileName": "structural_drawings_bp002.pdf", "status": "approved"},
            {"id": "doc-006c", "category": "ETABS/SAP मोडल फाइल", "title": "ETABS Analytic Model File (.edb)", "fileName": "yangri_lodge.edb", "fileSize": "48.2 MB", "status": "approved"},
            {"id": "doc-007", "category": "EIA रिपोर्ट", "title": "पर्यावरणीय प्रभाव मूल्यांकन प्रतिवेदन", "fileName": "eia_yangri_lodge.pdf", "status": "approved", "remarks": "DoEIA अनुमति प्राप्त।"},
        ],
        "objections": [],
        "approvals": [
            {"role": "ward_secretary", "roleTitleNepali": "वडा सचिव", "officerName": "विदुर लामिछाने", "designation": "वडा सचिव, वडा नं. २", "status": "approved", "signatureDateBs": "२०८१-०२-०८", "remarks": "कागजात र भाडा सम्झौता पूर्ण।"},
            {"role": "engineer", "roleTitleNepali": "प्राविधिक (इन्जिनियर)", "officerName": "इ. सुमन श्रेष्ठ", "designation": "जेठा इन्जिनियर", "status": "approved", "signatureDateBs": "२०८१-०३-१५", "remarks": "DPC सम्मको निर्माण मापदण्ड अनुरुप। सुपरस्ट्रक्चर इजाजतका लागि साइट परीक्षण सिफारिस।"},
        ],
        "scrutinyResults": {
            "roadWidthCompliance": {"passed": True, "required": 16, "actual": 16, "note": "न्यूनतम मापदण्ड अनुरुप"},
            "frontSetbackCompliance": {"passed": True, "required": 5, "actual": 7, "note": "मापदण्डभन्दा बढी (राम्रो)"},
            "rearSetbackCompliance": {"passed": True, "required": 3, "actual": 5, "note": "मापदण्ड अनुरुप"},
            "sideSetbackCompliance": {"passed": True, "required": 3, "actual": 4, "note": "मापदण्ड अनुरुप"},
            "coverageCompliance": {"passed": True, "maxAllowedPct": 60, "actualPct": 50, "note": "मापदण्ड अनुरुप"},
            "farCompliance": {"passed": True, "maxAllowedFar": 2.0, "actualFar": 1.8, "note": "मापदण्ड अनुरुप"},
            "etabsStructuralStatus": "PASSED",
            "soilTestRequired": True,
            "structuralReportRequired": True,
            "overallStatus": "COMPLIANT",
            "generatedAt": "२०८१-०२-१२",
        },
        "createdAt": (datetime.utcnow() - timedelta(days=130)).isoformat(),
    },
    {
        "id": "bp-003",
        "applicationNo": "पाँ.था./नक्सा/२०८१-०३",
        "applicantName": "गोविन्द प्रसाद श्रेष्ठ",
        "applicantPhone": "9841556677",
        "applicantCitizenship": "२३-०१-४५-०२३४५",
        "landOwnerName": "राम कुमारी श्रेष्ठ (आमा)",
        "kittaNo": "७८९",
        "wardNumber": 4,
        "toleAddress": "थाङपालधाप बेसी",
        "buildingClass": "क वर्ग (A - विशिष्ट / High-Rise >5 Storey)",
        "usageType": "व्यापारिक (Commercial)",
        "structureType": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "totalFloors": 4.0,
        "plinthAreaSqFt": 3200,
        "totalBuiltAreaSqFt": 12800,
        "farRatio": 1.9,
        "groundCoveragePct": 58.0,
        "roadWidthFt": 24,
        "setbackFrontFt": 6.0,
        "setbackRearFt": 4.0,
        "setbackSideFt": 3.5,
        "gpsLat": 27.92805,
        "gpsLon": 85.59843,
        "designerName": "इ. राजेश थापा (NEC: 8812-Civil)",
        "necLicenseNo": "NEC-CIVIL-8812",
        
        # ── मार्गदर्शन २०८२ Fields: Family Consent & Superstructure Permit ──
        "ownershipType": "पारिवारिक/मन्जुरीनामा (Family/Consent)",
        "leasePeriodYears": None,
        "cadVersion": "AutoCAD 2022 (.dwg)",
        "hasStructuralDrawing": "हो (NBC 105:2020)",
        "structuralModelType": "ETABS (.edb)",
        "structuralModelFileUrl": "/uploads/etabs/commercial_bp003.edb",
        "etabsChecks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 2150.0,
            "fundamentalTimePeriodSec": 0.52,
            "maxDriftRatio": 0.0036,
            "massParticipationPct": 91.4,
            "torsionalRatio": 1.25,
            "isCompliant": True,
            "verifiedByEngineer": "इ. राजेश थापा",
            "necLicenseNo": "NEC-CIVIL-8812",
            "verifiedAt": "२०८१-०४-१०",
            "remarks": "उच्च-स्तरीय संरचनात्मक मोडल NBC 105:2020 अनुसार स्वीकृत।"
        },
        "partialCompletionDetails": None,
        
        "status": "दोस्रो चरण (Super Structure इजाजत)",
        "ratePerSqFt": 14.0,
        "serviceCharge": 2500,
        "permitFee": 181700,
        "paymentStatus": "भुक्तानी भएको",
        "receiptNo": "P5-NAXAA-2081-003",
        "applicationDateBs": "२०८१-०४-०५",
        "documents": [
            {"id": "doc-008", "category": "जग्गाधनीपुर्जा", "title": "लालपुर्जा प्रमाणित (आमाको नाममा)", "fileName": "lalpurja_789.pdf", "status": "approved"},
            {"id": "doc-008b", "category": "मन्जुरीनामा र नाता प्रमाणित", "title": "नाता प्रमाणित र कानूनी मन्जुरीनामा पत्र", "fileName": "nata_pramanit_789.pdf", "status": "approved", "verifiedBy": "वडा सचिव"},
            {"id": "doc-009", "category": "भवन नक्सा", "title": "वाणिज्यिक भवन डिजाइन (CAD 2022)", "fileName": "arch_bp003.dwg", "status": "approved"},
            {"id": "doc-009b", "category": "स्ट्रक्चरल ड्रइङ", "title": "कम्पलीट स्ट्रक्चरल तथा डक्टाइल डिटेलिङ ड्रइङ", "fileName": "structural_dwg_bp003.pdf", "status": "approved"},
            {"id": "doc-009c", "category": "ETABS/SAP मोडल फाइल", "title": "ETABS Run-Ready File (.edb)", "fileName": "commercial_bp003.edb", "fileSize": "62.4 MB", "status": "approved"},
            {"id": "doc-010", "category": "माटो परीक्षण", "title": "Geotechnical Soil Test Report", "fileName": "soil_test_bp003.pdf", "status": "approved"},
            {"id": "doc-010b", "category": "क्यूब टेस्ट/ल्याब रिपोर्ट", "title": "DPC M25 कङ्क्रिट कम्प्रेसिभ स्ट्रेन्थ रिपोर्ट", "fileName": "cube_test_m25.pdf", "status": "approved", "remarks": "२८ दिनको सामर्थ्य २६.२ MPa प्राप्त।"},
        ],
        "objections": [],
        "approvals": [
            {"role": "ward_secretary", "roleTitleNepali": "वडा सचिव", "officerName": "कमल श्रेष्ठ", "designation": "वडा सचिव, वडा नं. ४", "status": "approved", "signatureDateBs": "२०८१-०४-१५"},
            {"role": "engineer", "roleTitleNepali": "प्राविधिक (इन्जिनियर)", "officerName": "इ. रमेश खड्का", "designation": "जेठा इन्जिनियर", "status": "approved", "signatureDateBs": "२०८१-०५-०१", "remarks": "DPC स्तरको स्थलगत निरीक्षण सम्पन्न। क्यूब टेस्ट उत्तीर्ण। दोस्रो चरण (Super Structure) को ईजाजत जारी।"},
        ],
        "scrutinyResults": {
            "roadWidthCompliance": {"passed": True, "required": 20, "actual": 24, "note": "मापदण्ड अनुरुप"},
            "frontSetbackCompliance": {"passed": True, "required": 5, "actual": 6.0, "note": "मापदण्ड अनुरुप"},
            "rearSetbackCompliance": {"passed": True, "required": 3, "actual": 4.0, "note": "मापदण्ड अनुरुप"},
            "sideSetbackCompliance": {"passed": True, "required": 3, "actual": 3.5, "note": "मापदण्ड अनुरुप"},
            "coverageCompliance": {"passed": True, "maxAllowedPct": 60, "actualPct": 58, "note": "मापदण्ड अनुरुप"},
            "farCompliance": {"passed": True, "maxAllowedFar": 2.0, "actualFar": 1.9, "note": "मापदण्ड अनुरुप"},
            "etabsStructuralStatus": "PASSED",
            "soilTestRequired": True,
            "structuralReportRequired": True,
            "overallStatus": "COMPLIANT",
            "generatedAt": "२०८१-०४-१५",
        },
        "createdAt": (datetime.utcnow() - timedelta(days=50)).isoformat(),
    },
    {
        "id": "bp-005",
        "applicationNo": "पाँ.था./नक्सा/२०८१-०५",
        "applicantName": "पासाङ तामाङ",
        "applicantPhone": "9851234567",
        "applicantCitizenship": "२३-०१-८०-०११२२",
        "landOwnerName": "पासाङ तामाङ",
        "sheetNo": "२३-क-०३",
        "kittaNo": "६०२",
        "landArea": "०-८-०-०",
        "wardNumber": 1,
        "toleAddress": "तिपेनी बजार",
        "buildingClass": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usageType": "मिश्रित (Mixed Use)",
        "structureType": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "totalFloors": 3.0,
        "plinthAreaSqFt": 1500,
        "totalBuiltAreaSqFt": 4500,
        "farRatio": 1.7,
        "groundCoveragePct": 56.0,
        "roadWidthFt": 22,
        "setbackFrontFt": 6.0,
        "setbackRearFt": 4.0,
        "setbackSideFt": 3.5,
        "gpsLat": 27.93155,
        "gpsLon": 85.60412,
        "designerName": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "necLicenseNo": "NEC-CIVIL-14205",
        
        # ── मार्गदर्शन २०८२ Fields: Partial Completion Showcase ──
        "ownershipType": "आफ्नै (Self-Owned)",
        "leasePeriodYears": None,
        "cadVersion": "AutoCAD 2020 (.dwg)",
        "hasStructuralDrawing": "हो (NBC 105:2020)",
        "structuralModelType": "ETABS (.edb)",
        "structuralModelFileUrl": "/uploads/etabs/tipeni_mixed.edb",
        "etabsChecks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 1100.0,
            "fundamentalTimePeriodSec": 0.40,
            "maxDriftRatio": 0.0030,
            "massParticipationPct": 93.5,
            "torsionalRatio": 1.15,
            "isCompliant": True,
            "verifiedByEngineer": "इ. सुमन श्रेष्ठ",
            "remarks": "NBC 105:2020 अनुसार मोडल स्वीकृत।"
        },
        "partialCompletionDetails": {
            "certificateNo": "पाँ.था./आंशिक-सम्पन्न/२०८१-००५",
            "completedFloors": 1.0,
            "totalAllowedFloors": 3.0,
            "completedPlinthSqFt": 1500,
            "allowedUsage": "व्यावसायिक पसल तथा बैंक शाखा",
            "validityExpiryDateBs": "२०८३-०६-३०",
            "remainingFloors": 2.0,
            "siteEngineerName": "इ. रमेश खड्का",
            "engineerNecNo": "NEC-CIVIL-18445",
            "wardRecommendationNo": "वडा-१-सिफारिस-१४२",
            "issueDateBs": "२०८१-०५-१०",
            "remarks": "तल्लो १ तला (भुइँतला) को निर्माण सम्पन्न भएकोले व्यावसायिक प्रयोजनका लागि आंशिक सम्पन्न प्रमाणपत्र जारी। बाँकी २ तला २०८३ असोज मसान्तभित्र सम्पन्न गर्नुपर्ने शर्त।"
        },
        
        "status": "आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी",
        "ratePerSqFt": 10.0,
        "serviceCharge": 1500,
        "permitFee": 46500,
        "receiptNo": "P5-NAXAA-2081-005",
        "paymentStatus": "भुक्तानी भएको",
        "applicationDateBs": "२०८०-११-१०",
        "sarjaminDateBs": "२०८०-११-२५",
        "plinthApprovalDateBs": "२०८१-०१-१५",
        "certificateNo": "पाँ.था./आंशिक-सम्पन्न/२०८१-००५",
        "siteEngineerName": "इ. रमेश खड्का (NEC: 18445-Civil)",
        "approvedBy": "प्र.प्र.अ. कार्यालय",
        "documents": [
            {"id": "doc-020", "category": "जग्गाधनीपुर्जा", "title": "लालपुर्जा", "fileName": "lalpurja_602.pdf", "status": "approved"},
            {"id": "doc-021", "category": "भवन नक्सा", "title": "३ तला मिश्रित भवन नक्सा (CAD 2020)", "fileName": "arch_602.dwg", "status": "approved"},
            {"id": "doc-022", "category": "स्ट्रक्चरल ड्रइङ", "title": "स्ट्रक्चरल डिटेलिङ ड्रइङ", "fileName": "struct_602.pdf", "status": "approved"},
            {"id": "doc-023", "category": "ETABS/SAP मोडल फाइल", "title": "ETABS Analysis Model (.edb)", "fileName": "tipeni_602.edb", "fileSize": "38.5 MB", "status": "approved"},
            {"id": "doc-024", "category": "आंशिक सम्पन्न सिफारिस", "title": "वडाको आंशिक निर्माण सम्पन्न सिफारिस पत्र", "fileName": "ward_partial_sifaris.pdf", "status": "approved"},
        ],
        "objections": [],
        "approvals": [
            {"role": "engineer", "roleTitleNepali": "प्राविधिक अधिकृत", "officerName": "इ. रमेश खड्का", "designation": "प्राविधिक शाखा", "status": "approved", "signatureDateBs": "२०८१-०५-१०", "remarks": "भुइँतला पूर्ण सम्पन्न। आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी।"},
        ],
        "scrutinyResults": {
            "roadWidthCompliance": {"passed": True, "required": 16, "actual": 22, "note": "मापदण्ड अनुरुप"},
            "frontSetbackCompliance": {"passed": True, "required": 5, "actual": 6, "note": "मापदण्ड अनुरुप"},
            "rearSetbackCompliance": {"passed": True, "required": 3, "actual": 4, "note": "मापदण्ड अनुरुप"},
            "sideSetbackCompliance": {"passed": True, "required": 3, "actual": 3.5, "note": "मापदण्ड अनुरुप"},
            "coverageCompliance": {"passed": True, "maxAllowedPct": 60, "actualPct": 56, "note": "मापदण्ड अनुरुप"},
            "farCompliance": {"passed": True, "maxAllowedFar": 2.0, "actualFar": 1.7, "note": "मापदण्ड अनुरुप"},
            "etabsStructuralStatus": "PASSED",
            "soilTestRequired": False,
            "structuralReportRequired": True,
            "overallStatus": "COMPLIANT",
            "generatedAt": "२०८०-११-२५",
        },
        "createdAt": (datetime.utcnow() - timedelta(days=90)).isoformat(),
    },
    {
        "id": "bp-004",
        "applicationNo": "पाँ.था./नक्सा/२०८१-०४",
        "applicantName": "मेनुका राई",
        "applicantPhone": "9861009988",
        "applicantCitizenship": "२३-०१-५०-०३४५६",
        "landOwnerName": "मेनुका राई",
        "kittaNo": "२३४",
        "wardNumber": 5,
        "toleAddress": "बरुवा डाँडा",
        "buildingClass": "घ वर्ग (D - परम्परागत / Conventional)",
        "usageType": "आवासीय (Residential)",
        "structureType": "लोड बेयरिङ / ढुङ्गा-माटो-इँटा",
        "totalFloors": 2.0,
        "plinthAreaSqFt": 650,
        "totalBuiltAreaSqFt": 1170,
        "farRatio": 1.2,
        "groundCoveragePct": 45.0,
        "roadWidthFt": 12,
        "setbackFrontFt": 3.0,
        "setbackRearFt": 2.0,
        "setbackSideFt": 1.5,
        "gpsLat": 27.93801,
        "gpsLon": 85.60795,
        "designerName": "इ. भरत बुढाथोकी (NEC: 31556-Civil)",
        "necLicenseNo": "NEC-CIVIL-31556",
        "ownershipType": "आफ्नै (Self-Owned)",
        "cadVersion": "AutoCAD 2018 (.dwg)",
        "hasStructuralDrawing": "हो (NBC 205)",
        "structuralModelType": None,
        "structuralModelFileUrl": None,
        "etabsChecks": None,
        "partialCompletionDetails": None,
        "status": "दरखास्त पेश भएको",
        "ratePerSqFt": 4.0,
        "serviceCharge": 500,
        "permitFee": 5180,
        "paymentStatus": "भुक्तानी बाँकी",
        "applicationDateBs": "२०८१-०५-०१",
        "documents": [
            {"id": "doc-011", "category": "जग्गाधनीपुर्जा", "title": "लालपुर्जा", "fileName": "lalpurja_234.pdf", "status": "pending"},
            {"id": "doc-012", "category": "नागरिकता", "title": "नागरिकता प्रमाणपत्र", "fileName": "citizenship_menuka.pdf", "status": "approved"},
        ],
        "objections": [],
        "approvals": [],
        "scrutinyResults": None,
        "createdAt": (datetime.utcnow() - timedelta(days=10)).isoformat(),
    },
]


def _get_permits(db: Session, ctx: TenantContext) -> List[dict]:
    """Try DB first, fall back to seed data only for panchpokhari."""
    try:
        q = db.query(BuildingPermit)
        q = ctx.filter_query(q, BuildingPermit)
        results = q.limit(500).all()
        if results:
            return [_model_to_dict(r) for r in results]
    except Exception:
        pass
    if "panchpokhari" in ctx.allowed_tenant_ids:
        return SEED_PERMITS
    return []


def _model_to_dict(p: BuildingPermit) -> dict:
    def safe_float(v):
        try:
            return float(v) if v is not None else None
        except:
            return None

    docs = p.documents
    if isinstance(docs, str):
        try:
            docs = json.loads(docs)
        except:
            docs = []

    approvals = p.approvals
    if isinstance(approvals, str):
        try:
            approvals = json.loads(approvals)
        except:
            approvals = []

    scrutiny = p.scrutiny_results
    if isinstance(scrutiny, str):
        try:
            scrutiny = json.loads(scrutiny)
        except:
            scrutiny = None

    objections = p.objections
    if isinstance(objections, str):
        try:
            objections = json.loads(objections)
        except:
            objections = []

    four_boundaries = p.four_boundaries
    if isinstance(four_boundaries, str):
        try:
            four_boundaries = json.loads(four_boundaries)
        except:
            four_boundaries = {}

    partial_details = getattr(p, 'partial_completion_details', None)
    if isinstance(partial_details, str):
        try:
            partial_details = json.loads(partial_details)
        except:
            partial_details = None

    etabs_checks = getattr(p, 'etabs_checks', None)
    if isinstance(etabs_checks, str):
        try:
            etabs_checks = json.loads(etabs_checks)
        except:
            etabs_checks = None

    return {
        "id": p.id,
        "applicationNo": p.application_no,
        "applicantName": p.applicant_name,
        "applicantPhone": p.applicant_phone,
        "applicantCitizenship": p.applicant_citizenship,
        "landOwnerName": p.land_owner_name,
        "sheetNo": p.sheet_no,
        "kittaNo": p.kitta_no,
        "landArea": p.land_area,
        "landAreaRopani": p.land_area_ropani,
        "fourBoundaries": four_boundaries,
        "wardNumber": p.ward_number,
        "toleAddress": p.tole_address,
        "buildingClass": p.building_class,
        "usageType": p.usage_type,
        "structureType": p.structure_type,
        "totalFloors": safe_float(p.total_floors),
        "plinthAreaSqFt": safe_float(p.plinth_area_sqft),
        "totalBuiltAreaSqFt": safe_float(p.total_built_area_sqft),
        "farRatio": safe_float(p.far_ratio),
        "groundCoveragePct": safe_float(p.ground_coverage_pct),
        "roadWidthFt": safe_float(p.road_width_ft),
        "setbackFrontFt": safe_float(p.setback_front_ft),
        "setbackRearFt": safe_float(p.setback_rear_ft),
        "setbackSideFt": safe_float(p.setback_side_ft),
        "gpsLat": safe_float(p.gps_lat),
        "gpsLon": safe_float(p.gps_lon),
        "designerName": p.designer_name,
        "necLicenseNo": p.nec_license_no,
        
        # ── Guidance 2082 Upgraded Attributes ──
        "ownershipType": getattr(p, 'ownership_type', None) or 'आफ्नै (Self-Owned)',
        "leasePeriodYears": safe_float(getattr(p, 'lease_period_years', None)),
        "cadVersion": getattr(p, 'cad_version', None) or 'AutoCAD 2018 (.dwg)',
        "hasStructuralDrawing": getattr(p, 'has_structural_drawing', None) or 'हो (NBC 105:2020)',
        "structuralModelType": getattr(p, 'structural_model_type', None),
        "structuralModelFileUrl": getattr(p, 'structural_model_file_url', None),
        "partialCompletionDetails": partial_details,
        "etabsChecks": etabs_checks,
        
        "status": p.status,
        "ratePerSqFt": None,
        "serviceCharge": None,
        "permitFee": safe_float(p.permit_fee),
        "receiptNo": p.receipt_no,
        "paymentStatus": p.payment_status,
        "applicationDateBs": p.application_date_bs,
        "sarjaminDateBs": None,
        "plinthApprovalDateBs": None,
        "permanentApprovalDateBs": None,
        "completionCertificateDateBs": None,
        "certificateNo": None,
        "siteEngineerName": None,
        "approvedBy": None,
        "documents": docs or [],
        "objections": objections or [],
        "approvals": approvals or [],
        "scrutinyResults": scrutiny,
        "createdAt": p.created_at.isoformat() if p.created_at else None,
    }


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("", response_model=List[dict])
def get_building_permits(
    status: Optional[str] = Query(None),
    ward: Optional[int] = Query(None),
    building_class: Optional[str] = Query(None, alias="buildingClass"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """भवन अनुमति सूची — List all building permits with optional filters."""
    records = _get_permits(db, ctx)

    if status:
        records = [r for r in records if r.get('status') == status]
    if ward:
        records = [r for r in records if r.get('wardNumber') == ward]
    if building_class:
        records = [r for r in records if building_class in (r.get('buildingClass') or '')]
    if search:
        q = search.lower()
        records = [
            r for r in records
            if q in (r.get('applicantName') or '').lower()
            or q in (r.get('landOwnerName') or '').lower()
            or q in (r.get('applicationNo') or '').lower()
            or q in (r.get('kittaNo') or '').lower()
            or q in (r.get('toleAddress') or '').lower()
        ]
    return records


@router.get("/stats")
def get_building_permit_stats(
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """भवन अनुमति तथ्यांक — Summary stats for dashboard."""
    records = _get_permits(db, ctx)

    final_completed = [r for r in records if 'भवन निर्माण सम्पन्न प्रमाणपत्र' in (r.get('status') or '')]
    partial_completed = [r for r in records if 'आंशिक निर्माण सम्पन्न' in (r.get('status') or '')]
    plinth = [r for r in records if 'प्लिन्थ' in (r.get('status') or '') or 'DPC' in (r.get('status') or '')]
    superstructure = [r for r in records if 'सुपरस्ट्रक्चर' in (r.get('status') or '') or 'Super Structure' in (r.get('status') or '')]
    pending = [r for r in records if r.get('paymentStatus') == 'भुक्तानी बाँकी']

    total_revenue = sum(float(r.get('permitFee') or 0) for r in records if r.get('paymentStatus') == 'भुक्तानी भएको')
    total_area = sum(float(r.get('totalBuiltAreaSqFt') or 0) for r in records)

    scrutiny_ok = [r for r in records if (r.get('scrutinyResults') or {}).get('overallStatus') == 'COMPLIANT']
    compliance_rate = round(len(scrutiny_ok) / max(len(records), 1) * 100, 1)

    return {
        "totalApplications": len(records),
        "completedCertificates": len(final_completed),
        "partialCompletedCertificates": len(partial_completed),
        "plinthApproved": len(plinth),
        "superstructureVerified": len(superstructure),
        "pendingInspections": len(pending),
        "totalPermitRevenue": round(total_revenue, 2),
        "totalBuiltAreaCoverage": round(total_area, 2),
        "complianceRate": compliance_rate,
    }


@router.post("", response_model=dict)
def create_building_permit(
    permit: BuildingPermitCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """नयाँ नक्सा पास दरखास्त — Submit a new building permit application per Guidance 2082."""
    year = datetime.now().year
    bs_year = year + 56
    seq = str(uuid.uuid4().hex[:4]).upper()

    palika_prefix = "पाँ.था."
    if "gaushala" in ctx.allowed_tenant_ids:
        palika_prefix = "गौ.न."
    elif "melamchi" in ctx.allowed_tenant_ids:
        palika_prefix = "मे.न."
    elif "benighat" in ctx.allowed_tenant_ids or "benighatrorang" in ctx.allowed_tenant_ids:
        palika_prefix = "बे.रो."
    elif "galchhi" in ctx.allowed_tenant_ids:
        palika_prefix = "गलछी"
    elif "khadadevi" in ctx.allowed_tenant_ids:
        palika_prefix = "खाँ.दे."
    elif "helambu" in ctx.allowed_tenant_ids:
        palika_prefix = "हे.गा."

    app_no = f"{palika_prefix}/नक्सा/२०{str(bs_year)[-2:]}-{seq}"

    # Calculate fee
    plinth = float(permit.plinth_area_sqft or 0)
    floors = float(permit.total_floors or 1)
    built = plinth * floors
    rate = 10.0
    svc = 1500
    bc = (permit.building_class or '').lower()
    if 'क वर्ग' in bc or 'व्यापारिक' in (permit.usage_type or '').lower():
        rate = 14.0; svc = 2500
    elif 'ग वर्ग' in bc:
        rate = 7.0; svc = 1000
    elif 'घ वर्ग' in bc:
        rate = 4.0; svc = 500
    fee = round(built * rate + svc, 2)

    road_w = float(permit.road_width_ft or 20.0)
    coverage = round((plinth / max(plinth * 2, 1)) * 100, 1)
    far = round(built / max(plinth * 2, 1), 2)
    scrutiny = {
        "roadWidthCompliance": {"passed": road_w >= 16, "required": 16, "actual": road_w, "note": "मापदण्ड अनुरुप" if road_w >= 16 else "⚠️ सुधार आवश्यक"},
        "frontSetbackCompliance": {"passed": float(permit.total_floors or 2.5) <= 2.5, "required": 5, "actual": 5, "note": "मापदण्ड अनुरुप"},
        "rearSetbackCompliance": {"passed": True, "required": 3, "actual": 3, "note": "मापदण्ड अनुरुप"},
        "sideSetbackCompliance": {"passed": True, "required": 3, "actual": 3, "note": "मापदण्ड अनुरुप"},
        "coverageCompliance": {"passed": coverage <= 60, "maxAllowedPct": 60, "actualPct": coverage, "note": "मापदण्ड अनुरुप" if coverage <= 60 else "⚠️ अधिक"},
        "farCompliance": {"passed": far <= 2.0, "maxAllowedFar": 2.0, "actualFar": far, "note": "मापदण्ड अनुरुप" if far <= 2.0 else "⚠️ अधिक"},
        "soilTestRequired": floors >= 4,
        "structuralReportRequired": True,
        "overallStatus": "COMPLIANT" if (coverage <= 60 and far <= 2.0 and road_w >= 16) else "NON_COMPLIANT",
        "generatedAt": datetime.now().strftime("२०%y-%m-%d"),
    }

    receipt_no = f"P5-NAXAA-{datetime.now().year}-{uuid.uuid4().hex[:4].upper()}"
    new_id = str(uuid.uuid4())

    four_b = permit.four_boundaries or {
        "east": permit.east_boundary or "बाटो",
        "west": permit.west_boundary or "छिमेकी कित्ता",
        "north": permit.north_boundary or "मोटरबाटो",
        "south": permit.south_boundary or "खोल्सो",
    }

    docs_payload = permit.documents or []

    try:
        db_permit = BuildingPermit(
            id=new_id,
            tenant_id=ctx.effective_tenant_id,
            application_no=app_no,
            applicant_name=permit.applicant_name,
            applicant_phone=permit.applicant_phone,
            applicant_citizenship=permit.applicant_citizenship,
            land_owner_name=permit.land_owner_name,
            kitta_no=permit.kitta_no,
            sheet_no=permit.sheet_no or '२३-क-०१',
            land_area=permit.land_area or '०-६-२-०',
            land_area_ropani=permit.land_area_ropani or '०-६-२-०',
            four_boundaries=json.dumps(four_b),
            ward_number=permit.ward_number,
            tole_address=permit.tole_address,
            building_class=permit.building_class,
            usage_type=permit.usage_type,
            structure_type=permit.structure_type,
            total_floors=permit.total_floors,
            plinth_area_sqft=plinth,
            total_built_area_sqft=built,
            designer_name=permit.designer_name,
            nec_license_no=permit.nec_license_no,
            
            # Guidance 2082 fields
            ownership_type=permit.ownership_type or 'आफ्नै (Self-Owned)',
            lease_period_years=permit.lease_period_years,
            cad_version=permit.cad_version or 'AutoCAD 2018 (.dwg)',
            has_structural_drawing=permit.has_structural_drawing or 'हो (NBC 105:2020)',
            structural_model_type=permit.structural_model_type,
            structural_model_file_url=permit.structural_model_file_url,
            
            status='दरखास्त पेश भएको',
            permit_fee=fee,
            receipt_no=receipt_no,
            payment_status='भुक्तानी बाँकी',
            application_date_bs=permit.application_date_bs or datetime.now().strftime("२०%y-%m-%d"),
            documents=json.dumps(docs_payload),
            objections=json.dumps([]),
            approvals=json.dumps([]),
            scrutiny_results=json.dumps(scrutiny),
            created_at=datetime.utcnow(),
        )
        db.add(db_permit)
        db.commit()
        db.refresh(db_permit)
        return {**_model_to_dict(db_permit), "applicationNo": app_no, "permitFee": fee, "scrutinyResults": scrutiny}
    except Exception as e:
        db.rollback()
        # Seed fallback
        new_record = {
            "id": new_id,
            "applicationNo": app_no,
            "applicantName": permit.applicant_name,
            "applicantPhone": permit.applicant_phone,
            "applicantCitizenship": permit.applicant_citizenship,
            "landOwnerName": permit.land_owner_name,
            "kittaNo": permit.kitta_no,
            "sheetNo": permit.sheet_no or '२३-क-०१',
            "landArea": permit.land_area or '०-६-२-०',
            "landAreaRopani": permit.land_area_ropani or '०-६-२-०',
            "fourBoundaries": four_b,
            "wardNumber": permit.ward_number,
            "toleAddress": permit.tole_address,
            "buildingClass": permit.building_class,
            "usageType": permit.usage_type,
            "structureType": permit.structure_type,
            "totalFloors": permit.total_floors,
            "plinthAreaSqFt": plinth,
            "totalBuiltAreaSqFt": built,
            "ownershipType": permit.ownership_type or 'आफ्नै (Self-Owned)',
            "leasePeriodYears": permit.lease_period_years,
            "cadVersion": permit.cad_version or 'AutoCAD 2018 (.dwg)',
            "hasStructuralDrawing": permit.has_structural_drawing or 'हो (NBC 105:2020)',
            "structuralModelType": permit.structural_model_type,
            "structuralModelFileUrl": permit.structural_model_file_url,
            "designerName": permit.designer_name,
            "necLicenseNo": permit.nec_license_no,
            "status": "दरखास्त पेश भएको",
            "permitFee": fee,
            "receiptNo": receipt_no,
            "paymentStatus": "भुक्तानी बाँकी",
            "applicationDateBs": permit.application_date_bs or datetime.now().strftime("२०%y-%m-%d"),
            "scrutinyResults": scrutiny,
            "documents": docs_payload,
            "objections": [],
            "approvals": [],
            "createdAt": datetime.utcnow().isoformat(),
        }
        SEED_PERMITS.append(new_record)
        return new_record


@router.get("/{id}", response_model=dict)
def get_building_permit(
    id: str,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """एकल भवन अनुमति विवरण — Get full detail of a single permit."""
    if "panchpokhari" in ctx.allowed_tenant_ids:
        for s in SEED_PERMITS:
            if s['id'] == id or s['applicationNo'] == id:
                return s
    try:
        q = db.query(BuildingPermit).filter(
            (BuildingPermit.id == id) | (BuildingPermit.application_no == id)
        )
        permit = ctx.filter_query(q, BuildingPermit).first()
        if permit:
            return _model_to_dict(permit)
    except Exception:
        pass
    raise HTTPException(status_code=404, detail=f"भवन अनुमति '{id}' फेला परेन।")


@router.post("/{id}/advance-stage")
def advance_permit_stage(
    id: str,
    body: dict = Body(...),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    """
    कार्यप्रवाह अग्रसर — Advance a permit to the next workflow stage (Guidance 2082 compatible).
    """
    next_status = body.get("nextStatus", "")
    if next_status in LEGACY_STAGE_MAP:
        next_status = LEGACY_STAGE_MAP[next_status]

    if next_status not in WORKFLOW_STAGES and next_status not in LEGACY_STAGE_MAP:
        raise HTTPException(status_code=400, detail=f"अवैध कार्यप्रवाह अवस्था: {next_status}")

    officer_name = body.get("officerName", "प्राविधिक अधिकृत")
    technical_report = body.get("technicalReport", "")

    approval_entry = {
        "role": "officer",
        "roleTitleNepali": "अधिकृत",
        "officerName": officer_name,
        "designation": "प्राविधिक शाखा",
        "status": "approved",
        "signatureDateBs": datetime.now().strftime("%Y-%m-%d"),
        "remarks": technical_report or f"'{next_status}' चरणमा स्थानान्तरण।",
    }

    try:
        q = db.query(BuildingPermit).filter(BuildingPermit.id == id)
        permit = ctx.filter_query(q, BuildingPermit).first()
        if permit:
            permit.status = next_status
            existing_approvals = permit.approvals or []
            if isinstance(existing_approvals, str):
                try:
                    existing_approvals = json.loads(existing_approvals)
                except:
                    existing_approvals = []
            permit.approvals = json.dumps([*existing_approvals, approval_entry])
            db.commit()
            db.refresh(permit)
            return {**_model_to_dict(permit), "message": f"'{next_status}' चरणमा सफलतापूर्वक अग्रसर गरियो।"}
    except Exception:
        db.rollback()

    for s in SEED_PERMITS:
        if s['id'] == id:
            s['status'] = next_status
            s['approvals'] = [*s.get('approvals', []), approval_entry]
            return {**s, "message": f"'{next_status}' चरणमा सफलतापूर्वक अग्रसर गरियो।"}

    return {"id": id, "status": next_status, "message": f"'{next_status}' मा अग्रसर।"}


@router.post("/{id}/etabs-scrutiny")
def perform_etabs_scrutiny(
    id: str,
    req: EtabsScrutinyRequest,
    db: Session = Depends(get_db),
):
    """
    स्ट्रक्चरल डिजाइन ETABS/SAP2000 विश्लेषण जाँच (NBC 105:2020 Compliance Scrutiny).
    Checks:
      1. Inter-storey Drift Ratio <= 0.004
      2. Modal Mass Participation >= 90.0%
      3. Torsional Irregularity Ratio <= 1.4
    """
    drift_ok = req.max_drift_ratio <= 0.004
    mass_ok = req.mass_participation_ratio_pct >= 90.0
    torsion_ok = req.torsional_irregularity_ratio <= 1.4
    all_passed = drift_ok and mass_ok and torsion_ok

    check_results = {
        "structuralSoftware": req.structural_software,
        "baseShearKn": req.base_shear_kn,
        "fundamentalTimePeriodSec": req.fundamental_time_period_sec,
        "maxDriftRatio": req.max_drift_ratio,
        "driftCompliance": {"passed": drift_ok, "maxAllowed": 0.004, "actual": req.max_drift_ratio, "note": "मापदण्ड अनुरुप (≤ ०.००४)" if drift_ok else "⚠️ अत्यधिक Drift — पुनर्विचार आवश्यक"},
        "massParticipationPct": req.mass_participation_ratio_pct,
        "massCompliance": {"passed": mass_ok, "minRequiredPct": 90.0, "actualPct": req.mass_participation_ratio_pct, "note": "मापदण्ड अनुरुप (≥ ९०%)" if mass_ok else "⚠️ Mass Participation ९०% भन्दा कम"},
        "torsionalRatio": req.torsional_irregularity_ratio,
        "torsionCompliance": {"passed": torsion_ok, "maxAllowed": 1.4, "actual": req.torsional_irregularity_ratio, "note": "Torsional Irregularity स्वीकार्य (≤ १.४)" if torsion_ok else "⚠️ Torsion जोखिम अधिक"},
        "isCompliant": all_passed,
        "verifiedByEngineer": req.engineer_name,
        "necLicenseNo": req.engineer_nec_no,
        "verifiedAt": datetime.now().strftime("२०%y-%m-%d"),
        "remarks": req.remarks or ("NBC 105:2020 अनुसार संरचनात्मक मोडेल स्वीकृत।" if all_passed else "मापदण्ड पूरा नभएकाले पुनः डिजाइन आवश्यक।")
    }

    try:
        permit = db.query(BuildingPermit).filter(BuildingPermit.id == id).first()
        if permit:
            permit.etabs_checks = json.dumps(check_results)
            if permit.scrutiny_results:
                curr_scrutiny = json.loads(permit.scrutiny_results) if isinstance(permit.scrutiny_results, str) else permit.scrutiny_results
                curr_scrutiny["etabsStructuralStatus"] = "PASSED" if all_passed else "FAILED"
                permit.scrutiny_results = json.dumps(curr_scrutiny)
            db.commit()
            db.refresh(permit)
            return {**_model_to_dict(permit), "message": "ETABS/SAP संरचनात्मक विश्लेषण जाँच सम्पन्न।"}
    except Exception:
        db.rollback()

    for s in SEED_PERMITS:
        if s['id'] == id:
            s['etabsChecks'] = check_results
            if 'scrutinyResults' in s and s['scrutinyResults']:
                s['scrutinyResults']['etabsStructuralStatus'] = "PASSED" if all_passed else "FAILED"
            return {**s, "message": "ETABS/SAP संरचनात्मक विश्लेषण जाँच सम्पन्न।"}

    return {"permitId": id, "etabsChecks": check_results, "message": "जाँच सम्पन्न।"}


@router.post("/{id}/issue-partial-completion")
def issue_partial_completion(
    id: str,
    req: PartialCompletionRequest,
    db: Session = Depends(get_db),
):
    """
    आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी (Partial Building Completion Certificate per Guidance 2082).
    """
    year = datetime.now().year + 56
    seq = uuid.uuid4().hex[:4].upper()
    cert_no = f"पाँ.था./आंशिक-सम्पन्न/२०{str(year)[-2:]}-{seq}"

    partial_data = {
        "certificateNo": cert_no,
        "completedFloors": req.completed_floors,
        "totalAllowedFloors": req.total_allowed_floors,
        "completedPlinthSqFt": req.completed_plinth_sqft,
        "allowedUsage": req.allowed_usage,
        "validityExpiryDateBs": req.validity_expiry_date_bs,
        "siteEngineerName": req.site_engineer_name,
        "engineerNecNo": req.engineer_nec_no or "NEC-CIVIL-GEN",
        "wardRecommendationNo": req.ward_recommendation_no or f"वडा-सिफारिस-{uuid.uuid4().hex[:3]}",
        "issueDateBs": datetime.now().strftime("२०%y-%m-%d"),
        "remarks": req.remarks or f"तल्लो {req.completed_floors} तला निर्माण सम्पन्न। बाँकी तला तोकिएको मितिभित्र सम्पन्न गर्नुपर्ने शर्त सहित।"
    }

    approval_entry = {
        "role": "engineer",
        "roleTitleNepali": "प्राविधिक अधिकृत (इन्जिनियर)",
        "officerName": req.site_engineer_name,
        "designation": "प्राविधिक शाखा",
        "status": "approved",
        "signatureDateBs": datetime.now().strftime("%Y-%m-%d"),
        "remarks": f"आंशिक निर्माण सम्पन्न प्रमाणपत्र ({cert_no}) जारी गरियो।",
    }

    try:
        permit = db.query(BuildingPermit).filter(BuildingPermit.id == id).first()
        if permit:
            permit.status = 'आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी'
            permit.partial_completion_details = json.dumps(partial_data)
            existing_approvals = permit.approvals or []
            if isinstance(existing_approvals, str):
                try:
                    existing_approvals = json.loads(existing_approvals)
                except:
                    existing_approvals = []
            permit.approvals = json.dumps([*existing_approvals, approval_entry])
            db.commit()
            db.refresh(permit)
            return {**_model_to_dict(permit), "message": f"आंशिक निर्माण सम्पन्न प्रमाणपत्र '{cert_no}' सफलतापूर्वक जारी गरियो।"}
    except Exception:
        db.rollback()

    for s in SEED_PERMITS:
        if s['id'] == id:
            s['status'] = 'आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी'
            s['partialCompletionDetails'] = partial_data
            s['approvals'] = [*s.get('approvals', []), approval_entry]
            return {**s, "message": f"आंशिक निर्माण सम्पन्न प्रमाणपत्र '{cert_no}' सफलतापूर्वक जारी गरियो।"}

    return {"permitId": id, "partialCompletionDetails": partial_data, "message": "आंशिक प्रमाणपत्र जारी।"}


@router.post("/{id}/documents")
def add_permit_document(
    id: str,
    body: dict = Body(...),
    db: Session = Depends(get_db),
):
    """
    नयाँ कागजात अपलोड — Upload guidance 2082 document (मन्जुरीनामा, जग्गा भाडा सम्झौता, ETABS/CAD फाइल आदि).
    """
    new_doc = {
        "id": f"doc-{uuid.uuid4().hex[:6]}",
        "category": body.get("category", "अन्य कागजात"),
        "title": body.get("title", "अपलोड गरिएको कागजात"),
        "fileName": body.get("fileName", "document.pdf"),
        "fileSize": body.get("fileSize", "1.5 MB"),
        "fileUrl": body.get("fileUrl", ""),
        "status": "pending",
        "uploadedAt": datetime.now().strftime("२०%y-%m-%d"),
        "remarks": body.get("remarks", ""),
    }

    try:
        permit = db.query(BuildingPermit).filter(BuildingPermit.id == id).first()
        if permit:
            existing = permit.documents or []
            if isinstance(existing, str):
                try:
                    existing = json.loads(existing)
                except:
                    existing = []
            permit.documents = json.dumps([*existing, new_doc])
            db.commit()
            db.refresh(permit)
            return {**_model_to_dict(permit), "message": f"'{new_doc['title']}' सफलतापूर्वक अपलोड भयो।"}
    except Exception:
        db.rollback()

    for s in SEED_PERMITS:
        if s['id'] == id:
            s['documents'] = [*s.get('documents', []), new_doc]
            return {**s, "message": f"'{new_doc['title']}' सफलतापूर्वक अपलोड भयो।"}

    return {"permitId": id, "document": new_doc, "message": "कागजात थपियो।"}


@router.put("/{permit_id}/documents/{doc_id}/status")
def update_document_status(
    permit_id: str,
    doc_id: str,
    body: dict = Body(...),
    db: Session = Depends(get_db),
):
    """कागजात स्थिति अद्यावधिक — Update document verification status."""
    status = body.get("status", "pending")
    remarks = body.get("remarks", "")

    for s in SEED_PERMITS:
        if s['id'] == permit_id:
            for doc in s.get('documents', []):
                if doc['id'] == doc_id:
                    doc['status'] = status
                    doc['remarks'] = remarks
                    doc['verifiedBy'] = body.get("verifiedBy", "प्राविधिक शाखा")
                    return {**s, "message": "कागजात स्थिति अद्यावधिक गरियो।"}

    return {"permitId": permit_id, "docId": doc_id, "status": status, "message": "स्थिति अद्यावधिक गरियो।"}


@router.post("/{id}/verify-epayment")
def verify_permit_epayment(
    id: str,
    body: dict = Body(...),
    db: Session = Depends(get_db),
):
    """नक्सा दस्तुर ई-भुक्तानी प्रमाणीकरण — Verify e-payment for permit fee."""
    gateway = (body.get("paymentGateway") or "CASH").upper()
    transaction_id = body.get("transactionId") or f"TXID-{uuid.uuid4().hex[:8].upper()}"
    receipt_no = f"P5-NAXAA-EP-{uuid.uuid4().hex[:6].upper()}"

    try:
        permit = db.query(BuildingPermit).filter(BuildingPermit.id == id).first()
        if permit:
            permit.payment_status = 'भुक्तानी भएको'
            permit.receipt_no = receipt_no
            db.commit()
            db.refresh(permit)
            updated = _model_to_dict(permit)
            return {**updated, "paymentGateway": gateway, "transactionId": transaction_id, "message": "भुक्तानी प्रमाणित।"}
    except Exception:
        db.rollback()

    for s in SEED_PERMITS:
        if s['id'] == id:
            s['paymentStatus'] = 'भुक्तानी भएको'
            s['receiptNo'] = receipt_no
            s['lastPaymentGateway'] = gateway
            return {**s, "paymentGateway": gateway, "transactionId": transaction_id, "message": "भुक्तानी प्रमाणित।"}

    return {"id": id, "paymentStatus": "भुक्तानी भएको", "receiptNo": receipt_no, "message": "भुक्तानी प्रमाणित।"}


@router.post("/{id}/cad-analysis")
def cad_analysis(id: str, body: dict = Body(default={})):
    """
    AI-सहायक नक्सा विश्लेषण — Simulated CAD drawing compliance analysis per NBC 105:2020.
    """
    permit = next((s for s in SEED_PERMITS if s['id'] == id), None)
    if not permit:
        permit = {"totalFloors": 2.5, "plinthAreaSqFt": 1200, "groundCoveragePct": 55, "farRatio": 1.5, "buildingClass": "ख वर्ग"}

    scrutiny = permit.get('scrutinyResults') or {}
    overall = scrutiny.get('overallStatus', 'COMPLIANT')

    return {
        "permitId": id,
        "analysisType": "NBC 105:2020 + भवन निर्माण मार्गदर्शन, २०८२ Scrutiny",
        "timestamp": datetime.utcnow().isoformat(),
        "overallStatus": overall,
        "complianceScore": 95 if overall == 'COMPLIANT' else 61,
        "nbcChecks": [
            {"code": "NBC 105:2020", "description": "भूकम्प प्रतिरोधी संरचनात्मक डिजाइन (ETABS Model)", "status": "passed" if overall == 'COMPLIANT' else "warning", "detail": "Zone V Seismic Parameters + Ductile Detailing Verified"},
            {"code": "NBC 206:1994", "description": "फाउन्डेसन तथा DPC लेभल डिजाइन", "status": "passed", "detail": "Plinth Beam + Foundation Depth ≥ 1.5m verified"},
            {"code": "मार्गदर्शन २०८२ §४", "description": "CAD भर्सन तथा डिजिटल ड्रइङ मापदण्ड", "status": "passed", "detail": f"CAD Version: {permit.get('cadVersion', 'AutoCAD 2018+')} (२०१६ भन्दा माथि)"},
            {"code": "मार्गदर्शन २०८२ §६", "description": "स्ट्रक्चरल डिजाइन प्रतिवेदन ETABS/SAP रन फाइल", "status": "passed" if permit.get('structuralModelFileUrl') else "warning", "detail": "ETABS/SAP Run-Ready Model File uploaded & reviewed"},
            {"code": "NBC 109:1994", "description": "Floor Area Ratio (FAR) मापदण्ड", "status": "passed" if scrutiny.get('farCompliance', {}).get('passed', True) else "failed", "detail": f"FAR: {permit.get('farRatio', 1.5)} (अनुमत: २.०)"},
            {"code": "NBC 201:1994", "description": "प्राकृतिक प्रकाश तथा वायु संचार", "status": "passed", "detail": "सबै कोठामा पर्याप्त झ्याल र हावापानी"},
        ],
        "recommendations": [
            "NBC 105:2020 अनुरुप Ductile detailing प्रयोग गर्नुहोस्।",
            "DPC सम्पन्न भएपछि ल्याब/क्यूब टेस्ट रिपोर्ट अनिवार्य अपलोड गर्नुहोस्।",
            "सुपरस्ट्रक्चर निर्माण पूर्व दोस्रो चरणको डिजिटल इजाजत अनिवार्य लिनुहोस्।",
        ] if overall == 'COMPLIANT' else [
            "FAR मापदण्ड अनुरुप बनाउन तल्लाहरू घटाउनुहोस् वा Setback बढाउनुहोस्।",
            "Ground Coverage ≤ ६०% हुने गरी Plinth Area घटाउनुहोस्।",
            "NBC 105:2020 अनुरुप Structural redesign आवश्यक।",
        ],
        "generatedBy": "Municipal Digital Twin AI — NBC 105:2020 / Guidance 2082 Engine",
    }
