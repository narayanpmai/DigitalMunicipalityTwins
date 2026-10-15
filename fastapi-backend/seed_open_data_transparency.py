import sys
import os
import uuid
from datetime import datetime

# Add root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "fastapi-backend")))

from core.database import SessionLocal
from models.open_data import OpenDataRecord, MunicipalIndicator, CitizenDataRequest
from models.dashboard_analytics import OpenDataPublication, DashboardAnalyticsCache

def seed_open_data_transparency():
    db = SessionLocal()
    print("Starting Open Data, Municipal Indicators & Transparency Seeding...")

    # 1. Clear existing test data
    db.query(OpenDataRecord).delete()
    db.query(MunicipalIndicator).delete()
    db.query(CitizenDataRequest).delete()
    db.query(OpenDataPublication).delete()
    db.commit()

    # ─────────────────────────────────────────────────────────────────────────────
    # A. OPEN DATA RECORDS (open_data_records)
    # ─────────────────────────────────────────────────────────────────────────────
    records = [
        # 1. जनसांख्यिकी
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="datasets",
            title="पाँचपोखरी थाङपाल गाउँपालिका वडागत जनसांख्यिक लगत (राष्ट्रिय जनगणना २०७८)",
            sub_category="जनसांख्यिकी तथा घरधुरी",
            fiscal_year="२०७८/०७९",
            ward_number=0,
            description="राष्ट्रिय जनगणना २०७८ अनुसार वडा १ देखि ८ सम्मको कुल जनसंख्या, पुरुष/महिला अनुपात, कुल घरधुरी, औसत परिवार संख्या र साक्षरता दर।",
            format="CSV, JSON",
            file_size="४८ KB",
            records_count=8,
            publish_date="२०७९-१२-१५",
            author_or_department="योजना, तथ्याङ्क तथा सूचना प्रविधि शाखा",
            target_goal="तथ्याङ्क पारदर्शिता तथा वडागत योजना तर्जुमा",
            budget_allocated=0,
            tag_badge="आधिकारिक जनगणना",
            status="प्रकाशित",
            download_count=184,
            license="CC-BY-SA 4.0",
            api_endpoint="/api/v1/open-data/records/ds-demographics",
            is_featured=True,
            columns_schema=[
                {"field": "ward_no", "type": "integer", "description": "वडा नम्बर"},
                {"field": "ward_name", "type": "string", "description": "वडाको नाम"},
                {"field": "total_population", "type": "integer", "description": "कुल जनसङ्ख्या"},
                {"field": "male", "type": "integer", "description": "पुरुष सङ्ख्या"},
                {"field": "female", "type": "integer", "description": "महिला सङ्ख्या"},
                {"field": "households", "type": "integer", "description": "घरधुरी सङ्ख्या"},
                {"field": "literacy_rate", "type": "float", "description": "साक्षरता दर (%)"}
            ],
            sample_data=[
                {"ward_no": 1, "ward_name": "बाँसखर्क", "total_population": 2480, "male": 1210, "female": 1270, "households": 580, "literacy_rate": 68.5},
                {"ward_no": 2, "ward_name": "बरुवा", "total_population": 2950, "male": 1420, "female": 1530, "households": 690, "literacy_rate": 71.2},
                {"ward_no": 3, "ward_name": "भोताङ", "total_population": 3420, "male": 1680, "female": 1740, "households": 810, "literacy_rate": 74.6},
                {"ward_no": 4, "ward_name": "थाङपालकोट", "total_population": 2890, "male": 1390, "female": 1500, "households": 670, "literacy_rate": 76.1},
                {"ward_no": 5, "ward_name": "गुन्सा", "total_population": 2640, "male": 1280, "female": 1360, "households": 610, "literacy_rate": 73.8},
                {"ward_no": 6, "ward_name": "थाङपालधाप", "total_population": 3180, "male": 1550, "female": 1630, "households": 740, "literacy_rate": 82.4},
                {"ward_no": 7, "ward_name": "तिपेनी", "total_population": 2540, "male": 1240, "female": 1300, "households": 590, "literacy_rate": 79.5},
                {"ward_no": 8, "ward_name": "लाँगर्चे", "total_population": 2315, "male": 1120, "female": 1195, "households": 540, "literacy_rate": 70.2}
            ],
            key_indicators={"कुल जनसङ्ख्या": "२२,४१५", "घरधुरी": "५,८०५", "साक्षरता": "७४.६%"}
        ),

        # 2. बजेट तथा वित्तीय खुला तथ्याङ्क
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="datasets",
            title="वार्षिक बजेट विनियोजन तथा खर्च स्थिति विवरण (आ.व. २०८०/८१ र २०८१/८२)",
            sub_category="बजेट तथा वित्तीय विश्लेषण",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="गाउँसभाबाट स्वीकृत चालु तथा पुँजीगत बजेट, समानीकरण अनुदान, राजस्व बाँडफाँड, आन्तरिक आय र त्रैमासिक खर्चको शीर्षकगत खुला लगत।",
            format="CSV, JSON, XLSX",
            file_size="६५ KB",
            records_count=48,
            publish_date="२०८१-०४-०१",
            author_or_department="आर्थिक प्रशासन शाखा",
            target_goal="वित्तीय सुशासन तथा बजेट पारदर्शिता",
            budget_allocated=684000000.00,
            tag_badge="वार्षिक बजेट",
            status="प्रकाशित",
            download_count=242,
            license="CC-BY-SA 4.0",
            is_featured=True,
            columns_schema=[
                {"field": "sector", "type": "string", "description": "क्षेत्रगत शीर्षक"},
                {"field": "allocated_npr", "type": "currency", "description": "विनियोजित बजेट (रु)"},
                {"field": "expenditure_npr", "type": "currency", "description": "खर्च रकम (रु)"},
                {"field": "progress_pct", "type": "percentage", "description": "वित्तीय प्रगति (%)"}
            ],
            sample_data=[
                {"sector": "आर्थिक विकास (कृषि, पशु, पर्यटन, उद्योग)", "allocated_npr": 84500000, "expenditure_npr": 61200000, "progress_pct": 72.4},
                {"sector": "सामाजिक विकास (शिक्षा, स्वास्थ्य, खानेपानी, महिला/बालबालिका)", "allocated_npr": 195000000, "expenditure_npr": 165000000, "progress_pct": 84.6},
                {"sector": "पूर्वाधार विकास (सडक, पुल, भवन, सिँचाइ, ऊर्जा)", "allocated_npr": 268000000, "expenditure_npr": 218000000, "progress_pct": 81.3},
                {"sector": "वातावरण तथा विपद् व्यवस्थापन", "allocated_npr": 42500000, "expenditure_npr": 32000000, "progress_pct": 75.3},
                {"sector": "संस्थागत विकास, सेवा प्रवाह र सुशासन", "allocated_npr": 94000000, "expenditure_npr": 82000000, "progress_pct": 87.2}
            ],
            key_indicators={"कुल बजेट": "रु ६८.४ करोड", "पुँजीगत खर्च": "७८.२%", "आन्तरिक राजस्व": "रु ६.२ करोड"}
        ),

        # 3. विकास आयोजनाहरू
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="datasets",
            title="चालू तथा सम्पन्न स्थानीय विकास आयोजनाहरूको विस्तृत लगत (PPIS)",
            sub_category="भौतिक पूर्वाधार तथा आयोजना",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="गाउँपालिका अन्तर्गतका १ देखि ८ वडामा सञ्चालित सडक, सिँचाइ, खानेपानी, विद्यालय भवन तथा तटबन्ध आयोजनाहरूको सम्झौता, लागत, भौतिक प्रगति र उपभोक्ता समिति विवरण।",
            format="CSV, JSON",
            file_size="८२ KB",
            records_count=124,
            publish_date="२०८१-०५-१०",
            author_or_department="पूर्वाधार विकास तथा योजना शाखा",
            target_goal="सम्पत्ति तथा आयोजना डिजिटल अनुगमन",
            budget_allocated=268000000.00,
            tag_badge="PPIS आयोजना",
            status="प्रकाशित",
            download_count=310,
            license="CC-BY-SA 4.0",
            is_featured=True,
            columns_schema=[
                {"field": "project_name", "type": "string", "description": "आयोजनाको नाम"},
                {"field": "ward_no", "type": "integer", "description": "वडा नं."},
                {"field": "budget_npr", "type": "currency", "description": "लागत रकम (रु)"},
                {"field": "physical_progress", "type": "percentage", "description": "भौतिक प्रगति (%)"},
                {"field": "contractor", "type": "string", "description": "कार्यान्वयन पक्ष"}
            ],
            sample_data=[
                {"project_name": "थाङपालकोट-छिम्ती सडक स्तरोन्नति तथा कालोपत्रे", "ward_no": 4, "budget_npr": 45000000, "physical_progress": 85, "contractor": "अमर कन्स्ट्रक्सन प्रा.लि."},
                {"project_name": "पाँचपोखरी रिङरोड पदमार्ग पूर्वाधार निर्माण", "ward_no": 3, "budget_npr": 28000000, "physical_progress": 92, "contractor": "उपभोक्ता समिति"},
                {"project_name": "बरुवा एकीकृत खानेपानी तथा सरसफाइ आयोजना", "ward_no": 2, "budget_npr": 18500000, "physical_progress": 100, "contractor": "खानेपानी उपभोक्ता समिति"},
                {"project_name": "बाँसखर्क कृषि उपज संकलन तथा शीत भण्डारण केन्द्र", "ward_no": 1, "budget_npr": 14000000, "physical_progress": 78, "contractor": "कृषक सहकारी"}
            ]
        ),

        # 4. शिक्षा तथा विद्यालय विवरण
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="datasets",
            title="सामुदायिक तथा संस्थागत विद्यालय विवरण, विद्यार्थी तथा शिक्षक दरबन्दी लगत (IEMIS)",
            sub_category="शिक्षा तथा बालविकास",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="पालिकाका ३६ सामुदायिक विद्यालय, २ संस्थागत विद्यालय, विद्यार्थी भर्ना संख्या, छात्र/छात्रा अनुपात, दिवाखाजा कार्यक्रम तथा शिक्षक दरबन्दी स्थिति।",
            format="CSV, JSON",
            file_size="४२ KB",
            records_count=38,
            publish_date="२०८१-०३-२०",
            author_or_department="शिक्षा, युवा तथा खेलकुद शाखा",
            target_goal="सबैका लागि गुणस्तरीय तथा प्रविधिमैत्री शिक्षा",
            budget_allocated=112000000.00,
            tag_badge="IEMIS शिक्षा",
            status="प्रकाशित",
            download_count=156,
            license="CC-BY-SA 4.0",
            sample_data=[
                {"school_name": "श्री रैथाने माध्यमिक विद्यालय", "ward_no": 6, "total_students": 420, "teachers": 22, "computer_lab": True, "wash_facility": True},
                {"school_name": "श्री भोताङ देवी माध्यमिक विद्यालय", "ward_no": 3, "total_students": 380, "teachers": 19, "computer_lab": True, "wash_facility": True},
                {"school_name": "श्री बाँसखर्क आधारभूत विद्यालय", "ward_no": 1, "total_students": 160, "teachers": 10, "computer_lab": False, "wash_facility": True},
                {"school_name": "श्री याङ्ग्री आधारभूत विद्यालय", "ward_no": 2, "total_students": 145, "teachers": 9, "computer_lab": False, "wash_facility": True}
            ]
        ),

        # 5. स्वास्थ्य संस्था तथा सेवाग्राही
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="datasets",
            title="स्वास्थ्य संस्था, दरबन्दी, औषधी मौज्दात तथा सेवाग्राही मासिक लगत (HMIS/DHIS2)",
            sub_category="स्वास्थ्य तथा पोषण",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="प्राथमिक अस्पताल, ८ वटा स्वास्थ्य चौकी, २ आधारभूत स्वास्थ्य सेवा केन्द्र, निःशुल्क औषधि मौज्दात, सुरक्षित मातृत्व तथा खोप सेवा उपभोग दर।",
            format="CSV, JSON",
            file_size="३८ KB",
            records_count=11,
            publish_date="२०८१-०४-१०",
            author_or_department="स्वास्थ्य शाखा",
            target_goal="गुणस्तरीय आधारभूत स्वास्थ्य सेवामा नागरिक पहुँच",
            budget_allocated=68000000.00,
            tag_badge="HMIS स्वास्थ्य",
            status="प्रकाशित",
            download_count=198,
            license="CC-BY-SA 4.0",
            sample_data=[
                {"facility_name": "पाँचपोखरी प्राथमिक अस्पताल (तिपेनी)", "ward_no": 7, "beds": 15, "opd_monthly": 1450, "ambulance_service": True},
                {"facility_name": "भोताङ स्वास्थ्य चौकी", "ward_no": 3, "beds": 3, "opd_monthly": 420, "ambulance_service": True},
                {"facility_name": "बरुवा स्वास्थ्य चौकी", "ward_no": 2, "beds": 2, "opd_monthly": 310, "ambulance_service": False},
                {"facility_name": "बाँसखर्क स्वास्थ्य चौकी", "ward_no": 1, "beds": 2, "opd_monthly": 280, "ambulance_service": False}
            ]
        ),

        # 6. कृषि तथा पशुपन्छी
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="datasets",
            title="कृषि तथा पशुपन्छी उत्पादन, याक/चौंरीपालन, ट्राउट माछा तथा बाली लगत",
            sub_category="कृषि, पशु तथा खाद्य सम्प्रभुता",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="वडागत किवी, आलु, मकै, चिया, ट्राउट माछा, याक/चौंरी, भेडा-बाख्रा पालन लगत र पालिका अनुदान प्राप्त कृषक समूह सूची।",
            format="CSV, JSON",
            file_size="५२ KB",
            records_count=8,
            publish_date="२०८१-०२-१५",
            author_or_department="कृषि तथा पशुपन्छी विकास शाखा",
            target_goal="व्यावसायिक कृषि तथा उच्च हिमाली पशुपालन प्रवर्धन",
            budget_allocated=42000000.00,
            tag_badge="कृषि लगत",
            status="प्रकाशित",
            download_count=145,
            license="CC-BY-SA 4.0"
        ),

        # 7. विपद् जोखिम तथा आश्रयस्थल
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="datasets",
            title="विपद् जोखिम संवेदनशील क्षेत्र, पहिरो नक्साङ्कन, सुरक्षित आश्रयस्थल तथा आपत्कालीन गोदाम",
            sub_category="विपद् जोखिम न्यूनीकरण तथा पूर्वतयारी",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="बाढी, पहिरो र भूकम्पीय जोखिम क्षेत्र, २४ वटा सुरक्षित आश्रयस्थल, आपत्कालीन उद्धार सामग्री मौज्दात र सम्पर्क व्यक्तिहरूको डिजिटल लगत।",
            format="CSV, JSON, GeoJSON",
            file_size="५६ KB",
            records_count=24,
            publish_date="२०८१-०३-१२",
            author_or_department="विपद् व्यवस्थापन शाखा",
            target_goal="सुरक्षित तथा उत्थानशील पाँचपोखरी निर्माण",
            budget_allocated=35000000.00,
            tag_badge="विपद् लगत",
            status="प्रकाशित",
            download_count=215,
            license="CC-BY-SA 4.0"
        ),

        # 8. सामाजिक सुरक्षा लाभग्राही
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="datasets",
            title="सामाजिक सुरक्षा भत्ता लाभग्राही लगत (ज्येष्ठ नागरिक, एकल महिला, अपाङ्गता, बालबालिका)",
            sub_category="सामाजिक सुरक्षा तथा पञ्जीकरण",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="वडागत लाभग्राही संख्या, त्रैमासिक भुक्तानी रकम, बैंकिङ प्रणालीमार्फत वितरण स्थिति र नयाँ लगत प्रविष्टि विवरण।",
            format="CSV, JSON",
            file_size="६४ KB",
            records_count=8,
            publish_date="२०८१-०४-२५",
            author_or_department="पञ्जीकरण तथा सामाजिक सुरक्षा शाखा",
            target_goal="शतप्रतिशत डिजिटल बैंकिङ प्रणालीबाट भत्ता वितरण",
            budget_allocated=54000000.00,
            tag_badge="SSIS सामाजिक सुरक्षा",
            status="प्रकाशित",
            download_count=188,
            license="CC-BY-SA 4.0"
        ),

        # 9. सार्वजनिक प्रतिवेदनहरू (Reports)
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="reports",
            title="पाँचपोखरी थाङपाल गाउँपालिकाको वार्षिक प्रगति प्रतिवेदन (आ.व. २०८०/०८१)",
            sub_category="वार्षिक समीक्षा तथा प्रगति",
            fiscal_year="२०८०/०८१",
            ward_number=0,
            description="गत आर्थिक वर्षमा सम्पन्न भौतिक पूर्वाधार, सामाजिक विकास, संस्थागत सुधार, बजेट खर्च विवरण तथा लक्ष्य प्राप्तिको विस्तृत समीक्षा प्रतिवेदन।",
            format="PDF",
            file_size="८.४ MB",
            records_count=180,
            publish_date="२०८१-०४-२०",
            author_or_department="गाउँ कार्यपालिकाको कार्यालय",
            target_goal="सार्वजनिक जवाफदेहिता तथा नागरिक समीक्षा",
            budget_allocated=0,
            tag_badge="आधिकारिक प्रतिवेदन",
            status="प्रकाशित",
            download_count=420,
            license="CC-BY-SA 4.0"
        ),

        # 10. चौमासिक सामाजिक परीक्षण तथा सार्वजनिक सुनुवाइ प्रतिवेदन
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="reports",
            title="सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण एकीकृत प्रतिवेदन (२०८०/८१)",
            sub_category="सुशासन तथा नागरिक पृष्ठपोषण",
            fiscal_year="२०८०/०८१",
            ward_number=0,
            description="८ वटै वडामा सम्पन्न सामाजिक परीक्षण, नागरिकका गुनासा, उठेका सवालहरू तथा कार्यपालिकाको सार्वजनिक प्रतिबद्धता प्रतिवेदन।",
            format="PDF",
            file_size="४.२ MB",
            records_count=45,
            publish_date="२०८१-०२-२८",
            author_or_department="अनुगमन तथा सुशासन समिति",
            target_goal="पारदर्शी स्थानीय शासन र सहभागितामूलक जवाफदेहिता",
            budget_allocated=0,
            tag_badge="नागरिक सुनुवाइ",
            status="प्रकाशित",
            download_count=312,
            license="CC-BY-SA 4.0"
        ),

        # 11. महालेखा परीक्षकको लेखापरीक्षण तथा बेरुजु प्रतिवेदन
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="reports",
            title="महालेखा परीक्षकको ६१ औं वार्षिक प्रतिवेदन (पाँचपोखरी थाङपाल सम्बन्धी खण्ड) र बेरुजु फछ्र्यौट कार्ययोजना",
            sub_category="वित्तीय अनुशासन तथा लेखापरीक्षण",
            fiscal_year="२०८०/०८१",
            ward_number=0,
            description="लेखापरीक्षणबाट औंल्याइएका बुँदाहरू, बेरुजु फछ्र्यौट दर (८८.५%) तथा आगामी आर्थिक अनुशासन सुदृढीकरण कार्ययोजना।",
            format="PDF",
            file_size="३.६ MB",
            records_count=24,
            publish_date="२०८१-०२-१०",
            author_or_department="आन्तरिक लेखापरीक्षण एकाइ",
            target_goal="शून्य बेरुजु लक्ष्य र वित्तीय पारदर्शिता",
            budget_allocated=0,
            tag_badge="लेखापरीक्षण प्रतिवेदन",
            status="प्रकाशित",
            download_count=285,
            license="CC-BY-SA 4.0"
        ),

        # 12. रणनीतिक योजना (Strategic)
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="strategic",
            title="पाँचपोखरी थाङपाल गाउँपालिका आवधिक विकास योजना (२०७९-२०८४)",
            sub_category="मध्यमकालीन तथा दीर्घकालीन योजना",
            fiscal_year="२०८०/०८१",
            ward_number=0,
            description="गाउँपालिकाको ५ वर्षे रणनीति: 'कृषि, पर्यटन र दिगो पूर्वाधार - समृद्ध पाँचपोखरी थाङपालको आधार' मूल नारासहितको एकीकृत आवधिक दस्तावेज।",
            format="PDF",
            file_size="१२.५ MB",
            records_count=1,
            publish_date="२०७९-०९-१५",
            author_or_department="योजना तर्जुमा समिति",
            target_goal="समृद्ध तथा आत्मनिर्भर पाँचपोखरी थाङपाल",
            budget_allocated=0,
            tag_badge="आवधिक योजना",
            status="प्रकाशित",
            download_count=540,
            license="CC-BY-SA 4.0"
        ),

        # 13. मध्यमकालीन खर्च संरचना (MTED)
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="strategic",
            title="मध्यमकालीन खर्च संरचना (MTED) २०८१/८२ - २०८३/८४",
            sub_category="बजेट तथा वित्तीय प्रक्षेपण",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="तीन वर्षे स्रोत अनुमान, क्षेत्रगत बजेट सीमा, बहुवर्षीय आयोजना तथा दिगो विकास लक्ष्य तालमेल खाका।",
            format="PDF, XLSX",
            file_size="५.८ MB",
            records_count=3,
            publish_date="२०८१-०३-१५",
            author_or_department="योजना तथा बजेट तर्जुमा शाखा",
            target_goal="योजनाबद्ध बजेट विनियोजन र स्रोत सुनिश्चितता",
            budget_allocated=0,
            tag_badge="MTED खाका",
            status="प्रकाशित",
            download_count=380,
            license="CC-BY-SA 4.0"
        ),

        # 14. असल अभ्यासहरू (Practices)
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="practices",
            title="पाँचपोखरी ट्रेल रेस तथा पर्यटन प्रवर्धन: स्थानीय अर्थतन्त्र रूपान्तरण नमुना",
            sub_category="दिगो पर्यटन तथा स्थानीय रोजगारी",
            fiscal_year="२०८०/०८१",
            ward_number=3,
            description="उच्च हिमाली पाँचपोखरी धावक प्रतियोगिता (Trail Race) तथा होमस्टे प्रवर्धनबाट स्थानीय शेर्पा तथा तामाङ समुदायको आयआर्जन ३५% ले वृद्धि भएको असल अभ्यास।",
            format="PDF",
            file_size="३.२ MB",
            records_count=1,
            publish_date="२०८०-११-२५",
            author_or_department="पर्यटन तथा संस्कृति शाखा",
            target_goal="पर्यावरणमैत्री पर्यटनबाट स्थानीय रोजगारी सिर्जना",
            budget_allocated=5000000.00,
            tag_badge="असल अभ्यास",
            status="प्रकाशित",
            download_count=360,
            license="CC-BY-SA 4.0"
        ),

        # 15. अर्गानिक किवी तथा ट्राउट माछा ब्रान्डिङ
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="practices",
            title="पाँचपोखरी अर्गानिक किवी, चिया तथा हिमाली ट्राउट माछा ब्रान्डिङ तथा बजार पहुँच",
            sub_category="कृषि मूल्य शृङ्खला तथा ब्राण्डिङ",
            fiscal_year="२०८१/०८२",
            ward_number=1,
            description="बाँसखर्क र बरुवामा उत्पादित किवी र हिमाली ट्राउट माछालाई काठमाडौं तथा अन्तर्राष्ट्रिय बजारसम्म जोड्ने सहकारी मोडल र पालिका प्याकेजिङ अनुदान कार्यक्रम।",
            format="PDF",
            file_size="२.८ MB",
            records_count=1,
            publish_date="२०८१-०१-१०",
            author_or_department="कृषि शाखा तथा सहकारी शाखा",
            target_goal="कृषकको प्रत्यक्ष आम्दानी वृद्धि र मूल्य शृङ्खला विकास",
            budget_allocated=8000000.00,
            tag_badge="कृषि नमुना",
            status="प्रकाशित",
            download_count=295,
            license="CC-BY-SA 4.0"
        ),

        # 16. सूचनाको हक (RTI) त्रैमासिक सार्वजनिक खुलासा
        OpenDataRecord(
            id=str(uuid.uuid4()),
            category="reports",
            title="सूचनाको हक सम्बन्धी ऐन २०६४ बमोजिम २० प्रकारका सार्वजनिक सूचनाहरूको स्वतः प्रकाशन (त्रैमासिक)",
            sub_category="पारदर्शिता तथा सूचनाको हक",
            fiscal_year="२०८१/०८२",
            ward_number=0,
            description="सूचनाको हक ऐन २०६४ को दफा ५ (३) र नियमावली ३ बमोजिम कार्यपालिकाले प्रत्येक ३/३ महिनामा सार्वजनिक गर्नुपर्ने २० प्रकारका एकीकृत आधिकारिक विवरणहरू।",
            format="PDF, JSON",
            file_size="४.५ MB",
            records_count=20,
            publish_date="२०८१-०४-१५",
            author_or_department="सूचना प्रविधि तथा जनसम्पर्क शाखा",
            target_goal="नागरिकको सुसूचित हुने संवैधानिक हकको ग्यारेन्टी",
            budget_allocated=0,
            tag_badge="RTI प्रकाशन",
            status="प्रकाशित",
            download_count=410,
            license="CC-BY-SA 4.0"
        )
    ]

    for rec in records:
        db.add(rec)
    db.commit()
    print(f"Added {len(records)} Open Data Records.")

    # ─────────────────────────────────────────────────────────────────────────────
    # B. MUNICIPAL INDICATORS (municipal_indicators)
    # ─────────────────────────────────────────────────────────────────────────────
    indicators = [
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-DEMO-01",
            title_np="कुल जनसङ्ख्या तथा लैङ्गिक सन्तुलन",
            title_en="Total Population & Sex Ratio",
            category="demography",
            baseline_value="२१,८०० (२०६८)",
            current_value="२२,४१५",
            target_value="२३,००० (२०८४)",
            unit="जना",
            progress_percent=97,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 10: असमानता न्यूनीकरण",
            status="on_track",
            source_department="योजना तथा तथ्याङ्क शाखा",
            ward_breakdown={"वडा १": 2480, "वडा २": 2950, "वडा ३": 3420, "वडा ४": 2890, "वडा ५": 2640, "वडा ६": 3180, "वडा ७": 2540, "वडा ८": 2315},
            trend_history={"२०७८": 22415, "२०७९": 22520, "२०८०": 22610, "२०८१": 22730}
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-DEMO-02",
            title_np="समग्र साक्षरता दर",
            title_en="Overall Literacy Rate",
            category="education",
            baseline_value="६२.४%",
            current_value="७४.८%",
            target_value="८५.०%",
            unit="प्रतिशत",
            progress_percent=88,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 4: गुणस्तरीय शिक्षा",
            status="on_track",
            source_department="शिक्षा शाखा",
            ward_breakdown={"वडा १": 68.5, "वडा २": 71.2, "वडा ३": 74.6, "वडा ४": 76.1, "वडा ५": 73.8, "वडा ६": 82.4, "वडा ७": 79.5, "वडा ८": 70.2}
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-FIN-01",
            title_np="आन्तरिक राजस्व संकलन दर र अनुपात",
            title_en="Internal Revenue Realization Ratio",
            category="finance",
            baseline_value="रु ३.८ करोड",
            current_value="रु ६.२ करोड (११.८%)",
            target_value="रु ८.० करोड (१५%)",
            unit="करोड रु.",
            progress_percent=78,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 8: मर्यादित काम र आर्थिक वृद्धि",
            status="on_track",
            source_department="राजस्व शाखा",
            trend_history={"२०७९/८०": 4.1, "२०८०/८१": 5.4, "२०८१/८२": 6.2}
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-FIN-02",
            title_np="पुँजीगत खर्च प्रतिशत",
            title_en="Capital Expenditure Progress",
            category="finance",
            baseline_value="६२.०%",
            current_value="७८.२%",
            target_value="९०.०%",
            unit="प्रतिशत",
            progress_percent=87,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 9: उद्योग, नवीन खोज र पूर्वाधार",
            status="on_track",
            source_department="आर्थिक प्रशासन शाखा"
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-HLTH-01",
            title_np="पूर्ण खोप सुनिश्चितता तथा कभरेज दर",
            title_en="Full Immunization Coverage",
            category="health",
            baseline_value="८६.०%",
            current_value="९८.४%",
            target_value="१००.०%",
            unit="प्रतिशत",
            progress_percent=98,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 3: असल स्वास्थ्य र समृद्ध जीवन",
            status="achieved",
            source_department="स्वास्थ्य शाखा"
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-HLTH-02",
            title_np="संस्थागत सुत्केरी दर (Institutional Delivery)",
            title_en="Institutional Delivery Rate",
            category="health",
            baseline_value="६८.०%",
            current_value="९१.२%",
            target_value="९५.०%",
            unit="प्रतिशत",
            progress_percent=96,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 3: असल स्वास्थ्य र समृद्ध जीवन",
            status="on_track",
            source_department="स्वास्थ्य शाखा"
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-INFRA-01",
            title_np="आधारभूत खानेपानी सुविधा पुगेका घरधुरी",
            title_en="Households with Piped Safe Drinking Water",
            category="infrastructure",
            baseline_value="६४.०%",
            current_value="८९.२%",
            target_value="१००.०%",
            unit="प्रतिशत",
            progress_percent=89,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 6: स्वच्छ खानेपानी र सरसफाइ",
            status="on_track",
            source_department="खानेपानी तथा सरसफाइ एकाइ"
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-INFRA-02",
            title_np="१२-महिने सडक सञ्जाल पहुँच (Baramase Road Access)",
            title_en="All-weather Road Connectivity",
            category="infrastructure",
            baseline_value="३२ कि.मी.",
            current_value="६८ कि.मी. (७२%)",
            target_value="९५ कि.मी.",
            unit="कि.मी.",
            progress_percent=72,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 9: उद्योग, नवीन खोज र पूर्वाधार",
            status="needs_attention",
            source_department="पूर्वाधार शाखा"
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-GOV-01",
            title_np="औसत नागरिक सिफारिस फछ्र्यौट समय (Digital Sifaris)",
            title_en="Average Citizen Sifaris Turnaround Time",
            category="governance",
            baseline_value="२४ घण्टा",
            current_value="२.५ घण्टा",
            target_value="१ घण्टा",
            unit="घण्टा",
            progress_percent=90,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 16: शान्ति, न्याय र बलिया संस्थाहरू",
            status="achieved",
            source_department="सूचना प्रविधि शाखा"
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-GOV-02",
            title_np="बेरुजु फछ्र्यौट दर (Audit Clearance Ratio)",
            title_en="Audit Irregularity Settlement Ratio",
            category="governance",
            baseline_value="६२.०%",
            current_value="८८.५%",
            target_value="९५.०%",
            unit="प्रतिशत",
            progress_percent=93,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 16: शान्ति, न्याय र बलिया संस्थाहरू",
            status="on_track",
            source_department="आन्तरिक लेखापरीक्षण एकाइ"
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-AGRI-01",
            title_np="कृषि तथा पशुपालन अनुदान प्राप्त कृषक सङ्ख्या",
            title_en="Subsidized Commercial Farmers",
            category="agriculture",
            baseline_value="२२० जना",
            current_value="१,४५० जना",
            target_value="२,००० जना",
            unit="घरधुरी",
            progress_percent=73,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 2: शून्य भोकमरी",
            status="on_track",
            source_department="कृषि तथा पशु शाखा"
        ),
        MunicipalIndicator(
            id=str(uuid.uuid4()),
            indicator_code="IND-SDG-01",
            title_np="दिगो विकास लक्ष्य स्थानीयकरण समग्र सूचक (Palika SDG Index)",
            title_en="Overall Municipal SDG Localization Index",
            category="sdg",
            baseline_value="५८.२",
            current_value="७६.४",
            target_value="८५.०",
            unit="अङ्क (१०० मा)",
            progress_percent=90,
            fiscal_year="२०८१/०८२",
            sdg_goal="SDG 17: लक्ष्य प्राप्तिका लागि साझेदारी",
            status="on_track",
            source_department="योजना शाखा"
        )
    ]

    for ind in indicators:
        db.add(ind)
    db.commit()
    print(f"Added {len(indicators)} Municipal Indicators.")

    # ─────────────────────────────────────────────────────────────────────────────
    # C. OPEN DATA PUBLICATIONS (dash_open_data_publications)
    # ─────────────────────────────────────────────────────────────────────────────
    publications = [
        OpenDataPublication(
            id=str(uuid.uuid4()),
            dataset_name="पालिका घरधुरी तथा सामाजिक-आर्थिक लगत (Household Registry 360)",
            category="demographics",
            description="५,८०५ घरधुरीको आधिकारिक पारिवारिक, घर संरचना, पिउने पानी तथा सामाजिक सुरक्षाको खुला लगत।",
            source_table_or_query="household_registries",
            format="JSON, CSV",
            record_count=5805,
            download_count=320,
            is_published=True,
            published_by="प्रमुख प्रशासकीय अधिकृत",
            api_endpoint="/api/v1/demographics/households"
        ),
        OpenDataPublication(
            id=str(uuid.uuid4()),
            dataset_name="वार्षिक बजेट विनियोजन तथा खर्च स्थिति (Municipal Budget Line Items)",
            category="finance",
            description="गाउँसभाबाट पारित बजेट शीर्षक, क्षेत्रगत बाँडफाँड र खर्चको खुला तथ्याङ्क।",
            source_table_or_query="budgets",
            format="JSON, CSV, XLSX",
            record_count=186,
            download_count=410,
            is_published=True,
            published_by="प्रमुख प्रशासकीय अधिकृत",
            api_endpoint="/api/v1/budgets"
        ),
        OpenDataPublication(
            id=str(uuid.uuid4()),
            dataset_name="स्थानीय विकास आयोजना तथा पूर्वाधार प्रगति (PPIS Projects)",
            category="infrastructure",
            description="वडागत विकास निर्माण आयोजनाहरूको सम्झौता रकम, भुक्तानी र भौतिक प्रगति विवरण।",
            source_table_or_query="projects",
            format="JSON, CSV",
            record_count=124,
            download_count=290,
            is_published=True,
            published_by="योजना अधिकृत",
            api_endpoint="/api/v1/projects"
        ),
        OpenDataPublication(
            id=str(uuid.uuid4()),
            dataset_name="सामुदायिक विद्यालय तथा शैक्षिक विवरण (Education IEMIS)",
            category="education",
            description="पालिकाका ३६ सामुदायिक विद्यालयहरूको विद्यार्थी भर्ना, शिक्षक दरबन्दी र भौतिक पूर्वाधार।",
            source_table_or_query="schools",
            format="JSON, CSV",
            record_count=38,
            download_count=185,
            is_published=True,
            published_by="शिक्षा अधिकृत",
            api_endpoint="/api/v1/education/schools"
        ),
        OpenDataPublication(
            id=str(uuid.uuid4()),
            dataset_name="स्वास्थ्य संस्था, दरबन्दी तथा सेवा लगत (Health Facilities & HMIS)",
            category="health",
            description="प्राथमिक अस्पताल तथा स्वास्थ्य चौकीहरूको शय्या, जनशक्ति र नियमित सेवाग्राही विवरण।",
            source_table_or_query="health_facilities",
            format="JSON, CSV",
            record_count=11,
            download_count=210,
            is_published=True,
            published_by="स्वास्थ्य शाखा प्रमुख",
            api_endpoint="/api/v1/health/facilities"
        ),
        OpenDataPublication(
            id=str(uuid.uuid4()),
            dataset_name="पर्यटन गन्तव्य, पदमार्ग तथा होमस्टे लगत (Tourism GIS Inventory)",
            category="tourism",
            description="पाँचपोखरी कुण्ड, आमा याङ्ग्री, मन्दिर, गुम्बा र पदमार्ग पूर्वाधारको जीपीएस खुला लगत।",
            source_table_or_query="tourism_destinations",
            format="JSON, CSV, GeoJSON",
            record_count=42,
            download_count=345,
            is_published=True,
            published_by="पर्यटन अधिकृत",
            api_endpoint="/api/v1/tourism/destinations"
        ),
        OpenDataPublication(
            id=str(uuid.uuid4()),
            dataset_name="दर्ता भएका स्थानीय व्यवसाय तथा फार्महरू (Business Directory)",
            category="business",
            description="पालिकामा दर्ता भई सञ्चालनमा रहेका होटल, पसल, उद्योग तथा कृषि फार्महरूको सार्वजनिक सूची।",
            source_table_or_query="businesses",
            format="JSON, CSV",
            record_count=458,
            download_count=260,
            is_published=True,
            published_by="राजस्व अधिकृत",
            api_endpoint="/api/v1/business"
        ),
        OpenDataPublication(
            id=str(uuid.uuid4()),
            dataset_name="कृषक प्रोफाइल तथा अनुदान वितरण लगत (Farmer Profiles & Subsidies)",
            category="agriculture",
            description="व्यावसायिक कृषक, कृषि समूह, अनुदान तथा बीउ-मल वितरणको एकीकृत विवरण।",
            source_table_or_query="agriculture_farmers",
            format="JSON, CSV",
            record_count=1450,
            download_count=195,
            is_published=True,
            published_by="कृषि विकास अधिकृत",
            api_endpoint="/api/v1/agriculture/farmers"
        )
    ]

    for pub in publications:
        db.add(pub)
    db.commit()
    print(f"Added {len(publications)} Open Data Publications.")

    # ─────────────────────────────────────────────────────────────────────────────
    # D. CITIZEN DATA REQUESTS (citizen_data_requests)
    # ─────────────────────────────────────────────────────────────────────────────
    requests = [
        CitizenDataRequest(
            id=str(uuid.uuid4()),
            full_name="रमेश तामाङ",
            phone="९८४१२३४५६७",
            email="ramesh.tamang@gmail.com",
            organization="त्रिभुवन विश्वविद्यालय, भूगोल केन्द्रीय विभाग",
            dataset_title="वडा नं. ३ र ४ को भू-उपयोग तथा कृषि क्षेत्र परिवर्तन तथ्याङ्क (२०७०-२०८०)",
            purpose="स्नातकोत्तर तहको शोधकार्य (Academic Research for Master's Thesis)",
            ward_number=3,
            status="स्वीकृत/उपलब्ध",
            response_note="अनुरोध गरिएको लगत जीआईएस शाखाबाट तयार गरी पठाइएको छ।",
            response_file_url="/uploads/research_land_use_w3_w4.csv"
        ),
        CitizenDataRequest(
            id=str(uuid.uuid4()),
            full_name="अनिता श्रेष्ठ",
            phone="९८५११२२३३४",
            email="anita.shrestha@nepalpress.com",
            organization="नेपाल प्रेस (खोजी पत्रकारिता)",
            dataset_title="गत ३ वर्षको पुँजीगत बजेट खर्च तथा उपभोक्ता समिति ठेक्का सम्झौता लगत",
            purpose="स्थानीय विकास र बजेट पारदर्शिता सम्बन्धी खोजमूलक समाचार (Journalistic Investigation)",
            ward_number=0,
            status="प्रक्रियामा",
            response_note="आर्थिक प्रशासन र योजना शाखाबाट लगत रुजु भइरहेको छ।"
        ),
        CitizenDataRequest(
            id=str(uuid.uuid4()),
            full_name="दावा शेर्पा",
            phone="९८१२३४५६७८",
            email="dawa.sherpa@panchpokhari.org",
            organization="पाँचपोखरी पर्यटन विकास समाज",
            dataset_title="पाँचपोखरी मेलामा सहभागी आन्तरिक तथा बाह्य पर्यटक आगमन संख्या (२०८०)",
            purpose="पर्यटन पूर्वाधार योजना तथा पदमार्ग व्यवस्थापन",
            ward_number=3,
            status="दर्ता भएको"
        )
    ]

    for r in requests:
        db.add(r)
    db.commit()
    print(f"Added {len(requests)} Citizen Data Requests.")

    print("\n✓ ALL OPEN DATA, MUNICIPAL INDICATORS & TRANSPARENCY DATA SEEDED SUCCESSFULLY!")
    db.close()

if __name__ == "__main__":
    seed_open_data_transparency()
