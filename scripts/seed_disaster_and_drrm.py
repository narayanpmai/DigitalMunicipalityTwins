import psycopg2
import uuid
import json
import sys
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'
TENANT_ID = 'panchpokhari'

# 1. DISASTER EVENTS
# Enum requirements:
# severity: 'low', 'medium', 'high', 'critical'
# status: 'active', 'resolved', 'cancelled'
# type: 'landslide', 'flood', 'fire', 'earthquake', 'accident', 'other'

DISASTER_EVENTS = [
    {
        "id": "e0010000-0000-0000-0000-000000000001",
        "title": "मानेखर्क डाँडागाउँ भिरालो पहिरो तथा बस्ती जोखिम",
        "type": "landslide",
        "severity": "high",
        "status": "active",
        "description": "निरन्तर वर्षाका कारण डाँडागाउँ भिरालो क्षेत्रमा जमिन भासिएर पहिरो चलेको। १८ घरधुरी प्रत्यक्ष जोखिममा, स्थानीयलाई सुरक्षित आश्रयस्थलमा सारिएको।",
        "lat": 27.9350,
        "lng": 85.5820,
        "wardNumber": 4,
        "reporterName": "मिङ्मार शेर्पा (वडा सदस्य)",
        "reporterPhone": "9841223344",
        "incidentDateBs": "२०८१-०५-०२",
        "affectedHouseholds": 18,
        "affectedPeople": 85,
        "humanCasualties": 0,
        "missingPersons": 0,
        "injuredCount": 2,
        "livestockLossCount": 6,
        "fullyDamagedHouses": 3,
        "partiallyDamagedHouses": 7,
        "estimatedLossNPR": 3500000.0,
        "reliefStatus": "राहत वितरण जारी",
        "reliefMaterials": "त्रिपाल ३० थान, कम्बल ४० थान, सुक्खा खाद्यान्न २० बोरा",
        "reliefDisbursedNPR": 75000.0,
        "rescueTeam": "पालिका खोज-उद्धार टोली, सशस्त्र प्रहरी बल तिम्बु र स्थानीय स्वयंसेवक",
        "tolsSettlement": "डाँडागाउँ माथिल्लो टोल"
    },
    {
        "id": "e0010000-0000-0000-0000-000000000002",
        "title": "मेलम्ची तथा याङ्ग्री खोला आकस्मिक बाढी र तटीय कटान",
        "type": "flood",
        "severity": "critical",
        "status": "resolved",
        "description": "माथिल्लो जलाधार क्षेत्रमा क्लाउडबर्स्टका कारण मेलम्ची र याङ्ग्री खोलामा बाढी आई तिपेनी बजार तटीय क्षेत्र कटान गरेको। ग्याबिन जाली लगाई नियन्त्रण गरिएको।",
        "lat": 27.9120,
        "lng": 85.5690,
        "wardNumber": 7,
        "reporterName": "राजाराम श्रेष्ठ (तिपेनी बजार व्यवस्थापन)",
        "reporterPhone": "9849334407",
        "incidentDateBs": "२०८१-०४-२८",
        "affectedHouseholds": 28,
        "affectedPeople": 140,
        "humanCasualties": 0,
        "missingPersons": 0,
        "injuredCount": 1,
        "livestockLossCount": 4,
        "fullyDamagedHouses": 2,
        "partiallyDamagedHouses": 8,
        "estimatedLossNPR": 6200000.0,
        "reliefStatus": "सम्पन्न",
        "reliefMaterials": "ग्याबिन तारजाली १५० थान, आपत्कालीन त्रिपाल ५० थान",
        "reliefDisbursedNPR": 120000.0,
        "rescueTeam": "नेपाल प्रहरी तिपेनी चौकी र पालिका प्राविधिक टोली",
        "tolsSettlement": "तिपेनी बजार तटीय क्षेत्र"
    },
    {
        "id": "e0010000-0000-0000-0000-000000000003",
        "title": "भोताङ-छिम्ती सडक खण्ड सुक्खा पहिरो तथा यातायात अवरोध",
        "type": "landslide",
        "severity": "medium",
        "status": "active",
        "description": "सडक माथिबाट ठूलो ढुङ्गा र गेग्र्यान खसेर भोताङ-छिम्ती कृषि सडक पूर्ण रूपमा अवरुद्ध। पालिकाको हेभी इक्विपमेन्ट (डोजर) प्रयोग गरी खुलाउने प्रयास जारी।",
        "lat": 27.9650,
        "lng": 85.6120,
        "wardNumber": 3,
        "reporterName": "दावा लामा (इन्चार्ज अहेव)",
        "reporterPhone": "9841556602",
        "incidentDateBs": "२०८१-०५-११",
        "affectedHouseholds": 50,
        "affectedPeople": 220,
        "humanCasualties": 0,
        "missingPersons": 0,
        "injuredCount": 0,
        "livestockLossCount": 0,
        "fullyDamagedHouses": 0,
        "partiallyDamagedHouses": 0,
        "estimatedLossNPR": 450000.0,
        "reliefStatus": "प्राविधिक उद्धार जारी",
        "reliefMaterials": "इन्धन तथा डोजर परिचालन",
        "reliefDisbursedNPR": 30000.0,
        "rescueTeam": "गाउँपालिका सडक मर्मत युनिट",
        "tolsSettlement": "छिम्ती मोड"
    },
    {
        "id": "e0010000-0000-0000-0000-000000000004",
        "title": "बाँसखर्क गैह्रीगाउँ सामुदायिक वन डढेलो नियन्त्रण",
        "type": "fire",
        "severity": "medium",
        "status": "resolved",
        "description": "बाँसखर्कको सल्लो वन क्षेत्रमा लागेको डढेलो स्थानीय उपभोक्ता समूह र नेपाल प्रहरीको संयुक्त प्रयासमा बस्ती पस्न नदिई नियन्त्रण गरिएको।",
        "lat": 27.9450,
        "lng": 85.6140,
        "wardNumber": 1,
        "reporterName": "दिल बहादुर घले",
        "reporterPhone": "9841335501",
        "incidentDateBs": "२०८०-१२-१५",
        "affectedHouseholds": 12,
        "affectedPeople": 60,
        "humanCasualties": 0,
        "missingPersons": 0,
        "injuredCount": 1,
        "livestockLossCount": 2,
        "fullyDamagedHouses": 0,
        "partiallyDamagedHouses": 1,
        "estimatedLossNPR": 850000.0,
        "reliefStatus": "सम्पन्न",
        "reliefMaterials": "अग्नि नियन्त्रक उपकरण तथा प्राथमिक उपचार",
        "reliefDisbursedNPR": 20000.0,
        "rescueTeam": "सामुदायिक वन उपभोक्ता समूह र स्थानीय स्वयंसेवक",
        "tolsSettlement": "गैह्रीगाउँ वन सिमाना"
    },
    {
        "id": "e0010000-0000-0000-0000-000000000005",
        "title": "बरुवा खोला गल्छी कटान तथा झोलुङ्गे पुल जोखिम",
        "type": "flood",
        "severity": "high",
        "status": "active",
        "description": "बरुवा खोलामा आएको तीव्र बहावले झोलुङ्गे पुलको दायाँतर्फको पिलर कटान गरी जोखिमयुक्त बनाएको। पदयात्रीलाई वैकल्पिक मार्ग प्रयोग गर्न सूचित।",
        "lat": 27.9540,
        "lng": 85.5890,
        "wardNumber": 2,
        "reporterName": "सूर्य बहादुर तामाङ",
        "reporterPhone": "9808123456",
        "incidentDateBs": "२०८१-०५-०८",
        "affectedHouseholds": 22,
        "affectedPeople": 105,
        "humanCasualties": 0,
        "missingPersons": 0,
        "injuredCount": 0,
        "livestockLossCount": 0,
        "fullyDamagedHouses": 0,
        "partiallyDamagedHouses": 2,
        "estimatedLossNPR": 1200000.0,
        "reliefStatus": "तारजाली व्यवस्थापन",
        "reliefMaterials": "ग्याबिन जाली ६० थान",
        "reliefDisbursedNPR": 25000.0,
        "rescueTeam": "वडा विपद् पूर्वतयारी समिति बरुवा",
        "tolsSettlement": "बरुवा पुल टोल"
    },
    {
        "id": "e0010000-0000-0000-0000-000000000006",
        "title": "थाङपालधाप बजार क्षेत्र आवासीय घर आगलागी",
        "type": "fire",
        "severity": "low",
        "status": "resolved",
        "description": "विद्युत सर्ट भई थाङपालधाप बजारस्थित एक घरको माथिल्लो तलामा आगलागी भएकोमा स्थानीय र प्रहरी टोलीद्वारा आधा घण्टाभित्र आगो पूर्ण नियन्त्रण।",
        "lat": 27.9400,
        "lng": 85.5920,
        "wardNumber": 6,
        "reporterName": "सुरेश श्रेष्ठ (जिन्सी शाखा)",
        "reporterPhone": "9841556605",
        "incidentDateBs": "२०८१-०४-१०",
        "affectedHouseholds": 1,
        "affectedPeople": 6,
        "humanCasualties": 0,
        "missingPersons": 0,
        "injuredCount": 0,
        "livestockLossCount": 0,
        "fullyDamagedHouses": 0,
        "partiallyDamagedHouses": 1,
        "estimatedLossNPR": 300000.0,
        "reliefStatus": "राहत प्रदान",
        "reliefMaterials": "त्रिपाल २ थान, भाँडाकुँडा सेट १, खाद्यान्न १ बोरा",
        "reliefDisbursedNPR": 30000.0,
        "rescueTeam": "इलाका प्रहरी कार्यालय र स्थानीय व्यापारी",
        "tolsSettlement": "थाङपालधाप मुख्य बजार"
    },
    {
        "id": "e0010000-0000-0000-0000-000000000007",
        "title": "सेर्माथाङ डाँडा भारी हिमपात तथा चौंरी गोठ प्रभावित",
        "type": "other",
        "severity": "medium",
        "status": "resolved",
        "description": "माथिल्लो सेर्माथाङ र पाँचपोखरी पदमार्गमा ३ फिटसम्म हिमपात भई चौंरी गोठहरू सम्पर्कविहीन भएकोमा पालिका उद्धार टोलीले खाद्यान्न र नुन पुर्‍याएको।",
        "lat": 27.9800,
        "lng": 85.6200,
        "wardNumber": 3,
        "reporterName": "तेन्जिङ नोर्बु शेर्पा",
        "reporterPhone": "9841667788",
        "incidentDateBs": "२०८०-१०-२२",
        "affectedHouseholds": 15,
        "affectedPeople": 65,
        "humanCasualties": 0,
        "missingPersons": 0,
        "injuredCount": 0,
        "livestockLossCount": 3,
        "fullyDamagedHouses": 0,
        "partiallyDamagedHouses": 0,
        "estimatedLossNPR": 500000.0,
        "reliefStatus": "सम्पन्न",
        "reliefMaterials": "पशु आहार, नुन, न्यानो कपडा र सुक्खा रासन",
        "reliefDisbursedNPR": 40000.0,
        "rescueTeam": "उच्च हिमाली उद्धार टोली",
        "tolsSettlement": "सेर्माथाङ उच्च खर्क"
    },
    {
        "id": "e0010000-0000-0000-0000-000000000008",
        "title": "लाँगर्चे गल्छी भिर पहिरो तथा पैदल मार्ग क्षति",
        "type": "landslide",
        "severity": "medium",
        "status": "active",
        "description": "लाँगर्चे तल्लो बस्ती जोड्ने गोरेटो बाटोमा पहिरो खसी आवतजावत जोखिमपूर्ण भएकोले तत्काल बाटो मर्मत र डोरीको सहारामा हिँड्ने व्यवस्था गरिएको।",
        "lat": 27.9090,
        "lng": 85.5750,
        "wardNumber": 8,
        "reporterName": "पार्वती खत्री (स्वास्थ्य चौकी इन्चार्ज)",
        "reporterPhone": "9851012408",
        "incidentDateBs": "२०८१-०५-१४",
        "affectedHouseholds": 14,
        "affectedPeople": 70,
        "humanCasualties": 0,
        "missingPersons": 0,
        "injuredCount": 0,
        "livestockLossCount": 0,
        "fullyDamagedHouses": 0,
        "partiallyDamagedHouses": 0,
        "estimatedLossNPR": 200000.0,
        "reliefStatus": "पूर्वतयारी जारी",
        "reliefMaterials": "सुरक्षा डोरी र चेतावनी बोर्ड",
        "reliefDisbursedNPR": 15000.0,
        "rescueTeam": "वडा विपद् स्वयंसेवक समूह",
        "tolsSettlement": "लाँगर्चे गल्छी"
    }
]

