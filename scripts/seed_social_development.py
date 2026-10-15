"""
Seed Script: Social Development & Targeted Programs (सामाजिक विकास तथा लक्षित वर्ग)
Panchpokhari Thangpal Gaupalika, Sindhupalchok
Governed by:
  - Local Government Operation Act 2074 (Section 12 - Ward Committees, Section 24 - Social Inclusion)
  - Senior Citizens Act 2063
  - Rights of Persons with Disabilities Act 2074
  - Caste-Based Discrimination and Untouchability (Offence and Punishment) Act 2068

Populates:
  1. senior_citizen_data (8 wards, Wards 1 to 8)
  2. women_children_data (8 wards, Wards 1 to 8)
  3. disability_data (8 wards, Wards 1 to 8)
  4. dalit_data (8 wards, Wards 1 to 8)
  5. social_inclusion_records (16 targeted municipal inclusion interventions)
"""
import sys
import json
import psycopg2
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("Starting Social Development & Targeted Programs Seeding...")
TENANT = "panchpokhari"
FY = "२०८१/०८२"

# ---------------------------------------------------------------------------
# 1. SEED senior_citizen_data (Wards 1 to 8)
# ---------------------------------------------------------------------------
sc_data = [
    (
        "17100000-0000-0000-0000-000000000001", 1, 285, 250, 285, 142, 268, 1072000.0, 24, 32,
        "ज्येष्ठ नागरिक घुम्ती स्वास्थ्य शिविर, न्यानो कम्बल तथा पोषण वितरण कार्यक्रम",
        "भौगोलिक विकटताका कारण बैंकसम्म सामाजिक सुरक्षा भत्ता लिन जान कठिनाइ",
        "वडा कार्यालय तथा स्वास्थ्यकर्मी मार्फत घरदैलोमै पुगेर स्वास्थ्य जाँच तथा औषधि वितरण"
    ),
    (
        "17100000-0000-0000-0000-000000000002", 2, 215, 190, 215, 98, 195, 780000.0, 18, 26,
        "ह्योल्मो परम्परागत ज्येष्ठ नागरिक सम्मान तथा स्वास्थ्य स्याहार",
        "चिसो मौसममा दम तथा बाथरोगको प्रकोप",
        "न्यानो कपडा वितरण र स्थानीय स्वास्थ्य चौकीबाट निःशुल्क अक्सिजन तथा प्रेसर जाँच"
    ),
    (
        "17100000-0000-0000-0000-000000000003", 3, 245, 210, 245, 115, 230, 920000.0, 21, 28,
        "गुम्बा धार्मिक भजन कीर्तन तथा ज्येष्ठ नागरिक मिलन केन्द्र सञ्चालन",
        "एकल तथा असहाय वृद्धवृद्धाको स्याहारसुसार",
        "तार्केघ्याङमा ज्येष्ठ नागरिक दिवा सेवा केन्द्र स्थापना"
    ),
    (
        "17100000-0000-0000-0000-000000000004", 4, 310, 270, 310, 155, 292, 1168000.0, 26, 35,
        "मानेखर्क अस्पताल मार्फत ज्येष्ठ नागरिक निःशुल्क ओपीडी तथा ल्याब परीक्षण",
        "दीर्घरोगीहरूको नियमित औषधि आपूर्ति",
        "७० वर्ष माथिका सबैलाई निःशुल्क ल्याब टेस्ट र सुगर/प्रेसर औषधि उपलब्ध"
    ),
    (
        "17100000-0000-0000-0000-000000000005", 5, 230, 195, 230, 105, 218, 872000.0, 19, 24,
        "गाउँपालिकास्तरीय ज्येष्ठ नागरिक तीर्थाटन यात्रा तथा सम्मान",
        "हिउँदमा चिसोबाट जोगाउन न्यानो वासस्थानको अभाव",
        "८० वर्ष माथिका वृद्धवृद्धालाई घरमै पुगेर न्यानो ज्याकेट र हर्लिक्स वितरण"
    ),
    (
        "17100000-0000-0000-0000-000000000006", 6, 340, 290, 340, 172, 325, 1300000.0, 28, 38,
        "पालिका केन्द्र ज्येष्ठ नागरिक मिलन तथा योग अभ्यास केन्द्र",
        "मनोसामाजिक परामर्श तथा एक्लोपन व्यवस्थापन",
        "वडा नं. ६ मा नियमित योग तथा स्वास्थ्य परामर्श कक्षा सञ्चालन"
    ),
    (
        "17100000-0000-0000-0000-000000000007", 7, 295, 260, 295, 138, 278, 1112000.0, 22, 30,
        "तिपेनी बजार ज्येष्ठ नागरिक आँखा शिविर तथा मोतियाविन्दु निःशुल्क शल्यक्रिया",
        "दृष्टिदोष तथा कान नसुन्ने समस्या",
        "४५ जना ज्येष्ठ नागरिकको मोतियाविन्दु शल्यक्रिया तथा चस्मा वितरण सम्पन्न"
    ),
    (
        "17100000-0000-0000-0000-000000000008", 8, 260, 225, 260, 120, 245, 980000.0, 20, 27,
        "लागर्चे विपन्न ज्येष्ठ नागरिक राहत तथा खाद्यान्न पोषण सहायता",
        "दुर्गम गोरेटो बाटोका कारण आवागमनमा समस्या",
        "सबै वृद्धवृद्धालाई लौरो, टर्चलाइट र हर्लिक्स/च्यावनप्राश वितरण"
    ),
]

