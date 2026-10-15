import psycopg2
import uuid
import json
import sys
from datetime import datetime, date

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'

PROCUREMENTS_DATA = [
    {
        "procurementNo": "PTGP/NCB/W-01/2081/082",
        "title": "मेलम्ची-भोताङ-पाँचपोखरी सडक स्तरोन्नति तथा कालोपत्रे कार्य",
        "description": "पाँचपोखरी थाङपाल गाउँपालिकाको लाइफलाइन मेलम्ची-भोताङ खण्ड अन्तर्गत ७.५ किमी सडक स्तरोन्नति, पक्की नाली निर्माण, ग्याबियन वाल तथा अस्फाल्ट कालोपत्रे कार्य।",
        "method": "open_tendering",
        "status": "contracted",
        "fiscalYear": "२०८१/०८२",
        "sector": "सडक तथा यातायात पूर्वाधार",
        "wardNo": "समग्र पालिका",
        "estimatedAmount": 52500000.00,
        "awardedAmount": 48500000.00,
        "bidDocFee": 5000.00,
        "bidSecurityAmount": 1312500.00,
        "performanceSecurityAmount": 2425000.00,
        "awardedTo": "जुगल-हिमशिखर जेभी निर्माण सेवा",
        "awardedVendorPan": "602345890",
        "advertisedDateBs": "२०८१-०४-०५",
        "deadlineDateBs": "२०८१-०५-०५",
        "loiPublishDateBs": "२०८१-०५-१२",
        "contractDateBs": "२०८१-०५-२५",
        "completionDateBs": "२०८२-०३-३०",
        "biddersCount": 4,
        "biddersList": [
            {
                "submissionNo": "EBID-2081-082-01",
                "name": "जुगल-हिमशिखर जेभी निर्माण सेवा",
                "contactPerson": "विजय लामा",
                "phone": "9841223344",
                "email": "jugal.himshikhar@gmail.com",
                "panVat": "602345890",
                "bidAmount": 48500000.00,
                "bidSecurityAmount": 1312500.00,
                "status": "न्यूनतम मूल्याङ्कित सारभूत रूपमा प्रभावग्राही (छनोट भई सम्झौता सम्पन्न)",
                "submissionDateBs": "२०८१-०५-०२"
            },
            {
                "submissionNo": "EBID-2081-082-02",
                "name": "लामा-धुलिखेल कन्स्ट्रक्सन जेभी",
                "contactPerson": "राम कुमार श्रेष्ठ",
                "phone": "9851033445",
                "email": "lama.dhulikhel@gmail.com",
                "panVat": "601998822",
                "bidAmount": 50500000.00,
                "bidSecurityAmount": 1312500.00,
                "status": "प्राविधिक रूपमा सफल, आर्थिक मूल्याङ्कनमा दोस्रो",
                "submissionDateBs": "२०८१-०५-०४"
            },
            {
                "submissionNo": "EBID-2081-082-03",
                "name": "सिन्धु कन्स्ट्रक्सन प्रा.लि.",
                "contactPerson": "सुरेश तामाङ",
                "phone": "9849221100",
                "email": "sindhu.con@gmail.com",
                "panVat": "602883344",
                "bidAmount": 51200000.00,
                "bidSecurityAmount": 1312500.00,
                "status": "प्राविधिक रूपमा सफल",
                "submissionDateBs": "२०८१-०५-०४"
            },
            {
                "submissionNo": "EBID-2081-082-04",
                "name": "मेलम्ची इन्फ्रास्ट्रक्चर प्रा.लि.",
                "contactPerson": "कमल गुरुङ",
                "phone": "9841009988",
                "email": "melamchi.infra@gmail.com",
                "panVat": "603112299",
                "bidAmount": 51800000.00,
                "bidSecurityAmount": 1312500.00,
                "status": "प्राविधिक रूपमा सफल",
                "submissionDateBs": "२०८१-०५-०५"
            }
        ],
        "runningBills": [
            {
                "billNo": "R-01",
                "period": "२०८१ असोज",
                "amount": 9500000.00,
                "status": "भुक्तानी सम्पन्न",
                "physicalProgress": 20
            }
        ],
        "bankDetails": {
            "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
            "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
            "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
        },
        "documents": [
            {"name": "मेलम्ची-भोताङ_सडक_IFB_सूचना.pdf", "type": "notice", "size": "1.8 MB"},
            {"name": "Melamchi_Bhotang_BOQ_Final.xlsx", "type": "boq", "size": "650 KB"}
        ],
        "requirements": [
            "नेपाल सरकारबाट 'क' वर्गको निर्माण इजाजतपत्र प्राप्त",
            "विगत ५ वर्षमा कम्तीमा एउटा रु. ४ करोड बराबरको सडक कालोपत्रे कार्य सम्पन्न गरेको",
            "आर्थिक वर्ष २०८०/८१ को कर चुक्ता प्रमाणपत्र",
            "स्वीकृत प्रयोगशालाबाट बिटुमिन तथा मेटेरियल परीक्षण ग्यारेन्टी"
        ]
    },
    {
        "procurementNo": "PTGP/NCB/B-02/2081/082",
        "title": "पाँचपोखरी थाङपाल गाउँपालिका प्रशासकीय भवन निर्माण कार्य (दोस्रो चरण)",
        "description": "गाउँपालिका केन्द्र थाङपालधापमा निर्माणाधीन भूकम्प प्रतिरोधी ३ तले प्रशासकीय भवनको फिनिसिङ, इलेक्ट्रिकल, स्यानिटरी तथा लिफ्ट जडान कार्य।",
        "method": "open_tendering",
        "status": "evaluation",
        "fiscalYear": "२०८१/०८२",
        "sector": "भवन तथा सहरी विकास",
        "wardNo": "६",
        "estimatedAmount": 65000000.00,
        "awardedAmount": None,
        "bidDocFee": 5000.00,
        "bidSecurityAmount": 1625000.00,
        "performanceSecurityAmount": 3250000.00,
        "awardedTo": None,
        "awardedVendorPan": None,
        "advertisedDateBs": "२०८१-०४-२५",
        "deadlineDateBs": "२०८१-०५-२५",
        "loiPublishDateBs": None,
        "contractDateBs": None,
        "completionDateBs": "२०८२-०४-३०",
        "biddersCount": 5,
        "biddersList": [
            {
                "submissionNo": "EBID-2081-082-05",
                "name": "सूर्य-चन्द्र निर्माण सेवा प्रा.लि.",
                "contactPerson": "सुरेश चन्द्र पौडेल",
                "phone": "9851088776",
                "panVat": "601998822",
                "bidAmount": 59200000.00,
                "bidSecurityAmount": 1625000.00,
                "status": "प्राविधिक तथा आर्थिक मूल्याङ्कन समितिमा अध्ययनरत",
                "submissionDateBs": "२०८१-०५-२२"
            },
            {
                "submissionNo": "EBID-2081-082-06",
                "name": "गोरखा बिल्डर्स एण्ड सप्लायर्स",
                "contactPerson": "दीपक बस्नेत",
                "phone": "9841229988",
                "panVat": "602883344",
                "bidAmount": 60500000.00,
                "bidSecurityAmount": 1625000.00,
                "status": "प्राविधिक तथा आर्थिक मूल्याङ्कन समितिमा अध्ययनरत",
                "submissionDateBs": "२०८१-०५-२३"
            },
            {
                "submissionNo": "EBID-2081-082-07",
                "name": "हिमालयन इन्फ्राटेक प्रा.लि.",
                "contactPerson": "प्रकाश शर्मा",
                "phone": "9851122334",
                "panVat": "603112299",
                "bidAmount": 61500000.00,
                "bidSecurityAmount": 1625000.00,
                "status": "प्राविधिक तथा आर्थिक मूल्याङ्कन समितिमा अध्ययनरत",
                "submissionDateBs": "२०८१-०५-२४"
            }
        ],
        "runningBills": [],
        "bankDetails": {
            "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
            "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
            "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
        },
        "documents": [
            {"name": "प्रशासकीय_भवन_बोलपत्र_सूचना.pdf", "type": "notice", "size": "2.1 MB"},
            {"name": "Building_Phase2_BOQ.xlsx", "type": "boq", "size": "820 KB"}
        ],
        "requirements": [
            "नेपाल सरकारबाट 'क' वा 'ख' वर्गको निर्माण इजाजतपत्र प्राप्त",
            "सार्वजनिक भवन निर्माणमा कम्तीमा ५ वर्षको अनुभव",
            "आर्थिक वर्ष २०८०/८१ को कर चुक्ता प्रमाणपत्र"
        ]
    },
    {
        "procurementNo": "PTGP/SQ/G-03/2081/082",
        "title": "गाउँपालिकाका ८ वटै वडा केन्द्र तथा मुख्य पदमार्गमा सौर्य सडक बत्ती (Solar Street Lights) खरिद तथा जडान",
        "description": "गाउँपालिकाका मुख्य सार्वजनिक चोक, वडा कार्यालय परिसर तथा पर्यटन पदमार्गमा १२० वटा लिथियम ब्याट्रीयुक्त ६० वाट सौर्य सडक बत्ती जडान कार्य।",
        "method": "request_for_quotation",
        "status": "awarded",
        "fiscalYear": "२०८१/०८२",
        "sector": "ऊर्जा तथा वातावरण",
        "wardNo": "समग्र पालिका",
        "estimatedAmount": 2800000.00,
        "awardedAmount": 2480000.00,
        "bidDocFee": 1000.00,
        "bidSecurityAmount": 70000.00,
        "performanceSecurityAmount": 124000.00,
        "awardedTo": "उज्यालो नेपाल अल्टरनेटिभ इनर्जी प्रा.लि.",
        "awardedVendorPan": "603889911",
        "advertisedDateBs": "२०८१-०५-०१",
        "deadlineDateBs": "२०८१-०५-१६",
        "loiPublishDateBs": "२०८१-०५-२०",
        "contractDateBs": "२०८१-०५-३०",
        "completionDateBs": "२०८१-०८-३०",
        "biddersCount": 3,
        "biddersList": [
            {
                "submissionNo": "EBID-2081-082-08",
                "name": "उज्यालो नेपाल अल्टरनेटिभ इनर्जी प्रा.लि.",
                "contactPerson": "राजेश महर्जन",
                "phone": "9841887766",
                "panVat": "603889911",
                "bidAmount": 2480000.00,
                "bidSecurityAmount": 70000.00,
                "status": "७ दिने आशयको सूचना प्रकाशित (LOI Awarded)",
                "submissionDateBs": "२०८१-०५-१४"
            },
            {
                "submissionNo": "EBID-2081-082-09",
                "name": "ग्रीन पावर सोलुसन्स प्रा.लि.",
                "contactPerson": "सुमन अधिकारी",
                "phone": "9851011223",
                "panVat": "602554433",
                "bidAmount": 2590000.00,
                "bidSecurityAmount": 70000.00,
                "status": "आर्थिक मूल्याङ्कनमा दोस्रो",
                "submissionDateBs": "२०८१-०५-१५"
            }
        ],
        "runningBills": [],
        "bankDetails": {
            "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
            "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
            "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
        },
        "documents": [
            {"name": "Solar_Street_Light_SQ_Notice.pdf", "type": "notice", "size": "950 KB"},
            {"name": "Solar_BOQ_Specifications.xlsx", "type": "boq", "size": "340 KB"}
        ],
        "requirements": [
            "वैकल्पिक ऊर्जा प्रवर्द्धन केन्द्र (AEPC) बाट मान्यता प्राप्त",
            "कम्तीमा २ वर्षको वारेन्टी तथा मर्मत सम्भार सम्झौता"
        ]
    },
    {
        "procurementNo": "PTGP/NCB/W-04/2081/082",
        "title": "बरुवा-छिम्टि वृहत लिफ्टिङ खानेपानी आयोजना तथा मुख्य रिजर्भ्वायर ट्यांकी निर्माण",
        "description": "वडा नं २ र ३ का ६५० घरधुरीलाई २४सै घण्टा स्वच्छ खानेपानी उपलब्ध गराउन ३ लाख लिटर क्षमताको मुख्य आरसीसी ट्यांकी तथा २.५ किमी मुख्य पाइपलाइन विस्तार।",
        "method": "open_tendering",
        "status": "advertised",
        "fiscalYear": "२०८१/०८२",
        "sector": "खानेपानी तथा सरसफाइ",
        "wardNo": "२",
        "estimatedAmount": 32000000.00,
        "awardedAmount": None,
        "bidDocFee": 3000.00,
        "bidSecurityAmount": 800000.00,
        "performanceSecurityAmount": 1600000.00,
        "awardedTo": None,
        "awardedVendorPan": None,
        "advertisedDateBs": "२०८१-०५-१५",
        "deadlineDateBs": "२०८१-०६-१५",
        "loiPublishDateBs": None,
        "contractDateBs": None,
        "completionDateBs": "२०८२-०५-३०",
        "biddersCount": 1,
        "biddersList": [
            {
                "submissionNo": "EBID-2081-082-10",
                "name": "सुन्दर नेपाल हाइड्रो एण्ड वाटर प्रा.लि.",
                "contactPerson": "ज्ञानेन्द्र दाहाल",
                "phone": "9841339900",
                "panVat": "601887766",
                "bidAmount": 29500000.00,
                "bidSecurityAmount": 800000.00,
                "status": "अनलाइन दर्ता सम्पन्न (म्याद बाँकी)",
                "submissionDateBs": "२०८१-०५-२८"
            }
        ],
        "runningBills": [],
        "bankDetails": {
            "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
            "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
            "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
        },
        "documents": [
            {"name": "Baruwa_Water_Supply_IFB.pdf", "type": "notice", "size": "2.4 MB"},
            {"name": "Water_Supply_Civil_BOQ.xlsx", "type": "boq", "size": "780 KB"}
        ],
        "requirements": [
            "कम्तीमा २ वटा खानेपानी लिफ्टिङ वा रिजर्भ्वायर आयोजना सम्पन्न गरेको",
            "आव २०८०/८१ को कर चुक्ता प्रमाणपत्र"
        ]
    },
    {
        "procurementNo": "PTGP/CONS/05/2081/082",
        "title": "पाँचपोखरी थाङपाल पर्यटन गुरुयोजना तथा डिजिटल जीआईएस नक्साङ्कन परामर्श सेवा",
        "description": "पाँचपोखरी धाम, आमायाङ्ग्री पिक, ड्रागन फल्स लगायत धार्मिक तथा प्राकृतिक पर्यटकीय स्थलहरूको २० वर्षे दीर्घकालीन गुरुयोजना, थ्रीडी म्यापिङ तथा डीपीआर तयारी।",
        "method": "consulting",
        "status": "completed",
        "fiscalYear": "२०८१/०८२",
        "sector": "पर्यटन तथा संस्कृति",
        "wardNo": "समग्र पालिका",
        "estimatedAmount": 2000000.00,
        "awardedAmount": 1850000.00,
        "bidDocFee": 1000.00,
        "bidSecurityAmount": 50000.00,
        "performanceSecurityAmount": 92500.00,
        "awardedTo": "जियोम्याटिक्स एण्ड टुरिजम सोलुसन्स नेपाल प्रा.लि.",
        "awardedVendorPan": "604556677",
        "advertisedDateBs": "२०८०-११-१०",
        "deadlineDateBs": "२०८०-१२-१०",
        "loiPublishDateBs": "२०८०-१२-१५",
        "contractDateBs": "२०८०-१२-२५",
        "completionDateBs": "२०८१-०४-१५",
        "biddersCount": 3,
        "biddersList": [
            {
                "submissionNo": "EBID-2080-081-33",
                "name": "जियोम्याटिक्स एण्ड टुरिजम सोलुसन्स नेपाल प्रा.लि.",
                "contactPerson": "डा. प्रभात श्रेष्ठ",
                "phone": "9851077665",
                "panVat": "604556677",
                "bidAmount": 1850000.00,
                "bidSecurityAmount": 50000.00,
                "status": "कार्य सम्पन्न तथा अन्तिम प्रतिवेदन बुझाइएको",
                "submissionDateBs": "२०८०-१२-०८"
            }
        ],
        "runningBills": [
            {
                "billNo": "Final",
                "period": "२०८१ साउन",
                "amount": 1850000.00,
                "status": "भुक्तानी सम्पन्न तथा फरफारक",
                "physicalProgress": 100
            }
        ],
        "bankDetails": {
            "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
            "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
            "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
        },
        "documents": [
            {"name": "Tourism_Master_Plan_Final_Report.pdf", "type": "notice", "size": "8.5 MB"}
        ],
        "requirements": [
            "पर्यटन गुरुयोजना तथा जीआईएस म्यापिङमा विज्ञता प्राप्त परामर्शदाता फर्म"
        ]
    },
    {
        "procurementNo": "PTGP/DIR/06/2081/082",
        "title": "वर्षातजन्य बाढी पहिरो रोकथाम तथा मेलम्ची नदी नियन्त्रण हेभी ग्याबियन जाली आपूर्ती",
        "description": "विपद् पूर्वतयारी तथा प्रतिकार्य अन्तर्गत पहिरो प्रभावित वडा १, २, ३ र ७ का जोखिमयुक्त क्षेत्रहरूमा तत्काल तटबन्ध गर्न हेभी ड्युटी ग्याबियन बाकस आपूर्ती।",
        "method": "direct_procurement",
        "status": "completed",
        "fiscalYear": "२०८१/०८२",
        "sector": "विपद् व्यवस्थापन तथा वन वातावरण",
        "wardNo": "समग्र पालिका",
        "estimatedAmount": 1000000.00,
        "awardedAmount": 980000.00,
        "bidDocFee": 0.00,
        "bidSecurityAmount": 25000.00,
        "performanceSecurityAmount": 49000.00,
        "awardedTo": "सिन्धु सप्लायर्स एण्ड हार्डवेयर सेन्टर, मेलम्ची",
        "awardedVendorPan": "600129845",
        "advertisedDateBs": "२०८१-०४-०१",
        "deadlineDateBs": "२०८१-०४-०३",
        "contractDateBs": "२०८१-०४-०५",
        "completionDateBs": "२०८१-०४-२०",
        "biddersCount": 1,
        "biddersList": [
            {
                "submissionNo": "DIR-2081-01",
                "name": "सिन्धु सप्लायर्स एण्ड हार्डवेयर सेन्टर",
                "contactPerson": "गोपाल श्रेष्ठ",
                "phone": "9841556677",
                "panVat": "600129845",
                "bidAmount": 980000.00,
                "status": "सामग्री आपूर्ति सम्पन्न तथा स्टोर दाखिला प्रमाणित",
                "submissionDateBs": "२०८१-०४-०३"
            }
        ],
        "runningBills": [
            {
                "billNo": "Final",
                "period": "२०८१ साउन",
                "amount": 980000.00,
                "status": "भुक्तानी सम्पन्न",
                "physicalProgress": 100
            }
        ],
        "bankDetails": {
            "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
            "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
            "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
        },
        "documents": [
            {"name": "Gabion_Supply_Voucher.pdf", "type": "notice", "size": "450 KB"}
        ],
        "requirements": ["नेपाल गुणस्तर (NS) प्रमाणित हेभी ग्याबियन वायर"]
    },
    {
        "procurementNo": "PTGP/SQ/W-07/2081/082",
        "title": "वडा नं ६ थाङपालधाप कृषि उपज संकलन केन्द्र भवन निर्माण",
        "description": "स्थानीय किसानहरूको स्याउ, किबी, आलु तथा तरकारी भण्डारण र बजारीकरणका लागि आधुनिक संकलन केन्द्र भवन तथा शीतभण्डार युनिट निर्माण।",
        "method": "request_for_quotation",
        "status": "contracted",
        "fiscalYear": "२०८१/०८२",
        "sector": "कृषि तथा पशुपन्छी",
        "wardNo": "६",
        "estimatedAmount": 2150000.00,
        "awardedAmount": 1920000.00,
        "bidDocFee": 1000.00,
        "bidSecurityAmount": 53750.00,
        "performanceSecurityAmount": 96000.00,
        "awardedTo": "मेलम्ची भ्याली कन्स्ट्रक्सन एण्ड इन्जिनियरिङ",
        "awardedVendorPan": "602778899",
        "advertisedDateBs": "२०८१-०४-१०",
        "deadlineDateBs": "२०८१-०४-२६",
        "loiPublishDateBs": "२०८१-०४-३०",
        "contractDateBs": "२०८१-०५-१०",
        "completionDateBs": "२०८१-०९-३०",
        "biddersCount": 4,
        "biddersList": [
            {
                "submissionNo": "EBID-2081-082-11",
                "name": "मेलम्ची भ्याली कन्स्ट्रक्सन एण्ड इन्जिनियरिङ",
                "contactPerson": "केदार तिमल्सिना",
                "phone": "9841662233",
                "panVat": "602778899",
                "bidAmount": 1920000.00,
                "bidSecurityAmount": 53750.00,
                "status": "सम्झौता भई निर्माण कार्य प्रारम्भ",
                "submissionDateBs": "२०८१-०४-२४"
            }
        ],
        "runningBills": [
            {
                "billNo": "R-01",
                "period": "२०८१ भाद्र",
                "amount": 750000.00,
                "status": "भुक्तानी सम्पन्न",
                "physicalProgress": 40
            }
        ],
        "bankDetails": {
            "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
            "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
            "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
        },
        "documents": [
            {"name": "Agro_Collection_Center_Notice.pdf", "type": "notice", "size": "1.1 MB"}
        ],
        "requirements": ["इजाजतपत्र प्राप्त स्थानीय निर्माण व्यवसायी"]
    },
    {
        "procurementNo": "PTGP/NCB/W-08/2081/082",
        "title": "लाँगर्चे-मानेखर्क पदमार्ग स्तरोन्नति तथा झोलुङ्गे पुल निर्माण कार्य",
        "description": "वडा नं ४ र ८ जोड्ने लाँगर्चे खोलामा १२० मिटर लामो झोलुङ्गे पुल निर्माण तथा दुवैतर्फ सुरक्षित पर्यटन पदमार्ग विस्तार।",
        "method": "open_tendering",
        "status": "advertised",
        "fiscalYear": "२०८१/०८२",
        "sector": "सडक तथा यातायात पूर्वाधार",
        "wardNo": "८",
        "estimatedAmount": 14500000.00,
        "awardedAmount": None,
        "bidDocFee": 3000.00,
        "bidSecurityAmount": 362500.00,
        "performanceSecurityAmount": 725000.00,
        "awardedTo": None,
        "awardedVendorPan": None,
        "advertisedDateBs": "२०८१-०५-२०",
        "deadlineDateBs": "२०८१-०६-२१",
        "biddersCount": 0,
        "biddersList": [],
        "runningBills": [],
        "bankDetails": {
            "bankName": "नेपाल बैंक लिमिटेड, मेलम्ची शाखा",
            "depositAccountNo": "१२३०१००००५८ (धरौटी खाता)",
            "revenueAccountNo": "१२३०१००००८९ (आन्तरिक राजस्व खाता)"
        },
        "documents": [
            {"name": "Langarche_Bridge_IFB.pdf", "type": "notice", "size": "2.8 MB"},
            {"name": "Suspension_Bridge_BOQ.xlsx", "type": "boq", "size": "920 KB"}
        ],
        "requirements": ["झोलुङ्गे पुल निर्माणमा कम्तीमा ३ वर्षको कार्यानुभव"]
    }
]

