"""
Seed Script: Solid Waste Management & Sanitation (फोहोरमैला व्यवस्थापन तथा वातावरण)
Panchpokhari Thangpal Gaupalika (8 Wards, Sindhupalchok)
Populates:
  - waste_vehicles (6 collection vehicles)
  - waste_rates (7 segregated buyback rates)
  - waste_schedules (8 ward routes covering Wards 1 to 8)
  - waste_disposal_sites (5 composting & recycling facilities)
  - waste_sanitation_workers (8 ward sanitation workers & supervisors)
  - waste_alerts (8 citizen waste grievances)
  - waste_wallets (10 citizen incentive wallets)
  - waste_transactions (16 buyback transaction records)
"""
import sys
import json
import psycopg2
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("Starting Solid Waste Management & Sanitation Seeding...")

# ---------------------------------------------------------------------------
# 1. WASTE VEHICLES
# ---------------------------------------------------------------------------
vehicles = [
    (
        "14000000-0000-0000-0000-000000000001",
        "बा २ क ४५६७",
        "राम बहादुर श्रेष्ठ",
        "तार्केघ्याङ-भोताङ मुख्य सडक रुट (वडा ३)",
        27.9789,
        85.6123,
        "active"
    ),
    (
        "14000000-0000-0000-0000-000000000002",
        "बा १ ख ८९२१",
        "पेम्बा दोर्जे शेर्पा",
        "बरुवा-मेलम्चीघ्याङ पदमार्ग रुट (वडा २)",
        27.9880,
        85.6310,
        "active"
    ),
    (
        "14000000-0000-0000-0000-000000000003",
        "बा ३ क ६१२०",
        "सन्तोष विक",
        "थाङपालकोट-मानेखर्क बजार रुट (वडा ४)",
        27.9610,
        85.5980,
        "active"
    ),
    (
        "14000000-0000-0000-0000-000000000004",
        "बा १ क ३३२२",
        "टेक बहादुर तामाङ",
        "भोटेनाम्लाङ-तिपेनी बजार रुट (वडा ७)",
        27.9117,
        85.5692,
        "active"
    ),
    (
        "14000000-0000-0000-0000-000000000005",
        "बा २ ख ९०१०",
        "दिपक न्यौपाने",
        "बासखर्क किबी पकेट तथा कृषि बस्ती रुट (वडा १)",
        27.8920,
        85.5840,
        "active"
    ),
    (
        "14000000-0000-0000-0000-000000000006",
        "बा १ क ४४५५",
        "दावा छिरिङ तामाङ",
        "गुन्सा-थाङपालधाप कृषि करिडोर रुट (वडा ५ र ६)",
        27.9425,
        85.5780,
        "active"
    ),
]

for v in vehicles:
    cur.execute("""
        INSERT INTO waste_vehicles (
            id, "licensePlate", "driverName", "routeAssigned", "currentLat", "currentLon", status, "createdAt", "updatedAt"
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            "licensePlate" = EXCLUDED."licensePlate",
            "driverName" = EXCLUDED."driverName",
            "routeAssigned" = EXCLUDED."routeAssigned",
            "currentLat" = EXCLUDED."currentLat",
            "currentLon" = EXCLUDED."currentLon",
            status = EXCLUDED.status,
            "updatedAt" = NOW();
    """, v)
print(f"✓ Seeded {len(vehicles)} waste collection vehicles.")

# ---------------------------------------------------------------------------
# 2. WASTE BUYBACK RATES
# ---------------------------------------------------------------------------
rates = [
    (
        "14100000-0000-0000-0000-000000000001",
        "प्लास्टिक (PET बोतल / HDPE जार / कडा प्लास्टिक)",
        18.00,
        "#3b82f6",
        True
    ),
    (
        "14100000-0000-0000-0000-000000000002",
        "कागज, कार्टुन तथा पुराना किताब/कापी",
        12.00,
        "#f59e0b",
        True
    ),
    (
        "14100000-0000-0000-0000-000000000003",
        "धातु / टिन / फलाम / तामा / पित्तल",
        38.00,
        "#64748b",
        True
    ),
    (
        "14100000-0000-0000-0000-000000000004",
        "जैविक कुहिने फोहोर (प्राङ्गारिक कम्पोस्ट उत्पादन योग्य)",
        5.00,
        "#10b981",
        True
    ),
    (
        "14100000-0000-0000-0000-000000000005",
        "काँच / सिसाका बोतल तथा सिसाका टुक्रा",
        4.00,
        "#8b5cf6",
        True
    ),
    (
        "14100000-0000-0000-0000-000000000006",
        "ई-वेस्ट / पुराना विद्युतीय सामग्री (E-Waste)",
        45.00,
        "#ec4899",
        True
    ),
    (
        "14100000-0000-0000-0000-000000000007",
        "मल्टिलेयर प्लास्टिक (चिप्स, चाउचाउको खोल - RDF)",
        8.00,
        "#14b8a6",
        True
    ),
]