for r in sc_data:
    cur.execute("""
        INSERT INTO senior_citizen_data (
            tenant_id, id, "wardNumber", "fiscalYear", "totalBeneficiaries", "totalHouseholds",
            "totalSeniorCitizens", "seniorCitizensAbove75", "allowanceRecipients", "totalAllowanceAmount",
            "seniorCitizensWithDisability", "seniorCitizensAlone", programs, challenges, achievements,
            "dataCollectedBy", "dataCollectedAt", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            'महिला तथा बालबालिका शाखा', NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "wardNumber" = EXCLUDED."wardNumber",
            "fiscalYear" = EXCLUDED."fiscalYear",
            "totalBeneficiaries" = EXCLUDED."totalBeneficiaries",
            "totalHouseholds" = EXCLUDED."totalHouseholds",
            "totalSeniorCitizens" = EXCLUDED."totalSeniorCitizens",
            "seniorCitizensAbove75" = EXCLUDED."seniorCitizensAbove75",
            "allowanceRecipients" = EXCLUDED."allowanceRecipients",
            "totalAllowanceAmount" = EXCLUDED."totalAllowanceAmount",
            "seniorCitizensWithDisability" = EXCLUDED."seniorCitizensWithDisability",
            "seniorCitizensAlone" = EXCLUDED."seniorCitizensAlone",
            programs = EXCLUDED.programs,
            challenges = EXCLUDED.challenges,
            achievements = EXCLUDED.achievements,
            "updatedAt" = NOW();
    """, (
        TENANT, r[0], r[1], FY, r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12]
    ))
print(f"✓ Seeded {len(sc_data)} records into 'senior_citizen_data'.")

# ---------------------------------------------------------------------------
# 2. SEED women_children_data (Wards 1 to 8)
# ---------------------------------------------------------------------------
wc_data = [
    (
        "17200000-0000-0000-0000-000000000001", 1, 520, 310, 52, 68, 380, 840, 8, 65, 0, 2,
        "उपाध्यक्षसँग गर्भवती आमा पोषण प्याकेज, किशोरी सेनेटरी प्याड वितरण, महिला किबी जाम समूह",
        "कम उमेरमा विवाह गर्ने सामाजिक सोच र सुत्केरी स्याहारमा पोषण अभाव",
        "१००% संस्थागत सुत्केरी दर हासिल, किबी प्रशोधनबाट ५४ महिला स्वरोजगार"
    ),
    (
        "17200000-0000-0000-0000-000000000002", 2, 380, 220, 38, 45, 260, 620, 5, 42, 0, 1,
        "ह्योल्मो महिला हस्तकला तथा स्थानीय ऊनी गलैँचा बुनाई तालिम, बालविकास केन्द्र स्तरोन्नति",
        "दुर्गम बस्तीबाट विद्यालय आउने बालबालिकाको जोखिमपूर्ण यात्रा",
        "४ वटा प्रारम्भिक बालविकास केन्द्र (ECED) बालमैत्री रूपान्तरण"
    ),
    (
        "17200000-0000-0000-0000-000000000003", 3, 420, 250, 42, 50, 290, 680, 6, 58, 0, 1,
        "होमस्टे व्यवस्थापन, हस्पिटालिटी तथा डिजिटल मार्केटिङ महिला तालिम",
        "महिलाहरूमा वित्तीय साक्षरता र डिजिटल बैंकिङ ज्ञानको कमी",
        "५८ जना महिला व्यवसायी होमस्टे र स्थानीय हस्तकला बिक्रीमा सक्रिय"
    ),
    (
        "17200000-0000-0000-0000-000000000004", 4, 580, 340, 58, 72, 410, 920, 9, 74, 0, 3,
        "किशोरी आत्मरक्षा तालिम, बालविवाह विरुद्ध समुदाय सचेतना, सुरक्षित सेफ हाउस सञ्चालन",
        "घरेलु हिंसाका घटनाहरू समयमा उजुरी नहुनु",
        "मानेखर्क अस्पतालमा सुरक्षित प्रसूति र पोषण पुनर्स्थापना गृह सञ्चालन"
    ),
    (
        "17200000-0000-0000-0000-000000000005", 5, 360, 210, 36, 44, 270, 590, 5, 38, 0, 1,
        "अर्गानिक तरकारी टनेल खेती तथा बीउ अनुदान, सुनौलो १००० दिनका आमाहरूलाई अण्डा र गेडागुडी",
        "सुत्केरी महिलाहरूको स्वास्थ्य जाँचमा नियमितताको कमी",
        "कुपोषण दर शून्यमा झार्ने अभियान अन्तर्गत ३६ आमालाई नियमित पोषण प्याकेज"
    ),
    (
        "17200000-0000-0000-0000-000000000006", 6, 640, 380, 64, 80, 450, 1050, 7, 85, 0, 2,
        "महिला सहकारी सवलीकरण, सिलाइकटाइ तथा ब्युटिसियन एडभान्स तालिम, बाल क्लब परिचालन",
        "बजार क्षेत्रमा कामकाजी आमाहरूका लागि दिवा शिशु स्याहार केन्द्रको अभाव",
        "पालिका केन्द्रमा बाल क्लब सञ्जाल गठन र ८५ महिला उद्यमीलाई सहुलियत कर्जा सहजीकरण"
    ),
    (
        "17200000-0000-0000-0000-000000000007", 7, 500, 300, 50, 65, 360, 820, 8, 62, 0, 2,
        "तिपेनी बजार किशोरी सशक्तीकरण, महिनावारी स्वच्छता तथा पुनःप्रयोगयोग्य प्याड बनाउने तालिम",
        "सार्वजनिक स्थलहरूमा महिलामैत्री र स्तनपान कक्षको अभाव",
        "तिपेनी बसपार्क र वडा कार्यालयमा स्तनपान कक्ष स्थापना"
    ),
    (
        "17200000-0000-0000-0000-000000000008", 8, 440, 260, 44, 54, 310, 710, 6, 48, 0, 1,
        "लागर्चे दुर्गम बस्ती किशोरी छात्रवृत्ति, बालश्रम मुक्त वडा अभियान, महिला नेतृत्व विकास",
        "विद्यालय छाड्ने (Drop-out) दर न्यूनीकरणको चुनौती",
        "विपन्न परिवारका १०० जना छात्रालाई पूर्ण शैक्षिक छात्रवृत्ति वितरण"
    ),
]

