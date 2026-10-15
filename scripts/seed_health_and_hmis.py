import psycopg2
import uuid
import json
import sys
from datetime import datetime, date

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'

FACILITIES_DATA = [
    {
        "id": "fac-06-01",
        "name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "nameEn": "Panchpokhari Primary Hospital",
        "wardNumber": 6,
        "type": "hospital",
        "totalBeds": 15,
        "hasAmbulance": True,
        "latitude": 27.9405,
        "longitude": 85.5925,
        "orderNo": 1,
        "address": "थाङपालधाप, गाउँपालिका केन्द्र",
        "location": "थाङपालधाप बजार",
        "categoryNepali": "प्राथमिक तहको अस्पताल (१५ शय्या)",
        "designation": "मेडिकल सुपरिटेन्डेन्ट",
        "chiefName": "डा. सन्दीप श्रेष्ठ",
        "phone": "9851022401"
    },
    {
        "id": "fac-01-01",
        "name": "बाँसखर्क स्वास्थ्य चौकी तथा बर्थिङ सेन्टर",
        "nameEn": "Banskharka Health Post & Birthing Center",
        "wardNumber": 1,
        "type": "health_post",
        "totalBeds": 2,
        "hasAmbulance": False,
        "latitude": 27.9455,
        "longitude": 85.6135,
        "orderNo": 2,
        "address": "बाँसखर्क बजार, वडा नं १",
        "location": "बाँसखर्क",
        "categoryNepali": "स्वास्थ्य चौकी (बर्थिङ सेन्टर सहित)",
        "designation": "इन्चार्ज (एचए)",
        "chiefName": "विमला तामाङ",
        "phone": "9841335501"
    },
    {
        "id": "fac-02-01",
        "name": "बरुवा स्वास्थ्य चौकी तथा बर्थिङ सेन्टर",
        "nameEn": "Baruwa Health Post & Birthing Center",
        "wardNumber": 2,
        "type": "health_post",
        "totalBeds": 2,
        "hasAmbulance": False,
        "latitude": 27.9545,
        "longitude": 85.5895,
        "orderNo": 3,
        "address": "बरुवा मुख्य बस्ती, वडा नं २",
        "location": "बरुवा",
        "categoryNepali": "स्वास्थ्य चौकी",
        "designation": "सिनियर अहेव",
        "chiefName": "दावा लामा",
        "phone": "9841556602"
    },
    {
        "id": "fac-03-01",
        "name": "भोताङ प्राथमिक स्वास्थ्य केन्द्र",
        "nameEn": "Bhotang Primary Health Center",
        "wardNumber": 3,
        "type": "hospital",
        "totalBeds": 5,
        "hasAmbulance": True,
        "latitude": 27.9655,
        "longitude": 85.6110,
        "orderNo": 4,
        "address": "भोताङ बजार, वडा नं ३",
        "location": "भोताङ",
        "categoryNepali": "प्राथमिक स्वास्थ्य केन्द्र (बर्थिङ सेन्टर सहित)",
        "designation": "मेडिकल अधिकृत",
        "chiefName": "डा. पेम्बा शेर्पा",
        "phone": "9849002203"
    },
    {
        "id": "fac-03-02",
        "name": "छिम्ती सामुदायिक स्वास्थ्य एकाइ",
        "nameEn": "Chhimti Community Health Unit",
        "wardNumber": 3,
        "type": "clinic",
        "totalBeds": 1,
        "hasAmbulance": False,
        "latitude": 27.9690,
        "longitude": 85.6150,
        "orderNo": 5,
        "address": "छिम्ती बस्ती, वडा नं ३",
        "location": "छिम्ती",
        "categoryNepali": "सामुदायिक स्वास्थ्य एकाइ",
        "designation": "अनमी",
        "chiefName": "ल्हाक्पा डोल्मा लामा",
        "phone": "9849002204"
    },
    {
        "id": "fac-04-01",
        "name": "मानेखर्क स्वास्थ्य चौकी तथा प्रसूति गृह",
        "nameEn": "Manekharka Health Post & Birthing Center",
        "wardNumber": 4,
        "type": "health_post",
        "totalBeds": 3,
        "hasAmbulance": False,
        "latitude": 27.9615,
        "longitude": 85.5985,
        "orderNo": 6,
        "address": "मानेखर्क बजार, वडा नं ४",
        "location": "मानेखर्क",
        "categoryNepali": "स्वास्थ्य चौकी (प्रसूति गृह सहित)",
        "designation": "स्टाफ नर्स / इन्चार्ज",
        "chiefName": "सीता घिमिरे",
        "phone": "9851088804"
    },
    {
        "id": "fac-05-01",
        "name": "गुन्सा स्वास्थ्य चौकी",
        "nameEn": "Gunsa Health Post",
        "wardNumber": 5,
        "type": "health_post",
        "totalBeds": 2,
        "hasAmbulance": False,
        "latitude": 27.9238,
        "longitude": 85.5805,
        "orderNo": 7,
        "address": "गुन्सा बजार, वडा नं ५",
        "location": "गुन्सा",
        "categoryNepali": "स्वास्थ्य चौकी",
        "designation": "अहेव / इन्चार्ज",
        "chiefName": "केशव पराजुली",
        "phone": "9841668805"
    },
    {
        "id": "fac-06-02",
        "name": "थाङपालधाप गाउँ घर क्लिनिक",
        "nameEn": "Thangpaldhap Village Clinic",
        "wardNumber": 6,
        "type": "clinic",
        "totalBeds": 1,
        "hasAmbulance": False,
        "latitude": 27.9420,
        "longitude": 85.5940,
        "orderNo": 8,
        "address": "धाप गाउँ, वडा नं ६",
        "location": "धाप",
        "categoryNepali": "गाउँ घर क्लिनिक तथा खोप केन्द्र",
        "designation": "अनमी",
        "chiefName": "गीता श्रेष्ठ",
        "phone": "9851022406"
    },
    {
        "id": "fac-07-01",
        "name": "भोटेनाम्लाङ स्वास्थ्य चौकी, तिपेनी",
        "nameEn": "Bhotenamlang Health Post, Tipeni",
        "wardNumber": 7,
        "type": "health_post",
        "totalBeds": 3,
        "hasAmbulance": True,
        "latitude": 27.9120,
        "longitude": 85.5695,
        "orderNo": 9,
        "address": "तिपेनी मुख्य बजार, वडा नं ७",
        "location": "तिपेनी",
        "categoryNepali": "स्वास्थ्य चौकी (बर्थिङ सेन्टर सहित)",
        "designation": "एचए / इन्चार्ज",
        "chiefName": "राजाराम श्रेष्ठ",
        "phone": "9849334407"
    },
    {
        "id": "fac-08-01",
        "name": "लाँगर्चे स्वास्थ्य चौकी",
        "nameEn": "Langarche Health Post",
        "wardNumber": 8,
        "type": "health_post",
        "totalBeds": 2,
        "hasAmbulance": False,
        "latitude": 27.9090,
        "longitude": 85.5750,
        "orderNo": 10,
        "address": "लाँगर्चे बजार, वडा नं ८",
        "location": "लाँगर्चे",
        "categoryNepali": "स्वास्थ्य चौकी",
        "designation": "अनमी / इन्चार्ज",
        "chiefName": "पार्वती खत्री",
        "phone": "9851012408"
    }
]

