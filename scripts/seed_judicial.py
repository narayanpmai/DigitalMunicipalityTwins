"""
Seed Script for Option 13: Judicial Committee & Mediation Management
(न्यायिक समिति तथा मेलमिलाप व्यवस्थापन)
Panchpokhari Thangpal Gaupalika (8 Wards)
Digital Twin System
"""

import sys
import json
import uuid
import datetime
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

DB_URI = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
TENANT_ID = "panchpokhari"


def seed_judicial_mediators(cur):
    """Seed 8 community mediators representing all 8 wards of Panchpokhari."""
    print("--- 1. Seeding judicial_mediators (8 ward mediators) ---")
    mediators = [
        (
            "31000000-0000-0000-0000-000000000001",
            "MED-P5-01",
            "अधिवक्ता कुल प्रसाद सापकोटा",
            1,
            "९८५१२३४५६७",
            "kul.sapkota@gmail.com",
            "मेलमिलाप परिषद् नेपाल (४८ घण्टे तालिम)",
            "MC-NP-२०७९-१४२",
            "साँध सिमाना तथा जग्गा विवाद",
            2, 14, "active"
        ),
        (
            "31000000-0000-0000-0000-000000000002",
            "MED-P5-02",
            "सुनिता लामा शेर्पा",
            2,
            "९८४१२२३३८८",
            "sunita.lama@gmail.com",
            "न्याय परिषद् तथा स्थानीय शासन सबलीकरण",
            "MC-NP-२०८०-०८९",
            "पारिवारिक, घरेलु तथा महिला सम्बन्धी विवाद",
            1, 19, "active"
        ),
        (
            "31000000-0000-0000-0000-000000000003",
            "MED-P5-03",
            "दावा दोर्जे शेर्पा",
            3,
            "९८६००११२२३",
            "dawa.dorje@gmail.com",
            "ह्योल्मो सांस्कृतिक मध्यस्थता तथा मेलमिलाप तालिम",
            "MC-NP-२०८०-१०४",
            "परम्परागत प्रथा, गुम्बा तथा कुलोपानी विवाद",
            2, 16, "active"
        ),
        (
            "31000000-0000-0000-0000-000000000004",
            "MED-P5-04",
            "रामेश्वर थाङपाली",
            4,
            "९८०८३३४४५५",
            "rameshwar@thangpal.org",
            "मेलमिलाप केन्द्र नेपाल",
            "MC-NP-२०८०-२१४",
            "कुलोपानी, बाटो निकास तथा ज्याला मजुरी",
            1, 11, "active"
        ),
        (
            "31000000-0000-0000-0000-000000000005",
            "MED-P5-05",
            "नन्द कुमारी गिरी",
            5,
            "९८४१५५२२३३",
            "nanda.giri@gmail.com",
            "राष्ट्रिय न्यायिक प्रतिष्ठान (NJA)",
            "MC-NP-२०८१-०१५",
            "ज्येष्ठ नागरिक पालनपोषण तथा पारिवारिक मेलमिलाप",
            1, 8, "active"
        ),
        (
            "31000000-0000-0000-0000-000000000006",
            "MED-P5-06",
            "ज्ञान बहादुर तामाङ",
            6,
            "९८५११४४५५६",
            "gyan.tamang@gmail.com",
            "सामुदायिक मेलमिलाप समाज नेपाल",
            "MC-NP-२०८१-०२८",
            "जग्गाको साँध, आली-कान्ला तथा वृक्षरोपण विवाद",
            2, 12, "active"
        ),
        (
            "31000000-0000-0000-0000-000000000007",
            "MED-P5-07",
            "पेम्बा छिरिङ शेर्पा",
            7,
            "९८५१२३९९००",
            "pemba.tshering@gmail.com",
            "उच्च हिमाली खर्क तथा सामुदायिक मध्यस्थता",
            "MC-NP-२०८०-३०५",
            "खर्क चरिचरन, चौंरी बाली नोक्सानी तथा गोठ विवाद",
            1, 9, "active"
        ),
        (
            "31000000-0000-0000-0000-000000000008",
            "MED-P5-08",
            "कान्छी माया तामाङ",
            8,
            "९८४१२२८८११",
            "kanchi.tamang@gmail.com",
            "स्थानीय विकास प्रशिक्षण प्रतिष्ठान (LDTA)",
            "MC-NP-२०८१-०४४",
            "सामुदायिक वन, खानेपानी मुहान तथा छिमेकी विवाद",
            1, 7, "active"
        )
    ]

    q = """
        INSERT INTO judicial_mediators (
            id, "mediatorCode", "fullName", "wardNo", phone, email,
            "trainingInstitute", "certificateNo", specialization,
            "activeCasesCount", "resolvedCasesCount", status, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT ("mediatorCode") DO UPDATE SET
            "fullName" = EXCLUDED."fullName",
            "wardNo" = EXCLUDED."wardNo",
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            "trainingInstitute" = EXCLUDED."trainingInstitute",
            "certificateNo" = EXCLUDED."certificateNo",
            specialization = EXCLUDED.specialization,
            "activeCasesCount" = EXCLUDED."activeCasesCount",
            "resolvedCasesCount" = EXCLUDED."resolvedCasesCount",
            status = EXCLUDED.status,
            "updatedAt" = NOW();
    """
    for m in mediators:
        cur.execute(q, m)
    print(f"  Inserted/Updated {len(mediators)} judicial mediators.")


