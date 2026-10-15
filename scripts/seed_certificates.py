import psycopg2
import uuid
import json
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'

TEMPLATES = [
    {
        "id": "tpl_citizenship_rec",
        "service_code": "citizenship_recommendation",
        "service_name_np": "नेपाली नागरिकता प्रमाणपत्र सिफारिस",
        "required_documents": ["जन्म दर्ता प्रमाण", "बुबा/आमाको नागरिकता प्रतिलिपि", "विवाह दर्ता प्रमाण (विवाहित महिलाको हकमा)", "बसोबास प्रमाणित"],
        "fee_amount": 100.0,
        "html_pdf_template": "<h1>नेपाली नागरिकता प्रमाणपत्र सिफारिस</h1>",
        "json_schema": {"type": "object", "properties": {"applicant_name": {"type": "string"}}}
    },
    {
        "id": "tpl_birth_reg",
        "service_code": "birth",
        "service_name_np": "जन्म दर्ता प्रमाणपत्र",
        "required_documents": ["अस्पतालको जन्म प्रमाणपत्र वा खोप कार्ड", "आमाबुबाको नागरिकता"],
        "fee_amount": 0.0,
        "html_pdf_template": "<h1>जन्म दर्ता प्रमाणपत्र</h1>",
        "json_schema": {"type": "object", "properties": {"child_name": {"type": "string"}}}
    },
    {
        "id": "tpl_marriage_reg",
        "service_code": "marriage",
        "service_name_np": "विवाह दर्ता प्रमाणपत्र",
        "required_documents": ["दुलाहा र दुलहीको नागरिकता", "पासपोर्ट साइज फोटो"],
        "fee_amount": 0.0,
        "html_pdf_template": "<h1>विवाह दर्ता प्रमाणपत्र</h1>",
        "json_schema": {"type": "object", "properties": {"husband_name": {"type": "string"}, "wife_name": {"type": "string"}}}
    },
    {
        "id": "tpl_relationship",
        "service_code": "relationship",
        "service_name_np": "नाता प्रमाणित सिफारिस",
        "required_documents": ["नागरिकता प्रतिलिपिहरू", "पारिवारिक फोटो"],
        "fee_amount": 200.0,
        "html_pdf_template": "<h1>नाता प्रमाणित सिफारिस</h1>",
        "json_schema": {"type": "object", "properties": {"head_name": {"type": "string"}}}
    },
    {
        "id": "tpl_income_cert",
        "service_code": "income",
        "service_name_np": "वार्षिक आयस्रोत प्रमाणित",
        "required_documents": ["जग्गाधनी प्रमाणपुर्जा प्रतिलिपि", "कर तिरेको रसिद"],
        "fee_amount": 500.0,
        "html_pdf_template": "<h1>वार्षिक आयस्रोत प्रमाणित</h1>",
        "json_schema": {"type": "object", "properties": {"total_income": {"type": "number"}}}
    }
]

