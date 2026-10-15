"""
Seed Script: Option 19 - Municipal Asset Management & Public Property
(जिन्सी, सार्वजनिक जग्गा, भौतिक संरचना तथा डिजिटल सम्पत्ति व्यवस्थापन)
Panchpokhari Thangpal Gaupalika, Sindhupalchok

Governed by:
  - Local Government Operation Act 2074 (Section 11, Clause 2 - Municipal Property Protection)
  - Public Procurement Act 2063 & Rules 2064 (जिन्सी निरीक्षण तथा लिलाम बिक्री)
  - Financial Procedures and Fiscal Accountability Act 2076 (मलेप फारम नं ४०७/४०८)

Populates:
  1. public_assets (20 high-value public assets with Malepa formats, book value, depreciation)
  2. dt_unified_assets (20 digital twin assets bridging movable and infrastructure with GeoJSON)
  3. dt_asset_assignments (12 custody assignments to municipal staff and ward secretaries)
  4. dt_asset_maintenance_logs (8 routine & breakdown maintenance records)
  5. dt_asset_inspections (8 technical inspection records with 1-5 condition ratings)
  6. gis_public_lands (8 public land parcels, open spaces, and conservation areas with GIS geometry)
"""
import sys
import json
import psycopg2
from datetime import date, datetime

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("=" * 80)
print("STARTING OPTION 19 SEEDING: MUNICIPAL ASSET MANAGEMENT & PUBLIC PROPERTY")
print("=" * 80)

TENANT = "panchpokhari"

