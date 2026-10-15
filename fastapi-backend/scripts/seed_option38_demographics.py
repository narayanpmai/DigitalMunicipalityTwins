"""
Option 38: Seed Demographic Categories, Indicators, Values + Municipal Indicators (indicators table)
          + Progress Indicator Records for Panchpokhari Thangpal Rural Municipality
"""
import uuid
from datetime import datetime, date
from decimal import Decimal
from core.database import SessionLocal
from models.demographics import DemographicCategory, DemographicIndicator, DemographicValue
from sqlalchemy import text

TENANT_ID = "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"
LOCAL_LEVEL = "Panchpokhari Thangpal Rural Municipality"
CAPTURED_DATE = date(2024, 11, 15)

# ─────────────────────────────────────────────────────────────────────────────
# 1. DEMOGRAPHIC CATEGORIES (10 major thematic areas)
# ─────────────────────────────────────────────────────────────────────────────
DEMO_CATEGORIES = [
    {"id": "dc-01", "code": "POPULATION", "name": "जनसंख्या तथा जनघनत्व", "name_en": "Population & Density", "description": "कुल जनसंख्या, घनत्व, वृद्धिदर तथा वडागत वितरण", "display_order": 1},
    {"id": "dc-02", "code": "GENDER", "name": "लिङ्गीय संरचना तथा महिला सशक्तिकरण", "name_en": "Gender Structure & Women Empowerment", "description": "लिङ्ग अनुपात, महिला नेतृत्व तथा लैङ्गिक समानता सूचक", "display_order": 2},
    {"id": "dc-03", "code": "AGE_STRUCTURE", "name": "उमेर संरचना तथा आश्रित अनुपात", "name_en": "Age Structure & Dependency Ratio", "description": "बाल, कार्यरत उमेर तथा जेष्ठ नागरिक जनसंख्या वितरण", "display_order": 3},
    {"id": "dc-04", "code": "HOUSEHOLD", "name": "घरधुरी तथा परिवार संरचना", "name_en": "Household & Family Structure", "description": "औसत परिवार आकार, घरधुरी प्रकार तथा सामाजिक संरचना", "display_order": 4},
    {"id": "dc-05", "code": "LITERACY", "name": "साक्षरता तथा शिक्षा स्तर", "name_en": "Literacy & Education Level", "description": "साक्षरता दर, विद्यालय भर्ना, उच्च शिक्षा तथा अनौपचारिक शिक्षा", "display_order": 5},
    {"id": "dc-06", "code": "ECONOMIC", "name": "आर्थिक सक्रियता तथा रोजगारी", "name_en": "Economic Activity & Employment", "description": "कामदार जनसंख्या, आर्थिक क्षेत्र, वैदेशिक रोजगारी तथा आयस्तर", "display_order": 6},
    {"id": "dc-07", "code": "HOUSING", "name": "आवास तथा जीवन स्तर", "name_en": "Housing & Living Standards", "description": "घरको प्रकार, छाना सामग्री, सुविधा तथा स्वच्छता पहुँच", "display_order": 7},
    {"id": "dc-08", "code": "ETHNICITY", "name": "जाति, जनजाति तथा धर्म", "name_en": "Caste, Ethnicity & Religion", "description": "जातीय विविधता, भाषाई समूह तथा धार्मिक वितरण", "display_order": 8},
    {"id": "dc-09", "code": "VULNERABILITY", "name": "असुरक्षा, अपाङ्गता तथा सामाजिक सुरक्षा", "name_en": "Vulnerability, Disability & Social Security", "description": "अपाङ्गता, जोखिम घरधुरी, सामाजिक सुरक्षा भत्ता लाभान्वित", "display_order": 9},
    {"id": "dc-10", "code": "MIGRATION", "name": "बसाई–सराई तथा आप्रवासन", "name_en": "Migration & Immigration", "description": "आन्तरिक तथा बाह्य बसाई-सराई, वैदेशिक रोजगारी र रेमिट्यान्स", "display_order": 10},
]