# 2. EMERGENCY SHELTERS (८ वटा सुरक्षित आश्रयस्थलहरू - प्रत्येक वडामा १/१ वटा)
SHELTERS = [
    {
        "id": "s0010000-0000-0000-0000-000000000001",
        "name": "बाँसखर्क माध्यमिक विद्यालय आपत्कालीन आश्रयस्थल",
        "ward_number": 1,
        "location": "बाँसखर्क बजार, वडा नं १",
        "capacity": 150,
        "has_water": True,
        "has_power_backup": True,
        "contact_person": "विमला तामाङ",
        "contact_phone": "9841335501",
        "lat": 27.9455,
        "lng": 85.6135,
        "status": "active",
        "facilities_description": "६ वटा ठूला कक्षाकोठा, महिला/पुरुष छुट्टाछुट्टै शौचालय, पिउने पानी ट्याङ्की र प्राथमिक स्वास्थ्य किट उपलब्ध।"
    },
    {
        "id": "s0010000-0000-0000-0000-000000000002",
        "name": "बरुवा स्वास्थ्य चौकी तथा सामुदायिक भवन आश्रयस्थल",
        "ward_number": 2,
        "location": "बरुवा मुख्य बस्ती, वडा नं २",
        "capacity": 100,
        "has_water": True,
        "has_power_backup": False,
        "contact_person": "दावा लामा",
        "contact_phone": "9841556602",
        "lat": 27.9545,
        "lng": 85.5895,
        "status": "active",
        "facilities_description": "सामुदायिक हल, सुरक्षित आँगन, खानेपानी धारा र आपत्कालीन त्रिपाल भण्डार।"
    },
    {
        "id": "s0010000-0000-0000-0000-000000000003",
        "name": "भोताङ कभर्ड हल तथा सामुदायिक आपत्कालीन आश्रयस्थल",
        "ward_number": 3,
        "location": "भोताङ बजार, वडा नं ३",
        "capacity": 250,
        "has_water": True,
        "has_power_backup": True,
        "contact_person": "डा. पेम्बा शेर्पा",
        "contact_phone": "9849002203",
        "lat": 27.9655,
        "lng": 85.6110,
        "status": "active",
        "facilities_description": "ठूलो इन्डोर हल, सोलार ब्याकअप, भान्छाघर, सुरक्षित शौचालय तथा आकस्मिक औषधि भण्डार।"
    },
    {
        "id": "s0010000-0000-0000-0000-000000000004",
        "name": "थाङपाल भ्याली माध्यमिक विद्यालय आश्रय केन्द्र",
        "ward_number": 4,
        "location": "मानेखर्क, वडा नं ४",
        "capacity": 300,
        "has_water": True,
        "has_power_backup": True,
        "contact_person": "सुनिता घिमिरे",
        "contact_phone": "9841889904",
        "lat": 27.9360,
        "lng": 85.5815,
        "status": "active",
        "facilities_description": "पक्की आरसीसी भवन, फराकिलो खेलमैदान, खानेपानी, जेनेरेटर ब्याकअप र राहत सामग्री वितरण कक्ष।"
    },
    {
        "id": "s0010000-0000-0000-0000-000000000005",
        "name": "गुन्सा आधारभूत विद्यालय आश्रय भवन",
        "ward_number": 5,
        "location": "गुन्सा, वडा नं ५",
        "capacity": 120,
        "has_water": True,
        "has_power_backup": False,
        "contact_person": "दावा दोर्जे तामाङ",
        "contact_phone": "9849112205",
        "lat": 27.9280,
        "lng": 85.5880,
        "status": "active",
        "facilities_description": "४ कक्षाकोठा, खानेपानी आपूर्ति, खुला प्राङ्गण र नजिकै स्वास्थ्य एकाइ।"
    },
    {
        "id": "s0010000-0000-0000-0000-000000000006",
        "name": "थाङपालधाप बहुउद्देश्यीय सामुदायिक कभर्ड हल (केन्द्रीय आश्रय)",
        "ward_number": 6,
        "location": "थाङपालधाप गाउँपालिका केन्द्र, वडा नं ६",
        "capacity": 400,
        "has_water": True,
        "has_power_backup": True,
        "contact_person": "नवराज पौडेल (विपद् अधिकृत)",
        "contact_phone": "9851022901",
        "lat": 27.9405,
        "lng": 85.5925,
        "status": "active",
        "facilities_description": "पालिकास्तरीय मुख्य आपत्कालीन कार्यसञ्चालन केन्द्र (EOC), हेलिप्याड पहुँच, ५ KVA जेनेरेटर, ५०,००० लिटर पानी ट्याङ्की र केन्द्रीय राहत गोदाम।"
    },
    {
        "id": "s0010000-0000-0000-0000-000000000007",
        "name": "तिपेनी बजार सामुदायिक सेवा केन्द्र आश्रयस्थल",
        "ward_number": 7,
        "location": "तिपेनी मुख्य बजार, वडा नं ७",
        "capacity": 200,
        "has_water": True,
        "has_power_backup": True,
        "contact_person": "राजाराम श्रेष्ठ",
        "contact_phone": "9849334407",
        "lat": 27.9125,
        "lng": 85.5695,
        "status": "active",
        "facilities_description": "मेलम्ची नदी तटीय सुरक्षित उचाइमा अवस्थित पक्की भवन, प्राथमिक स्वास्थ्य केन्द्रसँगै जोडिएको।"
    },
    {
        "id": "s0010000-0000-0000-0000-000000000008",
        "name": "लाँगर्चे आधारभूत विद्यालय सुरक्षित आश्रयस्थल",
        "ward_number": 8,
        "location": "लाँगर्चे बजार, वडा नं ८",
        "capacity": 120,
        "has_water": True,
        "has_power_backup": False,
        "contact_person": "पार्वती खत्री",
        "contact_phone": "9851012408",
        "lat": 27.9095,
        "lng": 85.5755,
        "status": "active",
        "facilities_description": "सुरक्षित खुला चौर, ४ कक्षाकोठा र शुद्ध पिउने पानी सुविधा।"
    }
]