# ---------------------------------------------------------------------------
# 1. SEED public_assets (२० वटा उच्च मूल्यका म्यूनिसिपल सम्पत्तिहरू - मलेप फारम ४०७/४०८)
# ---------------------------------------------------------------------------
public_assets_data = [
    # 1. Palika Admin Building
    (
        "19100000-0000-0000-0000-000000000001", "AST-BLD-001", "गाउँकार्यपालिका मुख्य प्रशासनिक भवन",
        "भवन तथा संरचना (Buildings)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        6, "प्रशासन तथा आन्तरिक व्यवस्थापन", "कृष्ण प्रसाद सापकोटा (CAO)", "थाङपालधाप, पाँचपोखरी",
        "२०७६-०८-१५", 45000000.0, 2.5, 39375000.0, "४ तल्ले आरसीसी फ्रेम संरचना", "अरनिको कन्स्ट्रक्सन प्रा.लि.",
        "गाउँपालिकाको मुख्य प्रशासनिक, योजना, लेखा र सभाहल सञ्चालित भूकम्प प्रतिरोधी भवन",
        json.dumps([{"date": "२०८१-०२-१५", "inspector": "इ. रमेश खड्का", "rating": "उत्कृष्ट", "notes": "संरचनात्मक रूपमा पूर्ण सुरक्षित"}])
    ),
    # 2. Manebhanjyang / Manehark Hospital
    (
        "19100000-0000-0000-0000-000000000002", "AST-BLD-002", "मानेखर्क १५ शय्या आधारभूत अस्पताल भवन",
        "भवन तथा संरचना (Buildings)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        4, "स्वास्थ्य तथा जनसंख्या शाखा", "डा. प्रभात श्रेष्ठ", "मानेखर्क, पाँचपोखरी-४",
        "२०७८-०३-२०", 62000000.0, 2.5, 57350000.0, "अस्पताल आरसीसी कम्प्लेक्स", "गौरी-पार्वती जेभी",
        "१५ शय्या अस्पताल, ओपीडी, ल्याब, एक्स-रे, प्रसूति गृह तथा चिकित्सक आवास सहित",
        json.dumps([{"date": "२०८१-०१-१०", "inspector": "इ. रमेश खड्का", "rating": "उत्कृष्ट", "notes": "ल्याब र फार्मेसी कक्ष पूर्ण सञ्चालनमा"}])
    ),
    # 3. Ward 1 Office Building
    (
        "19100000-0000-0000-0000-000000000003", "AST-BLD-003", "वडा नं. १ वडा कार्यालय तथा सेवा केन्द्र भवन",
        "भवन तथा संरचना (Buildings)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        1, "वडा नं. १ वडा कार्यालय", "तेज बहादुर श्रेष्ठ (वडा सचिव)", "बासखर्क",
        "२०७७-११-१०", 8500000.0, 2.5, 7650000.0, "२ तल्ले आरसीसी भवन", "स्थानीय निर्माण सेवा",
        "वडा कार्यालय, नागरिक प्रतिक्षालय तथा स्वास्थ्य इकाई सञ्चालित",
        json.dumps([{"date": "२०८०-१२-२०", "inspector": "सव-इन्जिनियर", "rating": "राम्रो", "notes": "नियमित मर्मत सम्भार भएको"}])
    ),
    # 4. Ward 2 Office Building
    (
        "19100000-0000-0000-0000-000000000004", "AST-BLD-004", "वडा नं. २ वडा कार्यालय भवन, बरुवा",
        "भवन तथा संरचना (Buildings)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        2, "वडा नं. २ वडा कार्यालय", "पेम्बा दोर्जे शेर्पा (वडा सचिव)", "बरुवा",
        "२०७८-०२-१५", 8200000.0, 2.5, 7380000.0, "२ तल्ले आरसीसी भवन", "हिमशिखर कन्स्ट्रक्सन",
        "वडा सचिव कक्ष, अध्यक्ष कार्यकक्ष तथा बैठक हल",
        json.dumps([{"date": "२०८१-०३-०५", "inspector": "इ. रमेश खड्का", "rating": "राम्रो", "notes": "रङरोगन अद्यावधिक गरिएको"}])
    ),
    # 5. Ward 3 Office Building
    (
        "19100000-0000-0000-0000-000000000005", "AST-BLD-005", "वडा नं. ३ वडा कार्यालय तथा सूचना केन्द्र",
        "भवन तथा संरचना (Buildings)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        3, "वडा नं. ३ वडा कार्यालय", "निमा दावा शेर्पा (वडा सचिव)", "भोताङ",
        "२०७८-०६-२५", 8800000.0, 2.5, 7920000.0, "२ तल्ले परम्परागत ह्योल्मो शैली आरसीसी", "ह्योल्मो निर्माण सेवा",
        "पर्यटन सूचना केन्द्र र वडा सचिवालय संयुक्त रूपमा सञ्चालन",
        json.dumps([{"date": "२०८१-०२-२८", "inspector": "सव-इन्जिनियर", "rating": "उत्कृष्ट", "notes": "पर्यटक विश्राम कक्ष व्यवस्थित"}])
    ),
    # 6. Ward 7 Office Building, Tipeni
    (
        "19100000-0000-0000-0000-000000000006", "AST-BLD-006", "वडा नं. ७ वडा कार्यालय तथा एकीकृत सेवा केन्द्र",
        "भवन तथा संरचना (Buildings)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        7, "वडा नं. ७ वडा कार्यालय", "सन्तोष खड्का (वडा सचिव)", "तिपेनी बजार",
        "२०७७-०४-१२", 9200000.0, 2.5, 8280000.0, "३ तल्ले आरसीसी भवन", "तिपेनी बिल्डर्स",
        "कर संकलन काउन्टर, वडा सचिव कक्ष, कृषि सेवा केन्द्र तथा सभाहल",
        json.dumps([{"date": "२०८१-०१-२५", "inspector": "इ. रमेश खड्का", "rating": "उत्कृष्ट", "notes": "बजार केन्द्रमा सुलभ सेवा प्रवाह"}])
    ),
    # 7. Heavy Excavator / Backhoe Loader
    (
        "19100000-0000-0000-0000-000000000007", "AST-VEH-001", "जेसीबी ब्याकहो लोडर (Backhoe Loader)",
        "सवारी साधन तथा मेशिनरी (Vehicles)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        0, "पूर्वाधार विकास तथा प्राविधिक शाखा", "इ. रमेश खड्का", "यान्त्रिक शाखा, थाङपालधाप",
        "२०७८-०१-२०", 4800000.0, 15.0, 2640000.0, "बा.१ क ५६७८ (JCB 3DX Super)", "एमएडब्लु अर्थमुभर्स प्रा.लि.",
        "सडक मर्मत, पहिरो पन्छाउने तथा विपद् उद्धार कार्यमा निरन्तर प्रयोग",
        json.dumps([{"date": "२०८१-०३-१२", "inspector": "यान्त्रिक सुपरभाइजर", "rating": "राम्रो", "notes": "हाइड्रोलिक आयल र फिल्टर परिवर्तन गरिएको"}])
    ),
    # 8. Municipal Tipper / Dump Truck
    (
        "19100000-0000-0000-0000-000000000008", "AST-VEH-002", "म्यूनिसिपल टिपर (Dump Truck)",
        "सवारी साधन तथा मेशिनरी (Vehicles)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        0, "फोहोरमैला व्यवस्थापन तथा वातावरण शाखा", "इ. सुजन महर्जन", "यान्त्रिक शाखा, थाङपालधाप",
        "२०७९-०२-११", 3600000.0, 15.0, 2430000.0, "बा.१ ग २३४५ (टाटा एलपिटी १६१३)", "सिप्रदी ट्रेडिङ प्रा.लि.",
        "निर्माण सामग्री ढुवानी, सडक मर्मत तथा फोहोरमैला संकलनमा परिचालन",
        json.dumps([{"date": "२०८१-०२-२०", "inspector": "चालक दल", "rating": "राम्रो", "notes": "नियमित मोबिल चेन्ज र सर्भिसिङ सम्पन्न"}])
    ),
    # 9. Hospital Ambulance
    (
        "19100000-0000-0000-0000-000000000009", "AST-VEH-003", "मानेखर्क आधारभूत अस्पताल एम्बुलेन्स (४×४)",
        "सवारी साधन तथा मेशिनरी (Vehicles)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        4, "स्वास्थ्य तथा जनसंख्या शाखा", "डा. प्रभात श्रेष्ठ", "मानेखर्क अस्पताल",
        "२०७९-०६-०१", 2800000.0, 15.0, 2010000.0, "बा.२ झ १२३४ (महिन्द्रा बोलेरो क्याम्पर)", "अग्नि इन्कर्पोरेटेड",
        "दुर्गम बस्तीका जटिल बिरामी तथा गर्भवती महिलालाई निःशुल्क २४ घण्टा आकस्मिक सेवा",
        json.dumps([{"date": "२०८१-०३-०१", "inspector": "एम्बुलेन्स चालक", "rating": "उत्कृष्ट", "notes": "अक्सिजन सिलिन्डर र स्ट्रेचर पूर्ण दुरुस्त"}])
    ),
    # 10. Secondary Ambulance (Baruwa / Bhotang)
    (
        "19100000-0000-0000-0000-000000000010", "AST-VEH-004", "बरुवा-भोताङ क्षेत्र आकस्मिक एम्बुलेन्स",
        "सवारी साधन तथा मेशिनरी (Vehicles)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        2, "स्वास्थ्य तथा जनसंख्या शाखा", "पेम्बा दोर्जे शेर्पा", "बरुवा स्वास्थ्य चौकी",
        "२०८०-०४-१५", 2600000.0, 15.0, 2210000.0, "बा.२ झ ३४५६ (महिन्द्रा ४WD)", "अग्नि इन्कर्पोरेटेड",
        "माथिल्लो भेगका नागरिकहरूको आपतकालीन स्वास्थ्य सेवामा तैनाथ",
        json.dumps([{"date": "२०८१-०२-१५", "inspector": "स्वास्थ्य संयोजक", "rating": "राम्रो", "notes": "टायर र ब्रेक शू नयाँ फेरिएको"}])
    ),
    # 11. Waste Compactor Truck
    (
        "19100000-0000-0000-0000-000000000011", "AST-VEH-005", "हाइड्रोलिक फोहोर संकलन कम्प्याक्टर ट्रक",
        "सवारी साधन तथा मेशिनरी (Vehicles)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        6, "फोहोरमैला व्यवस्थापन तथा वातावरण", "इ. सुजन महर्जन", "थाङपालधाप बजार",
        "२०८०-०१-२०", 4200000.0, 15.0, 3570000.0, "बा.१ ग ७८९० (आइशर ५ टन कम्प्याक्टर)", "ईस्टर्न मोर्टर्स",
        "थाङपालधाप र तिपेनी मुख्य बजार क्षेत्रको दैनिक घरदैलो फोहोर संकलन",
        json.dumps([{"date": "२०८१-०३-१०", "inspector": "सरसफाइ सुपरभाइजर", "rating": "उत्कृष्ट", "notes": "हाइड्रोलिक ज्याक परीक्षण सफल"}])
    ),
    # 12. Central High-Performance Rack Server
    (
        "19100000-0000-0000-0000-000000000012", "AST-IT-001", "म्यूनिसिपल डिजिटल ट्विन डाटा सेन्टर सर्भर (Dell PowerEdge R750)",
        "सूचना प्रविधि तथा सर्भर (IT & Telecom)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        0, "सूचना प्रविधि, वातावरण तथा विपद् शाखा", "इ. सुजन महर्जन (IT Officer)", "गाउँपालिका सर्भर कक्ष",
        "२०८०-०३-१५", 1850000.0, 20.0, 1480000.0, "Dell PowerEdge R750 (2x Intel Xeon, 128GB RAM, 16TB NVMe RAID)", "म्याक्स इन्फोटेक प्रा.लि.",
        "डिजिटल ट्विन ३डी मोडल, पोस्टग्रेएसक्युएल डाटाबेस, जीआईएस सर्भर र ई-सिफारिस होस्टेड",
        json.dumps([{"date": "२०८१-०३-१५", "inspector": "इ. सुजन महर्जन", "rating": "उत्कृष्ट", "notes": "अपटाइम ९९.९%, ब्याकअप नियमित भइरहेको"}])
    ),
    # 13. High-End Survey Drone
    (
        "19100000-0000-0000-0000-000000000013", "AST-IT-002", "जीआईएस नापी तथा विपद् सर्भे ड्रोन (DJI Matrice 300 RTK)",
        "सूचना प्रविधि तथा सर्भर (IT & Telecom)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        0, "सूचना प्रविधि तथा प्राविधिक शाखा", "इ. रमेश खड्का / इ. सुजन महर्जन", "प्राविधिक शाखा, थाङपालधाप",
        "२०८०-०५-१०", 1450000.0, 20.0, 1160000.0, "DJI Matrice 300 RTK + Zenmuse H20T Thermal Camera", "ड्रोन हब नेपाल",
        "बाढीपहिरो जोखिम नक्सांकन, बस्तीको ३डी मोडलिङ र पूर्वाधार नापजाँचमा प्रयोग",
        json.dumps([{"date": "२०८१-०१-१८", "inspector": "ड्रोन पाइलट", "rating": "उत्कृष्ट", "notes": "ब्याट्री साइकल २०/२००, क्यामरा क्यालिब्रेटेड"}])
    ),
    # 14. Heavy 15 KVA Diesel Generator
    (
        "19100000-0000-0000-0000-000000000014", "AST-EQP-001", "प्रशासनिक भवन ब्याकअप डिजेल जेनेरेटर (१५ KVA साइलेन्ट)",
        "कार्यालय उपकरण तथा मेशिनरी (Equipment)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        6, "प्रशासन तथा आन्तरिक व्यवस्थापन", "सुरेश श्रेष्ठ", "गाउँपालिका परिसर, थाङपालधाप",
        "२०७७-०९-१०", 950000.0, 10.0, 617500.0, "किर्लोस्कर १५ KVA साइलेन्ट जेनेरेटर", "किर्लोस्कर आयल इन्जिन्स",
        "विद्युत अवरुद्ध भएको अवस्थामा प्रशासनिक भवन र सर्भर कक्षलाई निरन्तर विद्युत आपूर्ति",
        json.dumps([{"date": "२०८१-०२-०५", "inspector": "विद्युत प्राविधिक", "rating": "राम्रो", "notes": "अटो-स्टार्ट प्यानल दुरुस्त अवस्थामा"}])
    ),
    # 15. Solar Power Backup System (Hospital)
    (
        "19100000-0000-0000-0000-000000000015", "AST-EQP-002", "मानेखर्क अस्पताल १० KVA संस्थागत सौर्य उर्जा प्रणाली",
        "कार्यालय उपकरण तथा मेशिनरी (Equipment)", "मलेप फारम नं ४०७ (खर्च नहुने जिन्सी खाता)", "चालु अवस्थामा (Operational)",
        4, "स्वास्थ्य तथा जनसंख्या शाखा", "डा. प्रभात श्रेष्ठ", "मानेखर्क आधारभूत अस्पताल",
        "२०७९-०४-२५", 1250000.0, 10.0, 1000000.0, "१० KVA हाइब्रिड इन्भर्टर + २४x लिथियम आयन ब्याट्री", "सनराइज सोलार सिष्टम",
        "शल्यक्रिया कक्ष, ल्याब, भ्याक्सिन कोल्डचेन फ्रिजलाई २४सै घण्टा अनवरत सौर्य बिजुली",
        json.dumps([{"date": "२०८१-०१-३०", "inspector": "इलेक्ट्रिकल इन्जिनियर", "rating": "उत्कृष्ट", "notes": "कोल्डचेन तापक्रम २-८ डिग्री सेन्टिग्रेड स्थिर"}])
    ),
    # 16. Tipeni Municipal Multi-Purpose Sports Ground
    (
        "19100000-0000-0000-0000-000000000016", "AST-LND-001", "तिपेनी बहुउद्देश्यीय खेलमैदान तथा प्यारापिट",
        "सार्वजनिक जग्गा तथा संरचना (Public Property)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        7, "शिक्षा, युवा तथा खेलकुद शाखा", "विष्णुहरि घिमिरे", "तिपेनी, भोटेनाम्लाङ",
        "२०७८-१२-१०", 12000000.0, 1.0, 11760000.0, "५०० सिट क्षमताको प्यारापिट + फुटबल मैदान", "पालिकास्तरीय योजना",
        "पालिकास्तरीय राष्ट्रपति रनिङ शिल्ड प्रतियोगिता, फुटबल तथा सार्वजनिक सांस्कृतिक कार्यक्रम स्थल",
        json.dumps([{"date": "२०८१-०२-११", "inspector": "खेलकुद विकास समिति", "rating": "राम्रो", "notes": "घाँसे मैदान मर्मत र फेन्सिङ सुरक्षित"}])
    ),
    # 17. Sacred Panchpokhari Lake Pilgrimage Complex
    (
        "19100000-0000-0000-0000-000000000017", "AST-LND-002", "धार्मिक पर्यटकीय पाँचपोखरी ताल तथा मन्दिर परिसर",
        "सार्वजनिक जग्गा तथा संरचना (Public Property)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        3, "पर्यटन तथा संस्कृति शाखा / वडा नं. ३", "निमा दावा शेर्पा", "पाँचपोखरी (उचाइ ४,१०० मि.)",
        "२०७५-०१-०१", 25000000.0, 0.0, 25000000.0, "५ वटा पवित्र ताल, शिव मन्दिर, पदमार्ग र धर्मशाला", "ऐतिहासिक तथा धार्मिक सार्वजनिक सम्पत्ति",
        "विश्व प्रसिद्ध पाँचपोखरी तीर्थस्थल (४,१०० मि.), जनैपूर्णिमा मेला, पदयात्री आश्रयस्थल र जैविक विविधता",
        json.dumps([{"date": "२०८०-०५-०१", "inspector": "पर्यटन विकास समिति", "rating": "उत्कृष्ट", "notes": "ताल क्षेत्रको सरसफाइ र मन्दिर संरक्षण व्यवस्थित"}])
    ),
    # 18. Tarkeghyang Helipad
    (
        "19100000-0000-0000-0000-000000000018", "AST-LND-003", "तार्केघ्याङ आपतकालीन विपद् तथा उद्धार हेलिप्याड",
        "सार्वजनिक जग्गा तथा संरचना (Public Property)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        3, "विपद् व्यवस्थापन तथा पूर्वाधार शाखा", "इ. रमेश खड्का", "तार्केघ्याङ, पाँचपोखरी-३",
        "२०७७-०५-२०", 3500000.0, 2.0, 3290000.0, "कङ्क्रिट हेलिप्याड (२०x२० मि.) + विन्डसक", "नेपाल नागरिक उड्डयन प्राधिकरण मापदण्ड",
        "बिरामीको आपतकालीन एयरलिफ्ट, विपद् उद्धार तथा विशिष्ट पाहुना आगमनका लागि तयारी अवस्थामा",
        json.dumps([{"date": "२०८१-०१-१५", "inspector": "इ. रमेश खड्का", "rating": "उत्कृष्ट", "notes": "हेलिप्याड सतह सफा र सुरक्षित"}])
    ),
    # 19. Bhotang Cold Store & Kiwi Processing Facility
    (
        "19100000-0000-0000-0000-000000000019", "AST-BLD-007", "बासखर्क किबी संकलन तथा कृषि प्रशोधन केन्द्र भवन",
        "भवन तथा संरचना (Buildings)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        1, "कृषि तथा पशुपन्छी विकास शाखा", "सुनिता अर्याल", "बासखर्क, पाँचपोखरी-१",
        "२०७९-०९-१५", 7500000.0, 2.5, 7125000.0, "प्रशोधन गृह + ५० मेट्रिक टन कोल्डच्याम्बर", "कृषि रूपान्तरण आयोजना",
        "किबी जाम, क्यान्डी, अर्गानिक फलफूल संकलन तथा ग्रेडिङ मेशिन जडित",
        json.dumps([{"date": "२०८१-०३-२०", "inspector": "कृषि प्रसार अधिकृत", "rating": "उत्कृष्ट", "notes": "कोल्डच्याम्बर कम्प्रेसर परीक्षण सम्पन्न"}])
    ),
    # 20. Public Sanitary Landfill Facility
    (
        "19100000-0000-0000-0000-000000000020", "AST-LND-004", "चिलाउनेघारी आधुनिक डम्पिङ तथा फोहोर व्यवस्थापन केन्द्र",
        "सार्वजनिक जग्गा तथा संरचना (Public Property)", "मलेप फारम नं ४०८ (सार्वजनिक संरचना खाता)", "चालु अवस्थामा (Operational)",
        6, "फोहोरमैला व्यवस्थापन शाखा", "इ. सुजन महर्जन", "चिलाउनेघारी, पाँचपोखरी-६",
        "२०८०-०२-१०", 6500000.0, 5.0, 6175000.0, "लिचेट ट्रिटमेन्ट पोखरी + जैविक मल कम्पोस्ट सेड", "पालिका पूर्वाधार विकास",
        "कुहिने फोहोरबाट जैविक मल उत्पादन र नकुहिने फोहोरको सुरक्षित वैज्ञानिक व्यवस्थापन",
        json.dumps([{"date": "२०८१-०२-२५", "inspector": "वातावरण अधिकृत", "rating": "राम्रो", "notes": "लिचेट संकलन प्रणाली सुरक्षित रूपमा सञ्चालन"}])
    ),
]

