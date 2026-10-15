"""
Seed Script: Building Permits & Electronic Building Permit System (EBPS - ई-नक्सा पास प्रणाली)
Panchpokhari Thangpal Gaupalika, Sindhupalchok
Governed by:
  - Local Government Operation Act 2074 (Schedule 8-14)
  - भवन निर्माण मार्गदर्शन, २०८२ (DUDBC Building Construction Guidance 2082)
  - National Building Codes (NBC 105:2020 Seismic Code, NBC 205, NBC 206)

Populates:
  1. building_permits (16 detailed permits, 2 per ward across Wards 1 to 8)
  2. ebps_applications (16 matched EBPS applications)
  3. ebps_design_scrutiny (16 NBC & bylaws design scrutiny audits)
  4. ebps_workflow_steps (32 workflow lifecycle progression records)
  5. ebps_field_inspections (16 engineer field site visits and DPC/Superstructure approvals)
"""
import sys
import json
import psycopg2
from datetime import datetime, timedelta

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("Starting Building Permits & EBPS Seeding...")

TENANT = "panchpokhari"

# 16 Comprehensive Building Permits across 8 Wards (2 per Ward)
permits_data = [
    # WARD 1: भोटेनाम्लाङ
    {
        "id": "bp-001",
        "app_no": "पाँ.था./नक्सा/२०८१-०१",
        "applicant_name": "दिल बहादुर तामाङ",
        "phone": "9841223344",
        "citizenship": "२३-०१-७५-०५५१२",
        "land_owner": "दिल बहादुर तामाङ",
        "sheet_no": "२३-क-०१",
        "kitta_no": "१२३",
        "land_area": "०-७-२-०",
        "land_area_ropani": "०-७-२-०",
        "ward": 1,
        "tole": "भोटेनाम्लाङ मुख्य बजार",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "आवासीय (Residential)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 2.5,
        "plinth_sqft": 1200.0,
        "built_sqft": 2700.0,
        "far": 1.50,
        "coverage_pct": 55.0,
        "road_width_ft": 20.0,
        "setback_front_ft": 5.0,
        "setback_rear_ft": 3.0,
        "setback_side_ft": 3.0,
        "lat": 27.9142,
        "lon": 85.5721,
        "designer": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "nec_no": "NEC-CIVIL-14205",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2021 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/bp001_model.edb",
        "status": "भवन निर्माण सम्पन्न प्रमाणपत्र जारी",
        "fee": 28500.0,
        "receipt": "P5-NAXAA-2081-001",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८०-०९-१५",
        "partial_details": None,
        "etabs_checks": {
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
        "days_ago": 220
    },
    {
        "id": "bp-002",
        "app_no": "पाँ.था./नक्सा/२०८१-०२",
        "applicant_name": "पासाङ तामाङ",
        "phone": "9851234567",
        "citizenship": "२३-०१-८०-०११२२",
        "land_owner": "पासाङ तामाङ",
        "sheet_no": "२३-क-०३",
        "kitta_no": "६०२",
        "land_area": "०-८-०-०",
        "land_area_ropani": "०-८-०-०",
        "ward": 1,
        "tole": "तिपेनी कृषि बजार चोक",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "मिश्रित (Mixed Use)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 3.0,
        "plinth_sqft": 1500.0,
        "built_sqft": 4500.0,
        "far": 1.70,
        "coverage_pct": 56.0,
        "road_width_ft": 22.0,
        "setback_front_ft": 6.0,
        "setback_rear_ft": 4.0,
        "setback_side_ft": 3.5,
        "lat": 27.9155,
        "lon": 85.5745,
        "designer": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "nec_no": "NEC-CIVIL-14205",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2020 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/tipeni_mixed.edb",
        "status": "आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी",
        "fee": 46500.0,
        "receipt": "P5-NAXAA-2081-002",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८०-११-१०",
        "partial_details": {
            "certificateNo": "पाँ.था./आंशिक-सम्पन्न/२०८१-००२",
            "completedFloors": 1.0,
            "totalAllowedFloors": 3.0,
            "completedPlinthSqFt": 1500,
            "allowedUsage": "व्यावसायिक पसल तथा कृषि संकलन केन्द्र",
            "validityExpiryDateBs": "२०८३-०६-३०",
            "remainingFloors": 2.0,
            "siteEngineerName": "इ. रमेश खड्का",
            "engineerNecNo": "NEC-CIVIL-18445",
            "wardRecommendationNo": "वडा-१-सिफारिस-१४२",
            "issueDateBs": "२०८१-०५-१०",
            "remarks": "तल्लो १ तलाको निर्माण सम्पन्न भएकोले आंशिक सम्पन्न प्रमाणपत्र जारी। बाँकी २ तला २०८३ सम्म सम्पन्न गर्नुपर्ने।"
        },
        "etabs_checks": {
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
        "days_ago": 180
    },

    # WARD 2: बरुवा
    {
        "id": "bp-003",
        "app_no": "पाँ.था./नक्सा/२०८१-०३",
        "applicant_name": "डोल्मा शेर्पा",
        "phone": "9861998822",
        "citizenship": "२३-०१-३०-००५८१",
        "land_owner": "पासाङ दोर्जे शेर्पा",
        "sheet_no": "२३-ख-०२",
        "kitta_no": "४५५",
        "land_area": "०-१२-०-०",
        "land_area_ropani": "०-१२-०-०",
        "ward": 2,
        "tole": "याङ्ग्री पदमार्ग गाउँ",
        "bldg_class": "ग वर्ग (C - मापदण्ड अनुरुप / MRT)",
        "usage": "पर्यटन तथा व्यावसायिक (Tourism & Commercial)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 3.0,
        "plinth_sqft": 2200.0,
        "built_sqft": 5800.0,
        "far": 1.80,
        "coverage_pct": 50.0,
        "road_width_ft": 16.0,
        "setback_front_ft": 7.0,
        "setback_rear_ft": 5.0,
        "setback_side_ft": 4.0,
        "lat": 27.9892,
        "lon": 85.6325,
        "designer": "इ. अनिता थापा (NEC: 22134-Civil)",
        "nec_no": "NEC-CIVIL-22134",
        "ownership_type": "भाडा/लिज (Leased/Rented)",
        "lease_period": 20.0,
        "cad_ver": "AutoCAD 2024 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/yangri_lodge.edb",
        "status": "अस्थायी प्रथम चरण (DPC स्वीकृत)",
        "fee": 41600.0,
        "receipt": "P5-NAXAA-2081-003",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८१-०१-२०",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 1280.0,
            "fundamentalTimePeriodSec": 0.44,
            "maxDriftRatio": 0.0032,
            "massParticipationPct": 92.8,
            "torsionalRatio": 1.18,
            "isCompliant": True,
            "verifiedByEngineer": "इ. अनिता थापा",
            "remarks": "२० वर्षे लिज जग्गामा पर्यटन लज। DPC सम्पन्न पश्चात् स्थलगत नापजाँच स्वीकृत।"
        },
        "days_ago": 130
    },
    {
        "id": "bp-004",
        "app_no": "पाँ.था./नक्सा/२०८१-०४",
        "applicant_name": "दावा छिरिङ ह्योल्मो",
        "phone": "9841887766",
        "citizenship": "२३-०१-२८-०४१२३",
        "land_owner": "दावा छिरिङ ह्योल्मो",
        "sheet_no": "२३-ख-०४",
        "kitta_no": "३२१",
        "land_area": "०-६-१-०",
        "land_area_ropani": "०-६-१-०",
        "ward": 2,
        "tole": "मेलम्चीघ्याङ बजार",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "आवासीय (Residential)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 2.5,
        "plinth_sqft": 1100.0,
        "built_sqft": 2600.0,
        "far": 1.45,
        "coverage_pct": 52.0,
        "road_width_ft": 18.0,
        "setback_front_ft": 5.0,
        "setback_rear_ft": 3.0,
        "setback_side_ft": 3.0,
        "lat": 27.9860,
        "lon": 85.6280,
        "designer": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "nec_no": "NEC-CIVIL-14205",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2022 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/bp004_melamchi.edb",
        "status": "दोस्रो चरण (Super Structure इजाजत)",
        "fee": 26500.0,
        "receipt": "P5-NAXAA-2081-004",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८१-०२-१५",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 790.0,
            "fundamentalTimePeriodSec": 0.36,
            "maxDriftRatio": 0.0028,
            "massParticipationPct": 95.0,
            "torsionalRatio": 1.10,
            "isCompliant": True,
            "verifiedByEngineer": "इ. सुमन श्रेष्ठ",
            "remarks": "सुपरस्ट्रक्चर निर्माण कार्य इजाजत जारी।"
        },
        "days_ago": 110
    },

    # WARD 3: भोताङ तथा तार्केघ्याङ
    {
        "id": "bp-005",
        "app_no": "पाँ.था./नक्सा/२०८१-०५",
        "applicant_name": "सोनाम तेन्जिङ लामा",
        "phone": "9851088990",
        "citizenship": "२३-०१-६८-०९११४",
        "land_owner": "सोनाम तेन्जिङ लामा",
        "sheet_no": "२३-ग-०१",
        "kitta_no": "५६०",
        "land_area": "०-९-२-०",
        "land_area_ropani": "०-९-२-०",
        "ward": 3,
        "tole": "तार्केघ्याङ सांस्कृतिक बजार",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "व्यावसायिक तथा होमस्टे (Commercial & Homestay)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 3.0,
        "plinth_sqft": 1800.0,
        "built_sqft": 5200.0,
        "far": 1.75,
        "coverage_pct": 58.0,
        "road_width_ft": 20.0,
        "setback_front_ft": 6.0,
        "setback_rear_ft": 4.0,
        "setback_side_ft": 3.5,
        "lat": 27.9795,
        "lon": 85.6130,
        "designer": "इ. अनिता थापा (NEC: 22134-Civil)",
        "nec_no": "NEC-CIVIL-22134",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2023 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/tarkegyang_homestay.edb",
        "status": "भवन निर्माण सम्पन्न प्रमाणपत्र जारी",
        "fee": 54000.0,
        "receipt": "P5-NAXAA-2081-005",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८०-०८-१०",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 1420.0,
            "fundamentalTimePeriodSec": 0.42,
            "maxDriftRatio": 0.0031,
            "massParticipationPct": 93.2,
            "torsionalRatio": 1.14,
            "isCompliant": True,
            "verifiedByEngineer": "इ. अनिता थापा",
            "remarks": "भवन निर्माण पूर्ण सम्पन्न, अन्तिम सम्पन्न प्रमाणपत्र प्रदान गरिएको।"
        },
        "days_ago": 260
    },
    {
        "id": "bp-006",
        "app_no": "पाँ.था./नक्सा/२०८१-०६",
        "applicant_name": "पेम्बा वाङ्दी शेर्पा",
        "phone": "9803112244",
        "citizenship": "२३-०१-७२-०३३२१",
        "land_owner": "पेम्बा वाङ्दी शेर्पा",
        "sheet_no": "२३-ग-०३",
        "kitta_no": "११८",
        "land_area": "०-५-०-०",
        "land_area_ropani": "०-५-०-०",
        "ward": 3,
        "tole": "भोताङ माथिल्लो गाउँ",
        "bldg_class": "ग वर्ग (C - मापदण्ड अनुरुप / MRT)",
        "usage": "आवासीय (Residential)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 2.0,
        "plinth_sqft": 950.0,
        "built_sqft": 1900.0,
        "far": 1.30,
        "coverage_pct": 50.0,
        "road_width_ft": 14.0,
        "setback_front_ft": 4.5,
        "setback_rear_ft": 3.0,
        "setback_side_ft": 2.5,
        "lat": 27.9698,
        "lon": 85.6215,
        "designer": "इ. भरत बुढाथोकी (NEC: 31556-Civil)",
        "nec_no": "NEC-CIVIL-31556",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2021 (.dwg)",
        "has_struct": "हो (NBC 205)",
        "model_type": None,
        "model_url": None,
        "status": "अस्थायी प्रथम चरण (DPC स्वीकृत)",
        "fee": 15500.0,
        "receipt": "P5-NAXAA-2081-006",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८१-०३-०१",
        "partial_details": None,
        "etabs_checks": None,
        "days_ago": 95
    },

    # WARD 4: थाङपालकोट
    {
        "id": "bp-007",
        "app_no": "पाँ.था./नक्सा/२०८१-०७",
        "applicant_name": "गोविन्द प्रसाद श्रेष्ठ",
        "phone": "9841556677",
        "citizenship": "२३-०१-४५-०२३४५",
        "land_owner": "राम कुमारी श्रेष्ठ (आमा)",
        "sheet_no": "२३-घ-०१",
        "kitta_no": "७८९",
        "land_area": "०-१४-०-०",
        "land_area_ropani": "०-१४-०-०",
        "ward": 4,
        "tole": "मानेखर्क मुख्य बजार",
        "bldg_class": "क वर्ग (A - विशिष्ट / High-Rise >5 Storey)",
        "usage": "व्यापारिक (Commercial)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 4.0,
        "plinth_sqft": 3200.0,
        "built_sqft": 12800.0,
        "far": 1.90,
        "coverage_pct": 58.0,
        "road_width_ft": 24.0,
        "setback_front_ft": 6.0,
        "setback_rear_ft": 4.0,
        "setback_side_ft": 3.5,
        "lat": 27.9620,
        "lon": 85.5990,
        "designer": "इ. राजेश थापा (NEC: 8812-Civil)",
        "nec_no": "NEC-CIVIL-8812",
        "ownership_type": "पारिवारिक/मन्जुरीनामा (Family/Consent)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2022 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/commercial_bp003.edb",
        "status": "दोस्रो चरण (Super Structure इजाजत)",
        "fee": 181700.0,
        "receipt": "P5-NAXAA-2081-007",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८१-०४-०५",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 2150.0,
            "fundamentalTimePeriodSec": 0.52,
            "maxDriftRatio": 0.0036,
            "massParticipationPct": 91.4,
            "torsionalRatio": 1.25,
            "isCompliant": True,
            "verifiedByEngineer": "इ. राजेश थापा",
            "remarks": "उच्च-स्तरीय वाणिज्यिक भवन सुपरस्ट्रक्चर कार्य इजाजत।"
        },
        "days_ago": 55
    },
    {
        "id": "bp-008",
        "app_no": "पाँ.था./नक्सा/२०८१-०८",
        "applicant_name": "रामेश्वर थाङपाली",
        "phone": "9841334455",
        "citizenship": "२३-०१-५५-०६७८९",
        "land_owner": "रामेश्वर थाङपाली",
        "sheet_no": "२३-घ-०२",
        "kitta_no": "२३१",
        "land_area": "०-६-०-०",
        "land_area_ropani": "०-६-०-०",
        "ward": 4,
        "tole": "थाङपालकोट गाउँ",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "आवासीय (Residential)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 2.5,
        "plinth_sqft": 1050.0,
        "built_sqft": 2450.0,
        "far": 1.40,
        "coverage_pct": 52.0,
        "road_width_ft": 16.0,
        "setback_front_ft": 5.0,
        "setback_rear_ft": 3.0,
        "setback_side_ft": 3.0,
        "lat": 27.9580,
        "lon": 85.5920,
        "designer": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "nec_no": "NEC-CIVIL-14205",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2021 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/bp008_thangpalkot.edb",
        "status": "स्थलगत नापजाँच सम्पन्न",
        "fee": 24500.0,
        "receipt": "P5-NAXAA-2081-008",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८१-०४-२५",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 780.0,
            "fundamentalTimePeriodSec": 0.35,
            "maxDriftRatio": 0.0026,
            "massParticipationPct": 95.2,
            "torsionalRatio": 1.08,
            "isCompliant": True,
            "verifiedByEngineer": "इ. सुमन श्रेष्ठ",
            "remarks": "स्थलगत सर्जमिन तथा नापजाँच सम्पन्न।"
        },
        "days_ago": 35
    },

    # WARD 5: गुन्सा
    {
        "id": "bp-009",
        "app_no": "पाँ.था./नक्सा/२०८१-०९",
        "applicant_name": "मेनुका राई",
        "phone": "9861009988",
        "citizenship": "२३-०१-५०-०३४५६",
        "land_owner": "मेनुका राई",
        "sheet_no": "२३-ङ-०१",
        "kitta_no": "२३४",
        "land_area": "०-५-०-०",
        "land_area_ropani": "०-५-०-०",
        "ward": 5,
        "tole": "गुन्सा डाँडा",
        "bldg_class": "घ वर्ग (D - परम्परागत / Conventional)",
        "usage": "आवासीय (Residential)",
        "structure": "लोड बेयरिङ / ढुङ्गा-माटो-इँटा",
        "floors": 2.0,
        "plinth_sqft": 650.0,
        "built_sqft": 1170.0,
        "far": 1.20,
        "coverage_pct": 45.0,
        "road_width_ft": 12.0,
        "setback_front_ft": 3.0,
        "setback_rear_ft": 2.0,
        "setback_side_ft": 1.5,
        "lat": 27.9520,
        "lon": 85.5910,
        "designer": "इ. भरत बुढाथोकी (NEC: 31556-Civil)",
        "nec_no": "NEC-CIVIL-31556",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2018 (.dwg)",
        "has_struct": "हो (NBC 205)",
        "model_type": None,
        "model_url": None,
        "status": "दरखास्त पेश भएको",
        "fee": 5180.0,
        "receipt": None,
        "pay_status": "भुक्तानी बाँकी",
        "app_date_bs": "२०८१-०५-०१",
        "partial_details": None,
        "etabs_checks": None,
        "days_ago": 20
    },
    {
        "id": "bp-010",
        "app_no": "पाँ.था./नक्सा/२०८१-१०",
        "applicant_name": "ज्ञान बहादुर तामाङ",
        "phone": "9841889900",
        "citizenship": "२३-०१-६०-०१४३२",
        "land_owner": "ज्ञान बहादुर तामाङ",
        "sheet_no": "२३-ङ-०२",
        "kitta_no": "४१०",
        "land_area": "०-८-२-०",
        "land_area_ropani": "०-८-२-०",
        "ward": 5,
        "tole": "रायले कृषि बस्ती",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "आवासीय (Residential)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 2.5,
        "plinth_sqft": 1250.0,
        "built_sqft": 2850.0,
        "far": 1.55,
        "coverage_pct": 54.0,
        "road_width_ft": 18.0,
        "setback_front_ft": 5.0,
        "setback_rear_ft": 3.0,
        "setback_side_ft": 3.0,
        "lat": 27.9480,
        "lon": 85.5860,
        "designer": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "nec_no": "NEC-CIVIL-14205",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2021 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/bp010_rayale.edb",
        "status": "भवन निर्माण सम्पन्न प्रमाणपत्र जारी",
        "fee": 29800.0,
        "receipt": "P5-NAXAA-2081-010",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८०-१०-१२",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 890.0,
            "fundamentalTimePeriodSec": 0.39,
            "maxDriftRatio": 0.0030,
            "massParticipationPct": 94.0,
            "torsionalRatio": 1.11,
            "isCompliant": True,
            "verifiedByEngineer": "इ. सुमन श्रेष्ठ",
            "remarks": "भवन निर्माण कार्य सम्पन्न।"
        },
        "days_ago": 200
    },

    # WARD 6: थाङपालधाप (पालिका केन्द्र)
    {
        "id": "bp-011",
        "app_no": "पाँ.था./नक्सा/२०८१-११",
        "applicant_name": "कमल श्रेष्ठ",
        "phone": "9851034567",
        "citizenship": "२३-०१-४८-०३४११",
        "land_owner": "कमल श्रेष्ठ",
        "sheet_no": "२३-च-०१",
        "kitta_no": "८९०",
        "land_area": "०-१६-०-०",
        "land_area_ropani": "०-१६-०-०",
        "ward": 6,
        "tole": "थाङपालधाप पालिका केन्द्र चोक",
        "bldg_class": "क वर्ग (A - विशिष्ट / Commercial Hub)",
        "usage": "व्यापारिक तथा कार्यालय (Commercial & Office)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 4.0,
        "plinth_sqft": 3000.0,
        "built_sqft": 11500.0,
        "far": 1.85,
        "coverage_pct": 57.0,
        "road_width_ft": 24.0,
        "setback_front_ft": 6.0,
        "setback_rear_ft": 4.0,
        "setback_side_ft": 3.5,
        "lat": 27.9355,
        "lon": 85.5830,
        "designer": "इ. राजेश थापा (NEC: 8812-Civil)",
        "nec_no": "NEC-CIVIL-8812",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2024 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/thangpaldhap_mall.edb",
        "status": "आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी",
        "fee": 164000.0,
        "receipt": "P5-NAXAA-2081-011",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८०-१२-२०",
        "partial_details": {
            "certificateNo": "पाँ.था./आंशिक-सम्पन्न/२०८१-०११",
            "completedFloors": 2.0,
            "totalAllowedFloors": 4.0,
            "completedPlinthSqFt": 3000,
            "allowedUsage": "बैंक, सहकारी तथा व्यावसायिक सटर",
            "validityExpiryDateBs": "२०८३-१२-३०",
            "remainingFloors": 2.0,
            "siteEngineerName": "इ. रमेश खड्का",
            "engineerNecNo": "NEC-CIVIL-18445",
            "wardRecommendationNo": "वडा-६-सिफारिस-०८९",
            "issueDateBs": "२०८१-०४-२८",
            "remarks": "तल्लो २ तला सम्पन्न भएकोले आंशिक सम्पन्न प्रमाणपत्र जारी।"
        },
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 1950.0,
            "fundamentalTimePeriodSec": 0.49,
            "maxDriftRatio": 0.0034,
            "massParticipationPct": 92.0,
            "torsionalRatio": 1.20,
            "isCompliant": True,
            "verifiedByEngineer": "इ. राजेश थापा",
            "remarks": "NBC 105:2020 पूर्ण अनुरुप।"
        },
        "days_ago": 160
    },
    {
        "id": "bp-012",
        "app_no": "पाँ.था./नक्सा/२०८१-१२",
        "applicant_name": "सीता देवी सापकोटा",
        "phone": "9841667788",
        "citizenship": "२३-०१-५४-०७८९०",
        "land_owner": "सीता देवी सापकोटा",
        "sheet_no": "२३-च-०२",
        "kitta_no": "३४५",
        "land_area": "०-७-०-०",
        "land_area_ropani": "०-७-०-०",
        "ward": 6,
        "tole": "थाङपालधाप बेसी",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "आवासीय (Residential)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 2.5,
        "plinth_sqft": 1150.0,
        "built_sqft": 2650.0,
        "far": 1.50,
        "coverage_pct": 53.0,
        "road_width_ft": 20.0,
        "setback_front_ft": 5.0,
        "setback_rear_ft": 3.0,
        "setback_side_ft": 3.0,
        "lat": 27.9320,
        "lon": 85.5810,
        "designer": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "nec_no": "NEC-CIVIL-14205",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2021 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/bp012_sita.edb",
        "status": "दोस्रो चरण (Super Structure इजाजत)",
        "fee": 27800.0,
        "receipt": "P5-NAXAA-2081-012",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८१-०२-२५",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 820.0,
            "fundamentalTimePeriodSec": 0.37,
            "maxDriftRatio": 0.0028,
            "massParticipationPct": 94.6,
            "torsionalRatio": 1.10,
            "isCompliant": True,
            "verifiedByEngineer": "इ. सुमन श्रेष्ठ",
            "remarks": "DPC सम्पन्न। सुपरस्ट्रक्चर निर्माण इजाजत प्रदान।"
        },
        "days_ago": 70
    },

    # WARD 7: भोटेनाम्लाङ (तिपेनी क्षेत्र)
    {
        "id": "bp-013",
        "app_no": "पाँ.था./नक्सा/२०८१-१३",
        "applicant_name": "कृष्ण बहादुर दङ्गाल",
        "phone": "9841778899",
        "citizenship": "२३-०१-४२-०१५६७",
        "land_owner": "कृष्ण बहादुर दङ्गाल",
        "sheet_no": "२३-छ-०१",
        "kitta_no": "५१२",
        "land_area": "०-१०-०-०",
        "land_area_ropani": "०-१०-०-०",
        "ward": 7,
        "tole": "तिपेनी मुख्य बसपार्क चोक",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "व्यापारिक तथा होटल (Commercial & Hotel)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 3.5,
        "plinth_sqft": 1900.0,
        "built_sqft": 6200.0,
        "far": 1.80,
        "coverage_pct": 58.0,
        "road_width_ft": 24.0,
        "setback_front_ft": 6.0,
        "setback_rear_ft": 4.0,
        "setback_side_ft": 3.5,
        "lat": 27.9110,
        "lon": 85.5685,
        "designer": "इ. अनिता थापा (NEC: 22134-Civil)",
        "nec_no": "NEC-CIVIL-22134",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2023 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/tipeni_hotel.edb",
        "status": "भवन निर्माण सम्पन्न प्रमाणपत्र जारी",
        "fee": 64500.0,
        "receipt": "P5-NAXAA-2081-013",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८०-०७-२०",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 1680.0,
            "fundamentalTimePeriodSec": 0.45,
            "maxDriftRatio": 0.0033,
            "massParticipationPct": 92.5,
            "torsionalRatio": 1.16,
            "isCompliant": True,
            "verifiedByEngineer": "इ. अनिता थापा",
            "remarks": "निर्माण सम्पन्न प्रमाणपत्र जारी।"
        },
        "days_ago": 280
    },
    {
        "id": "bp-014",
        "app_no": "पाँ.था./नक्सा/२०८१-१४",
        "applicant_name": "सुमित्रा दनुवार",
        "phone": "9808223344",
        "citizenship": "२३-०१-६५-०८९००",
        "land_owner": "सुमित्रा दनुवार",
        "sheet_no": "२३-छ-०२",
        "kitta_no": "१४४",
        "land_area": "०-६-०-०",
        "land_area_ropani": "०-६-०-०",
        "ward": 7,
        "tole": "भोटेनाम्लाङ फेदी टोल",
        "bldg_class": "ग वर्ग (C - मापदण्ड अनुरुप / MRT)",
        "usage": "आवासीय (Residential)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 2.0,
        "plinth_sqft": 900.0,
        "built_sqft": 1800.0,
        "far": 1.30,
        "coverage_pct": 50.0,
        "road_width_ft": 16.0,
        "setback_front_ft": 5.0,
        "setback_rear_ft": 3.0,
        "setback_side_ft": 2.5,
        "lat": 27.9130,
        "lon": 85.5710,
        "designer": "इ. भरत बुढाथोकी (NEC: 31556-Civil)",
        "nec_no": "NEC-CIVIL-31556",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2021 (.dwg)",
        "has_struct": "हो (NBC 205)",
        "model_type": None,
        "model_url": None,
        "status": "अस्थायी प्रथम चरण (DPC स्वीकृत)",
        "fee": 14500.0,
        "receipt": "P5-NAXAA-2081-014",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८१-०३-१५",
        "partial_details": None,
        "etabs_checks": None,
        "days_ago": 80
    },

    # WARD 8: लागर्चे
    {
        "id": "bp-015",
        "app_no": "पाँ.था./नक्सा/२०८१-१५",
        "applicant_name": "लाक्पा डिकी शेर्पा",
        "phone": "9841990011",
        "citizenship": "२३-०१-७०-०५६७८",
        "land_owner": "लाक्पा डिकी शेर्पा",
        "sheet_no": "२३-ज-०१",
        "kitta_no": "६७०",
        "land_area": "०-८-०-०",
        "land_area_ropani": "०-८-०-०",
        "ward": 8,
        "tole": "लागर्चे बजार",
        "bldg_class": "ख वर्ग (B - पेशागत / Engineered Design / RCC)",
        "usage": "आवासीय तथा पसल (Residential & Retail)",
        "structure": "आरसीसी फ्रेम स्ट्रक्चर (RCC Frame)",
        "floors": 2.5,
        "plinth_sqft": 1180.0,
        "built_sqft": 2720.0,
        "far": 1.50,
        "coverage_pct": 54.0,
        "road_width_ft": 18.0,
        "setback_front_ft": 5.0,
        "setback_rear_ft": 3.0,
        "setback_side_ft": 3.0,
        "lat": 27.9710,
        "lon": 85.5890,
        "designer": "इ. सुमन श्रेष्ठ (NEC: 14205-Civil)",
        "nec_no": "NEC-CIVIL-14205",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2022 (.dwg)",
        "has_struct": "हो (NBC 105:2020)",
        "model_type": "ETABS (.edb)",
        "model_url": "/uploads/etabs/lagarche_bp015.edb",
        "status": "स्थलगत नापजाँच सम्पन्न",
        "fee": 28200.0,
        "receipt": "P5-NAXAA-2081-015",
        "pay_status": "भुक्तानी भएको",
        "app_date_bs": "२०८१-०४-२०",
        "partial_details": None,
        "etabs_checks": {
            "structuralSoftware": "ETABS (.edb)",
            "baseShearKn": 850.0,
            "fundamentalTimePeriodSec": 0.38,
            "maxDriftRatio": 0.0029,
            "massParticipationPct": 94.2,
            "torsionalRatio": 1.11,
            "isCompliant": True,
            "verifiedByEngineer": "इ. सुमन श्रेष्ठ",
            "remarks": "स्थलगत नापजाँच तथा सर्जमिन मुचुल्का सम्पन्न।"
        },
        "days_ago": 40
    },
    {
        "id": "bp-016",
        "app_no": "पाँ.था./नक्सा/२०८१-१६",
        "applicant_name": "प्रेम बहादुर तामाङ",
        "phone": "9812445566",
        "citizenship": "२३-०१-५८-०११२३",
        "land_owner": "प्रेम बहादुर तामाङ",
        "sheet_no": "२३-ज-०२",
        "kitta_no": "३०५",
        "land_area": "०-६-२-०",
        "land_area_ropani": "०-६-२-०",
        "ward": 8,
        "tole": "मानेखर्क लिंक खण्ड",
        "bldg_class": "घ वर्ग (D - परम्परागत / Conventional)",
        "usage": "आवासीय (Residential)",
        "structure": "लोड बेयरिङ / ढुङ्गा-माटो-काठ",
        "floors": 2.0,
        "plinth_sqft": 700.0,
        "built_sqft": 1300.0,
        "far": 1.25,
        "coverage_pct": 46.0,
        "road_width_ft": 12.0,
        "setback_front_ft": 3.0,
        "setback_rear_ft": 2.0,
        "setback_side_ft": 1.5,
        "lat": 27.9670,
        "lon": 85.5920,
        "designer": "इ. भरत बुढाथोकी (NEC: 31556-Civil)",
        "nec_no": "NEC-CIVIL-31556",
        "ownership_type": "आफ्नै (Self-Owned)",
        "lease_period": None,
        "cad_ver": "AutoCAD 2018 (.dwg)",
        "has_struct": "हो (NBC 205)",
        "model_type": None,
        "model_url": None,
        "status": "दरखास्त पेश भएको",
        "fee": 5800.0,
        "receipt": None,
        "pay_status": "भुक्तानी बाँकी",
        "app_date_bs": "२०८१-०५-१०",
        "partial_details": None,
        "etabs_checks": None,
        "days_ago": 12
    }
]

