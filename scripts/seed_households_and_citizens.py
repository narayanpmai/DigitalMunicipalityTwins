import psycopg2
import uuid
import json
import random
import sys
from datetime import datetime, date

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'

WARDS_META = [
    {"ward": 1, "name": "बाँसखर्क", "center": (27.9022, 85.6050), "toles": ["बाँसखर्क बजार", "चिलाउने", "पात्ले", "बेँसीगाउँ"], "ethnicities": ["Tamang", "Brahmin", "Chhetri", "Dalit"]},
    {"ward": 2, "name": "बरुवा", "center": (27.9727, 85.6131), "toles": ["बरुवा गाउँ", "याङ्ग्री", "बोलदे", "खर्क"], "ethnicities": ["Sherpa", "Tamang", "Gurung"]},
    {"ward": 3, "name": "भोताङ", "center": (27.9750, 85.6682), "toles": ["भोताङ बजार", "छिम्ती", "नोथाङ", "ढाप"], "ethnicities": ["Tamang", "Sherpa", "Dalit"]},
    {"ward": 4, "name": "थाङपालकोट", "center": (27.9495, 85.6871), "toles": ["थाङपालकोट", "देउराली", "गहिरीगाउँ", "डाँडागाउँ"], "ethnicities": ["Brahmin", "Chhetri", "Tamang"]},
    {"ward": 5, "name": "गुन्सा", "center": (27.9229, 85.6952), "toles": ["गुन्सा बजार", "मानेखर्क", "पाल्चोक", "सिरानटोल"], "ethnicities": ["Tamang", "Brahmin", "Dalit"]},
    {"ward": 6, "name": "थाङपालधाप", "center": (27.9108, 85.6464), "toles": ["धाप बजार", "टोड्के", "सिमले", "काउले"], "ethnicities": ["Tamang", "Chhetri", "Brahmin", "Newar"]},
    {"ward": 7, "name": "भोटेनाम्लाङ् (तिपेनी)", "center": (27.8841, 85.6685), "toles": ["तिपेनी बजार", "भोटेनाम्लाङ्", "खोलाखर्क", "माझगाउँ"], "ethnicities": ["Tamang", "Brahmin", "Newar", "Chhetri"]},
    {"ward": 8, "name": "लागर्चे", "center": (27.8659, 85.6400), "toles": ["लागर्चे बजार", "काउले", "ज्यामिरे", "तल्लोटोल"], "ethnicities": ["Chhetri", "Tamang", "Newar", "Dalit"]}
]

MALE_NAMES = [
    ("रामबहादुर", "Ram Bahadur"), ("दावा", "Dawa"), ("पेम्बा", "Pemba"), ("ङिमा", "Ngima"),
    ("सुजन", "Sujan"), ("कृष्णप्रसाद", "Krishna Prasad"), ("काले", "Kale"), ("मानबहादुर", "Man Bahadur"),
    ("चन्द्रबहादुर", "Chandra Bahadur"), ("डिलबहादुर", "Dil Bahadur"), ("सरोज", "Saroj"), ("गोविन्द", "Govinda"),
    ("प्रकाश", "Prakash"), ("दिपक", "Deepak"), ("अमृत", "Amrit"), ("सन्तोष", "Santosh"),
    ("लाक्पा", "Lakpa"), ("छेवाङ", "Chhewang"), ("शेर्पा", "Sherpa"), ("गोपाल", "Gopal")
]

FEMALE_NAMES = [
    ("सीता", "Sita"), ("सुनिता", "Sunita"), ("डिकी", "Diki"), ("पासाङ", "Pasang"),
    ("माया", "Maya"), ("अनिता", "Anita"), ("सरिता", "Sarita"), ("उषा", "Usha"),
    ("फुलमाया", "Phulmaya"), ("छेतेन", "Chheten"), ("लक्ष्मी", "Laxmi"), ("गीता", "Gita"),
    ("सर्मिला", "Sarmila"), ("रेश्मा", "Reshma"), ("विमला", "Bimala"), ("मुना", "Muna")
]