# ─────────────────────────────────────────────────────────────────────────────
# 2. DEMOGRAPHIC INDICATORS (30 key indicators)
# ─────────────────────────────────────────────────────────────────────────────
DEMO_INDICATORS = [
    # Population
    {"id": "di-01", "code": "POP_TOTAL", "category_id": "dc-01", "name": "कुल जनसंख्या", "name_en": "Total Population", "unit_type": "count", "source_year": 2078, "display_order": 1},
    {"id": "di-02", "code": "POP_DENSITY", "category_id": "dc-01", "name": "जनघनत्व (प्रति वर्ग कि.मी.)", "name_en": "Population Density (per sq. km)", "unit_type": "ratio", "source_year": 2078, "display_order": 2},
    {"id": "di-03", "code": "POP_GROWTH_RATE", "category_id": "dc-01", "name": "वार्षिक जनसंख्या वृद्धिदर", "name_en": "Annual Population Growth Rate (%)", "unit_type": "percent", "source_year": 2078, "display_order": 3},
    {"id": "di-04", "code": "HH_TOTAL", "category_id": "dc-01", "name": "कुल घरधुरी संख्या", "name_en": "Total Households", "unit_type": "count", "source_year": 2078, "display_order": 4},
    # Gender
    {"id": "di-05", "code": "GENDER_MALE", "category_id": "dc-02", "name": "पुरुष जनसंख्या", "name_en": "Male Population", "unit_type": "count", "source_year": 2078, "display_order": 1},
    {"id": "di-06", "code": "GENDER_FEMALE", "category_id": "dc-02", "name": "महिला जनसंख्या", "name_en": "Female Population", "unit_type": "count", "source_year": 2078, "display_order": 2},
    {"id": "di-07", "code": "SEX_RATIO", "category_id": "dc-02", "name": "लिङ्ग अनुपात (प्रति १०० महिला)", "name_en": "Sex Ratio (per 100 females)", "unit_type": "ratio", "source_year": 2078, "display_order": 3},
    {"id": "di-08", "code": "FEMALE_HH_HEAD", "category_id": "dc-02", "name": "महिला घरमुली प्रतिशत", "name_en": "Female-headed Households (%)", "unit_type": "percent", "source_year": 2081, "display_order": 4},
    # Age Structure
    {"id": "di-09", "code": "AGE_UNDER15", "category_id": "dc-03", "name": "१५ वर्षमुनि जनसंख्या (%)", "name_en": "Population under 15 (%)", "unit_type": "percent", "source_year": 2078, "display_order": 1},
    {"id": "di-10", "code": "AGE_WORKING", "category_id": "dc-03", "name": "कार्यरत उमेर जनसंख्या १५-५९ (%)", "name_en": "Working Age Population 15-59 (%)", "unit_type": "percent", "source_year": 2078, "display_order": 2},
    {"id": "di-11", "code": "AGE_ELDERLY", "category_id": "dc-03", "name": "जेष्ठ नागरिक ६०+ (%)", "name_en": "Elderly Population 60+ (%)", "unit_type": "percent", "source_year": 2078, "display_order": 3},
    {"id": "di-12", "code": "DEPENDENCY_RATIO", "category_id": "dc-03", "name": "आश्रित अनुपात", "name_en": "Dependency Ratio", "unit_type": "ratio", "source_year": 2078, "display_order": 4},
    # Household
    {"id": "di-13", "code": "AVG_HH_SIZE", "category_id": "dc-04", "name": "औसत परिवार आकार", "name_en": "Average Household Size", "unit_type": "count", "source_year": 2078, "display_order": 1},
    {"id": "di-14", "code": "HH_PERMANENT", "category_id": "dc-04", "name": "पक्की घर भएका घरधुरी (%)", "name_en": "Households with Permanent House (%)", "unit_type": "percent", "source_year": 2078, "display_order": 2},
    # Literacy
    {"id": "di-15", "code": "LIT_TOTAL", "category_id": "dc-05", "name": "कुल साक्षरता दर (%)", "name_en": "Total Literacy Rate (%)", "unit_type": "percent", "source_year": 2078, "display_order": 1},
    {"id": "di-16", "code": "LIT_MALE", "category_id": "dc-05", "name": "पुरुष साक्षरता दर (%)", "name_en": "Male Literacy Rate (%)", "unit_type": "percent", "source_year": 2078, "display_order": 2},
    {"id": "di-17", "code": "LIT_FEMALE", "category_id": "dc-05", "name": "महिला साक्षरता दर (%)", "name_en": "Female Literacy Rate (%)", "unit_type": "percent", "source_year": 2078, "display_order": 3},
    {"id": "di-18", "code": "SCH_GER", "category_id": "dc-05", "name": "विद्यालय कुल भर्ना दर (GER %)", "name_en": "Gross Enrolment Rate (%)", "unit_type": "percent", "source_year": 2080, "display_order": 4},
    {"id": "di-19", "code": "SCH_NER", "category_id": "dc-05", "name": "विद्यालय शुद्ध भर्ना दर (NER %)", "name_en": "Net Enrolment Rate (%)", "unit_type": "percent", "source_year": 2080, "display_order": 5},
    # Economic
    {"id": "di-20", "code": "ECON_LABOUR_FORCE", "category_id": "dc-06", "name": "श्रमशक्ति सहभागिता दर (%)", "name_en": "Labour Force Participation Rate (%)", "unit_type": "percent", "source_year": 2078, "display_order": 1},
    {"id": "di-21", "code": "ECON_FOREIGN", "category_id": "dc-06", "name": "वैदेशिक रोजगारीमा जनसंख्या", "name_en": "Population in Foreign Employment", "unit_type": "count", "source_year": 2081, "display_order": 2},
    {"id": "di-22", "code": "ECON_REMITTANCE", "category_id": "dc-06", "name": "वार्षिक रेमिट्यान्स (करोड रु.)", "name_en": "Annual Remittance (NPR Crore)", "unit_type": "currency", "source_year": 2080, "display_order": 3},
    # Housing
    {"id": "di-23", "code": "HOUSE_PIPED_WATER", "category_id": "dc-07", "name": "धाराबाट पानी पाउने घरधुरी (%)", "name_en": "HH with Piped Water Access (%)", "unit_type": "percent", "source_year": 2078, "display_order": 1},
    {"id": "di-24", "code": "HOUSE_ELECTRICITY", "category_id": "dc-07", "name": "विद्युत पहुँच भएका घरधुरी (%)", "name_en": "HH with Electricity Access (%)", "unit_type": "percent", "source_year": 2078, "display_order": 2},
    {"id": "di-25", "code": "HOUSE_TOILET", "category_id": "dc-07", "name": "शौचालय भएका घरधुरी (%)", "name_en": "HH with Toilet Facility (%)", "unit_type": "percent", "source_year": 2081, "display_order": 3},
    {"id": "di-26", "code": "HOUSE_INTERNET", "category_id": "dc-07", "name": "इन्टरनेट पहुँच भएका घरधुरी (%)", "name_en": "HH with Internet Access (%)", "unit_type": "percent", "source_year": 2081, "display_order": 4},
    # Vulnerability
    {"id": "di-27", "code": "VUL_DISABILITY", "category_id": "dc-09", "name": "कुल अपाङ्ग जनसंख्या", "name_en": "Total Population with Disability", "unit_type": "count", "source_year": 2078, "display_order": 1},
    {"id": "di-28", "code": "VUL_SSA", "category_id": "dc-09", "name": "सामाजिक सुरक्षा भत्ता लाभान्वित", "name_en": "Social Security Allowance Beneficiaries", "unit_type": "count", "source_year": 2081, "display_order": 2},
    # Migration
    {"id": "di-29", "code": "MIG_ABSENT", "category_id": "dc-10", "name": "अनुपस्थित जनसंख्या (विदेश तथा अन्य)", "name_en": "Absent Population (Abroad & Others)", "unit_type": "count", "source_year": 2078, "display_order": 1},
    {"id": "di-30", "code": "MIG_INFLOW", "category_id": "dc-10", "name": "आप्रवासी जनसंख्या (आएका)", "name_en": "In-Migrant Population", "unit_type": "count", "source_year": 2078, "display_order": 2},
]