# 3. EMERGENCY CONTACTS (१२ वटा २४/७ आकस्मिक सम्पर्कहरू)
EMERGENCY_CONTACTS = [
    {
        "id": "c0010000-0000-0000-0000-000000000001",
        "name": "नवराज पौडेल",
        "role": "विपद् व्यवस्थापन तथा वातावरण शाखा प्रमुख",
        "phone": "9851022901",
        "wardNumber": 6,
        "department": "विपद् व्यवस्थापन शाखा, पाँचपोखरी थाङपाल गा.पा.",
        "category": "other",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000002",
        "name": "प्रहरी निरीक्षक रमेश कार्की",
        "role": "कार्यालय प्रमुख / सुरक्षा कमान्डर",
        "phone": "9851122100",
        "wardNumber": 7,
        "department": "इलाका प्रहरी कार्यालय, तिपेनी/मेलम्ची",
        "category": "police",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000003",
        "name": "स.प्र.नि. कुमार थापा",
        "role": "खोज तथा उद्धार कमान्डर",
        "phone": "9851234500",
        "wardNumber": 2,
        "department": "सशस्त्र प्रहरी बल (APF) विपद् उद्धार बेस क्याम्प, तिम्बु",
        "category": "police",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000004",
        "name": "राम कुमार तामाङ",
        "role": "पालिका मुख्य एम्बुलेन्स चालक (बा २ झ ४५२१)",
        "phone": "9841228801",
        "wardNumber": 6,
        "department": "पाँचपोखरी प्राथमिक अस्पताल, थाङपालधाप",
        "category": "ambulance",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000005",
        "name": "निमा शेर्पा",
        "role": "उच्च हिमाली ४WD एम्बुलेन्स चालक (बा २ झ ६७१८)",
        "phone": "9849008802",
        "wardNumber": 3,
        "department": "भोताङ प्राथमिक स्वास्थ्य केन्द्र",
        "category": "ambulance",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000006",
        "name": "डा. सन्दीप श्रेष्ठ",
        "role": "मेडिकल सुपरिटेन्डेन्ट / आकस्मिक प्रमुख",
        "phone": "9851022401",
        "wardNumber": 6,
        "department": "पाँचपोखरी प्राथमिक अस्पताल (१५ शय्या)",
        "category": "hospital",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000007",
        "name": "सुरेश श्रेष्ठ",
        "role": "जिन्सी तथा राहत भण्डार अधिकृत",
        "phone": "9841556605",
        "wardNumber": 6,
        "department": "जिन्सी तथा राहत सामग्री भण्डार शाखा",
        "category": "other",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000008",
        "name": "मेलम्ची नगरपालिका दमकल नियन्त्रण कक्ष",
        "role": "वारुणयन्त्र (दमकल) सेवा",
        "phone": "011-400101",
        "wardNumber": 7,
        "department": "संयुक्त दमकल सेवा, मेलम्ची करिडोर",
        "category": "fire",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000009",
        "name": "नेपाल रेडक्रस सोसाइटी सिन्धुपाल्चोक",
        "role": "रक्तसञ्चार तथा राहत शाखा",
        "phone": "011-620222",
        "wardNumber": 6,
        "department": "नेपाल रेडक्रस सोसाइटी जिल्ला शाखा",
        "category": "other",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000010",
        "name": "नेपाल विद्युत प्राधिकरण मेलम्ची वितरण केन्द्र",
        "role": "नो-लाइट तथा आपत्कालीन लाइन मर्मत",
        "phone": "011-400200",
        "wardNumber": 6,
        "department": "विद्युत आपत्कालीन सेवा",
        "category": "other",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000011",
        "name": "पेम्बा शेर्पा",
        "role": "भोताङ वडा विपद् सम्पर्क प्रतिनिधि",
        "phone": "9849001102",
        "wardNumber": 3,
        "department": "वडा नं ३ कार्यालय, भोताङ",
        "category": "local_rep",
        "isAvailable24_7": True
    },
    {
        "id": "c0010000-0000-0000-0000-000000000012",
        "name": "टासी लामा",
        "role": "गाउँपालिका अध्यक्ष / विपद् व्यवस्थापन समिति संयोजक",
        "phone": "9851022001",
        "wardNumber": 6,
        "department": "गाउँ कार्यपालिका, पाँचपोखरी थाङपाल",
        "category": "local_rep",
        "isAvailable24_7": True
    }
]

