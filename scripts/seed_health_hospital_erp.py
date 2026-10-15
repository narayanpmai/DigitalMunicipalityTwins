import psycopg2
import uuid
import json
import sys
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'

SUPPLIERS_DATA = [
    {
        "id": "supp-01",
        "supplier_name": "सिन्धुपाल्चोक सर्जिकल तथा मेडिको सप्लायर्स",
        "contact_person": "राजेश श्रेष्ठ",
        "phone": "9851120300",
        "email": "sindhu.medico@gmail.com",
        "address": "चौतारा बजार, सिन्धुपाल्चोक",
        "pan_vat_number": "601248590",
        "bank_name": "राष्ट्रिय वाणिज्य बैंक, चौतारा",
        "bank_account_no": "104000123456",
        "status": "active"
    },
    {
        "id": "supp-02",
        "supplier_name": "नेपाल फर्मास्युटिकल डिस्ट्रिब्युटर्स प्रा.लि.",
        "contact_person": "दिपक अधिकारी",
        "phone": "9841223344",
        "email": "nepalpharma@distributors.com.np",
        "address": "कुलेश्वर, काठमाडौं",
        "pan_vat_number": "300456123",
        "bank_name": "नेपाल बैंक लिमिटेड",
        "bank_account_no": "002001098765",
        "status": "active"
    }
]

PURCHASES_DATA = [
    {
        "id": "grn-2081-01",
        "grn_no": "GRN-2081/82-001",
        "invoice_no": "INV-SM-4589",
        "supplier_id": "supp-01",
        "supplier_name": "सिन्धुपाल्चोक सर्जिकल तथा मेडिको सप्लायर्स",
        "purchase_date_bs": "२०८१/०४/१५",
        "purchase_date_ad": "2024-07-30",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "sub_total": 450000.0,
        "discount_amount": 25000.0,
        "tax_amount": 0.0,
        "total_amount": 425000.0,
        "payment_status": "paid",
        "received_by": "फार्मेसी सुपरभाइजर रमेश श्रेष्ठ",
        "remarks": "आव २०८१/८२ प्रथम चौमासिक अत्यावश्यक औषधि तथा सर्जिकल खरिद"
    },
    {
        "id": "grn-2081-02",
        "grn_no": "GRN-2081/82-002",
        "invoice_no": "NP-8842",
        "supplier_id": "supp-02",
        "supplier_name": "नेपाल फर्मास्युटिकल डिस्ट्रिब्युटर्स प्रा.लि.",
        "purchase_date_bs": "२०८१/०५/१०",
        "purchase_date_ad": "2024-08-26",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "sub_total": 280000.0,
        "discount_amount": 10000.0,
        "tax_amount": 0.0,
        "total_amount": 270000.0,
        "payment_status": "paid",
        "received_by": "फार्मेसी सुपरभाइजर रमेश श्रेष्ठ",
        "remarks": "एन्टिबायोटिक्स तथा जीवनरक्षक झोल औषधि आपूर्ति"
    }
]

BATCHES_DATA = [
    {
        "id": "batch-pcm-01",
        "medicine_name": "Paracetamol 500mg Tablet",
        "generic_name": "Paracetamol",
        "batch_no": "PCM-2024-08",
        "stock_quantity": 4500,
        "unit": "ट्याब्लेट",
        "purchase_rate": 0.85,
        "sales_rate": 1.20,
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "expiry_date": "2026-08-31",
        "status": "active"
    },
    {
        "id": "batch-amx-01",
        "medicine_name": "Amoxicillin 500mg Capsule",
        "generic_name": "Amoxicillin",
        "batch_no": "AMX-2407",
        "stock_quantity": 1800,
        "unit": "क्याप्सुल",
        "purchase_rate": 4.50,
        "sales_rate": 6.00,
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "expiry_date": "2026-06-30",
        "status": "active"
    },
    {
        "id": "batch-pan-01",
        "medicine_name": "Pantoprazole 40mg Tablet",
        "generic_name": "Pantoprazole",
        "batch_no": "PAN-2409",
        "stock_quantity": 2200,
        "unit": "ट्याब्लेट",
        "purchase_rate": 3.80,
        "sales_rate": 5.50,
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "expiry_date": "2026-11-30",
        "status": "active"
    },
    {
        "id": "batch-ors-01",
        "medicine_name": "Oral Rehydration Salts (ORS)",
        "generic_name": "Oral Rehydration Salts IP",
        "batch_no": "ORS-2405",
        "stock_quantity": 1200,
        "unit": "प्याकेट",
        "purchase_rate": 8.00,
        "sales_rate": 10.00,
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "expiry_date": "2027-04-30",
        "status": "active"
    },
    {
        "id": "batch-aml-01",
        "medicine_name": "Amlodipine 5mg Tablet",
        "generic_name": "Amlodipine Besylate",
        "batch_no": "AML-2403",
        "stock_quantity": 1600,
        "unit": "ट्याब्लेट",
        "purchase_rate": 2.10,
        "sales_rate": 3.00,
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "expiry_date": "2026-09-30",
        "status": "active"
    },
    {
        "id": "batch-met-01",
        "medicine_name": "Metformin 500mg Tablet",
        "generic_name": "Metformin HCl",
        "batch_no": "MET-2406",
        "stock_quantity": 1900,
        "unit": "ट्याब्लेट",
        "purchase_rate": 1.90,
        "sales_rate": 2.80,
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "ward_number": 6,
        "expiry_date": "2026-10-31",
        "status": "active"
    }
]