# ---------------------------------------------------------------------------
# 1. SEED building_permits
# ---------------------------------------------------------------------------
print(f"Seeding {len(permits_data)} building permits...")

for p in permits_data:
    created_dt = datetime.utcnow() - timedelta(days=p["days_ago"])
    
    four_boundaries = {
        "east": "बाटो / सार्वजनिक जग्गा",
        "west": f"कित्ता नं. {int(p['kitta_no']) - 1 if p['kitta_no'].isdigit() else '१००'}",
        "north": "मोटरबाटो / गोरेटो",
        "south": "खोल्सो / छिमेकी जग्गा"
    }

    documents = [
        {"id": f"doc-{p['id']}-1", "category": "जग्गाधनीपुर्जा", "title": f"जग्गाधनीपुर्जा ({p['land_owner']})", "fileName": f"lalpurja_{p['kitta_no']}.pdf", "status": "approved"},
        {"id": f"doc-{p['id']}-2", "category": "नागरिकता", "title": f"नागरिकता प्रमाण पत्र ({p['applicant_name']})", "fileName": f"citizenship_{p['id']}.pdf", "status": "approved"},
        {"id": f"doc-{p['id']}-3", "category": "भवन नक्सा", "title": f"आर्किटेक्चरल डिजाइन नक्सा ({p['cad_ver']})", "fileName": f"arch_{p['id']}.dwg", "status": "approved"},
    ]
    if p["has_struct"] and "NBC 105" in p["has_struct"]:
        documents.append({"id": f"doc-{p['id']}-4", "category": "स्ट्रक्चरल ड्रइङ", "title": "स्ट्रक्चरल डक्टाइल डिटेलिङ ड्रइङ (NBC 105:2020)", "fileName": f"struct_{p['id']}.pdf", "status": "approved"})
    if p["model_url"]:
        documents.append({"id": f"doc-{p['id']}-5", "category": "ETABS/SAP मोडल फाइल", "title": f"{p['model_type']} Model Run-Ready File", "fileName": f"{p['id']}_model.edb", "status": "approved"})
    if p["ownership_type"] and "लिज" in p["ownership_type"]:
        documents.append({"id": f"doc-{p['id']}-6", "category": "जग्गा भाडाको सम्झौता", "title": "जग्गा भाडा/लिज सम्झौता पत्र", "fileName": f"lease_{p['id']}.pdf", "status": "approved"})
    if p["partial_details"]:
        documents.append({"id": f"doc-{p['id']}-7", "category": "आंशिक सम्पन्न सिफारिस", "title": "वडाको आंशिक निर्माण सम्पन्न स्थलगत सिफारिस", "fileName": f"partial_sifaris_{p['id']}.pdf", "status": "approved"})

    approvals = [
        {"role": "ward_secretary", "roleTitleNepali": "वडा सचिव", "officerName": f"सचिव (वडा {p['ward']})", "designation": f"वडा सचिव, वडा नं. {p['ward']}", "status": "approved", "signatureDateBs": p["app_date_bs"]},
        {"role": "engineer", "roleTitleNepali": "प्राविधिक इन्जिनियर", "officerName": "इ. रमेश खड्का", "designation": "जेठा इन्जिनियर", "status": "approved", "signatureDateBs": p["app_date_bs"]},
    ]
    if p["status"] in ["भवन निर्माण सम्पन्न प्रमाणपत्र जारी", "आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी"]:
        approvals.append({"role": "chief_admin", "roleTitleNepali": "प्र.प्र.अ.", "officerName": "देव बहादुर तामाङ", "designation": "प्रमुख प्रशासकीय अधिकृत", "status": "approved", "signatureDateBs": "२०८१-०५-०१"})

    scrutiny_results = {
        "roadWidthCompliance": {"passed": True, "required": 14.0, "actual": p["road_width_ft"], "note": "मापदण्ड अनुरुप"},
        "frontSetbackCompliance": {"passed": True, "required": 4.0, "actual": p["setback_front_ft"], "note": "मापदण्ड अनुरुप"},
        "rearSetbackCompliance": {"passed": True, "required": 2.5, "actual": p["setback_rear_ft"], "note": "मापदण्ड अनुरुप"},
        "sideSetbackCompliance": {"passed": True, "required": 2.0, "actual": p["setback_side_ft"], "note": "मापदण्ड अनुरुप"},
        "coverageCompliance": {"passed": True, "maxAllowedPct": 60.0, "actualPct": p["coverage_pct"], "note": "मापदण्ड अनुरुप"},
        "farCompliance": {"passed": True, "maxAllowedFar": 2.0, "actualFar": p["far"], "note": "मापदण्ड अनुरुप"},
        "etabsStructuralStatus": "PASSED" if p["etabs_checks"] else "NOT_APPLICABLE",
        "soilTestRequired": True if p["floors"] >= 3.0 else False,
        "structuralReportRequired": True if "ख वर्ग" in p["bldg_class"] or "क वर्ग" in p["bldg_class"] else False,
        "overallStatus": "COMPLIANT" if p["status"] != "दरखास्त पेश भएको" else "PENDING_VERIFICATION",
        "generatedAt": p["app_date_bs"]
    }

    cur.execute("""
        INSERT INTO building_permits (
            tenant_id, id, "applicationNo", "applicantName", "applicantPhone", "applicantCitizenship",
            "landOwnerName", "sheetNo", "kittaNo", "landArea", "landAreaRopani", "fourBoundaries",
            "wardNumber", "toleAddress", "buildingClass", "usageType", "structureType", "totalFloors",
            "plinthAreaSqFt", "totalBuiltAreaSqFt", "farRatio", "groundCoveragePct", "roadWidthFt",
            "setbackFrontFt", "setbackRearFt", "setbackSideFt", "gpsLat", "gpsLon", "designerName",
            "necLicenseNo", "ownershipType", "leasePeriodYears", "cadVersion", "hasStructuralDrawing",
            "structuralModelType", "structuralModelFileUrl", "partialCompletionDetails", "etabsChecks",
            status, "permitFee", "receiptNo", "paymentStatus", "applicationDateBs",
            documents, objections, approvals, "scrutinyResults", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "applicationNo" = EXCLUDED."applicationNo",
            "applicantName" = EXCLUDED."applicantName",
            "applicantPhone" = EXCLUDED."applicantPhone",
            "applicantCitizenship" = EXCLUDED."applicantCitizenship",
            "landOwnerName" = EXCLUDED."landOwnerName",
            "sheetNo" = EXCLUDED."sheetNo",
            "kittaNo" = EXCLUDED."kittaNo",
            "landArea" = EXCLUDED."landArea",
            "landAreaRopani" = EXCLUDED."landAreaRopani",
            "fourBoundaries" = EXCLUDED."fourBoundaries",
            "wardNumber" = EXCLUDED."wardNumber",
            "toleAddress" = EXCLUDED."toleAddress",
            "buildingClass" = EXCLUDED."buildingClass",
            "usageType" = EXCLUDED."usageType",
            "structureType" = EXCLUDED."structureType",
            "totalFloors" = EXCLUDED."totalFloors",
            "plinthAreaSqFt" = EXCLUDED."plinthAreaSqFt",
            "totalBuiltAreaSqFt" = EXCLUDED."totalBuiltAreaSqFt",
            "farRatio" = EXCLUDED."farRatio",
            "groundCoveragePct" = EXCLUDED."groundCoveragePct",
            "roadWidthFt" = EXCLUDED."roadWidthFt",
            "setbackFrontFt" = EXCLUDED."setbackFrontFt",
            "setbackRearFt" = EXCLUDED."setbackRearFt",
            "setbackSideFt" = EXCLUDED."setbackSideFt",
            "gpsLat" = EXCLUDED."gpsLat",
            "gpsLon" = EXCLUDED."gpsLon",
            "designerName" = EXCLUDED."designerName",
            "necLicenseNo" = EXCLUDED."necLicenseNo",
            "ownershipType" = EXCLUDED."ownershipType",
            "leasePeriodYears" = EXCLUDED."leasePeriodYears",
            "cadVersion" = EXCLUDED."cadVersion",
            "hasStructuralDrawing" = EXCLUDED."hasStructuralDrawing",
            "structuralModelType" = EXCLUDED."structuralModelType",
            "structuralModelFileUrl" = EXCLUDED."structuralModelFileUrl",
            "partialCompletionDetails" = EXCLUDED."partialCompletionDetails",
            "etabsChecks" = EXCLUDED."etabsChecks",
            status = EXCLUDED.status,
            "permitFee" = EXCLUDED."permitFee",
            "receiptNo" = EXCLUDED."receiptNo",
            "paymentStatus" = EXCLUDED."paymentStatus",
            "applicationDateBs" = EXCLUDED."applicationDateBs",
            documents = EXCLUDED.documents,
            objections = EXCLUDED.objections,
            approvals = EXCLUDED.approvals,
            "scrutinyResults" = EXCLUDED."scrutinyResults",
            "updatedAt" = NOW();
    """, (
        TENANT, p["id"], p["app_no"], p["applicant_name"], p["phone"], p["citizenship"],
        p["land_owner"], p["sheet_no"], p["kitta_no"], p["land_area"], p["land_area_ropani"], json.dumps(four_boundaries),
        p["ward"], p["tole"], p["bldg_class"], p["usage"], p["structure"], p["floors"],
        p["plinth_sqft"], p["built_sqft"], p["far"], p["coverage_pct"], p["road_width_ft"],
        p["setback_front_ft"], p["setback_rear_ft"], p["setback_side_ft"], p["lat"], p["lon"], p["designer"],
        p["nec_no"], p["ownership_type"], p["lease_period"], p["cad_ver"], p["has_struct"],
        p["model_type"], p["model_url"], json.dumps(p["partial_details"]) if p["partial_details"] else None,
        json.dumps(p["etabs_checks"]) if p["etabs_checks"] else None,
        p["status"], p["fee"], p["receipt"], p["pay_status"], p["app_date_bs"],
        json.dumps(documents), json.dumps([]), json.dumps(approvals), json.dumps(scrutiny_results),
        created_dt
    ))