for r in wc_data:
    cur.execute("""
        INSERT INTO women_children_data (
            tenant_id, id, "wardNumber", "fiscalYear", "totalBeneficiaries", "totalHouseholds",
            "pregnantWomen", "lactatingMothers", "childrenUnder5", "childrenInSchool",
            "malnourishedChildren", "womenEntrepreneurs", "childMarriageCases", "domesticViolenceCases",
            programs, challenges, achievements, "dataCollectedBy", "dataCollectedAt", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            'महिला तथा बालबालिका शाखा', NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "wardNumber" = EXCLUDED."wardNumber",
            "fiscalYear" = EXCLUDED."fiscalYear",
            "totalBeneficiaries" = EXCLUDED."totalBeneficiaries",
            "totalHouseholds" = EXCLUDED."totalHouseholds",
            "pregnantWomen" = EXCLUDED."pregnantWomen",
            "lactatingMothers" = EXCLUDED."lactatingMothers",
            "childrenUnder5" = EXCLUDED."childrenUnder5",
            "childrenInSchool" = EXCLUDED."childrenInSchool",
            "malnourishedChildren" = EXCLUDED."malnourishedChildren",
            "womenEntrepreneurs" = EXCLUDED."womenEntrepreneurs",
            "childMarriageCases" = EXCLUDED."childMarriageCases",
            "domesticViolenceCases" = EXCLUDED."domesticViolenceCases",
            programs = EXCLUDED.programs,
            challenges = EXCLUDED.challenges,
            achievements = EXCLUDED.achievements,
            "updatedAt" = NOW();
    """, (
        TENANT, r[0], r[1], FY, r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[14]
    ))
print(f"✓ Seeded {len(wc_data)} records into 'women_children_data'.")