SURNAMES = [
    ("तामाङ", "Tamang"), ("शेर्पा", "Sherpa"), ("थापा", "Thapa"), ("श्रेष्ठ", "Shrestha"),
    ("सापकोटा", "Sapkota"), ("अधिकारी", "Adhikari"), ("गोले", "Gole"), ("लामा", "Lama"),
    ("नेपाल", "Nepal"), ("पौडेल", "Paudel"), ("लामिछाने", "Lamichhane"), ("खड्का", "Khadka"),
    ("पराजुली", "Parajuli"), ("गुरुङ", "Gurung"), ("दोर्जे", "Dorje")
]

OCCUPATIONS = [
    "कृषि तथा पशुपालन", "व्यापार तथा व्यवसाय", "शिक्षण / निजामती सेवा", "वैदेशिक रोजगार",
    "होटल तथा पर्यटन व्यवसाय", "दैनिक ज्यालादारी / निर्माण", "विद्यार्थी", "गृहिणी"
]

EDUCATIONS = ["साक्षर (प्राथमिक)", "माध्यमिक (SEE)", "उच्च माध्यमिक (+2)", "स्नातक (Bachelor)", "स्नातकोत्तर (Master)", "सामान्य लेखपढ"]

HOUSE_TYPES = ["पक्की (RCC Frame)", "ढुङ्गा माटोको गाह्रो (Stone/Mud)", "काठ र जस्तापाता (Timber/CGI)", "प्रबलीकरण गरिएको (Retrofit NBC)"]

