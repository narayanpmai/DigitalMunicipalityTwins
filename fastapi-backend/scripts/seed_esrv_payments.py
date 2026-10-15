"""
Seed script for esrv_payments and accompanying esrv_applications in Panchpokhari Thangpal Rural Municipality
"""
import uuid
from datetime import datetime, timedelta
from core.database import SessionLocal
from models.e_service import ServiceTemplate, ServiceApplication, ServicePayment

TEMPLATES_DATA = [
    {
        "id": "tpl_property_valuation",
        "service_code": "property_valuation",
        "service_name_np": "सम्पत्ति तथा जग्गा मूल्याङ्कन सिफारिस",
        "required_documents": ["जग्गाधनी प्रमाण पुर्जा", "नापी नक्सा ट्रेस", "नागरिकताको प्रतिलिपि"],
        "fee_amount": 1000.0,
        "html_pdf_template": "<h1>सम्पत्ति मूल्याङ्कन सिफारिस</h1>",
        "json_schema": {"type": "object", "properties": {"land_area": {"type": "string"}}},
        "is_active": True,
    },
    {
        "id": "tpl_electricity_conn",
        "service_code": "electricity_connection",
        "service_name_np": "विद्युत मिटर जडान सिफारिस",
        "required_documents": ["नागरिकता", "जग्गाधनी पुर्जा", "घर निर्माण इजाजत"],
        "fee_amount": 300.0,
        "html_pdf_template": "<h1>विद्युत मिटर जडान सिफारिस</h1>",
        "json_schema": {"type": "object", "properties": {"meter_type": {"type": "string"}}},
        "is_active": True,
    },
    {
        "id": "tpl_water_conn",
        "service_code": "water_connection",
        "service_name_np": "खानेपानी धारा जडान सिफारिस",
        "required_documents": ["नागरिकता", "घरबाटो सिफारिस", "स्थानीय कर चुक्ता रसिद"],
        "fee_amount": 350.0,
        "html_pdf_template": "<h1>खानेपानी धारा जडान सिफारिस</h1>",
        "json_schema": {"type": "object", "properties": {"ward": {"type": "number"}}},
        "is_active": True,
    },
    {
        "id": "tpl_business_reg",
        "service_code": "business_registration",
        "service_name_np": "नयाँ व्यवसाय दर्ता सिफारिस",
        "required_documents": ["भाडा सम्झौता", "नागरिकता", "व्यवसाय स्थल फोटो"],
        "fee_amount": 1500.0,
        "html_pdf_template": "<h1>नयाँ व्यवसाय दर्ता सिफारिस</h1>",
        "json_schema": {"type": "object", "properties": {"business_name": {"type": "string"}}},
        "is_active": True,
    },
    {
        "id": "tpl_house_map",
        "service_code": "house_map_permit",
        "service_name_np": "भूकम्प प्रतिरोधी घरनक्सा पास दस्तुर",
        "required_documents": ["इन्जिनियरिङ ड्रइङ", "चारकिल्ला", "माटो परीक्षण प्रतिवेदन"],
        "fee_amount": 2500.0,
        "html_pdf_template": "<h1>घरनक्सा पास दस्तुर</h1>",
        "json_schema": {"type": "object", "properties": {"plinth_area": {"type": "number"}}},
        "is_active": True,
    },
    {
        "id": "tpl_charitra",
        "service_code": "character_certificate",
        "service_name_np": "चारित्रिक प्रमाणपत्र सिफारिस",
        "required_documents": ["नागरिकता", "पासपोर्ट साइज फोटो"],
        "fee_amount": 150.0,
        "html_pdf_template": "<h1>चारित्रिक प्रमाणपत्र</h1>",
        "json_schema": {"type": "object", "properties": {"purpose": {"type": "string"}}},
        "is_active": True,
    },
    {
        "id": "tpl_tax_clearance",
        "service_code": "tax_clearance",
        "service_name_np": "स्थानीय कर चुक्ता प्रमाणपत्र",
        "required_documents": ["सम्पत्ति कर रसिद", "व्यवसाय कर रसिद"],
        "fee_amount": 500.0,
        "html_pdf_template": "<h1>स्थानीय कर चुक्ता प्रमाणपत्र</h1>",
        "json_schema": {"type": "object", "properties": {"fiscal_year": {"type": "string"}}},
        "is_active": True,
    },
]