for r in public_assets_data:
    cur.execute("""
        INSERT INTO public_assets (
            tenant_id, id, "assetCode", "assetName", category, "malepaForm", condition,
            "wardNumber", department, "custodianName", location, "purchaseDateBs", "purchaseCost",
            "depreciationRatePercent", "currentBookValue", "modelOrPlateNo", "vendorName", remarks,
            inspections, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "assetCode" = EXCLUDED."assetCode",
            "assetName" = EXCLUDED."assetName",
            category = EXCLUDED.category,
            "malepaForm" = EXCLUDED."malepaForm",
            condition = EXCLUDED.condition,
            "wardNumber" = EXCLUDED."wardNumber",
            department = EXCLUDED.department,
            "custodianName" = EXCLUDED."custodianName",
            location = EXCLUDED.location,
            "purchaseDateBs" = EXCLUDED."purchaseDateBs",
            "purchaseCost" = EXCLUDED."purchaseCost",
            "depreciationRatePercent" = EXCLUDED."depreciationRatePercent",
            "currentBookValue" = EXCLUDED."currentBookValue",
            "modelOrPlateNo" = EXCLUDED."modelOrPlateNo",
            "vendorName" = EXCLUDED."vendorName",
            remarks = EXCLUDED.remarks,
            inspections = EXCLUDED.inspections,
            "updatedAt" = NOW();
    """, (
        TENANT, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11],
        r[12], r[13], r[14], r[15], r[16], r[17]
    ))
