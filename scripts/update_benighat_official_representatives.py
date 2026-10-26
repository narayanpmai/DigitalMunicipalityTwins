import sys
import uuid

backend_path = r"c:\inetpub\wwwroot\Municipal_Digital_Twins-main\fastapi-backend"
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from core.database import SessionLocal
from models.municipality import MunicipalityProfile
from models.setting import SystemSetting
from models.ward import Ward
from models.representative import Representative

def update_all():
    db = SessionLocal()
    print("Updating Benighat Rorang Official Profile & Representatives...")

    # 1. Update MunicipalityProfile
    prof = db.query(MunicipalityProfile).filter(MunicipalityProfile.tenant_id == "benighatrorang").first()
    if prof:
        prof.headquarters = "विशालटार, धादिङ"
        prof.leadership = {
            "mayor": {
                "name": "कृष्ण बहादुर थपलिया (विवेक)",
                "designation": "गाउँपालिका अध्यक्ष",
                "phone": "०१०-४१६०००",
                "email": "info@benighatrorangmun.gov.np"
            },
            "deputyMayor": {
                "name": "टाप बहादुर श्रेष्ठ",
                "designation": "गाउँपालिका उपाध्यक्ष",
                "phone": "०१०-४१६०००",
                "email": "info@benighatrorangmun.gov.np"
            },
            "chiefOfficer": {
                "name": "प्रमुख प्रशासकीय अधिकृत",
                "designation": "प्रमुख प्रशासकीय अधिकृत",
                "phone": "०१०-४१६०००",
                "email": "info@benighatrorangmun.gov.np"
            },
            "spokesperson": {
                "name": "हेमराज भुजेल",
                "designation": "प्रवक्ता तथा वडा अध्यक्ष (वडा २)",
                "phone": "९८४१००१५९९",
                "email": "ward2@benighatrorangmun.gov.np"
            }
        }
        print("Updated MunicipalityProfile leadership and headquarters.")

    # 2. Update SystemSettings
    settings = {
        "palika_name": "बेनिघाट रोराङ्ग गाउँपालिका",
        "palika_name_en": "Benighat Rorang Rural Municipality",
        "headquarters": "विशालटार, धादिङ",
        "address": "गाउँ कार्यपालिकाको कार्यालय, विशालटार, बेनीघाट रोराङ, धादिङ, बागमती प्रदेश",
        "phone": "०१०-४१६०००",
        "email": "info@benighatrorangmun.gov.np",
        "admin_email": "info@benighatrorangmun.gov.np",
        "website": "https://benighatrorangmun.gov.np",
        "total_wards": "10",
        "slogan": "कृषि, पर्यटन र पूर्वाधार: समृद्ध बेनीघाट रोराङ्गको आधार"
    }
    for k, v in settings.items():
        st = db.query(SystemSetting).filter(
            SystemSetting.tenant_id == "benighatrorang",
            SystemSetting.key == k
        ).first()
        if st:
            st.value = v
        else:
            db.add(SystemSetting(
                id=str(uuid.uuid4()),
                tenant_id="benighatrorang",
                key=k,
                value=v
            ))
    print("Updated SystemSetting for benighatrorang.")

    # 3. Official Ward details mapping
    BENIGHAT_OFFICIAL_WARDS = [
        {"ward": 1, "name": "सिम्ले / जरुङ (सिम्टार)", "chair": "जीवन सिंह तामाङ", "phone": "९८४१५९२२९४", "address": "सिम्टार"},
        {"ward": 2, "name": "मलेखु", "chair": "हेमराज भुजेल", "phone": "९८४१००१५९९", "address": "मलेखु"},
        {"ward": 3, "name": "शलाङघाट / मजुवा", "chair": "भुवन त्रिपाठी", "phone": "९८५१०११६२८", "address": "शलाङघाट"},
        {"ward": 4, "name": "धुषा", "chair": "राजु बहादुर मगर", "phone": "९८०३७१८९७६", "address": "धुषा"},
        {"ward": 5, "name": "विशालटार (केन्द्र)", "chair": "रोशन कुमार सिलवाल (शिव)", "phone": "९८४१५९०७८८", "address": "विशालटार"},
        {"ward": 6, "name": "गोठीभञ्ज्याङ", "chair": "टेकनाथ सिलवाल", "phone": "९८४१५०३७०९", "address": "गोठीभञ्ज्याङ"},
        {"ward": 7, "name": "चरौँदी", "chair": "कुमार बस्नेत", "phone": "९८१८२५५५४५", "address": "चरौँदी"},
        {"ward": 8, "name": "खटौती", "chair": "राज कुमार श्रेष्ठ", "phone": "९८४६०६७४७५", "address": "खटौती"},
        {"ward": 9, "name": "जोगीमारा", "chair": "देवी बहादुर खड्का", "phone": "९८१३१९९५१०", "address": "जोगीमारा"},
        {"ward": 10, "name": "जवाङखोला / हुग्दीखोला", "chair": "विकास चेपाङ", "phone": "९८४४८३८०२९", "address": "जवाङखोला"}
    ]

    for w_info in BENIGHAT_OFFICIAL_WARDS:
        w = db.query(Ward).filter(
            Ward.tenant_id == "benighatrorang",
            Ward.ward_number == w_info["ward"]
        ).first()
        if w:
            w.name = f"वडा नं. {w_info['ward']} ({w_info['name']})"
            w.ward_chair_name = w_info["chair"]
            w.chairperson = w_info["chair"]
            w.phone = w_info["phone"]
            if hasattr(w, "address"):
                w.address = w_info["address"]
    print("Updated 10 Wards chairpersons and phone numbers.")

    # 4. Update Representatives table
    db.query(Representative).filter(Representative.tenant_id == "benighatrorang").delete()

    reps = [
        {"name": "कृष्ण बहादुर थपलिया (विवेक)", "role": "गाउँपालिका अध्यक्ष", "ward": None, "phone": "०१०-४१६०००"},
        {"name": "टाप बहादुर श्रेष्ठ", "role": "गाउँपालिका उपाध्यक्ष", "ward": None, "phone": "०१०-४१६०००"},
        {"name": "प्रमुख प्रशासकीय अधिकृत", "role": "प्रमुख प्रशासकीय अधिकृत", "ward": None, "phone": "०१०-४१६०००"},
    ]
    for w in BENIGHAT_OFFICIAL_WARDS:
        role = "प्रवक्ता तथा वडा अध्यक्ष" if w["ward"] == 2 else "वडा अध्यक्ष"
        reps.append({
            "name": w["chair"],
            "role": role,
            "ward": w["ward"],
            "phone": w["phone"]
        })

    for r in reps:
        db.add(Representative(
            id=str(uuid.uuid4()),
            tenant_id="benighatrorang",
            name=r["name"],
            designation=r["role"],
            ward_no=r["ward"],
            phone=r["phone"],
            email=f"ward{r['ward']}@benighatrorangmun.gov.np" if r["ward"] else "info@benighatrorangmun.gov.np",
            is_current=True
        ))
    print(f"Added {len(reps)} official representatives for benighatrorang.")

    db.commit()
    print("Successfully committed all official Benighat Rorang profile updates!")

if __name__ == "__main__":
    update_all()
