"""
Seed Script: Planning, Budgeting, Project Lifecycle & Procurement
Panchpokhari Thangpal Gaupalika, Sindhupalchok
Governed by:
  - Local Government Operation Act 2074 (Section 24, 7-Step Planning Process)
  - Public Procurement Act 2063 & Regulations 2064
  - Consumer Committee Mobilization Guidelines (उपभोक्ता समिति गठन, परिचालन तथा व्यवस्थापन कार्यविधि)

Populates:
  1. plans (8 strategic, annual & periodic plans)
  2. budgets (12 municipal budget heads & fund sources, ~NPR 52 Crores)
  3. projects (16 projects across Wards 1 to 8, with full consumer committee & audit details)
  4. contracts (10 public procurement / tender contracts)
  5. proj_plan_proposals (16 lifecycle proposals)
  6. proj_budget_allocations (16 lifecycle budget allocations)
  7. proj_procurement_plans (16 procurement methods)
  8. proj_contracts (16 agreement contracts)
  9. proj_executions (16 physical & financial progress records)
 10. proj_measurement_books (16 engineering measurement records - MB)
 11. proj_payments (16 running & final payment vouchers)
 12. proj_handovers (4 project completion handovers & social audits)
"""
import sys
import json
import psycopg2
from datetime import datetime, date

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("Starting Planning, Budget, Project Lifecycle & Procurement Seeding...")
TENANT = "panchpokhari"

# ---------------------------------------------------------------------------
# 1. SEED plans (Strategic, Periodic & Sectoral Plans)
# ---------------------------------------------------------------------------
plans = [
    (
        "16000000-0000-0000-0000-000000000001",
        "पाँचपोखरी थाङपाल गाउँपालिका प्रथम पञ्चवर्षीय आवधिक योजना (२०८०-२०८५)",
        "Panchpokhari Thangpal 1st Five-Year Periodic Plan (2023-2028)",
        "medium_term",
        "approved",
        "२०८१/०८२",
        2080,
        2085,
        "गाउँपालिकाको समग्र सामाजिक, आर्थिक, पूर्वाधार, सुशासन र वातावरण संरक्षणको ५ वर्षे रणनीतिक मार्गचित्र।",
        "समृद्ध, स्वावलम्बी र पर्यावरणमैत्री पाँचपोखरी थाङपाल निर्माण गर्ने।",
        json.dumps(["प्रतिव्यक्ति आय $१,५०० पुर्याउने", "१००% घरधुरीमा सुरक्षित खानेपानी र विद्युतीकरण", "पाँचपोखरी धार्मिक पर्यटन पूर्वाधार स्तरोन्नति"]),
        1850000000.0,
        "समग्र पालिका",
        None,
        "गाउँ सभा (१३औं अधिवेशन)",
        datetime(2023, 7, 10, 11, 0)
    ),
    (
        "16000000-0000-0000-0000-000000000002",
        "आर्थिक वर्ष २०८१/०८२ को वार्षिक नीति, कार्यक्रम तथा बजेट",
        "Annual Policies, Programs and Budget for FY 2081/082",
        "annual",
        "approved",
        "२०८१/०८२",
        2081,
        2082,
        "१५औं गाउँ सभाबाट पारित नीति तथा कार्यक्रम, कृषि, सडक स्तरोन्नति र गुणस्तरीय शिक्षा-स्वास्थ्य प्राथमिकता।",
        "उत्पादनशील रोजगारी सिर्जना, सडक स्तरोन्नति र सेवा प्रवाह डिजिटलाइजेसन।",
        json.dumps(["१६ वटा मुख्य गौरवका आयोजना कार्यान्वयन", "८ वटै वडामा स्वास्थ्य संस्था र प्रयोगशाला स्तरोन्नति", "एक वडा एक खेलकुद मैदान"]),
        542500000.0,
        "समग्र पालिका",
        None,
        "गाउँ सभा (१५औं अधिवेशन)",
        datetime(2024, 6, 25, 14, 0)
    ),
    (
        "16000000-0000-0000-0000-000000000003",
        "पाँचपोखरी दिगो पर्यटन विकास गुरुयोजना (२०८१-२०९०)",
        "Panchpokhari Sustainable Tourism Master Plan (2024-2034)",
        "long_term",
        "approved",
        "२०८१/०८२",
        2081,
        2091,
        "पाँचपोखरी तीर्थस्थल, ह्योल्मो सांस्कृतिक सम्पदा, लाङटाङ राष्ट्रिय निकुञ्ज बफर जोन र पदमार्गहरूको १० वर्षे गुरुयोजना।",
        "पर्यावरणमैत्री हिमाली पर्यटन मार्फत स्थानीय रोजगारी वृद्धि र सांस्कृतिक संरक्षण।",
        json.dumps(["वार्षिक ५०,००० बाह्य तथा आन्तरिक पर्यटक आकर्षण", "१० वटा नमूना पदमार्ग र होमस्टे सञ्जाल विकास", "हाई अल्टिच्यूड रेस्क्यू सेन्टर स्थापना"]),
        320000000.0,
        "पर्यटन तथा संस्कृति",
        3,
        "कार्यपालिका बैठक निर्णय नं. २४",
        datetime(2024, 4, 15, 10, 30)
    ),
    (
        "16000000-0000-0000-0000-000000000004",
        "किबी, ट्राउट माछा तथा प्राङ्गारिक कृषि विकास रणनीति योजना",
        "Kiwi, Trout Fish & Organic Agriculture Master Plan",
        "sectoral",
        "ongoing",
        "२०८१/०८२",
        2080,
        2083,
        "बासखर्क, गुन्सा र थाङपालकोटलाई अर्गानिक किबी र ट्राउट माछा पकेट क्षेत्रको रूपमा विकास गर्ने ३ वर्षे योजना।",
        "कृषकको आम्दानी दोब्बर बनाउने र कृषि उपजको ब्रान्डिङ तथा बजारीकरण।",
        json.dumps(["५०० रोपनीमा किबी खेती विस्तार", "२० वटा नयाँ रेसवे ट्राउट फार्म स्थापना", "चिस्यान केन्द्र (Cold Storage) सञ्चालन"]),
        85000000.0,
        "कृषि तथा पशुपन्छी",
        1,
        "गाउँ कार्यपालिका",
        datetime(2023, 11, 20, 13, 0)
    ),
    (
        "16000000-0000-0000-0000-000000000005",
        "स्थानीय विपद् तथा जलवायु उत्थानशील योजना (LDRCRP)",
        "Local Disaster and Climate Resilient Plan (LDRCRP)",
        "sectoral",
        "approved",
        "२०८१/०८२",
        2080,
        2085,
        "बाढी, पहिरो र भूकम्पीय जोखिम न्यूनीकरण तथा पूर्वतयारी कार्ययोजना।",
        "विपद् जोखिम मुक्त समुदाय निर्माण र आपतकालीन उद्धार क्षमता सुदृढीकरण।",
        json.dumps(["मेलम्ची तथा याङ्ग्री जलाधारमा पूर्वसूचना प्रणाली", "८ वडामा विपद् स्वयंसेवक दल गठन र तालिम", "आपतकालीन गोदामघर निर्माण"]),
        45000000.0,
        "विपद् व्यवस्थापन",
        None,
        "गाउँ विपद् व्यवस्थापन समिति (LDMC)",
        datetime(2023, 9, 12, 11, 0)
    ),
    (
        "16000000-0000-0000-0000-000000000006",
        "पाँचपोखरी थाङपाल नगर सडक गुरुयोजना (Transport Master Plan - MTMP)",
        "Municipal Transport Master Plan (MTMP)",
        "medium_term",
        "approved",
        "२०८१/०८२",
        2080,
        2085,
        "पालिकाका ८ वटै वडा केन्द्र जोड्ने चक्रपथ र कृषि सडकहरूको स्तरोन्नति तथा कालोपत्रे योजना।",
        "बाह्रै महिना सुरक्षित यातायात सञ्जाल सुनिश्चित गर्ने।",
        json.dumps(["४५ कि.मी. सडक स्तरोन्नति तथा पक्की नाली", "तिपेनी-मानेखर्क-तार्केघ्याङ मुख्य सडक स्तरोन्नति", "५ वटा पक्की मोटरेबल पुल निर्माण"]),
        620000000.0,
        "पूर्वाधार तथा यातायात",
        None,
        "गाउँ सभा",
        datetime(2023, 8, 18, 15, 0)
    ),
    (
        "16000000-0000-0000-0000-000000000007",
        "गुणस्तरीय शिक्षा रूपान्तरण १० वर्षे रणनीति (Education Master Plan)",
        "Quality Education Transformation Master Plan (2024-2034)",
        "long_term",
        "ongoing",
        "२०८१/०८२",
        2081,
        2091,
        "सामुदायिक विद्यालयहरूको भौतिक, डिजिटल र शैक्षिक गुणस्तर रूपान्तरण कार्यक्रम।",
        "प्राविधिक तथा जीवनोपयोगी शिक्षा सुनिश्चित गर्ने।",
        json.dumps(["सबै माविमा स्मार्ट क्लासरुम र कम्प्युटर ल्याब", "मातृभाषा शिक्षण र आवासीय छात्रवृत्ति", "शिक्षक क्षमता अभिवृद्धि तालिम"]),
        140000000.0,
        "शिक्षा तथा युवा",
        None,
        "गाउँ शिक्षा समिति",
        datetime(2024, 5, 2, 12, 0)
    ),
    (
        "16000000-0000-0000-0000-000000000008",
        "एक घर एक धारा पूर्ण सरसफाइ तथा वास गुरुयोजना (WASH Plan)",
        "Total Sanitation & WASH Master Plan",
        "sectoral",
        "ongoing",
        "२०८१/०८२",
        2080,
        2083,
        "सबै घरधुरीमा गुणस्तरीय खानेपानी र १००% सुरक्षित सरसफाइ सुनिश्चित गर्ने गुरुयोजना।",
        "पूर्ण सरसफाइयुक्त गाउँपालिका घोषणा गर्ने।",
        json.dumps(["८ वडाका ५,२४० घरधुरीमा खानेपानी धारा", "पानीको गुणस्तर परीक्षण प्रयोगशाला सञ्चालन", "सार्वजनिक तथा पर्यटकीय शौचालय निर्माण"]),
        110000000.0,
        "खानेपानी तथा सरसफाइ",
        None,
        "गाउँ वास समन्वय समिति (VWASH-CC)",
        datetime(2023, 10, 5, 14, 0)
    ),
]