print(f"✓ Seeded {len(public_assets_data)} records into 'public_assets'.")


# ---------------------------------------------------------------------------
# 2. SEED dt_unified_assets (२० वटा डिजिटल ट्विन एकीकृत सम्पत्तिहरू)
# ---------------------------------------------------------------------------
dt_assets_data = [
    (
        "dt-ast-001", "DT-BLD-001", "Infrastructure", "Building", "गाउँकार्यपालिका मुख्य प्रशासनिक भवन",
        "४ तल्ले भूकम्प प्रतिरोधी आरसीसी प्रशासकीय भवन, सभाहल र डिजिटल सेवा केन्द्र",
        date(2019, 11, 30), 45000000.0, "Operational", "PROJ-HANDOVER-001",
        json.dumps({"type": "Point", "coordinates": [85.5830, 27.9355]})
    ),
    (
        "dt-ast-002", "DT-BLD-002", "Infrastructure", "Building", "मानेखर्क १५ शय्या आधारभूत अस्पताल",
        "१५ शय्या अस्पताल, आकस्मिक कक्ष, ल्याब, शल्यक्रिया, प्रसूति गृह",
        date(2021, 7, 4), 62000000.0, "Operational", "PROJ-HANDOVER-002",
        json.dumps({"type": "Point", "coordinates": [85.5980, 27.9610]})
    ),
    (
        "dt-ast-003", "DT-BLD-003", "Infrastructure", "Building", "वडा नं. १ वडा कार्यालय, बासखर्क",
        "२ तल्ले आरसीसी वडा सचिवालय तथा नागरिक सेवा केन्द्र",
        date(2020, 11, 25), 8500000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5840, 27.8920]})
    ),
    (
        "dt-ast-004", "DT-BLD-004", "Infrastructure", "Building", "वडा नं. २ वडा कार्यालय, बरुवा",
        "बरुवा वडा सचिवालय भवन तथा स्वास्थ्य इकाई",
        date(2021, 2, 27), 8200000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.6310, 27.9880]})
    ),
    (
        "dt-ast-005", "DT-BLD-005", "Infrastructure", "Building", "वडा नं. ३ वडा कार्यालय, भोताङ",
        "ह्योल्मो शैली २ तल्ले भवन, पर्यटन सूचना केन्द्र",
        date(2021, 7, 9), 8800000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.6120, 27.9790]})
    ),
    (
        "dt-ast-006", "DT-BLD-006", "Infrastructure", "Building", "वडा नं. ७ वडा कार्यालय, तिपेनी",
        "३ तल्ले एकीकृत सेवा भवन, कर काउन्टर, सभाहल",
        date(2020, 7, 26), 9200000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5692, 27.9117]})
    ),
    (
        "dt-ast-007", "DT-VEH-001", "Movable", "Vehicle", "जेसीबी ब्याकहो लोडर (बा.१ क ५६७८)",
        "JCB 3DX Super ब्याकहो लोडर, सडक मर्मत तथा विपद् उद्धार उपकरण",
        date(2021, 5, 3), 4800000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5830, 27.9355]})
    ),
    (
        "dt-ast-008", "DT-VEH-002", "Movable", "Vehicle", "टाटा म्यूनिसिपल टिपर (बा.१ ग २३४५)",
        "टाटा एलपिटी १६१३ टिपर, ढुवानी तथा फोहोरमैला व्यवस्थापन",
        date(2022, 5, 25), 3600000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5830, 27.9355]})
    ),
    (
        "dt-ast-009", "DT-VEH-003", "Movable", "Vehicle", "मानेखर्क अस्पताल एम्बुलेन्स (बा.२ झ १२३४)",
        "महिन्द्रा बोलेरो क्याम्पर ४×४ एम्बुलेन्स, २४ घण्टा आकस्मिक सेवा",
        date(2022, 9, 17), 2800000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5980, 27.9610]})
    ),
    (
        "dt-ast-010", "DT-VEH-004", "Movable", "Vehicle", "बरुवा-भोताङ एम्बुलेन्स (बा.२ झ ३४५६)",
        "महिन्द्रा ४WD एम्बुलेन्स, माथिल्लो भेग स्वास्थ्य उद्धार",
        date(2023, 7, 31), 2600000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.6310, 27.9880]})
    ),
    (
        "dt-ast-011", "DT-VEH-005", "Movable", "Vehicle", "फोहोर संकलन कम्प्याक्टर ट्रक (बा.१ ग ७८९०)",
        "आइशर ५ टन हाइड्रोलिक कम्प्याक्टर ट्रक, बजार सरसफाइ",
        date(2023, 5, 4), 4200000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5692, 27.9117]})
    ),
    (
        "dt-ast-012", "DT-IT-001", "Movable", "IT", "डिजिटल ट्विन डाटा सेन्टर सर्भर (Dell R750)",
        "Dell PowerEdge R750 सर्भर, १२८GB RAM, १६TB NVMe RAID, GIS/DT होस्ट",
        date(2023, 6, 30), 1850000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5830, 27.9355]})
    ),
    (
        "dt-ast-013", "DT-IT-002", "Movable", "IT", "जीआईएस नापी ड्रोन (DJI Matrice 300 RTK)",
        "DJI Matrice 300 RTK ड्रोन तथा थर्मल क्यामरा, ३डी नक्सांकन",
        date(2023, 8, 26), 1450000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5830, 27.9355]})
    ),
    (
        "dt-ast-014", "DT-EQP-001", "Movable", "Furniture", "१५ KVA साइलेन्ट डिजेल जेनेरेटर",
        "किर्लोस्कर १५ KVA जेनेरेटर, प्रशासनिक भवन विद्युत ब्याकअप",
        date(2020, 12, 25), 950000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5830, 27.9355]})
    ),
    (
        "dt-ast-015", "DT-EQP-002", "Movable", "Furniture", "१० KVA संस्थागत सौर्य उर्जा प्रणाली",
        "अस्पताल सौर्य बिजुली तथा लिथियम ब्याट्री ब्याकअप",
        date(2022, 8, 10), 1250000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5980, 27.9610]})
    ),
    (
        "dt-ast-016", "DT-LND-001", "Infrastructure", "Road", "तिपेनी बहुउद्देश्यीय खेलमैदान",
        "फुटबल मैदान, ५०० सिट प्यारापिट र रनिङ ट्रयाक",
        date(2022, 3, 24), 12000000.0, "Operational", None,
        json.dumps({"type": "Polygon", "coordinates": [[[85.5680, 27.9110], [85.5700, 27.9110], [85.5700, 27.9125], [85.5680, 27.9125], [85.5680, 27.9110]]]})
    ),
    (
        "dt-ast-017", "DT-LND-002", "Infrastructure", "Water", "धार्मिक पर्यटकीय पाँचपोखरी ताल परिसर",
        "५ वटा पवित्र तालहरू (४,१०० मि.), मन्दिर र धर्मशाला परिसर",
        date(2018, 4, 14), 25000000.0, "Operational", None,
        json.dumps({"type": "Polygon", "coordinates": [[[85.7000, 28.0400], [85.7050, 28.0400], [85.7050, 28.0450], [85.7000, 28.0450], [85.7000, 28.0400]]]})
    ),
    (
        "dt-ast-018", "DT-LND-003", "Infrastructure", "Road", "तार्केघ्याङ आपतकालीन हेलिप्याड",
        "कङ्क्रिट हेलिप्याड (२०x२० मि.), नागरिक उड्डयन प्राधिकरण स्वीकृत",
        date(2020, 9, 5), 3500000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.6135, 27.9785]})
    ),
    (
        "dt-ast-019", "DT-BLD-007", "Infrastructure", "Building", "बासखर्क किबी संकलन तथा कृषि प्रशोधन केन्द्र",
        "५० मेट्रिक टन शीतभण्डार र किबी जाम/क्यान्डी उत्पादन प्लान्ट",
        date(2022, 12, 30), 7500000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5860, 27.8950]})
    ),
    (
        "dt-ast-020", "DT-LND-004", "Infrastructure", "Water", "चिलाउनेघारी आधुनिक डम्पिङ तथा सरसफाइ केन्द्र",
        "वैज्ञानिक ल्यान्डफिल साइट, कम्पोस्टिङ सेड, लिचेट पोखरी",
        date(2023, 5, 24), 6500000.0, "Operational", None,
        json.dumps({"type": "Point", "coordinates": [85.5820, 27.9320]})
    ),
]