AMBULANCES_DATA = [
    {
        "id": "amb-01",
        "driver_name": "राम कुमार तामाङ",
        "vehicle_number": "बा २ झ ४५२१",
        "contact_number": "9841228801",
        "station_location": "पाँचपोखरी प्राथमिक अस्पताल, थाङपालधाप",
        "ward_number": 6,
        "is_available": True,
        "notes": "२४सै घण्टा आपत्कालीन सेवा, अक्सिजन तथा स्ट्रेचर सुविधायुक्त"
    },
    {
        "id": "amb-02",
        "driver_name": "निमा शेर्पा",
        "vehicle_number": "बा २ झ ६७१८",
        "contact_number": "9849008802",
        "station_location": "भोताङ स्वास्थ्य चौकी परिसर, भोताङ",
        "ward_number": 3,
        "is_available": True,
        "notes": "उच्च हिमाली ४-ह्विल ड्राइभ एम्बुलेन्स, छिम्ती-भोताङ क्षेत्र"
    },
    {
        "id": "amb-03",
        "driver_name": "सुरेश दनुवार",
        "vehicle_number": "बा २ झ ५५३०",
        "contact_number": "9849338803",
        "station_location": "तिपेनी बजार चोक, भोटेनाम्लाङ",
        "ward_number": 7,
        "is_available": True,
        "notes": "मेलम्ची करिडोर तथा तिपेनी बजार आपत्कालीन सेवा"
    },
    {
        "id": "amb-04",
        "driver_name": "सोम बहादुर गोले",
        "vehicle_number": "बा २ झ ३३१२",
        "contact_number": "9841338804",
        "station_location": "बाँसखर्क-बरुवा सिमाना, वडा नं १/२",
        "ward_number": 1,
        "is_available": True,
        "notes": "बाँसखर्क र बरुवा क्षेत्रका लागि आकस्मिक एम्बुलेन्स सेवा"
    }
]

