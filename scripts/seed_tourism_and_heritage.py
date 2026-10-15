"""
Seed Script for Option 12: Tourism & Heritage Management
(पर्यटन तथा सम्पदा व्यवस्थापन)
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


def seed_tourism_destinations(cur):
    """Seed 10 premier tourist destinations across Panchpokhari Thangpal."""
    print("--- 1. Seeding tourism_destinations (10 destinations) ---")
    destinations = [
        (
            "dest-01",
            "पाँचपोखरी पावन कुण्डहरू (Panchpokhari Sacred Lakes)",
            "Panchpokhari Sacred Lakes",
            3,
            4100,
            "धार्मिक तथा प्राकृतिक",
            "विश्वकै ९ औं अग्लो स्थानमा अवस्थित ५ वटा पवित्र कुण्डहरू (सूर्य, भैरव, नाग, सरस्वती, गणेश)। जनैपूर्णिमामा भव्य मेला लाग्ने प्रसिद्ध तीर्थस्थल।",
            "भदौ - कात्तिक, चैत - जेठ",
            "४ देखि ६ दिन",
            json.dumps(["पाँचवटा हिमताल", "जुगल हिमाल हिमशृङ्खला", "जनैपूर्णिमा मेला", "अविस्मरणीय सूर्योदय"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
            28.0416,
            85.7067
        ),
        (
            "dest-02",
            "आमायाङ्ग्री चुचुरो तथा छोर्तेन (Ama Yangri Peak)",
            "Ama Yangri Peak",
            2,
            3771,
            "सांस्कृतिक तथा भ्यू पोइन्ट",
            "ह्योल्मो समुदायकी रक्षक देवी आमायाङ्ग्रीको पवित्र चुचुरो। यहाँबाट लाङटाङ, जुगल, गणेश र दोर्जे लाक्पा हिमालको ३६० डिग्री मनमोहक दृश्य देखिन्छ।",
            "असोज - मंसिर, फागुन - वैशाख",
            "२ देखि ३ दिन",
            json.dumps(["३६० डिग्री हिमशृङ्खला", "आमायाङ्ग्री छोर्तेन", "ह्योल्मो संस्कृति", "लालीगुराँस वन"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
            28.0050,
            85.5780
        ),
        (
            "dest-03",
            "ड्रागन गुफा / गुरु पद्मसम्भव ध्यान गुफा",
            "Dragon Cave / Padmasambhava Cave",
            3,
            3250,
            "ऐतिहासिक तथा धार्मिक",
            "आठौं शताब्दीमा बौद्ध धर्मगुरु पद्मसम्भव (गुरु रिन्पोछे) ले ध्यान गरेको मानिने रहस्यमयी गुफा र प्रस्तर आकृतिहरू।",
            "असोज - जेठ",
            "१ दिन (तार्केघ्याङबाट)",
            json.dumps(["प्राचीन ध्यान गुफा", "प्राकृतिक चट्टानी आकृति", "शान्त ध्यान केन्द्र"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
            27.9920,
            85.6050
        ),
        (
            "dest-04",
            "तार्केघ्याङ प्राचीन सम्पदा बस्ती तथा गुम्बा",
            "Tarkeghyang Heritage Village",
            3,
            2600,
            "सांस्कृतिक सम्पदा",
            "ह्योल्मो संस्कृतिको केन्द्रविन्दु, ढुङ्गाका सुन्दर परम्परागत घरहरू, सयौं वर्ष पुराना बौद्ध गुम्बा र आतिथ्यपूर्ण सामुदायिक होमस्टे।",
            "बाह्रै महिना",
            "सडकमार्ग / १ दिन",
            json.dumps(["ऐतिहासिक गुम्बा", "ह्योल्मो संस्कृति र भेषभूषा", "सामुदायिक होमस्टे", "अग्र्यानिक स्याउ र किबी"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
            27.9789,
            85.6123
        ),
        (
            "dest-05",
            "छिमिटि झरना तथा क्यानोनिङ स्पट",
            "Chhimiti Waterfall & Canyoning",
            4,
            1850,
            "साहसिक खेल तथा मनोरञ्जन",
            "थाङपालकोट नजिकै अवस्थित १०० मिटर भन्दा अग्लो आकर्षक प्राकृतिक झरना, क्यानोनिङ तथा रक क्लाइम्बिङका लागि उत्कृष्ट गन्तव्य।",
            "असोज - जेठ",
            "आधा दिन",
            json.dumps(["१०० मिटर झरना", "क्यानोनिङ खेल", "पिकनिक स्पट", "हरियाली जंगल"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&q=80",
            27.9610,
            85.5980
        ),
        (
            "dest-06",
            "रैथने हवेली तथा ऐतिहासिक थाङपालकोट गढी",
            "Raithane Haveli & Thangpalkot Fort",
            6,
            2100,
            "ऐतिहासिक तथा पुरातात्विक",
            "एकीकरण कालभन्दा पूर्वको ऐतिहासिक सामरिक गढी, रैथने शैलीको काष्ठकला हवेली र प्राचीन हातहतियार भण्डारण क्षेत्र।",
            "असोज - जेठ",
            "१ दिन",
            json.dumps(["ऐतिहासिक गढी पर्खाल", "परम्परागत काष्ठकला", "थाङपाल उपत्यका दृश्यावलोकन"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80",
            27.9450,
            85.6200
        ),
        (
            "dest-07",
            "छोचो डाँडा भ्यू-पोइन्ट तथा लालीगुराँस पदमार्ग",
            "Chhyochhyo Danda Rhododendron Viewpoint",
            7,
            3150,
            "प्राकृतिक तथा दृश्यावलोकन",
            "वसन्त ऋतुमा १६ प्रजातिका लालीगुराँस फुल्ने स्वर्गभूमि, पाँचपोखरी ट्रेकिङ रुटको मुख्य विश्रामस्थल।",
            "फागुन - वैशाख, असोज - मंसिर",
            "१-२ दिन",
            json.dumps(["लालीगुराँसको जंगल", "सूर्योदय तथा सूर्यास्त", "क्याम्पिङ साइट"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
            28.0120,
            85.6700
        ),
        (
            "dest-08",
            "भोताङ शेर्पा संस्कृति तथा स्याउ बगैँचा",
            "Bhotang Sherpa Village & Orchards",
            7,
            2400,
            "कृषि पर्यटन तथा संस्कृति",
            "पाँचपोखरी पदयात्राको प्रवेशद्वार, शेर्पा संस्कृति, चौंरी पालन र उच्च हिमाली स्वादिष्ट स्याउ खेतीको अवलोकन।",
            "बाह्रै महिना",
            "सडकमार्ग / १ दिन",
            json.dumps(["स्याउ बगैँचा", "शेर्पा परम्परा", "चौंरीका उत्पादनहरू", "पाँचपोखरी ट्रेक बेस"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
            27.9850,
            85.6550
        ),
        (
            "dest-09",
            "बाँसखर्क सुन्तला बगैँचा तथा रक गार्डेन",
            "Banskharka Citrus Orchards & Rock Garden",
            1,
            1500,
            "कृषि पर्यटन तथा मनोरञ्जन",
            "प्रसिद्ध बाँसखर्के सुन्तलाको राजधानी, हजारौं बोट लटरम्म सुन्तला, रक गार्डेन र इन्द्रावती जलाधार अवलोकन।",
            "कात्तिक - पुस (सुन्तला सिजन)",
            "आधा दिन",
            json.dumps(["अर्गानिक सुन्तला बगान", "रक गार्डेन", "ताजा जुस स्वाद", "इन्द्रावती नदी दृश्यावलोकन"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80",
            27.9100,
            85.5500
        ),
        (
            "dest-10",
            "नोर्बुलाङ गुम्बा तथा ध्यान केन्द्र (गुन्सा)",
            "Norbuling Gompa Meditation Sanctuary",
            5,
            2800,
            "धार्मिक तथा ध्यान केन्द्र",
            "एकान्त जंगलको बीचमा अवस्थित प्राचीन नोर्बुलाङ गुम्बा, जहाँ अन्तर्राष्ट्रिय ध्यान तथा विपश्यना साधकहरू पुग्ने गर्दछन्।",
            "बाह्रै महिना",
            "१ दिन",
            json.dumps(["शान्त ध्यान कुटी", "प्राचीन बुद्ध मूर्ति", "पवित्र हरियाली वन"], ensure_ascii=False),
            "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
            27.9650,
            85.6350
        )
    ]

    q = """
        INSERT INTO tourism_destinations (
            id, name, "nameEn", "wardNo", "altitudeMeters", category, description,
            "bestSeason", "trekDuration", highlights, "imageUrl", lat, lng, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            "nameEn" = EXCLUDED."nameEn",
            "wardNo" = EXCLUDED."wardNo",
            "altitudeMeters" = EXCLUDED."altitudeMeters",
            category = EXCLUDED.category,
            description = EXCLUDED.description,
            "bestSeason" = EXCLUDED."bestSeason",
            "trekDuration" = EXCLUDED."trekDuration",
            highlights = EXCLUDED.highlights,
            "imageUrl" = EXCLUDED."imageUrl",
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            "updatedAt" = NOW();
    """
    for d in destinations:
        cur.execute(q, d)
    print(f"  Inserted/Updated {len(destinations)} destinations.")


def seed_tourism_hotels(cur):
    """Seed 12 homestays, resorts, and lodges across Panchpokhari wards."""
    print("--- 2. Seeding tourism_hotels (12 hotels & homestays) ---")
    hotels = [
        (
            "ht-01", "तार्केघ्याङ शेर्पा सामुदायिक होमस्टे", "homestay", "community_homestay", "क", 3,
            "दावा लामा शेर्पा", "दावा लामा शेर्पा", "९८४१२३४५६७", "९८४१२३४५६७", "पाँच-पर्यटन-०३/२०८०-०१",
            "PAN: 602348912", 8, 20, 20, "१,५००",
            json.dumps(["तातो पानी", "स्थानीय अर्गानिक खाना", "वाइफाइ", "क्याम्प फायर"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80"
        ),
        (
            "ht-02", "ह्योल्मो हेभन रिसोर्ट एन्ड लज", "resort", "resort", "क", 2,
            "पासाङ शेर्पा", "पासाङ शेर्पा", "९८५११२२३३४", "९८५११२२३३४", "पाँच-पर्यटन-०२/२०७९-०८",
            "PAN: 601998877", 14, 32, 32, "३,०००",
            json.dumps(["अट्याच बाथरुम", "सोलार गिजर", "रेस्टुरेन्ट", "गाइड सुविधा"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80"
        ),
        (
            "ht-03", "पाँचपोखरी भ्यू लज तथा रेस्टुरेन्ट", "hotel_lodge", "hotel_lodge", "ख", 3,
            "निमा दोर्जे शेर्पा", "निमा दोर्जे शेर्पा", "९८६००११२२३", "९८६००११२२३", "पाँच-पर्यटन-०३/२०८१-०४",
            "ना.प्र.नं: ०३-१४-०२३५", 10, 24, 24, "१,२००",
            json.dumps(["डर्मिटरी बेड", "न्यानो कम्बल", "तातो चिया-खाजा", "अक्सिजन सिलिन्डर"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80"
        ),
        (
            "ht-04", "मानेखर्क इको होमस्टे", "homestay", "private_homestay", "ग", 4,
            "कमला तामाङ", "कमला तामाङ", "९८४९०८७६५४", "९८४९०८७६५४", "पाँच-पर्यटन-०४/२०८१-०९",
            "ना.प्र.नं: ०३-०९-४४०१", 4, 10, 10, "१,०००",
            json.dumps(["घरको ताजा खाना", "घरेलु मदिरा तथा स्थानीय परिकार", "तामाङ नाच प्रदर्शन"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80"
        ),
        (
            "ht-05", "भोताङ अल्पाइन एडभेन्चर लज", "hotel_lodge", "hotel_lodge", "ख", 7,
            "छिरिङ तामाङ", "छिरिङ तामाङ", "९८५१२३९९००", "९८५१२३९९००", "पाँच-पर्यटन-०७/२०८०-०३",
            "PAN: 603412789", 12, 28, 28, "१,४००",
            json.dumps(["ट्रेकिङ गियर भाडामा", "तातो पानी", "स्थानीय चौंरीको चिज", "वाईफाइ"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&q=80"
        ),
        (
            "ht-06", "आमायाङ्ग्री पिक्स होमस्टे (बरुवा)", "homestay", "community_homestay", "क", 2,
            "पेम्बा डोल्मा ह्योल्मो", "पेम्बा डोल्मा ह्योल्मो", "९८४१२२८८११", "९८४१२२८८११", "पाँच-पर्यटन-०२/२०८१-१२",
            "ना.प्र.नं: ०२-०८-११४५", 6, 15, 15, "१,६००",
            json.dumps(["अर्गानिक स्याउको परिकार", "ह्योल्मो संग्रहालय भ्रमण", "सोलार बत्ती"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80"
        ),
        (
            "ht-07", "थाङपालकोट हेरिटेज होमस्टे", "homestay", "private_homestay", "ख", 6,
            "दोर्जे लाक्पा शेर्पा", "दोर्जे लाक्पा शेर्पा", "९८५११४४५५६", "९८५११४४५५६", "पाँच-पर्यटन-०६/२०८०-०५",
            "ना.प्र.नं: ०६-११-९८७४", 5, 12, 12, "१,२००",
            json.dumps(["ऐतिहासिक गढी अवलोकन", "गाइड सुविधा", "घरको लोकल कुखुरा र ढिँडो"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=500&q=80"
        ),
        (
            "ht-08", "बाँसखर्क सिट्रस भ्याली रिसोर्ट", "resort", "resort", "क", 1,
            "कृष्ण प्रसाद दङ्गाल", "कृष्ण प्रसाद दङ्गाल", "९८५११००२२३", "९८५११००२२३", "पाँच-पर्यटन-०१/२०७८-०२",
            "PAN: 601234567", 10, 25, 25, "२,५००",
            json.dumps(["सुन्तला बगान भ्रमण", "स्वीमिङ पुल", "अट्याच बाथरुम", "सम्मेलन हल"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80"
        ),
        (
            "ht-09", "गुन्सा मेडिटेसन इको लज", "hotel_lodge", "hotel_lodge", "ख", 5,
            "तेन्जिङ नोर्बु लामा", "तेन्जिङ नोर्बु लामा", "९८४१५५९९२२", "९८४१५५९९२२", "पाँच-पर्यटन-०५/२०८१-०६",
            "ना.प्र.नं: ०५-०१-३३२१", 8, 16, 16, "१,५००",
            json.dumps(["ध्यान हल", "शाकाहारी सात्विक खाना", "हर्बल चिया", "शान्त वातावरण"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=500&q=80"
        ),
        (
            "ht-10", "छोचो डाँडा हाइल्यान्ड क्याम्पिङ तथा लज", "hotel_lodge", "hotel_lodge", "ख", 7,
            "मिङ्मार शेर्पा", "मिङ्मार शेर्पा", "९८५१२३४४०१", "९८५१२३४४०१", "पाँच-पर्यटन-०७/२०८१-१४",
            "ना.प्र.नं: ०७-१५-८८०१", 6, 18, 18, "१,३००",
            json.dumps(["टेन्ट क्याम्पिङ", "लालीगुराँस वन ट्रेक", "अलाव (Campfire)", "तातो सुप"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=500&q=80"
        ),
        (
            "ht-11", "थाङपालधाप रिभरसाइड होमस्टे", "homestay", "community_homestay", "ग", 4,
            "सुनिता थामी", "सुनिता थामी", "९८६०१२३४५६", "९८६०१२३४५६", "पाँच-पर्यटन-०४/२०८१-११",
            "ना.प्र.नं: ०४-०५-२२१०", 4, 10, 10, "१,०००",
            json.dumps(["नदी किनार माछा परिकार", "अग्र्यानिक तरकारी", "गाउँले वातावरण"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500&q=80"
        ),
        (
            "ht-12", "नोर्बुलिङ शेर्पा गेस्टहाउस", "hotel_lodge", "hotel_lodge", "ख", 3,
            "आङ दावा शेर्पा", "आङ दावा शेर्पा", "९८४१७७८८९९", "९८४१७७८८९९", "पाँच-पर्यटन-०३/२०८१-१५",
            "PAN: 604556677", 9, 22, 22, "१,४००",
            json.dumps(["गुम्बा नजिक", "हट सावर", "ह्योल्मो सांस्कृतिक खाना", "रुफटप भ्यू"], ensure_ascii=False),
            "active", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80"
        )
    ]

    q = """
        INSERT INTO tourism_hotels (
            id, name, type, "homestayType", classification, "wardNo", "ownerName",
            "proprietorName", "contactNumber", phone, "palikaRegNo", "operatorPanOrCitizenship",
            "totalRooms", "bedCapacity", capacity, "pricePerNight", amenities, status,
            "imageUrl", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            "homestayType" = EXCLUDED."homestayType",
            classification = EXCLUDED.classification,
            "wardNo" = EXCLUDED."wardNo",
            "ownerName" = EXCLUDED."ownerName",
            "proprietorName" = EXCLUDED."proprietorName",
            "contactNumber" = EXCLUDED."contactNumber",
            phone = EXCLUDED.phone,
            "palikaRegNo" = EXCLUDED."palikaRegNo",
            "operatorPanOrCitizenship" = EXCLUDED."operatorPanOrCitizenship",
            "totalRooms" = EXCLUDED."totalRooms",
            "bedCapacity" = EXCLUDED."bedCapacity",
            capacity = EXCLUDED.capacity,
            "pricePerNight" = EXCLUDED."pricePerNight",
            amenities = EXCLUDED.amenities,
            status = EXCLUDED.status,
            "imageUrl" = EXCLUDED."imageUrl",
            "updatedAt" = NOW();
    """
    for h in hotels:
        cur.execute(q, h)
    print(f"  Inserted/Updated {len(hotels)} hotels and homestays.")


def seed_tourism_packages(cur):
    """Seed 6 curated trekking and cultural tour packages."""
    print("--- 3. Seeding tourism_packages (6 tour packages) ---")
    packages = [
        (
            "pkg-1",
            "पाँचपोखरी पावन कुण्ड महातीर्थ तथा अल्पाइन ट्रेक",
            "Panchpokhari Sacred Alpine Trek",
            6,
            "२२,५००",
            "मध्यम-साहसिक",
            json.dumps(["भोताङ", "छोचो डाँडा", "नाकौते", "पाँचपोखरी ताल (४१०० मी.)"], ensure_ascii=False),
            json.dumps(["लाइसेन्सप्राप्त स्थानीय गाइड र पोर्टर", "आवास तथा ३ छाक पोषणयुक्त खाना", "पालिका पर्यटन परमिट", "अक्सिजन र प्राथमिक उपचार"], ensure_ascii=False),
            True,
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&q=80",
            "विश्वकै ९ औं अग्लो स्थानमा अवस्थित पाँच पवित्र तालहरूको दर्शन, जुगल हिमशृङ्खलाको काखमा अविस्मरणीय पदयात्रा।",
            True
        ),
        (
            "pkg-2",
            "आमायाङ्ग्री सूर्योदय तथा ह्योल्मो सांस्कृतिक सम्पदा पदयात्रा",
            "Ama Yangri Cultural Sunrise Trek",
            3,
            "११,०००",
            "सजिलो-मध्यम",
            json.dumps(["तार्केघ्याङ", "आमायाङ्ग्री चुचुरो (३७७१ मी.)", "ह्योल्मो गुम्बा"], ensure_ascii=False),
            json.dumps(["सामुदायिक होमस्टे आवास", "अर्गानिक स्थानीय खाना", "ह्योल्मो सांस्कृतिक कार्यक्रम", "गाइड सुविधा"], ensure_ascii=False),
            True,
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80",
            "ह्योल्मो संस्कृतिकी रक्षक देवी आमायाङ्ग्री शिखरबाट लाङटाङ र जुगल हिमालको ३६० डिग्री सूर्योदय अवलोकन।",
            True
        ),
        (
            "pkg-3",
            "छिमिटि झरना, क्यानोनिङ तथा रक क्लाइम्बिङ एडभेन्चर",
            "Chhimiti Waterfall & Canyoning Adventure",
            2,
            "८,५००",
            "साहसिक",
            json.dumps(["थाङपालकोट", "छिमिटि झरना", "क्यानोनिङ स्पट"], ensure_ascii=False),
            json.dumps(["क्यानोनिङ प्राविधिक गाइड तथा सुरक्षा गियर", "टेन्ट क्याम्पिङ / होमस्टे", "२ छाक खाना र खाजा", "दुर्घटना बिमा"], ensure_ascii=False),
            True,
            "https://images.unsplash.com/photo-1511497584788-87676104235f?w=500&q=80",
            "१०० मिटर अग्लो प्राकृतिक झरनामा क्यानोनिङ र थाङपालकोटको ऐतिहासिक प्राकृतिक सौन्दर्य।",
            True
        ),
        (
            "pkg-4",
            "पाँचपोखरी - गोसाइँकुण्ड ट्रान्स-हिमालयन पदमार्ग",
            "Panchpokhari to Gosaikunda Trans-Himalayan Traverse",
            8,
            "३८,०००",
            "साहसिक-कठिन",
            json.dumps(["पाँचपोखरी", "तिल्पुङ पास", "सूर्यकला", "गोसाइँकुण्ड", "धुन्चे"], ensure_ascii=False),
            json.dumps(["विशेषज्ञ पर्वतीय गाइड", "हाई-अल्टिच्युड टेन्टिङ", "सबै खाना र लजिस्टिक", "स्याटलाइट फोन सम्पर्क"], ensure_ascii=False),
            True,
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80",
            "सिन्धुपाल्चोकको पाँचपोखरीबाट रसुवाको गोसाइँकुण्ड जोड्ने साहसिक पदयात्रीहरूको ड्रिम-ट्रेक।",
            True
        ),
        (
            "pkg-5",
            "तार्केघ्याङ विपश्यना ध्यान, योग तथा जैविक कृषि पर्यटन",
            "Tarkeghyang Meditation & Agro-Tourism Retreat",
            4,
            "१४,०००",
            "सजिलो",
            json.dumps(["तार्केघ्याङ", "पद्मसम्भव गुफा", "स्याउ बगैँचा"], ensure_ascii=False),
            json.dumps(["दैनिक योग तथा ध्यान सत्र", "अर्गानिक सात्विक भोजन", "ह्योल्मो संग्रहालय टिकट", "होमस्टे"], ensure_ascii=False),
            True,
            "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80",
            "शहरको कोलाहलबाट टाढा, प्राचीन बौद्ध गुम्बा र ध्यान गुफाको काखमा आत्मिक शान्ति र स्वास्थ्य लाभ।",
            True
        ),
        (
            "pkg-6",
            "बाँसखर्क सिट्रस टुर तथा इन्द्रावती रिभरसाइड क्याम्पिङ",
            "Banskharka Citrus & Riverside Weekend",
            2,
            "६,५००",
            "सजिलो",
            json.dumps(["बाँसखर्क सुन्तला बगान", "रक गार्डेन", "इन्द्रावती रिभर क्याम्प"], ensure_ascii=False),
            json.dumps(["सुन्तला बगान प्रवेश र स्वाद", "रिभरसाइड क्याम्पिङ र बीबीक्यु", "यातायात समन्वय"], ensure_ascii=False),
            True,
            "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&q=80",
            "पारिवारिक र सप्ताहन्त भ्रमणका लागि सुन्तला बगान, रक गार्डेन र नदी किनारमा क्याम्प फायर।",
            True
        )
    ]

    q = """
        INSERT INTO tourism_packages (
            id, title, "titleEn", "durationDays", "costPerPerson", difficulty,
            destinations, inclusions, "guideAvailable", "imageUrl", description, "isActive", "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            "titleEn" = EXCLUDED."titleEn",
            "durationDays" = EXCLUDED."durationDays",
            "costPerPerson" = EXCLUDED."costPerPerson",
            difficulty = EXCLUDED.difficulty,
            destinations = EXCLUDED.destinations,
            inclusions = EXCLUDED.inclusions,
            "guideAvailable" = EXCLUDED."guideAvailable",
            "imageUrl" = EXCLUDED."imageUrl",
            description = EXCLUDED.description,
            "isActive" = EXCLUDED."isActive";
    """
    for p in packages:
        cur.execute(q, p)
    print(f"  Inserted/Updated {len(packages)} tour packages.")


def seed_tourism_local_products(cur):
    """Seed 10 local souvenirs and agro-products."""
    print("--- 4. Seeding tourism_local_products (10 products) ---")
    products = [
        (
            "prod-01", "पाँचपोखरी चौंरीको अग्र्यानिक छुर्पी तथा याक चिज", "Organic Chhurpi & Yak Cheese",
            "दुग्ध उत्पादन", "रु १,२५० / केजी", "थाङपालकोट याक कृषक समूह", 6, "९८४१५५६६७७", True,
            "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80",
            "उच्च हिमाली भेगका चौंरीको शुद्ध दुधबाट परम्परागत विधिले उत्पादित छुर्पी र चीज।"
        ),
        (
            "prod-02", "ह्योल्मो हातले बुनेको शुद्ध ऊनी राडी/पाखी", "Hyolmo Handwoven Woolen Blanket",
            "हस्तकला तथा कपडा", "रु ४,८००", "तार्केघ्याङ महिला हस्तकला उद्यम", 3, "९८५१२३४९८७", True,
            "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&q=80",
            "भेडाको शुद्ध ऊनबाट स्थानीय महिलाहरूले कातेर बुनेको न्यानो राडी पाखी।"
        ),
        (
            "prod-03", "पाँचपोखरी अर्गानिक किवी फल तथा जाम", "Organic Kiwi Fruit & Jam",
            "फलफूल तथा कृषि", "रु २५० / केजी", "मानेखर्क किवी उत्पादक सहकारी", 4, "९८४९०८७६५४", True,
            "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80",
            "रसायनमुक्त प्राकृतिक वातावरणमा फलेको ताजा किवी र स्थानीय जाम।"
        ),
        (
            "prod-04", "उच्च हिमाली भीरमह तथा लेकाली मह", "High-Altitude Cliff Honey",
            "जडीबुटी तथा कृषि", "रु २,२०० / बोतल", "भोताङ प्राकृतिक मह संकलन समूह", 7, "९८५१२३९९००", True,
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80",
            "पाँचपोखरी भीरपहराबाट संकलित शुद्ध औषधियुक्त हिमाली भीरमह।"
        ),
        (
            "prod-05", "पाँचपोखरी ठूलो अलैंची (जम्बो ग्रेड)", "Panchpokhari Jumbo Cardamom",
            "नगदे बाली", "रु १,३०० / केजी", "गुन्सा अलैंची कृषक सञ्जाल", 5, "९८५११४४५५६", True,
            "https://images.unsplash.com/photo-1599909624555-9b2f29352b9a?w=500&q=80",
            "सुगन्धित तेलयुक्त उच्च गुणस्तरको ठूलो अलैंची।"
        ),
        (
            "prod-06", "हस्तनिर्मित परम्परागत बौद्ध थाङ्का चित्र", "Handmade Buddhist Thangka Painting",
            "हस्तकला तथा कला", "रु १२,००० - ३५,०००", "ह्योल्मो आर्ट स्टुडियो, तार्केघ्याङ", 3, "९८४१२२८८११", True,
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&q=80",
            "प्राकृतिक रङ र सुनको जलप प्रयोग गरी बनाइएका मण्डल तथा बुद्ध जीवनी चित्र।"
        ),
        (
            "prod-07", "लेकाली सिस्नुको अग्र्यानिक धुलो (Nettle Powder)", "Organic Stinging Nettle Powder",
            "जडीबुटी तथा पोषण", "रु २२० / प्याकेट", "थाङपाल महिला बहुउद्देश्यीय सहकारी", 4, "९८६००११२२३", True,
            "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80",
            "आइरन र भिटामिनले भरिपूर्ण, हिमाली लेकबाट संकलित सिस्नुको धुलो।"
        ),
        (
            "prod-08", "बाँसखर्के सुन्तलाको अर्गानिक स्क्वास/जुस", "Banskharka Fresh Orange Juice",
            "कृषि तथा पेय", "रु ३५० / बोतल", "बाँसखर्क फलफूल प्रशोधन केन्द्र", 1, "९८५११००२२३", True,
            "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80",
            "बाँसखर्कको प्रसिद्ध सुन्तलाबाट निर्मित शुद्ध फलफूल जुस।"
        ),
        (
            "prod-09", "परम्परागत शेर्पा काठको कचौरा (फोर्बु/फुरु)", "Traditional Sherpa Wooden Bowl",
            "काष्ठकला", "रु १,८००", "थाङपालकोट काष्ठकला उद्योग", 6, "९८४१५५९९२२", True,
            "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&q=80",
            "विशेष लेकाली काठबाट परम्परागत विधिले बनाइएको चिया र मदिरा पिउने कचौरा।"
        ),
        (
            "prod-10", "पाँचपोखरी जडीबुटी चिया (Herbal Green Tea)", "Panchpokhari Alpine Herbal Tea",
            "जडीबुटी तथा चिया", "रु २८० / बक्स", "पाँचपोखरी हर्बल उद्यम", 8, "९८५१२३४४०१", True,
            "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80",
            "चिराइतो, तुलसी, पिपला र हिमाली जडीबुटी सम्मिश्रित स्वास्थ्यवर्धक चिया।"
        )
    ]

    q = """
        INSERT INTO tourism_local_products (
            id, name, "nameEn", category, price, "vendorName", "wardNo",
            "contactNumber", "inStock", "imageUrl", description, "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            "nameEn" = EXCLUDED."nameEn",
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            "vendorName" = EXCLUDED."vendorName",
            "wardNo" = EXCLUDED."wardNo",
            "contactNumber" = EXCLUDED."contactNumber",
            "inStock" = EXCLUDED."inStock",
            "imageUrl" = EXCLUDED."imageUrl",
            description = EXCLUDED.description;
    """
    for p in products:
        cur.execute(q, p)
    print(f"  Inserted/Updated {len(products)} local products.")


def seed_tourism_reservations(cur):
    """Seed 8 reservations for hotels, homestays, and tour packages."""
    print("--- 5. Seeding tourism_reservations (8 bookings) ---")
    reservations = [
        ("res-01", "सुमन अधिकारी", "९८४१२२३३४४", "suman.adhikari@gmail.com", "hotel", "ht-01", "2026-10-08", 4, "६,०००", "confirmed", "भेज खाना र तातो पानीको व्यवस्था"),
        ("res-02", "Mark Anderson", "+1-415-889-1122", "mark.anderson@outdoor.com", "package", "pkg-1", "2026-10-12", 2, "४५,०००", "confirmed", "English speaking guide & porter needed"),
        ("res-03", "प्रदीप खड्का", "९८५१०१२३४५", "pradeep.khadka@outlook.com", "hotel", "ht-02", "2026-10-15", 3, "९,०००", "confirmed", "अट्याच बाथरुम भएको कोठा"),
        ("res-04", "Sophie Martin", "+33-6-1234-5678", "sophie.martin@voyage.fr", "package", "pkg-2", "2026-10-20", 2, "२२,०००", "confirmed", "Vegetarian local Hyolmo organic meal"),
        ("res-05", "दिनेश पौडेल र साथीहरू", "९८४१६६७७८८", "dinesh.poudel@gmail.com", "hotel", "ht-05", "2026-10-22", 6, "८,४००", "confirmed", "पाँचपोखरी जाने बिहानी खाजा तयारी"),
        ("res-06", "अन्जु श्रेष्ठ", "९८६००९८७६५", "anju.shrestha@yahoo.com", "hotel", "ht-08", "2026-11-05", 5, "१२,५००", "pending", "सुन्तला बगान भ्रमण र क्याम्प फायर"),
        ("res-07", "David Miller", "+44-7700-900123", "david.miller@uktrek.org", "package", "pkg-4", "2026-11-10", 4, "१,५२,०००", "confirmed", "Trans-Himalayan trek to Gosaikunda with climbing guide"),
        ("res-08", "रामचन्द्र सापकोटा", "९८४१११४४५५", "ramchandra@gmail.com", "hotel", "ht-04", "2026-10-06", 2, "२,०००", "completed", "पारिवारिक बसाइ")
    ]

    q = """
        INSERT INTO tourism_reservations (
            id, "guestName", phone, email, "bookingType", "referenceId",
            "checkInDate", pax, "totalAmount", status, "specialRequests", "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "guestName" = EXCLUDED."guestName",
            status = EXCLUDED.status,
            "totalAmount" = EXCLUDED."totalAmount";
    """
    for r in reservations:
        cur.execute(q, r)
    print(f"  Inserted/Updated {len(reservations)} reservations.")


def seed_tourism_tourist_logs(cur):
    """Seed 12 tourist logs for tracking visitors, permits, and revenue."""
    print("--- 6. Seeding tourism_tourist_logs (12 tourist records) ---")
    logs = [
        ("log-01", "मार्क एन्डरसन (Mark Anderson)", "United States", "male", "adult", "Trekking & Photography", "2026-09-22", "2026-09-28", "पाँचपोखरी कुण्ड तथा आमायाङ्ग्री", "P5-TRK-२०८१-०१४२", "तेन्जिङ शेर्पा", "NATHM-1405-2021", "९८५१२३९९००", "US Embassy: ०१-४२३४०००", "ALLIANZ-GLOBAL-99881", 2000.0, "paid"),
        ("log-02", "रोशन श्रेष्ठ र ६ जना टोली", "Nepal", "mixed", "youth", "तीर्थयात्रा तथा पदयात्रा", "2026-09-24", "2026-09-27", "पाँचपोखरी कुण्ड", "P5-TRK-२०८१-०१४५", "दावा तामाङ", "LOCAL-P5-042", "९८४१२२८८००", "हरिहर श्रेष्ठ: ९८४१००११२२", "NEPAL-INS-77665", 700.0, "paid"),
        ("log-03", "सोफी मार्टिन (Sophie Martin)", "France", "female", "adult", "Cultural Study & Trekking", "2026-09-26", "2026-10-02", "तार्केघ्याङ तथा आमायाङ्ग्री", "P5-TRK-२०८१-०१४६", "पासाङ शेर्पा", "NATHM-1120-2019", "९८५११२२३३४", "French Embassy: ०१-४४१२३३२", "AXA-TRAVEL-FR-4412", 2000.0, "paid"),
        ("log-04", "ताकासी यामामोतो (Takashi Yamamoto)", "Japan", "male", "senior", "Bird Watching & Flora", "2026-09-28", "2026-10-04", "छोचो डाँडा र लालीगुराँस वन", "P5-TRK-२०८१-०१४७", "पेम्बा शेर्पा", "NATHM-0980-2018", "९८४१५५६६७७", "Japan Embassy: ०१-४४२६६८०", "SOMPO-JAPAN-55412", 2000.0, "paid"),
        ("log-05", "सुष्मा अधिकारी र परिवार (४ जना)", "Nepal", "mixed", "family", "पारिवारिक सुन्तला बगान भ्रमण", "2026-09-29", "2026-10-01", "बाँसखर्क रक गार्डेन", "P5-TRK-२०८१-०१४८", "स्थानीय गाइड", "LOCAL-P5-010", "९८५११००२२३", "नवराज अधिकारी: ९८४१००२२३३", "SHIKHAR-INS-1209", 400.0, "paid"),
        ("log-06", "ह्यान्स मुलर (Hans Mueller)", "Germany", "male", "adult", "Alpine Trekking & Peaks", "2026-10-01", "2026-10-08", "पाँचपोखरी - गोसाइँकुण्ड ट्रान्स", "P5-TRK-२०८१-०१४९", "दावा लामा", "NATHM-1560-2022", "९८५१२३४४०१", "German Embassy: ०१-४२१७२००", "ALLIANZ-DE-88741", 2000.0, "paid"),
        ("log-07", "एलेना पेट्रोभा (Elena Petrova)", "Russia", "female", "youth", "Canyoning & Rock Climbing", "2026-10-01", "2026-10-04", "छिमिटि झरना", "P5-TRK-२०८१-०१५०", "दिपेश तामाङ", "LOCAL-P5-028", "९८४१२२८८११", "Russian Embassy: ०१-४४१२१५५", "VTB-INS-44102", 2000.0, "paid"),
        ("log-08", "विशाल केसी र ८ जना युवा टोली", "Nepal", "mixed", "youth", "पाँचपोखरी क्याम्पिङ", "2026-10-02", "2026-10-06", "पाँचपोखरी कुण्ड", "P5-TRK-२०८१-०१५१", "छिरिङ तामाङ", "LOCAL-P5-035", "९८५१२३९९००", "सुरेश केसी: ९८४१३३४४५५", "NLG-INS-88124", 800.0, "paid"),
        ("log-09", "मारिया गार्सिया (Maria Garcia)", "Spain", "female", "adult", "Yoga & Meditation Retreat", "2026-10-02", "2026-10-07", "तार्केघ्याङ र गुन्सा नोर्बुलाङ", "P5-TRK-२०८१-०१५२", "तेन्जिङ नोर्बु", "LOCAL-P5-009", "९८४१५५९९२२", "Spain Consular: ०१-४४२२३३१", "MAPFRE-ES-99214", 2000.0, "paid"),
        ("log-10", "किरण लामिछाने र टोली (३ जना)", "Nepal", "male", "adult", "छायांकन तथा भ्लगिङ", "2026-10-02", "2026-10-05", "आमायाङ्ग्री चुचुरो", "P5-TRK-२०८१-०१५३", "पेम्बा ह्योल्मो", "LOCAL-P5-015", "९८४१२२८८११", "अमृत लामिछाने: ९८४१५५११२२", "PRABHU-INS-55612", 300.0, "paid"),
        ("log-11", "जोन स्मीथ (John Smith)", "Australia", "male", "adult", "Trekking", "2026-09-15", "2026-09-21", "पाँचपोखरी", "P5-TRK-२०८१-०१३५", "दावा शेर्पा", "NATHM-1205-2020", "९८४१२३४५६७", "Aus Embassy: ०१-४३७१६७८", "MEDIBANK-AU-7788", 2000.0, "paid"),
        ("log-12", "सरिता गुरुङ", "Nepal", "female", "youth", "तीर्थयात्रा", "2026-09-18", "2026-09-21", "पाँचपोखरी ताल", "P5-TRK-२०८१-०१३८", "स्थानीय गाइड", "LOCAL-P5-004", "९८६००११२२३", "गंगाराम गुरुङ: ९८४१२२३३९९", "SAGARMATHA-INS", 100.0, "paid")
    ]

    q = """
        INSERT INTO tourism_tourist_logs (
            id, "touristName", country, gender, "ageGroup", purpose,
            "entryDate", "exitDate", destination, "permitNumber",
            "guideName", "guideLicenseNo", "guidePhone", "emergencyContact",
            "insurancePolicyNo", "entryFeeNpr", "entryFeeStatus", "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "touristName" = EXCLUDED."touristName",
            destination = EXCLUDED.destination,
            "entryFeeStatus" = EXCLUDED."entryFeeStatus";
    """
    for l in logs:
        cur.execute(q, l)
    print(f"  Inserted/Updated {len(logs)} tourist logs.")


def seed_heritage_sites(cur):
    """Seed comprehensive cultural, religious, and natural heritage sites across wards."""
    print("--- 7. Seeding heritage_sites (12 major heritage sites) ---")
    sites = [
        # (id, siteId, nameEn, nameNp, type, ward, desc, intro, importance, photos, videoUrl, lat, lng)
        (
            "21000000-0000-0000-0000-000000000001",
            "HER-W03-001",
            "Panchpokhari Sacred Lakes",
            "पाँचपोखरी पावन पाँच कुण्डहरू",
            "धार्मिक/प्राकृतिक",
            3,
            "विश्वको ९ औं अग्लो स्थानमा अवस्थित पाँच पवित्र तालहरू (सूर्य, भैरव, नाग, सरस्वती र गणेश कुण्ड)।",
            "समुद्र सतहबाट ४,१०० मिटर उचाइमा रहेको यो स्थल हिन्दु र बौद्ध दुवै धर्मावलम्बीको साझा पवित्र तीर्थस्थल हो।",
            "जनैपूर्णिमाको अवसरमा हजारौं भक्तजन र धामीझाँक्रीहरूको ऐतिहासिक परम्परागत भेला र मेला लाग्ने गर्दछ।",
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800,https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
            "https://www.youtube.com/watch?v=panchpokhari_doc",
            28.0416, 85.7067
        ),
        (
            "21000000-0000-0000-0000-000000000002",
            "HER-W02-001",
            "Ama Yangri Chhorten & Peak",
            "आमायाङ्ग्री चुचुरो तथा छोर्तेन",
            "धार्मिक/सांस्कृतिक",
            2,
            "ह्योल्मो समुदायकी रक्षक देवी आमायाङ्ग्रीको पवित्र छोर्तेन र ३,७७१ मिटर अग्लो शिखर।",
            "ह्योल्मो संस्कृतिमा आमायाङ्ग्रीलाई सम्पूर्ण उपत्यकाको सुख, शान्ति र समृद्धिकी मातृ-देवीको रूपमा पुजिन्छ।",
            "यहाँबाट लाङटाङ, जुगल, गणेश र दोर्जे लाक्पा हिमालको ३६० डिग्री मनमोहक दृश्य देखिन्छ।",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
            "https://www.youtube.com/watch?v=amayangri_peak",
            28.0050, 85.5780
        ),
        (
            "21000000-0000-0000-0000-000000000003",
            "HER-W03-002",
            "Tarkeghyang Ancient Monastery",
            "तार्केघ्याङ प्राचीन छ्योइलिङ गुम्बा",
            "धार्मिक/ऐतिहासिक",
            3,
            "करिब ३०० वर्ष भन्दा पुरानो ह्योल्मो बौद्ध परम्पराको केन्द्रीय ऐतिहासिक गुम्बा।",
            "यो गुम्बा ह्योल्मो क्षेत्रको सबैभन्दा ठूलो र धार्मिक दृष्टिले सबैभन्दा महत्वपूर्ण सांस्कृतिक धरोहर हो।",
            "प्राचीन बुद्ध मूर्तिहरू, तिब्बती ग्रन्थहरू र परम्परागत लामा नाच (छाम) सञ्चालन हुने मुख्य थलो।",
            "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
            "",
            27.9789, 85.6123
        ),
        (
            "21000000-0000-0000-0000-000000000004",
            "HER-W03-003",
            "Padmasambhava Meditation Cave",
            "गुरु पद्मसम्भव ध्यान गुफा (ड्रागन केभ)",
            "धार्मिक/पुरातात्विक",
            3,
            "आठौं शताब्दीमा बौद्ध धर्मगुरु पद्मसम्भवले ह्योल्मो भूमिमा ध्यान गर्दाको पवित्र गुफा।",
            "गुफाभित्र प्राकृतिक चट्टानमा बज्र, शंख र विभिन्न धार्मिक चिन्हका आकृतिहरू प्रस्तरमा कुँदिएका भेटिन्छन्।",
            "अन्तर्राष्ट्रिय बौद्ध तीर्थयात्रीहरूका लागि विश्वकै एक प्रमुख ध्यान तथा साधना स्थल।",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
            "",
            27.9920, 85.6050
        ),
        (
            "21000000-0000-0000-0000-000000000005",
            "HER-W06-001",
            "Thangpalkot Historical Fort & Haveli",
            "ऐतिहासिक थाङपालकोट गढी तथा पुरानो दरबार",
            "ऐतिहासिक/पुरातात्विक",
            6,
            "मल्लकालीन र बाइसे-चौबिसे कालको सामरिक सुरक्षा गढी र ऐतिहासिक रैथाने हवेली।",
            "पहाडी थुम्कोमा अवस्थित ढुङ्गे किल्ला जहाँ तत्कालीन समयमा तोप र हातहतियार राख्ने गरिन्थ्यो।",
            "नेपाल एकीकरणको इतिहाससँग जोडिएको सिन्धुपाल्चोकको एक महत्वपूर्ण ऐतिहासिक स्थल।",
            "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800",
            "",
            27.9450, 85.6200
        ),
        (
            "21000000-0000-0000-0000-000000000006",
            "HER-W05-001",
            "Chandeshwori Temple Gunsa",
            "चण्डेश्वरी भगवती मन्दिर (गुन्सा)",
            "धार्मिक",
            5,
            "परापूर्व कालदेखि स्थानीय भक्तजनहरूको आस्थाको केन्द्र रहेको प्रसिद्ध शक्तिपीठ।",
            "हरेक वर्ष चण्डी पूर्णिमा र बडादशैंमा भव्य मेला र पूजाआजा हुने गर्दछ।",
            "प्राचीन देवीको प्रस्तर मूर्ति र स्थानीय नेवार तथा तामाङ समुदायको संयुक्त धार्मिक सहिष्णुताको प्रतीक।",
            "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
            "",
            27.9550, 85.6300
        ),
        (
            "21000000-0000-0000-0000-000000000007",
            "HER-W01-001",
            "Thangpal Bhanjyang & Rock Garden",
            "थाङपाल भञ्ज्याङ तथा रक गार्डेन",
            "प्राकृतिक/पर्यटकीय",
            1,
            "प्राकृतिक ढुङ्गे चट्टानी संरचना र काठमाडौँ उपत्यकाबाट प्रवेश गर्ने ऐतिहासिक नाका।",
            "यहाँबाट मेलम्ची उपत्यका, इन्द्रावती नदी र हरियाली महाभारत डाँडाको दृश्य देखिन्छ।",
            "स्थानीय वनस्पति र रक गार्डेन पर्यटन प्रवर्द्धनको मुख्य गन्तव्य।",
            "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800",
            "",
            27.9100, 85.5500
        ),
        (
            "21000000-0000-0000-0000-000000000008",
            "HER-W04-001",
            "Chhimiti Sacred Waterfall",
            "छिमिटि पवित्र झरना तथा नागथान",
            "धार्मिक/प्राकृतिक",
            4,
            "१०० मिटर भन्दा अग्लो प्राकृतिक झरना जसको फेदीमा नाग देवताको पवित्र थान रहेको छ।",
            "नागपञ्चमीको दिन स्थानीय किसानहरूले बालीनाली रक्षा र वर्षाको कामना गर्दै विशेष पूजा गर्दछन्।",
            "प्राकृतिक सौन्दर्य र साहसिक क्यानोनिङ खेलको उत्कृष्ट संगम।",
            "https://images.unsplash.com/photo-1511497584788-87676104235f?w=800",
            "",
            27.9610, 85.5980
        ),
        (
            "21000000-0000-0000-0000-000000000009",
            "HER-W07-001",
            "Bhotang Paldor Gompa",
            "भोताङ पाल्दोर बौद्ध गुम्बा",
            "धार्मिक/सांस्कृतिक",
            7,
            "उच्च हिमाली शेर्पा बस्ती भोताङको केन्द्रमा अवस्थित २०० वर्ष पुरानो ङिङ्मा परम्पराको गुम्बा।",
            "ल्होसार तथा बौद्ध उत्सवहरूमा लामा नृत्य (छाम) र धार्मिक प्रवचन हुने गर्दछ।",
            "पाँचपोखरी जाने तीर्थयात्रीहरूले यात्राको सफलताको कामना गर्दै पूजा गर्ने परम्परा छ।",
            "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
            "",
            27.9850, 85.6550
        ),
        (
            "21000000-0000-0000-0000-000000000010",
            "HER-W08-001",
            "Lagarche Shivalaya & Alpine Shrine",
            "लागार्चे शिवालय तथा पाँचपोखरी बेस क्याम्प थान",
            "धार्मिक",
            8,
            "उच्च खर्क लागार्छेमा अवस्थित शिव मन्दिर र याक गोठालाहरूको पवित्र कुलदेवता थान।",
            "पाँचपोखरीको हिमाली क्षेत्रमा गाईवस्तु र भेडाच्याङ्ग्राको सुरक्षाका लागि पुजिने प्राचीन थान।",
            "स्थानीय गोठाला संस्कृति र लेकाली परम्पराको जगेर्ना गर्ने मुख्य केन्द्र।",
            "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800",
            "",
            28.0200, 85.6900
        ),
        (
            "21000000-0000-0000-0000-000000000011",
            "HER-W05-002",
            "Norbuling Dhyan Gompa",
            "नोर्बुलाङ ध्यान गुम्बा",
            "धार्मिक/सांस्कृतिक",
            5,
            "गुन्साको घना सल्ला र लालीगुराँस वनको एकान्तमा अवस्थित ध्यान तथा साधना गुम्बा।",
            "प्राचीन समयदेखि लामा गुरुहरूले ३ वर्ष ३ महिना ३ दिनको कठोर एकान्त ध्यान (ल्हकथाङ) गर्ने पवित्र थलो।",
            "शान्ति र आध्यात्मिक पर्यटनको एक अनुपम गन्तव्य।",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "",
            27.9650, 85.6350
        ),
        (
            "21000000-0000-0000-0000-000000000012",
            "HER-W02-002",
            "Baruwa Mane & Chhortens",
            "बरुवा माने तथा ऐतिहासिक छोर्तेन समूह",
            "सांस्कृतिक/धार्मिक",
            2,
            "बरुवा गाउँको प्रवेशद्वारमा अवस्थित सयौं वर्ष पुराना मन्त्र कुँदिएका प्रस्तर माने र छोर्तेनहरू।",
            "ह्योल्मो र तामाङ समुदायका पूर्वजहरूले गाउँको सुरक्षा र विश्व शान्तिको लागि स्थापना गरेका मानेहरू।",
            "तिब्बती लिपिमा 'ॐ मणि पद्मे हुँ' कुँदिएका हजारौं कलात्मक शिलापत्रहरूको खुला संग्रहालय।",
            "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800",
            "",
            27.9700, 85.5800
        )
    ]

    q = """
        INSERT INTO heritage_sites (
            id, tenant_id, "siteId", "nameEn", "nameNp", type, "wardNumber",
            description, introduction, importance, photos, "videoUrl", latitude, longitude,
            status, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Active', NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "nameEn" = EXCLUDED."nameEn",
            "nameNp" = EXCLUDED."nameNp",
            type = EXCLUDED.type,
            "wardNumber" = EXCLUDED."wardNumber",
            description = EXCLUDED.description,
            introduction = EXCLUDED.introduction,
            importance = EXCLUDED.importance,
            photos = EXCLUDED.photos,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            "updatedAt" = NOW();
    """
    for s in sites:
        cur.execute(q, (
            s[0], TENANT_ID, s[1], s[2], s[3], s[4], s[5],
            s[6], s[7], s[8], s[9], s[10], s[11], s[12]
        ))
    print(f"  Inserted/Updated {len(sites)} heritage sites.")


def seed_museum_assets(cur):
    """Seed 12 cultural and historical artifacts in Hyolmo Cultural Museum."""
    print("--- 8. Seeding museum_assets (12 cultural museum artifacts) ---")
    assets = [
        (
            "22000000-0000-0000-0000-000000000001", "MUS-001",
            "Guru Padmasambhava Ashtadhatu Idol", "गुरु पद्मसम्भव अष्टधातु मूर्ति",
            "ऐतिहासिक कलाकृति", "धार्मिक मूर्ति",
            "आठौं शताब्दीमा ह्योल्मो भूमिमा धर्म प्रचार गर्दा निर्माण गरिएको मानिने प्राचीन अष्टधातुको ध्यानस्थ मूर्ति।",
            "गुम्बामा विशेष पूजा तथा अभिषेक अनुष्ठानमा दर्शन गराइने।",
            "तार्केघ्याङ प्राचीन गुम्बा भण्डार", "८औं शताब्दी (१२०० वर्ष पुरानो)", "अष्टधातु (Eight Sacred Metals)",
            "उत्कृष्ट", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1548013146-72479768bada?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000002", "MUS-002",
            "Gold-Inscribed Prajnaparamita Scripture", "सुनौलो अक्षरले लेखिएको प्रज्ञापारमिता ग्रन्थ",
            "धार्मिक ग्रन्थ तथा पाण्डुलिपि", "बौद्ध धर्मग्रन्थ",
            "परम्परागत हिमाली लोक्ता कागजमा शुद्ध सुनको मसीले रञ्जना र तिब्बती लिपिमा हातले लेखिएको दुर्लभ ग्रन्थ।",
            "बौद्ध दर्शन अध्ययन र वार्षिक पूजामा पाठ गरिने।",
            "तार्केघ्याङ गुम्बा", "१६औं शताब्दी (करिब ४५० वर्ष पुरानो)", "लोक्ता कागज, सुनको मसी, काठको गाता",
            "सामान्य राम्रो", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1532012164546-f432f2e3777d?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000003", "MUS-003",
            "Traditional Gyaling Wind Instrument", "परम्परागत ह्योल्मो ग्यालिङ (बाजा)",
            "संगीत तथा वाद्यवादन", "धार्मिक बाजा",
            "बौद्ध धार्मिक अनुष्ठान र लामा नृत्यमा बजाइने पित्तल र चाँदीको बुट्टा कुँदिएको परम्परागत सहनाई-बाजा।",
            "दैनिक गुम्बा पूजा तथा धार्मिक उत्सवमा ध्वनि अर्पण।",
            "ह्योल्मो समुदाय, वडा ३", "१९औं शताब्दी", "काठ, पित्तल र चाँदीको जलप",
            "उत्कृष्ट", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000004", "MUS-004",
            "Traditional Dungchen Alpine Horn", "लामो धार्मिक काँसको बाजा (डुङ्छेन)",
            "संगीत तथा वाद्यवादन", "धार्मिक बाजा",
            "३ मिटर लामो तामा र पित्तलले बनेको टेलिस्कोपिक बाजा, जसको गम्भीर ध्वनिले हिमाली उपत्यकामा गुञ्जन गर्दछ।",
            "विशेष पूजा, लामा स्वागत र चाडपर्वमा बजाइने।",
            "भोताङ गुम्बा", "१९औं शताब्दी", "तामा र पित्तल",
            "सामान्य राम्रो", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000005", "MUS-005",
            "Ancient Carved Wooden Temple Pillar", "प्राचीन काष्ठकला मन्दिर-स्तम्भ (टुँडाल)",
            "ऐतिहासिक कलाकृति", "वास्तुकला",
            "ऐतिहासिक थाङपालकोट दरबार र गुम्बामा प्रयोग भएको सिंह र मयूरको आकृति कुँदिएको कलात्मक काठको खम्बा।",
            "भवनको भार थाम्ने र शोभा बढाउने वास्तुकला अंश।",
            "थाङपालकोट गढी (वडा ६)", "१८औं शताब्दी", "साल र चापको काठ",
            "मर्मत आवश्यक", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000006", "MUS-006",
            "Traditional Hyolmo Women Attire (Syama)", "परम्परागत ह्योल्मो महिला पोशाक (स्यामा र बख्खु)",
            "परम्परागत पोशाक तथा गहना", "सांस्कृतिक भेषभूषा",
            "भेडाको ऊन र प्राकृतिक रङबाट हातले बुनेको परम्परागत रंगीन पाटा भएको ह्योल्मो महिलाहरूको औपचारिक पोशाक।",
            "विवाह, ल्होसार र चाडपर्वमा लगाइने मौलिक भेषभूषा।",
            "बरुवा तथा तार्केघ्याङ", "२०औं शताब्दी प्रारम्भ", "शुद्ध भेडाको ऊन, कपास र प्राकृतिक वनस्पति रङ",
            "उत्कृष्ट", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000007", "MUS-007",
            "Antique Yak Milk Churner (Dango)", "प्राचीन काठको घ्यु-मन्थन ठेकी (डाङ्गो)",
            "दैनिक घरेलु औजार", "डेरी औजार",
            "लेकाली चौंरीको दुधबाट घ्यु र मोही बनाउन प्रयोग गरिने काठ र बाँसको चोयाले कसिलो गरी बाँधिएको परम्परागत भाँडो।",
            "हिमाली गोठमा दैनिक दुग्ध प्रशोधन कार्यमा प्रयोग।",
            "लागार्छे खर्क, वडा ८", "१९औं शताब्दी अन्त्य", "ओखरको काठ, बाँसको चोया",
            "उत्कृष्ट", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000008", "MUS-008",
            "Shaman Drum & Scepter (Dhyangro)", "ऐतिहासिक झाँक्री ढ्याङ्ग्रो र गजो (डाङग्री)",
            "सांस्कृतिक तथा परम्परागत उपचार", "धामीझाँक्री सामग्री",
            "पाँचपोखरी मेलामा झाँक्रीहरूले बजाउने बोकाको छालाले मोडेको र काठको बुट्टा भएको पवित्र ढ्याङ्ग्रो।",
            "रोगब्याधी निको पार्न र कुलदेवता खुसी पार्ने अनुष्ठान।",
            "भोताङ तामाङ समुदाय", "२०औं शताब्दी", "काठ, छाला, फलामको घण्टी",
            "सामान्य राम्रो", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000009", "MUS-009",
            "Traditional Watermill Grindstone", "परम्परागत पानीघट्टको प्राचीन जाँतो",
            "दैनिक घरेलु औजार", "कृषि प्रशोधन",
            "खोलाको पानीको बहावबाट मकै, कोदो र गहुँ पिस्न प्रयोग गरिने परम्परागत ग्रेनाइट ढुङ्गाको जाँतो।",
            "गाउँमा खाद्यान्न पिठो बनाउने परम्परागत प्रविधि।",
            "थाङपालधाप खोला किनार, वडा ४", "१९औं शताब्दी", "कडा ग्रेनाइट ढुङ्गा",
            "सामान्य राम्रो", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000010", "MUS-010",
            "Silver Amulet Box Gau Necklace", "ह्योल्मो चाँदीको कण्ठहार तथा गाउ (Amulet Box)",
            "परम्परागत पोशाक तथा गहना", "परम्परागत गहना",
            "महिलाहरूले गलामा लगाउने कलात्मक चाँदीको बट्टा (गाउ) जसमा पवित्र मन्त्र र लामाको प्रसाद राखिन्छ।",
            "नकारात्मक उर्जाबाट रक्षा गर्न र धार्मिक पहिचानका लागि लगाइने।",
            "तार्केघ्याङ ह्योल्मो परिवार", "१९औं शताब्दी", "चाँदी, फिरोजा (टर्क्वाइज), मुगा",
            "उत्कृष्ट", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000011", "MUS-011",
            "Natural Pigment Mandala Thangka", "प्राकृतिक वनस्पति रङको मण्डल थाङ्का",
            "धार्मिक ग्रन्थ तथा चित्र", "थाङ्का चित्रकला",
            "सुती कपडामा वनस्पति र खनिज रङ प्रयोग गरी बनाइएको कालचक्र मण्डल थाङ्का।",
            "ध्यान केन्द्रित गर्न र मण्डप सजावटमा प्रयोग।",
            "ह्योल्मो गुम्बा, वडा ३", "१९औं शताब्दी अन्त्य", "सुती कपडा, खनिज रङ",
            "सामान्य राम्रो", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500", "Published"
        ),
        (
            "22000000-0000-0000-0000-000000000012", "MUS-012",
            "Antique Yak Horn Battle Bugle", "चौंरीको सिङबाट निर्मित प्राचीन सिङ-बाजा",
            "संगीत तथा वाद्यवादन", "सामरिक तथा उत्सव बाजा",
            "उच्च हिमाली खर्कहरूमा खतराको संकेत दिन र चाडपर्वमा बजाउन प्रयोग गरिने याकको सिङको बाजा।",
            "गोठालाहरूले जङ्गली जनावर भगाउन र सन्देश प्रवाह गर्न फुक्ने बाजा।",
            "लागार्छे याक खर्क, वडा ८", "१८औं शताब्दी", "चौंरीको सिङ, पित्तलको मुख",
            "उत्कृष्ट", "ह्योल्मो सांस्कृतिक संग्रहालय, तार्केघ्याङ",
            27.9789, 85.6123, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500", "Published"
        )
    ]

    q = """
        INSERT INTO museum_assets (
            id, tenant_id, "assetId", "nameEn", "nameNp", category, "subCategory",
            history, usage, origin, "estimatedPeriod", material, condition,
            "museumLocation", latitude, longitude, "photoUrl", "verificationStatus",
            "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "nameEn" = EXCLUDED."nameEn",
            "nameNp" = EXCLUDED."nameNp",
            category = EXCLUDED.category,
            "subCategory" = EXCLUDED."subCategory",
            history = EXCLUDED.history,
            usage = EXCLUDED.usage,
            origin = EXCLUDED.origin,
            "estimatedPeriod" = EXCLUDED."estimatedPeriod",
            material = EXCLUDED.material,
            condition = EXCLUDED.condition,
            "museumLocation" = EXCLUDED."museumLocation",
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            "photoUrl" = EXCLUDED."photoUrl",
            "verificationStatus" = EXCLUDED."verificationStatus",
            "updatedAt" = NOW();
    """
    for a in assets:
        cur.execute(q, (
            a[0], TENANT_ID, a[1], a[2], a[3], a[4], a[5],
            a[6], a[7], a[8], a[9], a[10], a[11],
            a[12], a[13], a[14], a[15], a[16]
        ))
    print(f"  Inserted/Updated {len(assets)} museum assets.")


def seed_gis_tourism_heritage(cur):
    """Seed 10 GeoJSON GIS tourist & heritage points."""
    print("--- 9. Seeding gis_tourism_heritage (10 GIS map features) ---")
    points = [
        (
            "gis-th-01", "पाँचपोखरी पावन तालहरू", "धार्मिक ताल",
            "विश्वकै ९ औं अग्लो स्थानमा अवस्थित पाँच पवित्र तालहरू (सूर्य, भैरव, नाग, सरस्वती, गणेश)।",
            12500, 85.7067, 28.0416,
            json.dumps(["https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"])
        ),
        (
            "gis-th-02", "आमायाङ्ग्री चुचुरो तथा छोर्तेन", "चुचुरो तथा भ्यू-पोइन्ट",
            "ह्योल्मो समुदायकी रक्षक देवी आमायाङ्ग्रीको ३७७१ मिटर अग्लो शिखर।",
            8200, 85.5780, 28.0050,
            json.dumps(["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"])
        ),
        (
            "gis-th-03", "तार्केघ्याङ प्राचीन गुम्बा बस्ती", "सांस्कृतिक सम्पदा",
            "ह्योल्मो संस्कृतिको केन्द्र, ३०० वर्ष पुरानो बौद्ध गुम्बा।",
            6500, 85.6123, 27.9789,
            json.dumps(["https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"])
        ),
        (
            "gis-th-04", "गुरु पद्मसम्भव ध्यान गुफा", "धार्मिक गुफा",
            "८औं शताब्दीमा गुरु रिन्पोछेले ध्यान गरेको रहस्यमयी गुफा।",
            3400, 85.6050, 27.9920,
            json.dumps(["https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800"])
        ),
        (
            "gis-th-05", "छिमिटि झरना", "झरना तथा क्यानोनिङ",
            "१०० मिटर अग्लो प्राकृतिक झरना र क्यानोनिङ स्पट।",
            4800, 85.5980, 27.9610,
            json.dumps(["https://images.unsplash.com/photo-1511497584788-87676104235f?w=800"])
        ),
        (
            "gis-th-06", "थाङपालकोट गढी", "ऐतिहासिक गढी",
            "ऐतिहासिक सामरिक गढी र पुरानो दरबारी अवशेष।",
            2100, 85.6200, 27.9450,
            json.dumps(["https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800"])
        ),
        (
            "gis-th-07", "छोचो डाँडा", "लालीगुराँस भ्यू-पोइन्ट",
            "१६ प्रजातिका लालीगुराँस फुल्ने ३१५० मी. अग्लो डाँडा।",
            5200, 85.6700, 28.0120,
            json.dumps(["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"])
        ),
        (
            "gis-th-08", "भोताङ शेर्पा गाउँ", "कृषि तथा शेर्पा संस्कृति",
            "स्याउ बगैँचा, चौंरी पालन र पाँचपोखरी पदमार्ग प्रवेशद्वार।",
            7800, 85.6550, 27.9850,
            json.dumps(["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"])
        ),
        (
            "gis-th-09", "बाँसखर्क सुन्तला बगैँचा", "कृषि पर्यटन",
            "इन्द्रावती उपत्यकाको प्रसिद्ध सुन्तला बगान र रक गार्डेन।",
            9500, 85.5500, 27.9100,
            json.dumps(["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800"])
        ),
        (
            "gis-th-10", "नोर्बुलाङ ध्यान गुम्बा", "ध्यान केन्द्र",
            "गुन्साको पवित्र वनमा अवस्थित प्राचीन ध्यान गुम्बा।",
            2900, 85.6350, 27.9650,
            json.dumps(["https://images.unsplash.com/photo-1548013146-72479768bada?w=800"])
        )
    ]

    q = """
        INSERT INTO gis_tourism_heritage (
            id, tenant_id, name, category, historical_significance, visitor_count_annual,
            gis_geometry, photos, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            historical_significance = EXCLUDED.historical_significance,
            visitor_count_annual = EXCLUDED.visitor_count_annual,
            gis_geometry = EXCLUDED.gis_geometry,
            photos = EXCLUDED.photos,
            updated_at = NOW();
    """
    for p in points:
        geom = json.dumps({
            "type": "Point",
            "coordinates": [p[5], p[6]]
        })
        cur.execute(q, (
            p[0], TENANT_ID, p[1], p[2], p[3], p[4], geom, p[7]
        ))
    print(f"  Inserted/Updated {len(points)} GIS tourism & heritage points.")


def main():
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = False
    cur = conn.cursor()
    try:
        seed_tourism_destinations(cur)
        seed_tourism_hotels(cur)
        seed_tourism_packages(cur)
        seed_tourism_local_products(cur)
        seed_tourism_reservations(cur)
        seed_tourism_tourist_logs(cur)
        seed_heritage_sites(cur)
        seed_museum_assets(cur)
        seed_gis_tourism_heritage(cur)

        conn.commit()
        print("\nAll Tourism & Heritage data committed successfully!")
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