LAB_TESTS_DATA = [
    {
        "id": "lab-01",
        "test_order_no": "LAB-240901-001",
        "patient_id": "PT-2081-001",
        "patient_name": "सरिता तामाङ",
        "test_name": "Complete Blood Count (CBC) & Hb",
        "test_category": "hematology",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "requested_by": "डा. सन्दीप श्रेष्ठ",
        "ordered_by": "डा. सन्दीप श्रेष्ठ",
        "result_summary": "Hb: 11.8 g/dl (गर्भावस्थामा सामान्य), TLC: 8,400, Platelets: 240,000 /cumm।",
        "results": {"wbc": "8,400 /cumm", "rbc": "4.2 M/uL", "hemoglobin": "11.8 g/dl", "platelets": "240,000 /cumm"},
        "status": "completed",
        "fee": 350.0,
        "completed_at": datetime.now(timezone.utc)
    },
    {
        "id": "lab-02",
        "test_order_no": "LAB-240901-002",
        "patient_id": "PT-2081-001",
        "patient_name": "सरिता तामाङ",
        "test_name": "Urine Routine & Microscopic Examination (Urine R/E)",
        "test_category": "pathology",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "requested_by": "डा. सन्दीप श्रेष्ठ",
        "ordered_by": "डा. सन्दीप श्रेष्ठ",
        "result_summary": "Albumin: Nil, Sugar: Nil, Pus cells: 1-2 /hpf।",
        "results": {"albumin": "Negative", "sugar": "Negative", "pus_cells": "1-2 /hpf"},
        "status": "completed",
        "fee": 150.0,
        "completed_at": datetime.now(timezone.utc)
    },
    {
        "id": "lab-03",
        "test_order_no": "LAB-240901-003",
        "patient_id": "PT-2081-002",
        "patient_name": "दावा शेर्पा",
        "test_name": "Fasting Blood Sugar & Lipid Profile",
        "test_category": "biochemistry",
        "health_facility_name": "भोताङ प्राथमिक स्वास्थ्य केन्द्र",
        "requested_by": "डा. पेम्बा शेर्पा",
        "ordered_by": "डा. पेम्बा शेर्पा",
        "result_summary": "FBS: 108 mg/dl, Total Cholesterol: 195 mg/dl, Triglycerides: 160 mg/dl।",
        "results": {"fbs": "108 mg/dl", "cholesterol": "195 mg/dl", "triglycerides": "160 mg/dl"},
        "status": "completed",
        "fee": 650.0,
        "completed_at": datetime.now(timezone.utc)
    },
    {
        "id": "lab-04",
        "test_order_no": "LAB-240901-004",
        "patient_id": "PT-2081-003",
        "patient_name": "रोशन घिमिरे",
        "test_name": "Blood Culture & Routine Hematology",
        "test_category": "microbiology",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "requested_by": "डा. सन्दीप श्रेष्ठ",
        "ordered_by": "डा. सन्दीप श्रेष्ठ",
        "result_summary": "No bacterial growth, TLC 12,100 (हल्का ब्रोन्काइटिस सङ्क्रमण)।",
        "results": {"tlc": "12,100 /cumm", "culture": "No growth after 48 hrs"},
        "status": "completed",
        "fee": 500.0,
        "completed_at": datetime.now(timezone.utc)
    }
]