for r in rates:
    cur.execute("""
        INSERT INTO waste_rates (
            id, "wasteType", "ratePerKg", "colorCode", "isActive", "createdAt", "updatedAt"
        ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            "wasteType" = EXCLUDED."wasteType",
            "ratePerKg" = EXCLUDED."ratePerKg",
            "colorCode" = EXCLUDED."colorCode",
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW();
    """, r)
print(f"✓ Seeded {len(rates)} waste buyback tariff rates.")

# ---------------------------------------------------------------------------
# 3. WASTE SCHEDULES (Wards 1 through 8)
# ---------------------------------------------------------------------------
schedules = [
    (
        "sch-01",
        3,
        "RT-03-A",
        "तार्केघ्याङ मुख्य रुट (ह्योल्मो सांस्कृतिक बजार)",
        "आइतबार, बुधबार",
        "मंगलबार, शुक्रबार",
        "बा २ क ४५६७",
        "tractor",
        "राम बहादुर श्रेष्ठ",
        "९८४१२३४५६७",
        "सोनाम तामाङ",
        "९८५१०१२३४५",
        "active",
        "बिहान ०६:३० - ०९:३०"
    ),
    (
        "sch-02",
        2,
        "RT-02-B",
        "बरुवा तथा मेलम्चीघ्याङ पदमार्ग रुट",
        "सोमबार, बिहीबार",
        "शनिबार",
        "बा १ ख ८९२१",
        "mini_truck",
        "पेम्बा दोर्जे शेर्पा",
        "९८१२३४५६७८",
        "किरण दनुवार",
        "९८६००१२३४५",
        "active",
        "बिहान ०७:०० - १०:००"
    ),
    (
        "sch-03",
        4,
        "RT-04-A",
        "थाङपालकोट - मानेखर्क बजार रुट",
        "आइतबार, बुधबार",
        "बिहीबार",
        "बा ३ क ६१२०",
        "tipper",
        "सन्तोष विक",
        "९८०३४५६७८९",
        "मिङ्मार लामा",
        "९८४९०१२३४५",
        "active",
        "बिहान ०६:०० - ०९:००"
    ),
    (
        "sch-04",
        7,
        "RT-07-A",
        "भोटेनाम्लाङ - तिपेनी मुख्य बजार रुट",
        "आइतबार, मंगलबार, बिहीबार",
        "शनिबार",
        "बा १ क ३३२२",
        "compactor",
        "टेक बहादुर तामाङ",
        "९८४१५५६६७७",
        "गोपाल श्रेष्ठ",
        "९८५१०२२३३४",
        "active",
        "बिहान ०६:०० - ०८:३०"
    ),
    (
        "sch-05",
        1,
        "RT-01-A",
        "बासखर्क किबी पकेट तथा कृषि बस्ती रुट",
        "मंगलबार, शुक्रबार",
        "आइतबार",
        "बा २ ख ९०१०",
        "tractor",
        "दिपक न्यौपाने",
        "९८६११२२३३४",
        "सरिता तामाङ",
        "९८४१२२३३४४",
        "active",
        "बिहान ०७:३० - १०:००"
    ),
    (
        "sch-06",
        5,
        "RT-05-A",
        "गुन्सा - रायले कृषि तथा पर्यटकीय बस्ती रुट",
        "सोमबार, बिहीबार",
        "मंगलबार",
        "बा १ क ४४५५",
        "mini_truck",
        "दावा छिरिङ तामाङ",
        "९८०३९९८८७७",
        "दिक्पाल गिरी",
        "९८५११२२३३०",
        "active",
        "बिहान ०७:०० - ०९:३०"
    ),
    (
        "sch-07",
        6,
        "RT-06-A",
        "थाङपालधाप गाउँपालिका केन्द्र तथा बजार रुट",
        "दैनिक (जैविक फोहोर)",
        "बुधबार, शनिबार",
        "बा ३ क ६१२०",
        "tipper",
        "सन्तोष विक",
        "९८०३४५६७८९",
        "कृष्ण प्रसाद दङ्गाल",
        "९८४१६६५५४४",
        "active",
        "बिहान ०६:०० - ०८:३०"
    ),
    (
        "sch-08",
        8,
        "RT-08-A",
        "लागर्चे - मानेखर्क लिंक कृषि सडक रुट",
        "आइतबार, बुधबार",
        "शुक्रबार",
        "बा २ ख ९०१०",
        "tractor",
        "दिपक न्यौपाने",
        "९८६११२२३३४",
        "कान्छी माया तामाङ",
        "९८४१७७८८००",
        "active",
        "दिउँसो ०२:०० - ०५:००"
    ),
]

