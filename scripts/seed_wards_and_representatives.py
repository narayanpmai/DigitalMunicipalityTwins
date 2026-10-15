import psycopg2
import uuid
import json
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'

WARDS_DATA = [
    {
        "wardNumber": 1,
        "name": "बाँसखर्क",
        "chairperson": "दावा गोले तामाङ",
        "secretary": "सुजन श्रेष्ठ",
        "phone": "9841000001",
        "officeLocation": "बाँसखर्क बजार",
        "population": 2250,
        "malePopulation": 1105,
        "femalePopulation": 1145,
        "households": 540,
        "schools": 4,
        "healthPosts": 1,
        "mainSettlement": "बाँसखर्क, चिलाउने, पात्ले",
        "literacyRate": 68.5,
        "description": "पाँचपोखरी थाङपाल गाउँपालिकाको वडा नं. १ बाँसखर्क कृषि, सुन्तला र अलैंची खेतीका लागि प्रसिद्ध छ।",
        "casteDistribution": {"Tamang": 75, "Brahmin_Chhetri": 15, "Dalit": 8, "Other": 2},
        "ageDistribution": {"0_14": 22, "15_59": 64, "60_plus": 14}
    },
    {
        "wardNumber": 2,
        "name": "बरुवा",
        "chairperson": "पेम्बा शेर्पा",
        "secretary": "रामचन्द्र नेपाल",
        "phone": "9841000002",
        "officeLocation": "बरुवा गाउँ",
        "population": 2480,
        "malePopulation": 1215,
        "femalePopulation": 1265,
        "households": 610,
        "schools": 5,
        "healthPosts": 1,
        "mainSettlement": "बरुवा, याङ्ग्री, बोलदे",
        "literacyRate": 65.2,
        "description": "वडा नं. २ बरुवा उच्च पहाडी तथा हिमाली हावापानी भएको शेर्पा तथा तामाङ संस्कृतियुक्त वडा हो।",
        "casteDistribution": {"Sherpa": 55, "Tamang": 35, "Dalit": 6, "Other": 4},
        "ageDistribution": {"0_14": 24, "15_59": 62, "60_plus": 14}
    },
    {
        "wardNumber": 3,
        "name": "भोताङ",
        "chairperson": "ङिमा दोर्जे तामाङ",
        "secretary": "प्रकाश लामिछाने",
        "phone": "9841000003",
        "officeLocation": "भोताङ बजार",
        "population": 3150,
        "malePopulation": 1540,
        "femalePopulation": 1610,
        "households": 780,
        "schools": 6,
        "healthPosts": 2,
        "mainSettlement": "भोताङ, छिम्ती, नोथाङ",
        "literacyRate": 69.8,
        "description": "पाँचपोखरी तीर्थस्थलको प्रवेशद्वार मानिने वडा नं. ३ भोताङ पर्यटन र जडिबुटीका लागि अत्यन्त महत्वपूर्ण छ।",
        "casteDistribution": {"Tamang": 80, "Sherpa": 10, "Dalit": 7, "Other": 3},
        "ageDistribution": {"0_14": 23, "15_59": 63, "60_plus": 14}
    },
    {
        "wardNumber": 4,
        "name": "थाङपालकोट",
        "chairperson": "रामप्रसाद सापकोटा",
        "secretary": "दिपक अधिकारी",
        "phone": "9841000004",
        "officeLocation": "थाङपालकोट",
        "population": 2620,
        "malePopulation": 1280,
        "femalePopulation": 1340,
        "households": 650,
        "schools": 5,
        "healthPosts": 1,
        "mainSettlement": "थाङपालकोट, देउराली, गहिरीगाउँ",
        "literacyRate": 74.5,
        "description": "ऐतिहासिक थाङपालकोट गढी रहेको वडा नं. ४ कृषि र पशुपालनको अग्रणी क्षेत्र हो।",
        "casteDistribution": {"Brahmin_Chhetri": 45, "Tamang": 40, "Dalit": 12, "Other": 3},
        "ageDistribution": {"0_14": 20, "15_59": 65, "60_plus": 15}
    },
    {
        "wardNumber": 5,
        "name": "गुन्सा",
        "chairperson": "काले गोले",
        "secretary": "सरोज पौडेल",
        "phone": "9841000005",
        "officeLocation": "गुन्सा बजार",
        "population": 2710,
        "malePopulation": 1330,
        "femalePopulation": 1380,
        "households": 680,
        "schools": 5,
        "healthPosts": 1,
        "mainSettlement": "गुन्सा, मानेखर्क, पाल्चोक",
        "literacyRate": 71.0,
        "description": "वडा नं. ५ गुन्सा धार्मिक तथा प्राकृतिक दृष्टिकोणले रमणीय छ।",
        "casteDistribution": {"Tamang": 65, "Brahmin_Chhetri": 22, "Dalit": 10, "Other": 3},
        "ageDistribution": {"0_14": 21, "15_59": 64, "60_plus": 15}
    },
    {
        "wardNumber": 6,
        "name": "थाङपालधाप",
        "chairperson": "मानबहादुर तामाङ",
        "secretary": "अमृत खड्का",
        "phone": "9841000006",
        "officeLocation": "धाप बजार",
        "population": 2890,
        "malePopulation": 1410,
        "femalePopulation": 1480,
        "households": 720,
        "schools": 6,
        "healthPosts": 1,
        "mainSettlement": "धाप, टोड्के, सिमले",
        "literacyRate": 76.2,
        "description": "गाउँपालिकाको प्रशासनिक तथा व्यापारिक केन्द्र नजिक रहेको वडा नं. ६ सुगम र विकसित वडा हो।",
        "casteDistribution": {"Tamang": 50, "Brahmin_Chhetri": 35, "Dalit": 12, "Other": 3},
        "ageDistribution": {"0_14": 19, "15_59": 66, "60_plus": 15}
    },
    {
        "wardNumber": 7,
        "name": "भोटेनाम्लाङ् (तिपेनी)",
        "chairperson": "चन्द्रबहादुर तामाङ",
        "secretary": "सन्तोष पराजुली",
        "phone": "9841000007",
        "officeLocation": "तिपेनी बजार",
        "population": 2750,
        "malePopulation": 1345,
        "femalePopulation": 1405,
        "households": 690,
        "schools": 6,
        "healthPosts": 2,
        "mainSettlement": "तिपेनी, भोटेनाम्लाङ्, खोलाखर्क",
        "literacyRate": 75.8,
        "description": "गाउँपालिकाको मुख्य केन्द्र तिपेनी बजार अवस्थित वडा नं. ७ प्रमुख आर्थिक तथा प्रशासनिक केन्द्र हो।",
        "casteDistribution": {"Tamang": 48, "Brahmin_Chhetri": 38, "Newar": 8, "Dalit": 6},
        "ageDistribution": {"0_14": 20, "15_59": 65, "60_plus": 15}
    },
    {
        "wardNumber": 8,
        "name": "लागर्चे",
        "chairperson": "डिलबहादुर श्रेष्ठ",
        "secretary": "गोविन्द थापा",
        "phone": "9841000008",
        "officeLocation": "लागर्चे",
        "population": 2147,
        "malePopulation": 1050,
        "femalePopulation": 1097,
        "households": 564,
        "schools": 5,
        "healthPosts": 1,
        "mainSettlement": "लागर्चे, काउले, ज्यामिरे",
        "literacyRate": 73.1,
        "description": "वडा नं. ८ लागर्चे इन्द्रावती नदी तटीय क्षेत्र र उर्वर कृषि भूमियुक्त वडा हो।",
        "casteDistribution": {"Brahmin_Chhetri": 42, "Tamang": 38, "Newar": 12, "Dalit": 8},
        "ageDistribution": {"0_14": 21, "15_59": 64, "60_plus": 15}
    }
]