print(f"✓ Seeded {len(permits_data)} building permits into 'building_permits'.")

# ---------------------------------------------------------------------------
# 2. SEED ebps_applications (Matched 1-to-1)
# ---------------------------------------------------------------------------
print("Seeding matched EBPS applications...")
for p in permits_data:
    ebps_id = f"ebps-{p['id']}"
    land_area_sqm = round(float(p["plinth_sqft"]) * 0.092903 * 1.8, 2)
    bldg_type = "Residential" if "आवासीय" in p["usage"] else "Commercial" if "व्यापारिक" in p["usage"] else "Mixed Use"
    struct_type = "RCC Frame" if "आरसीसी" in p["structure"] else "Load Bearing"

    # Map status
    ebps_status_map = {
        "भवन निर्माण सम्पन्न प्रमाणपत्र जारी": "Completed",
        "आंशिक निर्माण सम्पन्न प्रमाणपत्र जारी": "Super Structure",
        "दोस्रो चरण (Super Structure इजाजत)": "Super Structure",
        "अस्थायी प्रथम चरण (DPC स्वीकृत)": "Plinth Approved",
        "स्थलगत नापजाँच सम्पन्न": "Desk Review",
        "दरखास्त पेश भएको": "Draft"
    }
    ebps_status = ebps_status_map.get(p["status"], "Draft")

    gis_polygon = {
        "type": "Polygon",
        "coordinates": [[
            [p["lon"] - 0.0001, p["lat"] - 0.0001],
            [p["lon"] + 0.0001, p["lat"] - 0.0001],
            [p["lon"] + 0.0001, p["lat"] + 0.0001],
            [p["lon"] - 0.0001, p["lat"] + 0.0001],
            [p["lon"] - 0.0001, p["lat"] - 0.0001]
        ]]
    }

    created_dt = datetime.utcnow() - timedelta(days=p["days_ago"])

    cur.execute("""
        INSERT INTO ebps_applications (
            tenant_id, id, application_no, landowner_citizen_id, consultant_id,
            kitta_no, ward_id, land_area_sqm, building_type, structure_type,
            total_floors, status, gis_polygon, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            application_no = EXCLUDED.application_no,
            landowner_citizen_id = EXCLUDED.landowner_citizen_id,
            consultant_id = EXCLUDED.consultant_id,
            kitta_no = EXCLUDED.kitta_no,
            ward_id = EXCLUDED.ward_id,
            land_area_sqm = EXCLUDED.land_area_sqm,
            building_type = EXCLUDED.building_type,
            structure_type = EXCLUDED.structure_type,
            total_floors = EXCLUDED.total_floors,
            status = EXCLUDED.status,
            gis_polygon = EXCLUDED.gis_polygon,
            updated_at = NOW();
    """, (
        TENANT, ebps_id, p["app_no"], p["citizenship"], p["nec_no"] or "NEC-GEN-01",
        p["kitta_no"], str(p["ward"]), land_area_sqm, bldg_type, struct_type,
        float(p["floors"]), ebps_status, json.dumps(gis_polygon), created_dt
    ))