for p in plans:
    cur.execute("""
        INSERT INTO plans (
            tenant_id, id, title, "titleEn", type, status, "fiscalYear", "startYear", "endYear",
            description, objectives, targets, "estimatedBudget", sector, "wardNumber",
            "approvedBy", "approvedAt", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            "titleEn" = EXCLUDED."titleEn",
            type = EXCLUDED.type,
            status = EXCLUDED.status,
            "fiscalYear" = EXCLUDED."fiscalYear",
            "startYear" = EXCLUDED."startYear",
            "endYear" = EXCLUDED."endYear",
            description = EXCLUDED.description,
            objectives = EXCLUDED.objectives,
            targets = EXCLUDED.targets,
            "estimatedBudget" = EXCLUDED."estimatedBudget",
            sector = EXCLUDED.sector,
            "wardNumber" = EXCLUDED."wardNumber",
            "approvedBy" = EXCLUDED."approvedBy",
            "approvedAt" = EXCLUDED."approvedAt",
            "updatedAt" = NOW();
    """, (
        TENANT, p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7],
        p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15]
    ))
print(f"✓ Seeded {len(plans)} strategic and periodic plans into 'plans'.")

# ---------------------------------------------------------------------------
# 2. SEED budgets (Budget Heads & Fund Allocations, FY 2081/082)
# ---------------------------------------------------------------------------
budgets = [
    (
        "16100000-0000-0000-0000-000000000001",
        "स्थानीय सडक, पुल तथा यातायात पूर्वाधार विकास बजेट",
        "२०८१/०८२",
        "capital",
        "approved",
        "पूर्वाधार विकास",
        None,
        145000000.0,
        105000000.0,
        78500000.0,
        "संघीय समानीकरण अनुदान तथा पालिका आन्तरिक स्रोत",
        "गाउँपालिकास्तरीय चक्रपथ, वडा जोड्ने सडक, पक्की नाली तथा मोटरेबल पुल निर्माण।"
    ),
    (
        "16100000-0000-0000-0000-000000000002",
        "एक घर एक धारा खानेपानी तथा मुहान संरक्षण आयोजना बजेट",
        "२०८१/०८२",
        "capital",
        "approved",
        "खानेपानी तथा सरसफाइ",
        None,
        42000000.0,
        31000000.0,
        24800000.0,
        "प्रदेश विशेष अनुदान तथा पालिका स्रोत",
        "सबै वडाका बस्तीहरूमा खानेपानी मुहान संरक्षण, इन्टेक, ट्याङ्की र पाइपलाइन विस्तार।"
    ),
    (
        "16100000-0000-0000-0000-000000000003",
        "पाँचपोखरी तीर्थस्थल तथा ह्योल्मो सांस्कृतिक पर्यटन प्रवर्द्धन",
        "२०८१/०८२",
        "capital",
        "approved",
        "पर्यटन तथा संस्कृति",
        3,
        35000000.0,
        26000000.0,
        21500000.0,
        "संघीय समपूरक अनुदान",
        "भोताङ-पाँचपोखरी पदमार्ग सिँढी, रेलिङ, याङ्ग्री-तार्केघ्याङ सांस्कृतिक संरक्षण।"
    ),
    (
        "16100000-0000-0000-0000-000000000004",
        "आधारभूत स्वास्थ्य सेवा सुदृढीकरण तथा अस्पताल भवन निर्माण",
        "२०८१/०८२",
        "capital",
        "approved",
        "स्वास्थ्य सेवा",
        None,
        48000000.0,
        40000000.0,
        34200000.0,
        "संघीय सशर्त स्वास्थ्य अनुदान",
        "मानेखर्क अस्पताल भवन, वडा स्वास्थ्य चौकीहरूमा ल्याब तथा प्रसूति सेवा स्तरोन्नति।"
    ),
    (
        "16100000-0000-0000-0000-000000000005",
        "सामुदायिक विद्यालय भौतिक पूर्वाधार तथा डिजिटल शिक्षा कार्यक्रम",
        "२०८१/०८२",
        "capital",
        "approved",
        "शिक्षा तथा खेलकुद",
        None,
        38000000.0,
        28000000.0,
        22400000.0,
        "संघीय सशर्त शिक्षा अनुदान",
        "विद्यालय भवन पुनर्निर्माण, आईसीटी ल्याब र विज्ञान प्रयोगशाला व्यवस्थापन।"
    ),
    (
        "16100000-0000-0000-0000-000000000006",
        "किबी, ट्राउट माछा पकेट तथा व्यावसायिक पशुपालन अनुदान",
        "२०८१/०८२",
        "capital",
        "approved",
        "कृषि तथा पशु सेवा",
        None,
        28000000.0,
        20000000.0,
        15600000.0,
        "पालिका आन्तरिक स्रोत तथा प्रदेश समपूरक",
        "किबी बेर्ना वितरण, याक/चौंरी संरक्षण खर्क विकास र आधुनिक बाख्रापालन सहयोग।"
    ),
    (
        "16100000-0000-0000-0000-000000000007",
        "विपद् जोखिम न्यूनीकरण, नदी नियन्त्रण तथा आपतकालीन कोष",
        "२०८१/०८२",
        "capital",
        "approved",
        "विपद् व्यवस्थापन",
        None,
        25000000.0,
        20000000.0,
        14800000.0,
        "गाउँपालिका विपद् व्यवस्थापन कोष",
        "ग्याबिन जाली तटबन्ध, पहिरो रोकथाम र विपद् पीडित राहत पुनर्स्थापना।"
    ),
    (
        "16100000-0000-0000-0000-000000000008",
        "वडास्तरीय साना पूर्वाधार तथा जनसहभागितामूलक आयोजना",
        "२०८१/०८२",
        "capital",
        "approved",
        "वडास्तरीय योजना",
        None,
        48000000.0,
        36000000.0,
        29000000.0,
        "पालिका आन्तरिक स्रोत (प्रति वडा रु. ६० लाख)",
        "८ वटै वडामा उपभोक्ता समिति मार्फत कार्यान्वयन हुने टोलस्तरीय योजनाहरू।"
    ),
    (
        "16100000-0000-0000-0000-000000000009",
        "महिला, बालबालिका, ज्येष्ठ नागरिक तथा लक्षित वर्ग सशक्तिकरण",
        "२०८१/०८२",
        "recurrent",
        "approved",
        "सामाजिक विकास",
        None,
        18500000.0,
        14000000.0,
        11200000.0,
        "पालिका आन्तरिक स्रोत",
        "सीपमूलक तालिम, अपाङ्गता परिचयपत्र, पोषण कार्यक्रम र ज्येष्ठ नागरिक सम्मान।"
    ),
    (
        "16100000-0000-0000-0000-000000000010",
        "सार्वजनिक फोहोरमैला संकलन, कम्पोस्ट प्लान्ट तथा वातावरण संरक्षण",
        "२०८१/०८२",
        "recurrent",
        "approved",
        "वातावरण तथा सरसफाइ",
        None,
        16000000.0,
        12000000.0,
        9800000.0,
        "वातावरण तथा प्रदूषण शुल्क कोष",
        "जैविक मल उत्पादन प्लान्ट सञ्चालन, ट्र्याक्टर परिचालन र प्लास्टिक रिसाइक्लिङ।"
    ),
    (
        "16100000-0000-0000-0000-000000000011",
        "गाउँपालिका प्रशासनिक सेवा प्रवाह, सूचना प्रविधि तथा डिजिटल सुशासन",
        "२०८१/०८२",
        "recurrent",
        "approved",
        "सुशासन तथा प्रशासन",
        6,
        45000000.0,
        35000000.0,
        31000000.0,
        "राजस्व बाँडफाँड तथा आन्तरिक राजस्व",
        "डिजिटल पालिका ट्विन, अनलाइन सेवा, कर्मचारी तलब भत्ता र कार्यालय व्यवस्थापन।"
    ),
    (
        "16100000-0000-0000-0000-000000000012",
        "आकस्मिक तथा विविध विकास कोष (Contingency Fund)",
        "२०८१/०८२",
        "capital",
        "approved",
        "आकस्मिक विकास",
        None,
        15000000.0,
        8000000.0,
        4200000.0,
        "पालिका आन्तरिक स्रोत",
        "अति आवश्यक आइपर्ने आकस्मिक पूर्वाधार मर्मत तथा कार्यपालिका विशेष निर्णय।"
    ),
]