PRESCRIPTIONS_DATA = [
    {
        "id": "rx-2409-001",
        "rx_number": "RX-240901-0001",
        "patient_id": "PT-2081-001",
        "patient_no": "PT-2081-001",
        "patient_name": "सरिता तामाङ",
        "ward_number": 6,
        "doctor_name": "डा. सन्दीप श्रेष्ठ",
        "department": "प्रसूति तथा स्त्रीरोग (Maternity / ANC)",
        "diagnosis": "ANC 3rd Trimester (32 Weeks) Routine Follow-up",
        "medicines": [
            {"medicine_name": "Iron + Folic Acid (IFA)", "dosage": "0-1-0", "frequency": "Daily After Dinner", "duration": "60 days", "route": "Oral"},
            {"medicine_name": "Calcium 500mg", "dosage": "1-0-0", "frequency": "Daily Morning", "duration": "60 days", "route": "Oral"}
        ],
        "dispense_status": "dispensed",
        "dispensed_at": datetime.now(timezone.utc),
        "dispensed_by": "फार्मेसी सुपरभाइजर रमेश श्रेष्ठ",
        "is_insured": True,
        "insurance_number": "INS-2081-6012",
        "notes": "नियमित पोषणयुक्त खाना, हरियो सागपात र नियमित गर्भजाँच।"
    },
    {
        "id": "rx-2409-002",
        "rx_number": "RX-240901-0002",
        "patient_id": "PT-2081-002",
        "patient_no": "PT-2081-002",
        "patient_name": "दावा शेर्पा",
        "ward_number": 3,
        "doctor_name": "डा. पेम्बा शेर्पा",
        "department": "सामान्य चिकित्सा (General OPD)",
        "diagnosis": "Essential Hypertension Stage 1",
        "medicines": [
            {"medicine_name": "Amlodipine 5mg", "dosage": "1-0-0", "frequency": "Daily Morning", "duration": "30 days", "route": "Oral"}
        ],
        "dispense_status": "dispensed",
        "dispensed_at": datetime.now(timezone.utc),
        "dispensed_by": "फार्मेसी इन्चार्ज दावा लामा",
        "is_insured": True,
        "insurance_number": "INS-2081-3045",
        "notes": "नुन कम गर्ने, नियमित बिहान हिँड्ने र १ महिनापछि बीपी फलोअप।"
    },
    {
        "id": "rx-2409-003",
        "rx_number": "RX-240901-0003",
        "patient_id": "PT-2081-003",
        "patient_no": "PT-2081-003",
        "patient_name": "रोशन घिमिरे",
        "ward_number": 4,
        "doctor_name": "डा. सन्दीप श्रेष्ठ",
        "department": "बालरोग (Pediatrics)",
        "diagnosis": "Acute Bronchitis",
        "medicines": [
            {"medicine_name": "Amoxicillin 250mg/5ml Syrup", "dosage": "5ml - 5ml - 5ml", "frequency": "Every 8 hrs", "duration": "5 days", "route": "Oral"},
            {"medicine_name": "Paracetamol 120mg/5ml Syrup", "dosage": "5ml SOS", "frequency": "When fever > 100°F", "duration": "3 days", "route": "Oral"}
        ],
        "dispense_status": "dispensed",
        "dispensed_at": datetime.now(timezone.utc),
        "dispensed_by": "फार्मेसी सुपरभाइजर रमेश श्रेष्ठ",
        "is_insured": False,
        "insurance_number": None,
        "notes": "तातो पानी बाफ दिने र चिसोबाट जोगाउने।"
    }
]

DISCHARGE_SUMMARY_DATA = [
    {
        "id": "dc-2409-001",
        "discharge_no": "DC-2081/82-001",
        "admission_id": "ipd-01",
        "admission_no": "IPD-2081-01",
        "patient_no": "PT-2081-001",
        "patient_name": "सरिता तामाङ",
        "bed_number": "Bed-03 (Maternity Ward)",
        "admission_date": "२०८१/०५/२५",
        "discharge_date": "२०८१/०५/२८",
        "attending_doctor": "डा. सन्दीप श्रेष्ठ (मेडिकल सुपरिटेन्डेन्ट)",
        "provisional_diagnosis": "Postpartum Observation & Neonatal Care",
        "final_diagnosis": "Healthy Mother and Baby, Routine Postnatal Care Completed",
        "treatment_given": "Oral Iron + Folic Acid, Calcium 500mg, Neonatal Vit K, Exclusive Breastfeeding Counselling",
        "condition_at_discharge": "पूर्ण स्वस्थ (Clinically Stable & Healthy)",
        "follow_up_date": "२०८१/०६/०५",
        "doctor_advice": "६ महिनासम्म पूर्ण स्तनपान गराउने, आमाले पोषिलो खाना खाने, नियमित खोप तालिका अनुसार खोप केन्द्र जाने।"
    }
]