REPRESENTATIVES_DATA = [
    {
        "id": "rep_chairperson",
        "name": "टासी लामा",
        "designation": "गाउँपालिका अध्यक्ष",
        "wardNo": None,
        "phone": "9851123401",
        "email": "chairperson@panchpokhari.gov.np",
        "politicalparty": "नेकपा (माओवादी केन्द्र)",
        "isCurrent": True
    },
    {
        "id": "rep_vice_chairperson",
        "name": "सुनिता अधिकारी",
        "designation": "गाउँपालिका उपाध्यक्ष",
        "wardNo": None,
        "phone": "9851123402",
        "email": "vicechair@panchpokhari.gov.np",
        "politicalparty": "नेपाली कांग्रेस",
        "isCurrent": True
    },
    {
        "id": "rep_cao",
        "name": "कृष्णप्रसाद पोखरेल",
        "designation": "प्रमुख प्रशासकीय अधिकृत",
        "wardNo": None,
        "phone": "9851123403",
        "email": "cao@panchpokhari.gov.np",
        "politicalparty": "निजामती कर्मचारी",
        "isCurrent": True
    }
]

# Add Ward Chairs to Representatives
for w in WARDS_DATA:
    REPRESENTATIVES_DATA.append({
        "id": f"rep_ward_{w['wardNumber']}",
        "name": w["chairperson"],
        "designation": f"वडा अध्यक्ष (वडा नं. {w['wardNumber']})",
        "wardNo": w["wardNumber"],
        "phone": w["phone"],
        "email": f"ward{w['wardNumber']}@panchpokhari.gov.np",
        "politicalparty": "जनप्रतिनिधि",
        "isCurrent": True
    })