def seed_judicial_cases(cur):
    """Seed 16 comprehensive and legally authentic judicial cases across all 8 wards."""
    print("--- 2. Seeding judicial_cases (16 cases across 8 wards) ---")
    
    cases = [
        # Ward 1 (बाँसखर्क)
        {
            "id": "32000000-0000-0000-0000-000000000001",
            "caseNo": "न्या.वि.-०१/२०८१-०१",
            "title": "साँध सिमाना तथा बाटो निकास सम्बन्धी विवाद",
            "disputeType": "साँध सिमाना / जग्गा विवाद (Boundary Dispute)",
            "status": "फैसला भएको (Decided)",
            "wardNumber": 1,
            "complainantName": "दोर्जे तामाङ",
            "complainantPhone": "९८४११०१००१",
            "complainantAddress": "पाँचपोखरी थाङपाल-१, बाँसखर्क",
            "complainantCitizenship": "२७-०१-७२-००१०१",
            "respondentName": "राम कान्छा तामाङ",
            "respondentPhone": "९८४११०१००५",
            "respondentAddress": "पाँचपोखरी थाङपाल-१, बाँसखर्क",
            "respondentCitizenship": "२७-०१-७०-००१०५",
            "disputedKittaNo": "कित्ता नं. २१४ र २१५",
            "claimDetails": "मेरो भोगचलनमा रहेको कित्ता नं. २१४ को पश्चिमतर्फको आली भत्काई प्रतिवादीले करिब २ हात जग्गा मिचेर सुन्तलाको बिरुवा रोपेको र ऐतिहासिक बाटो अवरुद्ध गरेकोले साँध छुट्याई बाटो खुला गरिपाऊँ।",
            "respondentStatement": "मैले आफ्नो लालपुर्जाको क्षेत्रफलभित्रै सुन्तला रोपेको हुँ। बाटो बन्द गर्ने कुनै मनसाय थिएन, नापजाँच गरी साँध यकिन गर्न मञ्जुर छु।",
            "filingDateBs": "२०८१-०३-१५",
            "noticeIssuedDateBs": "२०८१-०३-२०",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-01",
            "mediatorName": "अधिवक्ता कुल प्रसाद सापकोटा",
            "reconciliationNotes": "नापी प्राविधिक (अमिन) सहितको स्थलगत नापजाँच सम्पन्न। दुवै पक्ष बीच ३ फिटको निकास बाटो छाड्ने र साबिक साँध कायम गर्ने सहमति।",
            "verdict": "स्थानीय अमिनको नापजाँच प्रतिवेदन अनुसार साबिकको साँधमा ढुङ्गा गाडी किल्ला कायम गर्ने र दुवै पक्षको सहमतिमा ३ फिट बाटो खुला राख्ने गरी मिलापत्र प्रमाणित गरियो।",
            "verdictDateBs": "२०८१-०४-२२",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "दुवै पक्षले साबिक साँध स्वीकार गर्ने, ३ फिट बाटो कायम गर्ने, र भविष्यमा विवाद नगर्ने।",
                "settledDateBs": "२०८१-०४-२२",
                "witnesses": ["वडा अध्यक्ष, वडा नं. १", "नापी अमिन"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०३-२८",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी र मेलमिलापकर्ता",
                    "summary": "दुवै पक्षको प्रारम्भिक भनाइ सुनियो, स्थलगत अमिन खटाउने आदेश।",
                    "status": "order_issued"
                },
                {
                    "hearingNo": 2,
                    "dateBs": "२०८१-०४-१५",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी, अमिन र मेलमिलापकर्ता",
                    "summary": "अमिन प्रतिवेदन पेश, मिलापत्रको मस्यौदा तयार।",
                    "status": "settlement_drafted"
                }
            ],
            "evidenceDocuments": ["लालपुर्जा प्रतिलिपि", "अमिन नापजाँच नक्सा", "नागरिकता प्रतिलिपि"]
        },
        {
            "id": "32000000-0000-0000-0000-000000000002",
            "caseNo": "न्या.वि.-०१/२०८१-०२",
            "title": "कुलोपानी तथा सिँचाइ निकास सम्बन्धी विवाद",
            "disputeType": "कुलोपानी तथा सिँचाइ निकास (Canal/Irrigation Dispute)",
            "status": "मेलमिलाप प्रक्रियामा (In Mediation)",
            "wardNumber": 1,
            "complainantName": "कृष्ण प्रसाद दङ्गाल",
            "complainantPhone": "९८४११०१००३",
            "complainantAddress": "पाँचपोखरी थाङपाल-१, बाँसखर्क",
            "complainantCitizenship": "२७-०१-६८-००१०३",
            "respondentName": "सुनिता दनुवार",
            "respondentPhone": "९८४११०१००४",
            "respondentAddress": "पाँचपोखरी थाङपाल-१, बाँसखर्क",
            "respondentCitizenship": "२७-०१-७६-००१०४",
            "disputedKittaNo": "कित्ता नं. ८८ र ९१",
            "claimDetails": "वर्षौंदेखि चल्दै आएको ठाडो कुलोको पानी प्रतिवादीले आफ्नो धानखेततर्फ मोडेर मेरो फलफूल बगानमा पानी आउन नदिएकोले पालो अनुसार पानी पाउँ।",
            "respondentStatement": "धान रोप्ने सिजन भएकाले पानी बढी चाहिएको हो, पालो प्रणाली बाँध्न सहमत छु।",
            "filingDateBs": "२०८१-०५-१०",
            "noticeIssuedDateBs": "२०८१-०५-१४",
            "nextHearingDateBs": "२०८१-०६-२५",
            "assignedMediatorId": "MED-P5-01",
            "mediatorName": "अधिवक्ता कुल प्रसाद सापकोटा",
            "reconciliationNotes": "हप्ताको २ दिन वादीको बगानमा र ५ दिन प्रतिवादीको खेतमा पानी लैजाने सहमति मस्यौदामा छलफल जारी।",
            "verdict": "",
            "verdictDateBs": "",
            "presidedBy": "उपाध्यक्ष / संयोजक",
            "finalSettlement": None,
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०५-२२",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी",
                    "summary": "मेलमिलापकर्तालाई जिम्मा दिई पानीको समयतालिका बनाउन निर्देशन।",
                    "status": "referred_to_mediator"
                }
            ],
            "evidenceDocuments": ["सिँचाइ उपभोक्ता समिति दर्ता", "स्थलगत मुचुल्का"]
        },

        # Ward 2 (बरुवा)
        {
            "id": "32000000-0000-0000-0000-000000000003",
            "caseNo": "न्या.वि.-०२/२०८१-०३",
            "title": "घरपालुवा पशुपन्छीले बालीनाली नोक्सानी गरेको क्षतिपूर्ति दाबी",
            "disputeType": "बालीनाली नोक्सानी / पशु चौपाया विवाद (Crop Damage by Livestock)",
            "status": "फैसला भएको (Decided)",
            "wardNumber": 2,
            "complainantName": "सूर्य बहादुर थपलिया",
            "complainantPhone": "९८४११०२००१",
            "complainantAddress": "पाँचपोखरी थाङपाल-२, बरुवा",
            "complainantCitizenship": "२७-०१-६९-००२०१",
            "respondentName": "पासाङ तामाङ",
            "respondentPhone": "९८४११०२००३",
            "respondentAddress": "पाँचपोखरी थाङपाल-२, बरुवा",
            "respondentCitizenship": "२७-०१-७१-००२०३",
            "disputedKittaNo": "कित्ता नं. ५०४",
            "claimDetails": "प्रतिवादीका बाख्रा र भैँसीले मेरो कित्ता नं. ५०४ मा लगाएको हिउँदे आलु र मकैबाली खाएर करिब रु २५,००० बराबरको क्षति पुर्याएकाले क्षतिपूर्ति दिलाई पाऊँ।",
            "respondentStatement": "गोठको बार भत्किएर आकस्मिक रूपमा पशु पसेका हुन्, उचित क्षतिपूर्ति व्यहोर्न तयार छु।",
            "filingDateBs": "२०८१-०४-०२",
            "noticeIssuedDateBs": "२०८१-०४-०६",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-02",
            "mediatorName": "सुनिता लामा शेर्पा",
            "reconciliationNotes": "कृषि प्राविधिकको मूल्यांकन अनुसार रु १२,००० क्षति भएको यकिन। प्रतिवादीले उक्त रकम बुझाउन मञ्जुर।",
            "verdict": "प्रतिवादीले वादीलाई क्षतिपूर्ति बापत रु १२,००० एकमुष्ट भुक्तानी गर्ने र आफ्नो गोठको बार तत्काल मर्मत गरी पशु सुरक्षित राख्ने गरी मिलापत्र प्रमाणीकरण गरियो।",
            "verdictDateBs": "२०८१-०४-१८",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "रु १२,००० क्षतिपूर्ति बुझाइएको, गोठ बार मर्मत गर्ने प्रतिवद्धता।",
                "settledDateBs": "२०८१-०४-१८",
                "witnesses": ["वडा सदस्य, वडा नं. २", "कृषि प्राविधिक"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०४-१०",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी, कृषि प्राविधिक",
                    "summary": "क्षतिको मूल्यांकन पेश भयो र क्षतिपूर्ति रकम सहमति भयो।",
                    "status": "completed"
                }
            ],
            "evidenceDocuments": ["कृषि प्राविधिक क्षति मुचुल्का", "भरपाई रसिद"]
        },
        {
            "id": "32000000-0000-0000-0000-000000000004",
            "caseNo": "न्या.वि.-०२/२०८१-०४",
            "title": "पारिवारिक पालनपोषण तथा अंश विवाद",
            "disputeType": "पारिवारिक / घरेलु विवाद (Family & Domestic Maintenance)",
            "status": "इजलास सुनुवाइमा (In Hearing)",
            "wardNumber": 2,
            "complainantName": "लक्ष्मी पौडेल",
            "complainantPhone": "९८४११०२००२",
            "complainantAddress": "पाँचपोखरी थाङपाल-२, बरुवा",
            "complainantCitizenship": "२७-०१-७४-००२०२",
            "respondentName": "कान्छा मान श्रेष्ठ",
            "respondentPhone": "९८४११०२००५",
            "respondentAddress": "पाँचपोखरी थाङपाल-२, बरुवा",
            "respondentCitizenship": "२७-०१-६७-००२०५",
            "disputedKittaNo": "-",
            "claimDetails": "ज्येष्ठ नागरिक आमाको खानपान र औषधि उपचारको जिम्मेवारी नलिई प्रतिवादीले हेरचाह नगरेको हुँदा मासिक पालनपोषण खर्च भराई पाऊँ।",
            "respondentStatement": "म आमालाई सम्मान गर्दछु तर आर्थिक कठिनाइका कारण मासिक रु २,००० मात्र दिन सक्छु।",
            "filingDateBs": "२०८१-०५-१८",
            "noticeIssuedDateBs": "२०८१-०५-२२",
            "nextHearingDateBs": "२०८१-०६-२८",
            "assignedMediatorId": "MED-P5-02",
            "mediatorName": "सुनिता लामा शेर्पा",
            "reconciliationNotes": "दुई छोराहरू बीच समान रूपमा मासिक रु ३,५०० का दरले आमाको बैंक खातामा जम्मा गर्ने विषयमा छलफल भइरहेको।",
            "verdict": "",
            "verdictDateBs": "",
            "presidedBy": "उपाध्यक्ष / संयोजक",
            "finalSettlement": None,
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०६-०५",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी",
                    "summary": "आमाको मासिक औषधि खर्च विवरण पेश गर्न आदेश।",
                    "status": "order_issued"
                }
            ],
            "evidenceDocuments": ["ज्येष्ठ नागरिक परिचयपत्र", "औषधि बिल"]
        },

        # Ward 3 (मानेखर्क / तार्केघ्याङ)
        {
            "id": "32000000-0000-0000-0000-000000000005",
            "caseNo": "न्या.वि.-०३/२०८१-०५",
            "title": "प्राचीन पदमार्ग तथा घोडेटो बाटो अवरोध खुलाउने सम्बन्धी",
            "disputeType": "बाटो निकास तथा सार्वजनिक मार्ग (Right of Way/Path Dispute)",
            "status": "फैसला भएको (Decided)",
            "wardNumber": 3,
            "complainantName": "दावा छिरिङ शेर्पा",
            "complainantPhone": "९८४११०३००१",
            "complainantAddress": "पाँचपोखरी थाङपाल-३, मानेखर्क",
            "complainantCitizenship": "२७-०१-६५-००३०१",
            "respondentName": "गगन बहादुर तामाङ",
            "respondentPhone": "९८४११०३००३",
            "respondentAddress": "पाँचपोखरी थाङपाल-३, मानेखर्क",
            "respondentCitizenship": "२७-०१-७०-००३०३",
            "disputedKittaNo": "कित्ता नं. १२५",
            "claimDetails": "तार्केघ्याङ जाने पुरानो पदमार्गको छेउमा प्रतिवादीले ढुङ्गा थुपारेर पदयात्री र खच्चड हिँड्ने बाटो साँघुरो बनाएकाले बाटो खाली गराई पाऊँ।",
            "respondentStatement": "घर मर्मतको लागि ढुङ्गा राखेको थिएँ, तुरुन्तै अन्यत्र सारेर बाटो खुला गरिदिन्छु।",
            "filingDateBs": "२०८१-०३-०८",
            "noticeIssuedDateBs": "२०८१-०३-१२",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-03",
            "mediatorName": "दावा दोर्जे शेर्पा",
            "reconciliationNotes": "स्थलगत निरीक्षण सम्पन्न, प्रतिवादीले ७ दिनभित्र सबै ढुङ्गा हटाएर ६ फिट बाटो सफा गर्ने लिखित सहमति।",
            "verdict": "प्रतिवादीले ७ दिनभित्र बाटोमा थुपारिएको निर्माण सामग्री हटाई साबिकको ६ फिट चौडाइको पदमार्ग सञ्चालनमा ल्याउने गरी मिलापत्र प्रमाणित गरियो।",
            "verdictDateBs": "२०८१-०३-२५",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "ढुङ्गा हटाइएको, ६ फिट बाटो खुला, पदयात्रीलाई सहज बनाइएको।",
                "settledDateBs": "२०८१-०३-२५",
                "witnesses": ["वडा अध्यक्ष, वडा नं. ३", "स्थानीय पर्यटन व्यवसायी"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०३-१८",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी, स्थानीय बासिन्दा",
                    "summary": "बाटो खाली गर्न ७ दिनको म्याद दिइयो।",
                    "status": "completed"
                }
            ],
            "evidenceDocuments": ["तस्बिरहरू", "स्थानीय मुचुल्का"]
        },
        {
            "id": "32000000-0000-0000-0000-000000000006",
            "caseNo": "न्या.वि.-०३/२०८१-०६",
            "title": "ज्याला मजुरी भुक्तानी सम्बन्धी विवाद",
            "disputeType": "ज्याला मजुरी / श्रम विवाद (Unpaid Wage Dispute)",
            "status": "मेलमिलाप सम्पन्न (Settled via Mediation)",
            "wardNumber": 3,
            "complainantName": "रीता माया मिजार",
            "complainantPhone": "९८४११०३००४",
            "complainantAddress": "पाँचपोखरी थाङपाल-३, मानेखर्क",
            "complainantCitizenship": "२७-०१-७६-००३०४",
            "respondentName": "निमा तेन्जिङ लामा",
            "respondentPhone": "९८४११०३००५",
            "respondentAddress": "पाँचपोखरी थाङपाल-३, मानेखर्क",
            "respondentCitizenship": "२७-०१-६६-००३०५",
            "disputedKittaNo": "-",
            "claimDetails": "प्रतिवादीको किवी बगान र पर्खाल निर्माणमा ३५ दिन काम गरेको ज्याला बापतको रु ३५,००० नदिएकोले ज्याला दिलाई पाऊँ।",
            "respondentStatement": "काम सम्पन्न भएपछि हिसाब गर्न बाँकी थियो, म रकम भुक्तान गर्न तयार छु।",
            "filingDateBs": "२०८१-०४-२८",
            "noticeIssuedDateBs": "२०८१-०५-०२",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-03",
            "mediatorName": "दावा दोर्जे शेर्पा",
            "reconciliationNotes": "मेलमिलाप कक्षमा दुई पक्ष बीच रु ३५,००० मध्ये रु २०,००० तत्काल र बाँकी रु १५,००० आगामी महिनाभित्र चुक्ता गर्ने लिखित सहमति।",
            "verdict": "प्रतिवादीले वादीलाई बक्यौता ज्याला रु ३५,००० दुई किस्तामा चुक्ता गर्ने र वादीले काम सन्तोषजनक भएको प्रमाणित गर्ने गरी मिलापत्र प्रमाणित।",
            "verdictDateBs": "२०८१-०५-१५",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "रु २०,००० तत्काल भुक्तान, बाँकी रु १५,००० असोज मसान्तभित्र बुझाउने।",
                "settledDateBs": "२०८१-०५-१५",
                "witnesses": ["मेलमिलापकर्ता", "न्यायिक समिति सचिव"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०५-१०",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी",
                    "summary": "हिसाब मिलान गरी मिलापत्र सम्पन्न।",
                    "status": "completed"
                }
            ],
            "evidenceDocuments": ["काम गरेको हाजिरी डायरी", "भरपाई"]
        },

        # Ward 4 (थाङपालधाप)
        {
            "id": "32000000-0000-0000-0000-000000000007",
            "caseNo": "न्या.वि.-०४/२०८१-०७",
            "title": "घरभाडा तथा पसल कवल खाली गराउने सम्बन्धी",
            "disputeType": "घरभाडा / बहाल विवाद (House Rent Dispute)",
            "status": "फैसला भएको (Decided)",
            "wardNumber": 4,
            "complainantName": "बिष्णु प्रसाद सापकोटा",
            "complainantPhone": "९८४११०४००१",
            "complainantAddress": "पाँचपोखरी थाङपाल-४, थाङपालधाप",
            "complainantCitizenship": "२७-०१-६३-००४०१",
            "respondentName": "हरि भक्त चौलागाई",
            "respondentPhone": "९८४११०४००३",
            "respondentAddress": "पाँचपोखरी थाङपाल-४, थाङपालधाप",
            "respondentCitizenship": "२७-०१-६८-००४०३",
            "disputedKittaNo": "कित्ता नं. ४४२",
            "claimDetails": "प्रतिवादीले विगत ६ महिनादेखि पसलको भाडा नबुझाएको र सम्झौता अवधि सकिए पनि कवल खाली नगरेकोले बक्यौता भाडा रु ४८,००० दिलाई पसल खाली गराई पाऊँ।",
            "respondentStatement": "व्यापार मन्दीका कारण भाडा तिर्न ढिलाइ भएको हो, किस्ताबन्दीमा भाडा तिरी ३ महिनाभित्र पसल सार्नेछु।",
            "filingDateBs": "२०८१-०२-१२",
            "noticeIssuedDateBs": "२०८१-०२-१६",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-04",
            "mediatorName": "रामेश्वर थाङपाली",
            "reconciliationNotes": "दुवै पक्षको सहमतिमा बक्यौता भाडा रु ४०,००० मा सम्झौता र २ महिनाभित्र पसल खाली गर्ने समयसीमा निर्धारण।",
            "verdict": "प्रतिवादीले रु ४०,००० भाडा दुई किस्तामा बुझाउने र २०८१ साउन मसान्तभित्र पसल कवल खाली गरी घरधनीलाई बुझाउने गरी मिलापत्र सदर गरियो।",
            "verdictDateBs": "२०८१-०३-१४",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "रु ४०,००० भाडा चुक्ता, पसल कवल खाली सम्पन्न।",
                "settledDateBs": "२०८१-०३-१४",
                "witnesses": ["वडा अध्यक्ष, वडा नं. ४", "उद्योग वाणिज्य संघ प्रतिनिधि"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०२-२५",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी",
                    "summary": "भाडा सम्झौता कागजात अध्ययन, मिलापत्र छलफल।",
                    "status": "completed"
                }
            ],
            "evidenceDocuments": ["घरबहाल सम्झौता पत्र", "बैंक भौचर"]
        },
        {
            "id": "32000000-0000-0000-0000-000000000008",
            "caseNo": "न्या.वि.-०४/२०८१-०८",
            "title": "आली-कान्ला भत्काई माटो पुरेको क्षति सम्बन्धी",
            "disputeType": "साँध सिमाना / जग्गा विवाद (Boundary Dispute)",
            "status": "नयाँ दर्ता (Registered)",
            "wardNumber": 4,
            "complainantName": "राधिका अधिकारी",
            "complainantPhone": "९८४११०४००२",
            "complainantAddress": "पाँचपोखरी थाङपाल-४, थाङपालधाप",
            "complainantCitizenship": "२७-०१-७२-००४०२",
            "respondentName": "बलराम तिमल्सिना",
            "respondentPhone": "९८४११०४००५",
            "respondentAddress": "पाँचपोखरी थाङपाल-४, थाङपालधाप",
            "respondentCitizenship": "२७-०१-६४-००४०५",
            "disputedKittaNo": "कित्ता नं. ३०५",
            "claimDetails": "प्रतिवादीले सडक खन्ने क्रममा मेरो खेतको कान्लो भत्काई माटो खेतमा थुपारिदिएकाले खेत सफा गरी ग्याबिन जाली लगाइपाऊँ।",
            "respondentStatement": "",
            "filingDateBs": "२०८१-०६-०१",
            "noticeIssuedDateBs": "२०८१-०६-०५",
            "nextHearingDateBs": "२०८१-०६-२६",
            "assignedMediatorId": "MED-P5-04",
            "mediatorName": "रामेश्वर थाङपाली",
            "reconciliationNotes": "प्रतिवादीलाई म्याद जारी गरिएको, स्थलगत प्राविधिक निरीक्षण तय।",
            "verdict": "",
            "verdictDateBs": "",
            "presidedBy": "उपाध्यक्ष / संयोजक",
            "finalSettlement": None,
            "hearings": [],
            "evidenceDocuments": ["उजुरी निवेदन", "नागरिकता", "फोटो"]
        },

        # Ward 5 (गुन्सा)
        {
            "id": "32000000-0000-0000-0000-000000000009",
            "caseNo": "न्या.वि.-०५/२०८१-०९",
            "title": "अलैंची बगानमा रुखको छायाँ र जरा सम्बन्धी विवाद",
            "disputeType": "रुखको हाँगा/छायाँ तथा बाली नोक्सानी (Tree/Crop Nuisance)",
            "status": "फैसला भएको (Decided)",
            "wardNumber": 5,
            "complainantName": "तारा बहादुर तामाङ",
            "complainantPhone": "९८४११०५००१",
            "complainantAddress": "पाँचपोखरी थाङपाल-५, गुन्सा",
            "complainantCitizenship": "२७-०१-६७-००५०१",
            "respondentName": "कर्मा वाङ्गेल लामा",
            "respondentPhone": "९८४११०५००५",
            "respondentAddress": "पाँचपोखरी थाङपाल-५, गुन्सा",
            "respondentCitizenship": "२७-०१-६९-००५०५",
            "disputedKittaNo": "कित्ता नं. १८०",
            "claimDetails": "प्रतिवादीको साँधमा रहेका उत्तीस र सल्लाका अग्ला रुखहरूको हाँगा मेरो अलैंची बगानमा फैलिई घाम छेकेको र उत्पादन घटेकाले हाँगा काटिपाऊँ।",
            "respondentStatement": "आफ्नो जग्गाको रुख भए पनि छिमेकीको बालीमा असर परेको सत्य हो, हाँगा काँटछाँट गर्न म तयार छु।",
            "filingDateBs": "२०८१-०३-२२",
            "noticeIssuedDateBs": "२०८१-०३-२६",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-05",
            "mediatorName": "नन्द कुमारी गिरी",
            "reconciliationNotes": "स्थलगत निरीक्षण गरी साँधबाट १० फिट भित्रका सबै फैलिएका हाँगा १५ दिनभित्र काट्ने सहमति।",
            "verdict": "प्रतिवादीले आफ्नो जग्गामा रहेका रुखहरूको वादीको अलैंची बगानतर्फ फैलिएका हाँगाहरू १५ दिनभित्र काँटछाँट गरी बाली संरक्षण गर्नुपर्ने गरी मिलापत्र सदर।",
            "verdictDateBs": "२०८१-०४-१२",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "हाँगा काँटछाँट सम्पन्न, अलैंची बगानमा घाम लागेको प्रमाणीकरण।",
                "settledDateBs": "२०८१-०४-१२",
                "witnesses": ["वडा सदस्य, वडा नं. ५", "स्थानीय वन समूह अध्यक्ष"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०४-०५",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी",
                    "summary": "हाँगा काट्ने मिति तय गरियो।",
                    "status": "completed"
                }
            ],
            "evidenceDocuments": ["स्थलगत फोटो", "नागरिकता प्रतिलिपि"]
        },
        {
            "id": "32000000-0000-0000-0000-000000000010",
            "caseNo": "न्या.वि.-०५/२०८१-१०",
            "title": "खानेपानी मुहान र पाइपलाइन क्षति सम्बन्धी विवाद",
            "disputeType": "खानेपानी मुहान तथा पाइपलाइन विवाद (Drinking Water Dispute)",
            "status": "मेलमिलाप प्रक्रियामा (In Mediation)",
            "wardNumber": 5,
            "complainantName": "माया देवी गिरी",
            "complainantPhone": "९८४११०५००२",
            "complainantAddress": "पाँचपोखरी थाङपाल-५, गुन्सा",
            "complainantCitizenship": "२७-०१-७४-००५०२",
            "respondentName": "सोनाम शेर्पा",
            "respondentPhone": "९८४११०५००३",
            "respondentAddress": "पाँचपोखरी थाङपाल-५, गुन्सा",
            "respondentCitizenship": "२७-०१-७१-००५०३",
            "disputedKittaNo": "-",
            "claimDetails": "प्रतिवादीले घर निर्माण गर्दा हाम्रो टोलमा आउने खानेपानीको मुख्य पोलिथिन पाइप काटिदिएकाले पानी आपूर्ति बन्द भएको हुँदा पाइप मर्मत गराई पाऊँ।",
            "respondentStatement": "ट्र्याक्टर गुड्दा अन्जानमा पाइप च्यापिएको हो, म नयाँ पाइप किनेर जोडिदिन्छु।",
            "filingDateBs": "२०८१-०५-२५",
            "noticeIssuedDateBs": "२०८१-०५-२८",
            "nextHearingDateBs": "२०८१-०६-२७",
            "assignedMediatorId": "MED-P5-05",
            "mediatorName": "नन्द कुमारी गिरी",
            "reconciliationNotes": "प्रतिवादीले १०० मिटर १ इन्चको पाइप किनेर स्थानीय उपभोक्ता समितिको रोहबरमा जडान गर्ने तयारी।",
            "verdict": "",
            "verdictDateBs": "",
            "presidedBy": "उपाध्यक्ष / संयोजक",
            "finalSettlement": None,
            "hearings": [],
            "evidenceDocuments": ["खानेपानी उपभोक्ता समिति पत्र", "मुचुल्का"]
        },

        # Ward 6 (थाङपालकोट)
        {
            "id": "32000000-0000-0000-0000-000000000011",
            "caseNo": "न्या.वि.-०६/२०८१-११",
            "title": "ऐतिहासिक साँध सिमाना तथा ढुङ्गे पर्खाल सम्बन्धी विवाद",
            "disputeType": "साँध सिमाना / जग्गा विवाद (Boundary Dispute)",
            "status": "फैसला भएको (Decided)",
            "wardNumber": 6,
            "complainantName": "फुर्वा तसेरिङ शेर्पा",
            "complainantPhone": "९८४११०६००१",
            "complainantAddress": "पाँचपोखरी थाङपाल-६, थाङपालकोट",
            "complainantCitizenship": "२७-०१-६४-००६०१",
            "respondentName": "ग्याल्जेन लामा",
            "respondentPhone": "९८४११०६००५",
            "respondentAddress": "पाँचपोखरी थाङपाल-६, थाङपालकोट",
            "respondentCitizenship": "२७-०१-६६-००६०५",
            "disputedKittaNo": "कित्ता नं. ५२ र ५३",
            "claimDetails": "दुई खेतको बीचमा रहेको पुरानो ढुङ्गे पर्खाल वर्षाले भत्किएपछि प्रतिवादीले पर्खाल मेरो जग्गामा पारेर नयाँ गारो लगाएकाले पुरानै सिमाना कायम गरिपाऊँ।",
            "respondentStatement": "भिरालो जग्गा भएकाले पर्खाल बलियो बनाउन अलिकति जग बाहिर परेको हो, पुरानै रेखामा सार्न मञ्जुर छु।",
            "filingDateBs": "२०८१-०३-१४",
            "noticeIssuedDateBs": "२०८१-०३-१८",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-06",
            "mediatorName": "ज्ञान बहादुर तामाङ",
            "reconciliationNotes": "स्थानीय वृद्ध भलादमी र अमिनको उपस्थितिमा साबिकको पर्खालको जग पत्ता लगाई रेखांकन गरियो।",
            "verdict": "साबिक जगकै रेखामा पर्खाल निर्माण गर्ने र दुवै पक्षले श्रमदान गरी संयुक्त रूपमा पर्खाल उठाउने गरी मिलापत्र सदर गरियो।",
            "verdictDateBs": "२०८१-०४-०५",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "साबिक रेखामा संयुक्त पर्खाल निर्माण सम्पन्न।",
                "settledDateBs": "२०८१-०४-०५",
                "witnesses": ["वडा अध्यक्ष, वडा नं. ६", "स्थानीय जेष्ठ नागरिक"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०३-२६",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी, अमिन",
                    "summary": "पुरानो जग रेखांकन मुचुल्का तयार।",
                    "status": "completed"
                }
            ],
            "evidenceDocuments": ["पुर्जा प्रतिलिपि", "स्थलगत रेखांकन मुचुल्का"]
        },
        {
            "id": "32000000-0000-0000-0000-000000000012",
            "caseNo": "न्या.वि.-०६/२०८१-१२",
            "title": "सार्वजनिक पाटी तथा चोक अतिक्रमण सम्बन्धी विवाद",
            "disputeType": "सार्वजनिक सम्पत्ति तथा बाटो अतिक्रमण (Public Land Encroachment)",
            "status": "इजलास सुनुवाइमा (In Hearing)",
            "wardNumber": 6,
            "complainantName": "दावा नुर्बु शेर्पा",
            "complainantPhone": "९८४११०६००३",
            "complainantAddress": "पाँचपोखरी थाङपाल-६, थाङपालकोट",
            "complainantCitizenship": "२७-०१-६८-००६०३",
            "respondentName": "माइली तामाङ",
            "respondentPhone": "९८४११०६००४",
            "respondentAddress": "पाँचपोखरी थाङपाल-६, थाङपालकोट",
            "respondentCitizenship": "२७-०१-७७-००६०४",
            "disputedKittaNo": "कित्ता नं. ११ (सार्वजनिक)",
            "claimDetails": "गाउँको ऐतिहासिक चौतारा र सार्वजनिक पाटीको जग्गामा प्रतिवादीले काठ र टिनको टहरा बनाई पसल सञ्चालन गरेर सार्वजनिक बाटो साँघुरो बनाएकाले टहरा हटाइपाऊँ।",
            "respondentStatement": "अस्थायी रूपमा गुजाराका लागि राखेको हुँ, विकल्प दिएमा सार्न तयार छु।",
            "filingDateBs": "२०८१-०५-०१",
            "noticeIssuedDateBs": "२०८१-०५-०५",
            "nextHearingDateBs": "२०८१-०६-२९",
            "assignedMediatorId": "MED-P5-06",
            "mediatorName": "ज्ञान बहादुर तामाङ",
            "reconciliationNotes": "सार्वजनिक स्थल संरक्षण ऐन अनुसार टहरा हटाउनुपर्ने कानुनी राय, अन्यत्र व्यवस्थापनको खोजी।",
            "verdict": "",
            "verdictDateBs": "",
            "presidedBy": "उपाध्यक्ष / संयोजक",
            "finalSettlement": None,
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०५-२०",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी, टोल विकास संस्था",
                    "summary": "टहरा सार्न ३० दिनको म्याद दिने विषयमा छलफल।",
                    "status": "order_issued"
                }
            ],
            "evidenceDocuments": ["नापी नक्सा", "टोल सुधार समिति पत्र"]
        },

        # Ward 7 (भोताङ)
        {
            "id": "32000000-0000-0000-0000-000000000013",
            "caseNo": "न्या.वि.-०७/२०८१-१३",
            "title": "उच्च हिमाली खर्क चरिचरन तथा गोठ सीमा विवाद",
            "disputeType": "खर्क तथा चरिचरन विवाद (Pasture/Grazing Dispute)",
            "status": "फैसला भएको (Decided)",
            "wardNumber": 7,
            "complainantName": "निमा वाङ्गेल शेर्पा",
            "complainantPhone": "९८४११०७००१",
            "complainantAddress": "पाँचपोखरी थाङपाल-७, भोताङ",
            "complainantCitizenship": "२७-०१-६२-००७०१",
            "respondentName": "छिरिङ दोर्जे तामाङ",
            "respondentPhone": "९८४११०७००५",
            "respondentAddress": "पाँचपोखरी थाङपाल-७, भोताङ",
            "respondentCitizenship": "२७-०१-६५-००७०५",
            "disputedKittaNo": "नाउखर्क उच्च चरिचरन क्षेत्र",
            "claimDetails": "हाम्रो पुर्ख्यौली नाउखर्कको परम्परागत याक चरिचरन क्षेत्रमा प्रतिवादीले नियम विपरित १०० भन्दा बढी बाख्रा र भेडा हुलेर घाँस सखाप पारेकाले सीमा छुट्याई पाऊँ।",
            "respondentStatement": "सामुदायिक खर्क भएकाले सबैको हक लाग्छ, तर परम्परागत गोठ विभाजन अनुसार चराउन मञ्जुर छु।",
            "filingDateBs": "२०८१-०२-२८",
            "noticeIssuedDateBs": "२०८१-०३-०२",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-07",
            "mediatorName": "पेम्बा छिरिङ शेर्पा",
            "reconciliationNotes": "उच्च हिमाली खर्क व्यवस्थापन कार्यविधि २०८० बमोजिम उत्तरतर्फ याक र दक्षिणतर्फ भेडाबाख्रा चराउने वैज्ञानिक विभाजनमा सहमति।",
            "verdict": "नाउखर्कको खहरे खोलालाई प्राकृतिक सीमा मानी पूर्व-उत्तर भेग चौंरी/याकका लागि र पश्चिम-दक्षिण भेग भेडाबाख्राका लागि चरिचरन क्षेत्र निर्धारण गरी मिलापत्र सदर गरियो।",
            "verdictDateBs": "२०८१-०३-२०",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "प्राकृतिक खोलाको सीमा कायम, दुवै पक्षबाट चरिचरन नियम पालना।",
                "settledDateBs": "२०८१-०३-२०",
                "witnesses": ["वडा अध्यक्ष, वडा नं. ७", "खर्क व्यवस्थापन समिति"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०३-१२",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी, गोठाला प्रतिनिधि",
                    "summary": "खर्कको नक्सांकन र सिमाना यकिन।",
                    "status": "completed"
                }
            ],
            "evidenceDocuments": ["खर्क दर्ता अभिलेख", "गोठाला समिति सिफारिस"]
        },
        {
            "id": "32000000-0000-0000-0000-000000000014",
            "caseNo": "न्या.वि.-०७/२०८१-१४",
            "title": "स्याउ बगैँचाको घेराबार तथा बाख्रा पसेको सम्बन्धी",
            "disputeType": "बालीनाली नोक्सानी / पशु चौपाया विवाद (Crop Damage by Livestock)",
            "status": "मेलमिलाप प्रक्रियामा (In Mediation)",
            "wardNumber": 7,
            "complainantName": "पासाङ लामु शेर्पा",
            "complainantPhone": "९८४११०७००२",
            "complainantAddress": "पाँचपोखरी थाङपाल-७, भोताङ",
            "complainantCitizenship": "२७-०१-७२-००७०२",
            "respondentName": "दावा फुटी शेर्पा",
            "respondentPhone": "९८४११०७००४",
            "respondentAddress": "पाँचपोखरी थाङपाल-७, भोताङ",
            "respondentCitizenship": "२७-०१-७८-००७०४",
            "disputedKittaNo": "कित्ता नं. ७१",
            "claimDetails": "मेरो नयाँ स्याउ बगैँचाका २५ वटा कलमी बिरुवा प्रतिवादीको बाख्राले खाएर टुप्पा भाँचिदिएकाले बिरुवाको क्षतिपूर्ति भराई पाऊँ।",
            "respondentStatement": "मेरो बाख्रा पसेकोमा क्षमा चाहन्छु, नयाँ २५ वटा कलमी स्याउका बिरुवा किनेर रोपिदिन तयार छु।",
            "filingDateBs": "२०८१-०५-२२",
            "noticeIssuedDateBs": "२०८१-०५-२६",
            "nextHearingDateBs": "२०८१-०६-३०",
            "assignedMediatorId": "MED-P5-07",
            "mediatorName": "पेम्बा छिरिङ शेर्पा",
            "reconciliationNotes": "नयाँ २५ वटा स्याउका बिरुवा प्रतिवादीले कृषि फार्मबाट खरिद गरी रोपिदिने सहमति बन्ने चरणमा।",
            "verdict": "",
            "verdictDateBs": "",
            "presidedBy": "उपाध्यक्ष / संयोजक",
            "finalSettlement": None,
            "hearings": [],
            "evidenceDocuments": ["कृषि प्राविधिक स्थलगत मुचुल्का"]
        },

        # Ward 8 (लागार्छे)
        {
            "id": "32000000-0000-0000-0000-000000000015",
            "caseNo": "न्या.वि.-०८/२०८१-१५",
            "title": "सामुदायिक वनको दाउरा तथा काठ दाबी विवाद",
            "disputeType": "सामुदायिक वन तथा प्राकृतिक स्रोत (Community Forest Dispute)",
            "status": "फैसला भएको (Decided)",
            "wardNumber": 8,
            "complainantName": "पेम्बा ग्याल्जेन शेर्पा",
            "complainantPhone": "९८४११०८००१",
            "complainantAddress": "पाँचपोखरी थाङपाल-८, लागार्छे",
            "complainantCitizenship": "२७-०१-६०-००८०१",
            "respondentName": "मिङ्मार दोर्जे शेर्पा",
            "respondentPhone": "९८४११०८००३",
            "respondentAddress": "पाँचपोखरी थाङपाल-८, लागार्छे",
            "respondentCitizenship": "२७-०१-६६-००८०३",
            "disputedKittaNo": "लागार्छे सामुदायिक वन क्षेत्र",
            "claimDetails": "ढलेको काठ उपभोक्ता समितिको निर्णय अनुसार मैले संकलन गर्नुपर्नेमा प्रतिवादीले जबर्जस्ती उठाएर लगेकाले फिर्ता गराई पाऊँ।",
            "respondentStatement": "मैले समितिको अनुमति पाएको ठानेर उठाएको थिएँ, गल्ती महसुस गरी आधा-आधा बाँड्न तयार छु।",
            "filingDateBs": "२०८१-०३-११",
            "noticeIssuedDateBs": "२०८१-०३-१५",
            "nextHearingDateBs": "",
            "assignedMediatorId": "MED-P5-08",
            "mediatorName": "कान्छी माया तामाङ",
            "reconciliationNotes": "वन उपभोक्ता समितिको रोहबरमा दाउरा दुवै पक्षलाई ५०-५० प्रतिशत बाँड्ने निर्णय।",
            "verdict": "वन समितिको विधान र कार्यविधि अनुसार संकलित दाउरा दुवै पक्षलाई बराबर बाँड्ने र आगामी दिनमा समिति विना कसैले काठदाउरा संकलन नगर्ने गरी मिलापत्र।",
            "verdictDateBs": "२०८१-०३-२९",
            "presidedBy": "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            "finalSettlement": {
                "settlementTerms": "दाउरा बराबरी बाँडफाँट, सामुदायिक वन नियम पालना।",
                "settledDateBs": "२०८१-०३-२९",
                "witnesses": ["सामुदायिक वन अध्यक्ष", "वडा सदस्य, वडा नं. ८"],
                "status": "मिलापत्र सम्पन्न"
            },
            "hearings": [
                {
                    "hearingNo": 1,
                    "dateBs": "२०८१-०३-२२",
                    "presidedBy": "उपाध्यक्ष / संयोजक",
                    "attendees": "वादी, प्रतिवादी, वन समिति अध्यक्ष",
                    "summary": "काठको परिमाण नापजाँच गरी मिलापत्र सहमति।",
                    "status": "completed"
                }
            ],
            "evidenceDocuments": ["सामुदायिक वन पूर्जी", "समिति निर्णय प्रतिलिपि"]
        },
        {
            "id": "32000000-0000-0000-0000-000000000016",
            "caseNo": "न्या.वि.-०८/२०८१-१६",
            "title": "घर अगाडिको सार्वजनिक जग्गामा फोहोर थुपारेको सम्बन्धी",
            "disputeType": "फोहोरमैला तथा ध्वनि प्रदूषण (Sanitation & Public Nuisance)",
            "status": "नयाँ दर्ता (Registered)",
            "wardNumber": 8,
            "complainantName": "कान्छी माया तामाङ (स्थानीय)",
            "complainantPhone": "९८४११०८००२",
            "complainantAddress": "पाँचपोखरी थाङपाल-८, लागार्छे",
            "complainantCitizenship": "२७-०१-७४-००८०२",
            "respondentName": "लाक्पा डिकी शेर्पा",
            "respondentPhone": "९८४११०८००४",
            "respondentAddress": "पाँचपोखरी थाङपाल-८, लागार्छे",
            "respondentCitizenship": "२७-०१-७९-००८०४",
            "disputedKittaNo": "-",
            "claimDetails": "प्रतिवादीले आफ्नो पशु गोठको गोबर र फोहोर मेरो घरको आँगन अगाडि थुपारी दुर्गन्ध फैलाएकोले फोहोर हटाउन आदेश गरिपाऊँ।",
            "respondentStatement": "",
            "filingDateBs": "२०८१-०६-०२",
            "noticeIssuedDateBs": "२०८१-०६-०६",
            "nextHearingDateBs": "२०८१-०७-०२",
            "assignedMediatorId": "MED-P5-08",
            "mediatorName": "कान्छी माया तामाङ",
            "reconciliationNotes": "प्रतिवादीलाई म्याद तामेल गरी छलफलको लागि बोलाइएको।",
            "verdict": "",
            "verdictDateBs": "",
            "presidedBy": "उपाध्यक्ष / संयोजक",
            "finalSettlement": None,
            "hearings": [],
            "evidenceDocuments": ["उजुरी पत्र", "तस्बिर"]
        }
    ]

    q = """
        INSERT INTO judicial_cases (
            id, tenant_id, "caseNo", title, "disputeType", status,
            "complainantName", "complainantPhone", "complainantAddress", "complainantCitizenship",
            "wardNumber", "respondentName", "respondentPhone", "respondentAddress", "respondentCitizenship",
            "disputedKittaNo", "claimDetails", "respondentStatement",
            "filingDateBs", "noticeIssuedDateBs", "nextHearingDateBs",
            "assignedMediatorId", "mediatorName", "reconciliationNotes",
            verdict, "verdictDateBs", "presidedBy", "finalSettlement",
            hearings, "evidenceDocuments", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT ("caseNo") DO UPDATE SET
            title = EXCLUDED.title,
            "disputeType" = EXCLUDED."disputeType",
            status = EXCLUDED.status,
            "nextHearingDateBs" = EXCLUDED."nextHearingDateBs",
            "assignedMediatorId" = EXCLUDED."assignedMediatorId",
            "mediatorName" = EXCLUDED."mediatorName",
            "reconciliationNotes" = EXCLUDED."reconciliationNotes",
            verdict = EXCLUDED.verdict,
            "verdictDateBs" = EXCLUDED."verdictDateBs",
            "finalSettlement" = EXCLUDED."finalSettlement",
            hearings = EXCLUDED.hearings,
            "updatedAt" = NOW();
    """

    for c in cases:
        settlement_json = json.dumps(c["finalSettlement"], ensure_ascii=False) if c["finalSettlement"] else None
        hearings_json = json.dumps(c["hearings"], ensure_ascii=False)
        docs_json = json.dumps(c["evidenceDocuments"], ensure_ascii=False)

        cur.execute(q, (
            c["id"], TENANT_ID, c["caseNo"], c["title"], c["disputeType"], c["status"],
            c["complainantName"], c["complainantPhone"], c["complainantAddress"], c["complainantCitizenship"],
            c["wardNumber"], c["respondentName"], c["respondentPhone"], c["respondentAddress"], c["respondentCitizenship"],
            c["disputedKittaNo"], c["claimDetails"], c["respondentStatement"],
            c["filingDateBs"], c["noticeIssuedDateBs"], c["nextHearingDateBs"],
            c["assignedMediatorId"], c["mediatorName"], c["reconciliationNotes"],
            c["verdict"], c["verdictDateBs"], c["presidedBy"], settlement_json,
            hearings_json, docs_json
        ))
    print(f"  Inserted/Updated {len(cases)} judicial cases.")