POS_SALES_DATA = [
    {
        "id": "pos-bill-001",
        "bill_no": "BILL-240901-0001",
        "patient_no": "PT-2081-001",
        "patient_name": "सरिता तामाङ",
        "ward_number": 6,
        "is_insured": True,
        "insurance_number": "INS-2081-6012",
        "sub_total": 450.0,
        "discount_amount": 0.0,
        "tax_amount": 0.0,
        "total_amount": 450.0,
        "copay_amount": 45.0,
        "payment_mode": "insurance_copay",
        "biller_name": "रमेश श्रेष्ठ (फार्मेसी इन्चार्ज)",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "status": "completed"
    },
    {
        "id": "pos-bill-002",
        "bill_no": "BILL-240901-0002",
        "patient_no": "PT-2081-002",
        "patient_name": "दावा शेर्पा",
        "ward_number": 3,
        "is_insured": True,
        "insurance_number": "INS-2081-3045",
        "sub_total": 300.0,
        "discount_amount": 0.0,
        "tax_amount": 0.0,
        "total_amount": 300.0,
        "copay_amount": 30.0,
        "payment_mode": "insurance_copay",
        "biller_name": "दावा लामा (फार्मेसी सहायक)",
        "health_facility_name": "भोताङ प्राथमिक स्वास्थ्य केन्द्र",
        "status": "completed"
    },
    {
        "id": "pos-bill-003",
        "bill_no": "BILL-240901-0003",
        "patient_no": "PT-2081-003",
        "patient_name": "रोशन घिमिरे",
        "ward_number": 4,
        "is_insured": False,
        "insurance_number": None,
        "sub_total": 280.0,
        "discount_amount": 30.0,
        "tax_amount": 0.0,
        "total_amount": 250.0,
        "copay_amount": 0.0,
        "payment_mode": "cash",
        "biller_name": "रमेश श्रेष्ठ (फार्मेसी इन्चार्ज)",
        "health_facility_name": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "status": "completed"
    }
]

