import uuid
from datetime import datetime
from core.database import SessionLocal
from models.budget import Budget
from models.planning import Plan

SEED_BUDGETS = [
    {
        "id": "b1010101-1111-2222-3333-444455556601",
        "title": "सडक तथा यातायात पूर्वाधार विकास बजेट",
        "fiscal_year": "२०८१/०८२",
        "type": "capital",
        "status": "approved",
        "sector": "पूर्वाधार विकास",
        "allocated_amount": 225000000.0,
        "released_amount": 160000000.0,
        "spent_amount": 128500000.0,
        "source_of_fund": "संघीय समानीकरण तथा पालिका आन्तरिक स्रोत",
        "description": "पालिकास्तरीय तथा वडास्तरीय कृषि सडक, पक्की सडक, कल्भर्ट तथा झोलुङ्गे पुल निर्माण।"
    },
    {
        "id": "b1010101-1111-2222-3333-444455556602",
        "title": "शिक्षा, विद्यालय सुधार तथा पोषण कार्यक्रम बजेट",
        "fiscal_year": "२०८१/०८२",
        "type": "conditional",
        "status": "approved",
        "sector": "सामाजिक विकास",
        "allocated_amount": 65000000.0,
        "released_amount": 48000000.0,
        "spent_amount": 42100000.0,
        "source_of_fund": "संघीय सशर्त अनुदान",
        "description": "विद्यालय दिवा खाजा, दरबन्दी मिलान, डिजिटल कक्षा कोठा तथा छात्रवृत्ति वितरण।"
    },
    {
        "id": "b1010101-1111-2222-3333-444455556603",
        "title": "स्वास्थ्य चौकी स्तरोन्नति, औषधी तथा ल्याब सेवा बजेट",
        "fiscal_year": "२०८१/०८२",
        "type": "conditional",
        "status": "approved",
        "sector": "सामाजिक विकास",
        "allocated_amount": 45000000.0,
        "released_amount": 32000000.0,
        "spent_amount": 27400000.0,
        "source_of_fund": "संघीय तथा प्रदेश सशर्त अनुदान",
        "description": "निःशुल्क ९८ प्रकारका औषधी आपूर्ति, खोप कार्यक्रम, वर्थिङ सेन्टर तथा ल्याब उपकरण।"
    },
    {
        "id": "b1010101-1111-2222-3333-444455556604",
        "title": "कृषि तथा पशुपालन पकेट क्षेत्र अनुदान तथा यन्त्रिकीकरण",
        "fiscal_year": "२०८१/०८२",
        "type": "capital",
        "status": "approved",
        "sector": "आर्थिक विकास",
        "allocated_amount": 38000000.0,
        "released_amount": 26000000.0,
        "spent_amount": 21800000.0,
        "source_of_fund": "प्रदेश विशेष अनुदान तथा पालिका स्रोत",
        "description": "किवी, ट्राउट माछा, आलु बीउ, याक फार्म तथा रासायनिक मल ढुवानी अनुदान।"
    },
    {
        "id": "b1010101-1111-2222-3333-444455556605",
        "title": "पर्यटन पूर्वाधार, होमस्टे प्रवर्द्धन तथा पदमार्ग मर्मत",
        "fiscal_year": "२०८१/०८२",
        "type": "capital",
        "status": "approved",
        "sector": "पर्यटन तथा संस्कृति",
        "allocated_amount": 28000000.0,
        "released_amount": 19000000.0,
        "spent_amount": 15600000.0,
        "source_of_fund": "पर्यटन बोर्ड तथा पालिका स्रोत",
        "description": "पाँचपोखरी पदमार्ग रेलिङ, याङ्ग्री पिक भ्यूटावर, तामाङ सङ्ग्रहालय तथा होमस्टे तालिम।"
    },
    {
        "id": "b1010101-1111-2222-3333-444455556606",
        "title": "विपद् व्यवस्थापन कोष तथा आपतकालीन राहत",
        "fiscal_year": "२०८१/०८२",
        "type": "capital",
        "status": "approved",
        "sector": "वातावरण तथा विपद्",
        "allocated_amount": 25000000.0,
        "released_amount": 18000000.0,
        "spent_amount": 11200000.0,
        "source_of_fund": "विपद् कोष तथा आन्तरिक राजस्व",
        "description": "पहिरो रोकथाम ग्याबियन जाली, आपतकालीन उद्धार सामग्री, बाढी पूर्वसूचना यन्त्र।"
    },
    {
        "id": "b1010101-1111-2222-3333-444455556607",
        "title": "प्रशासनिक सञ्चालन तथा कर्मचारी पारिश्रमिक (चालु)",
        "fiscal_year": "२०८१/०८२",
        "type": "recurrent",
        "status": "approved",
        "sector": "संस्थागत विकास तथा सुशासन",
        "allocated_amount": 118000000.0,
        "released_amount": 78000000.0,
        "spent_amount": 68500000.0,
        "source_of_fund": "वित्तीय समानीकरण अनुदान",
        "description": "कर्मचारी तलब, भत्ता, कार्यालय सञ्चालन, इन्धन, बिजुली तथा सञ्चार महसुल।"
    }
]

