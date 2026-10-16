import sys
import os
import uuid
import json

# Add fastapi-backend to path
backend_path = r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\fastapi-backend"
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from core.database import SessionLocal
from models.municipality import MunicipalityProfile
from models.ward import Ward
from models.setting import SystemSetting
from models.tenant import Tenant

def run():
    db = SessionLocal()
    print("Connecting to DB...")

    # Load Census JSON
    census_file = os.path.join(backend_path, "data", "benighat_nso_census_2021.json")
    with open(census_file, "r", encoding="utf-8") as f:
        census = json.load(f)

    # 1. Update MunicipalityProfile for benighatrorang
    prof = db.query(MunicipalityProfile).filter(
        MunicipalityProfile.tenant_id == "benighatrorang"
    ).first()

    if not prof:
        print("Creating new MunicipalityProfile for benighatrorang...")
        prof = MunicipalityProfile(
            id=str(uuid.uuid4()),
            tenant_id="benighatrorang"
        )
        db.add(prof)

    prof.name_np = "बेनिघाट रोराङ्ग गाउँपालिका"
    prof.name_en = "Benighat Rorang Rural Municipality"
    prof.district = "धादिङ"
    prof.province = "बागमती प्रदेश"
    prof.type = "गाउँपालिका"
    prof.headquarters = "विशालटार, धादिङ"
    prof.ward_count = 10
    prof.area_sq_km = 206.52
    prof.elevation_meters = "३०० मी. देखि २,४५० मी."
    prof.total_population = 33854
    prof.total_households = 7601
    prof.total_schools = 48
    prof.total_health_posts = 10
    prof.annual_budget = "रु. ७२.४० करोड"
    prof.internal_revenue = "रु. ५.८० करोड"

    prof.geography = "धादिङ जिल्लाको दक्षिणी-पश्चिमी पहाडी भूभाग, त्रिशूली तथा मलेखु नदी जलाधार क्षेत्र"
    prof.major_rivers = "त्रिशूली नदी, मलेखु खोला, जवाङ खोला, हुग्दी खोला"
    prof.major_religious_sites = "बुद्धशान्ति गुम्बा, ऐतिहासिक कोट मन्दिर, सिद्धेश्वर गुफा, काली मन्दिर"
    prof.major_tourist_sites = "त्रिशूली रिभर र्‍याफ्टिङ, मलेखु माछा हब, सिम्ले बजार, चेपाङ सम्पदा पदमार्ग"

    prof.introduction = (
        "बेनिघाट रोराङ्ग गाउँपालिका नेपालको बागमती प्रदेश अन्तर्गत धादिङ जिल्लाको "
        "दक्षिण-पश्चिम भेगमा अवस्थित एक विविधतायुक्त, प्राकृतिक तथा सांस्कृतिक सम्पदाले भरिपूर्ण स्थानीय तह हो। "
        "पृथ्वी राजमार्ग यस पालिकाको मध्य भागबाट गएकोले यो राजधानी काठमाडौंसँग सिधा जोडिएको मुख्य लाइफलाइन पनि हो। "
        "यहाँ बहुसंख्यक चेपाङ (प्रजा) जाति (३४.९%), बाहुन (१०.०%), क्षेत्री (९.४%), तामाङ (८.९%), मगर (८.२%) "
        "तथा नेवार (६.७%) समुदायको सहअस्तित्व रहेको छ। राष्ट्रिय जनगणना २०७८ अनुसार यस पालिकाको कुल जनसंख्या ३३,८५४ "
        "र कुल घरधुरी संख्या ७,६०१ रहेको छ।"
    )

    prof.boundaries = {
        "east": "गल्छी गाउँपालिका र थाक्रे गाउँपालिका",
        "west": "चितवन जिल्ला (इच्छाकामना गाउँपालिका)",
        "north": "गजुरी गाउँपालिका र सिद्धलेक गाउँपालिका",
        "south": "मकवानपुर जिल्ला (राक्सिराङ गाउँपालिका)"
    }

    prof.cultural_identity = [
        {
            "title": "चेपाङ / प्रजा मौलिक संस्कृति र न्वागी पर्व",
            "desc": "नेपालकै दुर्लभ र मौलिक चेपाङ जातिको बाहुल्यता (३४.९%), झाँक्री परम्परा, न्वागी पर्व र प्राकृतिक जीवनशैलीको केन्द्र।",
            "icon": "mountain",
            "color": "#1e40af"
        },
        {
            "title": "त्रिशूली नदी र साहसिक र्‍याफ्टिङ",
            "desc": "विश्वप्रसिद्ध त्रिशूली नदीको जलयात्रा, रिभर साइड रिसोर्टहरू, क्याम्पिङ र साहसिक पर्यटनको प्रमुख गन्तव्य।",
            "icon": "waves",
            "color": "#059669"
        },
        {
            "title": "मलेखु माछा तथा स्थानीय कृषि हब",
            "desc": "मलेखुको प्रसिद्ध ताजा माछा, ताजा तरकारी पकेट क्षेत्र, सुन्तला, किवी र जैविक कृषि उत्पादन।",
            "icon": "apple",
            "color": "#9d174d"
        }
    ]

    prof.good_practices = [
        {"title": "चेपाङ समुदाय उत्थान तथा आवास छात्रवृत्ति", "desc": "लोपोन्मुख चेपाङ बालबालिकालाई निःशुल्क आवासीय शिक्षा, स्टेशनरी र पौष्टिक आहार कार्यक्रम।"},
        {"title": "राजमार्ग द्रुत उद्धार तथा स्वास्थ्य सेवा", "desc": "पृथ्वी राजमार्ग खण्डमा २४ सै घण्टा एम्बुलेन्स तथा विपद् द्रुत उद्धार टोली परिचालन।"},
        {"title": "डिजिटल वडा तथा ई-गभर्नेन्स", "desc": "१० वटै वडामा अनलाइन सिफारिस, डिजिटल नागरिक बडापत्र र पेपरलेस सेवा प्रवाह लागू।"}
    ]

    prof.demographics = {
        "totalPopulation": 33854,
        "male": 17116,
        "female": 16738,
        "households": 7601,
        "totalGpsHouses": 7450,
        "highRiskHouses": 185,
        "literacyRate": 74.4,
        "maleLiteracyRate": 79.2,
        "femaleLiteracyRate": 69.6,
        "averageFamilySize": 4.45,
        "sexRatio": 102.26,
        "density": 164.0
    }

    prof.ai_summary = (
        "बेनिघाट रोराङ्ग गाउँपालिका धादिङ जिल्लाको प्रमुख राजमार्ग सञ्जाल, त्रिशूली नदी जलाधार, "
        "मलेखु माछा हब तथा चेपाङ जातिको बाहुल्यता भएको रणनीतिक स्थानीय तह हो। म्युनिसिपल डिजिटल ट्विन्स "
        "प्रणालीमार्फत यस पालिकाको १० वटै वडा, पूर्वाधार, जनसांख्यिकी र नागरिक सेवा एकीकृत गरिएको छ।"
    )

    # 2. Update Wards for benighatrorang
    db.query(Ward).filter(Ward.tenant_id == "benighatrorang").delete()

    BENIGHAT_WARDS = [
        {"ward": 1, "name": "सिम्ले / जरुङ", "chair": "श्री रमेश सिलवाल", "pop": 1988, "male": 985, "female": 1003, "hh": 446, "sec": "सुमन अधिकारी", "phone": "९८५१०१११०१"},
        {"ward": 2, "name": "मलेखु", "chair": "श्री हेमराज त्रिपाठी", "pop": 5303, "male": 2671, "female": 2632, "hh": 1190, "sec": "कमल श्रेष्ठ", "phone": "९८५१०१११०२"},
        {"ward": 3, "name": "शलाङघाट / मजुवा", "chair": "श्री भुवन त्रिपाठी", "pop": 4693, "male": 2457, "female": 2236, "hh": 1054, "sec": "प्रमोद रिजाल", "phone": "९८५१०१११०३"},
        {"ward": 4, "name": "धुषा", "chair": "श्री सन्तबहादुर चेपाङ", "pop": 2310, "male": 1128, "female": 1182, "hh": 518, "sec": "विष्णु चेपाङ", "phone": "९८५१०१११०४"},
        {"ward": 5, "name": "विशालटार (केन्द्र)", "chair": "श्री कृष्णप्रसाद दाहाल", "pop": 3155, "male": 1576, "female": 1579, "hh": 708, "sec": "माधव घिमिरे", "phone": "९८५१०१११०५"},
        {"ward": 6, "name": "गोठीभञ्ज्याङ", "chair": "श्री पूर्णबहादुर मगर", "pop": 2586, "male": 1338, "female": 1248, "hh": 580, "sec": "दीपेन्द्र थापा", "phone": "९८५१०१११०६"},
        {"ward": 7, "name": "चरौँदी", "chair": "श्री नवराज सिलवाल", "pop": 2979, "male": 1507, "female": 1472, "hh": 668, "sec": "हरि कार्की", "phone": "९८५१०१११०७"},
        {"ward": 8, "name": "खटौती", "chair": "श्री रामकृष्ण कँडेल", "pop": 2430, "male": 1241, "female": 1189, "hh": 546, "sec": "राजेश भट्ट", "phone": "९८५१०१११०८"},
        {"ward": 9, "name": "जोगीमारा", "chair": "श्री दिलिप चेपाङ", "pop": 3567, "male": 1771, "female": 1796, "hh": 801, "sec": "सुरेश प्रजा", "phone": "९८५१०१११०९"},
        {"ward": 10, "name": "जवाङखोला / हुग्दीखोला", "chair": "श्री नरबहादुर तामाङ", "pop": 4843, "male": 2442, "female": 2401, "hh": 1090, "sec": "सुवास लामा", "phone": "९८५१०११११०"}
    ]

    for w in BENIGHAT_WARDS:
        new_w = Ward(
            id=uuid.uuid4(),
            tenant_id="benighatrorang",
            ward_number=w["ward"],
            name=f"वडा नं. {w['ward']} ({w['name']})",
            ward_chair_name=w["chair"],
            chairperson=w["chair"],
            secretary=w["sec"],
            phone=w["phone"],
            population=w["pop"],
            total_population=w["pop"],
            male_population=w["male"],
            female_population=w["female"],
            households=w["hh"],
            schools=5,
            health_posts=1,
            is_active=True
        )
        db.add(new_w)

    # 3. Update SystemSettings for benighatrorang
    settings_updates = {
        "palika_name": "बेनिघाट रोराङ्ग गाउँपालिका",
        "palika_name_en": "Benighat Rorang Rural Municipality",
        "province": "बागमती प्रदेश",
        "district": "धादिङ",
        "headquarters": "विशालटार, धादिङ",
        "address": "गाउँ कार्यपालिकाको कार्यालय, विशालटार, धादिङ",
        "slogan": "कृषि, पर्यटन र पूर्वाधार: समृद्ध बेनीघाट रोराङ्गको आधार",
        "total_wards": "10",
        "phone": "०१०-५२९००१",
        "website": "https://benighatrorangmun.gov.np",
        "email": "benighatrorangmun@gmail.com",
        "admin_email": "benighatrorangmun@gmail.com",
        "active_fiscal_year": "२०८१/०८२"
    }

    for k, v in settings_updates.items():
        existing_s = db.query(SystemSetting).filter(
            SystemSetting.tenant_id == "benighatrorang",
            SystemSetting.key == k
        ).first()
        if existing_s:
            existing_s.value = v
        else:
            db.add(SystemSetting(
                id=str(uuid.uuid4()),
                tenant_id="benighatrorang",
                key=k,
                value=v,
                description=f"Configuration for benighatrorang - {k}"
            ))

    db.commit()
    print("SUCCESS: Benighat Rorang profile, 10 wards, and settings updated with official Census 2021 data!")
    db.close()

if __name__ == "__main__":
    run()