def seed_hospital_erp():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()

    now = datetime.now(timezone.utc)

    print("--- Seeding Suppliers ---")
    cur.execute("DELETE FROM health_suppliers")
    for s in SUPPLIERS_DATA:
        cur.execute("""
            INSERT INTO health_suppliers (
                id, supplier_name, contact_person, phone, email,
                address, pan_vat_number, bank_name, bank_account_no,
                status, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            s["id"], s["supplier_name"], s["contact_person"], s["phone"],
            s["email"], s["address"], s["pan_vat_number"], s["bank_name"],
            s["bank_account_no"], s["status"], now, now
        ))
    print(f"✓ Seeded {len(SUPPLIERS_DATA)} suppliers.")

    print("\n--- Seeding Purchases (GRN) ---")
    cur.execute("DELETE FROM health_purchases")
    for p in PURCHASES_DATA:
        cur.execute("""
            INSERT INTO health_purchases (
                id, grn_no, invoice_no, supplier_id, supplier_name,
                purchase_date_bs, purchase_date_ad, health_facility_name,
                ward_number, sub_total, discount_amount, tax_amount,
                total_amount, payment_status, received_by, remarks,
                "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            p["id"], p["grn_no"], p["invoice_no"], p["supplier_id"],
            p["supplier_name"], p["purchase_date_bs"], p["purchase_date_ad"],
            p["health_facility_name"], p["ward_number"], p["sub_total"],
            p["discount_amount"], p["tax_amount"], p["total_amount"],
            p["payment_status"], p["received_by"], p["remarks"], now, now
        ))
    print(f"✓ Seeded {len(PURCHASES_DATA)} purchases.")

    print("\n--- Seeding Medicine Batches ---")
    cur.execute("DELETE FROM health_medicine_batches")
    for b in BATCHES_DATA:
        cur.execute("""
            INSERT INTO health_medicine_batches (
                id, medicine_name, generic_name, batch_no, stock_quantity,
                unit, purchase_rate, sales_rate, health_facility_name,
                ward_number, expiry_date, status, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            b["id"], b["medicine_name"], b["generic_name"], b["batch_no"],
            b["stock_quantity"], b["unit"], b["purchase_rate"], b["sales_rate"],
            b["health_facility_name"], b["ward_number"], b["expiry_date"],
            b["status"], now, now
        ))
    print(f"✓ Seeded {len(BATCHES_DATA)} medicine batches.")

    print("\n--- Seeding Lab Tests ---")
    cur.execute("DELETE FROM health_lab_tests")
    for l in LAB_TESTS_DATA:
        cur.execute("""
            INSERT INTO health_lab_tests (
                id, test_order_no, patient_id, patient_name, test_name,
                test_category, health_facility_name, requested_by, ordered_by,
                result_summary, results, status, fee, completed_at,
                "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            l["id"], l["test_order_no"], l["patient_id"], l["patient_name"],
            l["test_name"], l["test_category"], l["health_facility_name"],
            l["requested_by"], l["ordered_by"], l["result_summary"],
            json.dumps(l["results"], ensure_ascii=False), l["status"],
            l["fee"], l["completed_at"], now, now
        ))
    print(f"✓ Seeded {len(LAB_TESTS_DATA)} lab tests.")

    print("\n--- Seeding Prescriptions ---")
    cur.execute("DELETE FROM health_prescriptions")
    for rx in PRESCRIPTIONS_DATA:
        cur.execute("""
            INSERT INTO health_prescriptions (
                id, rx_number, patient_id, patient_no, patient_name,
                ward_number, doctor_name, department, diagnosis,
                medicines, dispense_status, dispensed_at, dispensed_by,
                is_insured, insurance_number, notes, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            rx["id"], rx["rx_number"], rx["patient_id"], rx["patient_no"],
            rx["patient_name"], rx["ward_number"], rx["doctor_name"],
            rx["department"], rx["diagnosis"],
            json.dumps(rx["medicines"], ensure_ascii=False),
            rx["dispense_status"], rx["dispensed_at"], rx["dispensed_by"],
            rx["is_insured"], rx["insurance_number"], rx["notes"], now, now
        ))
    print(f"✓ Seeded {len(PRESCRIPTIONS_DATA)} prescriptions.")

    print("\n--- Seeding Discharge Summaries ---")
    cur.execute("DELETE FROM health_discharge_summaries")
    for dc in DISCHARGE_SUMMARY_DATA:
        cur.execute("""
            INSERT INTO health_discharge_summaries (
                id, discharge_no, admission_id, admission_no, patient_no,
                patient_name, bed_number, admission_date, discharge_date,
                attending_doctor, provisional_diagnosis, final_diagnosis,
                treatment_given, condition_at_discharge, follow_up_date,
                doctor_advice, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            dc["id"], dc["discharge_no"], dc["admission_id"], dc["admission_no"],
            dc["patient_no"], dc["patient_name"], dc["bed_number"],
            dc["admission_date"], dc["discharge_date"], dc["attending_doctor"],
            dc["provisional_diagnosis"], dc["final_diagnosis"],
            dc["treatment_given"], dc["condition_at_discharge"],
            dc["follow_up_date"], dc["doctor_advice"], now, now
        ))
    print(f"✓ Seeded {len(DISCHARGE_SUMMARY_DATA)} discharge summaries.")

    print("\n--- Seeding POS Pharmacy Bills ---")
    cur.execute("DELETE FROM health_pos_sales")
    for s in POS_SALES_DATA:
        cur.execute("""
            INSERT INTO health_pos_sales (
                id, bill_no, patient_no, patient_name, ward_number,
                is_insured, insurance_number, sub_total, discount_amount,
                tax_amount, total_amount, copay_amount, payment_mode,
                biller_name, health_facility_name, status,
                "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            s["id"], s["bill_no"], s["patient_no"], s["patient_name"],
            s["ward_number"], s["is_insured"], s["insurance_number"],
            s["sub_total"], s["discount_amount"], s["tax_amount"],
            s["total_amount"], s["copay_amount"], s["payment_mode"],
            s["biller_name"], s["health_facility_name"], s["status"], now, now
        ))
    print(f"✓ Seeded {len(POS_SALES_DATA)} pharmacy POS sales.")

    conn.commit()
    cur.close()
    conn.close()
    print("\n✓ All Hospital ERP tables successfully seeded!")

if __name__ == '__main__':
    seed_hospital_erp()