# ─────────────────────────────────────────────────────────────────────────────
# 3. DEMOGRAPHIC VALUES
#    Panchpokhari Thangpal Rural Municipality - Population Census 2078 Data
#    Total Population: 17,521 | Households: 4,820 | 8 Wards
# ─────────────────────────────────────────────────────────────────────────────
DEMO_VALUES = [
    # ── Population Totals ──
    {"id": "dv-001", "indicator_id": "di-01", "segment_key": "total", "segment_label": "कुल जनसंख्या", "ward_number": None, "value_number": "17521", "source_note": "राष्ट्रिय जनगणना २०७८, केन्द्रीय तथ्याङ्क विभाग"},
    {"id": "dv-002", "indicator_id": "di-04", "segment_key": "total", "segment_label": "कुल घरधुरी", "ward_number": None, "value_number": "4820", "source_note": "राष्ट्रिय जनगणना २०७८"},
    {"id": "dv-003", "indicator_id": "di-02", "segment_key": "total", "segment_label": "जनघनत्व/वर्ग कि.मी.", "ward_number": None, "value_number": "28", "source_note": "क्षेत्रफल ६२६.४ वर्ग कि.मी."},
    {"id": "dv-004", "indicator_id": "di-03", "segment_key": "total", "segment_label": "वार्षिक वृद्धिदर", "ward_number": None, "value_number": "-0.42", "source_note": "जनगणना २०७८ (बसाई-सराईका कारण नकारात्मक)"},
    # ── Population by Ward ──
    {"id": "dv-005", "indicator_id": "di-01", "segment_key": "ward_1", "segment_label": "वडा नं. १", "ward_number": 1, "value_number": "2850", "source_note": "जनगणना २०७८"},
    {"id": "dv-006", "indicator_id": "di-01", "segment_key": "ward_2", "segment_label": "वडा नं. २", "ward_number": 2, "value_number": "3120", "source_note": "जनगणना २०७८"},
    {"id": "dv-007", "indicator_id": "di-01", "segment_key": "ward_3", "segment_label": "वडा नं. ३", "ward_number": 3, "value_number": "2940", "source_note": "जनगणना २०७८"},
    {"id": "dv-008", "indicator_id": "di-01", "segment_key": "ward_4", "segment_label": "वडा नं. ४", "ward_number": 4, "value_number": "3650", "source_note": "जनगणना २०७८"},
    {"id": "dv-009", "indicator_id": "di-01", "segment_key": "ward_5", "segment_label": "वडा नं. ५", "ward_number": 5, "value_number": "2480", "source_note": "जनगणना २०७८"},
    {"id": "dv-010", "indicator_id": "di-01", "segment_key": "ward_6", "segment_label": "वडा नं. ६", "ward_number": 6, "value_number": "2710", "source_note": "जनगणना २०७८"},
    {"id": "dv-011", "indicator_id": "di-01", "segment_key": "ward_7", "segment_label": "वडा नं. ७", "ward_number": 7, "value_number": "3420", "source_note": "जनगणना २०७८"},
    {"id": "dv-012", "indicator_id": "di-01", "segment_key": "ward_8", "segment_label": "वडा नं. ८", "ward_number": 8, "value_number": "2980", "source_note": "जनगणना २०७८"},
    # ── Gender ──
    {"id": "dv-013", "indicator_id": "di-05", "segment_key": "total", "segment_label": "पुरुष जनसंख्या", "ward_number": None, "value_number": "8156", "source_note": "जनगणना २०७८"},
    {"id": "dv-014", "indicator_id": "di-06", "segment_key": "total", "segment_label": "महिला जनसंख्या", "ward_number": None, "value_number": "9365", "source_note": "जनगणना २०७८ (पुरुष गैरहाजरीका कारण महिला बढी)"},
    {"id": "dv-015", "indicator_id": "di-07", "segment_key": "total", "segment_label": "लिङ्ग अनुपात", "ward_number": None, "value_number": "87.1", "source_note": "जनगणना २०७८ (प्रति १०० महिला)"},
    {"id": "dv-016", "indicator_id": "di-08", "segment_key": "total", "segment_label": "महिला घरमुली %", "ward_number": None, "value_number": "42.3", "source_note": "घरधुरी दर्ता तथ्याङ्क २०८१"},
    # ── Age Structure ──
    {"id": "dv-017", "indicator_id": "di-09", "segment_key": "total", "segment_label": "१५ वर्षमुनि %", "ward_number": None, "value_number": "28.4", "source_note": "जनगणना २०७८"},
    {"id": "dv-018", "indicator_id": "di-10", "segment_key": "total", "segment_label": "कार्यरत उमेर %", "ward_number": None, "value_number": "61.8", "source_note": "जनगणना २०७८"},
    {"id": "dv-019", "indicator_id": "di-11", "segment_key": "total", "segment_label": "जेष्ठ नागरिक ६०+ %", "ward_number": None, "value_number": "9.8", "source_note": "जनगणना २०७८"},
    {"id": "dv-020", "indicator_id": "di-12", "segment_key": "total", "segment_label": "आश्रित अनुपात", "ward_number": None, "value_number": "61.8", "source_note": "जनगणना २०७८"},
    # ── Household Structure ──
    {"id": "dv-021", "indicator_id": "di-13", "segment_key": "total", "segment_label": "औसत परिवार आकार", "ward_number": None, "value_number": "3.63", "source_note": "जनगणना २०७८"},
    {"id": "dv-022", "indicator_id": "di-14", "segment_key": "total", "segment_label": "पक्की घर %", "ward_number": None, "value_number": "44.2", "source_note": "जनगणना २०७८"},
    # ── Literacy ──
    {"id": "dv-023", "indicator_id": "di-15", "segment_key": "total", "segment_label": "कुल साक्षरता दर", "ward_number": None, "value_number": "72.4", "source_note": "जनगणना २०७८"},
    {"id": "dv-024", "indicator_id": "di-16", "segment_key": "total", "segment_label": "पुरुष साक्षरता", "ward_number": None, "value_number": "82.1", "source_note": "जनगणना २०७८"},
    {"id": "dv-025", "indicator_id": "di-17", "segment_key": "total", "segment_label": "महिला साक्षरता", "ward_number": None, "value_number": "63.8", "source_note": "जनगणना २०७८"},
    {"id": "dv-026", "indicator_id": "di-18", "segment_key": "total", "segment_label": "विद्यालय भर्ना दर (GER)", "ward_number": None, "value_number": "94.2", "source_note": "शिक्षा विकास निर्देशनालय, २०८०"},
    {"id": "dv-027", "indicator_id": "di-19", "segment_key": "total", "segment_label": "विद्यालय भर्ना दर (NER)", "ward_number": None, "value_number": "87.6", "source_note": "शिक्षा विकास निर्देशनालय, २०८०"},
    # ── Economic ──
    {"id": "dv-028", "indicator_id": "di-20", "segment_key": "total", "segment_label": "श्रमशक्ति सहभागिता दर", "ward_number": None, "value_number": "68.4", "source_note": "जनगणना २०७८"},
    {"id": "dv-029", "indicator_id": "di-21", "segment_key": "total", "segment_label": "वैदेशिक रोजगारीमा", "ward_number": None, "value_number": "1842", "source_note": "श्रम विभाग तथ्याङ्क, २०८१"},
    {"id": "dv-030", "indicator_id": "di-22", "segment_key": "total", "segment_label": "वार्षिक रेमिट्यान्स", "ward_number": None, "value_number": "12.4", "source_note": "नेपाल राष्ट्र बैंक, सिन्धुपाल्चोक क्षेत्र अनुमान २०८०"},
    # ── Housing ──
    {"id": "dv-031", "indicator_id": "di-23", "segment_key": "total", "segment_label": "धाराको पानी %", "ward_number": None, "value_number": "74.2", "source_note": "जनगणना २०७८"},
    {"id": "dv-032", "indicator_id": "di-24", "segment_key": "total", "segment_label": "विद्युत पहुँच %", "ward_number": None, "value_number": "89.3", "source_note": "जनगणना २०७८"},
    {"id": "dv-033", "indicator_id": "di-25", "segment_key": "total", "segment_label": "शौचालय सुविधा %", "ward_number": None, "value_number": "92.1", "source_note": "ODF घोषणा तथ्याङ्क, २०८१"},
    {"id": "dv-034", "indicator_id": "di-26", "segment_key": "total", "segment_label": "इन्टरनेट पहुँच %", "ward_number": None, "value_number": "61.4", "source_note": "एनटीसी तथा संचार सेवा प्रदायक तथ्याङ्क, २०८१"},
    # ── Vulnerability ──
    {"id": "dv-035", "indicator_id": "di-27", "segment_key": "total", "segment_label": "कुल अपाङ्ग", "ward_number": None, "value_number": "312", "source_note": "जनगणना २०७८ (१.८%)"},
    {"id": "dv-036", "indicator_id": "di-28", "segment_key": "total", "segment_label": "सामाजिक सुरक्षा भत्ता लाभान्वित", "ward_number": None, "value_number": "1248", "source_note": "सामाजिक सुरक्षा कार्यक्रम, २०८१"},
    # ── Migration ──
    {"id": "dv-037", "indicator_id": "di-29", "segment_key": "total", "segment_label": "अनुपस्थित जनसंख्या", "ward_number": None, "value_number": "2840", "source_note": "जनगणना २०७८"},
    {"id": "dv-038", "indicator_id": "di-30", "segment_key": "total", "segment_label": "आप्रवासी जनसंख्या", "ward_number": None, "value_number": "580", "source_note": "जनगणना २०७८"},
]