CERTIFICATES = [
    {
        "certNo": "गापा/ना/२०८१/१२४५",
        "qrCode": "PTGP-2081-NR-001245",
        "templateId": "tpl_citizenship_rec",
        "ward": "3",
        "submittedData": {
            "applicant_name": "राम बहादुर थापा",
            "नाम": "राम बहादुर थापा",
            "बुबाको नाम": "कृष्ण बहादुर थापा",
            "आमाको नाम": "सीता थापा",
            "जन्म मिति (BS)": "२०३५ असार १५",
            "वडा नं.": "३",
            "बसोबास": "भोताङ, सिन्धुपाल्चोक",
            "उद्देश्य": "नेपाली नागरिकता प्रमाणपत्र प्राप्त गर्न"
        },
        "pdfUrl": "/uploads/certificates/cert_1245.pdf",
        "sigId": "SIG-PTGP-W3-0891"
    },
    {
        "certNo": "गापा/ज/२०८१/४५१२",
        "qrCode": "PTGP-2081-BR-004512",
        "templateId": "tpl_birth_reg",
        "ward": "5",
        "submittedData": {
            "applicant_name": "सुमन कुमार श्रेष्ठ",
            "बच्चाको नाम": "सुमन कुमार श्रेष्ठ",
            "बुबाको नाम": "मनोज श्रेष्ठ",
            "आमाको नाम": "उषा श्रेष्ठ",
            "जन्म मिति": "२०८१ असार १०",
            "जन्मस्थान": "गुन्सा स्वास्थ्य चौकी",
            "वडा नं.": "५"
        },
        "pdfUrl": "/uploads/certificates/cert_4512.pdf",
        "sigId": "SIG-PTGP-W5-0432"
    },
    {
        "certNo": "गापा/वि/२०८१/०२३४",
        "qrCode": "PTGP-2081-MR-000234",
        "templateId": "tpl_marriage_reg",
        "ward": "6",
        "submittedData": {
            "applicant_name": "संजय तामाङ र अनिता तामाङ",
            "दुलाहाको नाम": "संजय तामाङ",
            "दुलहीको नाम": "अनिता तामाङ",
            "विवाह भएको मिति": "२०८१ वैशाख २५",
            "वडा नं.": "६",
            "ठेगाना": "थाङपालधाप"
        },
        "pdfUrl": "/uploads/certificates/cert_0234.pdf",
        "sigId": "SIG-PTGP-W6-0112"
    },
    {
        "certNo": "गापा/नाता/२०८१/०७८९",
        "qrCode": "PTGP-2081-REL-000789",
        "templateId": "tpl_relationship",
        "ward": "7",
        "submittedData": {
            "applicant_name": "चन्द्रबहादुर तामाङ",
            "नाता प्रमाणित गरिएका व्यक्तिहरू": "चन्द्रबहादुर तामाङ (बाबु), पेम्बा तामाङ (छोरा)",
            "वडा नं.": "७",
            "ठेगाना": "तिपेनी, पाँचपोखरी"
        },
        "pdfUrl": "/uploads/certificates/cert_0789.pdf",
        "sigId": "SIG-PTGP-W7-0045"
    }
]

def seed():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()

    print("Seeding Service Templates...")
    for t in TEMPLATES:
        cur.execute("""
            INSERT INTO esrv_service_templates (
                id, tenant_id, service_code, service_name_np, required_documents,
                fee_amount, html_pdf_template, json_schema, is_active, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (service_code) DO UPDATE SET
                service_name_np = EXCLUDED.service_name_np,
                required_documents = EXCLUDED.required_documents,
                fee_amount = EXCLUDED.fee_amount;
        """, (
            t["id"],
            "panchpokhari",
            t["service_code"],
            t["service_name_np"],
            json.dumps(t["required_documents"]),
            t["fee_amount"],
            t["html_pdf_template"],
            json.dumps(t["json_schema"]),
            True,
            datetime.utcnow()
        ))
        print(f"  ✓ Template: {t['service_name_np']} ({t['service_code']})")

    print("\nSeeding Issued Certificates and Applications...")
    for c in CERTIFICATES:
        app_id = str(uuid.uuid4())
        app_no = f"APP-{c['qrCode']}"
        
        # Insert application
        cur.execute("""
            INSERT INTO esrv_applications (
                id, tenant_id, application_no, service_template_id, applicant_citizen_id,
                ward_id, submitted_data, status, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (application_no) DO UPDATE SET
                submitted_data = EXCLUDED.submitted_data;
        """, (
            app_id,
            "panchpokhari",
            app_no,
            c["templateId"],
            "CITIZEN-" + c["ward"],
            c["ward"],
            json.dumps(c["submittedData"]),
            "Issued",
            datetime.utcnow(),
            datetime.utcnow()
        ))

        # Insert issued certificate
        cert_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO esrv_issued_certificates (
                id, tenant_id, application_id, certificate_no, digital_signature_id,
                pdf_url, issue_date, qr_verification_token
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (certificate_no) DO UPDATE SET
                qr_verification_token = EXCLUDED.qr_verification_token,
                pdf_url = EXCLUDED.pdf_url;
        """, (
            cert_id,
            "panchpokhari",
            app_id,
            c["certNo"],
            c["sigId"],
            c["pdfUrl"],
            datetime.utcnow(),
            c["qrCode"]
        ))
        print(f"  ✓ Issued Cert: {c['certNo']} | QR: {c['qrCode']} ({c['submittedData']['applicant_name']})")

    conn.commit()
    conn.close()
    print("\n✅ Service Templates and Issued Certificates successfully seeded!")

if __name__ == '__main__':
    seed()