# 4. RELIEF INVENTORY (८ प्रकारका आपत्कालीन राहत सामग्रीहरू)
RELIEF_INVENTORY = [
    {
        "id": "i0010000-0000-0000-0000-000000000001",
        "itemName": "हेभी-ड्युटी वाटरप्रुफ त्रिपाल (Tarpaulins)",
        "category": "shelter",
        "quantity": 500,
        "unit": "थान",
        "warehouseLocation": "थाङपालधाप पालिका मुख्य गोदाम",
        "wardNumber": 6,
        "condition": "good",
        "lastUpdatedBs": "२०८१-०५-१०",
        "contactPerson": "सुरेश श्रेष्ठ (जिन्सी शाखा)"
    },
    {
        "id": "i0010000-0000-0000-0000-000000000002",
        "itemName": "पारिवारिक टेन्ट सेट (६-८ जना क्षमता)",
        "category": "shelter",
        "quantity": 120,
        "unit": "सेट",
        "warehouseLocation": "भोताङ आपत्कालीन संकलन डिपो",
        "wardNumber": 3,
        "condition": "good",
        "lastUpdatedBs": "२०८१-०५-०५",
        "contactPerson": "पेम्बा तामाङ"
    },
    {
        "id": "i0010000-0000-0000-0000-000000000003",
        "itemName": "न्यानो कम्बल तथा म्याट्रेस सेट",
        "category": "clothing",
        "quantity": 800,
        "unit": "थान",
        "warehouseLocation": "मानेखर्क विपद् उप-केन्द्र",
        "wardNumber": 4,
        "condition": "good",
        "lastUpdatedBs": "२०८१-०४-२८",
        "contactPerson": "मिङ्मार शेर्पा"
    },
    {
        "id": "i0010000-0000-0000-0000-000000000004",
        "itemName": "खोज तथा उद्धार डोरी र लाइफ ज्याकेट सेट",
        "category": "search_rescue",
        "quantity": 60,
        "unit": "सेट",
        "warehouseLocation": "मेलम्ची रिभर बेस क्याम्प",
        "wardNumber": 7,
        "condition": "good",
        "lastUpdatedBs": "२०८१-०५-१२",
        "contactPerson": "प्रहरी चौकी तिपेनी"
    },
    {
        "id": "i0010000-0000-0000-0000-000000000005",
        "itemName": "स्ट्रेचर तथा आकस्मिक प्राथमिक उपचार किट",
        "category": "medical",
        "quantity": 50,
        "unit": "सेट",
        "warehouseLocation": "पाँचपोखरी प्राथमिक अस्पताल",
        "wardNumber": 6,
        "condition": "good",
        "lastUpdatedBs": "२०८१-०५-१५",
        "contactPerson": "डा. सन्दीप श्रेष्ठ"
    },
    {
        "id": "i0010000-0000-0000-0000-000000000006",
        "itemName": "पेट्रोल जेनेरेटर (३.५ KVA) र इमर्जेन्सी लाइट सेट",
        "category": "search_rescue",
        "quantity": 8,
        "unit": "थान",
        "warehouseLocation": "पालिका कार्यसञ्चालन केन्द्र (EOC)",
        "wardNumber": 6,
        "condition": "good",
        "lastUpdatedBs": "२०८१-०४-१५",
        "contactPerson": "सुरेश श्रेष्ठ"
    },
    {
        "id": "i0010000-0000-0000-0000-000000000007",
        "itemName": "सुक्खा खाद्यान्न तथा प्रोटिन पोषण आहार प्याक",
        "category": "food",
        "quantity": 450,
        "unit": "प्याक",
        "warehouseLocation": "थाङपालधाप पालिका मुख्य गोदाम",
        "wardNumber": 6,
        "condition": "good",
        "lastUpdatedBs": "२०८१-०५-०२",
        "contactPerson": "सुरेश श्रेष्ठ"
    },
    {
        "id": "i0010000-0000-0000-0000-000000000008",
        "itemName": "पहिरो पन्छाउने गैंती, साबेल तथा औजार सेट",
        "category": "search_rescue",
        "quantity": 75,
        "unit": "सेट",
        "warehouseLocation": "बरुवा विपद् डिपो",
        "wardNumber": 2,
        "condition": "good",
        "lastUpdatedBs": "२०८१-०५-०८",
        "contactPerson": "दावा लामा"
    }
]