for s in schedules:
    cur.execute("""
        INSERT INTO waste_schedules (
            id, "wardNo", "routeCode", "routeName", "collectionDaysBio", "collectionDaysNonBio",
            "vehicleNumber", "vehicleType", "driverName", "driverPhone", "supervisorName", "supervisorPhone",
            status, timing, "createdAt"
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (id) DO UPDATE SET
            "wardNo" = EXCLUDED."wardNo",
            "routeCode" = EXCLUDED."routeCode",
            "routeName" = EXCLUDED."routeName",
            "collectionDaysBio" = EXCLUDED."collectionDaysBio",
            "collectionDaysNonBio" = EXCLUDED."collectionDaysNonBio",
            "vehicleNumber" = EXCLUDED."vehicleNumber",
            "vehicleType" = EXCLUDED."vehicleType",
            "driverName" = EXCLUDED."driverName",
            "driverPhone" = EXCLUDED."driverPhone",
            "supervisorName" = EXCLUDED."supervisorName",
            "supervisorPhone" = EXCLUDED."supervisorPhone",
            status = EXCLUDED.status,
            timing = EXCLUDED.timing;
    """, s)
print(f"✓ Seeded {len(schedules)} collection route schedules (Wards 1 through 8).")

# ---------------------------------------------------------------------------
# 4. DISPOSAL SITES & RECYCLING HUBS
# ---------------------------------------------------------------------------
sites = [
    (
        "site-01",
        "पाँचपोखरी जैविक कम्पोस्ट मल उत्पादन केन्द्र",
        "compost_plant",
        3,
        "तार्केघ्याङ फेदी, चिसोपानी (वडा नं. ३)",
        14.0,
        6.5,
        62.0,
        "active_biological",
        "EIA-MOFE-२०८०-०४२",
        "ई. रोहन थापा (वातावरण अधिकृत)",
        "९८४१९९८८७७",
        "operational"
    ),
    (
        "site-02",
        "थाङपाल उपत्यका ट्रान्सफर तथा स्यानेटरी ल्यान्डफिल",
        "landfill_site",
        4,
        "मानेखर्क खोंच, वडा नं. ४",
        22.0,
        12.0,
        48.0,
        "aeration_tank",
        "IEE-WSTD-२०७९-११",
        "टेक बहादुर तामाङ",
        "९८५११४४०२०",
        "operational"
    ),
    (
        "site-03",
        "मेलम्चीघ्याङ फोहोर वर्गीकरण तथा रिसाइक्लिङ हब",
        "recycling_hub",
        2,
        "बजार छेउ, मेलम्चीघ्याङ (वडा नं. २)",
        6.0,
        3.0,
        75.0,
        "soak_pit",
        "IEE-RECY-२०८१-०३",
        "ल्हाक्पा शेर्पा",
        "९८०८३३२२११",
        "operational"
    ),
    (
        "site-04",
        "भोटेनाम्लाङ मिनी कम्पोस्टिङ युनिट",
        "compost_plant",
        7,
        "तिपेनी बजार नजिक (वडा नं. ७)",
        4.5,
        2.5,
        55.0,
        "active_biological",
        "IEE-COM-२०८१-०८",
        "सरिता तामाङ",
        "९८४१७७८८९९",
        "operational"
    ),
    (
        "site-05",
        "थाङपालधाप स्रोत पुनःप्राप्ति (MRF) तथा वर्गीकरण केन्द्र",
        "transfer_station",
        6,
        "थाङपालधाप पालिका केन्द्र नजिक (वडा नं. ६)",
        5.5,
        4.0,
        42.0,
        "reed_bed_system",
        "IEE-MRF-२०८१-१४",
        "पेम्बा दोर्जे लामा",
        "९८५१०२३९९०",
        "operational"
    ),
]