def seed():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    print("Fetching GIS boundaries and center coordinates from gis_ward_boundaries...")
    cur.execute("SELECT ward_no, area_hectare, center_lat, center_lng, geojson_geometry FROM gis_ward_boundaries WHERE ward_no <= 8;")
    gis_map = {}
    for r in cur.fetchall():
        gis_map[r[0]] = {
            "area_sq_km": round(r[1] / 100.0, 4), # 100 Ha = 1 sq km
            "center_lat": r[2],
            "center_lng": r[3],
            "boundaries": r[4]
        }

    # 1. Seed Wards
    print(f"\nSeeding {len(WARDS_DATA)} Wards into 'wards' table...")
    cur.execute("DELETE FROM wards;") # clean slate for panchpokhari wards
    
    insert_ward_sql = """
    INSERT INTO wards (
        id, "wardNumber", name, "wardChairName", chairperson, secretary, phone, "officeLocation",
        population, "totalPopulation", "malePopulation", "femalePopulation", households,
        schools, "healthPosts", "areaSqKm", "centerLat", "centerLng", "mainSettlement",
        description, "literacyRate", "casteDistribution", "ageDistribution", boundaries,
        "isActive", "createdAt", "updatedAt"
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s
    )
    """

    for w in WARDS_DATA:
        wn = w["wardNumber"]
        gis_info = gis_map.get(wn, {})
        area = gis_info.get("area_sq_km", 20.0)
        lat = gis_info.get("center_lat", 27.94)
        lng = gis_info.get("center_lng", 85.64)
        geom = json.dumps(gis_info.get("boundaries", {}))

        cur.execute(insert_ward_sql, (
            str(uuid.uuid4()),
            wn,
            w["name"],
            w["chairperson"],
            w["chairperson"],
            w["secretary"],
            w["phone"],
            w["officeLocation"],
            w["population"],
            w["population"],
            w["malePopulation"],
            w["femalePopulation"],
            w["households"],
            w["schools"],
            w["healthPosts"],
            area,
            lat,
            lng,
            w["mainSettlement"],
            w["description"],
            w["literacyRate"],
            json.dumps(w["casteDistribution"]),
            json.dumps(w["ageDistribution"]),
            geom,
            True,
            datetime.utcnow(),
            datetime.utcnow()
        ))
        print(f"  ✓ Ward {wn}: {w['name']} inserted (Area: {area} sq km, Pop: {w['population']})")

    # 2. Seed Representatives
    print(f"\nSeeding {len(REPRESENTATIVES_DATA)} Representatives into 'representatives' table...")
    cur.execute("DELETE FROM representatives;")
    insert_rep_sql = """
    INSERT INTO representatives (
        id, name, designation, "wardNo", phone, email, politicalparty, "isCurrent", "createdAt", "updatedAt"
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    for r in REPRESENTATIVES_DATA:
        cur.execute(insert_rep_sql, (
            r["id"],
            r["name"],
            r["designation"],
            r["wardNo"],
            r["phone"],
            r["email"],
            r["politicalparty"],
            r["isCurrent"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
        print(f"  ✓ Rep: {r['name']} ({r['designation']})")

    conn.commit()
    conn.close()
    print("\n✅ Successfully seeded Wards and Representatives!")

if __name__ == '__main__':
    seed()