APPLICATIONS_DATA = [
    {
        "id": "app-esrv-001",
        "application_no": "APP-PTGP-2081-EL-00101",
        "service_template_id": "tpl_electricity_conn",
        "applicant_citizen_id": "cit-01",
        "ward_id": "1",
        "submitted_data": {
            "applicant_name": "दावा तामाङ",
            "phone": "९८४१२२३३०१",
            "address": "पाँचपोखरी थाङपाल-१, बाँसखर्क",
            "meter_type": "घरेलु (Single Phase 5A)",
            "citizenship_no": "२७-०१-५८-००१२३",
        },
        "uploaded_documents": ["citizenship.pdf", "land_ownership.pdf"],
        "status": "Payment Verified",
        "fee": 300.0,
        "method": "eSewa",
        "txn_id": "ESEWA-2081-998124",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-002",
        "application_no": "APP-PTGP-2081-WT-00102",
        "service_template_id": "tpl_water_conn",
        "applicant_citizen_id": "cit-02",
        "ward_id": "2",
        "submitted_data": {
            "applicant_name": "पासाङ शेर्पा",
            "phone": "९८४१२२३३०२",
            "address": "पाँचपोखरी थाङपाल-२, बरुवा",
            "pipeline_route": "बरुवा मुख्य खानेपानी लाइन",
            "citizenship_no": "२७-०१-६०-००४५६",
        },
        "uploaded_documents": ["citizenship.pdf"],
        "status": "Payment Verified",
        "fee": 350.0,
        "method": "Khalti",
        "txn_id": "KHALTI-TXN-882319",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-003",
        "application_no": "APP-PTGP-2081-HM-00103",
        "service_template_id": "tpl_house_map",
        "applicant_citizen_id": "cit-03",
        "ward_id": "3",
        "submitted_data": {
            "applicant_name": "राम तामाङ",
            "phone": "९८४१२२३३०३",
            "address": "पाँचपोखरी थाङपाल-३, भोताङ",
            "storey_count": "२.५ तला",
            "plinth_area_sqft": "१२०० वर्गफिट",
            "citizenship_no": "२७-०१-५३-००७८९",
        },
        "uploaded_documents": ["cad_drawing.dwg", "soil_test.pdf"],
        "status": "Payment Verified",
        "fee": 2500.0,
        "method": "ConnectIPS",
        "txn_id": "CIPS-NP-776214",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-004",
        "application_no": "APP-PTGP-2081-BRG-00104",
        "service_template_id": "tpl_business_reg",
        "applicant_citizen_id": "cit-04",
        "ward_id": "4",
        "submitted_data": {
            "applicant_name": "माया तामाङ",
            "business_name": "मानेखर्क एग्रो तथा डेरी उद्योग",
            "phone": "९८४१२२३३०४",
            "capital_npr": "५,००,०००",
            "address": "पाँचपोखरी थाङपाल-४, मानेखर्क",
        },
        "uploaded_documents": ["rent_agreement.pdf"],
        "status": "Payment Verified",
        "fee": 1500.0,
        "method": "Fonepay (Nepal QR)",
        "txn_id": "FONEPAY-QR-554231",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-005",
        "application_no": "APP-PTGP-2081-PV-00105",
        "service_template_id": "tpl_property_valuation",
        "applicant_citizen_id": "cit-05",
        "ward_id": "5",
        "submitted_data": {
            "applicant_name": "छिरिङ लामा",
            "phone": "९८४१२२३३०५",
            "address": "पाँचपोखरी थाङपाल-५, गुन्सा",
            "kitta_no": "४५, ४६",
            "bank_name": "कृषि विकास बैंक (ऋण प्रयोजन)",
        },
        "uploaded_documents": ["lalpurja.pdf", "blue_print.pdf"],
        "status": "Payment Verified",
        "fee": 1000.0,
        "method": "eSewa",
        "txn_id": "ESEWA-2081-443198",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-006",
        "application_no": "APP-PTGP-2081-INC-00106",
        "service_template_id": "tpl_income_cert",
        "applicant_citizen_id": "cit-01",
        "ward_id": "6",
        "submitted_data": {
            "applicant_name": "प्रेम बहादुर गुरुङ",
            "phone": "९८४१२२३३०६",
            "address": "पाँचपोखरी थाङपाल-६, थाङपालधाप",
            "annual_income_npr": "८,५०,०००",
            "purpose": "वैदेशिक अध्ययन तथा भिसा प्रयोजन",
        },
        "uploaded_documents": ["salary_sheet.pdf", "tax_returns.pdf"],
        "status": "Payment Verified",
        "fee": 500.0,
        "method": "ConnectIPS",
        "txn_id": "CIPS-NP-110293",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-007",
        "application_no": "APP-PTGP-2081-CHR-00107",
        "service_template_id": "tpl_charitra",
        "applicant_citizen_id": "cit-02",
        "ward_id": "7",
        "submitted_data": {
            "applicant_name": "सुनिता श्रेष्ठ",
            "phone": "९८४१२२३३०७",
            "address": "पाँचपोखरी थाङपाल-७, तिपेनी",
            "purpose": "शिक्षक सेवा आयोग परीक्षा दरखास्त",
        },
        "uploaded_documents": ["citizenship.pdf"],
        "status": "Payment Verified",
        "fee": 150.0,
        "method": "eSewa",
        "txn_id": "ESEWA-2081-671822",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-008",
        "application_no": "APP-PTGP-2081-TX-00108",
        "service_template_id": "tpl_tax_clearance",
        "applicant_citizen_id": "cit-03",
        "ward_id": "8",
        "submitted_data": {
            "applicant_name": "कृष्ण प्रसाद सापकोटा",
            "phone": "९८४१२२३३०८",
            "address": "पाँचपोखरी थाङपाल-८, लाँगर्चे",
            "fiscal_year": "२०८०/०८१",
        },
        "uploaded_documents": ["tax_receipts.pdf"],
        "status": "Payment Verified",
        "fee": 500.0,
        "method": "नगद (Cash Counter)",
        "txn_id": "CASH-REC-2081-042",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-009",
        "application_no": "APP-PTGP-2081-CIT-00109",
        "service_template_id": "tpl_citizenship_rec",
        "applicant_citizen_id": "cit-04",
        "ward_id": "3",
        "submitted_data": {
            "applicant_name": "पेम्बा दोर्जे शेर्पा",
            "phone": "९८४१२२३३०९",
            "address": "पाँचपोखरी थाङपाल-३, भोताङ",
            "father_name": "आङ फुर्वा शेर्पा",
        },
        "uploaded_documents": ["birth_cert.pdf", "father_citizenship.pdf"],
        "status": "Payment Verified",
        "fee": 100.0,
        "method": "Khalti",
        "txn_id": "KHALTI-TXN-334190",
        "payment_status": "Completed",
    },
    {
        "id": "app-esrv-010",
        "application_no": "APP-PTGP-2081-REL-00110",
        "service_template_id": "tpl_relationship",
        "applicant_citizen_id": "cit-05",
        "ward_id": "2",
        "submitted_data": {
            "applicant_name": "डोल्मा लामा",
            "phone": "९८४१२२३३१०",
            "address": "पाँचपोखरी थाङपाल-२, बरुवा",
            "relative_name": "निमा लामा (छोरा)",
        },
        "uploaded_documents": ["family_photo.jpg"],
        "status": "Payment Verified",
        "fee": 200.0,
        "method": "Fonepay (Nepal QR)",
        "txn_id": "FONEPAY-QR-990145",
        "payment_status": "Completed",
    },
]