# ─────────────────────────────────────────────────────────────────────────────
# 4. INDICATORS TABLE (document-extracted baseline indicators)
#    These are from budget/plan documents extracted via AI document analysis
# ─────────────────────────────────────────────────────────────────────────────
INDICATORS_DATA = [
    # Demographic
    {"nameEn": "Total Population (2078 Census)", "nameNp": "कुल जनसंख्या (जनगणना २०७८)", "category": "demographics", "subCategory": "population", "value": 17521, "unit": "persons", "fiscalYear": "2078/079", "target": 18500, "percentage": 94.7, "verificationStatus": "verified"},
    {"nameEn": "Total Households", "nameNp": "कुल घरधुरी संख्या", "category": "demographics", "subCategory": "household", "value": 4820, "unit": "households", "fiscalYear": "2078/079", "target": 5200, "percentage": 92.7, "verificationStatus": "verified"},
    {"nameEn": "Literacy Rate (Total)", "nameNp": "कुल साक्षरता दर", "category": "demographics", "subCategory": "literacy", "value": 72.4, "unit": "percent", "fiscalYear": "2078/079", "target": 85, "percentage": 85.2, "verificationStatus": "verified"},
    {"nameEn": "Female Literacy Rate", "nameNp": "महिला साक्षरता दर", "category": "demographics", "subCategory": "literacy", "value": 63.8, "unit": "percent", "fiscalYear": "2078/079", "target": 80, "percentage": 79.8, "verificationStatus": "verified"},
    # Infrastructure
    {"nameEn": "Road Network Length (Motorable)", "nameNp": "मोटरेबल सडक जाल (कि.मी.)", "category": "infrastructure", "subCategory": "road", "value": 84.5, "unit": "km", "fiscalYear": "2081/082", "target": 120, "percentage": 70.4, "verificationStatus": "verified"},
    {"nameEn": "Households with Piped Water Access", "nameNp": "धाराको पानी पाउने घरधुरी %", "category": "infrastructure", "subCategory": "water", "value": 74.2, "unit": "percent", "fiscalYear": "2081/082", "target": 100, "percentage": 74.2, "verificationStatus": "verified"},
    {"nameEn": "Households with Electricity", "nameNp": "विद्युत पहुँच भएका घरधुरी %", "category": "infrastructure", "subCategory": "energy", "value": 89.3, "unit": "percent", "fiscalYear": "2081/082", "target": 100, "percentage": 89.3, "verificationStatus": "verified"},
    {"nameEn": "Households with Internet Access", "nameNp": "इन्टरनेट पहुँच भएका घरधुरी %", "category": "infrastructure", "subCategory": "digital", "value": 61.4, "unit": "percent", "fiscalYear": "2081/082", "target": 90, "percentage": 68.2, "verificationStatus": "verified"},
    # Finance
    {"nameEn": "Annual Budget (NPR)", "nameNp": "वार्षिक बजेट (रुपैयाँ)", "category": "finance", "subCategory": "budget", "value": 389500000, "unit": "NPR", "fiscalYear": "2081/082", "target": 420000000, "percentage": 92.7, "verificationStatus": "verified"},
    {"nameEn": "Own Source Revenue Collection", "nameNp": "आन्तरिक आय संकलन (रुपैयाँ)", "category": "finance", "subCategory": "revenue", "value": 18750000, "unit": "NPR", "fiscalYear": "2080/081", "target": 22000000, "percentage": 85.2, "verificationStatus": "verified"},
    {"nameEn": "Capital Expenditure Rate", "nameNp": "पूँजीगत खर्च दर %", "category": "finance", "subCategory": "expenditure", "value": 78.4, "unit": "percent", "fiscalYear": "2080/081", "target": 90, "percentage": 87.1, "verificationStatus": "verified"},
    # Education
    {"nameEn": "School Gross Enrollment Rate", "nameNp": "विद्यालय कुल भर्ना दर (GER %)", "category": "education", "subCategory": "enrollment", "value": 94.2, "unit": "percent", "fiscalYear": "2080/081", "target": 98, "percentage": 96.1, "verificationStatus": "verified"},
    {"nameEn": "Student-Teacher Ratio (Primary)", "nameNp": "विद्यार्थी-शिक्षक अनुपात (प्राथमिक)", "category": "education", "subCategory": "quality", "value": 22.4, "unit": "ratio", "fiscalYear": "2080/081", "target": 30, "percentage": 74.7, "verificationStatus": "verified"},
    {"nameEn": "Schools with Female Toilets", "nameNp": "महिला शौचालय भएका विद्यालय %", "category": "education", "subCategory": "facility", "value": 88.9, "unit": "percent", "fiscalYear": "2080/081", "target": 100, "percentage": 88.9, "verificationStatus": "verified"},
    # Health
    {"nameEn": "Institutional Delivery Rate", "nameNp": "संस्थागत प्रसूति दर %", "category": "health", "subCategory": "maternal", "value": 84.6, "unit": "percent", "fiscalYear": "2080/081", "target": 95, "percentage": 89.1, "verificationStatus": "verified"},
    {"nameEn": "Under-5 Vaccination Coverage", "nameNp": "५ वर्षमुनि बच्चाको खोप पूर्ण दर %", "category": "health", "subCategory": "immunization", "value": 92.4, "unit": "percent", "fiscalYear": "2081/082", "target": 98, "percentage": 94.3, "verificationStatus": "verified"},
    {"nameEn": "Doctor Population Ratio", "nameNp": "चिकित्सक जनसंख्या अनुपात", "category": "health", "subCategory": "workforce", "value": 1.0 / 5840, "unit": "doctor:population", "fiscalYear": "2081/082", "target": 1.0 / 1000, "percentage": 17.1, "verificationStatus": "verified"},
    # Agriculture
    {"nameEn": "Agricultural Land (Hectares)", "nameNp": "कृषिजन्य जमिन (हेक्टर)", "category": "agriculture", "subCategory": "land", "value": 2840, "unit": "hectares", "fiscalYear": "2080/081", "target": 3200, "percentage": 88.8, "verificationStatus": "verified"},
    {"nameEn": "Irrigated Agricultural Land %", "nameNp": "सिँचित कृषि जमिन %", "category": "agriculture", "subCategory": "irrigation", "value": 42.3, "unit": "percent", "fiscalYear": "2080/081", "target": 70, "percentage": 60.4, "verificationStatus": "verified"},
    # Governance
    {"nameEn": "Open Government Initiatives", "nameNp": "खुला सरकार सम्बन्धी पहलहरू", "category": "governance", "subCategory": "transparency", "value": 8, "unit": "count", "fiscalYear": "2081/082", "target": 10, "percentage": 80, "verificationStatus": "verified"},
    {"nameEn": "Ward Citizen Forums Conducted", "nameNp": "वडागत नागरिक सभा आयोजित (वर्षमा)", "category": "governance", "subCategory": "participation", "value": 24, "unit": "sessions", "fiscalYear": "2080/081", "target": 32, "percentage": 75, "verificationStatus": "verified"},
]