for b in budgets:
    cur.execute("""
        INSERT INTO budgets (
            tenant_id, id, title, "fiscalYear", type, status, sector, "wardNumber",
            "allocatedAmount", "releasedAmount", "spentAmount", "sourceOfFund",
            description, "approvedBy", "approvedAt", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, '१५औं गाउँ सभा', NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            "fiscalYear" = EXCLUDED."fiscalYear",
            type = EXCLUDED.type,
            status = EXCLUDED.status,
            sector = EXCLUDED.sector,
            "wardNumber" = EXCLUDED."wardNumber",
            "allocatedAmount" = EXCLUDED."allocatedAmount",
            "releasedAmount" = EXCLUDED."releasedAmount",
            "spentAmount" = EXCLUDED."spentAmount",
            "sourceOfFund" = EXCLUDED."sourceOfFund",
            description = EXCLUDED.description,
            "updatedAt" = NOW();
    """, (
        TENANT, b[0], b[1], b[2], b[3], b[4], b[5], b[6],
        b[7], b[8], b[9], b[10], b[11]
    ))
print(f"✓ Seeded {len(budgets)} budget heads into 'budgets'.")

# ---------------------------------------------------------------------------
# 3. SEED projects (16 Comprehensive Projects across Wards 1 to 8)
# ---------------------------------------------------------------------------
# We have 8 already in projects; let's enrich them and add 8 more so all wards have 2 projects:
# Ward 1: RD01 (Road) + AG01 (Kiwi Irrigation)
# Ward 2: WS02 (Water) + TR02 (Yangri Trail)
# Ward 3: TR03 (Tourism Steps) + ED03 (School Building)
# Ward 4: BD04 (Health Post - Completed) + RD04 (Manekhark Market Pavement)
# Ward 5: IR05 (Irrigation) + WS05 (Drinking Water)
# Ward 6: AD06 (Admin Complex) + HL06 (Thangpaldhap Health Center)
# Ward 7: RD07 (Tipeni Drainage) + BR07 (Tipeni Suspension Bridge)
# Ward 8: BR08 (Lagarche Bridge) + AG08 (Lagarche Cold Store)