# 5. DISASTER RELIEF FUNDS (६ वटा विपद् राहत वितरण रेकर्डहरू)
RELIEF_FUNDS = [
    {
        "id": "f0010000-0000-0000-0000-000000000001",
        "disasterTitle": "मानेखर्क भिरालो पहिरो विस्थापित परिवार राहत",
        "wardNumber": 4,
        "beneficiaryName": "राम बहादुर तामाङ",
        "citizenshipNo": "२७-०१-७२-०३४२१",
        "familyCount": 5,
        "reliefType": "नगद राहत (DBT)",
        "amountNPR": 25000.0,
        "distributionDateBs": "२०८१-०५-०४",
        "disbursedByOfficer": "नवराज पौडेल (विपद् अधिकृत)",
        "voucherNo": "VOUCH-DIS-२०८१-००१",
        "status": "वितरण सम्पन्न"
    },
    {
        "id": "f0010000-0000-0000-0000-000000000002",
        "disasterTitle": "तिपेनी मेलम्ची नदी कटान राहत",
        "wardNumber": 7,
        "beneficiaryName": "फुर्बा शेर्पा",
        "citizenshipNo": "२७-०१-६८-०९१२३",
        "familyCount": 4,
        "reliefType": "त्रिपाल/टेन्ट",
        "amountNPR": 15000.0,
        "distributionDateBs": "२०८१-०५-०८",
        "disbursedByOfficer": "सुरेश श्रेष्ठ (जिन्सी शाखा)",
        "voucherNo": "VOUCH-DIS-२०८१-००२",
        "status": "वितरण सम्पन्न"
    },
    {
        "id": "f0010000-0000-0000-0000-000000000003",
        "disasterTitle": "भोताङ भारी वर्षा जमिन कटान तथा खाद्यान्न सहयोग",
        "wardNumber": 3,
        "beneficiaryName": "माया तामाङ",
        "citizenshipNo": "२७-०१-७५-११४५६",
        "familyCount": 6,
        "reliefType": "खाद्यान्न सामग्री",
        "amountNPR": 15000.0,
        "distributionDateBs": "२०८१-०५-११",
        "disbursedByOfficer": "नवराज पौडेल (विपद् अधिकृत)",
        "voucherNo": "VOUCH-DIS-२०८१-००३",
        "status": "वितरण सम्पन्न"
    },
    {
        "id": "f0010000-0000-0000-0000-000000000004",
        "disasterTitle": "बाँसखर्क हावाहुरी तथा छाना उडाएको पुनर्स्थापना",
        "wardNumber": 1,
        "beneficiaryName": "दिल बहादुर घले",
        "citizenshipNo": "२७-०१-७०-०५६७८",
        "familyCount": 4,
        "reliefType": "पुनर्स्थापना सहयोग",
        "amountNPR": 20000.0,
        "distributionDateBs": "२०८१-०५-१६",
        "disbursedByOfficer": "नवराज पौडेल (विपद् अधिकृत)",
        "voucherNo": "VOUCH-DIS-२०८१-००४",
        "status": "वितरण सम्पन्न"
    },
    {
        "id": "f0010000-0000-0000-0000-000000000005",
        "disasterTitle": "बरुवा खोला कटान विस्थापित परिवार आकस्मिक राहत",
        "wardNumber": 2,
        "beneficiaryName": "दावा दोर्जे तामाङ",
        "citizenshipNo": "२७-०१-६५-०२३४५",
        "familyCount": 5,
        "reliefType": "नगद राहत (DBT)",
        "amountNPR": 25000.0,
        "distributionDateBs": "२०८१-०५-१०",
        "disbursedByOfficer": "नवराज पौडेल (विपद् अधिकृत)",
        "voucherNo": "VOUCH-DIS-२०८१-००५",
        "status": "वितरण सम्पन्न"
    },
    {
        "id": "f0010000-0000-0000-0000-000000000006",
        "disasterTitle": "थाङपालधाप आगलागी पीडित परिवार आवास मर्मत सहयोग",
        "wardNumber": 6,
        "beneficiaryName": "सीता श्रेष्ठ",
        "citizenshipNo": "२७-०१-७१-०४५६७",
        "familyCount": 6,
        "reliefType": "पुनर्स्थापना सहयोग",
        "amountNPR": 30000.0,
        "distributionDateBs": "२०८१-०४-१२",
        "disbursedByOfficer": "नवराज पौडेल (विपद् अधिकृत)",
        "voucherNo": "VOUCH-DIS-२०८१-००६",
        "status": "वितरण सम्पन्न"
    }
]