for site in sites:
    cur.execute("""
        INSERT INTO waste_disposal_sites (
            id, "siteName", "siteType", "wardNo", "locationName", "totalAreaRopani",
            "dailyCapacityTons", "currentUtilizationPercent", "leachateTreatment",
            "eiaRegistrationNo", "inchargeName", "inchargePhone", status, "createdAt"
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (id) DO UPDATE SET
            "siteName" = EXCLUDED."siteName",
            "siteType" = EXCLUDED."siteType",
            "wardNo" = EXCLUDED."wardNo",
            "locationName" = EXCLUDED."locationName",
            "totalAreaRopani" = EXCLUDED."totalAreaRopani",
            "dailyCapacityTons" = EXCLUDED."dailyCapacityTons",
            "currentUtilizationPercent" = EXCLUDED."currentUtilizationPercent",
            "leachateTreatment" = EXCLUDED."leachateTreatment",
            "eiaRegistrationNo" = EXCLUDED."eiaRegistrationNo",
            "inchargeName" = EXCLUDED."inchargeName",
            "inchargePhone" = EXCLUDED."inchargePhone",
            status = EXCLUDED.status;
    """, site)
print(f"✓ Seeded {len(sites)} waste disposal and recycling facilities.")

# ---------------------------------------------------------------------------
# 5. SANITATION WORKERS (Wards 1 through 8)
# ---------------------------------------------------------------------------
workers = [
    (
        "wrk-01",
        "P5-SAN-01",
        "माइला तामाङ",
        3,
        "sweeper",
        "contract",
        "९८१२००३३४४",
        "सुन्तली तामाङ (श्रीमती) - ९८१२०००१११",
        "distributed_complete",
        "२०८१-०५-१०",
        json.dumps(["गमबुट", "हेभी ड्युटी पन्जा", "N95 मास्क", "फ्लोरोसेन्ट ज्याकेट", "हेल्मेट"]),
        "२०८१-०४-१५",
        "fully_vaccinated",
        "active"
    ),
    (
        "wrk-02",
        "P5-SAN-02",
        "कान्छी शेर्पा",
        2,
        "sweeper",
        "contract",
        "९८४१८८७७६६",
        "पासाङ शेर्पा (दाजु) - ९८४१२२२३३३",
        "distributed_complete",
        "२०८१-०५-१०",
        json.dumps(["गमबुट", "पन्जा", "मास्क", "फ्लोरोसेन्ट ज्याकेट"]),
        "२०८१-०४-१८",
        "fully_vaccinated",
        "active"
    ),
    (
        "wrk-03",
        "P5-SAN-03",
        "राम बहादुर श्रेष्ठ",
        3,
        "driver",
        "permanent",
        "९८४१२२३३४४",
        "सीता श्रेष्ठ - ९८४१२२३३९९",
        "distributed_complete",
        "२०८१-०५-०१",
        json.dumps(["पन्जा", "मास्क", "ज्याकेट", "फर्स्ट एड किट"]),
        "२०८१-०३-२५",
        "fully_vaccinated",
        "active"
    ),
    (
        "wrk-04",
        "P5-SAN-04",
        "वीर ध्वज तामाङ",
        4,
        "compost_operator",
        "contract",
        "९८०३४४५५६६",
        "माया तामाङ - ९८०३४४५५००",
        "distributed_complete",
        "२०८१-०४-२०",
        json.dumps(["गमबुट", "रासायनिक सुरक्षा पन्जा", "ग्यास मास्क", "एप्रोन"]),
        "२०८१-०३-१०",
        "fully_vaccinated",
        "active"
    ),
    (
        "wrk-05",
        "P5-SAN-05",
        "कमला श्रेष्ठ",
        6,
        "sweeper",
        "contract",
        "९८४९८८७७६६",
        "रमेश श्रेष्ठ - ९८४९८८७७००",
        "distributed_complete",
        "२०८१-०५-१०",
        json.dumps(["गमबुट", "पन्जा", "मास्क", "फ्लोरोसेन्ट ज्याकेट"]),
        "२०८१-०४-२०",
        "fully_vaccinated",
        "active"
    ),
    (
        "wrk-06",
        "P5-SAN-06",
        "सुकमान विक",
        7,
        "drainage_cleaner",
        "permanent",
        "९८१२९८७६५४",
        "धनमाया विक - ९८१२९८७६००",
        "distributed_complete",
        "२०८१-०४-१५",
        json.dumps(["गमबुट", "हेभी ड्युटी वाटरप्रुफ पन्जा", "एन-९५ मास्क", "फ्लोरोसेन्ट ज्याकेट", "हेल्मेट"]),
        "२०८१-०४-०१",
        "fully_vaccinated",
        "active"
    ),
    (
        "wrk-07",
        "P5-SAN-07",
        "गंगाराम दनुवार",
        1,
        "loader",
        "contract",
        "९८०८११२२३३",
        "सानु दनुवार - ९८०८११२२००",
        "distributed_complete",
        "२०८१-०४-१५",
        json.dumps(["गमबुट", "पन्जा", "मास्क", "फ्लोरोसेन्ट ज्याकेट"]),
        "२०८१-०३-१५",
        "fully_vaccinated",
        "active"
    ),
    (
        "wrk-08",
        "P5-SAN-08",
        "निमा ल्हामु शेर्पा",
        5,
        "mrf_sorter",
        "contract",
        "९८५१०२३४५६",
        "दावा शेर्पा - ९८५१०२३४००",
        "distributed_complete",
        "२०८१-०५-१२",
        json.dumps(["गमबुट", "कटन पन्जा", "फेस शिल्ड", "एप्रोन"]),
        "२०८१-०४-१०",
        "fully_vaccinated",
        "active"
    ),
]