LIFECYCLE_DATA = [
    {
        "proposal": {
            "id": "prop-w1-01",
            "fiscal_year": "२०८१/०८२",
            "ward_id": "१",
            "title": "बासखर्क किबी पकेट कृषि सडक स्तरोन्नति तथा ग्राभेल कार्य",
            "description": "वडा नं १ बासखर्कका किबी तथा सुन्तला कृषकहरूलाई बजार पहुँच सहज बनाउन ३.५ किमी सडक स्तरोन्नति।",
            "estimated_cost": 2500000.00,
            "priority": "P1 (High)",
            "status": "Selected"
        },
        "budget": {
            "id": "budg-w1-01",
            "budget_head_code": "३१११२-सडक-पूर्वाधार",
            "source_of_fund": "गाउँपालिका आन्तरिक स्रोत",
            "allocated_amount": 2500000.00,
            "approved_date": "2024-07-20"
        },
        "procurement": {
            "id": "proc-w1-01",
            "procurement_method": "उपभोक्ता समिति (Consumer Committee)",
            "estimated_amount": 2500000.00,
            "tender_call_date": "2024-07-25",
            "bid_opening_date": "2024-07-30"
        },
        "contract": {
            "id": "cont-w1-01",
            "contractor_type": "उपभोक्ता समिति",
            "contractor_id": "बासखर्क किबी सडक निर्माण उपभोक्ता समिति",
            "contract_amount": 2500000.00,
            "agreement_date": "2024-08-01",
            "completion_deadline": "2024-12-30",
            "status": "Active"
        },
        "execution": {
            "id": "exec-w1-01",
            "project_code": "PPK-W01-2081-RD01",
            "physical_progress_percent": 75.00,
            "financial_progress_percent": 60.00,
            "responsible_engineer_id": "ई. सन्तोष अर्याल",
            "gis_geometry": {"type": "LineString", "coordinates": [[85.612, 27.944], [85.615, 27.948]]}
        }
    },
    {
        "proposal": {
            "id": "prop-w2-01",
            "fiscal_year": "२०८१/०८२",
            "ward_id": "२",
            "title": "बरुवा खानेपानी मुहान संरक्षण तथा एक घर एक धारा विस्तार",
            "description": "बरुवा गाउँका २८० घरधुरीमा स्वच्छ सुरक्षित खानेपानी उपलब्ध गराउने मुहान संरक्षण तथा पाइपलाइन विस्तार।",
            "estimated_cost": 3500000.00,
            "priority": "P1 (High)",
            "status": "Selected"
        },
        "budget": {
            "id": "budg-w2-01",
            "budget_head_code": "३१११६-खानेपानी-संरचना",
            "source_of_fund": "प्रदेश समपूरक अनुदान",
            "allocated_amount": 3500000.00,
            "approved_date": "2024-07-20"
        },
        "procurement": {
            "id": "proc-w2-01",
            "procurement_method": "उपभोक्ता समिति (Consumer Committee)",
            "estimated_amount": 3500000.00,
            "tender_call_date": "2024-07-28",
            "bid_opening_date": "2024-08-02"
        },
        "contract": {
            "id": "cont-w2-01",
            "contractor_type": "उपभोक्ता समिति",
            "contractor_id": "बरुवा खानेपानी उपभोक्ता समिति",
            "contract_amount": 3500000.00,
            "agreement_date": "2024-08-05",
            "completion_deadline": "2024-12-15",
            "status": "Active"
        },
        "execution": {
            "id": "exec-w2-01",
            "project_code": "PPK-W02-2081-WS02",
            "physical_progress_percent": 80.00,
            "financial_progress_percent": 68.00,
            "responsible_engineer_id": "ई. सुवास खतिवडा",
            "gis_geometry": {"type": "Point", "coordinates": [85.589, 27.954]}
        }
    },
    {
        "proposal": {
            "id": "prop-w3-01",
            "fiscal_year": "२०८१/०८२",
            "ward_id": "३",
            "title": "भोताङ-पाँचपोखरी पर्यटकीय पदमार्ग सिँढी तथा रेलिङ निर्माण",
            "description": "छिम्तीदेखि पाँचपोखरी सम्मको तीर्थयात्रा मार्गमा पर्यटकहरूको सुरक्षाका लागि स्टिल रेलिङ तथा ढुङ्गे सिँढी निर्माण।",
            "estimated_cost": 4000000.00,
            "priority": "P1 (High)",
            "status": "Selected"
        },
        "budget": {
            "id": "budg-w3-01",
            "budget_head_code": "३१११५-पर्यटन-पूर्वाधार",
            "source_of_fund": "संघीय विशेष अनुदान",
            "allocated_amount": 4000000.00,
            "approved_date": "2024-07-20"
        },
        "procurement": {
            "id": "proc-w3-01",
            "procurement_method": "उपभोक्ता समिति (Consumer Committee)",
            "estimated_amount": 4000000.00,
            "tender_call_date": "2024-07-25",
            "bid_opening_date": "2024-08-01"
        },
        "contract": {
            "id": "cont-w3-01",
            "contractor_type": "उपभोक्ता समिति",
            "contractor_id": "पाँचपोखरी पर्यटन पदमार्ग उपभोक्ता समिति",
            "contract_amount": 4000000.00,
            "agreement_date": "2024-08-03",
            "completion_deadline": "2024-11-30",
            "status": "Active"
        },
        "execution": {
            "id": "exec-w3-01",
            "project_code": "PPK-W03-2081-TR03",
            "physical_progress_percent": 88.00,
            "financial_progress_percent": 75.00,
            "responsible_engineer_id": "ई. सन्तोष अर्याल",
            "gis_geometry": {"type": "LineString", "coordinates": [[85.612, 27.978], [85.620, 27.995]]}
        }
    },
    {
        "proposal": {
            "id": "prop-w4-01",
            "fiscal_year": "२०८१/०८२",
            "ward_id": "४",
            "title": "थाङपालकोट मानेखर्क आधारभूत स्वास्थ्य सेवा केन्द्र भवन निर्माण",
            "description": "मानेखर्क बजारमा प्रसूति तथा चौबिसै घण्टा आकस्मिक सेवा सहितको स्वास्थ्य चौकी भवन निर्माण।",
            "estimated_cost": 6000000.00,
            "priority": "P1 (High)",
            "status": "Selected"
        },
        "budget": {
            "id": "budg-w4-01",
            "budget_head_code": "३१११३-स्वास्थ्य-भवन",
            "source_of_fund": "गाउँपालिका समपूरक कोष",
            "allocated_amount": 6000000.00,
            "approved_date": "2023-10-01"
        },
        "procurement": {
            "id": "proc-w4-01",
            "procurement_method": "ठेक्का (Open Tender NCB)",
            "estimated_amount": 6000000.00,
            "tender_call_date": "2023-10-15",
            "bid_opening_date": "2023-11-15"
        },
        "contract": {
            "id": "cont-w4-01",
            "contractor_type": "निर्माण कम्पनी (Contractor)",
            "contractor_id": "जुगल कन्स्ट्रक्सन प्रा.लि.",
            "contract_amount": 5950000.00,
            "agreement_date": "2023-11-20",
            "completion_deadline": "2024-05-30",
            "status": "Completed"
        },
        "execution": {
            "id": "exec-w4-01",
            "project_code": "PPK-W04-2081-BD04",
            "physical_progress_percent": 100.00,
            "financial_progress_percent": 100.00,
            "responsible_engineer_id": "ई. सुवास खतिवडा",
            "gis_geometry": {"type": "Point", "coordinates": [85.598, 27.961]}
        }
    },
    {
        "proposal": {
            "id": "prop-w5-01",
            "fiscal_year": "२०८१/०८२",
            "ward_id": "५",
            "title": "गुन्सा सिँचाइ कुलो निर्माण तथा कृषि उत्पादकत्व वृद्धि आयोजना",
            "description": "गुन्सा फाँटमा बाह्रै महिना धान तथा गहुँ उत्पादनका लागि ६०० मिटर पक्की सिँचाइ कुलो ढलान।",
            "estimated_cost": 1800000.00,
            "priority": "P2 (Medium)",
            "status": "Selected"
        },
        "budget": {
            "id": "budg-w5-01",
            "budget_head_code": "३१११५-सिँचाइ-कुलो",
            "source_of_fund": "वडास्तरीय बजेट",
            "allocated_amount": 1800000.00,
            "approved_date": "2024-07-20"
        },
        "procurement": {
            "id": "proc-w5-01",
            "procurement_method": "उपभोक्ता समिति (Consumer Committee)",
            "estimated_amount": 1800000.00,
            "tender_call_date": "2024-08-01",
            "bid_opening_date": "2024-08-05"
        },
        "contract": {
            "id": "cont-w5-01",
            "contractor_type": "उपभोक्ता समिति",
            "contractor_id": "गुन्सा सिँचाइ कुलो उपभोक्ता समिति",
            "contract_amount": 1800000.00,
            "agreement_date": "2024-08-10",
            "completion_deadline": "2024-12-30",
            "status": "Active"
        },
        "execution": {
            "id": "exec-w5-01",
            "project_code": "PPK-W05-2081-IR05",
            "physical_progress_percent": 62.00,
            "financial_progress_percent": 50.00,
            "responsible_engineer_id": "ई. सन्तोष अर्याल",
            "gis_geometry": {"type": "LineString", "coordinates": [[85.578, 27.922], [85.582, 27.925]]}
        }
    },
    {
        "proposal": {
            "id": "prop-w6-01",
            "fiscal_year": "२०८१/०८२",
            "ward_id": "६",
            "title": "थाङपालधाप गाउँपालिका प्रशासनिक परिसर कम्पाउन्ड वाल तथा ल्यान्डस्केपिङ",
            "description": "गाउँपालिका केन्द्रको समग्र सुरक्षा तथा सौन्दर्यीकरणका लागि पक्की पर्खाल, गेट तथा बगैँचा निर्माण।",
            "estimated_cost": 2800000.00,
            "priority": "P1 (High)",
            "status": "Selected"
        },
        "budget": {
            "id": "budg-w6-01",
            "budget_head_code": "३१११३-प्रशासनिक-संरचना",
            "source_of_fund": "गाउँपालिका आन्तरिक स्रोत",
            "allocated_amount": 2800000.00,
            "approved_date": "2024-07-20"
        },
        "procurement": {
            "id": "proc-w6-01",
            "procurement_method": "उपभोक्ता समिति (Consumer Committee)",
            "estimated_amount": 2800000.00,
            "tender_call_date": "2024-07-26",
            "bid_opening_date": "2024-07-31"
        },
        "contract": {
            "id": "cont-w6-01",
            "contractor_type": "उपभोक्ता समिति",
            "contractor_id": "प्रशासनिक परिसर सौन्दर्यीकरण समिति",
            "contract_amount": 2800000.00,
            "agreement_date": "2024-08-02",
            "completion_deadline": "2024-11-15",
            "status": "Active"
        },
        "execution": {
            "id": "exec-w6-01",
            "project_code": "PPK-W06-2081-AD06",
            "physical_progress_percent": 70.00,
            "financial_progress_percent": 57.00,
            "responsible_engineer_id": "ई. सुवास खतिवडा",
            "gis_geometry": {"type": "Polygon", "coordinates": [[[85.591, 27.939], [85.593, 27.939], [85.593, 27.941], [85.591, 27.941], [85.591, 27.939]]]}
        }
    },
    {
        "proposal": {
            "id": "prop-w7-01",
            "fiscal_year": "२०८१/०८२",
            "ward_id": "७",
            "title": "भोटेनाम्लाङ-तिपेनी बजार मुख्य सडक पक्की नाली तथा आरसीसी ढलान",
            "description": "तिपेनी मुख्य बजार क्षेत्रमा वर्षातको हिलो व्यवस्थापनका लागि ३५० मिटर नाली तथा कंक्रिट ढलान कार्य।",
            "estimated_cost": 3200000.00,
            "priority": "P1 (High)",
            "status": "Selected"
        },
        "budget": {
            "id": "budg-w7-01",
            "budget_head_code": "३१११२-सडक-पूर्वाधार",
            "source_of_fund": "प्रदेश विशेष अनुदान",
            "allocated_amount": 3200000.00,
            "approved_date": "2024-07-20"
        },
        "procurement": {
            "id": "proc-w7-01",
            "procurement_method": "उपभोक्ता समिति (Consumer Committee)",
            "estimated_amount": 3200000.00,
            "tender_call_date": "2024-07-28",
            "bid_opening_date": "2024-08-02"
        },
        "contract": {
            "id": "cont-w7-01",
            "contractor_type": "उपभोक्ता समिति",
            "contractor_id": "तिपेनी बजार ढलान उपभोक्ता समिति",
            "contract_amount": 3200000.00,
            "agreement_date": "2024-08-05",
            "completion_deadline": "2024-12-20",
            "status": "Active"
        },
        "execution": {
            "id": "exec-w7-01",
            "project_code": "PPK-W07-2081-RD07",
            "physical_progress_percent": 65.00,
            "financial_progress_percent": 56.00,
            "responsible_engineer_id": "ई. सन्तोष अर्याल",
            "gis_geometry": {"type": "LineString", "coordinates": [[85.568, 27.910], [85.571, 27.913]]}
        }
    },
    {
        "proposal": {
            "id": "prop-w8-01",
            "fiscal_year": "२०८१/०८२",
            "ward_id": "८",
            "title": "लाँगर्चे खोला झोलुङ्गे पुल तथा सुरक्षित गोरेटो बाटो निर्माण",
            "description": "वर्षायाममा खोला तर्न नसक्ने विद्यार्थी तथा स्थानीय बासिन्दाका लागि सुरक्षित झोलुङ्गे पुल निर्माण।",
            "estimated_cost": 2000000.00,
            "priority": "P2 (Medium)",
            "status": "Proposed"
        },
        "budget": {
            "id": "budg-w8-01",
            "budget_head_code": "३१११५-पुल-पदमार्ग",
            "source_of_fund": "गाउँपालिका आन्तरिक स्रोत",
            "allocated_amount": 2000000.00,
            "approved_date": "2024-07-20"
        },
        "procurement": {
            "id": "proc-w8-01",
            "procurement_method": "उपभोक्ता समिति (Consumer Committee)",
            "estimated_amount": 2000000.00,
            "tender_call_date": "2024-08-15",
            "bid_opening_date": "2024-08-20"
        },
        "contract": {
            "id": "cont-w8-01",
            "contractor_type": "उपभोक्ता समिति",
            "contractor_id": "लाँगर्चे खोला झोलुङ्गे पुल उपभोक्ता समिति",
            "contract_amount": 2000000.00,
            "agreement_date": "2024-08-25",
            "completion_deadline": "2025-01-30",
            "status": "Pending"
        },
        "execution": {
            "id": "exec-w8-01",
            "project_code": "PPK-W08-2081-BR08",
            "physical_progress_percent": 0.00,
            "financial_progress_percent": 0.00,
            "responsible_engineer_id": "ई. सुवास खतिवडा",
            "gis_geometry": {"type": "Point", "coordinates": [85.574, 27.908]}
        }
    }
]