projects_data = [
    # WARD 1
    {
        "id": "bfa4605f-4c16-5c0f-b741-2b29bcc06cd1",
        "code": "PPK-W01-2081-RD01",
        "name": "बासखर्क किबी पकेट कृषि सडक स्तरोन्नति तथा ग्राभेल कार्य",
        "ward": 1, "sector": "road", "status": "ongoing", "budget": 2500000.0,
        "marfat": "उपभोक्ता समिति", "committee": "बासखर्क कृषि सडक उपभोक्ता समिति",
        "chair": "राम बहादुर तामाङ", "sec": "सुनिता न्यौपाने", "treas": "हरि माया दनुवार", "phone": "९८४१२२३३४४",
        "grant": 2250000.0, "contrib": 250000.0, "total_agr": 2500000.0, "paid": 1687500.0,
        "phys_prog": 75.0, "fin_prog": 67.5, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.8920, "lon": 85.5840, "loc": "बासखर्क, वडा नं. १", "beneficiaries": 480
    },
    {
        "id": "bfa4605f-4c16-5c0f-b741-2b29bcc06cd2",
        "code": "PPK-W01-2081-AG02",
        "name": "बासखर्क थोपा सिँचाइ तथा किबी नर्सरी स्रोत केन्द्र निर्माण",
        "ward": 1, "sector": "agriculture", "status": "ongoing", "budget": 1500000.0,
        "marfat": "उपभोक्ता समिति", "committee": "बासखर्क किबी उत्पादक उपभोक्ता समिति",
        "chair": "दिपक न्यौपाने", "sec": "माइली तामाङ", "treas": "कमल सापकोटा", "phone": "९८६११२२३३४",
        "grant": 1350000.0, "contrib": 150000.0, "total_agr": 1500000.0, "paid": 945000.0,
        "phys_prog": 70.0, "fin_prog": 63.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.8950, "lon": 85.5860, "loc": "बासखर्क कृषि पकेट", "beneficiaries": 320
    },

    # WARD 2
    {
        "id": "4e81fd82-8ee7-50ad-beeb-63df24334843",
        "code": "PPK-W02-2081-WS02",
        "name": "बरुवा खानेपानी मुहान संरक्षण तथा एक घर एक धारा विस्तार",
        "ward": 2, "sector": "water", "status": "ongoing", "budget": 3500000.0,
        "marfat": "उपभोक्ता समिति", "committee": "बरुवा एकीकृत खानेपानी उपभोक्ता समिति",
        "chair": "पासाङ दोर्जे शेर्पा", "sec": "डोल्मा शेर्पा", "treas": "किरण दनुवार", "phone": "९८१२३४५६७८",
        "grant": 3150000.0, "contrib": 350000.0, "total_agr": 3500000.0, "paid": 2520000.0,
        "phys_prog": 80.0, "fin_prog": 72.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9880, "lon": 85.6310, "loc": "बरुवा बजार तथा गाउँ", "beneficiaries": 650
    },
    {
        "id": "4e81fd82-8ee7-50ad-beeb-63df24334844",
        "code": "PPK-W02-2081-TR02",
        "name": "याङ्ग्री-मेलम्चीघ्याङ पदमार्ग विश्रामस्थल तथा भ्यु प्वाइन्ट निर्माण",
        "ward": 2, "sector": "tourism", "status": "completed", "budget": 1800000.0,
        "marfat": "उपभोक्ता समिति", "committee": "याङ्ग्री पर्यटन प्रवर्द्धन उपभोक्ता समिति",
        "chair": "निमा शेर्पा", "sec": "ल्हाक्पा तामाङ", "treas": "दावा फुटी शेर्पा", "phone": "९८०८११२२३३",
        "grant": 1620000.0, "contrib": 180000.0, "total_agr": 1800000.0, "paid": 1800000.0,
        "phys_prog": 100.0, "fin_prog": 100.0, "agr_status": "सम्पन्न (फरफारक प्रमाणित)",
        "lat": 27.9890, "lon": 85.6330, "loc": "याङ्ग्री पदमार्ग", "beneficiaries": 1200
    },

    # WARD 3
    {
        "id": "94087ede-54d6-5027-a189-262f03919650",
        "code": "PPK-W03-2081-TR03",
        "name": "भोताङ-पाँचपोखरी पर्यटकीय पदमार्ग सिँढी तथा रेलिङ निर्माण",
        "ward": 3, "sector": "tourism", "status": "ongoing", "budget": 4000000.0,
        "marfat": "उपभोक्ता समिति", "committee": "पाँचपोखरी पदमार्ग निर्माण उपभोक्ता समिति",
        "chair": "पेम्बा वाङ्दी शेर्पा", "sec": "सोनाम तामाङ", "treas": "दावा छिरिङ लामा", "phone": "९८५१०१२३४५",
        "grant": 3600000.0, "contrib": 400000.0, "total_agr": 4000000.0, "paid": 3000000.0,
        "phys_prog": 88.0, "fin_prog": 75.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9790, "lon": 85.6120, "loc": "भोताङदेखि पाँचपोखरी खण्ड", "beneficiaries": 3500
    },
    {
        "id": "94087ede-54d6-5027-a189-262f03919651",
        "code": "PPK-W03-2081-ED03",
        "name": "तार्केघ्याङ माध्यमिक विद्यालय २ कोठे भूकम्प प्रतिरोधी भवन",
        "ward": 3, "sector": "education", "status": "completed", "budget": 3200000.0,
        "marfat": "उपभोक्ता समिति", "committee": "तार्केघ्याङ मावि विद्यालय व्यवस्थापन समिति",
        "chair": "दावा दोर्जे शेर्पा", "sec": "छिरिङ लामा", "treas": "पेम्बा डिकी शेर्पा", "phone": "९८४१६६००८८",
        "grant": 3000000.0, "contrib": 200000.0, "total_agr": 3200000.0, "paid": 3200000.0,
        "phys_prog": 100.0, "fin_prog": 100.0, "agr_status": "सम्पन्न (फरफारक प्रमाणित)",
        "lat": 27.9785, "lon": 85.6135, "loc": "तार्केघ्याङ बजार", "beneficiaries": 240
    },

    # WARD 4
    {
        "id": "95db7655-4c1e-590c-98fc-cab2827bc7dd",
        "code": "PPK-W04-2081-BD04",
        "name": "थाङपालकोट मानेखर्क आधारभूत स्वास्थ्य सेवा केन्द्र भवन निर्माण",
        "ward": 4, "sector": "building", "status": "completed", "budget": 6000000.0,
        "marfat": "ठेक्का (NCB)", "committee": "जलकन्या कन्स्ट्रक्सन प्रा.लि.",
        "chair": "ई. अर्जुन श्रेष्ठ (प्रतिनिधि)", "sec": "श्याम सुन्दर खतिवडा", "treas": "गीता श्रेष्ठ", "phone": "९८५१०९८७६५",
        "grant": 6000000.0, "contrib": 0.0, "total_agr": 5745000.0, "paid": 5745000.0,
        "phys_prog": 100.0, "fin_prog": 100.0, "agr_status": "सम्पन्न (फरफारक प्रमाणित)",
        "lat": 27.9610, "lon": 85.5980, "loc": "मानेखर्क, वडा नं. ४", "beneficiaries": 2100
    },
    {
        "id": "95db7655-4c1e-590c-98fc-cab2827bc7de",
        "code": "PPK-W04-2081-RD04",
        "name": "मानेखर्क मुख्य बजार आरसीसी पक्की ढलान तथा ढल निकास",
        "ward": 4, "sector": "road", "status": "ongoing", "budget": 2800000.0,
        "marfat": "उपभोक्ता समिति", "committee": "मानेखर्क बजार सुधार उपभोक्ता समिति",
        "chair": "गोविन्द प्रसाद श्रेष्ठ", "sec": "सन्तोष विक", "treas": "माया थाङपाली", "phone": "९८०३४५६७८९",
        "grant": 2520000.0, "contrib": 280000.0, "total_agr": 2800000.0, "paid": 1960000.0,
        "phys_prog": 78.0, "fin_prog": 70.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9615, "lon": 85.5985, "loc": "मानेखर्क बजार चोक", "beneficiaries": 1400
    },

    # WARD 5
    {
        "id": "473f4a5f-3620-57af-b25e-de5b6d824efb",
        "code": "PPK-W05-2081-IR05",
        "name": "गुन्सा सिँचाइ कुलो निर्माण तथा कृषि उत्पादकत्व वृद्धि आयोजना",
        "ward": 5, "sector": "irrigation", "status": "ongoing", "budget": 1800000.0,
        "marfat": "उपभोक्ता समिति", "committee": "गुन्सा सिँचाइ उपभोक्ता समिति",
        "chair": "ज्ञान बहादुर तामाङ", "sec": "दिक्पाल गिरी", "treas": "मेनुका राई", "phone": "९८४१००११२२",
        "grant": 1620000.0, "contrib": 180000.0, "total_agr": 1800000.0, "paid": 1080000.0,
        "phys_prog": 62.0, "fin_prog": 60.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9510, "lon": 85.5900, "loc": "गुन्सा, वडा नं. ५", "beneficiaries": 450
    },
    {
        "id": "473f4a5f-3620-57af-b25e-de5b6d824efc",
        "code": "PPK-W05-2081-WS05",
        "name": "रायले एकीकृत खानेपानी योजना तथा आरभीटी ट्याङ्की निर्माण",
        "ward": 5, "sector": "water", "status": "ongoing", "budget": 2200000.0,
        "marfat": "उपभोक्ता समिति", "committee": "रायले खानेपानी उपभोक्ता समिति",
        "chair": "नन्द कुमारी गिरी", "sec": "दावा छिरिङ तामाङ", "treas": "सुन्तली तामाङ", "phone": "९८५११२२३३०",
        "grant": 1980000.0, "contrib": 220000.0, "total_agr": 2200000.0, "paid": 1430000.0,
        "phys_prog": 68.0, "fin_prog": 65.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9480, "lon": 85.5860, "loc": "रायले बस्ती", "beneficiaries": 510
    },

    # WARD 6
    {
        "id": "c6848a0b-40bc-5ca7-b1e9-a1bf4b3a6cb8",
        "code": "PPK-W06-2081-AD06",
        "name": "थाङपालधाप गाउँपालिका प्रशासनिक परिसर कम्पाउन्ड वाल तथा ल्यान्डस्केपिङ",
        "ward": 6, "sector": "building", "status": "ongoing", "budget": 2800000.0,
        "marfat": "उपभोक्ता समिति", "committee": "पालिका परिसर सौन्दर्यीकरण उपभोक्ता समिति",
        "chair": "कमल श्रेष्ठ", "sec": "सीता सापकोटा", "treas": "रमेश श्रेष्ठ", "phone": "९८४१६६५५४४",
        "grant": 2520000.0, "contrib": 280000.0, "total_agr": 2800000.0, "paid": 1960000.0,
        "phys_prog": 70.0, "fin_prog": 70.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9350, "lon": 85.5820, "loc": "थाङपालधाप, वडा नं. ६", "beneficiaries": 8500
    },
    {
        "id": "c6848a0b-40bc-5ca7-b1e9-a1bf4b3a6cb9",
        "code": "PPK-W06-2081-HL06",
        "name": "थाङपालधाप प्राथमिक स्वास्थ्य केन्द्र प्रयोगशाला तथा एक्स-रे कक्ष स्तरोन्नति",
        "ward": 6, "sector": "health", "status": "completed", "budget": 2400000.0,
        "marfat": "उपभोक्ता समिति", "committee": "स्वास्थ्य संस्था व्यवस्थापन समिति",
        "chair": "ज्ञान बहादुर तामाङ", "sec": "डा. प्रभात श्रेष्ठ", "treas": "कमला श्रेष्ठ", "phone": "९८४९८८७७६६",
        "grant": 2200000.0, "contrib": 200000.0, "total_agr": 2400000.0, "paid": 2400000.0,
        "phys_prog": 100.0, "fin_prog": 100.0, "agr_status": "सम्पन्न (फरफारक प्रमाणित)",
        "lat": 27.9360, "lon": 85.5830, "loc": "थाङपालधाप केन्द्र", "beneficiaries": 4200
    },

    # WARD 7
    {
        "id": "8b85a7e1-464e-59c0-9064-e64d7d950209",
        "code": "PPK-W07-2081-RD07",
        "name": "भोटेनाम्लाङ-तिपेनी बजार मुख्य सडक पक्की नाली तथा आरसीसी ढलान",
        "ward": 7, "sector": "road", "status": "ongoing", "budget": 3200000.0,
        "marfat": "उपभोक्ता समिति", "committee": "तिपेनी सडक सुधार उपभोक्ता समिति",
        "chair": "टेक बहादुर तामाङ", "sec": "गोपाल श्रेष्ठ", "treas": "सुमित्रा दनुवार", "phone": "९८४१५५६६७७",
        "grant": 2880000.0, "contrib": 320000.0, "total_agr": 3200000.0, "paid": 2080000.0,
        "phys_prog": 65.0, "fin_prog": 65.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9117, "lon": 85.5692, "loc": "तिपेनी मुख्य बजार", "beneficiaries": 2400
    },
    {
        "id": "8b85a7e1-464e-59c0-9064-e64d7d950210",
        "code": "PPK-W07-2081-BR07",
        "name": "तिपेनी खोला झोलुङ्गे पुल निर्माण तथा आवागमन सहजता आयोजना",
        "ward": 7, "sector": "bridge", "status": "ongoing", "budget": 2600000.0,
        "marfat": "उपभोक्ता समिति", "committee": "तिपेनी झोलुङ्गे पुल निर्माण समिति",
        "chair": "कृष्ण बहादुर दङ्गाल", "sec": "सुकमान विक", "treas": "सानु दनुवार", "phone": "९८४१७७८८९९",
        "grant": 2340000.0, "contrib": 260000.0, "total_agr": 2600000.0, "paid": 1690000.0,
        "phys_prog": 70.0, "fin_prog": 65.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9100, "lon": 85.5670, "loc": "तिपेनी खोला", "beneficiaries": 1100
    },

    # WARD 8
    {
        "id": "34e71f99-f97d-552d-8920-709b83f7eaa7",
        "code": "PPK-W08-2081-BR08",
        "name": "लाँगर्चे खोला झोलुङ्गे पुल तथा सुरक्षित गोरेटो बाटो निर्माण",
        "ward": 8, "sector": "bridge", "status": "planned", "budget": 2000000.0,
        "marfat": "उपभोक्ता समिति", "committee": "लाँगर्चे झोलुङ्गे पुल उपभोक्ता समिति",
        "chair": "कान्छी माया तामाङ", "sec": "लाक्पा डिकी शेर्पा", "treas": "प्रेम बहादुर तामाङ", "phone": "९८४१७७८८००",
        "grant": 1800000.0, "contrib": 200000.0, "total_agr": 2000000.0, "paid": 0.0,
        "phys_prog": 0.0, "fin_prog": 0.0, "agr_status": "सम्झौता हुन बाँकी",
        "lat": 27.9710, "lon": 85.5890, "loc": "लाँगर्चे खोला, वडा नं. ८", "beneficiaries": 850
    },
    {
        "id": "34e71f99-f97d-552d-8920-709b83f7eaa8",
        "code": "PPK-W08-2081-AG08",
        "name": "लाँगर्चे आलु तथा तरकारी संकलन केन्द्र तथा सामुदायिक बीउ भण्डार",
        "ward": 8, "sector": "agriculture", "status": "ongoing", "budget": 1600000.0,
        "marfat": "उपभोक्ता समिति", "committee": "लाँगर्चे कृषि संकलन केन्द्र उपभोक्ता समिति",
        "chair": "सोनाम तामाङ", "sec": "सुन्तली शेर्पा", "treas": "माइला तामाङ", "phone": "९८१२४४५५६६",
        "grant": 1440000.0, "contrib": 160000.0, "total_agr": 1600000.0, "paid": 960000.0,
        "phys_prog": 60.0, "fin_prog": 60.0, "agr_status": "सम्झौता भई कार्य प्रारम्भ",
        "lat": 27.9725, "lon": 85.5910, "loc": "लाँगर्चे बजार", "beneficiaries": 390
    }
]