for w in workers:
    cur.execute("""
        INSERT INTO waste_sanitation_workers (
            id, "workerCode", "fullName", "wardNo", role, "employmentType", phone,
            "emergencyContact", "ppeKitStatus", "ppeDistributionDate", "ppeItems",
            "lastHealthCheckupDate", "vaccinationStatus", "insuranceStatus", "createdAt"
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (id) DO UPDATE SET
            "workerCode" = EXCLUDED."workerCode",
            "fullName" = EXCLUDED."fullName",
            "wardNo" = EXCLUDED."wardNo",
            role = EXCLUDED.role,
            "employmentType" = EXCLUDED."employmentType",
            phone = EXCLUDED.phone,
            "emergencyContact" = EXCLUDED."emergencyContact",
            "ppeKitStatus" = EXCLUDED."ppeKitStatus",
            "ppeDistributionDate" = EXCLUDED."ppeDistributionDate",
            "ppeItems" = EXCLUDED."ppeItems",
            "lastHealthCheckupDate" = EXCLUDED."lastHealthCheckupDate",
            "vaccinationStatus" = EXCLUDED."vaccinationStatus",
            "insuranceStatus" = EXCLUDED."insuranceStatus";
    """, w)
print(f"✓ Seeded {len(workers)} sanitation workers & operators.")