# ---------------------------------------------------------------------------
# 3. SEED disability_data (Wards 1 to 8)
# ---------------------------------------------------------------------------
dis_data = [
    (
        "17300000-0000-0000-0000-000000000001", 1, 42, 38, 22, 6, 7, 4, 3, 35, 140000.0, 12, 8,
        "ह्विलचेयर तथा सहायक सामग्री वितरण, अपाङ्गता परिचयपत्र घुम्ती वितरण शिविर",
        "दुर्गम पहाडी भूगोलका कारण ह्विलचेयर गुडाउन असहज बाटो",
        "३५ जनालाई परिचयपत्र वितरण र ८ जनालाई स्थानीय बाख्रापालनबाट स्वरोजगार"
    ),
    (
        "17300000-0000-0000-0000-000000000002", 2, 32, 28, 16, 5, 6, 3, 2, 26, 104000.0, 9, 6,
        "सेतो छडी तथा कान सुन्ने मेसिन (Hearing Aid) वितरण",
        "विज्ञ चिकित्सक सहितको अपाङ्गता वर्गीकरण परीक्षणको अभाव",
        "२६ जना पूर्ण तथा अति अशक्त अपाङ्गता भत्ता कार्डधारक"
    ),
    (
        "17300000-0000-0000-0000-000000000003", 3, 36, 32, 18, 6, 6, 4, 2, 30, 120000.0, 10, 7,
        "अपाङ्गतामैत्री गुम्बा तथा सार्वजनिक स्थल निर्माण, सीपमूलक अगरबत्ती तथा मुमबत्ती तालिम",
        "बहिरा बालबालिकाका लागि दोभासे (Sign Language) शिक्षकको अभाव",
        "१० जना बालबालिकालाई विशेष छात्रवृत्ति तथा आवासीय सुविधा"
    ),
    (
        "17300000-0000-0000-0000-000000000004", 4, 48, 42, 24, 8, 9, 4, 3, 40, 160000.0, 14, 10,
        "मानेखर्क अस्पतालमा फिजियोथेरापी सेवा तथा निःशुल्क औषधि",
        "मानसिक तथा बौद्धिक अपाङ्गता भएका व्यक्तिको उचित पुनर्स्थापना",
        "नियमित फिजियोथेरापी सेवाबाट २४ जना पक्षघात र शारीरिक अपाङ्गता भएका बिरामी लाभान्वित"
    ),
    (
        "17300000-0000-0000-0000-000000000005", 5, 30, 26, 15, 5, 5, 3, 2, 25, 100000.0, 8, 5,
        "अपाङ्गता भएका व्यक्तिका अभिभावकहरूलाई मनोसामाजिक परामर्श",
        "सहायक सामग्री मर्मत केन्द्र नहुनु",
        "८ जना बालबालिकालाई विद्यालय आउन जान विशेष सहायता रकम"
    ),
    (
        "17300000-0000-0000-0000-000000000006", 6, 52, 45, 26, 9, 10, 4, 3, 44, 176000.0, 16, 12,
        "पालिकास्तरीय अपाङ्गता पुनःस्थापना केन्द्र, कम्प्युटर तथा मोबाइल तालिम",
        "सरकारी कार्यालयहरूमा र्याम्प र अपाङ्गतामैत्री शौचालयको पूर्णता",
        "१२ जना अपाङ्गता भएका युवाहरूलाई डिजिटल डाटा इन्ट्री तथा सञ्चार सीप"
    ),
    (
        "17300000-0000-0000-0000-000000000007", 7, 44, 39, 22, 7, 8, 4, 3, 36, 144000.0, 13, 9,
        "तिपेनी बजार व्यापार व्यवसाय गर्न अपाङ्गता भएका व्यक्तिहरूलाई बीउ पूँजी सहयोग",
        "सडक तथा बसपार्कमा दृष्टिविहीनका लागि ट्याक्टाइल ब्लक अभाव",
        "९ जनालाई खुद्रा पसल तथा टेलरिङ व्यवसायका लागि प्रति व्यक्ति रु. २५ हजार अनुदान"
    ),
    (
        "17300000-0000-0000-0000-000000000008", 8, 38, 34, 19, 6, 7, 4, 2, 32, 128000.0, 11, 7,
        "लागर्चे दुर्गम बस्ती अपाङ्गता भत्ता घरदैलो भुक्तानी सेवा",
        "बैंकसम्म पुग्न बोकेर लैजानुपर्ने बाध्यता",
        "वडा सचिव र बैंक कर्मचारी टोली मार्फत घरमै पुगेर भत्ता भुक्तानी"
    ),
]

for r in dis_data:
    cur.execute("""
        INSERT INTO disability_data (
            tenant_id, id, "wardNumber", "fiscalYear", "totalBeneficiaries", "totalHouseholds",
            "physicalDisability", "visualImpairment", "hearingImpairment", "intellectualDisability",
            "multipleDisabilities", "allowanceRecipients", "totalAllowanceAmount", "inSchool",
            employed, programs, challenges, achievements, "dataCollectedBy", "dataCollectedAt",
            "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            'अपाङ्गता समन्वय समिति', NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "wardNumber" = EXCLUDED."wardNumber",
            "fiscalYear" = EXCLUDED."fiscalYear",
            "totalBeneficiaries" = EXCLUDED."totalBeneficiaries",
            "totalHouseholds" = EXCLUDED."totalHouseholds",
            "physicalDisability" = EXCLUDED."physicalDisability",
            "visualImpairment" = EXCLUDED."visualImpairment",
            "hearingImpairment" = EXCLUDED."hearingImpairment",
            "intellectualDisability" = EXCLUDED."intellectualDisability",
            "multipleDisabilities" = EXCLUDED."multipleDisabilities",
            "allowanceRecipients" = EXCLUDED."allowanceRecipients",
            "totalAllowanceAmount" = EXCLUDED."totalAllowanceAmount",
            "inSchool" = EXCLUDED."inSchool",
            employed = EXCLUDED.employed,
            programs = EXCLUDED.programs,
            challenges = EXCLUDED.challenges,
            achievements = EXCLUDED.achievements,
            "updatedAt" = NOW();
    """, (
        TENANT, r[0], r[1], FY, r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[14], r[15]
    ))
print(f"✓ Seeded {len(dis_data)} records into 'disability_data'.")