for r in dt_assets_data:
    cur.execute("""
        INSERT INTO dt_unified_assets (
            tenant_id, id, asset_code, asset_type, category, name, description,
            acquisition_date, acquisition_cost, current_condition, project_source_id,
            gis_geometry, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            asset_code = EXCLUDED.asset_code,
            asset_type = EXCLUDED.asset_type,
            category = EXCLUDED.category,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            acquisition_date = EXCLUDED.acquisition_date,
            acquisition_cost = EXCLUDED.acquisition_cost,
            current_condition = EXCLUDED.current_condition,
            project_source_id = EXCLUDED.project_source_id,
            gis_geometry = EXCLUDED.gis_geometry,
            updated_at = NOW();
    """, (
        TENANT, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10]
    ))
print(f"✓ Seeded {len(dt_assets_data)} records into 'dt_unified_assets'.")


# ---------------------------------------------------------------------------
# 3. SEED dt_asset_assignments (१२ वटा सम्पत्ति जिम्मा तथा अभिलेख)
# ---------------------------------------------------------------------------
assignments_data = [
    ("asg-01", "dt-ast-001", "emp-001", date(2022, 7, 17), None, "नयाँ/उत्कृष्ट"),
    ("asg-02", "dt-ast-002", "emp-006", date(2023, 7, 17), None, "उत्कृष्ट"),
    ("asg-03", "dt-ast-003", "emp-012", date(2020, 11, 26), None, "राम्रो"),
    ("asg-04", "dt-ast-004", "emp-013", date(2021, 3, 1), None, "राम्रो"),
    ("asg-05", "dt-ast-005", "emp-014", date(2021, 7, 15), None, "उत्कृष्ट"),
    ("asg-06", "dt-ast-006", "emp-018", date(2020, 8, 1), None, "उत्कृष्ट"),
    ("asg-07", "dt-ast-007", "emp-003", date(2021, 5, 5), None, "नयाँ"),
    ("asg-08", "dt-ast-008", "emp-010", date(2022, 6, 1), None, "नयाँ"),
    ("asg-09", "dt-ast-009", "emp-006", date(2022, 9, 20), None, "नयाँ"),
    ("asg-10", "dt-ast-011", "emp-010", date(2023, 5, 10), None, "नयाँ"),
    ("asg-11", "dt-ast-012", "emp-010", date(2023, 7, 1), None, "उत्कृष्ट"),
    ("asg-12", "dt-ast-013", "emp-003", date(2023, 9, 1), None, "उत्कृष्ट"),
]