def seed_judicial_cause_list(cur):
    """Seed 10 bench cause list hearing sessions."""
    print("--- 3. Seeding judicial_cause_list (10 cause list hearings) ---")
    
    cause_list = [
        (
            "33000000-0000-0000-0000-000000000001",
            "२०८१-०६-०५",
            "बिहान ११:०० बजे",
            "32000000-0000-0000-0000-000000000004",
            "न्या.वि.-०२/२०८१-०४",
            "लक्ष्मी पौडेल विरुद्ध कान्छा मान श्रेष्ठ",
            "पारिवारिक / घरेलु विवाद (Family & Domestic Maintenance)",
            "प्रारम्भिक सुनुवाइ",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "completed",
            "आमाको मासिक औषधि खर्च विवरण पेश गर्न आदेश भयो।"
        ),
        (
            "32000000-0000-0000-0000-000000000002",
            "२०८१-०६-०५",
            "दिउँसो ०१:०० बजे",
            "32000000-0000-0000-0000-000000000006",
            "न्या.वि.-०३/२०८१-०६",
            "रीता माया मिजार विरुद्ध निमा तेन्जिङ लामा",
            "ज्याला मजुरी / श्रम विवाद (Unpaid Wage Dispute)",
            "मेलमिलाप छलफल",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "completed",
            "रु ३५,००० ज्यालामध्ये रु २०,००० भुक्तान र बाँकी १५,००० अर्को महिना बुझाउने गरी मिलापत्र सम्पन्न।"
        ),
        (
            "33000000-0000-0000-0000-000000000003",
            "२०८१-०६-१२",
            "बिहान ११:३० बजे",
            "32000000-0000-0000-0000-000000000002",
            "न्या.वि.-०१/२०८१-०२",
            "कृष्ण प्रसाद दङ्गाल विरुद्ध सुनिता दनुवार",
            "कुलोपानी तथा सिँचाइ निकास (Canal/Irrigation Dispute)",
            "मेलमिलाप छलफल",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "scheduled",
            "सिँचाइ पालो प्रणालीको समयतालिका मस्यौदामा दुई पक्षीय छलफल हुने।"
        ),
        (
            "33000000-0000-0000-0000-000000000004",
            "२०८१-०६-१२",
            "दिउँसो ०२:०० बजे",
            "32000000-0000-0000-0000-000000000010",
            "न्या.वि.-०५/२०८१-१०",
            "माया देवी गिरी विरुद्ध सोनाम शेर्पा",
            "खानेपानी मुहान तथा पाइपलाइन विवाद (Drinking Water Dispute)",
            "प्रमाण बुझ्ने तथा मेलमिलाप",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "scheduled",
            "पाइप खरिद र जडानको कार्यतालिका तय गरिने।"
        ),
        (
            "33000000-0000-0000-0000-000000000005",
            "२०८१-०६-१९",
            "बिहान ११:०० बजे",
            "32000000-0000-0000-0000-000000000008",
            "न्या.वि.-०४/२०८१-०८",
            "राधिका अधिकारी विरुद्ध बलराम तिमल्सिना",
            "साँध सिमाना / जग्गा विवाद (Boundary Dispute)",
            "प्रारम्भिक सुनुवाइ",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "scheduled",
            "प्रतिवादीको बयान लिने र स्थलगत अमिन खटाउने।"
        ),
        (
            "33000000-0000-0000-0000-000000000006",
            "२०८१-०६-१९",
            "दिउँसो ०१:३० बजे",
            "32000000-0000-0000-0000-000000000012",
            "न्या.वि.-०६/२०८१-१२",
            "दावा नुर्बु शेर्पा विरुद्ध माइली तामाङ",
            "सार्वजनिक सम्पत्ति तथा बाटो अतिक्रमण (Public Land Encroachment)",
            "मेलमिलाप छलफल",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "scheduled",
            "टहरा अन्यत्र सार्ने विकल्पबारे टोल विकास संस्थासहित छलफल।"
        ),
        (
            "33000000-0000-0000-0000-000000000007",
            "२०८१-०६-२६",
            "बिहान ११:०० बजे",
            "32000000-0000-0000-0000-000000000014",
            "न्या.वि.-०७/२०८१-१४",
            "पासाङ लामु शेर्पा विरुद्ध दावा फुटी शेर्पा",
            "बालीनाली नोक्सानी / पशु चौपाया विवाद (Crop Damage by Livestock)",
            "अन्तिम मिलापत्र",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "scheduled",
            "स्याउको २५ बिरुवा हस्तान्तरण र मिलापत्र प्रमाणित गरिने।"
        ),
        (
            "33000000-0000-0000-0000-000000000008",
            "२०८१-०६-२६",
            "दिउँसो ०२:०० बजे",
            "32000000-0000-0000-0000-000000000016",
            "न्या.वि.-०८/२०८१-१६",
            "कान्छी माया तामाङ विरुद्ध लाक्पा डिकी शेर्पा",
            "फोहोरमैला तथा ध्वनि प्रदूषण (Sanitation & Public Nuisance)",
            "प्रारम्भिक सुनुवाइ",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "scheduled",
            "फोहोर हटाउने म्याद र गोठ सरसफाइ सम्बन्धी छलफल।"
        ),
        (
            "33000000-0000-0000-0000-000000000009",
            "२०८१-०७-०३",
            "बिहान ११:३० बजे",
            "32000000-0000-0000-0000-000000000004",
            "न्या.वि.-०२/२०८१-०४",
            "लक्ष्मी पौडेल विरुद्ध कान्छा मान श्रेष्ठ",
            "पारिवारिक / घरेलु विवाद (Family & Domestic Maintenance)",
            "अन्तिम मिलापत्र / फैसला",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "scheduled",
            "मासिक खर्च सम्झौता प्रमाणीकरण।"
        ),
        (
            "33000000-0000-0000-0000-000000000010",
            "२०८१-०७-०३",
            "दिउँसो ०१:०० बजे",
            "32000000-0000-0000-0000-000000000008",
            "न्या.वि.-०४/२०८१-०८",
            "राधिका अधिकारी विरुद्ध बलराम तिमल्सिना",
            "साँध सिमाना / जग्गा विवाद (Boundary Dispute)",
            "प्रमाण प्रतिवेदन पेश",
            "उपाध्यक्ष (संयोजक - न्यायिक समिति)",
            json.dumps(["सदस्य-१ (कार्यपालिका सदस्य)", "सदस्य-२ (कार्यपालिका सदस्य)"], ensure_ascii=False),
            "scheduled",
            "प्राविधिक अमिनको नापजाँच प्रतिवेदन पेश हुने।"
        )
    ]

    q = """
        INSERT INTO judicial_cause_list (
            id, "benchDateBs", "benchTime", "caseId", "caseNo", parties,
            "disputeType", stage, "benchPresidedBy", "benchMembers",
            status, "resultNotes", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "benchDateBs" = EXCLUDED."benchDateBs",
            "benchTime" = EXCLUDED."benchTime",
            stage = EXCLUDED.stage,
            status = EXCLUDED.status,
            "resultNotes" = EXCLUDED."resultNotes",
            "updatedAt" = NOW();
    """
    for cl in cause_list:
        cur.execute(q, cl)
    print(f"  Inserted/Updated {len(cause_list)} cause list items.")


def main():
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = False
    cur = conn.cursor()
    try:
        seed_judicial_mediators(cur)
        seed_judicial_cases(cur)
        seed_judicial_cause_list(cur)

        conn.commit()
        print("\nAll Judicial Committee data committed successfully!")
    except Exception as e:
        conn.rollback()
        print(f"\nERROR: Transaction rolled back due to error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