# 6. VULNERABLE SETTLEMENTS (६ वटा उच्च जोखिमयुक्त बस्तीहरू)
VULNERABLE_SETTLEMENTS = [
    {
        "id": "v0010000-0000-0000-0000-000000000001",
        "settlementName": "मानेखर्क डाँडागाउँ भिरालो बस्ती",
        "wardNumber": 4,
        "hazardType": "पहिरो (Landslide)",
        "riskLevel": "अति उच्च",
        "atRiskHouseholds": 42,
        "atRiskPopulation": 195,
        "resettlementPriority": "तत्काल सुरक्षित स्थानान्तरण",
        "safeShelterName": "थाङपाल भ्याली मा.वि. आश्रय केन्द्र",
        "focalPerson": "मिङ्मार शेर्पा",
        "focalPersonPhone": "9841223344"
    },
    {
        "id": "v0010000-0000-0000-0000-000000000002",
        "settlementName": "तिपेनी-मेलम्ची नदी तटीय बजार बस्ती",
        "wardNumber": 7,
        "hazardType": "बाढी/कटान (Flood)",
        "riskLevel": "उच्च",
        "atRiskHouseholds": 34,
        "atRiskPopulation": 150,
        "resettlementPriority": "तटबन्धन/रोकथाम निर्माण",
        "safeShelterName": "तिपेनी बजार सामुदायिक सेवा केन्द्र",
        "focalPerson": "पेम्बा दोर्जे",
        "focalPersonPhone": "9841556677"
    },
    {
        "id": "v0010000-0000-0000-0000-000000000003",
        "settlementName": "भोताङ लेकाली भिर बस्ती",
        "wardNumber": 3,
        "hazardType": "पहिरो (Landslide)",
        "riskLevel": "अति उच्च",
        "atRiskHouseholds": 28,
        "atRiskPopulation": 125,
        "resettlementPriority": "तत्काल सुरक्षित स्थानान्तरण",
        "safeShelterName": "भोताङ कभर्ड हल तथा सामुदायिक आश्रयस्थल",
        "focalPerson": "दावा लामा",
        "focalPersonPhone": "9851234567"
    },
    {
        "id": "v0010000-0000-0000-0000-000000000004",
        "settlementName": "सेर्माथाङ डाँडा बस्ती",
        "wardNumber": 3,
        "hazardType": "हिमपात/हिमपहिरो (Snow)",
        "riskLevel": "मध्यम",
        "atRiskHouseholds": 18,
        "atRiskPopulation": 76,
        "resettlementPriority": "पूर्वतयारी तथा सतर्कता",
        "safeShelterName": "सेर्माथाङ गुम्बा परिसर",
        "focalPerson": "तेन्जिङ नोर्बु शेर्पा",
        "focalPersonPhone": "9841667788"
    },
    {
        "id": "v0010000-0000-0000-0000-000000000005",
        "settlementName": "बरुवा खोला गल्छी बस्ती",
        "wardNumber": 2,
        "hazardType": "बाढी/कटान (Flood)",
        "riskLevel": "उच्च",
        "atRiskHouseholds": 22,
        "atRiskPopulation": 104,
        "resettlementPriority": "तटबन्धन/रोकथाम निर्माण",
        "safeShelterName": "बरुवा स्वास्थ्य चौकी तथा सामुदायिक भवन",
        "focalPerson": "सूर्य बहादुर तामाङ",
        "focalPersonPhone": "9808123456"
    },
    {
        "id": "v0010000-0000-0000-0000-000000000006",
        "settlementName": "बाँसखर्क भिर बस्ती",
        "wardNumber": 1,
        "hazardType": "पहिरो (Landslide)",
        "riskLevel": "मध्यम",
        "atRiskHouseholds": 16,
        "atRiskPopulation": 82,
        "resettlementPriority": "पूर्वतयारी तथा सतर्कता",
        "safeShelterName": "बाँसखर्क माध्यमिक विद्यालय आश्रयस्थल",
        "focalPerson": "दिल बहादुर घले",
        "focalPersonPhone": "9841335501"
    }
]