print(f"✓ Seeded {len(permits_data)} records into 'ebps_applications'.")

# ---------------------------------------------------------------------------
# 3. SEED ebps_design_scrutiny
# ---------------------------------------------------------------------------
print("Seeding EBPS design scrutinies...")
for p in permits_data:
    ebps_id = f"ebps-{p['id']}"
    scrutiny_id = f"sc-{p['id']}"
    is_compliant = p["status"] != "दरखास्त पेश भएको"
    remarks = "NBC 105:2020 तथा स्थानीय भवन निर्माण मापदण्ड २०८२ अनुरुप प्राविधिक स्क्रुटिनी उत्तीर्ण।" if is_compliant else "प्राविधिक कागजात रुजु तथा जाँच प्रक्रियामा।"

    cur.execute("""
        INSERT INTO ebps_design_scrutiny (
            tenant_id, id, application_id, proposed_far, allowed_far,
            proposed_ground_coverage, allowed_ground_coverage, road_width_ft,
            setback_front_ft, setback_rear_ft, setback_side_ft,
            is_code_compliant, engineer_id, remarks, created_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            application_id = EXCLUDED.application_id,
            proposed_far = EXCLUDED.proposed_far,
            allowed_far = EXCLUDED.allowed_far,
            proposed_ground_coverage = EXCLUDED.proposed_ground_coverage,
            allowed_ground_coverage = EXCLUDED.allowed_ground_coverage,
            road_width_ft = EXCLUDED.road_width_ft,
            setback_front_ft = EXCLUDED.setback_front_ft,
            setback_rear_ft = EXCLUDED.setback_rear_ft,
            setback_side_ft = EXCLUDED.setback_side_ft,
            is_code_compliant = EXCLUDED.is_code_compliant,
            engineer_id = EXCLUDED.engineer_id,
            remarks = EXCLUDED.remarks;
    """, (
        TENANT, scrutiny_id, ebps_id, float(p["far"]), 2.0,
        float(p["coverage_pct"]), 60.0, float(p["road_width_ft"]),
        float(p["setback_front_ft"]), float(p["setback_rear_ft"]), float(p["setback_side_ft"]),
        is_compliant, "इ. रमेश खड्का (NEC: 18445)", remarks
    ))