PATIENTS_DATA = [
    {
        "patient_no": "PT-2081-001",
        "first_name": "सरिता",
        "last_name": "तामाङ",
        "full_name": "सरिता तामाङ",
        "age": 28,
        "gender": "female",
        "phone": "9841223301",
        "ward_number": 6,
        "address": "थाङपालधाप-६",
        "has_health_insurance": True,
        "insurance_number": "INS-2081-6012",
        "department": "प्रसूति तथा स्त्रीरोग (Maternity / ANC)",
        "attending_doctor": "डा. सन्दीप श्रेष्ठ",
        "ticket_fee": 0.0,
        "ticket_status": "active",
        "blood_pressure": "110/70",
        "pulse_rate": "76",
        "temperature_f": "98.4",
        "spo2_percent": "98%",
        "weight_kg": "58",
        "chief_complaint": "गर्भावस्थाको ३२ हप्ता, नियमित गर्भजाँच (४ ANC भिजिट)",
        "provisional_diagnosis": "Single intrauterine pregnancy at 32 weeks, normal progression"
    },
    {
        "patient_no": "PT-2081-002",
        "first_name": "दावा",
        "last_name": "शेर्पा",
        "full_name": "दावा शेर्पा",
        "age": 54,
        "gender": "male",
        "phone": "9849001102",
        "ward_number": 3,
        "address": "भोताङ-३",
        "has_health_insurance": True,
        "insurance_number": "INS-2081-3045",
        "department": "सामान्य चिकित्सा (General OPD)",
        "attending_doctor": "डा. पेम्बा शेर्पा",
        "ticket_fee": 0.0,
        "ticket_status": "active",
        "blood_pressure": "145/95",
        "pulse_rate": "82",
        "temperature_f": "98.6",
        "spo2_percent": "96%",
        "weight_kg": "67",
        "chief_complaint": "टाउको दुख्ने, चक्कर लाग्ने, विगत ३ दिनदेखि",
        "provisional_diagnosis": "Essential Hypertension Stage 1"
    },
    {
        "patient_no": "PT-2081-003",
        "first_name": "रोशन",
        "last_name": "घिमिरे",
        "full_name": "रोशन घिमिरे",
        "age": 8,
        "gender": "male",
        "phone": "9851088703",
        "ward_number": 4,
        "address": "मानेखर्क-४",
        "has_health_insurance": False,
        "insurance_number": None,
        "department": "बालरोग (Pediatrics)",
        "attending_doctor": "डा. सन्दीप श्रेष्ठ",
        "ticket_fee": 20.0,
        "ticket_status": "active",
        "blood_pressure": "100/65",
        "pulse_rate": "90",
        "temperature_f": "101.2",
        "spo2_percent": "97%",
        "weight_kg": "24",
        "chief_complaint": "खोकी लाग्ने, ज्वरो आउने, छाती घ्यारघ्यार हुने",
        "provisional_diagnosis": "Acute Bronchitis / Mild Pneumonia"
    },
    {
        "patient_no": "PT-2081-004",
        "first_name": "सुमित्रा",
        "last_name": "दनुवार",
        "full_name": "सुमित्रा दनुवार",
        "age": 42,
        "gender": "female",
        "phone": "9849332204",
        "ward_number": 7,
        "address": "तिपेनी-७",
        "has_health_insurance": True,
        "insurance_number": "INS-2081-7089",
        "department": "सामान्य चिकित्सा (General OPD)",
        "attending_doctor": "राजाराम श्रेष्ठ (एचए)",
        "ticket_fee": 0.0,
        "ticket_status": "active",
        "blood_pressure": "120/80",
        "pulse_rate": "78",
        "temperature_f": "98.2",
        "spo2_percent": "98%",
        "weight_kg": "52",
        "chief_complaint": "पेट पोल्ने, अमिलो पानी आउने, खाना खान मन नलाग्ने",
        "provisional_diagnosis": "Acid Peptic Disease (Gastritis)"
    },
    {
        "patient_no": "PT-2081-005",
        "first_name": "टेक बहादुर",
        "last_name": "गोले",
        "full_name": "टेक बहादुर गोले",
        "age": 68,
        "gender": "male",
        "phone": "9841334405",
        "ward_number": 1,
        "address": "बाँसखर्क-१",
        "has_health_insurance": True,
        "insurance_number": "INS-2081-1011",
        "department": "सामान्य चिकित्सा (General OPD)",
        "attending_doctor": "विमला तामाङ (एचए)",
        "ticket_fee": 0.0,
        "ticket_status": "active",
        "blood_pressure": "130/85",
        "pulse_rate": "72",
        "temperature_f": "98.0",
        "spo2_percent": "95%",
        "weight_kg": "61",
        "chief_complaint": "खोकी लाग्ने, बिहान दम बढ्ने, ज्येष्ठ नागरिक चेकअप",
        "provisional_diagnosis": "Chronic Obstructive Pulmonary Disease (COPD)"
    }
]