for r in assignments_data:
    cur.execute("""
        INSERT INTO dt_asset_assignments (
            tenant_id, id, asset_id, assigned_to, assigned_date, returned_date, condition_at_assignment
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (id) DO UPDATE SET
            asset_id = EXCLUDED.asset_id,
            assigned_to = EXCLUDED.assigned_to,
            assigned_date = EXCLUDED.assigned_date,
            returned_date = EXCLUDED.returned_date,
            condition_at_assignment = EXCLUDED.condition_at_assignment;
    """, (
        TENANT, r[0], r[1], r[2], r[3], r[4], r[5]
    ))
print(f"✓ Seeded {len(assignments_data)} records into 'dt_asset_assignments'.")


# ---------------------------------------------------------------------------
# 4. SEED dt_asset_maintenance_logs (८ वटा मर्मत तथा सर्भिसिङ अभिलेख)
# ---------------------------------------------------------------------------
maintenance_data = [
    (
        "mnt-01", "dt-ast-007", date(2024, 3, 10), "Routine", "एमएडब्लु अर्थमुभर्स अधिकृत वर्कशप",
        125000.0, "जेसीबी ब्याकहो लोडर ५०० घण्टे नियमित सर्भिसिङ, इन्जिन आयल, हाइड्रोलिक र एयर फिल्टर फेरिएको",
        date(2024, 9, 10)
    ),
    (
        "mnt-02", "dt-ast-008", date(2024, 2, 18), "Routine", "सिप्रदी सर्भिस सेन्टर, बनेपा",
        85000.0, "टाटा टिपर वार्षिक मर्मत, ब्रेक लाइनिङ, इन्जिन ट्युनिङ र क्लच प्लेट अद्यावधिक",
        date(2024, 8, 18)
    ),
    (
        "mnt-03", "dt-ast-009", date(2024, 4, 5), "Routine", "अग्नि वर्कशप, जोरपाटी",
        45000.0, "एम्बुलेन्स आवधिक सर्भिसिङ, ४-ह्विल ड्राइभ गियर आयल, ब्रेक प्याड र अक्सिजन फ्लोमिटर परीक्षण",
        date(2024, 10, 5)
    ),
    (
        "mnt-04", "dt-ast-011", date(2024, 3, 25), "Breakdown", "ईस्टर्न अटोमोबाइल्स",
        95000.0, "फोहोर कम्प्याक्टर ट्रकको हाइड्रोलिक होज पाइप फुटेको मर्मत तथा हाइड्रोलिक सिल नयाँ फेरिएको",
        date(2024, 9, 25)
    ),
    (
        "mnt-05", "dt-ast-014", date(2024, 1, 15), "Routine", "किर्लोस्कर प्राविधिक टोली",
        35000.0, "प्रशासनिक १५ KVA जेनेरेटर मोबिल चेन्ज, ब्याट्री पानी टप-अप र अटोम्यानुअल चेन्जओभर टेस्ट",
        date(2024, 7, 15)
    ),
    (
        "mnt-06", "dt-ast-015", date(2024, 2, 28), "Routine", "सनराइज सोलार इन्जिनियर",
        25000.0, "अस्पताल सौर्य प्यानल सफाइ, लिथियम ब्याट्री BMS क्यालिब्रेशन र इन्भर्टर फर्मवेयर अपडेट",
        date(2024, 8, 28)
    ),
    (
        "mnt-07", "dt-ast-012", date(2024, 4, 1), "Upgrade", "म्याक्स इन्फोटेक सर्भर इन्जिनियर",
        150000.0, "सर्भर फर्मवेयर सेक्युरिटी प्याच, थप ६४GB RAM जडान र रेड एरे स्वास्थ्य परीक्षण",
        date(2024, 10, 1)
    ),
    (
        "mnt-08", "dt-ast-013", date(2024, 3, 15), "Routine", "ड्रोन हब नेपाल प्रा.लि.",
        30000.0, "DJI Matrice 300 RTK प्रोपेलर सेट परिवर्तन, आइएमयू र क्यामेरा जिम्बल क्यालिब्रेशन",
        date(2024, 9, 15)
    ),
]