# ─────────────────────────────────────────────────────────────────────────────
# 5. PROGRESS INDICATOR RECORDS (Field monitoring data - 15 project assets)
#    Covers roads, bridges, water, buildings, irrigation with GPS coordinates
# ─────────────────────────────────────────────────────────────────────────────
PROGRESS_RECORDS = [
    {
        "asset_unique_id": "PTRM-PIR-RD-001",
        "plan_code": "PTRM-2080-01-RD",
        "fiscal_year": "२०८०/०८१",
        "period_type": "1_year",
        "module_key": 1,
        "module_title_nepali": "सडक तथा पुल (Roads & Bridges)",
        "asset_name": "मेलम्ची-तिपेनी-भोताङ मुख्य सडक कालोपत्रे",
        "ward_number": 3,
        "tole_basti": "थाङपालधाप-भोताङ",
        "lat": 27.9280, "lng": 85.5920,
        "gps_accuracy": 2.4, "elevation_meters": 1580,
        "geom_type": "line",
        "geometry_coordinates": [[85.582, 27.912], [85.595, 27.928], [85.598, 27.935], [85.612, 27.954]],
        "start_date": "२०८०/०१/०१", "completion_date": "२०८०/११/३०",
        "contractor_or_committee": "शेर्पा-लामा जेभी निर्माण सेवा",
        "construction_cost": 85000000, "expenditure_amount": 83200000,
        "physical_progress_percent": 100,
        "beneficiary_households": 1250, "beneficiary_population": 5400,
        "condition": "good",
        "last_maintenance_date": "२०८१/०४/१५",
        "responsible_agency": "गाउँ कार्यपालिकाको कार्यालय, पूर्वाधार शाखा",
        "qr_code_token": "PTRM-RD-001-QR",
        "is_verified": True,
        "thematic_data": {"surfaceType": "blacktopped_and_gravel", "laneCount": 1, "totalLengthKm": 18.5, "bridgeCount": 2}
    },
    {
        "asset_unique_id": "PTRM-PIR-RD-002",
        "plan_code": "PTRM-2079-02-RD",
        "fiscal_year": "२०७९/०८०",
        "period_type": "1_year",
        "module_key": 1,
        "module_title_nepali": "सडक तथा पुल (Roads & Bridges)",
        "asset_name": "थाङपालधाप-गुन्सा कृषि सडक स्तरोन्नति",
        "ward_number": 5,
        "tole_basti": "गुन्सा-थाङपालधाप",
        "lat": 27.9480, "lng": 85.6100,
        "gps_accuracy": 3.1, "elevation_meters": 1720,
        "geom_type": "line",
        "geometry_coordinates": [[85.598, 27.935], [85.610, 27.945], [85.621, 27.962]],
        "start_date": "२०७९/०४/०१", "completion_date": "२०७९/१२/२८",
        "contractor_or_committee": "थाङपाल निर्माण उपभोक्ता समिति",
        "construction_cost": 22500000, "expenditure_amount": 21800000,
        "physical_progress_percent": 100,
        "beneficiary_households": 480, "beneficiary_population": 2100,
        "condition": "good",
        "last_maintenance_date": "२०८१/०२/०८",
        "responsible_agency": "वडा नं. ५ कार्यालय",
        "qr_code_token": "PTRM-RD-002-QR",
        "is_verified": True,
        "thematic_data": {"surfaceType": "gravel", "laneCount": 1, "totalLengthKm": 8.2}
    },
    {
        "asset_unique_id": "PTRM-PIR-BR-001",
        "plan_code": "PTRM-2079-01-BR",
        "fiscal_year": "२०७९/०८०",
        "period_type": "1_year",
        "module_key": 1,
        "module_title_nepali": "सडक तथा पुल (Roads & Bridges)",
        "asset_name": "याङ्ग्री खोला आरसीसी मोटरेबल पुल",
        "ward_number": 2,
        "tole_basti": "याङ्ग्री दोभान",
        "lat": 27.9120, "lng": 85.5820,
        "gps_accuracy": 1.8, "elevation_meters": 1240,
        "geom_type": "point",
        "geometry_coordinates": [85.5820, 27.9120],
        "start_date": "२०७९/०१/०१", "completion_date": "२०७९/१०/१५",
        "contractor_or_committee": "सडक डिभिजन कार्यालय",
        "construction_cost": 42000000, "expenditure_amount": 41500000,
        "physical_progress_percent": 100,
        "beneficiary_households": 2200, "beneficiary_population": 9800,
        "condition": "excellent",
        "last_maintenance_date": "२०८०/०८/२०",
        "responsible_agency": "गाउँ कार्यपालिकाको कार्यालय",
        "qr_code_token": "PTRM-BR-001-QR",
        "is_verified": True,
        "thematic_data": {"bridgeType": "RCC", "spanMeters": 45, "loadCapacityTon": 18}
    },
    {
        "asset_unique_id": "PTRM-PIR-WS-001",
        "plan_code": "PTRM-2080-01-WS",
        "fiscal_year": "२०८०/०८१",
        "period_type": "1_year",
        "module_key": 2,
        "module_title_nepali": "खानेपानी तथा सरसफाइ (WASH)",
        "asset_name": "थाङपालकोट लिफ्टिङ खानेपानी आयोजना (एक घर एक धारा)",
        "ward_number": 4,
        "tole_basti": "थाङपालकोट मुख्य बस्ती",
        "lat": 27.9420, "lng": 85.6050,
        "gps_accuracy": 2.2, "elevation_meters": 1650,
        "geom_type": "line",
        "geometry_coordinates": [[85.590, 27.932], [85.598, 27.939], [85.605, 27.942]],
        "start_date": "२०८०/०२/०१", "completion_date": "२०८०/१२/१५",
        "contractor_or_committee": "थाङपालकोट खानेपानी उपभोक्ता समिति",
        "construction_cost": 18500000, "expenditure_amount": 18200000,
        "physical_progress_percent": 100,
        "beneficiary_households": 250, "beneficiary_population": 1150,
        "condition": "good",
        "last_maintenance_date": "२०८१/०३/१०",
        "responsible_agency": "खानेपानी तथा सरसफाइ डिभिजन",
        "qr_code_token": "PTRM-WS-001-QR",
        "is_verified": True,
        "thematic_data": {"pipelineLengthKm": 8.2, "tapConnections": 250, "waterSourceType": "gravity_and_pump", "treatmentPlant": True}
    },
    {
        "asset_unique_id": "PTRM-PIR-WS-002",
        "plan_code": "PTRM-2081-01-WS",
        "fiscal_year": "२०८१/०८२",
        "period_type": "1_year",
        "module_key": 2,
        "module_title_nepali": "खानेपानी तथा सरसफाइ (WASH)",
        "asset_name": "पाँचपोखरी बृहत् लिफ्टिङ शुद्धीकरण खानेपानी स्किम",
        "ward_number": 3,
        "tole_basti": "भोताङ-छ्योपार-पाँचपोखरी",
        "lat": 28.0120, "lng": 85.6980,
        "gps_accuracy": 1.5, "elevation_meters": 2480,
        "geom_type": "line",
        "geometry_coordinates": [[85.680, 28.000], [85.690, 28.006], [85.698, 28.012]],
        "start_date": "२०८१/०१/०१", "completion_date": "२०८२/०३/३०",
        "contractor_or_committee": "पाँचपोखरी खानेपानी उपभोक्ता समिति",
        "construction_cost": 35000000, "expenditure_amount": 22400000,
        "physical_progress_percent": 64,
        "beneficiary_households": 550, "beneficiary_population": 2400,
        "condition": "under_construction",
        "responsible_agency": "खानेपानी शाखा, गाउँ कार्यपालिका",
        "qr_code_token": "PTRM-WS-002-QR",
        "is_verified": True,
        "thematic_data": {"pipelineLengthKm": 14.5, "tapConnections": 550, "waterSourceType": "spring_and_pump", "treatmentPlant": True, "solarPumping": True}
    },
    {
        "asset_unique_id": "PTRM-PIR-BLD-001",
        "plan_code": "PTRM-2078-01-BLD",
        "fiscal_year": "२०७८/०७९",
        "period_type": "1_year",
        "module_key": 3,
        "module_title_nepali": "भवन तथा संस्थागत निर्माण (Building Construction)",
        "asset_name": "गाउँ कार्यपालिका प्रशासनिक मुख्य भवन (३ तल्ला)",
        "ward_number": 3,
        "tole_basti": "थाङपालधाप-३ (गाउँपालिका केन्द्र)",
        "lat": 27.9354, "lng": 85.5982,
        "gps_accuracy": 1.2, "elevation_meters": 1565,
        "geom_type": "point",
        "geometry_coordinates": [85.5982, 27.9354],
        "start_date": "२०७७/१०/०१", "completion_date": "२०७८/०९/१५",
        "contractor_or_committee": "हिमालय भवन निर्माण कम्पनी",
        "construction_cost": 65000000, "expenditure_amount": 64200000,
        "physical_progress_percent": 100,
        "beneficiary_households": 4820, "beneficiary_population": 17521,
        "condition": "excellent",
        "last_maintenance_date": "२०८१/०१/२०",
        "responsible_agency": "गाउँ कार्यपालिकाको कार्यालय",
        "qr_code_token": "PTRM-BLD-001-QR",
        "is_verified": True,
        "thematic_data": {"floors": 3, "totalRooms": 24, "totalAreaSqFt": 8400, "hasConferenceHall": True, "hasDigitalRoom": True}
    },
    {
        "asset_unique_id": "PTRM-PIR-BLD-002",
        "plan_code": "PTRM-2080-02-BLD",
        "fiscal_year": "२०८०/०८१",
        "period_type": "1_year",
        "module_key": 3,
        "module_title_nepali": "भवन तथा संस्थागत निर्माण (Building Construction)",
        "asset_name": "बरुवा प्राथमिक स्वास्थ्य केन्द्र १५-शय्या भवन",
        "ward_number": 5,
        "tole_basti": "बरुवा डाँडा",
        "lat": 27.9510, "lng": 85.5740,
        "gps_accuracy": 2.0, "elevation_meters": 1420,
        "geom_type": "point",
        "geometry_coordinates": [85.5740, 27.9510],
        "start_date": "२०८०/०३/०१", "completion_date": "२०८१/०२/२८",
        "contractor_or_committee": "सघन सहरी तथा भवन निर्माण आयोजना",
        "construction_cost": 65000000, "expenditure_amount": 58500000,
        "physical_progress_percent": 90,
        "beneficiary_households": 1800, "beneficiary_population": 7900,
        "condition": "near_completion",
        "responsible_agency": "स्वास्थ्य शाखा, गाउँ कार्यपालिका",
        "qr_code_token": "PTRM-BLD-002-QR",
        "is_verified": True,
        "thematic_data": {"beds": 15, "hasOperationRoom": True, "hasLabFacility": True, "hasXrayRoom": True, "hasMaternityWard": True}
    },
    {
        "asset_unique_id": "PTRM-PIR-IRR-001",
        "plan_code": "PTRM-2079-01-IRR",
        "fiscal_year": "२०७९/०८०",
        "period_type": "1_year",
        "module_key": 4,
        "module_title_nepali": "सिँचाइ तथा जलश्रोत (Irrigation & Water Resources)",
        "asset_name": "गुन्सा-मानेखर्क पकेट क्षेत्र सिँचाइ कुलो",
        "ward_number": 6,
        "tole_basti": "गुन्सा बेसी",
        "lat": 27.9620, "lng": 85.6210,
        "gps_accuracy": 3.5, "elevation_meters": 1340,
        "geom_type": "line",
        "geometry_coordinates": [[85.615, 27.955], [85.625, 27.965], [85.635, 27.975]],
        "start_date": "२०७९/०३/०१", "completion_date": "२०७९/१२/०१",
        "contractor_or_committee": "जलस्रोत तथा सिँचाइ डिभिजन",
        "construction_cost": 9500000, "expenditure_amount": 9200000,
        "physical_progress_percent": 100,
        "beneficiary_households": 180, "beneficiary_population": 850,
        "condition": "fair",
        "last_maintenance_date": "२०८०/०५/०१",
        "responsible_agency": "कृषि तथा सिँचाइ शाखा",
        "qr_code_token": "PTRM-IRR-001-QR",
        "is_verified": True,
        "thematic_data": {"canalLengthKm": 4.5, "irrigatedHectares": 120, "cropTypes": ["rice", "wheat", "vegetables"], "headworkType": "weir"}
    },
    {
        "asset_unique_id": "PTRM-PIR-EDU-001",
        "plan_code": "PTRM-2080-03-EDU",
        "fiscal_year": "२०८०/०८१",
        "period_type": "1_year",
        "module_key": 5,
        "module_title_nepali": "शिक्षा पूर्वाधार (Education Infrastructure)",
        "asset_name": "श्री थाङपाल भ्याली मा.वि. नयाँ कक्षाकोठा भवन (१२ कोठा)",
        "ward_number": 4,
        "tole_basti": "याङ्ग्री-२",
        "lat": 27.9380, "lng": 85.5990,
        "gps_accuracy": 2.5, "elevation_meters": 1580,
        "geom_type": "point",
        "geometry_coordinates": [85.5990, 27.9380],
        "start_date": "२०८०/०४/०१", "completion_date": "२०८०/१२/३०",
        "contractor_or_committee": "विद्यालय व्यवस्थापन समिति तथा सम्बन्धित वडा",
        "construction_cost": 12500000, "expenditure_amount": 12200000,
        "physical_progress_percent": 100,
        "beneficiary_households": 680, "beneficiary_population": 840,
        "condition": "excellent",
        "last_maintenance_date": "२०८१/०६/०१",
        "responsible_agency": "शिक्षा शाखा, वडा नं. ४",
        "qr_code_token": "PTRM-EDU-001-QR",
        "is_verified": True,
        "thematic_data": {"classrooms": 12, "hasToilet": True, "hasLibrary": True, "hasComputerLab": True, "totalStudents": 412}
    },
    {
        "asset_unique_id": "PTRM-PIR-COM-001",
        "plan_code": "PTRM-2081-02-COM",
        "fiscal_year": "२०८१/०८२",
        "period_type": "1_year",
        "module_key": 6,
        "module_title_nepali": "सञ्चार तथा डिजिटल पूर्वाधार (ICT & Digital Infrastructure)",
        "asset_name": "पाँचपोखरी पदमार्ग सौर्य ऊर्जा तथा फाइबर अप्टिक सञ्चार लाइन",
        "ward_number": 3,
        "tole_basti": "भोताङ-छ्योपार-पाँचपोखरी",
        "lat": 28.0120, "lng": 85.6980,
        "gps_accuracy": 4.2, "elevation_meters": 2480,
        "geom_type": "line",
        "geometry_coordinates": [[85.600, 27.940], [85.640, 27.970], [85.698, 28.012]],
        "start_date": "२०८१/०१/०१", "completion_date": "२०८१/११/३०",
        "contractor_or_committee": "नेपाल टेलिकम तथा पालिका",
        "construction_cost": 14000000, "expenditure_amount": 8500000,
        "physical_progress_percent": 61,
        "beneficiary_households": 450, "beneficiary_population": 3500,
        "condition": "under_construction",
        "responsible_agency": "सूचना प्रविधि शाखा, गाउँ कार्यपालिका",
        "qr_code_token": "PTRM-COM-001-QR",
        "is_verified": True,
        "thematic_data": {"fiberLengthKm": 22, "towersInstalled": 4, "targetTowers": 7, "solarPanelsKw": 12, "coverageVillages": ["भोताङ", "छ्योपार", "पाँचपोखरी ताल"]}
    },
    {
        "asset_unique_id": "PTRM-PIR-ENV-001",
        "plan_code": "PTRM-2080-04-ENV",
        "fiscal_year": "२०८०/०८१",
        "period_type": "1_year",
        "module_key": 7,
        "module_title_nepali": "वातावरण तथा वन संरक्षण (Environment & Forest Conservation)",
        "asset_name": "पाँचपोखरी पदमार्ग फोहोरमैला व्यवस्थापन तथा ओपन डिफिकेसन फ्री अभियान",
        "ward_number": 3,
        "tole_basti": "पाँचपोखरी-छ्योपार क्षेत्र",
        "lat": 27.9800, "lng": 85.6700,
        "gps_accuracy": 3.0, "elevation_meters": 2280,
        "geom_type": "polygon",
        "geometry_coordinates": [[85.660, 27.975], [85.680, 27.975], [85.680, 27.990], [85.660, 27.990], [85.660, 27.975]],
        "start_date": "२०८०/०५/०१", "completion_date": "२०८०/१०/३०",
        "contractor_or_committee": "पाँचपोखरी पर्यटन तथा वातावरण विकास मञ्च",
        "construction_cost": 2800000, "expenditure_amount": 2650000,
        "physical_progress_percent": 100,
        "beneficiary_households": 4820, "beneficiary_population": 17521,
        "condition": "good",
        "last_maintenance_date": "२०८१/०२/०१",
        "responsible_agency": "वातावरण तथा वन शाखा",
        "qr_code_token": "PTRM-ENV-001-QR",
        "is_verified": True,
        "thematic_data": {"dustbinsInstalled": 10, "bioToiletsBuilt": 2, "areaCleanedHectares": 35, "treesPlanted": 1200, "ODF_declared": True}
    },
    {
        "asset_unique_id": "PTRM-PIR-AGR-001",
        "plan_code": "PTRM-2080-05-AGR",
        "fiscal_year": "२०८०/०८१",
        "period_type": "1_year",
        "module_key": 8,
        "module_title_nepali": "कृषि तथा पशुपालन (Agriculture & Livestock)",
        "asset_name": "गुन्सा-मानेखर्क किवी, अलैंची तथा मह उत्पादन सामूहिक खेती कार्यक्रम",
        "ward_number": 6,
        "tole_basti": "मानेखर्क-गुन्सा",
        "lat": 27.9650, "lng": 85.6280,
        "gps_accuracy": 4.0, "elevation_meters": 1820,
        "geom_type": "polygon",
        "geometry_coordinates": [[85.620, 27.960], [85.636, 27.960], [85.636, 27.970], [85.620, 27.970], [85.620, 27.960]],
        "start_date": "२०८०/०६/०१", "completion_date": "२०८०/१२/३१",
        "contractor_or_committee": "थाङपाल महिला बहुउद्देश्यीय सहकारी",
        "construction_cost": 5200000, "expenditure_amount": 5050000,
        "physical_progress_percent": 100,
        "beneficiary_households": 220, "beneficiary_population": 980,
        "condition": "good",
        "last_maintenance_date": "२०८१/०३/१५",
        "responsible_agency": "कृषि ज्ञान केन्द्र तथा गाउँ कार्यपालिका",
        "qr_code_token": "PTRM-AGR-001-QR",
        "is_verified": True,
        "thematic_data": {"kiwiTreesPlanted": 4200, "cardamomHectares": 8.5, "beehivesEstablished": 120, "farmGroupsFormed": 12}
    },
    {
        "asset_unique_id": "PTRM-PIR-TOU-001",
        "plan_code": "PTRM-2081-03-TOU",
        "fiscal_year": "२०८१/०८२",
        "period_type": "1_year",
        "module_key": 9,
        "module_title_nepali": "पर्यटन पूर्वाधार (Tourism Infrastructure)",
        "asset_name": "पाँचपोखरी ताल पर्यटक सूचना केन्द्र तथा व्यूटावर निर्माण",
        "ward_number": 3,
        "tole_basti": "पाँचपोखरी ताल किनार",
        "lat": 28.0150, "lng": 85.6990,
        "gps_accuracy": 1.5, "elevation_meters": 4100,
        "geom_type": "point",
        "geometry_coordinates": [85.6990, 28.0150],
        "start_date": "२०८१/०२/०१", "completion_date": "२०८२/०१/३१",
        "contractor_or_committee": "पाँचपोखरी थाङपाल गाउँपालिका (पर्यटन शाखा)",
        "construction_cost": 8500000, "expenditure_amount": 3200000,
        "physical_progress_percent": 38,
        "beneficiary_households": 4820, "beneficiary_population": 17521,
        "condition": "under_construction",
        "responsible_agency": "पर्यटन तथा संस्कृति शाखा",
        "qr_code_token": "PTRM-TOU-001-QR",
        "is_verified": False,
        "thematic_data": {"viewTowerHeightM": 12, "hasInfoCenter": True, "hasPublicToilet": True, "hasSolarPanel": True, "targetVisitorsPerDay": 150}
    },
    {
        "asset_unique_id": "PTRM-PIR-DIS-001",
        "plan_code": "PTRM-2080-06-DIS",
        "fiscal_year": "२०८०/०८१",
        "period_type": "1_year",
        "module_key": 10,
        "module_title_nepali": "विपद् जोखिम न्यूनीकरण (Disaster Risk Reduction)",
        "asset_name": "इन्द्रावती नदी तटबन्ध तथा गाभियो संरचना (वडा ६-७ सिमाना)",
        "ward_number": 6,
        "tole_basti": "लागर्चे-याङ्ग्री दोभान",
        "lat": 27.9680, "lng": 85.6350,
        "gps_accuracy": 2.8, "elevation_meters": 1180,
        "geom_type": "line",
        "geometry_coordinates": [[85.625, 27.962], [85.635, 27.965], [85.645, 27.968]],
        "start_date": "२०८०/०१/०१", "completion_date": "२०८०/०९/३०",
        "contractor_or_committee": "जलाधार तथा नदी नियन्त्रण विभाग",
        "construction_cost": 14200000, "expenditure_amount": 13800000,
        "physical_progress_percent": 100,
        "beneficiary_households": 380, "beneficiary_population": 1650,
        "condition": "good",
        "last_maintenance_date": "२०८१/०५/०१",
        "responsible_agency": "विपद् व्यवस्थापन शाखा तथा नदी नियन्त्रण विभाग",
        "qr_code_token": "PTRM-DIS-001-QR",
        "is_verified": True,
        "thematic_data": {"embankmentLengthM": 620, "gabionWallM": 180, "RRMasonryM": 85, "protectedFamilies": 380}
    },
    {
        "asset_unique_id": "PTRM-PIR-SOC-001",
        "plan_code": "PTRM-2080-07-SOC",
        "fiscal_year": "२०८०/०८१",
        "period_type": "1_year",
        "module_key": 11,
        "module_title_nepali": "सामाजिक विकास तथा महिला सशक्तिकरण (Social Development)",
        "asset_name": "थाङपाल बहुउद्देश्यीय सामुदायिक भवन तथा महिला विकास केन्द्र",
        "ward_number": 2,
        "tole_basti": "याङ्ग्री-२ (वडा केन्द्र)",
        "lat": 27.9180, "lng": 85.5880,
        "gps_accuracy": 2.1, "elevation_meters": 1280,
        "geom_type": "point",
        "geometry_coordinates": [85.5880, 27.9180],
        "start_date": "२०७९/१२/०१", "completion_date": "२०८०/०८/३०",
        "contractor_or_committee": "याङ्ग्री सामुदायिक विकास समिति",
        "construction_cost": 9800000, "expenditure_amount": 9500000,
        "physical_progress_percent": 100,
        "beneficiary_households": 620, "beneficiary_population": 2750,
        "condition": "good",
        "last_maintenance_date": "२०८०/१२/०१",
        "responsible_agency": "सामाजिक विकास शाखा",
        "qr_code_token": "PTRM-SOC-001-QR",
        "is_verified": True,
        "thematic_data": {"rooms": 8, "hasSkillTrainingCenter": True, "hasChildCareCenter": True, "hasMeetingHall": True, "womenGroupsMeeting": 22}
    },
]


