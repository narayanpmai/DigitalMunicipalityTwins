"""
Seed Master Data Management (MDM) & Citizen 360 Socio-Economic Records
Municipal Digital Twins — Panchpokhari Thangpal Rural Municipality
Populates:
  1. mdm_wards (Wards 1 to 8)
  2. mdm_toles (16 authentic toles)
  3. mdm_addresses (16 geo-referenced addresses)
  4. mdm_citizens (24 verified citizens)
  5. mdm_households (16 household registries)
  6. c360_household_socio_economic (16 household socio-economic profiles)
  7. c360_citizen_applications (24 citizen service application logs)
"""
import uuid
import datetime
from core.database import SessionLocal
from models.master_data import (
    WardMaster, ToleMaster, AddressMaster, HouseholdMaster, CitizenMaster
)
from models.citizen_360 import (
    HouseholdSocioEconomicProfile, CitizenApplicationLog
)

TENANT_ID = "panchpokhari"

def seed_c360_socioeconomic():
    db = SessionLocal()
    try:
        print("=== SEEDING OPTION 29: CITIZEN 360 & MDM SOCIO-ECONOMIC SURVEY ===")
        now = datetime.datetime.now(datetime.timezone.utc)

        # ── 1. MDM WARDS ────────────────────────────────────────────────────────
        existing_wards = db.query(WardMaster).count()
        if existing_wards == 0:
            print("Seeding mdm_wards...")
            wards_data = [
                {"id": f"ward-0{w}", "number": w, "pop": [2850, 3120, 2940, 3650, 2480, 2710, 3420, 2980][w-1], "area": [24.5, 32.1, 48.6, 28.4, 38.2, 22.8, 19.4, 26.0][w-1]}
                for w in range(1, 9)
            ]
            for wd in wards_data:
                ward = WardMaster(
                    tenant_id=TENANT_ID,
                    id=wd["id"],
                    ward_number=wd["number"],
                    population=wd["pop"],
                    area_sq_km=wd["area"],
                    boundary_geojson={"type": "Polygon", "coordinates": []}
                )
                db.add(ward)
            db.commit()
            print("Seeded 8 wards into mdm_wards.")

        # ── 2. MDM TOLES ────────────────────────────────────────────────────────
        existing_toles = db.query(ToleMaster).count()
        if existing_toles == 0:
            print("Seeding mdm_toles...")
            tole_defs = [
                ("tole-01", "ward-01", "बाँसखर्क बजार", "Banskharka Bazar"),
                ("tole-02", "ward-01", "पात्ले तोल", "Patle"),
                ("tole-03", "ward-02", "बरुवा बजार", "Baruwa Bazar"),
                ("tole-04", "ward-02", "छिम्ती", "Chhimti"),
                ("tole-05", "ward-03", "भोताङ बजार", "Bhotang Bazar"),
                ("tole-06", "ward-03", "याङ्ग्री", "Yangri"),
                ("tole-07", "ward-04", "मानेखर्क मुख्य बजार", "Manekharka Main"),
                ("tole-08", "ward-04", "डाँडागाउँ", "Dandagaun"),
                ("tole-09", "ward-05", "गुन्सा बजार", "Gunsa Bazar"),
                ("tole-10", "ward-05", "गोल्फे", "Golphe"),
                ("tole-11", "ward-06", "थाङपालधाप", "Thangpaldhap"),
                ("tole-12", "ward-06", "भोटेचौर", "Bhotechaur"),
                ("tole-13", "ward-07", "तिपेनी बजार", "Tipeni Bazar"),
                ("tole-14", "ward-07", "भोटेनाम्लाङ", "Bhotenamlang"),
                ("tole-15", "ward-08", "लामिडाँडा", "Lamidanda"),
                ("tole-16", "ward-08", "बेँसीगाउँ", "Besigaun"),
            ]
            for t_id, w_id, t_name, t_en in tole_defs:
                tole = ToleMaster(
                    tenant_id=TENANT_ID,
                    id=t_id,
                    ward_id=w_id,
                    tole_name=t_name,
                    tole_name_en=t_en,
                    boundary_geojson={"type": "Point", "coordinates": []}
                )
                db.add(tole)
            db.commit()
            print("Seeded 16 toles into mdm_toles.")

        # ── 3. MDM ADDRESSES ────────────────────────────────────────────────────
        existing_addr = db.query(AddressMaster).count()
        if existing_addr == 0:
            print("Seeding mdm_addresses...")
            sample_coords = [
                (27.9345, 85.5721), (27.9392, 85.5794),
                (27.9512, 85.6123), (27.9568, 85.6190),
                (27.9841, 85.6534), (27.9895, 85.6612),
                (27.9623, 85.6315), (27.9680, 85.6389),
                (27.9456, 85.6450), (27.9490, 85.6510),
                (27.9123, 85.5940), (27.9170, 85.5990),
                (27.8945, 85.5820), (27.8990, 85.5890),
                (27.9250, 85.6210), (27.9290, 85.6270),
            ]
            for i in range(16):
                w_num = (i // 2) + 1
                t_idx = i + 1
                addr = AddressMaster(
                    tenant_id=TENANT_ID,
                    id=f"addr-{i+1:02d}",
                    ward_id=f"ward-0{w_num}",
                    tole_id=f"tole-{t_idx:02d}",
                    street_name=f"पाँचपोखरी मुख्य मार्ग खण्ड-{i+1}",
                    house_number=f"घर नं. {101+i}",
                    latitude=sample_coords[i][0],
                    longitude=sample_coords[i][1],
                )
                db.add(addr)
            db.commit()
            print("Seeded 16 addresses into mdm_addresses.")

        # ── 4. MDM CITIZENS ─────────────────────────────────────────────────────
        existing_cit = db.query(CitizenMaster).count()
        if existing_cit == 0:
            print("Seeding mdm_citizens...")
            citizen_data = [
                ("cit-01", "दावा", "दोर्जे", "तामाङ", "Dawa Dorje Tamang", "२०३५-०२-१४", "पुरुष", "२७-०१-५८-००१२३", "९८४१२२३३०१", "घरमुली"),
                ("cit-02", "पासाङ", "ल्हामु", "शेर्पा", "Pasang Lhamu Sherpa", "२०३८-०५-२०", "महिला", "२७-०१-६०-००४५६", "९८४१२२३३०२", "श्रीमती"),
                ("cit-03", "राम", "बहादुर", "तामाङ", "Ram Bahadur Tamang", "२०३०-११-०५", "पुरुष", "२७-०१-५३-००७८९", "९८४१२२३३०३", "घरमुली"),
                ("cit-04", "माया", "", "तामाङ", "Maya Tamang", "२०३४-०४-१२", "महिला", "२७-०१-५७-०१००२", "९८४१२२३३०४", "श्रीमती"),
                ("cit-05", "छिरिङ", "वाङ्दी", "लामा", "Tshering Wangdi Lama", "२०२८-०८-१८", "पुरुष", "२७-०१-५१-०१२३४", "९८४१२२३३०५", "घरमुली"),
                ("cit-06", "निमा", "डिकी", "ह्योल्मो", "Nima Diki Hyolmo", "२०३३-०१-२५", "महिला", "२७-०१-५६-०१४५६", "९८४१२२३३०६", "श्रीमती"),
                ("cit-07", "सोम", "बहादुर", "सापकोटा", "Som Bahadur Sapkota", "२०३२-०६-०९", "पुरुष", "२७-०१-५५-०१६७८", "९८४१२२३३०७", "घरमुली"),
                ("cit-08", "देवी", "कुमारी", "सापकोटा", "Devi Kumari Sapkota", "२०३७-०९-१४", "महिला", "२७-०१-६०-०१८९०", "९८४१२२३३०८", "श्रीमती"),
                ("cit-09", "कर्ण", "बहादुर", "श्रेष्ठ", "Karna Bahadur Shrestha", "२०३४-१२-२२", "पुरुष", "२७-०१-५७-०२०१२", "९८४१२२३३०९", "घरमुली"),
                ("cit-10", "शान्ति", "", "श्रेष्ठ", "Shanti Shrestha", "२०३९-०३-१७", "महिला", "२७-०१-६२-०२२३४", "९८४१२२३३१०", "श्रीमती"),
                ("cit-11", "ग्याल्जेन", "नोर्बु", "ह्योल्मो", "Gyaljen Norbu Hyolmo", "२०२५-०७-११", "पुरुष", "२७-०१-४८-०२४५६", "९८४१२२३३११", "घरमुली"),
                ("cit-12", "फुपु", "ल्हामु", "ह्योल्मो", "Phupu Lhamu Hyolmo", "२०३०-१०-०४", "महिला", "२७-०१-५३-०२६७८", "९८४१२२३३१२", "श्रीमती"),
                ("cit-13", "इन्द्र", "बहादुर", "पण्डित", "Indra Bahadur Pandit", "२०२९-०४-२८", "पुरुष", "२७-०१-५२-०२८९०", "९८४१२२३३१३", "घरमुली"),
                ("cit-14", "सरिता", "", "पण्डित", "Sarita Pandit", "२०३४-०८-१६", "महिला", "२७-०१-५७-०३०१२", "९८४१२२३३१४", "श्रीमती"),
                ("cit-15", "तेन्जिङ", "छेवाङ", "लामा", "Tenzing Chhewang Lama", "२०३१-०१-०८", "पुरुष", "२७-०१-५४-०३२३४", "९८४१२२३३१५", "घरमुली"),
                ("cit-16", "डोल्मा", "", "लामा", "Dolma Lama", "२०३६-०५-२३", "महिला", "२७-०१-५९-०३४५६", "९८४१२२३३१६", "श्रीमती"),
                ("cit-17", "गोपाल", "प्रसाद", "दङ्गाल", "Gopal Prasad Dangal", "२०२७-११-३०", "पुरुष", "२७-०१-५०-०३६७८", "९८४१२२३३१७", "घरमुली"),
                ("cit-18", "मुना", "", "दङ्गाल", "Muna Dangal", "२०३२-०२-१४", "महिला", "२७-०१-५५-०३८९०", "९८४१२२३३१८", "श्रीमती"),
                ("cit-19", "ल्हाक्पा", "रिन्जिन", "शेर्पा", "Lhakpa Rinjin Sherpa", "२०३३-०९-०५", "पुरुष", "२७-०१-५६-०४०१२", "९८४१२२३३१९", "घरमुली"),
                ("cit-20", "कर्मा", "याङ्जी", "शेर्पा", "Karma Yangji Sherpa", "२०३८-१२-११", "महिला", "२७-०१-६१-०४२३४", "९८४१२२३३२०", "श्रीमती"),
                ("cit-21", "दीपक", "कुमार", "विक", "Deepak Kumar BK", "२०३६-०४-१८", "पुरुष", "२७-०१-५९-०४४५६", "९८४१२२३३२१", "घरमुली"),
                ("cit-22", "कमला", "", "विक", "Kamala BK", "२०४०-०७-२२", "महिला", "२७-०१-६३-०४६७८", "९८४१२२३३२२", "श्रीमती"),
                ("cit-23", "मिङ्मार", "दोर्जे", "ह्योल्मो", "Mingmar Dorje Hyolmo", "२०३२-०३-१५", "पुरुष", "२७-०१-५५-०४८९०", "९८४१२२३३२३", "घरमुली"),
                ("cit-24", "पेम्बा", "डिकी", "ह्योल्मो", "Pemba Diki Hyolmo", "२०३७-०८-२९", "महिला", "२७-०१-६०-०५०१२", "९८४१२२३३२४", "श्रीमती"),
            ]

            for c_id, fn, mn, ln, f_en, dob, gen, c_no, mob, rel in citizen_data:
                cit = CitizenMaster(
                    tenant_id=TENANT_ID,
                    id=c_id,
                    first_name=fn,
                    middle_name=mn or None,
                    last_name=ln,
                    full_name_en=f_en,
                    dob_bs=dob,
                    gender=gen,
                    citizenship_no=c_no,
                    national_id=f"NID-2081-{c_id.replace('cit-', '')}",
                    mobile_no=mob,
                    relationship_to_head=rel
                )
                db.add(cit)
            db.commit()
            print("Seeded 24 citizens into mdm_citizens.")

        # ── 5. MDM HOUSEHOLDS ───────────────────────────────────────────────────
        existing_hh = db.query(HouseholdMaster).count()
        if existing_hh == 0:
            print("Seeding mdm_households...")
            for i in range(16):
                head_cit_id = f"cit-{(i*2)%24 + 1:02d}"
                hh = HouseholdMaster(
                    tenant_id=TENANT_ID,
                    id=f"hh-{i+1:02d}",
                    address_id=f"addr-{i+1:02d}",
                    head_of_household_id=head_cit_id,
                    household_number=f"P5-HH-2081-{i+1:03d}",
                    water_source="पाइपधारा (सुरक्षित खानेपानी)",
                    electricity_type="राष्ट्रिय प्रसारण ग्रिड",
                    fuel_type="एलपीजी ग्यास र स्थानीय बायोमास",
                    toilet_type="पक्की फ्लस शौचालय",
                    meta_data={"familyMembersCount": 4 + (i % 3), "houseStoreys": 2}
                )
                db.add(hh)
            db.commit()
            print("Seeded 16 households into mdm_households.")

        # ── 6. C360 HOUSEHOLD SOCIO-ECONOMIC PROFILES ───────────────────────────
        existing_se = db.query(HouseholdSocioEconomicProfile).count()
        if existing_se == 0:
            print("Seeding c360_household_socio_economic...")
            incomes = ["रु १-३ लाख", "रु ३-५ लाख", "रु ५-८ लाख", "रु ८ लाख भन्दा बढी"]
            occupations = [
                "व्यावसायिक किबी तथा स्याउ खेती",
                "पशुपालन, चौँरी तथा दुग्ध संकलन",
                "पर्यटन, होमस्टे तथा पदमार्ग सेवा",
                "वैदेशिक रोजगार तथा रेमिट्यान्स",
                "साना व्यापार तथा किराना पसल",
                "शिक्षण तथा निजामती सेवा"
            ]
            risks = ["Low", "Medium", "High", "Low", "Medium"]

            for i in range(16):
                hh_id = f"hh-{i+1:02d}"
                v_score = 20 + ((i * 13) % 65) # Realistic score 20 to 85
                se_profile = HouseholdSocioEconomicProfile(
                    tenant_id=TENANT_ID,
                    id=f"se-{i+1:02d}",
                    household_id=hh_id,
                    annual_income_bracket=incomes[i % len(incomes)],
                    primary_occupation=occupations[i % len(occupations)],
                    land_ownership_area_sqm=float(1200 + (i * 350)),
                    livestock_count={
                        "cows": 1 + (i % 3),
                        "buffaloes": (i % 2),
                        "goats": 2 + (i % 6),
                        "poultry": 10 + (i % 15)
                    },
                    has_bank_account=True if i % 5 != 0 else False,
                    has_health_insurance=True if i % 3 != 0 else False,
                    has_internet_access=True if i % 4 != 0 else False,
                    vulnerability_score=v_score,
                    disaster_risk_category=risks[i % len(risks)],
                    created_at=now - datetime.timedelta(days=180 - i * 5),
                    updated_at=now - datetime.timedelta(days=15)
                )
                db.add(se_profile)
            db.commit()
            print("Seeded 16 records into c360_household_socio_economic.")

        # ── 7. C360 CITIZEN APPLICATIONS ─────────────────────────────────────────
        existing_apps = db.query(CitizenApplicationLog).count()
        if existing_apps == 0:
            print("Seeding c360_citizen_applications...")
            services = [
                ("eSifaris (नागरिकता प्रमाणपत्र सिफारिस)", "Approved"),
                ("SocialSecurity (ज्येष्ठ नागरिक सामाजिक सुरक्षा भत्ता)", "Approved"),
                ("VitalRegistration (जन्म दर्ता प्रमाणपत्र)", "Approved"),
                ("eBPS (भवन निर्माण नक्सा पास इजाजत)", "Pending"),
                ("Grievance (सार्वजनिक खानेपानी मर्मत गुनासो)", "Approved"),
                ("AgriSubsidy (किबी पकेट अनुदान माग)", "In Review"),
                ("eSifaris (चारकिल्ला प्रमाणित सिफारिस)", "Approved"),
                ("VitalRegistration (विवाह दर्ता प्रमाणपत्र)", "Approved"),
            ]

            for i in range(24):
                cit_id = f"cit-{i+1:02d}"
                svc, st = services[i % len(services)]
                app_date = (now - datetime.timedelta(days=200 - i * 7)).date()
                app_log = CitizenApplicationLog(
                    tenant_id=TENANT_ID,
                    id=f"capp-{i+1:02d}",
                    citizen_id=cit_id,
                    service_module=svc,
                    application_ref_no=f"P5-APP-2081-{1001+i}",
                    application_date=app_date,
                    status=st,
                    created_at=now - datetime.timedelta(days=200 - i * 7)
                )
                db.add(app_log)
            db.commit()
            print("Seeded 24 records into c360_citizen_applications.")

        print("=== SUCCESS: OPTION 29 SEEDING COMPLETED ===")

    except Exception as e:
        db.rollback()
        print(f"ERROR seeding C360 & MDM: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_c360_socioeconomic()