for r in maintenance_data:
    cur.execute("""
        INSERT INTO dt_asset_maintenance_logs (
            tenant_id, id, asset_id, maintenance_date, maintenance_type, performed_by, cost, description, next_due_date
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (id) DO UPDATE SET
            asset_id = EXCLUDED.asset_id,
            maintenance_date = EXCLUDED.maintenance_date,
            maintenance_type = EXCLUDED.maintenance_type,
            performed_by = EXCLUDED.performed_by,
            cost = EXCLUDED.cost,
            description = EXCLUDED.description,
            next_due_date = EXCLUDED.next_due_date;
    """, (
        TENANT, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]
    ))
print(f"✓ Seeded {len(maintenance_data)} records into 'dt_asset_maintenance_logs'.")


# ---------------------------------------------------------------------------
# 5. SEED dt_asset_inspections (८ वटा प्राविधिक निरीक्षण तथा कन्डिसन मूल्याङ्कन)
# ---------------------------------------------------------------------------
inspections_data = [
    (
        "insp-01", "dt-ast-001", date(2024, 2, 15), "emp-003",
        "मुख्य प्रशासनिक भवनको संरचनात्मक बीम, पिल्लर तथा छानाको निरीक्षण गर्दा कुनै चर्किएको नदेखिएको, रङरोगन राम्रो अवस्थामा छ।",
        5, json.dumps(["/assets/photos/bld-admin-front.jpg", "/assets/photos/bld-admin-inside.jpg"])
    ),
    (
        "insp-02", "dt-ast-002", date(2024, 1, 10), "emp-003",
        "मानेखर्क अस्पताल भवनको भौतिक अवस्था उत्कृष्ट, आपतकालीन वार्ड र शल्यक्रिया कक्ष संक्रमणरहित मापदण्डमा सञ्चालन।",
        5, json.dumps(["/assets/photos/hosp-manekhark-front.jpg"])
    ),
    (
        "insp-03", "dt-ast-007", date(2024, 3, 12), "emp-003",
        "जेसीबीको बकेट र ब्याकहो लिङ्केज चुस्त, हाइड्रोलिक प्रेसर सामान्य, इन्जिन साउन्ड स्मूथ छ।",
        4, json.dumps(["/assets/photos/jcb-inspection-01.jpg"])
    ),
    (
        "insp-04", "dt-ast-008", date(2024, 2, 20), "emp-010",
        "टिपरको टायर ट्रेड गहिराई पर्याप्त, च्याचिसमा कुनै खिया नलागेको, हाइड्रोलिक डम्पिङ ज्याक राम्रोसँग चल्छ।",
        4, json.dumps(["/assets/photos/tipper-rear.jpg"])
    ),
    (
        "insp-05", "dt-ast-009", date(2024, 3, 1), "emp-006",
        "एम्बुलेन्सको अक्सिजन आपूर्ति, साइरन, साइरिन बत्ती र स्ट्रेचर लक पूर्ण तयारी अवस्थामा छ।",
        5, json.dumps(["/assets/photos/ambulance-cabin.jpg"])
    ),
    (
        "insp-06", "dt-ast-012", date(2024, 3, 15), "emp-010",
        "डाटा सेन्टर सर्भरको तापक्रम २१ डिग्री सेन्टिग्रेड, डिस्क हेल्थ १००%, पावर रिडन्डेन्सी एक्टिभ छ।",
        5, json.dumps(["/assets/photos/server-rack-health.jpg"])
    ),
    (
        "insp-07", "dt-ast-016", date(2024, 2, 11), "emp-005",
        "तिपेनी खेलमैदानको तारबार सुरक्षित, प्यारापिट सिटहरू सफा, ड्रेनेज निकास सफा गरिएको।",
        4, json.dumps(["/assets/photos/tipeni-ground-view.jpg"])
    ),
    (
        "insp-08", "dt-ast-017", date(2023, 8, 30), "emp-014",
        "पाँचपोखरी ताल परिसरमा जनैपूर्णिमा मेला पश्चात गरिएको वातावरणीय निरीक्षण, कुनै फोहोर नरहेको र पदमार्ग सुरक्षित।",
        5, json.dumps(["/assets/photos/panchpokhari-lake-drone.jpg"])
    ),
]

for r in inspections_data:
    cur.execute("""
        INSERT INTO dt_asset_inspections (
            tenant_id, id, asset_id, inspection_date, inspector_id, findings, condition_rating, photos
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (id) DO UPDATE SET
            asset_id = EXCLUDED.asset_id,
            inspection_date = EXCLUDED.inspection_date,
            inspector_id = EXCLUDED.inspector_id,
            findings = EXCLUDED.findings,
            condition_rating = EXCLUDED.condition_rating,
            photos = EXCLUDED.photos;
    """, (
        TENANT, r[0], r[1], r[2], r[3], r[4], r[5], r[6]
    ))
