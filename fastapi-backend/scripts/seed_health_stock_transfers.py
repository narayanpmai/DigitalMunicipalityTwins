"""
Seed script for health_stock_transfers table
Panchpokhari Thangpal Rural Municipality - Health Stock Transfers & Inter-Facility Reallocations
"""
import uuid
from datetime import datetime
from core.database import SessionLocal
from models.health import HealthStockTransfer

TRANSFERS_DATA = [
    {
        "transfer_no": "TRF-2081-001",
        "transfer_type": "inter_facility",
        "from_location": "गाउँपालिका केन्द्रीय भण्डार (तिपेनी)",
        "to_location": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "medicine_name": "Paracetamol 500mg Tablets",
        "batch_no": "PCM-2024-08A",
        "quantity": 5000,
        "unit": "Tablets",
        "transfer_date_bs": "२०८१/०४/१२",
        "requested_by": "डा. प्रमेश श्रेष्ठ (Medical Officer)",
        "issued_by": "रामचन्द्र सापकोटा (स्टोर किपर)",
        "status": "completed",
        "remarks": "मासिक नियमित कोटा अनुसार प्राथमिक अस्पताललाई निकासा",
    },
    {
        "transfer_no": "TRF-2081-002",
        "transfer_type": "inter_facility",
        "from_location": "गाउँपालिका केन्द्रीय भण्डार (तिपेनी)",
        "to_location": "भोताङ प्राथमिक स्वास्थ्य केन्द्र",
        "medicine_name": "Amoxicillin 500mg Capsules",
        "batch_no": "AMX-2024-11",
        "quantity": 1200,
        "unit": "Capsules",
        "transfer_date_bs": "२०८१/०४/१५",
        "requested_by": "सोम बहादुर तामाङ (हे.अ.)",
        "issued_by": "रामचन्द्र सापकोटा (स्टोर किपर)",
        "status": "completed",
        "remarks": "वर्षायाममा श्वासप्रश्वास संक्रमण बढेकाले थप एन्टिबायोटिक आपूर्ति",
    },
    {
        "transfer_no": "TRF-2081-003",
        "transfer_type": "emergency_reallocation",
        "from_location": "पाँचपोखरी प्राथमिक अस्पताल",
        "to_location": "बाँसखर्क स्वास्थ्य चौकी तथा बर्थिङ सेन्टर",
        "medicine_name": "Oxytocin 10 IU Injection",
        "batch_no": "OXY-2024-02",
        "quantity": 50,
        "unit": "Ampoules",
        "transfer_date_bs": "२०८१/०४/२२",
        "requested_by": "अनिता घले (सिनियर अनमी)",
        "issued_by": "फार्मेसी अधिकृत",
        "status": "completed",
        "remarks": "बर्थिङ सेन्टरमा सुत्केरी गराउने संख्या बढेकाले आकस्मिक सापटी",
    },
    {
        "transfer_no": "TRF-2081-004",
        "transfer_type": "inter_facility",
        "from_location": "गाउँपालिका केन्द्रीय भण्डार (तिपेनी)",
        "to_location": "बरुवा स्वास्थ्य चौकी तथा बर्थिङ सेन्टर",
        "medicine_name": "Jeevan Jal (ORS) 20.5g Pkts",
        "batch_no": "JJ-2024-03",
        "quantity": 800,
        "unit": "Packets",
        "transfer_date_bs": "२०८१/०५/०१",
        "requested_by": "पदम लाल श्रेष्ठ (इन्चार्ज)",
        "issued_by": "रामचन्द्र सापकोटा",
        "status": "completed",
        "remarks": "वर्षायाममा झाडापखाला जोखिम नियन्त्रणका लागि पूर्वतयारी स्टक",
    },
    {
        "transfer_no": "TRF-2081-005",
        "transfer_type": "inter_facility",
        "from_location": "गाउँपालिका केन्द्रीय भण्डार (तिपेनी)",
        "to_location": "मानेखर्क स्वास्थ्य चौकी तथा प्रसूति गृह",
        "medicine_name": "Iron + Folic Acid (IFA) Tablets",
        "batch_no": "IFA-2024-10",
        "quantity": 2500,
        "unit": "Tablets",
        "transfer_date_bs": "२०८१/०५/०४",
        "requested_by": "निर्मला दोङ (स्टाफ नर्स)",
        "issued_by": "रामचन्द्र सापकोटा",
        "status": "completed",
        "remarks": "गर्भवती महिलाहरूलाई वितरण गर्न निःशुल्क पोषण कार्यक्रम अन्तर्गत",
    },
    {
        "transfer_no": "TRF-2081-006",
        "transfer_type": "emergency_reallocation",
        "from_location": "भोताङ प्राथमिक स्वास्थ्य केन्द्र",
        "to_location": "छिम्ती सामुदायिक स्वास्थ्य एकाइ",
        "medicine_name": "Cetirizine 10mg Tablets",
        "batch_no": "CTZ-2024-09",
        "quantity": 400,
        "unit": "Tablets",
        "transfer_date_bs": "२०८१/०५/०८",
        "requested_by": "दावा शेर्पा (अहेव)",
        "issued_by": "सोम बहादुर तामाङ",
        "status": "completed",
        "remarks": "छिम्ती एकाइमा स्टक सकिएपछि भोताङ PHC बाट तत्काल स्थान्तरण",
    },
    {
        "transfer_no": "TRF-2081-007",
        "transfer_type": "inter_facility",
        "from_location": "गाउँपालिका केन्द्रीय भण्डार (तिपेनी)",
        "to_location": "गुन्सा स्वास्थ्य चौकी",
        "medicine_name": "Metformin 500mg Tablets",
        "batch_no": "MET-2024-04",
        "quantity": 1000,
        "unit": "Tablets",
        "transfer_date_bs": "२०८१/०५/११",
        "requested_by": "हरि प्रसाद ढकाल (हे.अ.)",
        "issued_by": "रामचन्द्र सापकोटा",
        "status": "completed",
        "remarks": "दीर्घरोगी (मधुमेह) बिरामीहरूका लागि निःशुल्क औषधि वितरण प्रयोजन",
    },
    {
        "transfer_no": "TRF-2081-008",
        "transfer_type": "inter_facility",
        "from_location": "गाउँपालिका केन्द्रीय भण्डार (तिपेनी)",
        "to_location": "लाँगर्चे स्वास्थ्य चौकी",
        "medicine_name": "Amlodipine 5mg Tablets",
        "batch_no": "AML-2024-07",
        "quantity": 1500,
        "unit": "Tablets",
        "transfer_date_bs": "२०८१/०५/१४",
        "requested_by": "कल्पना पराजुली (अहेव)",
        "issued_by": "रामचन्द्र सापकोटा",
        "status": "completed",
        "remarks": "उच्च रक्तचापका बिरामीहरूको नियमित मासिक औषधि आपूर्ति",
    },
    {
        "transfer_no": "TRF-2081-009",
        "transfer_type": "inter_facility",
        "from_location": "गाउँपालिका केन्द्रीय भण्डार (तिपेनी)",
        "to_location": "थाङपालधाप गाउँ घर क्लिनिक",
        "medicine_name": "Zinc Sulfate 20mg Tablets",
        "batch_no": "ZNC-2024-06",
        "quantity": 600,
        "unit": "Tablets",
        "transfer_date_bs": "२०८१/०५/१६",
        "requested_by": "विमला गिरी (अनमी)",
        "issued_by": "रामचन्द्र सापकोटा",
        "status": "completed",
        "remarks": "बालबालिकाको झाडापखाला व्यवस्थापन र कुपोषण रोकथामका लागि",
    },
    {
        "transfer_no": "TRF-2081-010",
        "transfer_type": "disposal_expired",
        "from_location": "पाँचपोखरी प्राथमिक अस्पताल फार्मेसी",
        "to_location": "गाउँपालिका औषधि विसर्जन समिति (डम्पिङ साइट)",
        "medicine_name": "Ampicillin 250mg Capsules (म्याद समाप्त)",
        "batch_no": "AMP-2022-EXP",
        "quantity": 240,
        "unit": "Capsules",
        "transfer_date_bs": "२०८१/०५/१८",
        "requested_by": "डा. प्रमेश श्रेष्ठ (अस्पताल प्रमुख)",
        "issued_by": "सुभाष काफ्ले (फार्मासिस्ट)",
        "status": "completed",
        "remarks": "औषधि म्याद नाघेकोले मुचुल्का उठाएर वातावरणमैत्री विसर्जन मिन्हा गरिएको",
    },
    {
        "transfer_no": "TRF-2081-011",
        "transfer_type": "inter_facility",
        "from_location": "गाउँपालिका केन्द्रीय भण्डार (तिपेनी)",
        "to_location": "बरुवा स्वास्थ्य चौकी तथा बर्थिङ सेन्टर",
        "medicine_name": "Povidone Iodine 5% Solution 500ml",
        "batch_no": "PVI-2024-01",
        "quantity": 25,
        "unit": "Bottles",
        "transfer_date_bs": "२०८१/०५/२०",
        "requested_by": "पदम लाल श्रेष्ठ (इन्चार्ज)",
        "issued_by": "रामचन्द्र सापकोटा",
        "status": "in_transit",
        "remarks": "एम्बुलेन्स मार्फत ढुवानी गरिँदै, बाटोमा रहेको",
    },
    {
        "transfer_no": "TRF-2081-012",
        "transfer_type": "emergency_reallocation",
        "from_location": "पाँचपोखरी प्राथमिक अस्पताल",
        "to_location": "भोताङ प्राथमिक स्वास्थ्य केन्द्र",
        "medicine_name": "Anti-Snake Venom 10ml (एएसभी)",
        "batch_no": "ASV-2024-09K",
        "quantity": 10,
        "unit": "Vials",
        "transfer_date_bs": "२०८१/०५/२१",
        "requested_by": "सोम बहादुर तामाङ (हे.अ.)",
        "issued_by": "डा. प्रमेश श्रेष्ठ",
        "status": "in_transit",
        "remarks": "सर्पदंशको बिरामी आएपछि आकस्मिक रूपमा पठाइएको",
    },
]


def seed():
    db = SessionLocal()
    try:
        count = db.query(HealthStockTransfer).count()
        print(f"Current HealthStockTransfer records: {count}")
        if count == 0:
            for item in TRANSFERS_DATA:
                t = HealthStockTransfer(
                    id=str(uuid.uuid4()),
                    transfer_no=item["transfer_no"],
                    transfer_type=item["transfer_type"],
                    from_location=item["from_location"],
                    to_location=item["to_location"],
                    medicine_name=item["medicine_name"],
                    batch_no=item["batch_no"],
                    quantity=item["quantity"],
                    unit=item["unit"],
                    transfer_date_bs=item["transfer_date_bs"],
                    requested_by=item["requested_by"],
                    issued_by=item["issued_by"],
                    status=item["status"],
                    remarks=item["remarks"],
                    created_at=datetime.utcnow(),
                )
                db.add(t)
            db.commit()
            print(f"Successfully seeded {len(TRANSFERS_DATA)} stock transfer records!")
        else:
            print("Records already exist. Skipping seed.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding stock transfers: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