# ---------------------------------------------------------------------------
# 6. WASTE ALERTS (Citizen Reports / Grievances)
# ---------------------------------------------------------------------------
alerts = [
    (
        "14200000-0000-0000-0000-000000000001",
        None,
        "फोहोर थुप्रिएको गुनासो",
        "तार्केघ्याङ मुख्य चोकमा होटल व्यवसायीहरुले फोहोर बाटोमै थुपारेको, तत्काल टिपर पठाउन अनुरोध",
        "वडा नं. ३, तार्केघ्याङ चोक",
        27.9789,
        85.6123,
        "pending"
    ),
    (
        "14200000-0000-0000-0000-000000000002",
        None,
        "अवैध डम्पिङ तथा खोला प्रदूषण",
        "मेलम्चीघ्याङ पुल छेउ खोला किनारमा प्लास्टिक र सिसाका बोतल अवैध डम्पिङ भएको",
        "वडा नं. २, मेलम्चीघ्याङ खोला किनार",
        27.9880,
        85.6310,
        "in-progress"
    ),
    (
        "14200000-0000-0000-0000-000000000003",
        None,
        "संकलन समय तालिका ढिलाइ",
        "मानेखर्क बजारमा तोकिएको बुधबार ट्र्याक्टर संकलन नआएको, फोहोर कुहिएर दुर्गन्ध फैलिएको",
        "वडा नं. ४, मानेखर्क बजार",
        27.9610,
        85.5980,
        "resolved"
    ),
    (
        "14200000-0000-0000-0000-000000000004",
        None,
        "सार्वजनिक शौचालय सरसफाइ",
        "तिपेनी बसपार्क सार्वजनिक शौचालयमा पानी नआएको र नियमित सरसफाइ नभएको",
        "वडा नं. ७, तिपेनी बसपार्क",
        27.9117,
        85.5692,
        "resolved"
    ),
    (
        "14200000-0000-0000-0000-000000000005",
        None,
        "कृषि सडक किनारमा फोहोर",
        "बासखर्क किबी फर्म जाने मुख्य कृषि सडक खण्डमा प्लास्टिकका खोल र झोलाहरु थुप्रिएको",
        "वडा नं. १, बासखर्क मुख्य कृषि सडक",
        27.8920,
        85.5840,
        "in-progress"
    ),
    (
        "14200000-0000-0000-0000-000000000006",
        None,
        "अस्पतालजन्य फोहोर जोखिम",
        "थाङपालधाप स्वास्थ्य चौकी नजिकै सामान्य फोहोरसँगै सुई र औषधिजन्य खोलहरु मिसिएको",
        "वडा नं. ६, थाङपालधाप स्वास्थ्य केन्द्र छेउ",
        27.9350,
        85.5820,
        "resolved"
    ),
    (
        "14200000-0000-0000-0000-000000000007",
        None,
        "पदमार्गमा प्लास्टिक प्रदूषण",
        "गुन्सा-तार्केघ्याङ पर्यटकीय पदमार्गमा पदयात्रीहरुले पानीका बोतल जथाभावी फालेको",
        "वडा नं. ५, गुन्सा देउराली पदमार्ग",
        27.9550,
        85.5950,
        "pending"
    ),
    (
        "14200000-0000-0000-0000-000000000008",
        None,
        "सार्वजनिक डस्टबिन माग",
        "भोताङ गुम्बा परिसर तथा चिया पसल वरपर थप २ वटा फोहोर संकलन बिन राखिदिन माग",
        "वडा नं. ३, भोताङ गुम्बा परिसर",
        27.9690,
        85.6200,
        "resolved"
    ),
]

for a in alerts:
    cur.execute("""
        INSERT INTO waste_alerts (
            id, reporter_id, "issueType", description, location, lat, lon, status, "createdAt", "updatedAt"
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            "issueType" = EXCLUDED."issueType",
            description = EXCLUDED.description,
            location = EXCLUDED.location,
            lat = EXCLUDED.lat,
            lon = EXCLUDED.lon,
            status = EXCLUDED.status,
            "updatedAt" = NOW();
    """, a)
print(f"✓ Seeded {len(alerts)} citizen waste alerts & grievances.")

# ---------------------------------------------------------------------------
# 7. WASTE WALLETS & TRANSACTIONS (Linked to Real Households)
# ---------------------------------------------------------------------------
cur.execute("SELECT id, \"householdName\", \"wardNumber\" FROM household_registries ORDER BY id LIMIT 10;")
hh_records = cur.fetchall()
if not hh_records:
    print("Warning: No household records found in household_registries.")
    hh_ids = [f"14300000-0000-0000-0000-{i:012d}" for i in range(1, 11)]
else:
    hh_ids = [r[0] for r in hh_records]

wallet_balances = [
    (1450.00, 2200.00, 750.00),
    (2100.00, 3100.00, 1000.00),
    (980.00, 1500.00, 520.00),
    (1850.00, 2600.00, 750.00),
    (1320.00, 1900.00, 580.00),
    (2740.00, 3500.00, 760.00),
    (1150.00, 1600.00, 450.00),
    (3200.00, 4100.00, 900.00),
    (890.00, 1200.00, 310.00),
    (1680.00, 2400.00, 720.00),
]