# ---------------------------------------------------------------------------
# 4. SEED dalit_data (Wards 1 to 8)
# ---------------------------------------------------------------------------
dalit_data = [
    (
        "17400000-0000-0000-0000-000000000001", 1, 420, 85, 420, 85, 110, 110, 4, 0,
        "दलित विद्यार्थी विशेष छात्रवृत्ति, परम्परागत आरन व्यवसायमा आधुनिक ब्लोअर वितरण",
        "परम्परागत पेशामा आधुनिक प्रविधि र लगानीको अभाव",
        "११० जना दलित विद्यार्थीलाई १००% छात्रवृत्ति, आरन व्यवसायीलाई विद्युतीय ब्लोअर"
    ),
    (
        "17400000-0000-0000-0000-000000000002", 2, 240, 48, 240, 48, 62, 62, 2, 0,
        "दलित महिला बाख्रापालन अनुदान तथा स्वरोजगार सीप विकास",
        "भूगोलको दुर्गमता र जग्गाको स्वामित्व कम हुनु",
        "४८ घरधुरी दलित समुदायमा खानेपानी र विद्युतीकरण पूर्णता"
    ),
    (
        "17400000-0000-0000-0000-000000000003", 3, 180, 36, 180, 36, 48, 48, 2, 0,
        "परम्परागत बाजा संरक्षण तथा दलित युवा होटल व्यवस्थापन तालिम",
        "बजार क्षेत्रमा अवसरको कमी",
        "१० जना दलित युवालाई स्थानीय होटल तथा होमस्टेमा रोजगारी"
    ),
    (
        "17400000-0000-0000-0000-000000000004", 4, 510, 102, 510, 102, 135, 135, 5, 0,
        "मानेखर्क दलित सामुदायिक भवन निर्माण, सिलाइकटाइ आधुनिक मेसिन वितरण",
        "युवाहरूको वैदेशिक रोजगारीमा अत्यधिक निर्भरता",
        "आधुनिक जुत्ता सिलाउने मेसिन तथा सिलाइकटाइ तालिम सम्पन्न"
    ),
    (
        "17400000-0000-0000-0000-000000000005", 5, 290, 58, 290, 58, 75, 75, 3, 0,
        "दलित बालबालिकालाई निःशुल्क स्टेसनरी तथा विद्यालय पोशाक वितरण",
        "उच्च शिक्षा हासिल गर्ने विद्यार्थीको संख्या न्यून",
        "मावि तहमा अध्ययनरत सबै ७५ जनालाई पूर्ण शैक्षिक सहायता"
    ),
    (
        "17400000-0000-0000-0000-000000000006", 6, 620, 125, 620, 125, 160, 160, 6, 0,
        "पालिकास्तरीय भगत सर्वजित दलित छात्रवृत्ति तथा लोकसेवा तयारी कक्षा",
        "सार्वजनिक नेतृत्वमा दलित समुदायको सहभागिता वृद्धि गर्नु",
        "२५ जना दलित युवालाई लोकसेवा तथा शिक्षक सेवा आयोग निःशुल्क तयारी कक्षा"
    ),
    (
        "17400000-0000-0000-0000-000000000007", 7, 480, 96, 480, 96, 125, 125, 4, 0,
        "तिपेनी आरन क्लस्टर आधुनिकीकरण, विद्युत मिटर अनुदान, भाँडाकुँडा निर्माण",
        "कच्चा पदार्थ (कोइला र फलाम) को मूल्यवृद्धि",
        "आरन व्यवसायीलाई ५०% अनुदानमा आधुनिक वेल्डिङ तथा ग्राइन्डिङ मेसिन"
    ),
    (
        "17400000-0000-0000-0000-000000000008", 8, 350, 70, 350, 70, 90, 90, 3, 0,
        "लागर्चे विपन्न दलित बस्ती बाख्रापालन समूह तथा खोर निर्माण सहयोग",
        "आर्थिक अभावका कारण प्राविधिक शिक्षा अध्ययनमा बाधा",
        "३ जना दलित विद्यार्थीलाई सिभिल इन्जिनियरिङ सब-ओभरसियर छात्रवृत्ति"
    ),
]

for r in dalit_data:
    cur.execute("""
        INSERT INTO dalit_data (
            tenant_id, id, "wardNumber", "fiscalYear", "totalBeneficiaries", "totalHouseholds",
            "totalDalitPopulation", "dalitHouseholds", "dalitStudents", "scholarshipRecipients",
            "employedInGovernment", "discriminationCases", programs, challenges, achievements,
            "dataCollectedBy", "dataCollectedAt", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            'सामाजिक विकास शाखा', NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "wardNumber" = EXCLUDED."wardNumber",
            "fiscalYear" = EXCLUDED."fiscalYear",
            "totalBeneficiaries" = EXCLUDED."totalBeneficiaries",
            "totalHouseholds" = EXCLUDED."totalHouseholds",
            "totalDalitPopulation" = EXCLUDED."totalDalitPopulation",
            "dalitHouseholds" = EXCLUDED."dalitHouseholds",
            "dalitStudents" = EXCLUDED."dalitStudents",
            "scholarshipRecipients" = EXCLUDED."scholarshipRecipients",
            "employedInGovernment" = EXCLUDED."employedInGovernment",
            "discriminationCases" = EXCLUDED."discriminationCases",
            programs = EXCLUDED.programs,
            challenges = EXCLUDED.challenges,
            achievements = EXCLUDED.achievements,
            "updatedAt" = NOW();
    """, (
        TENANT, r[0], r[1], FY, r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12]
    ))
