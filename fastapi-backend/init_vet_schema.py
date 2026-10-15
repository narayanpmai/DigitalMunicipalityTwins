"""
Initialize and Seed Veterinary Clinical Tables and Data
Panchpokhari Thangpal Gaupalika - Municipal Digital Twins
"""
from core.database import engine, SessionLocal, Base
from models.agriculture import (
    AgricultureVetMedicine,
    AgricultureVetDistribution,
    VetAiRecord,
    VetVaccinationRecord,
    VetDiagnosisRecord
)

INITIAL_AI_RECORDS = [
    { 
        "id": "AI-2081-01", 
        "farmer_name": "सुवास तामाङ", 
        "contact_phone": "9841234567", 
        "ward_number": 3, 
        "animal_type": "गाई (Cow)", 
        "breed": "होलिस्टिन फ्रिजियन (HF 75%)", 
        "straw_number": "NLDB-HF-9812", 
        "ai_date_bs": "२०८१/०६/१०", 
        "expected_calving_date_bs": "२०८२/०३/१८", 
        "technician_name": "रामेश्वर थापा (पशु प्राविधिक)", 
        "status": "सफल (Confirmed)", 
        "remarks": "पहिलो प्रयासमै गर्भधारण सफल" 
    },
    { 
        "id": "AI-2081-02", 
        "farmer_name": "पासाङ ल्हामु शेर्पा", 
        "contact_phone": "9861987654", 
        "ward_number": 1, 
        "animal_type": "चौँरी (Chauri)", 
        "breed": "अल्पाइन याक क्रस", 
        "straw_number": "YAK-ST-4421", 
        "ai_date_bs": "२०८१/०५/२४", 
        "expected_calving_date_bs": "२०८२/०२/२८", 
        "technician_name": "सोनाम लामा (जेटीए)", 
        "status": "निरीक्षण बाँकी (Pending)", 
        "remarks": "गर्भ परीक्षण बाँकी" 
    },
    { 
        "id": "AI-2081-03", 
        "farmer_name": "केशव पराजुली", 
        "contact_phone": "9851123456", 
        "ward_number": 6, 
        "animal_type": "भैंसी (Buffalo)", 
        "breed": "मुर्रा नश्ल (Murrah)", 
        "straw_number": "MUR-BUF-119", 
        "ai_date_bs": "२०८१/०६/०२", 
        "expected_calving_date_bs": "२०८२/०४/१५", 
        "technician_name": "रामेश्वर थापा (पशु प्राविधिक)", 
        "status": "पुनः गर्भाधान आवश्यक (Repeat)", 
        "remarks": "दोस्रो पटक आवश्यक" 
    }
]

INITIAL_VACCINE_RECORDS = [
    { 
        "id": "VAC-2081-101", 
        "vaccine_name": "पीपीआर (PPR) विरुद्धको खोप", 
        "ear_tag_number": "NP-PKT-81-00214", 
        "animal_type": "बाख्रा (Goat)", 
        "farmer_name": "दलबहादुर तामाङ", 
        "ward_number": 4, 
        "vaccinated_date_bs": "२०८१/०६/०५", 
        "booster_due_date_bs": "२०८२/०६/०५", 
        "batch_number": "PPR-2026-9", 
        "technician_name": "गोविन्द अधिकारी (भेटेरिनरी जेटीए)", 
        "status": "सम्पन्न (Completed)" 
    },
    { 
        "id": "VAC-2081-102", 
        "vaccine_name": "खोरेत (FMD) विरुद्धको खोप", 
        "ear_tag_number": "NP-PKT-81-00109", 
        "animal_type": "गाई (Cow)", 
        "farmer_name": "शर्मिला श्रेष्ठ", 
        "ward_number": 2, 
        "vaccinated_date_bs": "२०८१/०६/१२", 
        "booster_due_date_bs": "२०८१/१२/१२", 
        "batch_number": "FMD-O1", 
        "technician_name": "रामेश्वर थापा (पशु प्राविधिक)", 
        "status": "बूस्टर बाँकी (Booster Due)" 
    },
    { 
        "id": "VAC-2081-103", 
        "vaccine_name": "रेबिज (Rabies) विरुद्धको खोप", 
        "ear_tag_number": "NP-PKT-81-00845", 
        "animal_type": "कुकुर / अन्य (Canine/Other)", 
        "farmer_name": "ल्हाक्पा शेर्पा", 
        "ward_number": 3, 
        "vaccinated_date_bs": "२०८१/०५/१५", 
        "booster_due_date_bs": "२०८२/०५/१५", 
        "batch_number": "RAB-9901", 
        "technician_name": "सोनाम लामा (जेटीए)", 
        "status": "सम्पन्न (Completed)" 
    },
    { 
        "id": "VAC-2081-104", 
        "vaccine_name": "लम्पि स्किन (LSD) विरुद्धको खोप", 
        "ear_tag_number": "NP-PKT-81-00512", 
        "animal_type": "भैंसी (Buffalo)", 
        "farmer_name": "चक्र बहादुर खड्का", 
        "ward_number": 7, 
        "vaccinated_date_bs": "२०८१/०५/२८", 
        "booster_due_date_bs": "२०८२/०५/२८", 
        "batch_number": "LSD-N81", 
        "technician_name": "रामेश्वर थापा (पशु प्राविधिक)", 
        "status": "सम्पन्न (Completed)" 
    }
]