# 7. EMERGENCY BROADCASTS (४ वटा आपत्कालीन पूर्वसूचना अलर्टहरू)
EMERGENCY_BROADCASTS = [
    {
        "id": "eb-2081-01",
        "title": "मनसुनजन्य भारी वर्षा तथा मेलम्ची/याङ्ग्री नदी तटीय क्षेत्रमा उच्च सतर्कता",
        "message": "आगामी २४ घण्टा पाँचपोखरी थाङपाल जलाधार क्षेत्रमा भारी वर्षाको सम्भावना रहेको जल तथा मौसम विज्ञान विभागबाट जानकारी प्राप्त भएकाले मेलम्ची, याङ्ग्री र बरुवा खोला तटीय क्षेत्रका बासिन्दालाई उच्च सतर्कता अपनाउन र सुरक्षित स्थानमा बस्न अनुरोध गरिन्छ।",
        "hazardType": "बाढी/कटान (Flood)",
        "severity": "critical",
        "targetWard": "all",
        "channels": ["sms", "siren", "portal", "radio"],
        "recipientsCount": 4500,
        "status": "delivered",
        "timestampBs": "२०८१-०५-०१ १२:३०"
    },
    {
        "id": "eb-2081-02",
        "title": "मानेखर्क-भोताङ सडक खण्डमा पहिरो खसेकाले वैकल्पिक मार्ग प्रयोग सम्बन्धी",
        "message": "मानेखर्क र भोताङ जोड्ने सडकको छिम्ती खण्डमा पहिरो खसी सडक पूर्ण अवरुद्ध भएको छ। सडक खुलाउन डोजर परिचालन भइसकेको छ। तत्कालका लागि पैदलयात्री तथा सवारी साधनलाई सावधानी अपनाउन अनुरोध छ।",
        "hazardType": "पहिरो (Landslide)",
        "severity": "high",
        "targetWard": "3,4",
        "channels": ["sms", "portal"],
        "recipientsCount": 1200,
        "status": "delivered",
        "timestampBs": "२०८१-०५-११ ०८:४५"
    },
    {
        "id": "eb-2081-03",
        "title": "हिउँदे सुख्खायाममा वन डढेलो रोकथाम तथा नियन्त्रण सम्बन्धी सचेतना",
        "message": "सुख्खा मौसम सुरु भएसँगै हावाहुरीका कारण वनजङ्गलमा डढेलो लाग्ने जोखिम उच्च रहेकाले वन क्षेत्र आसपास आगो नबाल्न र आगो लागेको देखेमा तुरुन्त स्थानीय प्रहरी वा पालिका विपद् शाखामा खबर गर्न अनुरोध गरिन्छ।",
        "hazardType": "डढेलो (Wildfire)",
        "severity": "medium",
        "targetWard": "all",
        "channels": ["sms", "portal"],
        "recipientsCount": 3800,
        "status": "delivered",
        "timestampBs": "२०८०-१२-१० १४:००"
    },
    {
        "id": "eb-2081-04",
        "title": "मौसम पूर्वानुमान: उच्च हिमाली क्षेत्रमा भारी हिमपातको सम्भावना",
        "message": "पश्चिमी वायुको प्रभावले भोताङ, सेर्माथाङ र पाँचपोखरी पदमार्ग क्षेत्रमा भारी हिमपात र चिसो बढ्ने सम्भावना रहेकाले उच्च खर्कका चौंरीपालक किसान र पदयात्रीलाई सुरक्षित रहन आग्रह गरिन्छ।",
        "hazardType": "हिमपात (Snow)",
        "severity": "medium",
        "targetWard": "2,3",
        "channels": ["sms", "portal"],
        "recipientsCount": 850,
        "status": "delivered",
        "timestampBs": "२०८०-१०-२० १६:१५"
    }
]

