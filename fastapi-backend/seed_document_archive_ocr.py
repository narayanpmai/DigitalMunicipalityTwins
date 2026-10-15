import uuid
import datetime
from core.database import SessionLocal
from models.document import DocumentArchive, DocumentExtraction

TENANT_ID = "panchpokhari"

def seed_documents_and_extractions():
    db = SessionLocal()
    try:
        print("--- SEEDING OPTION 26: DIGITAL DOCUMENT ARCHIVE & OCR EXTRACTIONS ---")

        existing_docs = db.query(DocumentArchive).count()
        if existing_docs > 0:
            print(f"DocumentArchive already has {existing_docs} rows. Skipping...")
            return

        now = datetime.datetime.utcnow()

        # ── 1. ARCHIVE DOCUMENTS ───────────────────────────────────────────────
        docs_data = [
            {
                "title": "पाँचपोखरी थाङपाल गाउँपालिका स्थानीय आर्थिक ऐन, २०८१",
                "fiscal_year": "२०८१/०८२",
                "file_name": "economic_act_2081.pdf",
                "file_url": "/uploads/documents/economic_act_2081.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=60),
                "category": "Gazette",
                "extractions": [
                    {
                        "page": 4,
                        "data": "दफा ४ (सम्पत्ति कर): पाँचपोखरी थाङपाल गाउँपालिका क्षेत्रभित्र पर्ने आवासीय भवन तथा जग्गामा मूल्यांकनको ०.०५% देखि ०.१५% सम्म प्रगतिशील सम्पत्ति कर लागू हुनेछ।",
                        "status": "Published"
                    },
                    {
                        "page": 12,
                        "data": "दफा १२ (व्यवसाय कर दर): साना खुद्रा व्यापार रु ५००, थोक पसल रु २,५००, होटल तथा रिसोर्ट रु ५,००० देखि १०,००० सम्म वार्षिक व्यवसाय कर निर्धारण गरिएको छ।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "वार्षिक नीति तथा कार्यक्रम र बजेट वक्तव्य, २०८१/०८२",
                "fiscal_year": "२०८१/०८२",
                "file_name": "budget_policy_2081_82.pdf",
                "file_url": "/uploads/documents/budget_policy_2081_82.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=75),
                "category": "BudgetBook",
                "extractions": [
                    {
                        "page": 2,
                        "data": "परिच्छेद २ (कुल बजेट विनियोजन): आगामी आर्थिक वर्ष २०८१/८२ का लागि कुल अनुमानित बजेट रु ६२ करोड ४५ लाख विनियोजन गरिएको छ। यसमध्ये पुँजीगत रु ३४ करोड र चालु रु २८ करोड ४५ लाख रहेको छ।",
                        "status": "Published"
                    },
                    {
                        "page": 7,
                        "data": "पूर्वाधार विकास प्राथमिकता: मेलम्ची-भोताङ सडक कालोपत्रे, थाङपालकोट खानेपानी योजना तथा पाँचपोखरी पदमार्ग स्तरोन्नतिलाई रणनीतिक गौरवको आयोजना घोषणा गरिएको छ।",
                        "status": "Verified"
                    },
                    {
                        "page": 15,
                        "data": "कृषि तथा पशुपालन अनुदान: प्राङ्गारिक आलु तथा किवी उत्पादन प्रवर्द्धनका लागि ५० प्रतिशत लागत साझेदारीमा रु १ करोड २५ लाख बजेट छुट्याइएको छ।",
                        "status": "Pending Verification"
                    }
                ]
            },
            {
                "title": "डिजिटल नागरिक बडापत्र तथा सेवा प्रवाह मापदण्ड, २०८१",
                "fiscal_year": "२०८१/०८२",
                "file_name": "citizen_charter_2081.pdf",
                "file_url": "/uploads/documents/citizen_charter_2081.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=45),
                "category": "CitizenCharter",
                "extractions": [
                    {
                        "page": 1,
                        "data": "जन्म, मृत्यु, विवाह, सम्बन्धविच्छेद र बसाईंसराई दर्ता: घटना घटेको ३५ दिनभित्र निःशुल्क। आवश्यक कागजात रुजु भएपछि सोही दिन (१ घण्टाभित्र) डिजिटल हस्ताक्षरसहित प्रमाणपत्र उपलब्ध हुनेछ।",
                        "status": "Published"
                    },
                    {
                        "page": 3,
                        "data": "नेपाली नागरिकता सिफारिस: वंशजको नागरिकताका लागि बाबु/आमाको नागरिकता, जन्मदर्ता, २ प्रति फोटो र वडा मुचुल्का सहित रु ५०० दस्तुरमा सोही दिन सिफारिस जारी हुनेछ।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "विपद् जोखिम न्यूनीकरण तथा पूर्वतयारी गुरुयोजना, २०८१",
                "fiscal_year": "२०८१/०८२",
                "file_name": "drrm_action_plan_2081.pdf",
                "file_url": "/uploads/documents/drrm_action_plan_2081.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=90),
                "category": "DRRM",
                "extractions": [
                    {
                        "page": 5,
                        "data": "जोखिमयुक्त बस्ती स्थानान्तरण कार्ययोजना: बाढीपहिरो उच्च जोखिममा रहेका वडा नं ३ र वडा नं २ का २४ घरधुरीलाई सुरक्षित एकीकृत बस्तीमा स्थानान्तरण तथा आवास अनुदान दिने निर्णय।",
                        "status": "Published"
                    },
                    {
                        "page": 11,
                        "data": "आपतकालीन खोज तथा उद्धार सामग्री गोदाम: थाङपालधाप र भोताङमा २ वटा आपतकालीन राहत गोदाम स्थापना गरी त्रिपाल, टेन्ट, प्राथमिक उपचार किट र लाइफ ज्याकेट मौज्दात राखिएको छ।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "स्थानीय शिक्षा ऐन तथा विद्यालय व्यवस्थापन नियमावली, २०७९",
                "fiscal_year": "२०७९/०८०",
                "file_name": "education_act_2079.pdf",
                "file_url": "/uploads/documents/education_act_2079.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=300),
                "category": "Act",
                "extractions": [
                    {
                        "page": 8,
                        "data": "दफा १८ (दिवा खाजा कार्यक्रम): प्रारम्भिक बालविकासदेखि कक्षा ५ सम्मका सबै विद्यार्थीलाई प्रतिदिन रु १५ बराबरको स्थानीय पोषणयुक्त खाजा उपलब्ध गराउने अनिवार्य व्यवस्था।",
                        "status": "Published"
                    },
                    {
                        "page": 21,
                        "data": "दफा २८ (विद्यालय तह योग्यता तथा परीक्षा): कक्षा ८ को आधारभूत तह परीक्षा (BLE) पालिकास्तरीय परीक्षा समिति मार्फत एकीकृत ग्रेडिङ प्रणालीमा सञ्चालन हुनेछ।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "सहकारी नियमन, अनुगमन तथा सुपरीवेक्षण दिग्दर्शन, २०८०",
                "fiscal_year": "२०८०/०८१",
                "file_name": "cooperative_guideline_2080.pdf",
                "file_url": "/uploads/documents/cooperative_guideline_2080.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=180),
                "category": "Guideline",
                "extractions": [
                    {
                        "page": 6,
                        "data": "वित्तीय सुशासन तथा तरलता मापदण्ड: पालिकाभित्र कार्यक्षेत्र भएका बचत तथा ऋण सहकारीले कम्तीमा १०% तरल सम्पत्ति (Liquidity) कायम राख्नुपर्नेछ र COPOMIS मा मासिक विवरण प्रविष्ट गर्नुपर्नेछ।",
                        "status": "Verified"
                    },
                    {
                        "page": 14,
                        "data": "लेखापरीक्षण प्रतिवेदन अनिवार्य: प्रत्येक आर्थिक वर्ष समाप्त भएको ६ महिनाभित्र इजाजतप्राप्त लेखापरीक्षकबाट लेखापरीक्षण गराई वार्षिक साधारणसभा सम्पन्न गर्नुपर्ने।",
                        "status": "Pending Verification"
                    }
                ]
            },
            {
                "title": "भवन निर्माण संहिता तथा ई-बीपीएस (eBPS) मापदण्ड, २०८०",
                "fiscal_year": "२०८०/०८१",
                "file_name": "ebps_building_code_2080.pdf",
                "file_url": "/uploads/documents/ebps_building_code_2080.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=150),
                "category": "Regulation",
                "extractions": [
                    {
                        "page": 3,
                        "data": "भवन उचाइ तथा सेटब्याक नियम: ग्रामीण आवासीय भवनको उचाइ अधिकतम ३ तल्ला वा ३५ फिट। सडकको केन्द्र रेखाबाट कम्तीमा ५ मिटर सेटब्याक (Setback) छाड्नुपर्नेछ।",
                        "status": "Published"
                    },
                    {
                        "page": 9,
                        "data": "डिजिटल नक्सापास प्रक्रिया: eBPS पोर्टल मार्फत सूचीकृत इन्जिनियरले मात्र स्ट्रक्चरल र आर्किटेक्चरल ड्रइङ अपलोड गर्न पाउने र फिल्ड प्रमाणिकरणपछि मात्र स्थायी इजाजत जारी हुने।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "कृषि तथा पशुपन्छी विकास अनुदान कार्यविधि, २०८०",
                "fiscal_year": "२०८०/०८१",
                "file_name": "agri_grant_procedure_2080.pdf",
                "file_url": "/uploads/documents/agri_grant_procedure_2080.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=120),
                "category": "Agriculture",
                "extractions": [
                    {
                        "page": 4,
                        "data": "याक/चौंरी तथा बाख्रापालन पकेट विकास: लेकाली क्षेत्रका पशुपालक कृषक समूहलाई गोठ सुधार तथा औषधि/खोपमा ८०% सम्म अनुदान सहायता उपलब्ध गराउने।",
                        "status": "Verified"
                    },
                    {
                        "page": 10,
                        "data": "कृषक सूचीकरण र परिचयपत्र: अनुदान प्राप्त गर्न कम्तीमा १ रोपनी खेती वा ५ वटा पशु चौपाया पालेको स्थानीय कृषक हुनुपर्ने र वडा कार्यालयबाट प्रमाणित हुनुपर्ने।",
                        "status": "Published"
                    }
                ]
            },
            {
                "title": "पाँचपोखरी थाङपाल स्थानीय राजपत्र खण्ड १ (ऐन तथा कार्यविधि सङ्ग्रह)",
                "fiscal_year": "२०७८/०७९",
                "file_name": "local_gazette_vol1.pdf",
                "file_url": "/uploads/documents/local_gazette_vol1.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=500),
                "category": "Gazette",
                "extractions": [
                    {
                        "page": 1,
                        "data": "पाँचपोखरी थाङपाल गाउँपालिका कार्यपालिका कार्य विभाजन नियमावली: गाउँपालिका अध्यक्ष, उपाध्यक्ष, वडा अध्यक्ष तथा कार्यपालिका सदस्यहरूको अधिकार र जिम्मेवारी तोकिएको।",
                        "status": "Published"
                    },
                    {
                        "page": 18,
                        "data": "सार्वजनिक खरिद कार्यविधि: रु २० लाख सम्मको निर्माण कार्य स्थानीय उपभोक्ता समिति मार्फत गराउन सकिने स्पष्ट कार्यविधि पारित।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "पाँचपोखरी थाङपाल स्थानीय राजपत्र खण्ड २ (प्रशासनिक तथा वित्तीय नियमावली)",
                "fiscal_year": "२०७९/०८०",
                "file_name": "local_gazette_vol2.pdf",
                "file_url": "/uploads/documents/local_gazette_vol2.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=380),
                "category": "Gazette",
                "extractions": [
                    {
                        "page": 5,
                        "data": "आन्तरिक लेखापरीक्षण तथा आर्थिक कार्यविधि: चौमासिक रूपमा आन्तरिक लेखापरीक्षण सम्पन्न गरी कार्यपालिका बैठकमा पेश गर्नुपर्ने बाध्यात्मक व्यवस्था।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "पाँचपोखरी थाङपाल स्थानीय राजपत्र खण्ड ३ (वातावरण तथा पर्यटन संरक्षण ऐन)",
                "fiscal_year": "२०८०/०८१",
                "file_name": "local_gazette_vol3.pdf",
                "file_url": "/uploads/documents/local_gazette_vol3.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=220),
                "category": "Gazette",
                "extractions": [
                    {
                        "page": 2,
                        "data": "पाँचपोखरी सिमसार तथा तीर्थस्थल संरक्षण: ४,१०० मिटर उचाइमा रहेका पाँचवटा पवित्र पोखरी क्षेत्रमा प्लास्टिकजन्य फोहोर निषेध तथा जैविक विविधता संरक्षण क्षेत्र घोषणा।",
                        "status": "Published"
                    },
                    {
                        "page": 11,
                        "data": "पर्यटक दर्ता तथा सुरक्षा शुल्क: विदेशी तथा स्वदेशी पदयात्रीहरूको भोताङ चेकपोस्टमा डिजिटल एन्ट्री अनिवार्य गर्ने निर्णय।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "पाँचपोखरी थाङपाल स्थानीय राजपत्र खण्ड ४ (सार्वजनिक सम्पत्ति तथा जग्गा वर्गीकरण)",
                "fiscal_year": "२०८१/०८२",
                "file_name": "local_gazette_vol4.pdf",
                "file_url": "/uploads/documents/local_gazette_vol4.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=35),
                "category": "Gazette",
                "extractions": [
                    {
                        "page": 4,
                        "data": "भू-उपयोग क्षेत्र वर्गीकरण: पालिकाभित्रको ३,७४३ कित्ता जग्गालाई कृषि, आवासीय, व्यावसायिक, वन तथा सार्वजनिक उपयोग क्षेत्रमा वैज्ञानिक भू-उपयोग नक्साङ्कन प्रमाणीकरण।",
                        "status": "Published"
                    },
                    {
                        "page": 9,
                        "data": "सार्वजनिक जग्गा संरक्षण तथा तारबार: नदी उकास, खेलमैदान र सार्वजनिक चौरहरूको सीमाङ्कन गरी जिपिएस को-अर्डिनेट सहित डिजिटल ट्विनमा अभिलेखीकरण।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "गाउँ कार्यपालिका बैठक निर्णय अभिलेख (असार मसान्त, २०८१)",
                "fiscal_year": "२०८०/०८१",
                "file_name": "meeting_decisions_ashad_2081.pdf",
                "file_url": "/uploads/documents/meeting_decisions_ashad_2081.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=70),
                "category": "MeetingDecision",
                "extractions": [
                    {
                        "page": 1,
                        "data": "निर्णय नं १: आर्थिक वर्ष २०८०/८१ को अन्तिम चौमासिक समीक्षा तथा योजना फरफारक म्याद थप सम्बन्धी निर्णय सर्वसम्मत अनुमोदन।",
                        "status": "Verified"
                    },
                    {
                        "page": 3,
                        "data": "निर्णय नं ४: स्थानीय युवा स्वरोजगारका लागि सीपमूलक तालिम (ड्राइभिङ, होटेल व्यवस्थापन, प्लम्बिङ) सञ्चालन गर्न रु १५ लाख निकासा।",
                        "status": "Pending Verification"
                    }
                ]
            },
            {
                "title": "सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण प्रतिवेदन, २०८०/०८१",
                "fiscal_year": "२०८०/०८१",
                "file_name": "social_audit_report_2080_81.pdf",
                "file_url": "/uploads/documents/social_audit_report_2080_81.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=80),
                "category": "Report",
                "extractions": [
                    {
                        "page": 2,
                        "data": "नागरिक सन्तुष्टि सूचक: वडा नं १ देखि ८ का ३४० सहभागी नागरिकहरूको पृष्ठपोषण अनुसार स्वास्थ्य र शिक्षा सेवामा ८४.५% नागरिक सन्तुष्ट रहेको निष्कर्ष।",
                        "status": "Published"
                    },
                    {
                        "page": 6,
                        "data": "सामाजिक परीक्षण सुझाव: ग्रामीण सडकमा नाला निर्माण र वर्षातमा तत्काल डोजर परिचालन गरी पहिरो पन्छाउने संयन्त्र प्रभावकारी बनाउनुपर्ने माग।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "पाँचपोखरी पर्यटन पदमार्ग तथा होमस्टे सञ्चालन कार्यविधि, २०७९",
                "fiscal_year": "२०७९/०८०",
                "file_name": "tourism_homestay_procedure_2079.pdf",
                "file_url": "/uploads/documents/tourism_homestay_procedure_2079.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=320),
                "category": "Procedure",
                "extractions": [
                    {
                        "page": 3,
                        "data": "सामुदायिक होमस्टे दर्ता मापदण्ड: कम्तीमा २ वटा सफा पाहुना कोठा, आधुनिक शौचालय, स्थानीय अर्गानिक खाना र परम्परागत ह्योल्मो/तामाङ सांस्कृतिक सत्कार अनिवार्य।",
                        "status": "Verified"
                    }
                ]
            },
            {
                "title": "स्वास्थ्य संस्था सञ्चालन तथा औषधि व्यवस्थापन निर्देशिका, २०८०",
                "fiscal_year": "२०८०/०८१",
                "file_name": "health_inventory_guideline_2080.pdf",
                "file_url": "/uploads/documents/health_inventory_guideline_2080.pdf",
                "status": "Verified",
                "uploaded_at": now - datetime.timedelta(days=160),
                "category": "Guideline",
                "extractions": [
                    {
                        "page": 5,
                        "data": "निःशुल्क अत्यावश्यक ९८ प्रकारका औषधिहरू स्वास्थ्य चौकी तथा आधारभूत स्वास्थ्य सेवा केन्द्रमा २४सै घण्टा मौज्दात सुनिश्चित गर्ने र FEFO (First Expiry First Out) प्रणाली लागू गर्ने।",
                        "status": "Published"
                    },
                    {
                        "page": 12,
                        "data": "एम्बुलेन्स सेवा २४ घण्टा सञ्चालन: सुत्केरी महिला, ज्येष्ठ नागरिक र गम्भीर बिरामीका लागि गाउँपालिकाभित्र निःशुल्क तथा काठमाडौँ रिफरमा ५०% सहुलियत दर निर्धारण।",
                        "status": "Verified"
                    }
                ]
            }
        ]

        total_extracted_records = 0
        for doc_item in docs_data:
            doc_id = uuid.uuid4()
            archive_obj = DocumentArchive(
                id=doc_id,
                tenant_id=TENANT_ID,
                title=doc_item["title"],
                fiscal_year=doc_item["fiscal_year"],
                file_name=doc_item["file_name"],
                file_url=doc_item["file_url"],
                status=doc_item["status"],
                uploaded_at=doc_item["uploaded_at"]
            )
            db.add(archive_obj)
            db.flush()

            for ext in doc_item.get("extractions", []):
                ext_obj = DocumentExtraction(
                    id=uuid.uuid4(),
                    tenant_id=TENANT_ID,
                    document_id=doc_id,
                    category=doc_item["category"],
                    extracted_data=ext["data"],
                    page_number=ext["page"],
                    status=ext["status"],
                    extracted_at=archive_obj.uploaded_at + datetime.timedelta(minutes=5)
                )
                db.add(ext_obj)
                total_extracted_records += 1

        db.commit()
        print(f"✓ Seeded {len(docs_data)} documents into document_archive")
        print(f"✓ Seeded {total_extracted_records} page extractions into document_extraction")
        print("=== OPTION 26 SEEDING COMPLETED SUCCESSFULLY! ===")

    except Exception as e:
        db.rollback()
        print(f"ERROR during Option 26 seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_documents_and_extractions()