SEED_PLANS = [
    {
        "id": "c2020202-1111-2222-3333-444455556601",
        "title": "पाँचपोखरी थाङपाल पञ्चवर्षीय आवधिक विकास योजना (२०८१-२०८६)",
        "title_en": "Panchpokhari Thangpal 5-Year Periodic Plan (2024-2029)",
        "type": "medium_term",
        "status": "approved",
        "fiscal_year": "२०८१/०८२",
        "start_year": 2081,
        "end_year": 2086,
        "description": "पालिकाको समग्र आर्थिक, सामाजिक, पूर्वाधार तथा वातावरणीय रूपान्तरणको रणनीतिक मार्गचित्र।",
        "objectives": "समृद्ध, आत्मनिर्भर, डिजिटल तथा जलवायु अनुकूलित पाँचपोखरी थाङपाल निर्माण।",
        "targets": [
            {"target": "प्रतिव्यक्ति आय रु. १,८०,००० पुर्‍याउने", "targetYear": "२०८६"},
            {"target": "१००% घरधुरीमा आधारभूत खानेपानी तथा बिजुली", "targetYear": "२०८३"},
            {"target": "पालिका मुख्य सडक कालोपत्रे सम्पन्न", "targetYear": "२०८५"}
        ],
        "estimated_budget": 1250000000.0,
        "sector": "समग्र पालिका"
    },
    {
        "id": "c2020202-1111-2222-3333-444455556602",
        "title": "पाँचपोखरी धार्मिक तथा पर्यावरण पर्यटन गुरुयोजना",
        "title_en": "Panchpokhari Religious & Eco-Tourism Master Plan",
        "type": "sectoral",
        "status": "ongoing",
        "fiscal_year": "२०८१/०८२",
        "start_year": 2080,
        "end_year": 2085,
        "description": "४,१०० मिटर उचाइमा रहेको पवित्र पाँचपोखरी ताल तथा हेलम्बु ट्रेकिङ रुटको एकीकृत संरक्षण र प्रवर्द्धन।",
        "objectives": "वार्षिक ५०,००० बाह्य तथा आन्तरिक पर्यटक भित्र्याई स्थानीय आयआर्जन ३ गुणा वृद्धि गर्ने।",
        "targets": [
            {"target": "६० वटा नयाँ होमस्टे सञ्चालन तथा प्रमाणीकरण", "targetYear": "२०८२"},
            {"target": "आमा याङ्ग्री पदमार्गमा सुरक्षित रेलिङ तथा आश्रयस्थल", "targetYear": "२०८१"},
            {"target": "विद्युतीय फोहोर व्यवस्थापन प्रणाली", "targetYear": "२०८२"}
        ],
        "estimated_budget": 180000000.0,
        "sector": "पर्यटन तथा संस्कृति"
    },
    {
        "id": "c2020202-1111-2222-3333-444455556603",
        "title": "सुरक्षित तथा विपद्-प्रतिरोधी बस्ती विकास गुरुयोजना",
        "title_en": "Resilient Settlement & DRR Master Plan",
        "type": "sectoral",
        "status": "ongoing",
        "fiscal_year": "२०८१/०८२",
        "start_year": 2081,
        "end_year": 2086,
        "description": "मेलम्ची बाढी तथा भूकम्प जोखिमयुक्त बस्तीहरूको स्थानान्तरण र नदी तटबन्धन पूर्वाधार।",
        "objectives": "प्राकृतिक विपद्बाट हुने मानवीय र भौतिक क्षति शून्यमा झार्ने।",
        "targets": [
            {"target": "मेलम्ची र याङ्ग्री खोला नदी नियन्त्रण पर्खाल", "targetYear": "२०८३"},
            {"target": "८ वटै वडामा आपतकालीन सुरक्षित आश्रयस्थल", "targetYear": "२०८२"}
        ],
        "estimated_budget": 240000000.0,
        "sector": "वातावरण तथा विपद्"
    },
    {
        "id": "c2020202-1111-2222-3333-444455556604",
        "title": "डिजिटल पाँचपोखरी: सूचना प्रविधि तथा सुशासन गुरुयोजना",
        "title_en": "Digital Panchpokhari Master Plan",
        "type": "long_term",
        "status": "approved",
        "fiscal_year": "२०८१/०८२",
        "start_year": 2081,
        "end_year": 2090,
        "description": "डिजिटल टुइन्स, पेपरलेस वडा कार्यालय, अनलाइन नागरिक सेवा तथा रियल-टाइम सेन्सर अनुगमन।",
        "objectives": "शतप्रतिशत प्रशासनिक सेवा नागरिकको मोबाइल एपबाटै प्रवाह गर्ने।",
        "targets": [
            {"target": "१००% ई-सिफारिस तथा डिजिटल हस्ताक्षर लागू", "targetYear": "२०८१"},
            {"target": "गाउँपालिका भरी हाई-स्पीड अप्टिकल फाइबर", "targetYear": "२०८२"}
        ],
        "estimated_budget": 95000000.0,
        "sector": "सूचना प्रविधि तथा सुशासन"
    }
]

