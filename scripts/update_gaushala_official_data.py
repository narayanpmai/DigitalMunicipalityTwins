import sys
import os
import uuid
import json

backend_path = r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\fastapi-backend"
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from core.database import SessionLocal
from models.tenant import Tenant
from models.municipality import MunicipalityProfile
from models.ward import Ward
from models.setting import SystemSetting
from models.representative import Representative

def update_gaushala():
    db = SessionLocal()
    print("Connecting to DB and updating Gaushala Municipality Official Data...")

    # Load Census 2021 Data
    census_file = os.path.join(backend_path, "data", "gaushala_nso_census_2021.json")
    with open(census_file, "r", encoding="utf-8") as f:
        census = json.load(f)

    ov = census["overview"]
    target_tenants = ["gaushala", "gaushalamun"]

    # 1. Update or create Tenants
    for tid in target_tenants:
        tenant = db.query(Tenant).filter((Tenant.subdomain == tid) | (Tenant.id == tid)).first()
        if not tenant:
            print(f"Creating tenant record for {tid}...")
            tenant = Tenant(
                id=str(uuid.uuid4()),
                subdomain=tid,
                name_np="गौशाला नगरपालिका",
                name_en="Gaushala Municipality",
                status="active"
            )
            db.add(tenant)
        else:
            tenant.name_np = "गौशाला नगरपालिका"
            tenant.name_en = "Gaushala Municipality"
            tenant.status = "active"

    db.commit()
    print("Tenants updated/verified.")

    # 2. Update MunicipalityProfile
    for tid in target_tenants:
        prof = db.query(MunicipalityProfile).filter(MunicipalityProfile.tenant_id == tid).first()
        if not prof:
            print(f"Creating MunicipalityProfile for {tid}...")
            prof = MunicipalityProfile(
                id=str(uuid.uuid4()),
                tenant_id=tid
            )
            db.add(prof)

        prof.name_np = "गौशाला नगरपालिका"
        prof.name_en = "Gaushala Municipality"
        prof.district = "महोत्तरी"
        prof.province = "मधेश प्रदेश"
        prof.type = "नगरपालिका"
        prof.headquarters = "गौशाला बजार, महोत्तरी"
        prof.ward_count = 12
        prof.area_sq_km = 144.73
        prof.elevation_meters = "६१ मी. देखि १५० मी."
        prof.total_population = ov["total_population"]
        prof.total_households = ov["total_households"]
        prof.total_schools = 58
        prof.total_health_posts = 14
        prof.annual_budget = "रु. ७४.५० करोड"
        prof.internal_revenue = "रु. ४.२० करोड"

        prof.geography = "महोत्तरी जिल्लाको मध्य-पश्चिम उर्वर तराई-मधेश भूभाग, मरहा र रातो नदी जलाधार"
        prof.major_rivers = "मरहा नदी, रातो नदी, बडहरी खोला"
        prof.major_religious_sites = "गौशाला शिव मन्दिर, दुर्गा मन्दिर, रामजानकी मन्दिर, मदिना मस्जिद, विभिन्न वडाका ऐतिहासिक धार्मिक स्थलहरू"
        prof.major_tourist_sites = "गौशाला बजार, एभरेष्ट सुगर एण्ड केमिकल इन्डस्ट्रिज (चिनी मिल), निगौल गाई फार्म, रामनगर, कान्तिबजार, त्रिभुवन"

        prof.boundaries = {
            "east": "औरही नगरपालिका तथा भंगाहा नगरपालिका",
            "west": "सर्लाही जिल्ला (ईश्वरपुर नगरपालिका)",
            "north": "बर्दिबास नगरपालिका",
            "south": "सम्सी गाउँपालिका तथा सोनमा गाउँपालिका"
        }

        prof.introduction = (
            "गौशाला नगरपालिका नेपालको मधेश प्रदेश अन्तर्गत महोत्तरी जिल्लामा अवस्थित एक ऐतिहासिक, "
            "व्यापारिक, औद्योगिक तथा कृषि उत्पादनले समृद्ध स्थानीय तह हो। नेपाल सरकारको निर्णयअनुसार साविकका गौशाला, "
            "रामनगर, निगौल, भरतपुर, लक्ष्मीनिया, कान्तिबजार र बेलगाछी गाउँ विकास समितिहरूलाई समेटेर यस नगरपालिकाको "
            "गठन भएको हो। नगर कार्यपालिकाको कार्यालय गौशाला बजार (वडा नं. ५), महोत्तरीमा अवस्थित छ। यस नगरपालिका १२ वटा "
            "वडाहरूमा विभाजित छ। नेपालकै ठूलो चिनी कारखाना एभरेष्ट सुगर एण्ड केमिकल इन्डस्ट्रिज, ऐतिहासिक निगौल गाई फार्म, "
            "मरहा नदी र व्यापारिक केन्द्र गौशाला बजार यस पालिकाका मुख्य पहिचान हुन्। राष्ट्रिय जनगणना २०७८ अनुसार यस नगरपालिकाको "
            "कुल जनसंख्या ७२,४८१ (पुरुष: ३६,२५०, महिला: ३६,२३१) तथा कुल घरधुरी संख्या १४,४४६ रहेको छ।"
        )

        prof.cultural_identity = [
            {
                "title": "ऐतिहासिक गौशाला बजार तथा सांस्कृतिक धरोहर",
                "desc": "गौशाला बजार मधेशको प्रमुख व्यापारिक केन्द्र हो जहाँ छठ, विवाह पञ्चमी, होली, इद तथा दसैँ हर्षोल्लासका साथ मनाइन्छ।",
                "icon": "mountain",
                "color": "#dc2626"
            },
            {
                "title": "नेपालकै प्रमुख चिनी उद्योग (एभरेष्ट सुगर मिल)",
                "desc": "हजारौँ उखु किसानको आर्थिक मेरुदण्ड तथा औद्योगिक पहिचान बोकेको एभरेष्ट सुगर एण्ड केमिकल इन्डस्ट्रिज।",
                "icon": "building",
                "color": "#0284c7"
            },
            {
                "title": "उर्वर कृषि भूमि र ऐतिहासिक निगौल गाई फार्म",
                "desc": "उखु, धान, गहुँ, दलहन, तेलहन, तरकारी खेती तथा परम्परागत ऐतिहासिक निगौल पशुपालन केन्द्र।",
                "icon": "sprout",
                "color": "#059669"
            }
        ]

        prof.good_practices = [
            {"title": "१२ वटै वडामा डिजिटल सेवा तथा अनलाइन सिफारिस", "desc": "प्रत्येक वडा कार्यालयबाट अनलाइन नागरिक सिफारिस, डिजिटल नागरिक बडापत्र र द्रुत सेवा प्रवाह लागू।"},
            {"title": "उखु कृषक अनुदान तथा कृषि यान्त्रिकीकरण", "desc": "स्थानीय उखु, धान र गहुँ कृषकहरूका लागि उन्नत बीउ, मल, कृषि सहुलियत र सिँचाइ विस्तार।"},
            {"title": "गुणस्तरीय आधारभूत स्वास्थ्य र २४ घण्टा एम्बुलेन्स", "desc": "नगर अस्पताल, १२ वटै वडामा स्वास्थ्य चौकी र आकस्मिक एम्बुलेन्स सेवा।"},
            {"title": "सडक सञ्जाल स्तरोन्नति र ढल निकास योजना", "desc": "गौशाला बजार तथा ग्रामीण बस्ती जोड्ने कालोपत्रे सडक, आरसीसी नाला र दिगो पूर्वाधार विकास।"}
        ]

        prof.demographics = {
            "totalPopulation": ov["total_population"],
            "male": ov["male_population"],
            "female": ov["female_population"],
            "households": ov["total_households"],
            "totalGpsHouses": 13950,
            "highRiskHouses": 120,
            "literacyRate": ov["literacy_rate"],
            "maleLiteracyRate": ov["male_literacy_rate"],
            "femaleLiteracyRate": ov["female_literacy_rate"],
            "averageFamilySize": ov["average_household_size"],
            "sexRatio": ov["sex_ratio"],
            "density": ov["population_density"],
            "growthRate": ov["annual_growth_rate"],
            "economicallyActive": 28450,
            "participationRate": 62.4,
            "abroad": 4820,
            "ownedHousePct": 96.7,
            "rentedHousePct": 1.4,
            "toiletPct": 90.8
        }

        prof.leadership = {
            "mayor": {
                "name": "डा. दिपेन्द्र महतो",
                "designation": "नगर प्रमुख",
                "phone": "९८५४०२९१५८",
                "email": "mayor@gaushalamun.gov.np"
            },
            "deputyMayor": {
                "name": "रेनु कुमारी महतो",
                "designation": "नगर उपप्रमुख",
                "phone": "९८५४०२९१५९",
                "email": "deputymayor@gaushalamun.gov.np"
            },
            "chiefOfficer": {
                "name": "प्रमुख प्रशासकीय अधिकृत",
                "designation": "प्रमुख प्रशासकीय अधिकृत",
                "phone": "०४४-५८०१११",
                "email": "cao@gaushalamun.gov.np"
            },
            "spokesperson": {
                "name": "नगर प्रवक्ता",
                "designation": "प्रवक्ता",
                "phone": "०४४-५८०१११",
                "email": "info@gaushalamun.gov.np"
            }
        }

        prof.ai_summary = (
            "गौशाला नगरपालिका मधेश प्रदेशको महोत्तरी जिल्लामा अवस्थित व्यापारिक, औद्योगिक तथा कृषि उत्पादनले "
            "समृद्ध स्थानीय तह हो। नेपालकै प्रमुख चिनी कारखाना एभरेष्ट सुगर मिल तथा १२ वटै वडा कार्यालय रहेको यस नगरपालिकामा "
            "डिजिटल ट्विन प्रणालीमार्फत सम्पूर्ण पूर्वाधार, सामाजिक-आर्थिक तथ्याङ्क र नागरिक सेवा एकीकृत गरिएको छ।"
        )

    db.commit()
    print("MunicipalityProfile updated for gaushala.")

    # 3. Official 12 Wards Data
    OFFICIAL_WARDS = [
        {"ward": 1, "name": "रामनगर (उत्तरी क्षेत्र)", "chair": "नविन कुमार साह", "pop": 7638, "male": 3845, "female": 3793, "hh": 1520, "phone": "९८५४०३४५८१", "email": "wd1.gaushalamun@gmail.com"},
        {"ward": 2, "name": "निगौल (बजार क्षेत्र)", "chair": "श्याम सुन्दर मण्डल", "pop": 8613, "male": 4166, "female": 4447, "hh": 1715, "phone": "९८५४०३४५८२", "email": "wd2.gaushalamun@gmail.com"},
        {"ward": 3, "name": "बेलगाछी (उत्तरी बस्ती)", "chair": "बिरेन्द्र चौधरी", "pop": 4234, "male": 2148, "female": 2086, "hh": 843, "phone": "९८५४०३४५८३", "email": "wd3.gaushalamun@gmail.com"},
        {"ward": 4, "name": "रजखोर / भरतपुर", "chair": "राम नारायण महासेठ", "pop": 8194, "male": 4138, "female": 4056, "hh": 1632, "phone": "९८५४०३४५८४", "email": "wd4.gaushalamun@gmail.com"},
        {"ward": 5, "name": "गौशाला बजार (केन्द्र)", "chair": "ओम प्रकाश गुप्ता", "pop": 7702, "male": 3916, "female": 3786, "hh": 1534, "phone": "९८५४०३४५८५", "email": "wd5.gaushalamun@gmail.com"},
        {"ward": 6, "name": "फुलकाहा", "chair": "राम स्वार्थ यादव", "pop": 3180, "male": 1615, "female": 1565, "hh": 633, "phone": "९८५४०३४५८६", "email": "wd6.gaushalamun@gmail.com"},
        {"ward": 7, "name": "मनहर्वा", "chair": "मनोज चौधरी", "pop": 4446, "male": 2243, "female": 2203, "hh": 885, "phone": "९८५४०३४५८७", "email": "wd7.gaushalamun@gmail.com"},
        {"ward": 8, "name": "कुसमारी / रामनगर", "chair": "भोज बहादुर दर्लामी", "pop": 5827, "male": 2916, "female": 2911, "hh": 1160, "phone": "९८५४०३४५८८", "email": "wd8.gaushalamun@gmail.com"},
        {"ward": 9, "name": "डुमरिया", "chair": "बद्रि प्रसाद दनुवार", "pop": 5822, "male": 2885, "female": 2937, "hh": 1159, "phone": "९८५४०३४५८९", "email": "wd9.gaushalamun@gmail.com"},
        {"ward": 10, "name": "भरतपुर / बटौवा", "chair": "बिष्णु कुमार महतो", "pop": 6236, "male": 3085, "female": 3151, "hh": 1242, "phone": "९८५४०३४५९०", "email": "wd10.gaushalamun@gmail.com"},
        {"ward": 11, "name": "लक्ष्मीनिया", "chair": "राम पृत महतो कोईरी", "pop": 5833, "male": 2901, "female": 2932, "hh": 1162, "phone": "९८५४०३४५९१", "email": "wd11.gaushalamun@gmail.com"},
        {"ward": 12, "name": "कान्तिबजार", "chair": "कुशेश्वर सिंह", "pop": 4756, "male": 2392, "female": 2364, "hh": 961, "phone": "९८५४०३४५९२", "email": "wd12.gaushalamun@gmail.com"}
    ]

    for tid in target_tenants:
        db.query(Ward).filter(Ward.tenant_id == tid).delete()
        for w in OFFICIAL_WARDS:
            new_w = Ward(
                id=uuid.uuid4(),
                tenant_id=tid,
                ward_number=w["ward"],
                name=f"वडा नं. {w['ward']} ({w['name']})",
                ward_chair_name=w["chair"],
                chairperson=w["chair"],
                secretary="वडा सचिव",
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
    print("Official 12 wards created and synced for gaushala.")

    # 4. Official Representatives (नगर प्रमुख, उपप्रमुख, तथा १२ वटै वडा अध्यक्षहरू)
    OFFICIAL_REPRESENTATIVES = [
        {
            "name": "डा. दिपेन्द्र महतो",
            "designation": "नगर प्रमुख",
            "ward_no": None,
            "phone": "९८५४०२९१५८",
            "email": "mayor@gaushalamun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {
            "name": "रेनु कुमारी महतो",
            "designation": "नगर उपप्रमुख",
            "ward_no": None,
            "phone": "९८५४०२९१५९",
            "email": "deputymayor@gaushalamun.gov.np",
            "party": "जनप्रतिनिधि"
        },
        {"name": "नविन कुमार साह", "designation": "वडा अध्यक्ष (वडा नं. १)", "ward_no": 1, "phone": "९८५४०३४५८१", "email": "wd1.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "श्याम सुन्दर मण्डल", "designation": "वडा अध्यक्ष (वडा नं. २)", "ward_no": 2, "phone": "९८५४०३४५८२", "email": "wd2.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "बिरेन्द्र चौधरी", "designation": "वडा अध्यक्ष (वडा नं. ३)", "ward_no": 3, "phone": "९८५४०३४५८३", "email": "wd3.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "राम नारायण महासेठ", "designation": "वडा अध्यक्ष (वडा नं. ४)", "ward_no": 4, "phone": "९८५४०३४५८४", "email": "wd4.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "ओम प्रकाश गुप्ता", "designation": "वडा अध्यक्ष (वडा नं. ५)", "ward_no": 5, "phone": "९८५४०३४५८५", "email": "wd5.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "राम स्वार्थ यादव", "designation": "वडा अध्यक्ष (वडा नं. ६)", "ward_no": 6, "phone": "९८५४०३४५८६", "email": "wd6.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "मनोज चौधरी", "designation": "वडा अध्यक्ष (वडा नं. ७)", "ward_no": 7, "phone": "९८५४०३४५८७", "email": "wd7.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "भोज बहादुर दर्लामी", "designation": "वडा अध्यक्ष (वडा नं. ८)", "ward_no": 8, "phone": "९८५४०३४५८८", "email": "wd8.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "बद्रि प्रसाद दनुवार", "designation": "वडा अध्यक्ष (वडा नं. ९)", "ward_no": 9, "phone": "९८५४०३४५८९", "email": "wd9.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "बिष्णु कुमार महतो", "designation": "वडा अध्यक्ष (वडा नं. १०)", "ward_no": 10, "phone": "९८५४०३४५९०", "email": "wd10.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "राम पृत महतो कोईरी", "designation": "वडा अध्यक्ष (वडा नं. ११)", "ward_no": 11, "phone": "९८५४०३४५९१", "email": "wd11.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"},
        {"name": "कुशेश्वर सिंह", "designation": "वडा अध्यक्ष (वडा नं. १२)", "ward_no": 12, "phone": "९८५४०३४५९२", "email": "wd12.gaushalamun@gmail.com", "party": "जनप्रतिनिधि"}
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
    print("Official Representatives seeded for gaushala.")

    # 5. SystemSettings Configuration
    settings_updates = {
        "palika_name": "गौशाला नगरपालिका",
        "palika_name_en": "Gaushala Municipality",
        "slogan": "कृषि, उद्योग र समृद्धिको सहर: हाम्रो गौशाला नगर",
        "province": "मधेश प्रदेश",
        "district": "महोत्तरी",
        "headquarters": "गौशाला बजार, महोत्तरी",
        "address": "नगर कार्यपालिकाको कार्यालय, गौशाला, महोत्तरी, मधेश प्रदेश",
        "total_wards": "12",
        "phone": "०४४-५८०१११",
        "website": "https://gaushalamun.gov.np",
        "email": "gaushalamun@gmail.com",
        "admin_email": "info@gaushalamun.gov.np",
        "active_fiscal_year": "२०८१/०८२",
        "chief_officer_title": "प्रमुख प्रशासकीय अधिकृत",
        "emergency_ambulance": "१०२ / ९८५४०२९१५८",
        "emergency_police": "१००",
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
    print("SystemSettings updated successfully for gaushala.")
    db.close()
    print("ALL OFFICIAL GAUSHALA DATA SUCCESSFULLY UPDATED IN DATABASE!")

if __name__ == "__main__":
    update_gaushala()