print(f"✓ Seeded {len(dalit_data)} records into 'dalit_data'.")

# ---------------------------------------------------------------------------
# 5. SEED social_inclusion_records (16 Targeted Programs)
# ---------------------------------------------------------------------------
si_records = [
    (
        "si-01", "women_children", 1, FY,
        "बासखर्क महिला उद्यमशीलता तथा किबी जाम/क्यान्डी उत्पादन समूह",
        "महिला उद्यमशीलता", "आर्थिक आत्मनिर्भरता", 54, 54, 0, None, "विपन्न तथा कृषक महिला",
        350000.0, 320000.0, "सरिता तामाङ", "९८४१२२३३४४",
        "बासखर्क मुख्य बजार", 27.8920, 85.5840, "completed",
        "अग्र्यानिक किबी प्रशोधन तथा लेबलिङ तालिम सम्पन्न",
        json.dumps({"group_name": "बासखर्क दिदीबहिनी समूह", "product": "किबी जाम र क्यान्डी"})
    ),
    (
        "si-02", "women_children", 2, FY,
        "बरुवा-मेलम्चीघ्याङ 'उपाध्यक्षसँग गर्भवती आमा' न्यानो पोषण कार्यक्रम",
        "सुरक्षित मातृत्व", "मातृ तथा बाल स्वास्थ्य", 45, 45, 0, None, "गर्भवती तथा सुत्केरी आमा",
        280000.0, 265000.0, "डोल्मा शेर्पा", "९८१२३४५६७८",
        "बरुवा स्वास्थ्य चौकी", 27.9880, 85.6310, "completed",
        "नियमित ४ पटक गर्भजाँच गर्ने आमाहरूलाई पोषण भत्ता र हर्लिक्स",
        json.dumps({"anc_visits": 4, "institutional_delivery": True})
    ),
    (
        "si-03", "women_children", 3, FY,
        "तार्केघ्याङ ह्योल्मो परम्परागत थान्का तथा ऊनी गलैँचा बुनाई तालिम",
        "परम्परागत सीप", "महिला उद्यमशीलता", 36, 36, 0, None, "ह्योल्मो महिला",
        320000.0, 300000.0, "दावा फुटी शेर्पा", "९८४१६६००८८",
        "तार्केघ्याङ गुम्बा परिसर", 27.9790, 85.6120, "completed",
        "परम्परागत प्राकृतिक रङ प्रयोग गरी थान्का तथा गलैँचा उत्पादन",
        json.dumps({"craft_type": "थङ्का पेन्टिङ र ऊनी गलैँचा", "trainees": 36})
    ),
    (
        "si-04", "women_children", 4, FY,
        "थाङपालकोट किशोरी आत्मरक्षा तालिम तथा निःशुल्क सेनेटरी प्याड वितरण",
        "किशोरी सशक्तीकरण", "प्रजनन् स्वास्थ्य", 180, 180, 0, None, "मावि तहका किशोरी",
        220000.0, 210000.0, "सुमित्रा खतिवडा", "९८०३४५६७८९",
        "थाङपालकोट मावि", 27.9610, 85.5980, "completed",
        "आत्मरक्षा मार्सल आर्ट तालिम र विद्यालयमा भेन्डिङ मेसिन जडान",
        json.dumps({"pads_distributed": 2500, "schools_covered": 3})
    ),
    (
        "si-05", "senior_citizen", 6, FY,
        "पाँचपोखरी ज्येष्ठ नागरिक निःशुल्क आँखा शिविर तथा मोतियाविन्दु शल्यक्रिया",
        "ज्येष्ठ नागरिक स्वास्थ्य", "शल्यक्रिया तथा उपचार", 240, 130, 110, None, "६८ वर्ष माथिका ज्येष्ठ नागरिक",
        450000.0, 435000.0, "डा. प्रभात श्रेष्ठ", "९८४१६६५५४४",
        "थाङपालधाप प्रा.स्वा.के.", 27.9350, 85.5820, "completed",
        "तिलगङ्गा आँखा प्रतिष्ठानको प्राविधिक सहयोगमा ४५ जनाको सफल शल्यक्रिया",
        json.dumps({"surgeries_done": 45, "glasses_provided": 180})
    ),
    (
        "si-06", "senior_citizen", 1, FY,
        "भोटेनाम्लाङ असहाय तथा एकल ज्येष्ठ नागरिक न्यानो कपडा तथा पोषण कार्यक्रम",
        "सामाजिक सुरक्षा", "स्याहार तथा पोषण", 65, 38, 27, None, "एकल असहाय वृद्धवृद्धा",
        200000.0, 195000.0, "माइला तामाङ", "९८४१२२३३४४",
        "भोटेनाम्लाङ वडा कार्यालय", 27.9142, 85.5721, "completed",
        "घरमै पुगेर न्यानो कम्बल, ज्याकेट, हर्लिक्स र प्रेसर औषधि वितरण",
        json.dumps({"blankets": 65, "health_kits": 65})
    ),
    (
        "si-07", "senior_citizen", 3, FY,
        "तार्केघ्याङ ज्येष्ठ नागरिक दिवा सेवा मिलन केन्द्र सञ्चालन",
        "सामाजिक पुनर्स्थापना", "मनोसामाजिक स्वास्थ्य", 45, 25, 20, None, "ह्योल्मो ज्येष्ठ नागरिक",
        250000.0, 220000.0, "दावा दोर्जे शेर्पा", "९८५१०१२३४५",
        "तार्केघ्याङ सामुदायिक भवन", 27.9785, 85.6135, "regular",
        "दैनिक भजन कीर्तन, धार्मिक पुस्तक अध्ययन र स्वास्थ्य जाँच",
        json.dumps({"daily_meals": True, "facilities": ["योग", "धार्मिक पाठ"]})
    ),
    (
        "si-08", "disability", 5, FY,
        "गुन्सा अपाङ्गता भएका व्यक्तिहरूलाई ह्विलचेयर तथा सहायक सामग्री वितरण",
        "अपाङ्गता पुनर्स्थापना", "सहायक सामग्री", 30, 12, 18, "क (रातो) र ख (नीलो)", "पूर्ण तथा अति अशक्त अपाङ्गता",
        300000.0, 285000.0, "ज्ञान बहादुर तामाङ", "९८५११२२३३०",
        "गुन्सा वडा कार्यालय", 27.9510, 85.5900, "completed",
        "१० थान ह्विलचेयर, ८ थान सेतो छडी र १२ थान कान सुन्ने मेसिन वितरण",
        json.dumps({"wheelchairs": 10, "hearing_aids": 12, "white_canes": 8})
    ),
    (
        "si-09", "disability", 4, FY,
        "मानेखर्क अस्पताल अपाङ्गता परिचयपत्र घुम्ती वितरण तथा स्वास्थ्य परीक्षण",
        "प्रशासनिक सेवा", "स्वास्थ्य प्रमाणीकरण", 48, 20, 28, "क/ख/ग/घ वर्ग", "अपाङ्गता भएका सबै नागरिक",
        180000.0, 170000.0, "इ. रमेश खड्का", "९८०३४५६७८९",
        "मानेखर्क आधारभूत अस्पताल", 27.9610, 85.5980, "completed",
        "विशेषज्ञ डाक्टर टोली मार्फत ४८ जनालाई तत्काल परिचयपत्र जारी",
        json.dumps({"red_card": 8, "blue_card": 18, "yellow_card": 14, "white_card": 8})
    ),
    (
        "si-10", "disability", 7, FY,
        "तिपेनी अपाङ्गता भएका युवाहरूलाई खुद्रा व्यवसाय बीउ पूँजी सहयोग",
        "आर्थिक सशक्तीकरण", "स्वरोजगार", 15, 6, 9, "ख र ग वर्ग", "युवा अपाङ्गता",
        375000.0, 375000.0, "टेक बहादुर तामाङ", "९८४१५५६६७७",
        "तिपेनी बजार", 27.9117, 85.5692, "completed",
        "प्रति व्यक्ति रु. २५,००० बीउ पूँजीबाट किराना र मोबाइल पसल सञ्चालन",
        json.dumps({"shops_opened": 15, "seed_money_per_person": 25000})
    ),
    (
        "si-11", "dalit", 7, FY,
        "तिपेनी परम्परागत आरन व्यवसाय आधुनिकीकरण तथा आधुनिक मेसिनरी वितरण",
        "परम्परागत पेशा संरक्षण", "प्रविधि हस्तान्तरण", 24, 0, 24, None, "दलित आरन व्यवसायी",
        480000.0, 460000.0, "सुकमान विक", "९८१२९८७६५४",
        "तिपेनी आरन टोल", 27.9100, 85.5670, "completed",
        "विद्युतीय ब्लोअर, वेल्डिङ मेसिन र ग्राइन्डर ५०% अनुदानमा हस्तान्तरण",
        json.dumps({"blowers_distributed": 24, "welders": 12})
    ),
    (
        "si-12", "dalit", 6, FY,
        "थाङपालधाप 'भगत सर्वजित' दलित प्राविधिक तथा उच्च शिक्षा विशेष छात्रवृत्ति",
        "शिक्षा विकास", "छात्रवृत्ति", 35, 18, 17, None, "दलित छात्रछात्रा",
        350000.0, 350000.0, "कमल श्रेष्ठ", "९८४१६६५५४४",
        "पालिका केन्द्र, थाङपालधाप", 27.9355, 85.5830, "completed",
        "इन्जिनियरिङ, स्वास्थ्य र स्नातक तहमा अध्ययनरत ३५ विद्यार्थीलाई छात्रवृत्ति",
        json.dumps({"amount_per_student": 10000, "technical_students": 12})
    ),
    (
        "si-13", "dalit", 4, FY,
        "मानेखर्क दलित महिला आधुनिक सिलाइकटाइ तथा बुटिक सीप विकास",
        "सीप विकास", "आयआर्जन", 30, 30, 0, None, "दलित महिला समूह",
        250000.0, 240000.0, "कमला विक", "९८५१०९८७६५",
        "मानेखर्क दलित सामुदायिक भवन", 27.9620, 85.5990, "completed",
        "३ महिने आधारभूत तथा एडभान्स सिलाइ तालिम सम्पन्न, ३० थान सिलाइ मेसिन वितरण",
        json.dumps({"sewing_machines": 30, "trained_women": 30})
    ),
    (
        "si-14", "economic", 8, FY,
        "लागर्चे प्रधानमन्त्री रोजगार कार्यक्रम (PMEP) १०० दिने सार्वजनिक रोजगारी",
        "सार्वजनिक रोजगारी", "गरिबी निवारण", 145, 68, 77, None, "विपन्न तथा बेरोजगार नागरिक",
        1850000.0, 1820000.0, "ईश्वर पाण्डे (रोजगार संयोजक)", "९८५१०१२३०९",
        "लागर्चे खोला गोरेटो तथा कुलो", 27.9710, 85.5890, "ongoing",
        "दैनिक रु. ६६८ ज्यालामा पदमार्ग मर्मत र सिँचाइ कुलो निर्माण कार्य",
        json.dumps({"daily_wage": 668, "days_worked": 85})
    ),
    (
        "si-15", "economic", 1, FY,
        "बासखर्क दलित तथा विपन्न बस्ती उन्नत बोयर बाख्रापालन तथा खोर सुधार",
        "कृषि तथा पशुपालन", "आयआर्जन", 40, 28, 12, None, "विपन्न कृषक परिवार",
        800000.0, 780000.0, "कृष्ण बहादुर गुरुङ", "९८४१७७८८९९",
        "बासखर्क दलित बस्ती", 27.8950, 85.5860, "completed",
        "प्रति परिवार २ उन्नत बोयर क्रस बाख्रा र रु. १० हजार खोर सुधार अनुदान",
        json.dumps({"goats_given": 80, "sheds_improved": 40})
    ),
    (
        "si-16", "marginalized", 8, FY,
        "लागर्चे परम्परागत तामाङ तथा ह्योल्मो डम्फु, सेलो बाजा र संस्कृति संरक्षण",
        "सांस्कृतिक संरक्षण", "कला तथा भाषा", 60, 32, 28, None, "आदिवासी जनजाति समुदाय",
        200000.0, 190000.0, "कान्छी माया तामाङ", "९८४१७७८८००",
        "लागर्चे सांस्कृतिक भवन", 27.9725, 85.5910, "completed",
        "परम्परागत डम्फु निर्माण तालिम र तामाङ सेलो नृत्य प्रशिक्षण कार्यक्रम",
        json.dumps({"damphus_made": 50, "youth_trained": 60})
    ),
]