for p in projects_data:
    installment_details = [
        {"installment": 1, "type": "पेश्की (Advance)", "amount": p["total_agr"] * 0.20, "paidDate": "२०८१-०४-०५", "status": "Paid" if p["paid"] > 0 else "Pending"},
        {"installment": 2, "type": "प्रथम रनिङ बिल", "amount": p["total_agr"] * 0.40, "paidDate": "२०८१-०५-१०", "status": "Paid" if p["phys_prog"] >= 60 else "Pending"},
        {"installment": 3, "type": "अन्तिम भुक्तानी", "amount": p["total_agr"] * 0.40, "paidDate": "२०८१-०६-०१", "status": "Paid" if p["phys_prog"] >= 100 else "Pending"},
    ]
    monitoring_records = [
        {"round": 1, "date": "२०८१-०४-२०", "monitoredBy": "वडा अनुगमन समिति", "score": 85, "recommendation": "काम सन्तोषजनक, दोस्रो किस्ता निकासा गर्न सिफारिस"},
        {"round": 2, "date": "२०८१-०५-१५", "monitoredBy": "गाउँपालिकास्तरीय उपाध्यक्ष अनुगमन समिति", "score": 90, "recommendation": "मापदण्ड अनुसार निर्माण भएको प्रमाणित"}
    ]
    social_audit = {
        "heldDate": "२०८१-०५-२५" if p["phys_prog"] >= 70 else None,
        "participantsCount": 65,
        "womenParticipationPct": 45.0,
        "publicHearingPassed": True if p["phys_prog"] >= 70 else False,
        "publicFeedback": "गुणस्तरीय सामग्री प्रयोग भएको र समयमै सम्पन्न भएको ठहर।"
    }

    cur.execute("""
        INSERT INTO projects (
            tenant_id, id, "projectCode", name, "wardNumber", sector, status, budget,
            "fundingSource", "fiscalYear", marfat, level, "committeeName", "committeeChair",
            "committeeSecretary", "committeeTreasurer", "committeePhone", "palikaGrant",
            "communityContribution", "totalAgreementAmount", "paidAmount", "financialProgress",
            "progressPercentage", "agreementStatus", latitude, longitude, location,
            "beneficiaryCount", "installmentDetails", "monitoringRecords", "socialAudit",
            "responsibleEngineer", "engineerPhone", "monitoringRecommendation",
            "isPublic", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s,
            'गाउँपालिका आन्तरिक तथा अनुदान स्रोत', '२०८१/०८२', %s, 'गाउँपालिकास्तरीय', %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            'इ. रमेश खड्का', '९८४१२२३३४४', 'approved',
            TRUE, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "projectCode" = EXCLUDED."projectCode",
            name = EXCLUDED.name,
            "wardNumber" = EXCLUDED."wardNumber",
            sector = EXCLUDED.sector,
            status = EXCLUDED.status,
            budget = EXCLUDED.budget,
            marfat = EXCLUDED.marfat,
            "committeeName" = EXCLUDED."committeeName",
            "committeeChair" = EXCLUDED."committeeChair",
            "committeeSecretary" = EXCLUDED."committeeSecretary",
            "committeeTreasurer" = EXCLUDED."committeeTreasurer",
            "committeePhone" = EXCLUDED."committeePhone",
            "palikaGrant" = EXCLUDED."palikaGrant",
            "communityContribution" = EXCLUDED."communityContribution",
            "totalAgreementAmount" = EXCLUDED."totalAgreementAmount",
            "paidAmount" = EXCLUDED."paidAmount",
            "financialProgress" = EXCLUDED."financialProgress",
            "progressPercentage" = EXCLUDED."progressPercentage",
            "agreementStatus" = EXCLUDED."agreementStatus",
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            location = EXCLUDED.location,
            "beneficiaryCount" = EXCLUDED."beneficiaryCount",
            "installmentDetails" = EXCLUDED."installmentDetails",
            "monitoringRecords" = EXCLUDED."monitoringRecords",
            "socialAudit" = EXCLUDED."socialAudit",
            "updatedAt" = NOW();
    """, (
        TENANT, p["id"], p["code"], p["name"], p["ward"], p["sector"], p["status"], p["budget"],
        p["marfat"], p["committee"], p["chair"], p["sec"], p["treas"], p["phone"],
        p["grant"], p["contrib"], p["total_agr"], p["paid"], p["fin_prog"],
        p["phys_prog"], p["agr_status"], p["lat"], p["lon"], p["loc"],
        p["beneficiaries"], json.dumps(installment_details), json.dumps(monitoring_records), json.dumps(social_audit)
    ))