IPD_ADMISSIONS_DATA = [
    {
        "admission_no": "IPD-2081-01",
        "patient_name": "दोर्जे लामा",
        "patient_age": 62,
        "patient_gender": "male",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "bed_number": "Bed-01 (Male Ward)",
        "admission_date": "२०८१-०५-२८",
        "admitting_doctor": "डा. सन्दीप श्रेष्ठ",
        "diagnosis": "Acute Exacerbation of COPD with Severe Hypoxia",
        "status": "admitted",
        "treatment_summary": "Nebulization, IV Hydrocortisone, O2 therapy @ 2L/min, IV Antibiotics",
        "has_insurance": True,
        "insurance_no": "INS-2081-6022"
    },
    {
        "admission_no": "IPD-2081-02",
        "patient_name": "अनिता तामाङ",
        "patient_age": 24,
        "patient_gender": "female",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "bed_number": "Bed-03 (Maternity Ward)",
        "admission_date": "२०८१-०५-२९",
        "admitting_doctor": "डा. सन्दीप श्रेष्ठ",
        "diagnosis": "Normal Spontaneous Vaginal Delivery (FTND), Postpartum Observation",
        "status": "admitted",
        "treatment_summary": "Healthy male newborn (3.1 kg), Postnatal monitoring, Vitamin K given",
        "has_insurance": True,
        "insurance_no": "INS-2081-4011"
    },
    {
        "admission_no": "IPD-2081-03",
        "patient_name": "राम कुमार खत्री",
        "patient_age": 45,
        "patient_gender": "male",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 8,
        "bed_number": "Bed-02 (Male Ward)",
        "admission_date": "२०८१-०५-३०",
        "admitting_doctor": "डा. सन्दीप श्रेष्ठ",
        "diagnosis": "Acute Gastroenteritis with Moderate Dehydration",
        "status": "admitted",
        "treatment_summary": "IV Ringers Lactate, Ondansetron, Pantoprazole, ORS",
        "has_insurance": False,
        "insurance_no": None
    }
]

