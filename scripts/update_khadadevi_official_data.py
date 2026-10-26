import sys
import os
import uuid
import json

# Add fastapi-backend to path
backend_path = r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\fastapi-backend"
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from core.database import SessionLocal
from models.tenant import Tenant
from models.municipality import MunicipalityProfile
from models.ward import Ward
from models.setting import SystemSetting
from models.representative import Representative

def update_khadadevi():
    db = SessionLocal()
    print("Connecting to DB and updating Khandadevi Rural Municipality Official Data...")

    # Load Census 2021 Data
    census_file = os.path.join(backend_path, "data", "khadadevi_nso_census_2021.json")
    with open(census_file, "r", encoding="utf-8") as f:
        census = json.load(f)

    ov = census["overview"]

    target_tenants = ["khadadevi", "khandadevi"]

    # 1. Update or create Tenants
    for tid in target_tenants:
        tenant = db.query(Tenant).filter(Tenant.subdomain == tid).first()
        if not tenant:
            print(f"Creating tenant record for {tid}...")
            tenant = Tenant(
                id=str(uuid.uuid4()),
                subdomain=tid,
                name_np="खाँडादेवी गाउँपालिका",
                name_en="Khandadevi Rural Municipality",
                status="active"
            )
            db.add(tenant)
        else:
            tenant.name_np = "खाँडादेवी गाउँपालिका"
            tenant.name_en = "Khandadevi Rural Municipality"
            tenant.status = "active"

    db.commit()
    print("Tenants updated/verified.")

    # 2. Update MunicipalityProfile for both khadadevi and khandadevi
    for tid in target_tenants:
        prof = db.query(MunicipalityProfile).filter(MunicipalityProfile.tenant_id == tid).first()
        if not prof:
            print(f"Creating MunicipalityProfile for {tid}...")
            prof = MunicipalityProfile(
                id=str(uuid.uuid4()),
                tenant_id=tid
            )
            db.add(prof)

        prof.name_np = "खाँडादेवी गाउँपालिका"
        prof.name_en = "Khandadevi Rural Municipality"
        prof.district = "रामेछाप"
        prof.province = "बागमती प्रदेश"
        prof.type = "गाउँपालिका"
        prof.headquarters = "माकादुम, रामेछाप"
        prof.ward_count = 9
        prof.area_sq_km = 150.07
        prof.elevation_meters = "४६५ मी. देखि १,९८५ मी."
        prof.total_population = ov["total_population"]
        prof.total_households = ov["total_households"]
        prof.total_schools = 42
        prof.total_health_posts = 9
        prof.annual_budget = "रु. ४८.६० करोड"
        prof.internal_revenue = "रु. १.९५ करोड"

        prof.geography = "रामेछाप जिल्लाको दक्षिण-पश्चिमी पहाडी तथा सुनकोशी र तामाकोशी नदी तटीय भूभाग"
        prof.major_rivers = "सुनकोशी नदी, तामाकोशी नदी, दुर्गा नदी, स्थानीय खोलाहरू"
        prof.major_religious_sites = "ऐतिहासिक खाँडादेवी मन्दिर (शक्तिपीठ), विश्वामित्र गुफा, अग्लेश्वर महादेव, कुशेश्वर महादेव, मुकुटेश्वरी, सहस्रधारा"
        prof.major_tourist_sites = "खाँडादेवी कोट/मन्दिर (१९८५ मी.), सित्खा झोलुङ्गे पुल, सुनकोशी रिभर बीच, अग्लेश्वर डाँडा, गागल भ्यु-पोइन्ट"

        prof.boundaries = {
            "east": "मन्थली नगरपालिका (सदरमुकाम)",
            "west": "सुनापति गाउँपालिका र काभ्रेपलाञ्चोक जिल्ला",
            "north": "दोरम्बा गाउँपालिका र सुनापति गाउँपालिका",
            "south": "सिन्धुली जिल्ला (सुनकोशी नदी सिमाना)"
        }

        prof.introduction = (
            "खाँडादेवी गाउँपालिका नेपालको बागमती प्रदेशअन्तर्गत रामेछाप जिल्लामा अवस्थित एक ऐतिहासिक, "
            "धार्मिक तथा प्राकृतिक सौन्दर्यले भरिपूर्ण स्थानीय तह हो। नेपालको संविधान तथा संघीय शासन प्रणालीअनुसार "
            "स्थानीय तह पुनर्संरचनाका क्रममा वि.सं. २०७३ सालमा यस गाउँपालिकाको स्थापना भएको हो। साविकका राकाथुम, "
            "मझुवा, भीरपानी, पकरबास, माकादुम, गागल–भदौरे, खाँडादेवी र पिङ्खुरी गाउँ विकास समितिहरू समेटेर ९ वटा वडाहरूमा "
            "गाउँपालिका गठन गरिएको हो। सुन्दर, सभ्य र समृद्ध खाँडादेवी निर्माणको संकल्पसहित गाउँ कार्यपालिकाको कार्यालय "
            "माकादुम (वडा नं. ६), रामेछापमा अवस्थित छ। प्रसिद्ध ऐतिहासिक शक्तिपीठ खाँडादेवी मन्दिरको नामबाट यस पालिकाको "
            "नामाकरण गरिएको हो। यहाँ तामाङ, क्षेत्री, नेवार, माझी, मगर, ब्राह्मण, दलित लगायतका विभिन्न जातजातिहरूको "
            "धार्मिक तथा सांस्कृतिक सद्भाव रहेको छ। राष्ट्रिय जनगणना २०७८ अनुसार यस गाउँपालिकाको कुल जनसंख्या १९,३१२ "
            "तथा कुल घरधुरी संख्या ५,५०१ रहेको छ।"
        )

        prof.cultural_identity = [
            {
                "title": "ऐतिहासिक शक्तिपीठ श्री खाँडादेवी मन्दिर (१९८५ मी.)",
                "desc": "समुद्री सतहबाट १,९८५ मिटर उचाइमा अवस्थित नेपालकै प्रसिद्ध ऐतिहासिक एवं धार्मिक शक्तिपीठ, जहाँ बडादसैँ तथा चैते दसैँमा विशाल पूजा तथा मेला लाग्दछ।",
                "icon": "mountain",
                "color": "#dc2626"
            },
            {
                "title": "सुनकोशी र तामाकोशी नदी संगम तथा रिभर पर्यटन",
                "desc": "पवित्र सुनकोशी तथा तामाकोशी नदीको जलाधार, सित्खा झोलुङ्गे पुल, रिभर बिच, र्‍याफ्टिङ र जलयात्राको आकर्षक सम्भावना।",
                "icon": "waves",
                "color": "#0284c7"
            },
            {
                "title": "बहुजातीय मौलिक संस्कृति तथा ऐतिहासिक विश्वामित्र गुफा",
                "desc": "तामाङ सेलो, नेवारी लाखे नाच, माझी समुदायको परम्परागत जीवनशैली, विश्वामित्र गुफा र अग्लेश्वर महादेव क्षेत्र।",
                "icon": "sparkles",
                "color": "#059669"
            }
        ]

        prof.good_practices = [
            {"title": "डिजिटल वडा तथा अनलाइन सिफारिस सेवा", "desc": "९ वटै वडा कार्यालयबाट अनलाइन नागरिक सिफारिस, डिजिटल नागरिक बडापत्र र टोकन प्रणाली लागू।"},
            {"title": "कृषि तथा पशुपालन पकेट क्षेत्र विकास", "desc": "स्थानीय कृषकको आयआर्जन वृद्धिका लागि फलफूल, नगदे बाली, बाख्रापालन र कृषि उपजको बजार व्यवस्थापन।"},
            {"title": "सम्पदा संरक्षण तथा पर्यटन पूर्वाधार", "desc": "खाँडादेवी मन्दिर, पदमार्ग, सडक कालोपत्रे र धार्मिक पर्यटन प्रवर्द्धन योजना।"},
            {"title": "आधारभूत स्वास्थ्य र निःशुल्क औषधि", "desc": "सबै वडामा स्वास्थ्य चौकी, आधारभूत स्वास्थ्य सेवा, सुरक्षित मातृत्व र ज्येष्ठ नागरिक घरदैलो स्वास्थ्य परीक्षण।"}
        ]

        prof.demographics = {
            "totalPopulation": ov["total_population"],
            "male": ov["male_population"],
            "female": ov["female_population"],
            "households": ov["total_households"],
            "totalGpsHouses": 5420,
            "highRiskHouses": 68,
            "literacyRate": ov["literacy_rate"],
            "maleLiteracyRate": ov["male_literacy_rate"],
            "femaleLiteracyRate": ov["female_literacy_rate"],
            "averageFamilySize": ov["average_household_size"],
            "sexRatio": ov["sex_ratio"],
            "density": ov["population_density"],
            "growthRate": ov["annual_growth_rate"],
            "economicallyActive": 8450,
            "participationRate": 65.5,
            "abroad": 1280
        }

        prof.leadership = {
            "mayor": {
                "name": "ज्ञानकुमार श्रेष्ठ",
                "designation": "गाउँपालिका अध्यक्ष",
                "phone": "०६०-४२०१०६",
                "email": "mayor@khandadevimun.gov.np"
            },
            "deputyMayor": {
                "name": "रमा घिसिङ",
                "designation": "गाउँपालिका उपाध्यक्ष",
                "phone": "०६०-४२०१०६",
                "email": "deputymayor@khandadevimun.gov.np"
            },
            "chiefOfficer": {
                "name": "प्रमुख प्रशासकीय अधिकृत",
                "designation": "प्रमुख प्रशासकीय अधिकृत",
                "phone": "०६०-४२०१०७",
                "email": "cao@khandadevimun.gov.np"
            },
            "spokesperson": {
                "name": "नारायण कार्की",
                "designation": "प्रवक्ता तथा वडा अध्यक्ष (वडा ६)",
                "phone": "०६०-४२०१०६",
                "email": "ward6@khandadevimun.gov.np"
            }
        }

        prof.ai_summary = (
            "खाँडादेवी गाउँपालिका रामेछाप जिल्लाको ऐतिहासिक शक्तिपीठ खाँडादेवी मन्दिर, "
            "सुनकोशी-तामाकोशी नदी जलाधार र समृद्ध सांस्कृतिक विविधतायुक्त स्थानीय तह हो। "
            "म्युनिसिपल डिजिटल ट्विन्स प्रणालीमार्फत यस पालिकाका ९ वटै वडा, जनसंख्या, "
            "सामाजिक-आर्थिक सूचक र नागरिक सेवा एकीकृत गरिएको छ।"
        )

    db.commit()
    print("MunicipalityProfile updated for khadadevi and khandadevi.")

    # 3. Official Wards Data (9 Wards from NSO Census 2021 + Local Election Representatives)
    KHADADEVI_OFFICIAL_WARDS = [
        {
            "ward": 1,
            "name": "राकाथुम",
            "chair": "राम कुमार श्रेष्ठ",
            "pop": 2602,
            "male": 1225,
            "female": 1377,
            "hh": 742,
            "phone": "०६०-४२०१०१",
            "sec": "वडा सचिव"
        },
        {
            "ward": 2,
            "name": "मझुवा",
            "chair": "केशव कुमार प्रधान",
            "pop": 1476,
            "male": 666,
            "female": 810,
            "hh": 421,
            "phone": "०६०-४२०१०२",
            "sec": "वडा सचिव"
        },
        {
            "ward": 3,
            "name": "भीरपानी (सित्खा/गाल्पा)",
            "chair": "पुष्कर कुमार कार्की",
            "pop": 2377,
            "male": 1091,
            "female": 1286,
            "hh": 677,
            "phone": "०६०-४२०१०३",
            "sec": "वडा सचिव"
        },
        {
            "ward": 4,
            "name": "आमडाँडा (भीरपानी/पकरबास)",
            "chair": "कृष्ण प्रसाद पौडेल",
            "pop": 3128,
            "male": 1503,
            "female": 1625,
            "hh": 891,
            "phone": "०६०-४२०१०४",
            "sec": "वडा सचिव"
        },
        {
            "ward": 5,
            "name": "पकरबास",
            "chair": "मनोज पौडेल",
            "pop": 1949,
            "male": 912,
            "female": 1037,
            "hh": 555,
            "phone": "०६०-४२०१०५",
            "sec": "वडा सचिव"
        },
        {
            "ward": 6,
            "name": "माकादुम (गाउँपालिका केन्द्र)",
            "chair": "नारायण कार्की",
            "pop": 1601,
            "male": 743,
            "female": 858,
            "hh": 456,
            "phone": "०६०-४२०१०६",
            "sec": "वडा सचिव"
        },
        {
            "ward": 7,
            "name": "खाँडादेवी (ऐतिहासिक मन्दिर)",
            "chair": "सिरे तामाङ",
            "pop": 3003,
            "male": 1405,
            "female": 1598,
            "hh": 855,
            "phone": "०६०-४२०१०७",
            "sec": "वडा सचिव"
        },
        {
            "ward": 8,
            "name": "गागल–भदौरे",
            "chair": "जङ्ग लाल तामाङ",
            "pop": 1722,
            "male": 795,
            "female": 927,
            "hh": 490,
            "phone": "०६०-४२०१०८",
            "sec": "वडा सचिव"
        },
        {
            "ward": 9,
            "name": "पिङ्खुरी",
            "chair": "अकल बहादुर भण्डारी",
            "pop": 1454,
            "male": 655,
            "female": 799,
            "hh": 414,
            "phone": "०६०-४२०१०९",
            "sec": "वडा सचिव"
        }
    ]

    for tid in target_tenants:
        db.query(Ward).filter(Ward.tenant_id == tid).delete()
        for w in KHADADEVI_OFFICIAL_WARDS:
            new_w = Ward(
                id=uuid.uuid4(),
                tenant_id=tid,
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

    db.commit()
    print("Official 9 wards created and synced for khadadevi and khandadevi.")

    # 4. Official Representatives (अध्यक्ष, उपाध्यक्ष, तथा ९ वटै वडा अध्यक्षहरू)
    OFFICIAL_REPRESENTATIVES = [
        {
            "name": "ज्ञानकुमार श्रेष्ठ",
            "designation": "गाउँपालिका अध्यक्ष",
            "ward_no": None,
            "phone": "०६०-४२०१०६",
            "email": "mayor@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "रमा घिसिङ",
            "designation": "गाउँपालिका उपाध्यक्ष",
            "ward_no": None,
            "phone": "०६०-४२०१०६",
            "email": "deputymayor@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "राम कुमार श्रेष्ठ",
            "designation": "वडा अध्यक्ष (वडा नं. १)",
            "ward_no": 1,
            "phone": "०६०-४२०१०१",
            "email": "ward1@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "केशव कुमार प्रधान",
            "designation": "वडा अध्यक्ष (वडा नं. २)",
            "ward_no": 2,
            "phone": "०६०-४२०१०२",
            "email": "ward2@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "पुष्कर कुमार कार्की",
            "designation": "वडा अध्यक्ष (वडा नं. ३)",
            "ward_no": 3,
            "phone": "०६०-४२०१०३",
            "email": "ward3@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "कृष्ण प्रसाद पौडेल",
            "designation": "वडा अध्यक्ष (वडा नं. ४)",
            "ward_no": 4,
            "phone": "०६०-४२०१०४",
            "email": "ward4@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "मनोज पौडेल",
            "designation": "वडा अध्यक्ष (वडा नं. ५)",
            "ward_no": 5,
            "phone": "०६०-४२०१०५",
            "email": "ward5@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "नारायण कार्की",
            "designation": "वडा अध्यक्ष (वडा नं. ६)",
            "ward_no": 6,
            "phone": "०६०-४२०१०६",
            "email": "ward6@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "सिरे तामाङ",
            "designation": "वडा अध्यक्ष (वडा नं. ७)",
            "ward_no": 7,
            "phone": "०६०-४२०१०७",
            "email": "ward7@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "जङ्ग लाल तामाङ",
            "designation": "वडा अध्यक्ष (वडा नं. ८)",
            "ward_no": 8,
            "phone": "०६०-४२०१०८",
            "email": "ward8@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "अकल बहादुर भण्डारी",
            "designation": "वडा अध्यक्ष (वडा नं. ९)",
            "ward_no": 9,
            "phone": "०६०-४२०१०९",
            "email": "ward9@khandadevimun.gov.np",
            "party": "जनप्रतिनिधि"
        }
    ]

    for tid in target_tenants:
        db.query(Representative).filter(Representative.tenant_id == tid).delete()
        for rep_data in OFFICIAL_REPRESENTATIVES:
            db_rep = Representative(
                id=str(uuid.uuid4()),
                tenant_id=tid,
                name=rep_data["name"],
                designation=rep_data["designation"],
                ward_no=rep_data["ward_no"],
                phone=rep_data["phone"],
                email=rep_data["email"],
                political_party=rep_data["party"],
                is_current=True
            )
            db.add(db_rep)

    db.commit()
    print("Official Representatives seeded for khadadevi and khandadevi.")

    # 5. SystemSettings Configuration
    settings_updates = {
        "palika_name": "खाँडादेवी गाउँपालिका",
        "palika_name_en": "Khandadevi Rural Municipality",
        "slogan": "सुन्दर, सभ्य र समृद्ध खाँडादेवी !!!",
        "province": "बागमती प्रदेश",
        "district": "रामेछाप",
        "headquarters": "माकादुम, रामेछाप",
        "address": "गाउँ कार्यपालिकाको कार्यालय, माकादुम, रामेछाप, बागमती प्रदेश",
        "total_wards": "9",
        "phone": "०६०-४२०१०६",
        "website": "https://khandadevimun.gov.np",
        "email": "khandadevimunicipality@gmail.com",
        "admin_email": "info@khandadevimun.gov.np",
        "active_fiscal_year": "२०८१/०८२",
        "chief_officer_title": "प्रमुख प्रशासकीय अधिकृत",
        "emergency_ambulance": "१०२ / ९८५४०२०१०२",
        "emergency_police": "१०० / ९८५४०२०१००",
        "emergency_fire": "१०१",
        "emergency_disaster": "११४४"
    }

    for tid in target_tenants:
        for k, v in settings_updates.items():
            existing_s = db.query(SystemSetting).filter(
                SystemSetting.tenant_id == tid,
                SystemSetting.key == k
            ).first()
            if existing_s:
                existing_s.value = v
            else:
                db.add(SystemSetting(
                    id=str(uuid.uuid4()),
                    tenant_id=tid,
                    key=k,
                    value=v,
                    description=f"Configuration for {tid} - {k}"
                ))

    db.commit()
    print("SystemSettings updated successfully for khadadevi and khandadevi.")
    db.close()
    print("ALL OFFICIAL KHADADEVI DATA SUCCESSFULLY UPDATED IN DATABASE!")

if __name__ == "__main__":
    update_khadadevi()