print(f"✓ Seeded & updated {len(projects_data)} projects across all 8 Wards in 'projects'.")

# ---------------------------------------------------------------------------
# 4. SEED contracts (10 Public Procurement / E-GP Contracts)
# ---------------------------------------------------------------------------
contracts = [
    (
        "16200000-0000-0000-0000-000000000001",
        "P5-NCB-WORKS-2081-01",
        "मानेखर्क प्राथमिक अस्पताल भवन निर्माण ठेक्का सम्झौता",
        "जलकन्या कन्स्ट्रक्सन प्रा.लि., सिन्धुपाल्चोक",
        "९८५१०९८७६५",
        "३००१२३४५६",
        "completed",
        5745000.0,
        5745000.0,
        "२०८१/०८२",
        "95db7655-4c1e-590c-98fc-cab2827bc7dd",
        "भवन पूर्वाधार",
        date(2023, 10, 1),
        date(2024, 5, 30),
        date(2024, 5, 20),
        100,
        "भूकम्प प्रतिरोधी आरसीसी अस्पताल भवन निर्माण सम्पन्न।"
    ),
    (
        "16200000-0000-0000-0000-000000000002",
        "P5-SQ-WORKS-2081-02",
        "थाङपालधाप पालिका केन्द्र मुख्य सडक कालोपत्रे तथा डिभाइडर निर्माण",
        "पाँचपोखरी विल्डर्स एन्ड सप्लायर्स",
        "९८४१२२३३९९",
        "६००२३४५६७",
        "active",
        4250000.0,
        2975000.0,
        "२०८१/०८२",
        "c6848a0b-40bc-5ca7-b1e9-a1bf4b3a6cb8",
        "सडक पूर्वाधार",
        date(2024, 2, 1),
        date(2024, 8, 30),
        None,
        75,
        "आसफाल्ट कालोपत्रे तथा कर्बस्टोन बिछ्याउने कार्य जारी।"
    ),
    (
        "16200000-0000-0000-0000-000000000003",
        "P5-NCB-GOODS-2081-03",
        "किबी पकेट तथा कृषि यन्त्रीकरण (हाते ट्र्याक्टर, स्प्रेयर) आपूर्ति",
        "नेपाल एग्रो टेक प्रालि, काठमाडौं",
        "९८५१००११२२",
        "१००२२३३४४",
        "completed",
        2800000.0,
        2800000.0,
        "२०८१/०८२",
        "bfa4605f-4c16-5c0f-b741-2b29bcc06cd1",
        "कृषि यन्त्र",
        date(2024, 1, 15),
        date(2024, 4, 15),
        date(2024, 4, 10),
        100,
        "५० थान मिनि टिलर तथा कृषि औजार कृषक समूहलाई हस्तान्तरण।"
    ),
    (
        "16200000-0000-0000-0000-000000000004",
        "P5-NCB-WORKS-2081-04",
        "मेलम्चीघ्याङ-तार्केघ्याङ सांस्कृतिक सडक स्तरोन्नति तथा पक्की नाली",
        "हिमशिखर कन्स्ट्रक्सन जेभी",
        "९८४१५५६६००",
        "३०१२२३३४४",
        "active",
        8500000.0,
        5100000.0,
        "२०८१/०८२",
        "4e81fd82-8ee7-50ad-beeb-63df24334843",
        "सडक",
        date(2024, 3, 1),
        date(2024, 11, 30),
        None,
        60,
        "पदमार्ग छेउ ग्याबिन पर्खाल र पक्की ढल निर्माण कार्य।"
    ),
    (
        "16200000-0000-0000-0000-000000000005",
        "P5-SQ-GOODS-2081-05",
        "सामुदायिक विद्यालयहरूका लागि डिजिटल स्मार्ट बोर्ड तथा कम्प्युटर ल्याब",
        "इन्फो टेक सोलुसन प्रालि",
        "९८५१०२२३३४",
        "६०१२२३३४४",
        "completed",
        3400000.0,
        3400000.0,
        "२०८१/०८२",
        "94087ede-54d6-5027-a189-262f03919651",
        "शिक्षा सूचना प्रविधि",
        date(2024, 2, 10),
        date(2024, 5, 10),
        date(2024, 5, 5),
        100,
        "८ वटै वडाका माविमा स्मार्ट बोर्ड र नेटवर्किङ जडान सम्पन्न।"
    ),
    (
        "16200000-0000-0000-0000-000000000006",
        "P5-NCB-WORKS-2081-06",
        "तिपेनी बसपार्क आधुनिक टर्मिनल भवन तथा सार्वजनिक शौचालय",
        "इन्द्रावती इन्फ्रास्ट्रक्चर प्रालि",
        "९८५११२२३३४",
        "३००९९८८७७",
        "active",
        6200000.0,
        4340000.0,
        "२०८१/०८२",
        "8b85a7e1-464e-59c0-9064-e64d7d950209",
        "भवन पूर्वाधार",
        date(2024, 1, 20),
        date(2024, 9, 30),
        None,
        70,
        "दोस्रो तला ढलान सम्पन्न, फिनिसिङ कार्य जारी।"
    ),
    (
        "16200000-0000-0000-0000-000000000007",
        "P5-SQ-CONSULT-2081-07",
        "पाँचपोखरी जलाधार संरक्षण तथा विपद् पूर्वसूचना प्रणाली परामर्श सेवा",
        "जियो-इन्भाइरो कन्सल्टिङ इन्जिनियर्स",
        "९८४१३३४४५५",
        "६००८८९९००",
        "completed",
        1200000.0,
        1200000.0,
        "२०८१/०८२",
        "473f4a5f-3620-57af-b25e-de5b6d824efb",
        "परामर्श सेवा",
        date(2023, 11, 1),
        date(2024, 3, 30),
        date(2024, 3, 25),
        100,
        "विपद् जोखिम नक्साङ्कन तथा पूर्वसूचना उपकरण जडान प्रतिवेदन स्वीकृत।"
    ),
    (
        "16200000-0000-0000-0000-000000000008",
        "P5-NCB-WORKS-2081-08",
        "लागर्चे खोला झोलुङ्गे पुल लट-२ निर्माण कार्य",
        "ब्रिज कन्सट्रक्सन कम्पनी प्रालि",
        "९८५१०३३४४५",
        "३००४४५५६६",
        "draft",
        4500000.0,
        0.0,
        "२०८१/०८२",
        "34e71f99-f97d-552d-8920-709b83f7eaa7",
        "झोलुङ्गे पुल",
        date(2024, 6, 1),
        date(2025, 2, 28),
        None,
        0,
        "बोलपत्र मूल्यांकन सम्पन्न, सम्झौता प्रक्रियामा।"
    ),
    (
        "16200000-0000-0000-0000-000000000009",
        "P5-SQ-GOODS-2081-09",
        "स्वास्थ्य चौकीहरूको लागि औषधि तथा सर्जिकल सामग्री खरिद",
        "सिन्धु फर्मा डिस्ट्रिब्युटर्स",
        "९८०८३३२२११",
        "६०२३३४४५५",
        "completed",
        1800000.0,
        1800000.0,
        "२०८१/०८२",
        "c6848a0b-40bc-5ca7-b1e9-a1bf4b3a6cb9",
        "स्वास्थ्य सामग्री",
        date(2024, 1, 5),
        date(2024, 3, 5),
        date(2024, 3, 1),
        100,
        "सबै स्वास्थ्य संस्थाहरूमा ९८ प्रकारका आधारभूत औषधि आपूर्ति।"
    ),
    (
        "16200000-0000-0000-0000-000000000010",
        "P5-NCB-WORKS-2081-10",
        "पाँचपोखरी जैविक फोहोर कम्पोस्ट प्लान्ट सेड तथा मेसिनरी जडान",
        "ग्रिन अर्थ इन्जिनियरिङ प्रालि",
        "९८५११४४०२०",
        "३०१५५६६७७",
        "completed",
        3100000.0,
        3100000.0,
        "२०८१/०८२",
        "bfa4605f-4c16-5c0f-b741-2b29bcc06cd2",
        "वातावरण",
        date(2023, 12, 1),
        date(2024, 4, 30),
        date(2024, 4, 28),
        100,
        "कम्पोस्टिङ ट्याङ्क तथा जैविक मल पिस्ने मेसिन जडान सम्पन्न।"
    ),
]