MEDICINES_DATA = [
    {"medicineName": "Paracetamol 500mg Tablet", "genericName": "Paracetamol", "category": "essential", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "PCM-8101", "unit": "ट्याब्लेट", "stockQuantity": 15000, "minimumRequiredStock": 2000, "expiryDate": "२०८३/०४/०१", "status": "sufficient"},
    {"medicineName": "Amoxicillin 500mg Capsule", "genericName": "Amoxicillin", "category": "antibiotic", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "AMX-8102", "unit": "क्याप्सुल", "stockQuantity": 8500, "minimumRequiredStock": 1500, "expiryDate": "२०८२/१२/३०", "status": "sufficient"},
    {"medicineName": "Cetirizine 10mg Tablet", "genericName": "Cetirizine Hydrochloride", "category": "antiallergic", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "CTZ-8103", "unit": "ट्याब्लेट", "stockQuantity": 6200, "minimumRequiredStock": 1000, "expiryDate": "२०८३/०२/१५", "status": "sufficient"},
    {"medicineName": "ORS Sachet (जीवनजल)", "genericName": "Oral Rehydration Salts", "category": "essential", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "ORS-8104", "unit": "प्याकेट", "stockQuantity": 4500, "minimumRequiredStock": 800, "expiryDate": "२०८३/०६/०१", "status": "sufficient"},
    {"medicineName": "Metformin 500mg Tablet", "genericName": "Metformin Hydrochloride", "category": "ncd", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "MTF-8105", "unit": "ट्याब्लेट", "stockQuantity": 9200, "minimumRequiredStock": 1200, "expiryDate": "२०८३/०३/१०", "status": "sufficient"},
    {"medicineName": "Amlodipine 5mg Tablet", "genericName": "Amlodipine Besylate", "category": "ncd", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "AML-8106", "unit": "ट्याब्लेट", "stockQuantity": 7400, "minimumRequiredStock": 1000, "expiryDate": "२०८३/०१/२०", "status": "sufficient"},
    {"medicineName": "Pantoprazole 40mg Tablet", "genericName": "Pantoprazole Sodium", "category": "gastro", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "PNT-8107", "unit": "ट्याब्लेट", "stockQuantity": 5800, "minimumRequiredStock": 1000, "expiryDate": "२०८२/११/१५", "status": "sufficient"},
    {"medicineName": "Iron and Folic Acid Tablet", "genericName": "Ferrous Sulfate + Folic Acid", "category": "maternal", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "IFA-8108", "unit": "ट्याब्लेट", "stockQuantity": 12000, "minimumRequiredStock": 2000, "expiryDate": "२०८३/०५/०१", "status": "sufficient"},
    {"medicineName": "Albendazole 400mg Tablet", "genericName": "Albendazole", "category": "essential", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "ALB-8109", "unit": "ट्याब्लेट", "stockQuantity": 3500, "minimumRequiredStock": 500, "expiryDate": "२०८३/०८/०१", "status": "sufficient"},
    {"medicineName": "Azithromycin 500mg Tablet", "genericName": "Azithromycin", "category": "antibiotic", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "AZI-8110", "unit": "ट्याब्लेट", "stockQuantity": 1800, "minimumRequiredStock": 500, "expiryDate": "२०८२/१०/३०", "status": "sufficient"},
    {"medicineName": "Salbutamol Inhaler (100mcg)", "genericName": "Salbutamol", "category": "respiratory", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "SLB-8111", "unit": "इनहेलर", "stockQuantity": 150, "minimumRequiredStock": 50, "expiryDate": "२०८२/११/३०", "status": "sufficient"},
    {"medicineName": "Zinc Sulfate 20mg Tablet", "genericName": "Zinc Sulfate DT", "category": "pediatric", "healthFacilityName": "पाँचपोखरी प्राथमिक अस्पताल", "wardNumber": 6, "batchNo": "ZNC-8112", "unit": "ट्याब्लेट", "stockQuantity": 2800, "minimumRequiredStock": 500, "expiryDate": "२०८३/०४/१५", "status": "sufficient"}
]