def seed():
    db = SessionLocal()
    try:
        # 1. Ensure templates exist
        for tpl in TEMPLATES_DATA:
            existing = db.query(ServiceTemplate).filter(ServiceTemplate.id == tpl["id"]).first()
            if not existing:
                t = ServiceTemplate(
                    tenant_id="panchpokhari",
                    id=tpl["id"],
                    service_code=tpl["service_code"],
                    service_name_np=tpl["service_name_np"],
                    required_documents=tpl["required_documents"],
                    fee_amount=tpl["fee_amount"],
                    html_pdf_template=tpl["html_pdf_template"],
                    json_schema=tpl["json_schema"],
                    is_active=tpl["is_active"],
                    created_at=datetime.utcnow(),
                )
                db.add(t)
        db.commit()
        print("Service templates verified/seeded.")

        # 2. Add applications if not exist
        for app_data in APPLICATIONS_DATA:
            existing_app = db.query(ServiceApplication).filter(ServiceApplication.id == app_data["id"]).first()
            if not existing_app:
                app = ServiceApplication(
                    tenant_id="panchpokhari",
                    id=app_data["id"],
                    application_no=app_data["application_no"],
                    service_template_id=app_data["service_template_id"],
                    applicant_citizen_id=app_data["applicant_citizen_id"],
                    ward_id=app_data["ward_id"],
                    submitted_data=app_data["submitted_data"],
                    uploaded_documents=app_data["uploaded_documents"],
                    status=app_data["status"],
                    remarks_history=[{"action": "Submitted", "at": datetime.utcnow().isoformat(), "by": "Citizen"}],
                    created_at=datetime.utcnow() - timedelta(days=10),
                    updated_at=datetime.utcnow() - timedelta(days=9),
                )
                db.add(app)
        db.commit()
        print("Service applications verified/seeded.")

        # 3. Seed payments for existing 4 applications + newly added applications
        all_apps = db.query(ServiceApplication).all()
        print(f"Total applications available for payment: {len(all_apps)}")

        existing_payments_count = db.query(ServicePayment).count()
        print(f"Current esrv_payments count: {existing_payments_count}")

        if existing_payments_count == 0:
            payments_to_add = []
            
            # Application map by ID
            app_meta = {a["id"]: a for a in APPLICATIONS_DATA}

            methods = ["eSewa", "Khalti", "ConnectIPS", "Fonepay (Nepal QR)", "नगद (Cash Counter)"]

            for i, app in enumerate(all_apps):
                tpl = app.template
                fee = float(tpl.fee_amount) if (tpl and tpl.fee_amount is not None and tpl.fee_amount > 0) else 100.0
                
                meta = app_meta.get(app.id)
                method = meta["method"] if meta else methods[i % len(methods)]
                txn_id = meta["txn_id"] if meta else f"TXN-ESRV-2081-{1000 + i}"
                status = meta["payment_status"] if meta else "Completed"
                
                p = ServicePayment(
                    tenant_id="panchpokhari",
                    id=str(uuid.uuid4()),
                    application_id=app.id,
                    amount=fee,
                    payment_method=method,
                    transaction_id=txn_id,
                    payment_status=status,
                    receipt_url=f"/receipts/REC-2081-{100+i}.pdf",
                    created_at=datetime.utcnow() - timedelta(days=max(1, 14 - i)),
                )
                payments_to_add.append(p)
                db.add(p)

            db.commit()
            print(f"Successfully seeded {len(payments_to_add)} esrv_payments records!")
        else:
            print("Payments already exist. Skipping seed.")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