print(f"✓ Seeded {len(inspections_data)} records into 'dt_asset_inspections'.")


# ---------------------------------------------------------------------------
# 6. SEED gis_public_lands (८ वटा सार्वजनिक जग्गा, खुला क्षेत्र तथा पोखरी परिसर)
# ---------------------------------------------------------------------------
public_lands_data = [
    (
        "lnd-01", "१०५, १०६", "3", 85000.0, "ताल/पोखरी परिसर",
        "पाँचपोखरी धार्मिक तथा पर्यटकीय ताल क्षेत्र (४,१०० मि.)",
        "कुनै अतिक्रमण छैन, पूर्ण सार्वजनिक धार्मिक तथा वन संरक्षण क्षेत्र",
        json.dumps({
            "type": "Polygon",
            "coordinates": [[[85.7000, 28.0400], [85.7050, 28.0400], [85.7050, 28.0450], [85.7000, 28.0450], [85.7000, 28.0400]]]
        })
    ),
    (
        "lnd-02", "४५०, ४५१", "7", 18500.0, "सार्वजनिक खेलमैदान",
        "तिपेनी बहुउद्देश्यीय खेलमैदान तथा प्यारापिट परिसर",
        "पालिकाको स्वामित्वमा तारबार गरिएको सुरक्षित खेलमैदान",
        json.dumps({
            "type": "Polygon",
            "coordinates": [[[85.5680, 27.9110], [85.5700, 27.9110], [85.5700, 27.9125], [85.5680, 27.9125], [85.5680, 27.9110]]]
        })
    ),
    (
        "lnd-03", "२१५", "3", 4200.0, "सार्वजनिक चौर तथा हेलिप्याड",
        "तार्केघ्याङ आपतकालीन विपद् उद्धार हेलिप्याड तथा खुल्ला चौर",
        "सार्वजनिक जग्गा, कुनै व्यक्तिगत दाबी नरहेको",
        json.dumps({
            "type": "Polygon",
            "coordinates": [[[85.6130, 27.9780], [85.6145, 27.9780], [85.6145, 27.9790], [85.6130, 27.9790], [85.6130, 27.9780]]]
        })
    ),
    (
        "lnd-04", "१२०", "6", 12500.0, "सरकारी कार्यालय परिसर",
        "गाउँकार्यपालिका मुख्य प्रशासनिक भवन तथा सेवा परिसर, थाङपालधाप",
        "नापी नक्सामा गाउँपालिकाको नाममा दर्ता कायम रहेको जग्गा",
        json.dumps({
            "type": "Polygon",
            "coordinates": [[[85.5825, 27.9350], [85.5840, 27.9350], [85.5840, 27.9360], [85.5825, 27.9360], [85.5825, 27.9350]]]
        })
    ),
    (
        "lnd-05", "३४०, ३४१", "4", 9800.0, "सरकारी अस्पताल परिसर",
        "मानेखर्क १५ शय्या आधारभूत अस्पताल तथा स्वास्थ्यकर्मी आवास क्षेत्र",
        "सार्वजनिक अस्पताल प्रयोजनका लागि हस्तान्तरण भएको जग्गा",
        json.dumps({
            "type": "Polygon",
            "coordinates": [[[85.5975, 27.9605], [85.5990, 27.9605], [85.5990, 27.9615], [85.5975, 27.9615], [85.5975, 27.9605]]]
        })
    ),
    (
        "lnd-06", "८८", "1", 6500.0, "कृषि तथा चिस्यान केन्द्र",
        "बासखर्क किबी संकलन तथा कृषि प्रशोधन केन्द्र जग्गा",
        "कृषक समूह तथा पालिका साझेदारीमा निर्मित संरचना परिसर",
        json.dumps({
            "type": "Polygon",
            "coordinates": [[[85.5855, 27.8945], [85.5868, 27.8945], [85.5868, 27.8955], [85.5855, 27.8955], [85.5855, 27.8945]]]
        })
    ),
    (
        "lnd-07", "५१२", "6", 15000.0, "फोहोरमैला व्यवस्थापन क्षेत्र",
        "चिलाउनेघारी आधुनिक डम्पिङ साइट तथा कम्पोस्ट प्लान्ट",
        "बस्तीबाट टाढा सुरक्षित डाँडामा पर्ने सार्वजनिक पर्ती जग्गा",
        json.dumps({
            "type": "Polygon",
            "coordinates": [[[85.5815, 27.9315], [85.5830, 27.9315], [85.5830, 27.9328], [85.5815, 27.9328], [85.5815, 27.9315]]]
        })
    ),
    (
        "lnd-08", "६२५", "8", 22000.0, "नदी उकास / बगर संरक्षण क्षेत्र",
        "लागर्चे खोला किनार नदी उकास तथा तटबन्ध हरित क्षेत्र",
        "बाढी नियन्त्रण तथा ग्याबियन जाली लगाई वृक्षारोपण गरिएको खुला क्षेत्र",
        json.dumps({
            "type": "Polygon",
            "coordinates": [[[85.5880, 27.9700], [85.5910, 27.9700], [85.5910, 27.9718], [85.5880, 27.9718], [85.5880, 27.9700]]]
        })
    ),
]

for r in public_lands_data:
    cur.execute("""
        INSERT INTO gis_public_lands (
            tenant_id, id, kitta_no, ward_id, area_sqm, land_type, current_use,
            encroachment_details, gis_polygon, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            kitta_no = EXCLUDED.kitta_no,
            ward_id = EXCLUDED.ward_id,
            area_sqm = EXCLUDED.area_sqm,
            land_type = EXCLUDED.land_type,
            current_use = EXCLUDED.current_use,
            encroachment_details = EXCLUDED.encroachment_details,
            gis_polygon = EXCLUDED.gis_polygon,
            updated_at = NOW();
    """, (
        TENANT, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]
    ))
print(f"✓ Seeded {len(public_lands_data)} records into 'gis_public_lands'.")

conn.commit()
cur.close()
conn.close()

print("\n=== OPTION 19 SEEDING COMPLETED SUCCESSFULLY! ===")