DHIS2_REPORTS_DATA = [
    {
        "fiscal_year": "२०८१/०८२",
        "month_nepali": "भाद्र",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल",
        "ward_number": 6,
        "dhis2_org_unit_id": "NP_BAG_SIN_P01",
        "total_opd_visits": 520,
        "male_opd_visits": 230,
        "female_opd_visits": 290,
        "emergency_visits": 48,
        "first_anc_visits": 28,
        "four_anc_protocol_visits": 22,
        "institutional_deliveries": 14,
        "pnc_visits": 16,
        "fully_immunized_children": 35,
        "growth_monitored_children": 85,
        "diarrhea_cases": 9,
        "ari_pneumonia_cases": 18,
        "hypertension_diabetes_cases": 46,
        "mental_health_cases": 4,
        "reported_by": "डा. सन्दीप श्रेष्ठ (मेडिकल सुपरिटेन्डेन्ट)",
        "sync_status": "synced"
    },
    {
        "fiscal_year": "२०८१/०८२",
        "month_nepali": "भाद्र",
        "health_facility_name": "भोताङ प्राथमिक स्वास्थ्य केन्द्र",
        "ward_number": 3,
        "dhis2_org_unit_id": "NP_BAG_SIN_P03",
        "total_opd_visits": 310,
        "male_opd_visits": 140,
        "female_opd_visits": 170,
        "emergency_visits": 22,
        "first_anc_visits": 18,
        "four_anc_protocol_visits": 15,
        "institutional_deliveries": 8,
        "pnc_visits": 10,
        "fully_immunized_children": 24,
        "growth_monitored_children": 52,
        "diarrhea_cases": 5,
        "ari_pneumonia_cases": 12,
        "hypertension_diabetes_cases": 28,
        "mental_health_cases": 2,
        "reported_by": "डा. पेम्बा शेर्पा",
        "sync_status": "synced"
    },
    {
        "fiscal_year": "२०८१/०८२",
        "month_nepali": "भाद्र",
        "health_facility_name": "भोटेनाम्लाङ स्वास्थ्य चौकी, तिपेनी",
        "ward_number": 7,
        "dhis2_org_unit_id": "NP_BAG_SIN_P07",
        "total_opd_visits": 280,
        "male_opd_visits": 125,
        "female_opd_visits": 155,
        "emergency_visits": 16,
        "first_anc_visits": 15,
        "four_anc_protocol_visits": 12,
        "institutional_deliveries": 6,
        "pnc_visits": 8,
        "fully_immunized_children": 20,
        "growth_monitored_children": 45,
        "diarrhea_cases": 4,
        "ari_pneumonia_cases": 9,
        "hypertension_diabetes_cases": 22,
        "mental_health_cases": 1,
        "reported_by": "राजाराम श्रेष्ठ (एचए)",
        "sync_status": "synced"
    },
    {
        "fiscal_year": "२०८१/०८२",
        "month_nepali": "श्रावण",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल",
        "ward_number": 6,
        "dhis2_org_unit_id": "NP_BAG_SIN_P01",
        "total_opd_visits": 480,
        "male_opd_visits": 210,
        "female_opd_visits": 270,
        "emergency_visits": 42,
        "first_anc_visits": 24,
        "four_anc_protocol_visits": 19,
        "institutional_deliveries": 11,
        "pnc_visits": 14,
        "fully_immunized_children": 32,
        "growth_monitored_children": 78,
        "diarrhea_cases": 12,
        "ari_pneumonia_cases": 14,
        "hypertension_diabetes_cases": 40,
        "mental_health_cases": 3,
        "reported_by": "डा. सन्दीप श्रेष्ठ",
        "sync_status": "synced"
    }
]

INSURANCE_CLAIMS_DATA = [
    {
        "claim_no": "CLM-2081-001",
        "policy_number": "INS-2081-6012",
        "patient_no": "PT-2081-001",
        "patient_name": "सरिता तामाङ",
        "patient_age": 28,
        "patient_gender": "female",
        "claim_date_bs": "२०८१-०५-२८",
        "service_type": "ओपिडी तथा नियमित गर्भजाँच ल्याब",
        "diagnosis_name": "Pregnancy 32 weeks, Routine USG and Lab",
        "total_bill_amount": 2500.0,
        "copay_amount": 250.0,
        "claimed_amount": 2250.0,
        "reimbursed_amount": 2250.0,
        "claim_status": "approved",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल",
        "ward_number": 6,
        "remarks": "स्वास्थ्य बीमा बोर्डबाट भुक्तानी स्वीकृत"
    },
    {
        "claim_no": "CLM-2081-002",
        "policy_number": "INS-2081-3045",
        "patient_no": "PT-2081-002",
        "patient_name": "दावा शेर्पा",
        "patient_age": 54,
        "patient_gender": "male",
        "claim_date_bs": "२०८१-०५-२९",
        "service_type": "ओपिडी, इसीजी तथा १ महिनाको रक्तचाप औषधि",
        "diagnosis_name": "Essential Hypertension, ECG Normal",
        "total_bill_amount": 1800.0,
        "copay_amount": 180.0,
        "claimed_amount": 1620.0,
        "reimbursed_amount": 1620.0,
        "claim_status": "approved",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल",
        "ward_number": 3,
        "remarks": "स्वास्थ्य बीमा बोर्डबाट भुक्तानी स्वीकृत"
    },
    {
        "claim_no": "CLM-2081-003",
        "policy_number": "INS-2081-6022",
        "patient_no": "PT-2081-008",
        "patient_name": "दोर्जे लामा",
        "patient_age": 62,
        "patient_gender": "male",
        "claim_date_bs": "२०८१-०५-३०",
        "service_type": "अन्तरङ्ग (IPD) भर्ना तथा अक्सिजन थेरापी",
        "diagnosis_name": "COPD Acute Exacerbation, Inpatient Care",
        "total_bill_amount": 8500.0,
        "copay_amount": 850.0,
        "claimed_amount": 7650.0,
        "reimbursed_amount": None,
        "claim_status": "submitted",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल",
        "ward_number": 6,
        "remarks": "दाबी पेस भएको, बोर्डमा रुजु प्रक्रियामा"
    }
]