for idx, (bal, earned, withdrawn) in enumerate(wallet_balances):
    w_id = f"14300000-0000-0000-0000-0000000000{idx+1:02d}"
    hh_id = hh_ids[idx % len(hh_ids)]
    cur.execute("""
        INSERT INTO waste_wallets (
            id, household_id, balance, "totalEarned", "totalWithdrawn", "createdAt", "updatedAt"
        ) VALUES (%s, %s::uuid, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            household_id = EXCLUDED.household_id,
            balance = EXCLUDED.balance,
            "totalEarned" = EXCLUDED."totalEarned",
            "totalWithdrawn" = EXCLUDED."totalWithdrawn",
            "updatedAt" = NOW();
    """, (w_id, hh_id, bal, earned, withdrawn))
print(f"✓ Seeded {len(wallet_balances)} citizen waste recycling wallets.")

# ---------------------------------------------------------------------------
# 8. WASTE TRANSACTIONS (Buybacks from Households)
# ---------------------------------------------------------------------------
rate_rows = [
    ("14100000-0000-0000-0000-000000000001", 18.00), # Plastic
    ("14100000-0000-0000-0000-000000000002", 12.00), # Paper
    ("14100000-0000-0000-0000-000000000003", 38.00), # Metal
    ("14100000-0000-0000-0000-000000000004", 5.00),  # Bio compost
    ("14100000-0000-0000-0000-000000000005", 4.00),  # Glass
    ("14100000-0000-0000-0000-000000000006", 45.00), # E-waste
    ("14100000-0000-0000-0000-000000000007", 8.00),  # Multilayer plastic
]

txn_samples = [
    (0, 0, 15.5),  # HH 0, Plastic, 15.5 kg
    (0, 1, 24.0),  # HH 0, Paper, 24 kg
    (1, 2, 12.0),  # HH 1, Metal, 12 kg
    (1, 0, 18.5),  # HH 1, Plastic, 18.5 kg
    (2, 3, 50.0),  # HH 2, Compostable, 50 kg
    (2, 4, 30.0),  # HH 2, Glass, 30 kg
    (3, 0, 22.0),  # HH 3, Plastic, 22 kg
    (3, 5, 4.5),   # HH 3, E-Waste, 4.5 kg
    (4, 1, 35.0),  # HH 4, Paper, 35 kg
    (4, 6, 12.0),  # HH 4, Multilayer, 12 kg
    (5, 2, 18.0),  # HH 5, Metal, 18 kg
    (5, 0, 25.0),  # HH 5, Plastic, 25 kg
    (6, 3, 60.0),  # HH 6, Compostable, 60 kg
    (7, 0, 20.0),  # HH 7, Plastic, 20 kg
    (8, 1, 15.0),  # HH 8, Paper, 15 kg
    (9, 2, 10.0),  # HH 9, Metal, 10 kg
]

for idx, (hh_idx, rate_idx, weight) in enumerate(txn_samples):
    txn_id = f"14400000-0000-0000-0000-{idx+1:012d}"
    hh_id = hh_ids[hh_idx % len(hh_ids)]
    rate_id, rate_val = rate_rows[rate_idx]
    total = round(weight * rate_val, 2)
    cur.execute("""
        INSERT INTO waste_transactions (
            id, household_id, waste_rate_id, "weightKg", "rateApplied", "totalAmount",
            "transactionType", "createdAt"
        ) VALUES (%s, %s::uuid, %s::uuid, %s, %s, %s, 'buyback_deposit', NOW() - INTERVAL '%s days')
        ON CONFLICT (id) DO UPDATE SET
            household_id = EXCLUDED.household_id,
            waste_rate_id = EXCLUDED.waste_rate_id,
            "weightKg" = EXCLUDED."weightKg",
            "rateApplied" = EXCLUDED."rateApplied",
            "totalAmount" = EXCLUDED."totalAmount",
            "transactionType" = EXCLUDED."transactionType";
    """, (txn_id, hh_id, rate_id, weight, rate_val, total, (16 - idx)))
print(f"✓ Seeded {len(txn_samples)} waste buyback deposit transactions.")

conn.commit()
cur.close()
conn.close()

print("\n=== Solid Waste Management & Sanitation Seeding COMPLETED SUCCESSFULLY! ===")