INITIAL_DIAGNOSIS_RECORDS = [
    { 
        "id": "DX-2081-201", 
        "farmer_name": "तेन्जिङ शेर्पा", 
        "ward_number": 1, 
        "animal_type": "चौँरी (Chauri)", 
        "symptoms": "उच्च ज्वरो, कडा सास फेर्ने, नाकबाट सिँगान बग्ने", 
        "suspected_disease": "हेमोरेजिक सेप्टिसेमिया (HS)", 
        "prescribed_medicine": "अक्सिटेट्रासाइक्लिन (Oxytetracycline) + प्यारासिटामोल", 
        "dosage_instructions": "दैनिक २० मिली मांसपेशीमा ३ दिनसम्म", 
        "doctor_technician": "डा. सञ्जय श्रेष्ठ (पशु चिकित्सक)", 
        "date_bs": "२०८१/०६/१०", 
        "status": "उपचार जारी (Under Treatment)" 
    },
    { 
        "id": "DX-2081-202", 
        "farmer_name": "कमला भण्डारी", 
        "ward_number": 5, 
        "animal_type": "गाई (Cow)", 
        "symptoms": "थुन सुन्निएको, दुधमा रगत/पिँप मिसिएको", 
        "suspected_disease": "म्यास्टाइटिस (Mastitis / थुनेलो)", 
        "prescribed_medicine": "इन्ट्राम्यामारी ट्युब + एन्टिबायोटिक पेन्सिलिन", 
        "dosage_instructions": "बिहान-बेलुका थुन सफा गरी ट्युब चढाउने", 
        "doctor_technician": "रामेश्वर थापा (पशु प्राविधिक)", 
        "date_bs": "२०८१/०६/०८", 
        "status": "निको भएको (Recovered)" 
    }
]

def init_vet_db():
    print("Creating veterinary tables if not existing...")
    Base.metadata.create_all(bind=engine)
    print("Tables verified.")

    db = SessionLocal()
    try:
        if db.query(VetAiRecord).count() == 0:
            print("Seeding AI records...")
            db.add_all([VetAiRecord(**r) for r in INITIAL_AI_RECORDS])
            db.commit()
            print("Seeded AI records.")

        if db.query(VetVaccinationRecord).count() == 0:
            print("Seeding vaccination records...")
            db.add_all([VetVaccinationRecord(**r) for r in INITIAL_VACCINE_RECORDS])
            db.commit()
            print("Seeded vaccination records.")

        if db.query(VetDiagnosisRecord).count() == 0:
            print("Seeding diagnosis records...")
            db.add_all([VetDiagnosisRecord(**r) for r in INITIAL_DIAGNOSIS_RECORDS])
            db.commit()
            print("Seeded diagnosis records.")

        print("=== Veterinary Clinical database initialization completed successfully! ===")
    except Exception as e:
        db.rollback()
        print("Error during vet initialization:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_vet_db()
