from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.branch import Branch
from schemas.branch import BranchSchema, BranchCreate, BranchUpdate
from core.tenant import TenantContext, get_tenant_context
import uuid

router = APIRouter(
    prefix="/api/v1/branches",
    tags=["Branches"]
)

DEFAULT_BRANCHES = [
    # ─── 11 कोर पालिका शाखाहरू (Municipal Core Branches) ───
    {
        "name": "सामान्य प्रशासन शाखा",
        "code": "ADM",
        "type": "palika",
        "ward_number": None,
        "description": "कर्मचारी प्रशासन, बैठक व्यवस्थापन, आन्तरिक समन्वय, सार्वजनिक सेवा प्रवाह, दर्ता चलानी तथा सम्पत्ति संरक्षण।",
        "roles_and_responsibilities": [
            "गाउँ कार्यपालिका तथा गाउँसभाको बैठक, निर्णय प्रमाणीकरण तथा अभिलेख व्यवस्थापन",
            "कर्मचारी प्रशासन, हाजिरी, कार्यसम्पादन मूल्याङ्कन, सरुवा तथा बढुवा व्यवस्थापन",
            "एकीकृत ई-अफिस, टिप्पणी प्रणाली, दर्ता तथा चलानी व्यवस्थापन",
            "सार्वजनिक सम्पत्ति संरक्षण, कार्यालय जिन्सी लगत तथा सामान्य सेवा प्रवाह",
            "नागरिक बडापत्र कार्यान्वयन तथा आन्तरिक प्रशासन समन्वय"
        ],
        "head_employee_name": "कुमार बस्नेत",
        "contact_phone": "९८५१२७८५३०",
        "email": "admin@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": True,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "पूर्वाधार विकास शाखा",
        "code": "INF",
        "type": "palika",
        "ward_number": None,
        "description": "सडक, पुल, भवन, सिँचाइ, खानेपानी तथा भौतिक पूर्वाधार निर्माण, मर्मत सम्भार र गुणस्तर नियन्त्रण।",
        "roles_and_responsibilities": [
            "वार्षिक तथा आवधिक भौतिक पूर्वाधार योजना तर्जुमा, लागत अनुमान (Cost Estimation) र विस्तृत डिजाइन",
            "सडक सञ्जाल, झोलुङ्गे पुल, मोटरेबल पुल तथा सामुदायिक भवन निर्माण सुपरीवेक्षण",
            "खानेपानी, सरसफाइ तथा साना सिँचाइ आयोजना कार्यान्वयन",
            "उपभोक्ता समिति तथा ठेक्का सम्झौता व्यवस्थापन र प्राविधिक मूल्यांकन",
            "डिजिटल GIS म्यापिङ तथा पूर्वाधार डिजिटल जुम्ल्याहा (Digital Twin) अद्यावधिक"
        ],
        "head_employee_name": "ई. हिमाल लामा थिङ",
        "contact_phone": "९८४१२३४५६७",
        "email": "infrastructure@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "सामाजिक तथा आर्थिक विकास शाखा",
        "code": "SOC",
        "type": "palika",
        "ward_number": None,
        "description": "सामाजिक सुरक्षा, समावेशीकरण, महिला, बालबालिका, ज्येष्ठ नागरिक, अपाङ्गता तथा सीमान्तकृत समुदायको सशक्तीकरण।",
        "roles_and_responsibilities": [
            "सामाजिक सुरक्षा भत्ता वितरण, नवीकरण तथा बायोमेट्रिक लगत प्रमाणीकरण",
            "बालमैत्री स्थानीय शासन (CFLG) र लैङ्गिक समानता तथा सामाजिक समावेशीकरण (GESI) प्रवर्द्धन",
            "महिला, बालबालिका, ज्येष्ठ नागरिक तथा अपाङ्गता भएका व्यक्तिहरूको कल्याणकारी कार्यक्रम",
            "दलित, आदिवासी जनजाति, लोपोन्मुख तथा सीमान्तकृत समुदाय लक्षित उत्थान कार्यक्रम",
            "स्थानीय गैरसरकारी संस्था तथा विकास साझेदारहरूसँग समन्वय"
        ],
        "head_employee_name": "सुनिता श्रेष्ठ",
        "contact_phone": "९८४१२३४५६८",
        "email": "social.dev@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": True,
        "status": "active"
    },
    {
        "name": "शिक्षा, युवा तथा खेलकुद शाखा",
        "code": "EDU",
        "type": "palika",
        "ward_number": None,
        "description": "सामुदायिक तथा संस्थागत विद्यालय व्यवस्थापन, शिक्षक दरबन्दी, छात्रवृत्ति, परीक्षा सञ्चालन र युवा तथा खेलकुद प्रवर्द्धन।",
        "roles_and_responsibilities": [
            "सामुदायिक तथा संस्थागत विद्यालयहरूको नियमन, सुपरीवेक्षण र गुणस्तर अभिवृद्धि",
            "एकीकृत शैक्षिक व्यवस्थापन सूचना प्रणाली (IEMIS) लगत अद्यावधिक",
            "शिक्षक दरबन्दी मिलान, तालिम, परीक्षा सञ्चालन (आधारभूत तह कक्षा ८ परीक्षा) तथा नतिजा प्रकाशन",
            "स्थानीय पाठ्यक्रम निर्माण, दिवा खाजा कार्यक्रम तथा लक्षित छात्रवृत्ति वितरण",
            "राष्ट्रपति रनिङ सिल्ड, खेलकुद प्रतियोगिता तथा युवा सशक्तीकरण कार्यक्रम"
        ],
        "head_employee_name": "सुरेश अधिकारी",
        "contact_phone": "९८४१२३४५६९",
        "email": "education@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "आर्थिक प्रशासन शाखा",
        "code": "FIN",
        "type": "palika",
        "ward_number": None,
        "description": "बजेट निर्माण, निकासा, लेखा प्रणाली (SUTRA), राजस्व संकलन, वित्तीय प्रतिवेदन तथा आन्तरिक नियन्त्रण।",
        "roles_and_responsibilities": [
            "वार्षिक बजेट तर्जुमा, खर्च शीर्षक बाँडफाँड तथा वित्तीय व्यवस्थापन (SUTRA)",
            "योजना तथा कार्यक्रमहरूको भुक्तानी आदेश, चेक जारी तथा खाता सञ्चालन",
            "स्थानीय राजस्व, कर, दस्तुर, सेवा शुल्क संकलन तथा अनुगमन",
            "मासिक, चौमासिक तथा वार्षिक वित्तीय प्रतिवेदन तयारी र गाउँसभामा प्रस्तुति",
            "महालेखा परीक्षकको लेखापरीक्षण समन्वय तथा बेरुजु फछ्र्यौट"
        ],
        "head_employee_name": "विक्रम पनेरु",
        "contact_phone": "9749326623",
        "email": "accounts@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "कृषि विकास शाखा",
        "code": "AGR",
        "type": "palika",
        "ward_number": None,
        "description": "कृषि प्रसार, पकेट क्षेत्र विस्तार, उन्नत बीउबिजन तथा मलखाद वितरण, कृषक समूह गठन र प्राविधिक सल्लाह।",
        "roles_and_responsibilities": [
            "उन्नत जातका बीउ, बेर्ना, जैविक मल तथा आधुनिक कृषि औजार वितरण एवं अनुदान",
            "कृषि पकेट तथा ब्लक क्षेत्र पहिचान, माटो परीक्षण तथा बाली संरक्षण परामर्श",
            "कृषक समूह, कृषि सहकारी तथा कृषि उद्यमीहरूको क्षमता अभिवृद्धि तालिम",
            "प्रधानमन्त्री कृषि आधुनिकीकरण परियोजना समन्वय तथा बाली बीमा सहजीकरण",
            "कृषि उपज संकलन केन्द्र, शीत भण्डार (Cold Store) तथा हाटबजार व्यवस्थापन"
        ],
        "head_employee_name": "निमराज गिरी",
        "contact_phone": "9749326634",
        "email": "agriculture@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "पशु सेवा शाखा",
        "code": "LIV",
        "type": "palika",
        "ward_number": None,
        "description": "पशु स्वास्थ्य उपचार, खोप सेवा, नश्ल सुधार, पशुपन्छी फार्म व्यवस्थापन र दुग्ध तथा मासु उत्पादन प्रवर्द्धन।",
        "roles_and_responsibilities": [
            "पशु उपचार, बाझोपन निवारण, जुकाको औषधि तथा संक्रामक रोगविरुद्ध निःशुल्क खोप",
            "कृत्रिम गर्भाधान (AI), उन्नत नश्लका बाख्रा, राँगो, बोयर बोका वितरण",
            "व्यावसायिक पशुपालन फार्म दर्ता, प्राविधिक प्रमाणीकरण तथा अनुदान सिफारिस",
            "डेरी, चिलिङ सेन्टर, दाना व्यवस्थापन तथा दुग्ध उत्पादक कृषक प्रोत्साहन",
            "पशुपन्छी बीमा सहजीकरण तथा महामारी नियन्त्रण आकस्मिक सेवा"
        ],
        "head_employee_name": "माइसिङ तामाङ",
        "contact_phone": "९८४२१३४५७२",
        "email": "livestock@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "सूचना प्रविधि तथा अभिलेख व्यवस्थापन शाखा",
        "code": "ITR",
        "type": "palika",
        "ward_number": None,
        "description": "डिजिटल पालिका प्रणाली सञ्चालन, GIS तथा डाटा सेन्टर, ई-गभर्नेन्स, नेटवर्क सुरक्षा र विद्युतीय अभिलेख व्यवस्थापन।",
        "roles_and_responsibilities": [
            "एकीकृत डिजिटल पालिका जुम्ल्याहा (Municipal Digital Twins) पोर्टल सञ्चालन र मर्मत",
            "पालिका तथा ८ वटै वडा कार्यालयहरूको इन्टरनेट, नेटवर्क र हार्डवेयर सुरक्षा व्यवस्थापन",
            "डिजिटल नागरिक बडापत्र, मोबाइल एप, अनलाइन सिफारिस तथा ई-हाजिरी प्रणाली व्यवस्थापन",
            "स्थानिक GIS डाटा, ड्रोन नक्साङ्कन, क्यामेरा तथा बाढी पूर्वसूचना सेन्सर प्रणाली अनुगमन",
            "सरकारी कागजात, राजपत्र तथा महत्त्वपूर्ण दस्ताबेजहरूको विद्युतीय अभिलेखीकरण (DMS)"
        ],
        "head_employee_name": "नारायण क्षेत्री",
        "contact_phone": "९८६४११२९५५",
        "email": "it@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "स्वास्थ्य शाखा",
        "code": "HLT",
        "type": "palika",
        "ward_number": None,
        "description": "आधारभूत स्वास्थ्य सेवा, प्राथमिक स्वास्थ्य केन्द्र तथा स्वास्थ्य चौकी अनुगमन, खोप, पोषण र सुरक्षित मातृत्व कार्यक्रम।",
        "roles_and_responsibilities": [
            "प्राथमिक स्वास्थ्य केन्द्र तथा ८ वटै वडाका स्वास्थ्य चौकीहरूको सुपरीवेक्षण र औषधि आपूर्ति",
            "नियमित बाल खोप, कोभिड/मौसमी खोप तथा राष्ट्रिय स्वास्थ्य अभियान सञ्चालन",
            "सुरक्षित मातृत्व, संस्थागत सुत्केरी प्रोत्साहन तथा पोषण सहायता कार्यक्रम",
            "स्वास्थ्य व्यवस्थापन सूचना प्रणाली (HMIS/DHIS2) मा नियमित डाटा प्रविष्टि तथा प्रतिवेदन",
            "एम्बुलेन्स सेवा परिचालन, निःशुल्क स्वास्थ्य शिविर तथा महामारी नियन्त्रण"
        ],
        "head_employee_name": "उत्तम खनाल",
        "contact_phone": "९८४१२३४५७३",
        "email": "health@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "आन्तरिक लेखा परीक्षण इकाइ",
        "code": "AUD",
        "type": "palika",
        "ward_number": None,
        "description": "नियमित आन्तरिक आय-व्ययको लेखा परीक्षण, वित्तीय अनुशासन, सार्वजनिक खरिद अनुपालन र बेरुजु न्यूनीकरण।",
        "roles_and_responsibilities": [
            "गाउँपालिका तथा मातहतका कार्यालयहरूको नियमित चौमासिक आन्तरिक लेखा परीक्षण",
            "खर्चको आधिकारिकता, बजेट सीमा, कानुन तथा खरिद ऐन/नियमावली अनुपालन जाँच",
            "आन्तरिक नियन्त्रण प्रणाली (Internal Control System) सुदृढीकरण सम्बन्धी राय सुझाव",
            "अन्तिम लेखापरीक्षण पूर्व वित्तीय कागजात तथा प्रमाणकहरूको पूर्व-समीक्षा",
            "बेरुजु न्यूनीकरण, सम्परीक्षण सहजीकरण तथा वित्तीय पारदर्शिता प्रवर्द्धन"
        ],
        "head_employee_name": "अनिल पाण्डे",
        "contact_phone": "9847375930",
        "email": "audit@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "श्रम, उद्यम विकास तथा रोजगार शाखा",
        "code": "EMP",
        "type": "palika",
        "ward_number": None,
        "description": "प्रधानमन्त्री रोजगार कार्यक्रम, बेरोजगार लगत संकलन, सीप विकास तालिम, उद्यमशीलता र लघुउद्यम विकास (MEDPA)।",
        "roles_and_responsibilities": [
            "प्रधानमन्त्री रोजगार कार्यक्रम (PMEP) कार्यान्वयन तथा बेरोजगार युवाहरूको सूचीकरण",
            "रोजगार सूचना व्यवस्थापन प्रणाली (EMIS) मा नियमित तथ्याङ्क प्रविष्टि तथा रोजगार समन्वय",
            "गरिबी निवारणका लागि लघुउद्यम विकास कार्यक्रम (MEDPA) अन्तर्गत सीपमूलक तालिम",
            "स्थानीय श्रम बजारको माग विश्लेषण, प्राविधिक जनशक्ति उत्पादन तथा उद्यमशीलता प्रवर्द्धन",
            "वैदेशिक रोजगारीबाट फर्केका व्यक्तिहरूको पुनःएकीकरण तथा सुरक्षित आप्रवासन (SaMi) परामर्श"
        ],
        "head_employee_name": "रोशन तामाङ",
        "contact_phone": "९८४१२३४५७५",
        "email": "employment@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },

    # ─── ८ वडा कार्यालयहरू (8 Ward Offices) ───
    {
        "name": "वडा नं. १ कार्यालय (बाँसखर्क)",
        "code": "W-01",
        "type": "ward",
        "ward_number": 1,
        "description": "पाँचपोखरी थाङपाल वडा नं. १ बाँसखर्क कार्यालय - स्थानीय सेवा प्रवाह, सिफारिस, योजना तथा पञ्जीकरण केन्द्र।",
        "roles_and_responsibilities": [
            "नागरिक सिफारिस (४०+ प्रकारका डिजिटल सिफारिस) प्रमाणीकरण तथा जारी",
            "व्यक्तिगत घटना दर्ता (जन्म, मृत्यु, विवाह, सम्बन्ध विच्छेद, बसाइँसराइ) पञ्जीकरण",
            "सामाजिक सुरक्षा भत्ता वितरण लगत संकलन, नवीकरण तथा सहजीकरण",
            "वडास्तरीय विकास योजना छनोट, उपभोक्ता समिति गठन तथा अनुगमन",
            "स्थानीय विवाद मेलमिलाप तथा नागरिक गुनासो प्राथमिक सुनुवाइ"
        ],
        "head_employee_name": "आलोक कुमार स्याङ्बो (वडा अध्यक्ष)",
        "contact_phone": "9749326601",
        "email": "ward1@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "वडा नं. २ कार्यालय (बरुवा)",
        "code": "W-02",
        "type": "ward",
        "ward_number": 2,
        "description": "पाँचपोखरी थाङपाल वडा नं. २ बरुवा कार्यालय - स्थानीय सेवा प्रवाह, सिफारिस, योजना तथा पञ्जीकरण केन्द्र।",
        "roles_and_responsibilities": [
            "नागरिक सिफारिस (४०+ प्रकारका डिजिटल सिफारिस) प्रमाणीकरण तथा जारी",
            "व्यक्तिगत घटना दर्ता (जन्म, मृत्यु, विवाह, सम्बन्ध विच्छेद, बसाइँसराइ) पञ्जीकरण",
            "सामाजिक सुरक्षा भत्ता वितरण लगत संकलन, नवीकरण तथा सहजीकरण",
            "वडास्तरीय विकास योजना छनोट, उपभोक्ता समिति गठन तथा अनुगमन",
            "स्थानीय विवाद मेलमिलाप तथा नागरिक गुनासो प्राथमिक सुनुवाइ"
        ],
        "head_employee_name": "बाबुलाल स्याङ्बो (वडा अध्यक्ष)",
        "contact_phone": "९८४१०००००२",
        "email": "ward2@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "वडा नं. ३ कार्यालय (भोताङ)",
        "code": "W-03",
        "type": "ward",
        "ward_number": 3,
        "description": "पाँचपोखरी थाङपाल वडा नं. ३ भोताङ कार्यालय - स्थानीय सेवा प्रवाह, सिफारिस, योजना तथा पञ्जीकरण केन्द्र।",
        "roles_and_responsibilities": [
            "नागरिक सिफारिस (४०+ प्रकारका डिजिटल सिफारिस) प्रमाणीकरण तथा जारी",
            "व्यक्तिगत घटना दर्ता (जन्म, मृत्यु, विवाह, सम्बन्ध विच्छेद, बसाइँसराइ) पञ्जीकरण",
            "सामाजिक सुरक्षा भत्ता वितरण लगत संकलन, नवीकरण तथा सहजीकरण",
            "वडास्तरीय विकास योजना छनोट, उपभोक्ता समिति गठन तथा अनुगमन",
            "स्थानीय विवाद मेलमिलाप तथा नागरिक गुनासो प्राथमिक सुनुवाइ"
        ],
        "head_employee_name": "सुनछिरिङ तामाङ (वडा अध्यक्ष)",
        "contact_phone": "9749326603",
        "email": "ward3@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "वडा नं. ४ कार्यालय (थाङपालकोट)",
        "code": "W-04",
        "type": "ward",
        "ward_number": 4,
        "description": "पाँचपोखरी थाङपाल वडा नं. ४ थाङपालकोट कार्यालय - स्थानीय सेवा प्रवाह, सिफारिस, योजना तथा पञ्जीकरण केन्द्र।",
        "roles_and_responsibilities": [
            "नागरिक सिफारिस (४०+ प्रकारका डिजिटल सिफारिस) प्रमाणीकरण तथा जारी",
            "व्यक्तिगत घटना दर्ता (जन्म, मृत्यु, विवाह, सम्बन्ध विच्छेद, बसाइँसराइ) पञ्जीकरण",
            "सामाजिक सुरक्षा भत्ता वितरण लगत संकलन, नवीकरण तथा सहजीकरण",
            "वडास्तरीय विकास योजना छनोट, उपभोक्ता समिति गठन तथा अनुगमन",
            "स्थानीय विवाद मेलमिलाप तथा नागरिक गुनासो प्राथमिक सुनुवाइ"
        ],
        "head_employee_name": "कुल बहादुर बस्नेत (वडा अध्यक्ष)",
        "contact_phone": "९८४१०००००४",
        "email": "ward4@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "वडा नं. ५ कार्यालय (गुन्सा)",
        "code": "W-05",
        "type": "ward",
        "ward_number": 5,
        "description": "पाँचपोखरी थाङपाल वडा नं. ५ गुन्सा कार्यालय - स्थानीय सेवा प्रवाह, सिफारिस, योजना तथा पञ्जीकरण केन्द्र।",
        "roles_and_responsibilities": [
            "नागरिक सिफारिस (४०+ प्रकारका डिजिटल सिफारिस) प्रमाणीकरण तथा जारी",
            "व्यक्तिगत घटना दर्ता (जन्म, मृत्यु, विवाह, सम्बन्ध विच्छेद, बसाइँसराइ) पञ्जीकरण",
            "सामाजिक सुरक्षा भत्ता वितरण लगत संकलन, नवीकरण तथा सहजीकरण",
            "वडास्तरीय विकास योजना छनोट, उपभोक्ता समिति गठन तथा अनुगमन",
            "स्थानीय विवाद मेलमिलाप तथा नागरिक गुनासो प्राथमिक सुनुवाइ"
        ],
        "head_employee_name": "काले गोले (वडा अध्यक्ष)",
        "contact_phone": "९८४१०००००५",
        "email": "ward5@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "वडा नं. ६ कार्यालय (थाङपालधाप)",
        "code": "W-06",
        "type": "ward",
        "ward_number": 6,
        "description": "पाँचपोखरी थाङपाल वडा नं. ६ थाङपालधाप कार्यालय - स्थानीय सेवा प्रवाह, सिफारिस, योजना तथा पञ्जीकरण केन्द्र।",
        "roles_and_responsibilities": [
            "नागरिक सिफारिस (४०+ प्रकारका डिजिटल सिफारिस) प्रमाणीकरण तथा जारी",
            "व्यक्तिगत घटना दर्ता (जन्म, मृत्यु, विवाह, सम्बन्ध विच्छेद, बसाइँसराइ) पञ्जीकरण",
            "सामाजिक सुरक्षा भत्ता वितरण लगत संकलन, नवीकरण तथा सहजीकरण",
            "वडास्तरीय विकास योजना छनोट, उपभोक्ता समिति गठन तथा अनुगमन",
            "स्थानीय विवाद मेलमिलाप तथा नागरिक गुनासो प्राथमिक सुनुवाइ"
        ],
        "head_employee_name": "नारायण भट्टराई (वडा अध्यक्ष)",
        "contact_phone": "९८४१०००००६",
        "email": "ward6@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "वडा नं. ७ कार्यालय (भोटेनाम्लाङ / तिपेनी)",
        "code": "W-07",
        "type": "ward",
        "ward_number": 7,
        "description": "पाँचपोखरी थाङपाल वडा नं. ७ भोटेनाम्लाङ (तिपेनी) कार्यालय - स्थानीय सेवा प्रवाह, सिफारिस, योजना तथा पञ्जीकरण केन्द्र।",
        "roles_and_responsibilities": [
            "नागरिक सिफारिस (४०+ प्रकारका डिजिटल सिफारिस) प्रमाणीकरण तथा जारी",
            "व्यक्तिगत घटना दर्ता (जन्म, मृत्यु, विवाह, सम्बन्ध विच्छेद, बसाइँसराइ) पञ्जीकरण",
            "सामाजिक सुरक्षा भत्ता वितरण लगत संकलन, नवीकरण तथा सहजीकरण",
            "वडास्तरीय विकास योजना छनोट, उपभोक्ता समिति गठन तथा अनुगमन",
            "स्थानीय विवाद मेलमिलाप तथा नागरिक गुनासो प्राथमिक सुनुवाइ"
        ],
        "head_employee_name": "चन्द्रबहादुर तामाङ (वडा अध्यक्ष)",
        "contact_phone": "९८४१०००००७",
        "email": "ward7@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    },
    {
        "name": "वडा नं. ८ कार्यालय (लागर्चे)",
        "code": "W-08",
        "type": "ward",
        "ward_number": 8,
        "description": "पाँचपोखरी थाङपाल वडा नं. ८ लागर्चे कार्यालय - स्थानीय सेवा प्रवाह, सिफारिस, योजना तथा पञ्जीकरण केन्द्र।",
        "roles_and_responsibilities": [
            "नागरिक सिफारिस (४०+ प्रकारका डिजिटल सिफारिस) प्रमाणीकरण तथा जारी",
            "व्यक्तिगत घटना दर्ता (जन्म, मृत्यु, विवाह, सम्बन्ध विच्छेद, बसाइँसराइ) पञ्जीकरण",
            "सामाजिक सुरक्षा भत्ता वितरण लगत संकलन, नवीकरण तथा सहजीकरण",
            "वडास्तरीय विकास योजना छनोट, उपभोक्ता समिति गठन तथा अनुगमन",
            "स्थानीय विवाद मेलमिलाप तथा नागरिक गुनासो प्राथमिक सुनुवाइ"
        ],
        "head_employee_name": "सुकबहादुर तामाङ (वडा अध्यक्ष)",
        "contact_phone": "९८४१०००००८",
        "email": "ward8@panchpokharithangpalmun.gov.np",
        "is_information_officer_branch": False,
        "is_grievance_officer_branch": False,
        "status": "active"
    }
]

def _generate_unique_emp_id(db: Session, base_code: str) -> str:
    from models.employee import Employee
    candidate = f"EMP-{base_code}"
    idx = 1
    while db.query(Employee).filter(Employee.employee_id == candidate).first():
        idx += 1
        candidate = f"EMP-{base_code}-{idx}"
    return candidate


def auto_seed_branches_if_needed(
    db: Session,
    tenant_id: Optional[str] = None,
    overwrite_existing: bool = False,
):
    """
    Populate official 11 municipal branches and 8 ward offices and sync their
    branch chiefs (HRMS) & ward chairpersons (Representatives).
    When overwrite_existing=False, user edits and deletions are respected cleanly.
    """
    from models.employee import Employee
    from models.representative import Representative

    eff_tenant = tenant_id or "panchpokhari"

    for b_data in DEFAULT_BRANCHES:
        b_name = b_data["name"]
        existing = db.query(Branch).filter(Branch.name == b_name).first()

        head_emp_id = existing.head_employee_id if existing else None
        clean_name = b_data.get("head_employee_name", "").replace(" (वडा अध्यक्ष)", "").strip()

        # 1. Sync Palika branch chief to Employee (HRMS)
        if b_data.get("type") == "palika" and clean_name:
            emp = None
            if head_emp_id:
                emp = db.query(Employee).filter(Employee.id == head_emp_id).first()
            if not emp:
                emp = db.query(Employee).filter(
                    (Employee.full_name == clean_name) | (Employee.department == b_name)
                ).first()
            if not emp:
                emp = Employee(
                    id=str(uuid.uuid4()),
                    tenant_id=eff_tenant,
                    employee_id=_generate_unique_emp_id(db, b_data.get("code", "GEN")),
                    full_name=clean_name,
                    department=b_name,
                    designation=f"{b_data.get('description', '').split('।')[0].split(',')[0]} (शाखा प्रमुख)",
                    contact_phone=b_data.get("contact_phone"),
                    email=b_data.get("email"),
                    is_department_head=True,
                    is_information_officer=b_data.get("is_information_officer_branch", False),
                    is_grievance_officer=b_data.get("is_grievance_officer_branch", False),
                    branch_code=b_data.get("code"),
                    status="Active"
                )
                db.add(emp)
                db.flush()
            elif overwrite_existing:
                emp.full_name = clean_name
                emp.department = b_name
                emp.is_department_head = True
                if b_data.get("contact_phone"):
                    emp.contact_phone = b_data.get("contact_phone")
                if b_data.get("email"):
                    emp.email = b_data.get("email")
                if b_data.get("is_information_officer_branch"):
                    emp.is_information_officer = True
                if b_data.get("is_grievance_officer_branch"):
                    emp.is_grievance_officer = True
                db.flush()
            head_emp_id = emp.id

        # 2. Sync Ward Chairperson to Representative
        if b_data.get("type") == "ward" and b_data.get("ward_number"):
            w_no = b_data.get("ward_number")
            rep = None
            if head_emp_id:
                rep = db.query(Representative).filter(Representative.id == head_emp_id).first()
            if not rep:
                rep = db.query(Representative).filter(
                    Representative.ward_no == w_no,
                    Representative.designation.like("%वडा अध्यक्ष%")
                ).first()
            if not rep:
                rep = Representative(
                    id=str(uuid.uuid4()),
                    tenant_id=eff_tenant,
                    name=clean_name,
                    designation="वडा अध्यक्ष",
                    ward_no=w_no,
                    phone=b_data.get("contact_phone"),
                    email=b_data.get("email"),
                    is_current=True
                )
                db.add(rep)
                db.flush()
            elif overwrite_existing:
                rep.name = clean_name
                if b_data.get("contact_phone"):
                    rep.phone = b_data.get("contact_phone")
                if b_data.get("email"):
                    rep.email = b_data.get("email")
                rep.is_current = True
                db.flush()
            head_emp_id = rep.id

            if overwrite_existing:
                try:
                    from models.ward import Ward
                    ward = db.query(Ward).filter(Ward.ward_number == w_no).first()
                    if ward:
                        ward.ward_chair_name = clean_name
                        ward.chairperson = clean_name
                        if b_data.get("contact_phone"):
                            ward.phone = b_data.get("contact_phone")
                except Exception:
                    pass

        if not existing:
            new_branch = Branch(
                id=str(uuid.uuid4()),
                tenant_id=eff_tenant,
                name=b_name,
                code=b_data.get("code"),
                type=b_data.get("type", "palika"),
                ward_number=b_data.get("ward_number"),
                description=b_data.get("description"),
                roles_and_responsibilities=b_data.get("roles_and_responsibilities"),
                head_employee_name=b_data.get("head_employee_name"),
                head_employee_id=head_emp_id,
                contact_phone=b_data.get("contact_phone"),
                email=b_data.get("email"),
                is_information_officer_branch=b_data.get("is_information_officer_branch", False),
                is_grievance_officer_branch=b_data.get("is_grievance_officer_branch", False),
                status=b_data.get("status", "active")
            )
            db.add(new_branch)
        elif overwrite_existing:
            existing.head_employee_name = b_data.get("head_employee_name")
            existing.head_employee_id = head_emp_id or existing.head_employee_id
            if b_data.get("contact_phone"):
                existing.contact_phone = b_data.get("contact_phone")
            if b_data.get("email"):
                existing.email = b_data.get("email")
            if b_data.get("code"):
                existing.code = b_data.get("code")

    try:
        db.commit()
    except Exception:
        db.rollback()


def ensure_initial_branches_seeded(db: Session, tenant_id: Optional[str] = None):
    """
    Runs initial SSOT seed ONCE per installation (tracked in system_settings) so
    subsequent user edits and deletions in HRMS, Representatives, or Branches
    are never overwritten or re-created on GET requests.
    """
    from models.setting import SystemSetting

    SYNC_KEY = "branches_ssot_synced_v1"
    already_synced = db.query(SystemSetting).filter(SystemSetting.key == SYNC_KEY).first()
    if already_synced:
        return

    auto_seed_branches_if_needed(db, tenant_id, overwrite_existing=True)

    try:
        marker = SystemSetting(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id or "panchpokhari",
            key=SYNC_KEY,
            value="done",
            description="Initial branches, HRMS chiefs, and ward chairpersons SSOT sync marker"
        )
        db.add(marker)
        db.commit()
    except Exception:
        db.rollback()


@router.get("", response_model=List[BranchSchema])
def get_branches(
    type: Optional[str] = Query(None, description="Filter by type: 'palika' | 'ward' | 'all'"), 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    ensure_initial_branches_seeded(db, ctx.effective_tenant_id)

    query = ctx.filter_query(db.query(Branch), Branch)
    if type and type != "all":
        query = query.filter(Branch.type == type)
    return query.order_by(Branch.type.asc(), Branch.ward_number.asc(), Branch.name.asc()).all()

@router.post("/seed-default", response_model=List[BranchSchema])
def seed_default_branches_endpoint(
    force: bool = Query(False, description="If true, also reset existing defaults"),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    auto_seed_branches_if_needed(db, ctx.effective_tenant_id, overwrite_existing=force)
    query = ctx.filter_query(db.query(Branch), Branch)
    return query.order_by(Branch.type.asc(), Branch.ward_number.asc(), Branch.name.asc()).all()

def _find_branch_for_ctx(db: Session, ctx: TenantContext, id: str) -> Optional[Branch]:
    db_branch = ctx.filter_query(db.query(Branch), Branch).filter(Branch.id == id).first()
    if db_branch:
        return db_branch
    candidate = db.query(Branch).filter(Branch.id == id).first()
    if candidate and (
        ctx.is_all
        or candidate.tenant_id in (None, "", "default", "panchpokhari", "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06")
        or (ctx.current_user and getattr(ctx.current_user, "role", None) in ("super_admin", "admin", "it_admin"))
    ):
        return candidate
    return None

@router.get("/{id}", response_model=BranchSchema)
def get_branch(
    id: str, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    branch = _find_branch_for_ctx(db, ctx, id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch

@router.post("", response_model=BranchSchema)
def create_branch(
    data: BranchCreate, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    branch_dict = data.model_dump(exclude_unset=True) if hasattr(data, 'model_dump') else data.dict(exclude_unset=True)
    eff_tenant = branch_dict.pop("tenant_id", None) or ctx.effective_tenant_id
    db_branch = Branch(
        id=str(uuid.uuid4()),
        tenant_id=eff_tenant,
        **branch_dict
    )
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.put("/{id}", response_model=BranchSchema)
def update_branch(
    id: str, 
    data: BranchUpdate, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    db_branch = _find_branch_for_ctx(db, ctx, id)
    if not db_branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    update_data = data.model_dump(exclude_unset=True) if hasattr(data, 'model_dump') else data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_branch, key, value)

    # Sync linked Employee / Representative cleanly if linked via head_employee_id
    if db_branch.head_employee_id:
        try:
            if db_branch.type == "palika":
                from models.employee import Employee
                emp = db.query(Employee).filter(Employee.id == db_branch.head_employee_id).first()
                if emp:
                    emp.department = db_branch.name
                    emp.is_department_head = True
                    if db_branch.head_employee_name:
                        emp.full_name = db_branch.head_employee_name
                    if db_branch.contact_phone is not None:
                        emp.contact_phone = db_branch.contact_phone
                    if db_branch.email is not None:
                        emp.email = db_branch.email
            elif db_branch.type == "ward":
                from models.representative import Representative
                rep = db.query(Representative).filter(Representative.id == db_branch.head_employee_id).first()
                if rep:
                    if db_branch.head_employee_name:
                        rep.name = db_branch.head_employee_name.replace(" (वडा अध्यक्ष)", "").strip()
                    if db_branch.contact_phone is not None:
                        rep.phone = db_branch.contact_phone
                    if db_branch.email is not None:
                        rep.email = db_branch.email
        except Exception:
            pass

    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.delete("/{id}")
def delete_branch(
    id: str, 
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    db_branch = _find_branch_for_ctx(db, ctx, id)
    if not db_branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    db.delete(db_branch)
    db.commit()
    return {"success": True, "message": "Branch deleted successfully"}