def seed():
    db = SessionLocal()
    try:
        for b_data in SEED_BUDGETS:
            bid = uuid.UUID(b_data["id"])
            existing = db.query(Budget).filter(Budget.id == bid).first()
            if not existing:
                b = Budget(
                    id=bid,
                    title=b_data["title"],
                    fiscal_year=b_data["fiscal_year"],
                    type=b_data["type"],
                    status=b_data["status"],
                    sector=b_data["sector"],
                    allocated_amount=b_data["allocated_amount"],
                    released_amount=b_data["released_amount"],
                    spent_amount=b_data["spent_amount"],
                    source_of_fund=b_data["source_of_fund"],
                    description=b_data["description"],
                    approved_by="गाउँसभा",
                    approved_at=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(b)

        for p_data in SEED_PLANS:
            pid = uuid.UUID(p_data["id"])
            existing_p = db.query(Plan).filter(Plan.id == pid).first()
            if not existing_p:
                p = Plan(
                    id=pid,
                    title=p_data["title"],
                    title_en=p_data["title_en"],
                    type=p_data["type"],
                    status=p_data["status"],
                    fiscal_year=p_data["fiscal_year"],
                    start_year=p_data["start_year"],
                    end_year=p_data["end_year"],
                    description=p_data["description"],
                    objectives=p_data["objectives"],
                    targets=p_data["targets"],
                    estimated_budget=p_data["estimated_budget"],
                    sector=p_data["sector"],
                    approved_by="गाउँ कार्यपालिका",
                    approved_at=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(p)

        db.commit()
        print("Successfully seeded budgets and plans!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