def seed_option38():
    db = SessionLocal()
    try:
        print("🚀 Starting Option 38: Demographic Indicators & Progress Tracker Seeding...")

        # ── 1. Demographic Categories ──────────────────────────────────────────
        cats_seeded = 0
        for item in DEMO_CATEGORIES:
            if not db.query(DemographicCategory).filter(DemographicCategory.id == item["id"]).first():
                cat = DemographicCategory(
                    id=item["id"],
                    code=item["code"],
                    name=item["name"],
                    name_en=item["name_en"],
                    description=item["description"],
                    display_order=item["display_order"],
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                db.add(cat)
                cats_seeded += 1
        db.commit()
        print(f"  ✓ Seeded {cats_seeded} categories into demographic_categories.")

        # ── 2. Demographic Indicators ──────────────────────────────────────────
        inds_seeded = 0
        for item in DEMO_INDICATORS:
            if not db.query(DemographicIndicator).filter(DemographicIndicator.id == item["id"]).first():
                ind = DemographicIndicator(
                    id=item["id"],
                    code=item["code"],
                    category_id=item["category_id"],
                    name=item["name"],
                    name_en=item["name_en"],
                    unit_type=item["unit_type"],
                    source_year=item["source_year"],
                    display_order=item["display_order"],
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                db.add(ind)
                inds_seeded += 1
        db.commit()
        print(f"  ✓ Seeded {inds_seeded} indicators into demographic_indicators.")

        # ── 3. Demographic Values ──────────────────────────────────────────────
        vals_seeded = 0
        for item in DEMO_VALUES:
            from models.demographics import DemographicValue as DV
            if not db.query(DV).filter(DV.id == item["id"]).first():
                val = DV(
                    id=item["id"],
                    tenant_id=TENANT_ID,
                    local_level_name=LOCAL_LEVEL,
                    indicator_id=item["indicator_id"],
                    segment_key=item["segment_key"],
                    segment_label=item["segment_label"],
                    ward_number=item["ward_number"],
                    value_number=Decimal(item["value_number"]),
                    source_note=item["source_note"],
                    captured_on=CAPTURED_DATE,
                    updated_at=datetime.utcnow()
                )
                db.add(val)
                vals_seeded += 1
        db.commit()
        print(f"  ✓ Seeded {vals_seeded} values into demographic_values.")

        # ── 4. Indicators Table (document-extracted baseline indicators) ───────
        inds_tbl_seeded = 0
        for item in INDICATORS_DATA:
            new_id = str(uuid.uuid4())
            check = db.execute(text(
                'SELECT id FROM indicators WHERE "nameEn" = :name AND "fiscalYear" = :fy LIMIT 1'
            ), {"name": item["nameEn"], "fy": item["fiscalYear"]}).first()
            if not check:
                db.execute(text("""
                    INSERT INTO indicators 
                    (id, tenant_id, "nameEn", "nameNp", category, "subCategory", value, unit, "fiscalYear", "baselineYear", target, percentage, "wardNumber", "verificationStatus", "createdAt", "updatedAt")
                    VALUES (:id, :tid, :nameEn, :nameNp, :category, :subCat, :value, :unit, :fy, :by_, :target, :pct, :ward, :vs, NOW(), NOW())
                """), {
                    "id": new_id,
                    "tid": TENANT_ID,
                    "nameEn": item["nameEn"],
                    "nameNp": item["nameNp"],
                    "category": item["category"],
                    "subCat": item.get("subCategory"),
                    "value": item.get("value", 0),
                    "unit": item.get("unit", "count"),
                    "fy": item["fiscalYear"],
                    "by_": item.get("baselineYear", "2078/079"),
                    "target": item.get("target"),
                    "pct": item.get("percentage"),
                    "ward": item.get("wardNumber"),
                    "vs": item.get("verificationStatus", "verified"),
                })
                inds_tbl_seeded += 1
        db.commit()
        print(f"  ✓ Seeded {inds_tbl_seeded} baseline indicators into indicators.")

        # ── 5. Progress Indicator Records ──────────────────────────────────────
        from models.report import ProgressIndicatorRecord
        pir_seeded = 0
        for item in PROGRESS_RECORDS:
            existing = db.query(ProgressIndicatorRecord).filter(
                ProgressIndicatorRecord.asset_unique_id == item["asset_unique_id"]
            ).first()
            if not existing:
                pir = ProgressIndicatorRecord(
                    id=uuid.uuid4(),
                    tenant_id=TENANT_ID,
                    asset_unique_id=item["asset_unique_id"],
                    plan_code=item["plan_code"],
                    fiscal_year=item["fiscal_year"],
                    period_type=item["period_type"],
                    module_key=item["module_key"],
                    module_title_nepali=item["module_title_nepali"],
                    asset_name=item["asset_name"],
                    ward_number=item["ward_number"],
                    tole_basti=item["tole_basti"],
                    lat=item["lat"],
                    lng=item["lng"],
                    gps_accuracy=item["gps_accuracy"],
                    elevation_meters=item["elevation_meters"],
                    geom_type=item["geom_type"],
                    geometry_coordinates=item["geometry_coordinates"],
                    start_date=item["start_date"],
                    completion_date=item["completion_date"],
                    contractor_or_committee=item["contractor_or_committee"],
                    construction_cost=item["construction_cost"],
                    expenditure_amount=item["expenditure_amount"],
                    physical_progress_percent=item["physical_progress_percent"],
                    beneficiary_households=item["beneficiary_households"],
                    beneficiary_population=item["beneficiary_population"],
                    condition=item["condition"],
                    last_maintenance_date=item.get("last_maintenance_date"),
                    responsible_agency=item["responsible_agency"],
                    qr_code_token=item["qr_code_token"],
                    is_verified=item["is_verified"],
                    thematic_data=item["thematic_data"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(pir)
                pir_seeded += 1
        db.commit()
        print(f"  ✓ Seeded {pir_seeded} field progress records into progress_indicator_records.")

        print("\n🎉 Option 38 Seeding Successfully Completed!")
        print("   Tables populated: demographic_categories, demographic_indicators,")
        print("   demographic_values, indicators, progress_indicator_records")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during Option 38 seeding: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_option38()
