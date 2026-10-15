"""
Seed Business Inspections, Annual Renewals, and MDM Businesses
Municipal Digital Twins — Panchpokhari Thangpal Rural Municipality
Option 30 (विकल्प ३०)

Populates:
  1. mdm_businesses (12 master businesses linked to mdm_citizens & mdm_addresses)
  2. business_renewals (12 fiscal year renewal receipts)
  3. business_inspections (12 on-site field inspection reports)
  4. Synchronizes status in businesses table (renewed, verified, active)
"""
import uuid
import datetime
from sqlalchemy import text
from core.database import SessionLocal
from models.business import Business, BusinessRenewal, BusinessInspection
from models.master_data import BusinessMaster

def seed_business_compliance():
    db = SessionLocal()
    tenant_id = "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"
    now = datetime.datetime.utcnow()

    print("🚀 Starting Seeding for Option 30: Business Inspections, Renewals & MDM Businesses...")

    # Fetch existing businesses
    existing_businesses = db.query(Business).all()
    print(f"  Found {len(existing_businesses)} existing businesses in 'businesses' table.")

    # 1. Seed / Synchronize MDM Businesses (12 businesses)
    # Linking to mdm_citizens (cit-01 to cit-12) and mdm_addresses (addr-01 to addr-12)
    mdm_biz_data = [
        {
            "id": "biz-mdm-01",
            "owner_id": "cit-01",
            "business_name": "भोताङ हिमालयन रेन्बो ट्राउट फार्म",
            "pan_vat_no": "601245891",
            "registration_no": "PTGP-BUS-081-001",
            "business_type": "कृषि, पशुपन्छी तथा मत्स्यपालन",
            "capital": 3500000.0,
            "address_id": "addr-05",  # Ward 3
        },
        {
            "id": "biz-mdm-02",
            "owner_id": "cit-02",
            "business_name": "बाँसखर्क अग्र्यानिक सुन्तला तथा किवी कृषि फार्म",
            "pan_vat_no": "601245892",
            "registration_no": "PTGP-BUS-081-002",
            "business_type": "कृषि, पशुपन्छी तथा मत्स्यपालन",
            "capital": 2000000.0,
            "address_id": "addr-01",  # Ward 1
        },
        {
            "id": "biz-mdm-03",
            "owner_id": "cit-03",
            "business_name": "पञ्चपोखरी याङ्ग्री हेभेन रिसोर्ट",
            "pan_vat_no": "601245893",
            "registration_no": "PTGP-BUS-081-003",
            "business_type": "पर्यटन, होटल तथा रेस्टुरेन्ट",
            "capital": 7500000.0,
            "address_id": "addr-03",  # Ward 2
        },
        {
            "id": "biz-mdm-04",
            "owner_id": "cit-04",
            "business_name": "पाँचपोखरी हार्डवेयर एण्ड निर्माण सप्लायर्स",
            "pan_vat_no": "601245894",
            "registration_no": "PTGP-BUS-081-004",
            "business_type": "व्यापार तथा निर्माण सामग्री",
            "capital": 6000000.0,
            "address_id": "addr-07",  # Ward 7
        },
        {
            "id": "biz-mdm-05",
            "owner_id": "cit-05",
            "business_name": "थाङपाल सामुदायिक काष्ठ उद्योग तथा फर्निचर",
            "pan_vat_no": "601245895",
            "registration_no": "PTGP-BUS-081-005",
            "business_type": "उत्पादनमूलक तथा काष्ठ उद्योग",
            "capital": 2500000.0,
            "address_id": "addr-04",  # Ward 4
        },
        {
            "id": "biz-mdm-06",
            "owner_id": "cit-06",
            "business_name": "पाँचपोखरी हस्तकला तथा अल्लो प्राकृतिक रेशा प्रशोधन उद्योग",
            "pan_vat_no": "601245896",
            "registration_no": "PTGP-BUS-081-006",
            "business_type": "लघु, घरेलु तथा साना उद्योग",
            "capital": 1200000.0,
            "address_id": "addr-09",  # Ward 5
        },
        {
            "id": "biz-mdm-07",
            "owner_id": "cit-07",
            "business_name": "धाप डेरी तथा चीज उत्पादन केन्द्र",
            "pan_vat_no": "601245897",
            "registration_no": "PTGP-BUS-081-007",
            "business_type": "कृषि तथा दुग्धजन्य उद्योग",
            "capital": 4000000.0,
            "address_id": "addr-11",  # Ward 6
        },
        {
            "id": "biz-mdm-08",
            "owner_id": "cit-08",
            "business_name": "लागर्चे एग्रोभेट तथा कृषि सेवा केन्द्र",
            "pan_vat_no": "601245898",
            "registration_no": "PTGP-BUS-081-008",
            "business_type": "व्यापार तथा कृषि औषधि",
            "capital": 1500000.0,
            "address_id": "addr-08",  # Ward 8
        },
        {
            "id": "biz-mdm-09",
            "owner_id": "cit-09",
            "business_name": "बरुवा ट्राभल एण्ड होमस्टे प्रालि",
            "pan_vat_no": "601245899",
            "registration_no": "PTGP-BUS-081-009",
            "business_type": "पर्यटन, होटल तथा होमस्टे",
            "capital": 3000000.0,
            "address_id": "addr-03",  # Ward 2
        },
        {
            "id": "biz-mdm-10",
            "owner_id": "cit-10",
            "business_name": "छिम्ती हर्बल एण्ड मेडिसिनल प्लान्ट्स",
            "pan_vat_no": "601245900",
            "registration_no": "PTGP-BUS-081-010",
            "business_type": "जडीबुटी प्रशोधन तथा संकलन",
            "capital": 1800000.0,
            "address_id": "addr-06",  # Ward 3
        },
        {
            "id": "biz-mdm-11",
            "owner_id": "cit-11",
            "business_name": "गुन्सा याक चीज एण्ड दुग्ध भण्डार",
            "pan_vat_no": "601245901",
            "registration_no": "PTGP-BUS-081-011",
            "business_type": "दुग्ध संकलन तथा चीज उत्पादन",
            "capital": 2800000.0,
            "address_id": "addr-10",  # Ward 5
        },
        {
            "id": "biz-mdm-12",
            "owner_id": "cit-12",
            "business_name": "तिपेनी मिनी मार्केट एण्ड किराना",
            "pan_vat_no": "601245902",
            "registration_no": "PTGP-BUS-081-012",
            "business_type": "थोक तथा खुद्रा किराना व्यापार",
            "capital": 2200000.0,
            "address_id": "addr-07",  # Ward 7
        },
    ]

    for item in mdm_biz_data:
        existing_mb = db.query(BusinessMaster).filter(BusinessMaster.id == item["id"]).first()
        if not existing_mb:
            mb = BusinessMaster(
                id=item["id"],
                owner_id=item["owner_id"],
                business_name=item["business_name"],
                pan_vat_no=item["pan_vat_no"],
                registration_no=item["registration_no"],
                business_type=item["business_type"],
                capital=item["capital"],
                address_id=item["address_id"],
                tenant_id=tenant_id,
            )
            db.add(mb)

    db.commit()
    print("  ✓ Seeded 12 MDM Businesses in mdm_businesses.")

    # 2. Seed Business Renewals (12 records across FY 2080/081 and 2081/082)
    # Clear existing if any
    db.query(BusinessRenewal).delete()

    renewals_data = [
        {
            "business_id": str(existing_businesses[0].id) if len(existing_businesses) > 0 else "biz-01",
            "registration_no": "PTGP-BUS-081-001",
            "business_name": "भोताङ हिमालयन रेन्बो ट्राउट फार्म",
            "proprietor_name": "पेम्बा शेर्पा",
            "ward_number": 3,
            "fiscal_year": "२०८१/०८२",
            "renewal_date_bs": "२०८१-०४-२५",
            "annual_fee_npr": 6500.0,
            "fine_npr": 0.0,
            "total_paid_npr": 6500.0,
            "payment_gateway": "FONEPAY",
            "receipt_no": "REC-081-8801",
            "renewed_by_officer": "सुरेन्द्र श्रेष्ठ (वडा सचिव)",
        },
        {
            "business_id": str(existing_businesses[1].id) if len(existing_businesses) > 1 else "biz-02",
            "registration_no": "PTGP-BUS-081-002",
            "business_name": "बाँसखर्क अग्र्यानिक सुन्तला तथा किवी कृषि फार्म",
            "proprietor_name": "दावा गोले तामाङ",
            "ward_number": 1,
            "fiscal_year": "२०८१/०८२",
            "renewal_date_bs": "२०८१-०५-०२",
            "annual_fee_npr": 3500.0,
            "fine_npr": 0.0,
            "total_paid_npr": 3500.0,
            "payment_gateway": "KHALTI",
            "receipt_no": "REC-081-8802",
            "renewed_by_officer": "कमल तामाङ (राजस्व अधिकृत)",
        },
        {
            "business_id": str(existing_businesses[2].id) if len(existing_businesses) > 2 else "biz-03",
            "registration_no": "PTGP-BUS-081-003",
            "business_name": "पञ्चपोखरी याङ्ग्री हेभेन रिसोर्ट",
            "proprietor_name": "लाक्पा दोर्जे शेर्पा",
            "ward_number": 2,
            "fiscal_year": "२०८१/०८२",
            "renewal_date_bs": "२०८१-०५-१०",
            "annual_fee_npr": 12000.0,
            "fine_npr": 0.0,
            "total_paid_npr": 12000.0,
            "payment_gateway": "बैंक भौचर (NMB)",
            "receipt_no": "REC-081-8803",
            "renewed_by_officer": "सुरेन्द्र श्रेष्ठ (वडा सचिव)",
        },
        {
            "business_id": str(existing_businesses[3].id) if len(existing_businesses) > 3 else "biz-04",
            "registration_no": "PTGP-BUS-081-004",
            "business_name": "पाँचपोखरी हार्डवेयर एण्ड निर्माण सप्लायर्स",
            "proprietor_name": "सन्तोष पराजुली",
            "ward_number": 7,
            "fiscal_year": "२०८१/०८२",
            "renewal_date_bs": "२०८१-०५-१८",
            "annual_fee_npr": 12000.0,
            "fine_npr": 500.0,
            "total_paid_npr": 12500.0,
            "payment_gateway": "FONEPAY",
            "receipt_no": "REC-081-8804",
            "renewed_by_officer": "कमल तामाङ (राजस्व अधिकृत)",
        },
        {
            "business_id": str(existing_businesses[4].id) if len(existing_businesses) > 4 else "biz-05",
            "registration_no": "PTGP-BUS-081-005",
            "business_name": "थाङपाल सामुदायिक काष्ठ उद्योग तथा फर्निचर",
            "proprietor_name": "रामप्रसाद सापकोटा",
            "ward_number": 4,
            "fiscal_year": "२०८१/०८२",
            "renewal_date_bs": "२०८१-०५-२२",
            "annual_fee_npr": 3500.0,
            "fine_npr": 0.0,
            "total_paid_npr": 3500.0,
            "payment_gateway": "ESEWA",
            "receipt_no": "REC-081-8805",
            "renewed_by_officer": "दिलीप गिरी (लेखापाल)",
        },
        {
            "business_id": str(existing_businesses[5].id) if len(existing_businesses) > 5 else "biz-06",
            "registration_no": "PTGP-BUS-081-006",
            "business_name": "पाँचपोखरी हस्तकला तथा अल्लो प्राकृतिक रेशा प्रशोधन उद्योग",
            "proprietor_name": "माया तामाङ",
            "ward_number": 5,
            "fiscal_year": "२०८१/०८२",
            "renewal_date_bs": "२०८१-०६-०१",
            "annual_fee_npr": 3500.0,
            "fine_npr": 0.0,
            "total_paid_npr": 3500.0,
            "payment_gateway": "FONEPAY",
            "receipt_no": "REC-081-8806",
            "renewed_by_officer": "सुरेन्द्र श्रेष्ठ (वडा सचिव)",
        },
        {
            "business_id": str(existing_businesses[6].id) if len(existing_businesses) > 6 else "biz-07",
            "registration_no": "PTGP-BUS-081-007",
            "business_name": "धाप डेरी तथा चीज उत्पादन केन्द्र",
            "proprietor_name": "मानबहादुर तामाङ",
            "ward_number": 6,
            "fiscal_year": "२०८१/०८२",
            "renewal_date_bs": "२०८१-०६-०५",
            "annual_fee_npr": 6500.0,
            "fine_npr": 0.0,
            "total_paid_npr": 6500.0,
            "payment_gateway": "FONEPAY",
            "receipt_no": "REC-081-8807",
            "renewed_by_officer": "कमल तामाङ (राजस्व अधिकृत)",
        },
        {
            "business_id": str(existing_businesses[7].id) if len(existing_businesses) > 7 else "biz-08",
            "registration_no": "PTGP-BUS-081-008",
            "business_name": "लागर्चे एग्रोभेट तथा कृषि सेवा केन्द्र",
            "proprietor_name": "डिलबहादुर श्रेष्ठ",
            "ward_number": 8,
            "fiscal_year": "२०८१/०८२",
            "renewal_date_bs": "२०८१-०६-१२",
            "annual_fee_npr": 3500.0,
            "fine_npr": 0.0,
            "total_paid_npr": 3500.0,
            "payment_gateway": "बैंक भौचर (कृषि विकास बैंक)",
            "receipt_no": "REC-081-8808",
            "renewed_by_officer": "दिलीप गिरी (लेखापाल)",
        },
        # Historical renewals (FY 2080/081)
        {
            "business_id": str(existing_businesses[0].id) if len(existing_businesses) > 0 else "biz-01",
            "registration_no": "PTGP-BUS-081-001",
            "business_name": "भोताङ हिमालयन रेन्बो ट्राउट फार्म",
            "proprietor_name": "पेम्बा शेर्पा",
            "ward_number": 3,
            "fiscal_year": "२०८०/०८१",
            "renewal_date_bs": "२०८०-०४-२८",
            "annual_fee_npr": 6500.0,
            "fine_npr": 0.0,
            "total_paid_npr": 6500.0,
            "payment_gateway": "बैंक भौचर",
            "receipt_no": "REC-080-4101",
            "renewed_by_officer": "सुरेन्द्र श्रेष्ठ (वडा सचिव)",
        },
        {
            "business_id": str(existing_businesses[1].id) if len(existing_businesses) > 1 else "biz-02",
            "registration_no": "PTGP-BUS-081-002",
            "business_name": "बाँसखर्क अग्र्यानिक सुन्तला तथा किवी कृषि फार्म",
            "proprietor_name": "दावा गोले तामाङ",
            "ward_number": 1,
            "fiscal_year": "२०८०/०८१",
            "renewal_date_bs": "२०८०-०५-०५",
            "annual_fee_npr": 3500.0,
            "fine_npr": 0.0,
            "total_paid_npr": 3500.0,
            "payment_gateway": "FONEPAY",
            "receipt_no": "REC-080-4102",
            "renewed_by_officer": "कमल तामाङ (राजस्व अधिकृत)",
        },
        {
            "business_id": str(existing_businesses[2].id) if len(existing_businesses) > 2 else "biz-03",
            "registration_no": "PTGP-BUS-081-003",
            "business_name": "पञ्चपोखरी याङ्ग्री हेभेन रिसोर्ट",
            "proprietor_name": "लाक्पा दोर्जे शेर्पा",
            "ward_number": 2,
            "fiscal_year": "२०८०/०८१",
            "renewal_date_bs": "२०८०-०५-१५",
            "annual_fee_npr": 12000.0,
            "fine_npr": 0.0,
            "total_paid_npr": 12000.0,
            "payment_gateway": "FONEPAY",
            "receipt_no": "REC-080-4103",
            "renewed_by_officer": "सुरेन्द्र श्रेष्ठ (वडा सचिव)",
        },
        {
            "business_id": str(existing_businesses[3].id) if len(existing_businesses) > 3 else "biz-04",
            "registration_no": "PTGP-BUS-081-004",
            "business_name": "पाँचपोखरी हार्डवेयर एण्ड निर्माण सप्लायर्स",
            "proprietor_name": "सन्तोष पराजुली",
            "ward_number": 7,
            "fiscal_year": "२०८०/०८१",
            "renewal_date_bs": "२०८०-०५-२९",
            "annual_fee_npr": 12000.0,
            "fine_npr": 0.0,
            "total_paid_npr": 12000.0,
            "payment_gateway": "बैंक भौचर",
            "receipt_no": "REC-080-4104",
            "renewed_by_officer": "कमल तामाङ (राजस्व अधिकृत)",
        },
    ]

    for r in renewals_data:
        ren = BusinessRenewal(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            business_id=r["business_id"],
            registration_no=r["registration_no"],
            business_name=r["business_name"],
            proprietor_name=r["proprietor_name"],
            ward_number=r["ward_number"],
            fiscal_year=r["fiscal_year"],
            renewal_date_bs=r["renewal_date_bs"],
            annual_fee_npr=r["annual_fee_npr"],
            fine_npr=r["fine_npr"],
            total_paid_npr=r["total_paid_npr"],
            payment_gateway=r["payment_gateway"],
            receipt_no=r["receipt_no"],
            renewed_by_officer=r["renewed_by_officer"],
            created_at=now,
        )
        db.add(ren)

    db.commit()
    print("  ✓ Seeded 12 Business Renewal records in business_renewals.")

    # 3. Seed Business Inspections (12 on-site field inspections)
    db.query(BusinessInspection).delete()

    inspections_data = [
        {
            "business_id": str(existing_businesses[0].id) if len(existing_businesses) > 0 else "biz-01",
            "registration_no": "PTGP-BUS-081-001",
            "business_name": "भोताङ हिमालयन रेन्बो ट्राउट फार्म",
            "ward_number": 3,
            "inspection_date_bs": "२०८१-०५-१४",
            "inspection_type": "नियमित वार्षिक",
            "inspector_name": "डा. प्रवेश न्यौपाने",
            "inspector_designation": "पशु विकास तथा मत्स्य अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "पानीको बहाव, दाना गुणस्तर, पोखरीको सरसफाइ र जैविक सुरक्षा मापदण्ड पूर्ण पालना भएको।",
            "follow_up_date_bs": "२०८२-०५-१४",
        },
        {
            "business_id": str(existing_businesses[1].id) if len(existing_businesses) > 1 else "biz-02",
            "registration_no": "PTGP-BUS-081-002",
            "business_name": "बाँसखर्क अग्र्यानिक सुन्तला तथा किवी कृषि फार्म",
            "ward_number": 1,
            "inspection_date_bs": "२०८१-०५-१८",
            "inspection_type": "पर्यावरण निरीक्षण",
            "inspector_name": "सन्तोष श्रेष्ठ",
            "inspector_designation": "कृषि प्रसार अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "अर्गानिक जैविक विषादीको मात्र प्रयोग गरिएको। माटो परीक्षण रिपोर्ट अद्यावधिक रहेको।",
            "follow_up_date_bs": "२०८२-०५-१८",
        },
        {
            "business_id": str(existing_businesses[2].id) if len(existing_businesses) > 2 else "biz-03",
            "registration_no": "PTGP-BUS-081-003",
            "business_name": "पञ्चपोखरी याङ्ग्री हेभेन रिसोर्ट",
            "ward_number": 2,
            "inspection_date_bs": "२०८१-०५-२२",
            "inspection_type": "नियमित वार्षिक",
            "inspector_name": "कमल तामाङ",
            "inspector_designation": "राजस्व अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "होटल दर्ता प्रमाणपत्र, कर चुक्ता र पर्यटन बोर्डको मापदण्ड नवीकरण सम्पन्न। भान्सा कोठा सफा रहेको।",
            "follow_up_date_bs": "२०८२-०५-२२",
        },
        {
            "business_id": str(existing_businesses[3].id) if len(existing_businesses) > 3 else "biz-04",
            "registration_no": "PTGP-BUS-081-004",
            "business_name": "पाँचपोखरी हार्डवेयर एण्ड निर्माण सप्लायर्स",
            "ward_number": 7,
            "inspection_date_bs": "२०८१-०५-२७",
            "inspection_type": "विशेष तथा उजुरीमा",
            "inspector_name": "सुरेन्द्र श्रेष्ठ",
            "inspector_designation": "वडा सचिव तथा बजार अनुगमन अधिकृत",
            "compliance_status": "सुधारको सुचना दिइएको ⚠️",
            "remarks": "सडक छेउमा रड तथा बालुवा अव्यवस्थित राख्दा सवारी आवागमनमा बाधा पुगेकोले ३ दिनभित्र हटाउन निर्देशन दिइएको।",
            "follow_up_date_bs": "२०८१-०६-०१",
        },
        {
            "business_id": str(existing_businesses[4].id) if len(existing_businesses) > 4 else "biz-05",
            "registration_no": "PTGP-BUS-081-005",
            "business_name": "थाङपाल सामुदायिक काष्ठ उद्योग तथा फर्निचर",
            "ward_number": 4,
            "inspection_date_bs": "२०८१-०६-०२",
            "inspection_type": "पर्यावरण निरीक्षण",
            "inspector_name": "सन्तोष श्रेष्ठ",
            "inspector_designation": "उद्योग तथा वन अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "काठको स्रोत डिभिजन वन कार्यालयको इजाजत बमोजिम रहेको। ध्वनि नियन्त्रण तथा धूलो व्यवस्थापन सन्तोषजनक।",
            "follow_up_date_bs": "२०८२-०६-०२",
        },
        {
            "business_id": str(existing_businesses[5].id) if len(existing_businesses) > 5 else "biz-06",
            "registration_no": "PTGP-BUS-081-006",
            "business_name": "पाँचपोखरी हस्तकला तथा अल्लो प्राकृतिक रेशा प्रशोधन उद्योग",
            "ward_number": 5,
            "inspection_date_bs": "२०८१-०६-०८",
            "inspection_type": "नियमित वार्षिक",
            "inspector_name": "अनिता लामा",
            "inspector_designation": "महिला विकास तथा साना उद्योग अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "स्थानीय महिला कामदारहरूलाई सुरक्षा उपकरण प्रदान गरिएको र स्थानीय कच्चा पदार्थको समुचित प्रयोग भएको।",
            "follow_up_date_bs": "२०८२-०६-०८",
        },
        {
            "business_id": str(existing_businesses[6].id) if len(existing_businesses) > 6 else "biz-07",
            "registration_no": "PTGP-BUS-081-007",
            "business_name": "धाप डेरी तथा चीज उत्पादन केन्द्र",
            "ward_number": 6,
            "inspection_date_bs": "२०८१-०६-११",
            "inspection_type": "नियमित वार्षिक",
            "inspector_name": "डा. प्रवेश न्यौपाने",
            "inspector_designation": "पशु विकास अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "दुग्ध चिस्यान केन्द्रको तापक्रम -४ डिग्री सेल्सियस कायम रहेको र प्रशोधन युनिटमा स्वच्छता पाइएको।",
            "follow_up_date_bs": "२०८२-०६-११",
        },
        {
            "business_id": str(existing_businesses[7].id) if len(existing_businesses) > 7 else "biz-08",
            "registration_no": "PTGP-BUS-081-008",
            "business_name": "लागर्चे एग्रोभेट तथा कृषि सेवा केन्द्र",
            "ward_number": 8,
            "inspection_date_bs": "२०८१-०६-१५",
            "inspection_type": "नियमित वार्षिक",
            "inspector_name": "कमल तामाङ",
            "inspector_designation": "राजस्व तथा बजार अनुगमन अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "प्रतिबन्धित विषादीको बिक्री नपाइएको, म्याद समाप्त औषधि छुट्टै भण्डारण गरिएको।",
            "follow_up_date_bs": "२०८२-०६-१५",
        },
        {
            "business_id": str(existing_businesses[2].id) if len(existing_businesses) > 2 else "biz-03",
            "registration_no": "PTGP-BUS-081-003",
            "business_name": "पञ्चपोखरी याङ्ग्री हेभेन रिसोर्ट",
            "ward_number": 2,
            "inspection_date_bs": "२०८०-०९-१०",
            "inspection_type": "पर्यावरण निरीक्षण",
            "inspector_name": "सन्तोष श्रेष्ठ",
            "inspector_designation": "वातावरण अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "ठोस फोहोरमैला व्यवस्थापनका लागि कम्पोस्टिङ र सेप्टिक ट्याङ्क सुरक्षित अवस्थामा रहेको।",
            "follow_up_date_bs": "२०८१-०५-२२",
        },
        {
            "business_id": str(existing_businesses[3].id) if len(existing_businesses) > 3 else "biz-04",
            "registration_no": "PTGP-BUS-081-004",
            "business_name": "पाँचपोखरी हार्डवेयर एण्ड निर्माण सप्लायर्स",
            "ward_number": 7,
            "inspection_date_bs": "२०८१-०६-०२",
            "inspection_type": "पुन: जाँच",
            "inspector_name": "सुरेन्द्र श्रेष्ठ",
            "inspector_designation": "वडा सचिव",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "पुनः जाँच गर्दा सडक छेउबाट सामग्री हटाइ आफ्नै कम्पाउण्डभित्र भण्डारण गरेको पाइएको।",
            "follow_up_date_bs": "२०८२-०६-०२",
        },
        {
            "business_id": str(existing_businesses[0].id) if len(existing_businesses) > 0 else "biz-01",
            "registration_no": "PTGP-BUS-081-001",
            "business_name": "भोताङ हिमालयन रेन्बो ट्राउट फार्म",
            "ward_number": 3,
            "inspection_date_bs": "२०८०-०६-०५",
            "inspection_type": "नियमित वार्षिक",
            "inspector_name": "कमल तामाङ",
            "inspector_designation": "राजस्व अधिकृत",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "व्यवसाय इजाजत र नाप तौल प्रमाणीकरण डिजिटल तराजु अद्यावधिक रहेको।",
            "follow_up_date_bs": "२०८१-०५-१४",
        },
        {
            "business_id": str(existing_businesses[6].id) if len(existing_businesses) > 6 else "biz-07",
            "registration_no": "PTGP-BUS-081-007",
            "business_name": "धाप डेरी तथा चीज उत्पादन केन्द्र",
            "ward_number": 6,
            "inspection_date_bs": "२०८०-०५-११",
            "inspection_type": "नियमित वार्षिक",
            "inspector_name": "अनिता लामा",
            "inspector_designation": "स्वास्थ्य निरीक्षक",
            "compliance_status": "अनुपालन सम्पन्न ✅",
            "remarks": "दुध परीक्षणको ल्याक्टोमिटर रिडिङ र फ्याट प्रतिशत दर्ता पुस्तिका व्यवस्थित रहेको।",
            "follow_up_date_bs": "२०८१-०६-११",
        },
    ]

    for insp in inspections_data:
        bi = BusinessInspection(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            business_id=insp["business_id"],
            registration_no=insp["registration_no"],
            business_name=insp["business_name"],
            ward_number=insp["ward_number"],
            inspection_date_bs=insp["inspection_date_bs"],
            inspection_type=insp["inspection_type"],
            inspector_name=insp["inspector_name"],
            inspector_designation=insp["inspector_designation"],
            compliance_status=insp["compliance_status"],
            remarks=insp["remarks"],
            follow_up_date_bs=insp["follow_up_date_bs"],
            created_at=now,
        )
        db.add(bi)

    db.commit()
    print("  ✓ Seeded 12 Business Inspection records in business_inspections.")

    # 4. Synchronize Business table status to reflect active renewals & inspections
    for i, b in enumerate(existing_businesses):
        b.status = "नवीकृत"
        det = dict(b.details or {})
        det["lastRenewalDateBs"] = "२०८१-०५-०१"
        det["renewalDueDateBs"] = "२०८२-०३-३१"
        det["paymentStatus"] = "भुक्तानी सम्पन्न"
        det["inspectionDateBs"] = "२०८१-०५-१५"
        det["inspectionOfficer"] = "कमल तामाङ (राजस्व अधिकृत)"
        det["inspectionRemarks"] = "नियमित स्थलगत निरीक्षण तथा मापदण्ड अनुपालन सम्पन्न।"
        b.details = det
        b.updated_at = now

    db.commit()
    print(f"  ✓ Synchronized {len(existing_businesses)} businesses with renewed status and inspection details.")

    db.close()
    print("🎉 Option 30 Seeding Successfully Completed!")

if __name__ == "__main__":
    seed_business_compliance()