def seed_health():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()

    print("--- STEP 1: Seeding Health Facilities Table ---")
    cur.execute("DELETE FROM health_facilities")
    for f in FACILITIES_DATA:
        cur.execute("""
            INSERT INTO health_facilities (
                id, name, "nameEn", "wardNumber", type, "totalBeds",
                "hasAmbulance", latitude, longitude, "orderNo",
                address, location, "categoryNepali", designation,
                "chiefName", phone, "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            str(uuid.uuid5(uuid.NAMESPACE_DNS, f["id"])),
            f["name"],
            f["nameEn"],
            f["wardNumber"],
            f["type"],
            f["totalBeds"],
            f["hasAmbulance"],
            f["latitude"],
            f["longitude"],
            f["orderNo"],
            f["address"],
            f["location"],
            f["categoryNepali"],
            f["designation"],
            f["chiefName"],
            f["phone"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(FACILITIES_DATA)} health facilities across Wards 1 to 8.")

    print("\n--- STEP 2: Seeding Ambulances Table ---")
    cur.execute("DELETE FROM health_ambulances")
    for amb in AMBULANCES_DATA:
        cur.execute("""
            INSERT INTO health_ambulances (
                id, driver_name, vehicle_number, contact_number,
                station_location, ward_number, is_available, notes,
                "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            amb["id"],
            amb["driver_name"],
            amb["vehicle_number"],
            amb["contact_number"],
            amb["station_location"],
            amb["ward_number"],
            amb["is_available"],
            amb["notes"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(AMBULANCES_DATA)} ambulances into 'health_ambulances' table.")

    print("\n--- STEP 3: Seeding Patients (OPD) Table ---")
    cur.execute("DELETE FROM health_patients")
    for p in PATIENTS_DATA:
        cur.execute("""
            INSERT INTO health_patients (
                id, patient_no, first_name, last_name, full_name,
                age, gender, phone, ward_number, address,
                has_health_insurance, insurance_number,
                health_facility_name, department, attending_doctor,
                ticket_fee, ticket_status, blood_pressure, pulse_rate,
                temperature_f, spo2_percent, weight_kg,
                chief_complaint, provisional_diagnosis,
                "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s,
                %s, %s
            )
        """, (
            str(uuid.uuid4()),
            p["patient_no"],
            p["first_name"],
            p["last_name"],
            p["full_name"],
            p["age"],
            p["gender"],
            p["phone"],
            p["ward_number"],
            p["address"],
            p["has_health_insurance"],
            p["insurance_number"],
            "पाँचपोखरी प्राथमिक अस्पताल",
            p["department"],
            p["attending_doctor"],
            p["ticket_fee"],
            p["ticket_status"],
            p["blood_pressure"],
            p["pulse_rate"],
            p["temperature_f"],
            p["spo2_percent"],
            p["weight_kg"],
            p["chief_complaint"],
            p["provisional_diagnosis"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(PATIENTS_DATA)} OPD patients into 'health_patients' table.")

    print("\n--- STEP 4: Seeding IPD Admissions Table ---")
    cur.execute("DELETE FROM health_ipd_admissions")
    for ipd in IPD_ADMISSIONS_DATA:
        cur.execute("""
            INSERT INTO health_ipd_admissions (
                id, admission_no, patient_name, patient_age, patient_gender,
                health_facility_name, ward_number, bed_number, admission_date,
                admitting_doctor, diagnosis, status, treatment_summary,
                has_insurance, insurance_no, "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            str(uuid.uuid4()),
            ipd["admission_no"],
            ipd["patient_name"],
            ipd["patient_age"],
            ipd["patient_gender"],
            ipd["health_facility_name"],
            ipd["ward_number"],
            ipd["bed_number"],
            ipd["admission_date"],
            ipd["admitting_doctor"],
            ipd["diagnosis"],
            ipd["status"],
            ipd["treatment_summary"],
            ipd["has_insurance"],
            ipd["insurance_no"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(IPD_ADMISSIONS_DATA)} IPD admissions into 'health_ipd_admissions' table.")

    print("\n--- STEP 5: Seeding Medicines (e-LMIS) Table ---")
    cur.execute("DELETE FROM health_medicines")
    for med in MEDICINES_DATA:
        cur.execute("""
            INSERT INTO health_medicines (
                id, "medicineName", "genericName", category, "healthFacilityName",
                "wardNumber", "batchNo", unit, "stockQuantity", "minimumRequiredStock",
                "expiryDate", status, "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            str(uuid.uuid4()),
            med["medicineName"],
            med["genericName"],
            med["category"],
            med["healthFacilityName"],
            med["wardNumber"],
            med["batchNo"],
            med["unit"],
            med["stockQuantity"],
            med["minimumRequiredStock"],
            med["expiryDate"],
            med["status"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(MEDICINES_DATA)} medicines into 'health_medicines' table.")

    print("\n--- STEP 6: Seeding DHIS2 / HMIS Reports Table ---")
    cur.execute("DELETE FROM health_dhis2_reports")
    for r in DHIS2_REPORTS_DATA:
        cur.execute("""
            INSERT INTO health_dhis2_reports (
                id, fiscal_year, month_nepali, health_facility_name, ward_number,
                dhis2_org_unit_id, total_opd_visits, male_opd_visits, female_opd_visits,
                emergency_visits, first_anc_visits, four_anc_protocol_visits,
                institutional_deliveries, pnc_visits, fully_immunized_children,
                growth_monitored_children, diarrhea_cases, ari_pneumonia_cases,
                hypertension_diabetes_cases, mental_health_cases, reported_by,
                sync_status, synced_at, "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            str(uuid.uuid4()),
            r["fiscal_year"],
            r["month_nepali"],
            r["health_facility_name"],
            r["ward_number"],
            r["dhis2_org_unit_id"],
            r["total_opd_visits"],
            r["male_opd_visits"],
            r["female_opd_visits"],
            r["emergency_visits"],
            r["first_anc_visits"],
            r["four_anc_protocol_visits"],
            r["institutional_deliveries"],
            r["pnc_visits"],
            r["fully_immunized_children"],
            r["growth_monitored_children"],
            r["diarrhea_cases"],
            r["ari_pneumonia_cases"],
            r["hypertension_diabetes_cases"],
            r["mental_health_cases"],
            r["reported_by"],
            r["sync_status"],
            datetime.utcnow(),
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(DHIS2_REPORTS_DATA)} DHIS2 monthly reports into 'health_dhis2_reports' table.")

    print("\n--- STEP 7: Seeding Health Insurance Claims Table ---")
    cur.execute("DELETE FROM health_insurance_claims")
    for clm in INSURANCE_CLAIMS_DATA:
        cur.execute("""
            INSERT INTO health_insurance_claims (
                id, claim_no, policy_number, patient_no, patient_name,
                patient_age, patient_gender, claim_date_bs, service_type,
                diagnosis_name, total_bill_amount, copay_amount,
                claimed_amount, reimbursed_amount, claim_status,
                health_facility_name, ward_number, remarks,
                "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s
            )
        """, (
            str(uuid.uuid4()),
            clm["claim_no"],
            clm["policy_number"],
            clm["patient_no"],
            clm["patient_name"],
            clm["patient_age"],
            clm["patient_gender"],
            clm["claim_date_bs"],
            clm["service_type"],
            clm["diagnosis_name"],
            clm["total_bill_amount"],
            clm["copay_amount"],
            clm["claimed_amount"],
            clm["reimbursed_amount"],
            clm["claim_status"],
            clm["health_facility_name"],
            clm["ward_number"],
            clm["remarks"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(INSURANCE_CLAIMS_DATA)} health insurance claims into 'health_insurance_claims' table.")

    # Verification queries
    print("\n--- Summary Verification ---")
    cur.execute("SELECT count(*) FROM health_facilities")
    print(f"health_facilities: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM health_ambulances")
    print(f"health_ambulances: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM health_patients")
    print(f"health_patients: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM health_ipd_admissions")
    print(f"health_ipd_admissions: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM health_medicines")
    print(f"health_medicines: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM health_dhis2_reports")
    print(f"health_dhis2_reports: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM health_insurance_claims")
    print(f"health_insurance_claims: {cur.fetchone()[0]}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    seed_health()