print(f"✓ Seeded {len(permits_data)} records into 'ebps_design_scrutiny'.")

# ---------------------------------------------------------------------------
# 4. SEED ebps_workflow_steps (2 steps per permit = 32 steps)
# ---------------------------------------------------------------------------
print("Seeding EBPS workflow steps...")
for p in permits_data:
    ebps_id = f"ebps-{p['id']}"
    step1_id = f"wf-{p['id']}-1"
    step2_id = f"wf-{p['id']}-2"

    dt1 = datetime.utcnow() - timedelta(days=p["days_ago"])
    dt2 = datetime.utcnow() - timedelta(days=max(p["days_ago"] - 15, 1))

    cur.execute("""
        INSERT INTO ebps_workflow_steps (
            tenant_id, id, application_id, step_name, action_by, action_date,
            outcome, comments, attachment_urls
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            step_name = EXCLUDED.step_name,
            action_by = EXCLUDED.action_by,
            action_date = EXCLUDED.action_date,
            outcome = EXCLUDED.outcome,
            comments = EXCLUDED.comments,
            attachment_urls = EXCLUDED.attachment_urls;
    """, (
        TENANT, step1_id, ebps_id, "Desk Review & Document Scrutiny",
        f"वडा सचिव (वडा {p['ward']})", dt1, "Approved",
        "जग्गाधनीपुर्जा, नागरिकता र आर्किटेक्चरल ड्रइङ रुजु सम्पन्न।",
        json.dumps([f"/uploads/docs/citizenship_{p['id']}.pdf"])
    ))

    outcome2 = "Cleared" if p["status"] != "दरखास्त पेश भएको" else "Under Review"
    comments2 = "स्थलगत सर्जमिन तथा साँध-सिमाना मुचुल्का सम्पन्न। कुनै उजुरी नपरेको।" if p["status"] != "दरखास्त पेश भएको" else "१५ दिने सार्वजनिक सूचना प्रक्रियामा।"
    cur.execute("""
        INSERT INTO ebps_workflow_steps (
            tenant_id, id, application_id, step_name, action_by, action_date,
            outcome, comments, attachment_urls
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            step_name = EXCLUDED.step_name,
            action_by = EXCLUDED.action_by,
            action_date = EXCLUDED.action_date,
            outcome = EXCLUDED.outcome,
            comments = EXCLUDED.comments,
            attachment_urls = EXCLUDED.attachment_urls;
    """, (
        TENANT, step2_id, ebps_id, "15-Day Public Notice & Site Sarjamin",
        "प्राविधिक इन्जिनियरिङ शाखा", dt2, outcome2, comments2,
        json.dumps([f"/uploads/docs/sarjamin_{p['id']}.pdf"])
    ))

