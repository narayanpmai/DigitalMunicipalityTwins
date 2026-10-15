import uuid
from datetime import datetime
from core.database import SessionLocal
from models.infrastructure import Infrastructure

INFRA_ASSETS = [
    {
        "name": "मेलम्ची-तिपेनी-भोताङ मुख्य सडक (कालोपत्रे तथा ग्राभेल)",
        "name_en": "Melamchi-Tipeni-Bhotang Main Road",
        "type": "road",
        "status": "operational",
        "ward_number": 3,
        "location": "तिपेनी देखि भोताङ सम्म",
        "lat": 27.9350,
        "lng": 85.5980,
        "description": "पाँचपोखरी थाङपाल जोड्ने रणनीतिक पालिकास्तरीय मुख्य सडक।",
        "construction_cost": 85000000.0,
        "length_km": 18.5,
        "beneficiary_households": 1250,
        "beneficiary_population": 5400,
        "constructed_year": 2078,
        "contractor": "शेर्पा-लामा जेभी निर्माण सेवा",
        "condition": "राम्रो (Good)"
    },
    {
        "name": "याङ्ग्री खोला आरसीसी पक्की मोटरेबल पुल",
        "name_en": "Yangri Khola RCC Motor Bridge",
        "type": "bridge",
        "status": "operational",
        "ward_number": 2,
        "location": "याङ्ग्री खोला दोभान",
        "lat": 27.9120,
        "lng": 85.5820,
        "description": "वर्षायाममा पनि बाह्रै महिना सवारी आवागमन सुचारु गर्ने आरसीसी पुल।",
        "construction_cost": 42000000.0,
        "length_km": 0.05,
        "beneficiary_households": 2200,
        "beneficiary_population": 9800,
        "constructed_year": 2079,
        "contractor": "सडक डिभिजन कार्यालय",
        "condition": "उत्कृष्ट (Excellent)"
    },
    {
        "name": "थाङपालकोट लिफ्टिङ तथा गुरुत्व प्रवाह खानेपानी आयोजना",
        "name_en": "Thangpalkot Lifting & Gravity Water Project",
        "type": "water",
        "status": "operational",
        "ward_number": 4,
        "location": "थाङपालकोट मुख्य बस्ती",
        "lat": 27.9420,
        "lng": 85.6050,
        "description": "एक घर एक धारा अभियान अन्तर्गत २५० घरधुरीमा स्वच्छ पिउने पानी।",
        "construction_cost": 18500000.0,
        "length_km": 8.2,
        "beneficiary_households": 250,
        "beneficiary_population": 1150,
        "constructed_year": 2080,
        "contractor": "थाङपालकोट उपभोक्ता समिति",
        "condition": "सन्तोषजनक (Good)"
    },
    {
        "name": "बरुवा प्राथमिक स्वास्थ्य केन्द्र १५ शय्याको नयाँ भवन",
        "name_en": "Baruwa Primary Health Center 15-Bed Building",
        "type": "building",
        "status": "operational",
        "ward_number": 5,
        "location": "बरुवा डाँडा",
        "lat": 27.9510,
        "lng": 85.5740,
        "description": "आधुनिक आकस्मिक, अन्तरङ्ग, प्रसूति तथा एक्स-रे सेवायुक्त भवन।",
        "construction_cost": 65000000.0,
        "length_km": 0.0,
        "beneficiary_households": 1800,
        "beneficiary_population": 7900,
        "constructed_year": 2080,
        "contractor": "सघन सहरी तथा भवन निर्माण आयोजना",
        "condition": "नयाँ तथा उत्कृष्ट (Excellent)"
    },
    {
        "name": "गुन्सा-मानेखर्क पकेट क्षेत्र कृषक सिँचाइ कुलो",
        "name_en": "Gunsa-Manekharka Irrigation Canal",
        "type": "irrigation",
        "status": "operational",
        "ward_number": 6,
        "location": "गुन्सा बेसी",
        "lat": 27.9620,
        "lng": 85.6210,
        "description": "१२० हेक्टर धान, गहुँ र तरकारी खेतीमा बाह्रै महिना सिँचाइ सुविधा।",
        "construction_cost": 9500000.0,
        "length_km": 4.5,
        "beneficiary_households": 180,
        "beneficiary_population": 850,
        "constructed_year": 2079,
        "contractor": "जलस्रोत तथा सिँचाइ डिभिजन",
        "condition": "मर्मत आवश्यक (Fair)"
    },
    {
        "name": "पाँचपोखरी पदमार्ग सौर्य ऊर्जा तथा फाइबर अप्टिक सञ्चार लाइन",
        "name_en": "Panchpokhari Trek Solar & Optical Fiber Line",
        "type": "communication",
        "status": "operational",
        "ward_number": 3,
        "location": "भोताङ-छ्योपार-पाँचपोखरी",
        "lat": 28.0120,
        "lng": 85.6980,
        "description": "उच्च हिमाली पदमार्गमा आपतकालीन सञ्चार र मोबाइल नेटवर्क टावर।",
        "construction_cost": 14000000.0,
        "length_km": 22.0,
        "beneficiary_households": 450,
        "beneficiary_population": 3500,
        "constructed_year": 2081,
        "contractor": "नेपाल टेलिकम तथा पालिका",
        "condition": "सञ्चालनमा (Active)"
    }
]

def seed():
    db = SessionLocal()
    try:
        for a in INFRA_ASSETS:
            existing = db.query(Infrastructure).filter(Infrastructure.name == a["name"]).first()
            if not existing:
                infra = Infrastructure(
                    id=uuid.uuid4(),
                    name=a["name"],
                    name_en=a["name_en"],
                    type=a["type"],
                    status=a["status"],
                    ward_number=a["ward_number"],
                    location=a["location"],
                    lat=a["lat"],
                    lng=a["lng"],
                    description=a["description"],
                    construction_cost=a["construction_cost"],
                    length_km=a["length_km"],
                    beneficiary_households=a["beneficiary_households"],
                    beneficiary_population=a["beneficiary_population"],
                    constructed_year=a["constructed_year"],
                    contractor=a["contractor"],
                    condition=a["condition"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(infra)
        db.commit()
        print("Successfully seeded infrastructure assets!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