PROJECTS_DATA = [
    {
        "id": "proj-w1-01",
        "projectCode": "PPK-W01-2081-RD01",
        "name": "बासखर्क किबी पकेट कृषि सडक स्तरोन्नति तथा ग्राभेल कार्य",
        "nameEn": "Baaskharka Kiwi Pocket Agro-Road Upgrade",
        "wardNumber": 1,
        "sector": "पूर्वाधार (सडक)",
        "status": "ongoing",
        "budget": 2500000.00,
        "fundingSource": "गाउँपालिका आन्तरिक स्रोत",
        "fiscalYear": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "agreementDateBs": "२०८१-०४-१०",
        "completionDateBs": "२०८१-०९-३०",
        "committeeName": "बासखर्क किबी सडक निर्माण उपभोक्ता समिति",
        "committeeChair": "सरिता तामाङ",
        "committeeSecretary": "राम प्रसाद सापकोटा",
        "committeeTreasurer": "चमेली तामाङ",
        "committeePhone": "९८४१२२३३४४",
        "palikaGrant": 2200000.00,
        "communityContribution": 300000.00,
        "totalAgreementAmount": 2500000.00,
        "paidAmount": 1500000.00,
        "financialProgress": 60.0,
        "progressPercentage": 75.0,
        "beneficiaryCount": 420,
        "location": "बासखर्क किबी बगैँचा क्षेत्र",
        "latitude": 27.9450,
        "longitude": 85.6130,
        "responsibleEngineer": "ई. सन्तोष अर्याल",
        "engineerPhone": "९८५१०२२३३४",
        "monitoringRecommendation": "approved_for_installment",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ"
    },
    {
        "id": "proj-w2-01",
        "projectCode": "PPK-W02-2081-WS02",
        "name": "बरुवा खानेपानी मुहान संरक्षण तथा एक घर एक धारा विस्तार",
        "nameEn": "Baruwa Drinking Water Source Protection & Tap Extension",
        "wardNumber": 2,
        "sector": "खानेपानी तथा सरसफाइ",
        "status": "ongoing",
        "budget": 3500000.00,
        "fundingSource": "प्रदेश समपूरक अनुदान",
        "fiscalYear": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "agreementDateBs": "२०८१-०४-१२",
        "completionDateBs": "२०८१-०९-१५",
        "committeeName": "बरुवा खानेपानी उपभोक्ता समिति",
        "committeeChair": "दोर्जे ग्याल्बो लामा",
        "committeeSecretary": "कमला श्रेष्ठ",
        "committeeTreasurer": "सुवास पण्डित",
        "committeePhone": "९८४१५५४४३३",
        "palikaGrant": 3150000.00,
        "communityContribution": 350000.00,
        "totalAgreementAmount": 3500000.00,
        "paidAmount": 2400000.00,
        "financialProgress": 68.0,
        "progressPercentage": 80.0,
        "beneficiaryCount": 1150,
        "location": "बरुवा मुख्य बस्ती",
        "latitude": 27.9542,
        "longitude": 85.5891,
        "responsibleEngineer": "ई. सुवास खतिवडा",
        "engineerPhone": "९८४१५५६६७७",
        "monitoringRecommendation": "approved_for_installment",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ"
    },
    {
        "id": "proj-w3-01",
        "projectCode": "PPK-W03-2081-TR03",
        "name": "भोताङ-पाँचपोखरी पर्यटकीय पदमार्ग सिँढी तथा रेलिङ निर्माण",
        "nameEn": "Bhotang-Panchpokhari Tourism Trail Stairs & Railing",
        "wardNumber": 3,
        "sector": "पूर्वाधार (पर्यटन)",
        "status": "ongoing",
        "budget": 4000000.00,
        "fundingSource": "संघीय विशेष अनुदान",
        "fiscalYear": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "agreementDateBs": "२०८१-०४-०५",
        "completionDateBs": "२०८१-०८-३०",
        "committeeName": "पाँचपोखरी पर्यटन पदमार्ग उपभोक्ता समिति",
        "committeeChair": "पेम्बा तामाङ",
        "committeeSecretary": "निमा शेर्पा",
        "committeeTreasurer": "डिकी डोल्मा लामा",
        "committeePhone": "९८४९००११२२",
        "palikaGrant": 3600000.00,
        "communityContribution": 400000.00,
        "totalAgreementAmount": 4000000.00,
        "paidAmount": 3000000.00,
        "financialProgress": 75.0,
        "progressPercentage": 88.0,
        "beneficiaryCount": 12000,
        "location": "छिमिटि देखि पाँचपोखरी क्षेत्र",
        "latitude": 27.9789,
        "longitude": 85.6123,
        "responsibleEngineer": "ई. सन्तोष अर्याल",
        "engineerPhone": "९८५१०२२३३४",
        "monitoringRecommendation": "approved_for_installment",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ"
    },
    {
        "id": "proj-w4-01",
        "projectCode": "PPK-W04-2081-BD04",
        "name": "थाङपालकोट मानेखर्क आधारभूत स्वास्थ्य सेवा केन्द्र भवन निर्माण",
        "nameEn": "Manekharka Basic Health Center Building Construction",
        "wardNumber": 4,
        "sector": "भवन तथा सहरी विकास",
        "status": "completed",
        "budget": 6000000.00,
        "fundingSource": "गाउँपालिका समपूरक कोष",
        "fiscalYear": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "ठेक्का (Contract)",
        "agreementDateBs": "२०८०-१०-०५",
        "completionDateBs": "२०८१-०४-३०",
        "committeeName": "जुगल कन्स्ट्रक्सन प्रा.लि.",
        "committeeChair": "ठेकेदार प्रतिनिधि: विजय लामा",
        "committeeSecretary": "ई. अर्जुन पौडेल",
        "committeeTreasurer": "लेखा शाखा",
        "committeePhone": "९८४१००८८९९",
        "palikaGrant": 6000000.00,
        "communityContribution": 0.00,
        "totalAgreementAmount": 5950000.00,
        "paidAmount": 5950000.00,
        "financialProgress": 100.0,
        "progressPercentage": 100.0,
        "beneficiaryCount": 1850,
        "location": "मानेखर्क बजार",
        "latitude": 27.9610,
        "longitude": 85.5980,
        "responsibleEngineer": "ई. सुवास खतिवडा",
        "engineerPhone": "९८४१५५६६७७",
        "monitoringRecommendation": "approved_for_installment",
        "agreementStatus": "सम्पन्न (फरफारक प्रमाणित)"
    },
    {
        "id": "proj-w5-01",
        "projectCode": "PPK-W05-2081-IR05",
        "name": "गुन्सा सिँचाइ कुलो निर्माण तथा कृषि उत्पादकत्व वृद्धि आयोजना",
        "nameEn": "Gunsa Irrigation Canal Construction & Agro Support",
        "wardNumber": 5,
        "sector": "सिँचाइ तथा ऊर्जा",
        "status": "ongoing",
        "budget": 1800000.00,
        "fundingSource": "वडास्तरीय बजेट",
        "fiscalYear": "२०८१/०८२",
        "level": "वडास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "agreementDateBs": "२०८१-०५-०१",
        "completionDateBs": "२०८१-१०-३०",
        "committeeName": "गुन्सा सिँचाइ कुलो उपभोक्ता समिति",
        "committeeChair": "कृष्ण बहादुर पण्डित",
        "committeeSecretary": "गीता न्यौपाने",
        "committeeTreasurer": "हरि प्रसाद पराजुली",
        "committeePhone": "९८४१६६७७८८",
        "palikaGrant": 1600000.00,
        "communityContribution": 200000.00,
        "totalAgreementAmount": 1800000.00,
        "paidAmount": 900000.00,
        "financialProgress": 50.0,
        "progressPercentage": 62.0,
        "beneficiaryCount": 380,
        "location": "गुन्सा फाँट",
        "latitude": 27.9234,
        "longitude": 85.5801,
        "responsibleEngineer": "ई. सन्तोष अर्याल",
        "engineerPhone": "९८५१०२२३३४",
        "monitoringRecommendation": "approved_for_installment",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ"
    },
    {
        "id": "proj-w6-01",
        "projectCode": "PPK-W06-2081-AD06",
        "name": "थाङपालधाप गाउँपालिका प्रशासनिक परिसर कम्पाउन्ड वाल तथा ल्यान्डस्केपिङ",
        "nameEn": "Thangpaldhap Municipal Complex Compound Wall & Landscaping",
        "wardNumber": 6,
        "sector": "भवन तथा सहरी विकास",
        "status": "ongoing",
        "budget": 2800000.00,
        "fundingSource": "गाउँपालिका आन्तरिक स्रोत",
        "fiscalYear": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "agreementDateBs": "२०८१-०४-१५",
        "completionDateBs": "२०८१-०९-१५",
        "committeeName": "प्रशासनिक परिसर सौन्दर्यीकरण समिति",
        "committeeChair": "सुरेश कुमार श्रेष्ठ",
        "committeeSecretary": "सुनिता तामाङ",
        "committeeTreasurer": "चन्द्र बहादुर थापा",
        "committeePhone": "९८४१२२९९००",
        "palikaGrant": 2500000.00,
        "communityContribution": 300000.00,
        "totalAgreementAmount": 2800000.00,
        "paidAmount": 1600000.00,
        "financialProgress": 57.0,
        "progressPercentage": 70.0,
        "beneficiaryCount": 21000,
        "location": "थाङपालधाप गाउँपालिका केन्द्र",
        "latitude": 27.9398,
        "longitude": 85.5921,
        "responsibleEngineer": "ई. सुवास खतिवडा",
        "engineerPhone": "९८४१५५६६७७",
        "monitoringRecommendation": "approved_for_installment",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ"
    },
    {
        "id": "proj-w7-01",
        "projectCode": "PPK-W07-2081-RD07",
        "name": "भोटेनाम्लाङ-तिपेनी बजार मुख्य सडक पक्की नाली तथा आरसीसी ढलान",
        "nameEn": "Bhotenamlang-Tipeni Market Road Drainage & RCC Pavement",
        "wardNumber": 7,
        "sector": "पूर्वाधार (सडक)",
        "status": "ongoing",
        "budget": 3200000.00,
        "fundingSource": "प्रदेश विशेष अनुदान",
        "fiscalYear": "२०८१/०८२",
        "level": "गाउँपालिकास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "agreementDateBs": "२०८१-०४-२०",
        "completionDateBs": "२०८१-१०-२०",
        "committeeName": "तिपेनी बजार ढलान उपभोक्ता समिति",
        "committeeChair": "टेक बहादुर तामाङ",
        "committeeSecretary": "राजु दनुवार",
        "committeeTreasurer": "सविता श्रेष्ठ",
        "committeePhone": "९८४९३३२२११",
        "palikaGrant": 2800000.00,
        "communityContribution": 400000.00,
        "totalAgreementAmount": 3200000.00,
        "paidAmount": 1800000.00,
        "financialProgress": 56.0,
        "progressPercentage": 65.0,
        "beneficiaryCount": 1400,
        "location": "तिपेनी मुख्य बजार",
        "latitude": 27.9117,
        "longitude": 85.5692,
        "responsibleEngineer": "ई. सन्तोष अर्याल",
        "engineerPhone": "९८५१०२२३३४",
        "monitoringRecommendation": "approved_for_installment",
        "agreementStatus": "सम्झौता भई कार्य प्रारम्भ"
    },
    {
        "id": "proj-w8-01",
        "projectCode": "PPK-W08-2081-BR08",
        "name": "लाँगर्चे खोला झोलुङ्गे पुल तथा सुरक्षित गोरेटो बाटो निर्माण",
        "nameEn": "Langarche Suspension Bridge & Safe Trail Construction",
        "wardNumber": 8,
        "sector": "पूर्वाधार (पुल/पदमार्ग)",
        "status": "planned",
        "budget": 2000000.00,
        "fundingSource": "गाउँपालिका आन्तरिक स्रोत",
        "fiscalYear": "२०८१/०८२",
        "level": "वडास्तरीय",
        "marfat": "उपभोक्ता समिति",
        "agreementDateBs": "२०८१-०५-२५",
        "completionDateBs": "२०८१-११-३०",
        "committeeName": "लाँगर्चे खोला झोलुङ्गे पुल उपभोक्ता समिति",
        "committeeChair": "ईश्वर पाण्डे",
        "committeeSecretary": "कमल गुरुङ",
        "committeeTreasurer": "पार्वती खत्री",
        "committeePhone": "९८५१०१२३०९",
        "palikaGrant": 1800000.00,
        "communityContribution": 200000.00,
        "totalAgreementAmount": 2000000.00,
        "paidAmount": 0.00,
        "financialProgress": 0.0,
        "progressPercentage": 0.0,
        "beneficiaryCount": 520,
        "location": "लाँगर्चे खोला दोभान",
        "latitude": 27.9087,
        "longitude": 85.5745,
        "responsibleEngineer": "ई. सुवास खतिवडा",
        "engineerPhone": "९८४१५५६६७७",
        "monitoringRecommendation": "pending",
        "agreementStatus": "सम्झौता हुन बाँकी"
    }
]