print(f"✓ Seeded 32 records into 'ebps_workflow_steps'.")

# ---------------------------------------------------------------------------
# 5. SEED ebps_field_inspections (1 inspection per permit)
# ---------------------------------------------------------------------------
print("Seeding EBPS field site inspections...")
for p in permits_data:
    ebps_id = f"ebps-{p['id']}"
    insp_id = f"insp-{p['id']}"

    insp_type = "Completion" if "सम्पन्न" in p["status"] else "Plinth" if "DPC" in p["status"] else "Super Structure" if "Super" in p["status"] else "Foundation"
    is_appr = p["status"] != "दरखास्त पेश भएको"
    remarks_insp = f"NBC मापदण्ड अनुसार {insp_type} निर्माण गुणस्तर तथा सेटब्याक प्रमाणित।" if is_appr else "प्रारम्भिक स्थलगत अध्ययन।"

    gps_pt = {"type": "Point", "coordinates": [p["lon"], p["lat"]]}
    photos = [f"/uploads/inspections/{p['id']}_{insp_type.lower()}_1.jpg", f"/uploads/inspections/{p['id']}_{insp_type.lower()}_2.jpg"]

    cur.execute("""
        INSERT INTO ebps_field_inspections (
            tenant_id, id, application_id, inspection_type, inspector_id,
            inspection_date, gps_coordinates, photos, is_approved, remarks
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            application_id = EXCLUDED.application_id,
            inspection_type = EXCLUDED.inspection_type,
            inspector_id = EXCLUDED.inspector_id,
            inspection_date = EXCLUDED.inspection_date,
            gps_coordinates = EXCLUDED.gps_coordinates,
            photos = EXCLUDED.photos,
            is_approved = EXCLUDED.is_approved,
            remarks = EXCLUDED.remarks;
    """, (
        TENANT, insp_id, ebps_id, insp_type, "इ. रमेश खड्का (NEC: 18445-Civil)",
        datetime.utcnow() - timedelta(days=max(p["days_ago"] - 30, 2)),
        json.dumps(gps_pt), json.dumps(photos), is_appr, remarks_insp
    ))

print(f"✓ Seeded {len(permits_data)} records into 'ebps_field_inspections'.")

conn.commit()
cur.close()
conn.close()

print("\n=== Building Permits & EBPS Seeding COMPLETED SUCCESSFULLY! ===")