for c in contracts:
    cur.execute("""
        INSERT INTO contracts (
            tenant_id, id, "contractNo", title, "contractorName", "contractorPhone", "contractorPAN",
            status, "contractAmount", "paidAmount", "fiscalYear", "projectId", sector,
            "startDate", "endDate", "completionDate", "progressPercent", description,
            "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "contractNo" = EXCLUDED."contractNo",
            title = EXCLUDED.title,
            "contractorName" = EXCLUDED."contractorName",
            "contractorPhone" = EXCLUDED."contractorPhone",
            "contractorPAN" = EXCLUDED."contractorPAN",
            status = EXCLUDED.status,
            "contractAmount" = EXCLUDED."contractAmount",
            "paidAmount" = EXCLUDED."paidAmount",
            "fiscalYear" = EXCLUDED."fiscalYear",
            "projectId" = EXCLUDED."projectId",
            sector = EXCLUDED.sector,
            "startDate" = EXCLUDED."startDate",
            "endDate" = EXCLUDED."endDate",
            "completionDate" = EXCLUDED."completionDate",
            "progressPercent" = EXCLUDED."progressPercent",
            description = EXCLUDED.description,
            "updatedAt" = NOW();
    """, (
        TENANT, c[0], c[1], c[2], c[3], c[4], c[5], c[6],
        c[7], c[8], c[9], c[10], c[11], c[12], c[13], c[14],
        c[15], c[16]
    ))