for r in si_records:
    cur.execute("""
        INSERT INTO social_inclusion_records (
            tenant_id, id, category, "wardNumber", "fiscalYear", title, "serviceType", "subCategory",
            "beneficiariesCount", "femaleBeneficiaries", "maleBeneficiaries", "disabilityCardType",
            "targetGroup", "budgetAllocated", "budgetSpent", "coordinatorName", "coordinatorPhone",
            location, address, latitude, longitude, status, remarks, details, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, 'पाँचपोखरी थाङपाल गा.पा.', %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            category = EXCLUDED.category,
            "wardNumber" = EXCLUDED."wardNumber",
            "fiscalYear" = EXCLUDED."fiscalYear",
            "title" = EXCLUDED.title,
            "serviceType" = EXCLUDED."serviceType",
            "subCategory" = EXCLUDED."subCategory",
            "beneficiariesCount" = EXCLUDED."beneficiariesCount",
            "femaleBeneficiaries" = EXCLUDED."femaleBeneficiaries",
            "maleBeneficiaries" = EXCLUDED."maleBeneficiaries",
            "disabilityCardType" = EXCLUDED."disabilityCardType",
            "targetGroup" = EXCLUDED."targetGroup",
            "budgetAllocated" = EXCLUDED."budgetAllocated",
            "budgetSpent" = EXCLUDED."budgetSpent",
            "coordinatorName" = EXCLUDED."coordinatorName",
            "coordinatorPhone" = EXCLUDED."coordinatorPhone",
            location = EXCLUDED.location,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            status = EXCLUDED.status,
            remarks = EXCLUDED.remarks,
            details = EXCLUDED.details,
            "updatedAt" = NOW();
    """, (
        TENANT, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11],
        r[12], r[13], r[14], r[15], r[16], r[17], r[18], r[19], r[20], r[21]
    ))
print(f"✓ Seeded {len(si_records)} records into 'social_inclusion_records'.")

conn.commit()
cur.close()
conn.close()

print("\n=== Social Development & Targeted Programs Seeding COMPLETED SUCCESSFULLY! ===")