def seed():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()

    print("Cleaning existing household_registries and citizens for Panchpokhari...")
    cur.execute("DELETE FROM citizens WHERE tenant_id = 'panchpokhari' OR tenant_id IS NULL;")
    cur.execute("DELETE FROM household_registries WHERE tenant_id = 'panchpokhari' OR tenant_id IS NULL;")

    households_to_insert = []
    citizens_to_insert = []

    hh_seq = 1

    for w_meta in WARDS_META:
        wn = w_meta["ward"]
        w_center = w_meta["center"]
        toles = w_meta["toles"]
        ethnicities = w_meta["ethnicities"]

        # Generate 15 rich households per ward (15 x 8 = 120 households)
        for i in range(15):
            hh_id = str(uuid.uuid4())
            matrix_no = f"PKP-W{wn}-{hh_seq:04d}"
            legacy_no = f"{wn}-{hh_seq:03d}"
            
            # Head of Household
            is_female_head = random.random() < 0.35
            if is_female_head:
                fn, fn_en = random.choice(FEMALE_NAMES)
                gender_str = 'female'
            else:
                fn, fn_en = random.choice(MALE_NAMES)
                gender_str = 'male'
            
            sn, sn_en = random.choice(SURNAMES)
            full_head_name = f"{fn} {sn}"
            full_head_en = f"{fn_en} {sn_en}"
            
            tole_name = random.choice(toles)
            phone = f"98{random.randint(41000000, 49999999)}"
            caste = random.choice(ethnicities)
            house_type = random.choice(HOUSE_TYPES)
            
            # Jitter GPS around ward center (~500m to 1.5km spread)
            lat = round(w_center[0] + random.uniform(-0.012, 0.012), 6)
            lon = round(w_center[1] + random.uniform(-0.015, 0.015), 6)

            # Family members (3 to 6 members)
            fam_size = random.randint(3, 6)
            family_members = []
            
            # Add Head to family members
            head_age = random.randint(35, 68)
            family_members.append({
                "relation": "घरमुली (Head)",
                "name": full_head_name,
                "gender": gender_str,
                "age": head_age,
                "occupation": random.choice(OCCUPATIONS),
                "education": random.choice(EDUCATIONS)
            })

            # Add Citizen record for Head
            c_head_id = str(uuid.uuid4())
            c_no = f"२७-०१-७५-{random.randint(10000, 99999)}"
            nid_no = f"NID-{random.randint(1000000000, 9999999999)}"
            dob_year = 2081 - head_age
            dob = date(max(1940, 2024 - head_age), random.randint(1, 12), random.randint(1, 28))

            citizens_to_insert.append((
                c_head_id, "panchpokhari", full_head_name, full_head_en, c_no, nid_no,
                phone, f"head.{hh_seq}@panchpokhari.gov.np", gender_str, dob, wn,
                f"पाँचपोखरी थाङपाल-{wn}", tole_name, f"स्व. बुबा", f"आमा",
                random.choice(OCCUPATIONS), random.choice(EDUCATIONS), True,
                json.dumps({"householdId": hh_id, "isHead": True, "verificationStatus": "VERIFIED"}),
                datetime.utcnow(), datetime.utcnow()
            ))

            # Add spouse and children
            for m_idx in range(1, fam_size):
                if m_idx == 1:
                    # Spouse
                    sp_gender = 'male' if is_female_head else 'female'
                    s_fn, s_fn_en = random.choice(MALE_NAMES if sp_gender == 'male' else FEMALE_NAMES)
                    sp_name = f"{s_fn} {sn}"
                    sp_en = f"{s_fn_en} {sn_en}"
                    sp_age = max(20, head_age + random.randint(-4, 4))
                    rel = "श्रीमान्" if sp_gender == 'male' else "श्रीमती"
                    
                    family_members.append({
                        "relation": rel,
                        "name": sp_name,
                        "gender": sp_gender,
                        "age": sp_age,
                        "occupation": random.choice(OCCUPATIONS),
                        "education": random.choice(EDUCATIONS)
                    })

                    c_sp_id = str(uuid.uuid4())
                    sp_dob = date(max(1940, 2024 - sp_age), random.randint(1, 12), random.randint(1, 28))
                    citizens_to_insert.append((
                        c_sp_id, "panchpokhari", sp_name, sp_en, f"२७-०१-७६-{random.randint(10000, 99999)}",
                        f"NID-{random.randint(1000000000, 9999999999)}", f"98{random.randint(41000000, 49999999)}",
                        None, sp_gender, sp_dob, wn, f"पाँचपोखरी थाङपाल-{wn}", tole_name,
                        "बुबा", "आमा", random.choice(OCCUPATIONS), random.choice(EDUCATIONS), True,
                        json.dumps({"householdId": hh_id, "isHead": False, "verificationStatus": "VERIFIED"}),
                        datetime.utcnow(), datetime.utcnow()
                    ))
                else:
                    # Child / Youth
                    ch_gender = random.choice(['male', 'female'])
                    ch_fn, ch_fn_en = random.choice(MALE_NAMES if ch_gender == 'male' else FEMALE_NAMES)
                    ch_name = f"{ch_fn} {sn}"
                    ch_en = f"{ch_fn_en} {sn_en}"
                    ch_age = random.randint(6, 25)
                    rel = "छोरा" if ch_gender == 'male' else "छोरी"

                    family_members.append({
                        "relation": rel,
                        "name": ch_name,
                        "gender": ch_gender,
                        "age": ch_age,
                        "occupation": "विद्यार्थी" if ch_age < 20 else random.choice(OCCUPATIONS),
                        "education": random.choice(EDUCATIONS)
                    })

                    c_ch_id = str(uuid.uuid4())
                    ch_dob = date(max(1995, 2024 - ch_age), random.randint(1, 12), random.randint(1, 28))
                    citizens_to_insert.append((
                        c_ch_id, "panchpokhari", ch_name, ch_en, f"२७-०१-८०-{random.randint(10000, 99999)}" if ch_age >= 16 else None,
                        f"NID-{random.randint(1000000000, 9999999999)}" if ch_age >= 16 else None, None, None,
                        ch_gender, ch_dob, wn, f"पाँचपोखरी थाङपाल-{wn}", tole_name,
                        full_head_name, "आमा", "विद्यार्थी" if ch_age < 20 else random.choice(OCCUPATIONS),
                        random.choice(EDUCATIONS), True,
                        json.dumps({"householdId": hh_id, "isHead": False, "verificationStatus": "VERIFIED"}),
                        datetime.utcnow(), datetime.utcnow()
                    ))

            # Risk parameters
            is_risk = random.random() < 0.18 # 18% in landslide/flood risk zones
            risk_lvl = "high" if is_risk and random.random() < 0.4 else ("medium" if is_risk else "low")
            is_river = is_risk and random.random() < 0.5
            
            disability_cnt = 1 if random.random() < 0.08 else 0
            soc_sec_cnt = 1 if any(m["age"] >= 65 for m in family_members) else 0

            qr_token = f"QR-PTGP-{wn:02d}-{hh_seq:04d}"
            parcel_no = f"{random.randint(100, 999)}"

            households_to_insert.append((
                hh_id, "panchpokhari", matrix_no, legacy_no, f"वडा नं. {wn}", c_no,
                caste, random.randint(1, 3), "फ्लस भएको सुरक्षित चर्पी", "एलपीजी ग्यास / सुधारिएको चुल्हो",
                parcel_no, "निजी नम्बरी जग्गा", "स्वीकृत (NBC Compliant)", "पुनर्निर्माण सम्पन्न",
                "फिल्टर तथा उमालेको पानी", random.randint(5, 25), disability_cnt, "निलो कार्ड (ग वर्ग)" if disability_cnt else None,
                soc_sec_cnt, 1 if random.random() < 0.25 else 0, wn, hh_seq, full_head_name,
                phone, gender_str, json.dumps(family_members), lat, lon, tole_name,
                f"पाँचपोखरी थाङपाल-{wn}, सिन्धुपाल्चोक", house_type, "सामुदायिक धाराको शुद्ध पानी",
                is_risk, is_river, 3 if risk_lvl == 'high' else (2 if risk_lvl == 'medium' else 1),
                risk_lvl, "पहिरो सम्भावित भिरालो जमिन नजिक" if is_risk else "सुरक्षित आवासीय क्षेत्र",
                qr_token, "approved", "वडा प्राविधिक टोलीद्वारा प्रमाणित", datetime.utcnow(),
                False, json.dumps({"ward": wn, "familySize": len(family_members)}),
                datetime.utcnow(), datetime.utcnow()
            ))

            hh_seq += 1

    # Insert into household_registries
    print(f"Inserting {len(households_to_insert)} Households into household_registries...")
    insert_hh_sql = """
    INSERT INTO household_registries (
        id, tenant_id, "matrixHouseNo", "legacyHouseNo", "formerVdc", "citizenshipNo",
        ethnicity, storeys, "toiletType", "cookingFuel", "cadastralParcelNo", "landOwnership",
        "buildingPermitStatus", "reconstructionStatus", "waterPurification", "safeShelterDistanceMins",
        "disabilityCount", "disabilityCardType", "socialSecurityCount", "foreignMigrantsCount",
        "wardNumber", sequence, "householdName", "contactPhone", "headGender", "familyMembers",
        "gpsLat", "gpsLon", tole, address, "houseType", "drinkingWaterSource",
        "isAtRisk", "isRiverbankHouse", "riskScore", "riskLevel", "riskDetails",
        "qrToken", "verificationStatus", "verificationRemarks", "verifiedAt",
        "submittedByPublic", meta, "createdAt", "updatedAt"
    ) VALUES (
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s
    )
    """
    for hh in households_to_insert:
        cur.execute(insert_hh_sql, hh)

    # Insert into citizens
    print(f"Inserting {len(citizens_to_insert)} Citizens into citizens table...")
    insert_cit_sql = """
    INSERT INTO citizens (
        id, tenant_id, "fullName", "fullNameEn", "citizenshipNo", "nationalId",
        phone, email, gender, "dateOfBirth", "wardNumber", address, tole,
        "fatherName", "motherName", occupation, education, "isActive",
        meta, "createdAt", "updatedAt"
    ) VALUES (
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s
    )
    """
    for c in citizens_to_insert:
        cur.execute(insert_cit_sql, c)

    conn.commit()
    conn.close()
    print(f"\n✅ Successfully seeded {len(households_to_insert)} Households and {len(citizens_to_insert)} Citizens across all 8 Wards!")

if __name__ == '__main__':
    seed()