print(f"✓ Seeded {len(contracts)} procurement contracts into 'contracts'.")

# ---------------------------------------------------------------------------
# 5. MATCH ALL 16 PROJECTS IN PROJECT LIFECYCLE TABLES
# ---------------------------------------------------------------------------
print("Syncing project lifecycle (Proposals, Allocations, Procurement, Executions)...")

for idx, p in enumerate(projects_data):
    p_code = p["code"]
    prop_id = f"prop-w{p['ward']}-{idx+1:02d}"
    budg_id = f"balloc-w{p['ward']}-{idx+1:02d}"
    proc_id = f"pplan-w{p['ward']}-{idx+1:02d}"
    cont_id = f"pcont-w{p['ward']}-{idx+1:02d}"
    exec_id = f"exec-w{p['ward']}-{idx+1:02d}"

    # 1. Proposal
    cur.execute("""
        INSERT INTO proj_plan_proposals (tenant_id, id, fiscal_year, ward_id, title, description, estimated_cost, priority, status, created_at)
        VALUES (%s, %s, '२०८१/०८२', %s, %s, %s, %s, 'High', 'Selected', NOW())
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, estimated_cost = EXCLUDED.estimated_cost;
    """, (TENANT, prop_id, str(p["ward"]), p["name"], p["name"], p["budget"]))

    # 2. Budget Allocation
    cur.execute("""
        INSERT INTO proj_budget_allocations (tenant_id, id, plan_id, budget_head_code, source_of_fund, allocated_amount, approved_date)
        VALUES (%s, %s, %s, '22511-CAPITAL', 'पालिका आन्तरिक तथा अनुदान स्रोत', %s, '2024-07-15')
        ON CONFLICT (id) DO UPDATE SET allocated_amount = EXCLUDED.allocated_amount;
    """, (TENANT, budg_id, prop_id, p["grant"]))

    # 3. Procurement Plan
    proc_method = "Consumer Committee" if p["marfat"] == "उपभोक्ता समिति" else "NCB"
    cur.execute("""
        INSERT INTO proj_procurement_plans (tenant_id, id, budget_id, procurement_method, estimated_amount, tender_call_date, bid_opening_date)
        VALUES (%s, %s, %s, %s, %s, '2024-07-20', '2024-08-05')
        ON CONFLICT (id) DO UPDATE SET estimated_amount = EXCLUDED.estimated_amount;
    """, (TENANT, proc_id, budg_id, proc_method, p["total_agr"]))

    # 4. Contract
    cur.execute("""
        INSERT INTO proj_contracts (tenant_id, id, procurement_id, contractor_type, contractor_id, contract_amount, agreement_date, completion_deadline, status)
        VALUES (%s, %s, %s, 'Committee', %s, %s, '2024-08-10', '2025-04-30', 'Active')
        ON CONFLICT (id) DO UPDATE SET contract_amount = EXCLUDED.contract_amount;
    """, (TENANT, cont_id, proc_id, p["committee"], p["total_agr"]))

    # 5. Execution
    geom = {"type": "Point", "coordinates": [p["lon"], p["lat"]]}
    cur.execute("""
        INSERT INTO proj_executions (tenant_id, id, contract_id, project_code, physical_progress_percent, financial_progress_percent, responsible_engineer_id, gis_geometry)
        VALUES (%s, %s, %s, %s, %s, %s, 'इ. रमेश खड्का', %s)
        ON CONFLICT (project_code) DO UPDATE SET
            physical_progress_percent = EXCLUDED.physical_progress_percent,
            financial_progress_percent = EXCLUDED.financial_progress_percent,
            gis_geometry = EXCLUDED.gis_geometry
        RETURNING id;
    """, (TENANT, exec_id, cont_id, p_code, p["phys_prog"], p["fin_prog"], json.dumps(geom)))
    real_exec_id = cur.fetchone()[0]

    # 6. Measurement Book (MB)
    mb_id = f"mb-w{p['ward']}-{idx+1:02d}"
    work_desc = f"साईट स्तरमा {p['name']} सम्बन्धी प्राविधिक नापजाँच सम्पन्न, गुणस्तर मापदण्ड अनुरुप।"
    cur.execute("""
        INSERT INTO proj_measurement_books (tenant_id, id, project_id, mb_date, measured_by, work_description, quantity_completed, remarks)
        VALUES (%s, %s, %s, '2024-08-25', 'इ. रमेश खड्का', %s, %s, 'नापी किताब प्रमाणित')
        ON CONFLICT (id) DO UPDATE SET
            work_description = EXCLUDED.work_description,
            quantity_completed = EXCLUDED.quantity_completed;
    """, (TENANT, mb_id, real_exec_id, work_desc, p["total_agr"] * (p["phys_prog"] / 100.0)))

    # 7. Payment Voucher
    pay_id = f"pay-w{p['ward']}-{idx+1:02d}"
    pay_type = "Final" if p["phys_prog"] >= 100 else "Running Bill" if p["phys_prog"] > 0 else "Advance"
    gross = p["paid"]
    deduct = round(gross * 0.015, 2) # 1.5% TDS
    net = gross - deduct
    cur.execute("""
        INSERT INTO proj_payments (tenant_id, id, project_id, mb_id, payment_type, gross_amount, deductions, net_payable, payment_date, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, '2024-09-01', 'Paid')
        ON CONFLICT (id) DO UPDATE SET
            payment_type = EXCLUDED.payment_type,
            gross_amount = EXCLUDED.gross_amount,
            net_payable = EXCLUDED.net_payable,
            status = EXCLUDED.status;
    """, (TENANT, pay_id, real_exec_id, mb_id, pay_type, gross, deduct, net))

    # 8. Handover (if completed)
    if p["status"] == "completed":
        ho_id = f"ho-w{p['ward']}-{idx+1:02d}"
        cur.execute("""
            INSERT INTO proj_handovers (tenant_id, id, project_id, completion_date, total_expenditure, asset_generated_id, remarks)
            VALUES (%s, %s, %s, '2024-05-20', %s, %s, 'सार्वजनिक परीक्षण तथा सम्पत्ति अभिलेखीकरण सम्पन्न')
            ON CONFLICT (project_id) DO UPDATE SET
                completion_date = EXCLUDED.completion_date,
                total_expenditure = EXCLUDED.total_expenditure;
        """, (TENANT, ho_id, real_exec_id, p["paid"], f"ASSET-{p_code}"))

print("✓ Synced all 16 projects across all lifecycle tables (Proposals, Allocations, Procurement, Executions, MBs, Payments, Handovers).")

conn.commit()
cur.close()
conn.close()

print("\n=== Planning, Budgeting, Project Lifecycle & Procurement Seeding COMPLETED! ===")