def seed_procurement_and_lifecycle():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()

    print("--- STEP 1: Seeding Procurements Table ---")
    cur.execute("DELETE FROM procurements")
    for t in PROCUREMENTS_DATA:
        cur.execute("""
            INSERT INTO procurements (
                id, "procurementNo", title, description, method, status, "fiscalYear",
                sector, "wardNo", "estimatedAmount", "awardedAmount", "bidDocFee",
                "bidSecurityAmount", "performanceSecurityAmount", "awardedTo",
                "awardedVendorPan", "advertisedDateBs", "deadlineDateBs",
                "loiPublishDateBs", "contractDateBs", "completionDateBs",
                "biddersCount", "biddersList", "runningBills", "bankDetails",
                documents, requirements, "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            str(uuid.uuid4()),
            t.get("procurementNo"),
            t.get("title"),
            t.get("description"),
            t.get("method"),
            t.get("status"),
            t.get("fiscalYear"),
            t.get("sector"),
            t.get("wardNo"),
            t.get("estimatedAmount"),
            t.get("awardedAmount"),
            t.get("bidDocFee"),
            t.get("bidSecurityAmount"),
            t.get("performanceSecurityAmount"),
            t.get("awardedTo"),
            t.get("awardedVendorPan"),
            t.get("advertisedDateBs"),
            t.get("deadlineDateBs"),
            t.get("loiPublishDateBs"),
            t.get("contractDateBs"),
            t.get("completionDateBs"),
            t.get("biddersCount", 0),
            json.dumps(t.get("biddersList", []), ensure_ascii=False),
            json.dumps(t.get("runningBills", []), ensure_ascii=False),
            json.dumps(t.get("bankDetails", {}), ensure_ascii=False),
            json.dumps(t.get("documents", []), ensure_ascii=False),
            json.dumps(t.get("requirements", []), ensure_ascii=False),
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(PROCUREMENTS_DATA)} public procurement tenders into 'procurements' table.")

    print("\n--- STEP 2: Seeding Project Lifecycle Tables ---")
    cur.execute("DELETE FROM proj_executions")
    cur.execute("DELETE FROM proj_contracts")
    cur.execute("DELETE FROM proj_procurement_plans")
    cur.execute("DELETE FROM proj_budget_allocations")
    cur.execute("DELETE FROM proj_plan_proposals")

    for item in LIFECYCLE_DATA:
        p = item["proposal"]
        b = item["budget"]
        pr = item["procurement"]
        c = item["contract"]
        e = item["execution"]

        # Insert Proposal
        cur.execute("""
            INSERT INTO proj_plan_proposals (
                id, fiscal_year, ward_id, title, description, estimated_cost, priority, status, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            p["id"], p["fiscal_year"], p["ward_id"], p["title"], p["description"],
            p["estimated_cost"], p["priority"], p["status"], datetime.utcnow()
        ))

        # Insert Budget Allocation
        cur.execute("""
            INSERT INTO proj_budget_allocations (
                id, plan_id, budget_head_code, source_of_fund, allocated_amount, approved_date
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            b["id"], p["id"], b["budget_head_code"], b["source_of_fund"],
            b["allocated_amount"], b["approved_date"]
        ))

        # Insert Procurement Plan
        cur.execute("""
            INSERT INTO proj_procurement_plans (
                id, budget_id, procurement_method, estimated_amount, tender_call_date, bid_opening_date
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            pr["id"], b["id"], pr["procurement_method"], pr["estimated_amount"],
            pr["tender_call_date"], pr["bid_opening_date"]
        ))

        # Insert Contract
        cur.execute("""
            INSERT INTO proj_contracts (
                id, procurement_id, contractor_type, contractor_id, contract_amount,
                agreement_date, completion_deadline, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            c["id"], pr["id"], c["contractor_type"], c["contractor_id"],
            c["contract_amount"], c["agreement_date"], c["completion_deadline"], c["status"]
        ))

        # Insert Execution
        cur.execute("""
            INSERT INTO proj_executions (
                id, contract_id, project_code, physical_progress_percent, financial_progress_percent,
                responsible_engineer_id, gis_geometry
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            e["id"], c["id"], e["project_code"], e["physical_progress_percent"],
            e["financial_progress_percent"], e["responsible_engineer_id"],
            json.dumps(e["gis_geometry"]) if e["gis_geometry"] else None
        ))

    conn.commit()
    print(f"✓ Successfully seeded {len(LIFECYCLE_DATA)} end-to-end lifecycle chains (proposals, budgets, plans, contracts, executions).")

    print("\n--- STEP 3: Seeding Infrastructure Projects Table ---")
    cur.execute("DELETE FROM projects")
    SECTOR_MAP = {
        "पूर्वाधार (सडक)": "road",
        "खानेपानी तथा सरसफाइ": "water",
        "पूर्वाधार (पर्यटन)": "tourism",
        "भवन तथा सहरी विकास": "building",
        "सिँचाइ तथा ऊर्जा": "irrigation",
        "पूर्वाधार (पुल/पदमार्ग)": "bridge",
    }
    for prj in PROJECTS_DATA:
        cur.execute("""
            INSERT INTO projects (
                id, "projectCode", name, "nameEn", "wardNumber", sector, status, budget,
                "fundingSource", "fiscalYear", level, marfat, "agreementDateBs", "completionDateBs",
                "committeeName", "committeeChair", "committeeSecretary", "committeeTreasurer",
                "committeePhone", "palikaGrant", "communityContribution", "totalAgreementAmount",
                "paidAmount", "financialProgress", "progressPercentage", "beneficiaryCount",
                location, latitude, longitude, "responsibleEngineer", "engineerPhone",
                "monitoringRecommendation", "agreementStatus", "isPublic", "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            )
        """, (
            str(uuid.uuid5(uuid.NAMESPACE_DNS, prj["id"])),
            prj["projectCode"],
            prj["name"],
            prj["nameEn"],
            prj["wardNumber"],
            SECTOR_MAP.get(prj["sector"], "road"),
            prj["status"],
            prj["budget"],
            prj["fundingSource"],
            prj["fiscalYear"],
            prj["level"],
            prj["marfat"],
            prj["agreementDateBs"],
            prj["completionDateBs"],
            prj["committeeName"],
            prj["committeeChair"],
            prj["committeeSecretary"],
            prj["committeeTreasurer"],
            prj["committeePhone"],
            prj["palikaGrant"],
            prj["communityContribution"],
            prj["totalAgreementAmount"],
            prj["paidAmount"],
            prj["financialProgress"],
            prj["progressPercentage"],
            prj["beneficiaryCount"],
            prj["location"],
            prj["latitude"],
            prj["longitude"],
            prj["responsibleEngineer"],
            prj["engineerPhone"],
            prj["monitoringRecommendation"],
            prj["agreementStatus"],
            True,
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(PROJECTS_DATA)} authentic municipal projects into 'projects' table.")

    # Verification queries
    print("\n--- Summary Verification ---")
    cur.execute("SELECT count(*) FROM procurements")
    print(f"procurements count: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM proj_plan_proposals")
    print(f"proj_plan_proposals count: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM proj_budget_allocations")
    print(f"proj_budget_allocations count: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM proj_contracts")
    print(f"proj_contracts count: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM proj_executions")
    print(f"proj_executions count: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM projects")
    print(f"projects count: {cur.fetchone()[0]}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    seed_procurement_and_lifecycle()