def seed_disaster():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    now = datetime.now(timezone.utc)

    print("--- 1. Seeding Disaster Events ---")
    cur.execute("DELETE FROM disaster_events")
    for e in DISASTER_EVENTS:
        cur.execute("""
            INSERT INTO disaster_events (
                tenant_id, id, title, type, severity, status, description,
                lat, lng, "wardNumber", "reporterName", "reporterPhone",
                "incidentDateBs", "affectedHouseholds", "affectedPeople",
                "humanCasualties", "missingPersons", "injuredCount",
                "livestockLossCount", "fullyDamagedHouses", "partiallyDamagedHouses",
                "estimatedLossNPR", "reliefStatus", "reliefMaterials",
                "reliefDisbursedNPR", "rescueTeam", "tolsSettlement",
                "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s
            )
        """, (
            TENANT_ID, str(uuid.uuid5(uuid.NAMESPACE_DNS, e["id"])), e["title"], e["type"], e["severity"], e["status"], e["description"],
            e["lat"], e["lng"], e["wardNumber"], e["reporterName"], e["reporterPhone"],
            e["incidentDateBs"], e["affectedHouseholds"], e["affectedPeople"],
            e["humanCasualties"], e["missingPersons"], e["injuredCount"],
            e["livestockLossCount"], e["fullyDamagedHouses"], e["partiallyDamagedHouses"],
            e["estimatedLossNPR"], e["reliefStatus"], e["reliefMaterials"],
            e["reliefDisbursedNPR"], e["rescueTeam"], e["tolsSettlement"],
            now, now
        ))
    conn.commit()
    print(f"✓ Seeded {len(DISASTER_EVENTS)} disaster events.")

    print("\n--- 2. Seeding Emergency Shelters ---")
    cur.execute("DELETE FROM shelters")
    for s in SHELTERS:
        cur.execute("""
            INSERT INTO shelters (
                tenant_id, id, name, ward_number, location, capacity,
                has_water, has_power_backup, contact_person, contact_phone,
                lat, lng, status, facilities_description, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            TENANT_ID, str(uuid.uuid5(uuid.NAMESPACE_DNS, s["id"])), s["name"], s["ward_number"], s["location"], s["capacity"],
            s["has_water"], s["has_power_backup"], s["contact_person"], s["contact_phone"],
            s["lat"], s["lng"], s["status"], s["facilities_description"], now, now
        ))
    conn.commit()
    print(f"✓ Seeded {len(SHELTERS)} emergency shelters.")

    print("\n--- 3. Seeding Emergency Contacts ---")
    cur.execute("DELETE FROM emergency_contacts")
    for c in EMERGENCY_CONTACTS:
        cur.execute("""
            INSERT INTO emergency_contacts (
                tenant_id, id, name, role, phone, "wardNumber",
                department, category, "isAvailable24_7", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            TENANT_ID, str(uuid.uuid5(uuid.NAMESPACE_DNS, c["id"])), c["name"], c["role"], c["phone"], c["wardNumber"],
            c["department"], c["category"], c["isAvailable24_7"], now, now
        ))
    conn.commit()
    print(f"✓ Seeded {len(EMERGENCY_CONTACTS)} emergency contacts.")

    print("\n--- 4. Seeding Relief Inventory ---")
    cur.execute("DELETE FROM disaster_relief_inventory")
    for item in RELIEF_INVENTORY:
        cur.execute("""
            INSERT INTO disaster_relief_inventory (
                id, "itemName", category, quantity, unit,
                "warehouseLocation", "wardNumber", condition,
                "lastUpdatedBs", "contactPerson", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid5(uuid.NAMESPACE_DNS, item["id"])), item["itemName"], item["category"], item["quantity"], item["unit"],
            item["warehouseLocation"], item["wardNumber"], item["condition"],
            item["lastUpdatedBs"], item["contactPerson"], now, now
        ))
    conn.commit()
    print(f"✓ Seeded {len(RELIEF_INVENTORY)} relief inventory items.")

    print("\n--- 5. Seeding Disaster Relief Funds ---")
    cur.execute("DELETE FROM disaster_relief_funds")
    for fund in RELIEF_FUNDS:
        cur.execute("""
            INSERT INTO disaster_relief_funds (
                id, "disasterTitle", "wardNumber", "beneficiaryName",
                "citizenshipNo", "familyCount", "reliefType", "amountNPR",
                "distributionDateBs", "disbursedByOfficer", "voucherNo",
                status, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid5(uuid.NAMESPACE_DNS, fund["id"])), fund["disasterTitle"], fund["wardNumber"], fund["beneficiaryName"],
            fund["citizenshipNo"], fund["familyCount"], fund["reliefType"], fund["amountNPR"],
            fund["distributionDateBs"], fund["disbursedByOfficer"], fund["voucherNo"],
            fund["status"], now, now
        ))
    conn.commit()
    print(f"✓ Seeded {len(RELIEF_FUNDS)} disaster relief fund distribution records.")

    print("\n--- 6. Seeding Vulnerable Settlements ---")
    cur.execute("DELETE FROM vulnerable_settlements")
    for vs in VULNERABLE_SETTLEMENTS:
        cur.execute("""
            INSERT INTO vulnerable_settlements (
                id, "settlementName", "wardNumber", "hazardType",
                "riskLevel", "atRiskHouseholds", "atRiskPopulation",
                "resettlementPriority", "safeShelterName", "focalPerson",
                "focalPersonPhone", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid5(uuid.NAMESPACE_DNS, vs["id"])), vs["settlementName"], vs["wardNumber"], vs["hazardType"],
            vs["riskLevel"], vs["atRiskHouseholds"], vs["atRiskPopulation"],
            vs["resettlementPriority"], vs["safeShelterName"], vs["focalPerson"],
            vs["focalPersonPhone"], now, now
        ))
    conn.commit()
    print(f"✓ Seeded {len(VULNERABLE_SETTLEMENTS)} vulnerable settlements.")

    print("\n--- 7. Seeding Emergency Broadcasts ---")
    cur.execute("DELETE FROM emergency_broadcasts")
    for eb in EMERGENCY_BROADCASTS:
        cur.execute("""
            INSERT INTO emergency_broadcasts (
                id, title, message, "hazardType", severity, "targetWard",
                channels, "recipientsCount", status, "timestampBs", "createdAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            eb["id"], eb["title"], eb["message"], eb["hazardType"], eb["severity"],
            eb["targetWard"], json.dumps(eb["channels"], ensure_ascii=False),
            eb["recipientsCount"], eb["status"], eb["timestampBs"], now
        ))
    conn.commit()
    print(f"✓ Seeded {len(EMERGENCY_BROADCASTS)} emergency broadcasts.")

    # 8. DRRM Incidents
    print("\n--- 8. Seeding DRRM Incidents & Damage Reports ---")
    cur.execute("DELETE FROM drrm_damage_reports")
    cur.execute("DELETE FROM drrm_recovery_projects")
    cur.execute("DELETE FROM drrm_preparedness_items")
    cur.execute("DELETE FROM drrm_incidents")

    drrm_incidents = [
        ("drrm-inc-01", "landslide", now, "ward-04", "high", "मानेखर्क डाँडागाउँ पहिरो", json.dumps({"lat": 27.935, "lng": 85.582}), "active"),
        ("drrm-inc-02", "flood", now, "ward-07", "critical", "तिपेनी मेलम्ची बाढी कटान", json.dumps({"lat": 27.912, "lng": 85.569}), "resolved"),
        ("drrm-inc-03", "landslide", now, "ward-03", "medium", "भोताङ सडक पहिरो", json.dumps({"lat": 27.965, "lng": 85.612}), "active"),
        ("drrm-inc-04", "fire", now, "ward-01", "medium", "बाँसखर्क वन डढेलो", json.dumps({"lat": 27.945, "lng": 85.614}), "resolved"),
    ]
    for inc in drrm_incidents:
        cur.execute("""
            INSERT INTO drrm_incidents (
                tenant_id, id, incident_type, incident_date, ward_id, severity,
                description, gis_location, status, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (TENANT_ID, inc[0], inc[1], inc[2], inc[3], inc[4], inc[5], inc[6], inc[7], now, now))

    drrm_damage = [
        ("dmg-01", "drrm-inc-01", 0, 2, 3500000.0, json.dumps({"tarpaulin": 30, "cash": 75000})),
        ("dmg-02", "drrm-inc-02", 0, 1, 6200000.0, json.dumps({"gabion": 150, "cash": 120000})),
    ]
    for dmg in drrm_damage:
        cur.execute("""
            INSERT INTO drrm_damage_reports (
                tenant_id, id, incident_id, human_casualties, injured_count,
                estimated_loss_amount, relief_provided, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (TENANT_ID, dmg[0], dmg[1], dmg[2], dmg[3], dmg[4], dmg[5], now))

    drrm_preparedness = [
        ("prep-01", "warehouse", "थाङपालधाप केन्द्रीय विपद् राहत गोदाम", 500.0, "थाङपालधाप", "सुरेश श्रेष्ठ", "9841556605", "operational"),
        ("prep-02", "rescue_gear", "खोजी तथा उद्धार बोट र लाइफ ज्याकेट युनिट", 60.0, "मेलम्ची बेस", "प्रहरी निरीक्षक", "9851122100", "operational"),
        ("prep-03", "heavy_equipment", "पालिका हेभी डोजर (Cat D6)", 2.0, "मानेखर्क डिपो", "डोजर अपरेटर", "9851022901", "operational"),
    ]
    for prep in drrm_preparedness:
        cur.execute("""
            INSERT INTO drrm_preparedness_items (
                tenant_id, id, item_type, name_or_title, quantity_capacity,
                current_location, contact_person_id, contact_phone, status,
                created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (TENANT_ID, prep[0], prep[1], prep[2], prep[3], prep[4], prep[5], prep[6], prep[7], now, now))

    conn.commit()
    print("✓ Seeded DRRM incidents, damage reports, and preparedness items.")

    # Summary report
    print("\n=== Verification of Disaster Tables ===")
    for table in [
        'disaster_events', 'shelters', 'emergency_contacts',
        'disaster_relief_inventory', 'disaster_relief_funds',
        'vulnerable_settlements', 'emergency_broadcasts',
        'drrm_incidents', 'drrm_damage_reports', 'drrm_preparedness_items'
    ]:
        cur.execute(f'SELECT count(*) FROM "{table}"')
        print(f"  - {table}: {cur.fetchone()[0]} rows")

    cur.close()
    conn.close()

if __name__ == '__main__':
    seed_disaster()
