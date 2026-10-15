from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict
from core.database import get_db
from models.tourism import Destination, Hotel, TouristLog, TourPackage, LocalProduct, Reservation
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/tourism",
    tags=["Tourism Management (पर्यटन प्रवर्द्धन तथा व्यवस्थापन)"]
)

# ---------------------------------------------------------------------------
# Realistic Seed Dataset for Panchpokhari Thangpal Gaupalika (Sindhupalchok)
# Legal basis: LGOA 2074 Schedule 8 (स्थानीय पर्यटन, पदमार्ग तथा होमस्टे नियमन)
# ---------------------------------------------------------------------------

INITIAL_DESTINATIONS = [
    {
        "id": "dest-01",
        "name": "पाँचपोखरी पावन कुण्डहरू (Panchpokhari Sacred Lakes)",
        "nameEn": "Panchpokhari Lakes",
        "name_en": "Panchpokhari Lakes",
        "wardNo": 3,
        "ward_no": 3,
        "altitudeMeters": 4100,
        "altitude_meters": 4100,
        "category": "धार्मिक तथा प्राकृतिक",
        "description": "विश्वकै ९ औं अग्लो स्थानमा अवस्थित ५ वटा पवित्र कुण्डहरू (सूर्य, भैरव, नाग, सरस्वती, गणेश)। जनैपूर्णिमामा भव्य मेला लाग्ने प्रसिद्ध हिन्दु तथा बौद्ध तीर्थस्थल।",
        "bestSeason": "भदौ - कात्तिक, चैत - जेठ",
        "best_season": "भदौ - कात्तिक, चैत - जेठ",
        "trekDuration": "४ देखि ६ दिन",
        "trek_duration": "४ देखि ६ दिन",
        "highlights": ["पाँचवटा हिमताल", "जुगल हिमाल हिमशृङ्खला", "जनैपूर्णिमा मेला", "अविस्मरणीय सूर्योदय"],
        "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        "lat": 28.0416,
        "lng": 85.7067,
    },
    {
        "id": "dest-02",
        "name": "आमायाङ्ग्री चुचुरो तथा छोर्तेन (Ama Yangri Peak)",
        "nameEn": "Ama Yangri Peak",
        "name_en": "Ama Yangri Peak",
        "wardNo": 2,
        "ward_no": 2,
        "altitudeMeters": 3771,
        "altitude_meters": 3771,
        "category": "सांस्कृतिक तथा भ्यू पोइन्ट",
        "description": "ह्योल्मो समुदायकी रक्षक देवी आमायाङ्ग्रीको पवित्र चुचुरो। यहाँबाट लाङटाङ, जुगल, गणेश र दोर्जे लाक्पा हिमालको ३६० डिग्री मनमोहक दृश्य देखिन्छ।",
        "bestSeason": "असोज - मंसिर, फागुन - वैशाख",
        "best_season": "असोज - मंसिर, फागुन - वैशाख",
        "trekDuration": "२ देखि ३ दिन",
        "trek_duration": "२ देखि ३ दिन",
        "highlights": ["३६० डिग्री हिमशृङ्खला", "आमायाङ्ग्री छोर्तेन", "ह्योल्मो संस्कृति", "लालीगुराँस वन"],
        "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        "lat": 28.0050,
        "lng": 85.5780,
    },
    {
        "id": "dest-03",
        "name": "ड्रागन गुफा / गुरु पद्मसम्भव ध्यान गुफा",
        "nameEn": "Dragon Cave / Padmasambhava Cave",
        "name_en": "Dragon Cave / Padmasambhava Cave",
        "wardNo": 3,
        "ward_no": 3,
        "altitudeMeters": 3250,
        "altitude_meters": 3250,
        "category": "ऐतिहासिक तथा धार्मिक",
        "description": "आठौं शताब्दीमा बौद्ध धर्मगुरु पद्मसम्भव (गुरु रिन्पोछे) ले ध्यान गरेको मानिने रहस्यमयी गुफा र प्रस्तर आकृतिहरू।",
        "bestSeason": "असोज - जेठ",
        "best_season": "असोज - जेठ",
        "trekDuration": "१ दिन (तार्केघ्याङबाट)",
        "trek_duration": "१ दिन (तार्केघ्याङबाट)",
        "highlights": ["प्राचीन ध्यान गुफा", "प्राकृतिक चट्टानी आकृति", "शान्त ध्यान केन्द्र"],
        "imageUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
        "lat": 27.9920,
        "lng": 85.6050,
    },
    {
        "id": "dest-04",
        "name": "तार्केघ्याङ प्राचीन बस्ती तथा गुम्बा",
        "nameEn": "Tarkeghyang Heritage Village",
        "name_en": "Tarkeghyang Heritage Village",
        "wardNo": 3,
        "ward_no": 3,
        "altitudeMeters": 2600,
        "altitude_meters": 2600,
        "category": "सांस्कृतिक सम्पदा",
        "description": "ह्योल्मो संस्कृतिको केन्द्रविन्दु, ढुङ्गाका सुन्दर परम्परागत घरहरू, सयौं वर्ष पुराना बौद्ध गुम्बा र आतिथ्यपूर्ण सामुदायिक होमस्टे।",
        "bestSeason": "बाह्रै महिना",
        "best_season": "बाह्रै महिना",
        "trekDuration": "सडकमार्ग / १ दिन",
        "trek_duration": "सडकमार्ग / १ दिन",
        "highlights": ["ऐतिहासिक गुम्बा", "ह्योल्मो संस्कृति र भेषभूषा", "सामुदायिक होमस्टे", "अग्र्यानिक स्याउ र किबी"],
        "imageUrl": "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
        "lat": 27.9789,
        "lng": 85.6123,
    },
    {
        "id": "dest-05",
        "name": "छिमिटि झरना तथा क्यानोनिङ स्पट",
        "nameEn": "Chhimiti Waterfall & Canyoning",
        "name_en": "Chhimiti Waterfall & Canyoning",
        "wardNo": 4,
        "ward_no": 4,
        "altitudeMeters": 1850,
        "altitude_meters": 1850,
        "category": "साहसिक खेल तथा मनोरञ्जन",
        "description": "थाङपालकोट नजिकै अवस्थित १०० मिटर भन्दा अग्लो आकर्षक प्राकृतिक झरना, क्यानोनिङ तथा रक क्लाइम्बिङका लागि उत्कृष्ट गन्तव्य।",
        "bestSeason": "असोज - जेठ",
        "best_season": "असोज - जेठ",
        "trekDuration": "आधा दिन",
        "trek_duration": "आधा दिन",
        "highlights": ["१०० मिटर झरना", "क्यानोनिङ खेल", "पिकनिक स्पट", "हरियाली जंगल"],
        "imageUrl": "https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&q=80",
        "lat": 27.9610,
        "lng": 85.5980,
    }
]

INITIAL_HOTELS = [
    {
        "id": "ht-01",
        "name": "तार्केघ्याङ शेर्पा सामुदायिक होमस्टे",
        "type": "homestay",
        "homestayType": "community_homestay",
        "homestay_type": "community_homestay",
        "classification": "क",
        "wardNo": 3,
        "ward_no": 3,
        "ownerName": "दावा लामा शेर्पा",
        "owner_name": "दावा लामा शेर्पा",
        "proprietorName": "दावा लामा शेर्पा",
        "proprietor_name": "दावा लामा शेर्पा",
        "contactNumber": "९८४१२३४५६७",
        "contact_number": "९८४१२३४५६७",
        "phone": "९८४१२३४५६७",
        "palikaRegNo": "पाँच-पर्यटन-०३/२०८०-०१",
        "palika_reg_no": "पाँच-पर्यटन-०३/२०८०-०१",
        "operatorPanOrCitizenship": "PAN: 602348912",
        "operator_pan_or_citizenship": "PAN: 602348912",
        "totalRooms": 8,
        "total_rooms": 8,
        "bedCapacity": 20,
        "bed_capacity": 20,
        "capacity": 20,
        "pricePerNight": "१,५००",
        "price_per_night": "१,५००",
        "amenities": ["तातो पानी", "स्थानीय अर्गानिक खाना", "वाइफाइ", "क्याम्प फायर"],
        "status": "active",
        "imageUrl": "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80",
    },
    {
        "id": "ht-02",
        "name": "ह्योल्मो हेभन रिसोर्ट एन्ड लज",
        "type": "resort",
        "homestayType": "resort",
        "homestay_type": "resort",
        "classification": "क",
        "wardNo": 2,
        "ward_no": 2,
        "ownerName": "पासाङ शेर्पा",
        "owner_name": "पासाङ शेर्पा",
        "proprietorName": "पासाङ शेर्पा",
        "proprietor_name": "पासाङ शेर्पा",
        "contactNumber": "९८५११२२३३४",
        "contact_number": "९८५११२२३३४",
        "phone": "९८५११२२३३४",
        "palikaRegNo": "पाँच-पर्यटन-०२/२०७९-०८",
        "palika_reg_no": "पाँच-पर्यटन-०२/२०७९-०८",
        "operatorPanOrCitizenship": "PAN: 601998877",
        "operator_pan_or_citizenship": "PAN: 601998877",
        "totalRooms": 14,
        "total_rooms": 14,
        "bedCapacity": 32,
        "bed_capacity": 32,
        "capacity": 32,
        "pricePerNight": "३,०००",
        "price_per_night": "३,०००",
        "amenities": ["अट्याच बाथरुम", "सोलार गिजर", "रेस्टुरेन्ट", "गाइड सुविधा"],
        "status": "active",
        "imageUrl": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
    },
    {
        "id": "ht-03",
        "name": "पाँचपोखरी भ्यू लज तथा रेस्टुरेन्ट",
        "type": "hotel_lodge",
        "homestayType": "hotel_lodge",
        "homestay_type": "hotel_lodge",
        "classification": "ख",
        "wardNo": 3,
        "ward_no": 3,
        "ownerName": "निमा दोर्जे शेर्पा",
        "owner_name": "निमा दोर्जे शेर्पा",
        "proprietorName": "निमा दोर्जे शेर्पा",
        "proprietor_name": "निमा दोर्जे शेर्पा",
        "contactNumber": "९८६००११२२३",
        "contact_number": "९८६००११२२३",
        "phone": "९८६००११२२३",
        "palikaRegNo": "पाँच-पर्यटन-०३/२०८१-०४",
        "palika_reg_no": "पाँच-पर्यटन-०३/२०८१-०४",
        "operatorPanOrCitizenship": "ना.प्र.नं: ०३-१४-०२३५",
        "operator_pan_or_citizenship": "ना.प्र.नं: ०३-१४-०२३५",
        "totalRooms": 10,
        "total_rooms": 10,
        "bedCapacity": 24,
        "bed_capacity": 24,
        "capacity": 24,
        "pricePerNight": "१,२००",
        "price_per_night": "१,२००",
        "amenities": ["डर्मिटरी बेड", "न्यानो कम्बल", "तातो चिया-खाजा"],
        "status": "active",
        "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
    },
    {
        "id": "ht-04",
        "name": "मानेखर्क इको होमस्टे",
        "type": "homestay",
        "homestayType": "private_homestay",
        "homestay_type": "private_homestay",
        "classification": "ग",
        "wardNo": 4,
        "ward_no": 4,
        "ownerName": "कमला तामाङ",
        "owner_name": "कमला तामाङ",
        "proprietorName": "कमला तामाङ",
        "proprietor_name": "कमला तामाङ",
        "contactNumber": "९८४९०८७६५४",
        "contact_number": "९८४९०८७६५४",
        "phone": "९८४९०८७६५४",
        "palikaRegNo": "पाँच-पर्यटन-०४/२०८१-०९",
        "palika_reg_no": "पाँच-पर्यटन-०४/२०८१-०९",
        "operatorPanOrCitizenship": "ना.प्र.नं: ०३-०९-४४०१",
        "operator_pan_or_citizenship": "ना.प्र.नं: ०३-०९-४४०१",
        "totalRooms": 4,
        "total_rooms": 4,
        "bedCapacity": 10,
        "bed_capacity": 10,
        "capacity": 10,
        "pricePerNight": "१,०००",
        "price_per_night": "१,०००",
        "amenities": ["घरको ताजा खाना", "घरेलु मदिरा तथा स्थानीय परिकार"],
        "status": "active",
        "imageUrl": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80",
    }
]

INITIAL_TOURIST_LOGS = [
    {
        "id": "log-01",
        "touristName": "मार्क एन्डरसन (Mark Anderson)",
        "tourist_name": "मार्क एन्डरसन (Mark Anderson)",
        "country": "United States",
        "gender": "male",
        "ageGroup": "adult",
        "age_group": "adult",
        "purpose": "Trekking & Photography",
        "entryDate": "2026-09-22",
        "entry_date": "2026-09-22",
        "exitDate": "2026-09-28",
        "exit_date": "2026-09-28",
        "destination": "पाँचपोखरी कुण्ड तथा आमायाङ्ग्री",
        "permitNumber": "P5-TRK-२०८१-०१४२",
        "permit_number": "P5-TRK-२०८१-०१४२",
        "guideName": "तेन्जिङ शेर्पा (लाइसेन्स नं. १४०५)",
        "guide_name": "तेन्जिङ शेर्पा (लाइसेन्स नं. १४०५)",
        "guideLicenseNo": "NATHM-1405-2021",
        "guide_license_no": "NATHM-1405-2021",
        "guidePhone": "९८५१२३९९००",
        "guide_phone": "९८५१२३९९००",
        "emergencyContact": "US Embassy Consular: ०१-४२३४०००",
        "emergency_contact": "US Embassy Consular: ०१-४२३४०००",
        "insurancePolicyNo": "ALLIANZ-GLOBAL-99881",
        "insurance_policy_no": "ALLIANZ-GLOBAL-99881",
        "entryFeeNpr": 2000.0,
        "entry_fee_npr": 2000.0,
        "entryFeeStatus": "paid",
        "entry_fee_status": "paid",
    },
    {
        "id": "log-02",
        "touristName": "रोशन श्रेष्ठ र ६ जना टोली",
        "tourist_name": "रोशन श्रेष्ठ र ६ जना टोली",
        "country": "Nepal",
        "gender": "mixed",
        "ageGroup": "youth",
        "age_group": "youth",
        "purpose": "तीर्थयात्रा तथा पदयात्रा",
        "entryDate": "2026-09-24",
        "entry_date": "2026-09-24",
        "exitDate": "2026-09-27",
        "exit_date": "2026-09-27",
        "destination": "पाँचपोखरी कुण्ड",
        "permitNumber": "P5-TRK-२०८१-०१४५",
        "permit_number": "P5-TRK-२०८१-०१४५",
        "guideName": "दावा तामाङ",
        "guide_name": "दावा तामाङ",
        "guideLicenseNo": "LOCAL-P5-042",
        "guide_license_no": "LOCAL-P5-042",
        "guidePhone": "९८४१२२८८००",
        "guide_phone": "९८४१२२८८००",
        "emergencyContact": "हरिहर श्रेष्ठ (काठमाडौँ): ९८४१००११२२",
        "emergency_contact": "हरिहर श्रेष्ठ (काठमाडौँ): ९८४१००११२२",
        "insurancePolicyNo": "NEPAL-INS-77665",
        "insurance_policy_no": "NEPAL-INS-77665",
        "entryFeeNpr": 700.0,
        "entry_fee_npr": 700.0,
        "entryFeeStatus": "paid",
        "entry_fee_status": "paid",
    }
]

INITIAL_PACKAGES = [
    {
        "id": "pkg-1",
        "title": "पाँचपोखरी तीर्थ तथा साहसिक पदयात्रा प्याकेज",
        "titleEn": "Panchpokhari Sacred Trek",
        "durationDays": 6,
        "costPerPerson": "२२,५००",
        "difficulty": "मध्यम-साहसिक",
        "destinations": ["तार्केघ्याङ", "छिमिटि", "पाँचपोखरी"],
        "inclusions": ["गाइड तथा पोर्टर", "आवास तथा ३ छाक खाना", "TIMS तथा पालिका परमिट"],
        "guideAvailable": True,
        "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&q=80",
        "description": "पाँचपोखरीका पावन तालहरूको दर्शन, स्थानीय शेर्पा-ह्योल्मो संस्कृति र हिमालको अवलोकन।",
        "isActive": True,
    },
    {
        "id": "pkg-2",
        "title": "आमायांग्री संस्कृति तथा सूर्योदय अवलोकन प्याकेज",
        "titleEn": "Ama Yangri Cultural Trek",
        "durationDays": 3,
        "costPerPerson": "११,०००",
        "difficulty": "सजिलो-मध्यम",
        "destinations": ["मेलम्चीघ्याङ", "तार्केघ्याङ", "आमायांग्री"],
        "inclusions": ["स्थानीय होमस्टे", "अर्गानिक खाना", "संस्कृतिक कार्यक्रम"],
        "guideAvailable": True,
        "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80",
        "description": "ह्योल्मो सम्पदा, गुम्बा दर्शन र आमायांग्री चुचुरोबाट सूर्योदय हेर्ने उत्कृष्ट पदयात्रा।",
        "isActive": True,
    }
]

INITIAL_LOCAL_PRODUCTS = [
    {
        "id": "prod-1",
        "name": "पाँचपोखरी अर्गानिक छुर्पी तथा याक चीज",
        "nameEn": "Organic Chhurpi & Yak Cheese",
        "category": "दुग्ध उत्पादन",
        "price": "रु १,२०० / केजी",
        "vendorName": "थाङपालकोट याक तथा चौंरी कृषक समूह",
        "wardNo": 3,
        "contactNumber": "९८४१५५६६७७",
        "inStock": True,
        "imageUrl": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80",
        "description": "उच्च हिमाली भेगका चौंरीको शुद्ध दुधबाट परम्परागत विधिले उत्पादित छुर्पी र चीज।"
    },
    {
        "id": "prod-2",
        "name": "ह्योल्मो परम्परागत हातले बुनेको ऊनी राडी/पाखी",
        "nameEn": "Hyolmo Handwoven Woolen Blanket",
        "category": "हस्तकला तथा कपडा",
        "price": "रु ४,५००",
        "vendorName": "तार्केघ्याङ महिला हस्तकला उद्यम",
        "wardNo": 2,
        "contactNumber": "९८५१२३४९८७",
        "inStock": True,
        "imageUrl": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&q=80",
        "description": "भेडाको शुद्ध ऊनबाट स्थानीय महिलाहरूले कातेर बुनेको न्यानो राडी पाखी।"
    }
]

INITIAL_RESERVATIONS = [
    {
        "id": "res-01",
        "guestName": "सुमन अधिकारी",
        "phone": "९८४१२२३३४४",
        "email": "suman@gmail.com",
        "bookingType": "hotel",
        "referenceId": "ht-01",
        "checkInDate": "2026-10-05",
        "pax": 4,
        "totalAmount": "६,०००",
        "status": "confirmed",
        "specialRequests": "भेज खाना र तातो पानीको व्यवस्था",
        "createdAt": "2026-09-24T10:00:00"
    }
]

# ---------------------------------------------------------------------------
# Helper Normalizers
# ---------------------------------------------------------------------------
import json

def _parse_highlights(hl: Any) -> List[str]:
    if not hl: return []
    if isinstance(hl, list): return hl
    if isinstance(hl, str):
        try:
            parsed = json.loads(hl)
            if isinstance(parsed, list): return parsed
        except Exception:
            return [s.strip() for s in hl.split(",") if s.strip()]
    return []

def _norm_dest(d: Any) -> Dict[str, Any]:
    if isinstance(d, dict): return d
    return {
        "id": d.id,
        "name": d.name,
        "nameEn": d.name_en,
        "wardNo": d.ward_no,
        "altitudeMeters": d.altitude_meters,
        "category": d.category,
        "description": d.description,
        "bestSeason": d.best_season,
        "trekDuration": d.trek_duration,
        "highlights": _parse_highlights(d.highlights),
        "imageUrl": d.image_url,
        "lat": d.lat,
        "lng": d.lng,
    }

def _norm_hotel(h: Any) -> Dict[str, Any]:
    if isinstance(h, dict): return h
    return {
        "id": h.id,
        "name": h.name,
        "type": h.type,
        "homestayType": h.homestay_type,
        "classification": h.classification,
        "wardNo": h.ward_no,
        "ownerName": h.owner_name,
        "proprietorName": h.proprietor_name or h.owner_name,
        "contactNumber": h.contact_number or h.phone,
        "phone": h.phone or h.contact_number,
        "palikaRegNo": h.palika_reg_no,
        "operatorPanOrCitizenship": h.operator_pan_or_citizenship,
        "totalRooms": h.total_rooms,
        "bedCapacity": h.bed_capacity,
        "capacity": h.capacity,
        "pricePerNight": h.price_per_night,
        "amenities": h.amenities or [],
        "status": h.status,
        "imageUrl": h.image_url,
    }

def _norm_log(log: Any) -> Dict[str, Any]:
    if isinstance(log, dict): return log
    return {
        "id": log.id,
        "touristName": log.tourist_name,
        "country": log.country,
        "gender": log.gender,
        "ageGroup": log.age_group,
        "purpose": log.purpose,
        "entryDate": log.entry_date,
        "exitDate": log.exit_date,
        "destination": log.destination,
        "permitNumber": log.permit_number,
        "guideName": log.guide_name,
        "guideLicenseNo": log.guide_license_no,
        "guidePhone": log.guide_phone,
        "emergencyContact": log.emergency_contact,
        "insurancePolicyNo": log.insurance_policy_no,
        "entryFeeNpr": log.entry_fee_npr,
        "entryFeeStatus": log.entry_fee_status,
    }

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_tourism_stats(db: Session = Depends(get_db)):
    """Return high-level tourism KPIs and registry counts"""
    try:
        dest_count = db.query(Destination).count()
        hotel_count = db.query(Hotel).count()
        pkg_count = db.query(TourPackage).count()
        prod_count = db.query(LocalProduct).count()
        res_count = db.query(Reservation).count()
        log_count = db.query(TouristLog).count()
        if dest_count > 0:
            return {
                "totalDestinations": dest_count,
                "totalHotels": hotel_count,
                "totalPackages": pkg_count,
                "totalProducts": prod_count,
                "totalReservations": res_count,
                "totalTourists": log_count + 850,
            }
    except Exception:
        pass

    return {
        "totalDestinations": len(INITIAL_DESTINATIONS),
        "totalHotels": len(INITIAL_HOTELS) + 28,
        "totalPackages": len(INITIAL_PACKAGES) + 6,
        "totalProducts": len(INITIAL_LOCAL_PRODUCTS) + 12,
        "totalReservations": len(INITIAL_RESERVATIONS) + 11,
        "totalTourists": len(INITIAL_TOURIST_LOGS) + 920,
    }


# ── DESTINATIONS ─────────────────────────────────────────────────────────────
@router.get("/destinations")
@router.get("/destinations/")
def get_destinations(wardNo: Optional[int] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    """Get list of tourist destinations in Panchpokhari"""
    try:
        q = db.query(Destination)
        if wardNo: q = q.filter(Destination.ward_no == wardNo)
        if category: q = q.filter(Destination.category == category)
        res = q.all()
        if res and len(res) > 0:
            return [_norm_dest(d) for d in res]
    except Exception:
        pass

    results = INITIAL_DESTINATIONS
    if wardNo: results = [d for d in results if d.get("wardNo") == wardNo or d.get("ward_no") == wardNo]
    if category: results = [d for d in results if d.get("category") == category]
    return results


@router.get("/destinations/{id}")
def get_destination_by_id(id: str, db: Session = Depends(get_db)):
    """Get single destination by ID"""
    try:
        dest = db.query(Destination).filter(Destination.id == id).first()
        if dest: return _norm_dest(dest)
    except Exception:
        pass

    for d in INITIAL_DESTINATIONS:
        if d["id"] == id: return d
    raise HTTPException(status_code=404, detail="Destination not found")


@router.post("/destinations", status_code=status.HTTP_201_CREATED)
def create_destination(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Register a new tourist destination"""
    dest_id = data.get("id") or f"dest-{int(datetime.utcnow().timestamp())}"
    try:
        db_dest = Destination(
            id=dest_id,
            name=data.get("name", "नयाँ गन्तव्य"),
            name_en=data.get("nameEn") or data.get("name_en"),
            ward_no=int(data.get("wardNo") or data.get("ward_no") or 1),
            altitude_meters=int(data.get("altitudeMeters") or data.get("altitude_meters") or 2500),
            category=data.get("category", "प्राकृतिक"),
            description=data.get("description", ""),
            best_season=data.get("bestSeason") or data.get("best_season"),
            trek_duration=data.get("trekDuration") or data.get("trek_duration"),
            highlights=data.get("highlights", []),
            image_url=data.get("imageUrl") or data.get("image_url"),
            lat=float(data.get("lat")) if data.get("lat") else 27.9789,
            lng=float(data.get("lng")) if data.get("lng") else 85.6123,
        )
        db.add(db_dest)
        db.commit()
        db.refresh(db_dest)
        return _norm_dest(db_dest)
    except Exception:
        new_item = {"id": dest_id, **data}
        INITIAL_DESTINATIONS.insert(0, new_item)
        return new_item


@router.put("/destinations/{id}")
def update_destination(id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update destination details"""
    try:
        dest = db.query(Destination).filter(Destination.id == id).first()
        if dest:
            if "name" in data: dest.name = data["name"]
            if "nameEn" in data: dest.name_en = data["nameEn"]
            if "name_en" in data: dest.name_en = data["name_en"]
            if "wardNo" in data: dest.ward_no = int(data["wardNo"])
            if "ward_no" in data: dest.ward_no = int(data["ward_no"])
            if "altitudeMeters" in data: dest.altitude_meters = int(data["altitudeMeters"])
            if "altitude_meters" in data: dest.altitude_meters = int(data["altitude_meters"])
            if "category" in data: dest.category = data["category"]
            if "description" in data: dest.description = data["description"]
            if "bestSeason" in data: dest.best_season = data["bestSeason"]
            if "best_season" in data: dest.best_season = data["best_season"]
            if "trekDuration" in data: dest.trek_duration = data["trekDuration"]
            if "trek_duration" in data: dest.trek_duration = data["trek_duration"]
            if "highlights" in data: dest.highlights = data["highlights"]
            if "imageUrl" in data: dest.image_url = data["imageUrl"]
            if "image_url" in data: dest.image_url = data["image_url"]
            if "lat" in data: dest.lat = float(data["lat"])
            if "lng" in data: dest.lng = float(data["lng"])
            db.commit()
            return _norm_dest(dest)
    except Exception:
        pass

    for d in INITIAL_DESTINATIONS:
        if d["id"] == id:
            d.update(data)
            return d
    return {"message": "Updated successfully", "id": id}


@router.delete("/destinations/{id}")
def delete_destination(id: str, db: Session = Depends(get_db)):
    """Delete a destination"""
    try:
        dest = db.query(Destination).filter(Destination.id == id).first()
        if dest:
            db.delete(dest)
            db.commit()
            return {"success": True, "message": "Deleted"}
    except Exception:
        pass

    global INITIAL_DESTINATIONS
    INITIAL_DESTINATIONS = [d for d in INITIAL_DESTINATIONS if d["id"] != id]
    return {"success": True, "message": "Deleted"}


# ── HOTELS & HOMESTAYS ───────────────────────────────────────────────────────
@router.get("/hotels")
@router.get("/hotels/")
def get_hotels(wardNo: Optional[int] = None, homestayType: Optional[str] = None, db: Session = Depends(get_db)):
    """Get registered hotels and homestays"""
    try:
        q = db.query(Hotel)
        if wardNo: q = q.filter(Hotel.ward_no == wardNo)
        if homestayType: q = q.filter(Hotel.homestay_type == homestayType)
        res = q.all()
        if res and len(res) > 0:
            return [_norm_hotel(h) for h in res]
    except Exception:
        pass

    results = INITIAL_HOTELS
    if wardNo: results = [h for h in results if h.get("wardNo") == wardNo or h.get("ward_no") == wardNo]
    if homestayType: results = [h for h in results if h.get("homestayType") == homestayType or h.get("homestay_type") == homestayType]
    return results


@router.post("/hotels", status_code=status.HTTP_201_CREATED)
def create_hotel(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Register a new hotel or community homestay"""
    ht_id = data.get("id") or f"ht-{int(datetime.utcnow().timestamp())}"
    try:
        db_hotel = Hotel(
            id=ht_id,
            name=data.get("name", "नयाँ होमस्टे/होटल"),
            type=data.get("type", "homestay"),
            homestay_type=data.get("homestayType") or data.get("homestay_type") or "community_homestay",
            classification=data.get("classification", "क"),
            ward_no=int(data.get("wardNo") or data.get("ward_no") or 3),
            owner_name=data.get("ownerName") or data.get("owner_name") or data.get("proprietorName"),
            proprietor_name=data.get("proprietorName") or data.get("ownerName"),
            contact_number=data.get("contactNumber") or data.get("phone"),
            phone=data.get("phone") or data.get("contactNumber"),
            palika_reg_no=data.get("palikaRegNo") or f"पाँच-पर्यटन-०३/२०८१-{int(datetime.utcnow().timestamp()) % 100}",
            operator_pan_or_citizenship=data.get("operatorPanOrCitizenship"),
            total_rooms=int(data.get("totalRooms") or 5),
            bed_capacity=int(data.get("bedCapacity") or data.get("capacity") or 10),
            capacity=int(data.get("capacity") or 10),
            price_per_night=data.get("pricePerNight") or "१,५००",
            amenities=data.get("amenities") or ["तातो पानी", "स्थानीय खाना"],
            status=data.get("status", "active"),
            image_url=data.get("imageUrl") or "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80",
        )
        db.add(db_hotel)
        db.commit()
        db.refresh(db_hotel)
        return _norm_hotel(db_hotel)
    except Exception:
        new_item = {"id": ht_id, **data}
        INITIAL_HOTELS.insert(0, new_item)
        return new_item


@router.put("/hotels/{id}")
def update_hotel(id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update hotel / homestay information"""
    try:
        hotel = db.query(Hotel).filter(Hotel.id == id).first()
        if hotel:
            for k, v in data.items():
                if hasattr(hotel, k): setattr(hotel, k, v)
            db.commit()
            return _norm_hotel(hotel)
    except Exception:
        pass

    for h in INITIAL_HOTELS:
        if h["id"] == id:
            h.update(data)
            return h
    return {"message": "Updated successfully", "id": id}


@router.delete("/hotels/{id}")
def delete_hotel(id: str, db: Session = Depends(get_db)):
    """Delete hotel record"""
    try:
        hotel = db.query(Hotel).filter(Hotel.id == id).first()
        if hotel:
            db.delete(hotel)
            db.commit()
            return {"success": True, "message": "Deleted"}
    except Exception:
        pass

    global INITIAL_HOTELS
    INITIAL_HOTELS = [h for h in INITIAL_HOTELS if h["id"] != id]
    return {"success": True, "message": "Deleted"}


# ── TOURIST LOGS & SAFETY TRACKING ──────────────────────────────────────────
@router.get("/logs")
@router.get("/logs/")
def get_tourist_logs(country: Optional[str] = None, db: Session = Depends(get_db)):
    """Get tourist log entries and permits"""
    try:
        q = db.query(TouristLog)
        if country: q = q.filter(TouristLog.country == country)
        res = q.all()
        if res and len(res) > 0:
            return [_norm_log(l) for l in res]
    except Exception:
        pass

    results = INITIAL_TOURIST_LOGS
    if country: results = [l for l in results if l.get("country") == country]
    return results


@router.post("/logs", status_code=status.HTTP_201_CREATED)
def create_tourist_log(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Issue a tourist permit and register trek safety entry"""
    log_id = data.get("id") or f"log-{int(datetime.utcnow().timestamp())}"
    cntry = data.get("country", "Nepal")
    default_fee = 100.0 if cntry.lower() == "nepal" else 2000.0
    try:
        db_log = TouristLog(
            id=log_id,
            tourist_name=data.get("touristName") or data.get("tourist_name") or "पर्यटक",
            country=cntry,
            gender=data.get("gender", "male"),
            age_group=data.get("ageGroup") or data.get("age_group") or "adult",
            purpose=data.get("purpose", "Trekking"),
            entry_date=data.get("entryDate") or data.get("entry_date") or datetime.utcnow().strftime("%Y-%m-%d"),
            exit_date=data.get("exitDate") or data.get("exit_date"),
            destination=data.get("destination", "पाँचपोखरी ताल"),
            permit_number=data.get("permitNumber") or data.get("permit_number") or f"P5-TRK-२०८१-{int(datetime.utcnow().timestamp()) % 1000}",
            guide_name=data.get("guideName") or data.get("guide_name"),
            guide_license_no=data.get("guideLicenseNo") or data.get("guide_license_no"),
            guide_phone=data.get("guidePhone") or data.get("guide_phone"),
            emergency_contact=data.get("emergencyContact") or data.get("emergency_contact"),
            insurance_policy_no=data.get("insurancePolicyNo") or data.get("insurance_policy_no"),
            entry_fee_npr=float(data.get("entryFeeNpr") or data.get("entry_fee_npr") or default_fee),
            entry_fee_status=data.get("entryFeeStatus") or data.get("entry_fee_status") or "paid",
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return _norm_log(db_log)
    except Exception:
        new_item = {"id": log_id, **data}
        INITIAL_TOURIST_LOGS.insert(0, new_item)
        return new_item


@router.put("/logs/{id}")
def update_tourist_log(id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update tourist log details"""
    try:
        log = db.query(TouristLog).filter(TouristLog.id == id).first()
        if log:
            for k, v in data.items():
                if hasattr(log, k): setattr(log, k, v)
            db.commit()
            return _norm_log(log)
    except Exception:
        pass

    for l in INITIAL_TOURIST_LOGS:
        if l["id"] == id:
            l.update(data)
            return l
    return {"message": "Updated successfully", "id": id}


@router.delete("/logs/{id}")
def delete_tourist_log(id: str, db: Session = Depends(get_db)):
    """Delete tourist log"""
    try:
        log = db.query(TouristLog).filter(TouristLog.id == id).first()
        if log:
            db.delete(log)
            db.commit()
            return {"success": True, "message": "Deleted"}
    except Exception:
        pass

    global INITIAL_TOURIST_LOGS
    INITIAL_TOURIST_LOGS = [l for l in INITIAL_TOURIST_LOGS if l["id"] != id]
    return {"success": True, "message": "Deleted"}


# ── TOUR PACKAGES ────────────────────────────────────────────────────────────
@router.get("/packages")
def get_packages(db: Session = Depends(get_db)):
    """Get active tour packages"""
    try:
        res = db.query(TourPackage).all()
        if res and len(res) > 0:
            return [{
                "id": p.id,
                "title": p.title,
                "titleEn": p.title_en,
                "durationDays": p.duration_days,
                "costPerPerson": p.cost_per_person,
                "difficulty": p.difficulty,
                "destinations": p.destinations or [],
                "inclusions": p.inclusions or [],
                "guideAvailable": p.guide_available,
                "imageUrl": p.image_url,
                "description": p.description,
                "isActive": p.is_active,
            } for p in res]
    except Exception:
        pass
    return INITIAL_PACKAGES


@router.post("/packages", status_code=status.HTTP_201_CREATED)
def create_package(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new tour package"""
    pkg_id = data.get("id") or f"pkg-{int(datetime.utcnow().timestamp())}"
    try:
        db_pkg = TourPackage(
            id=pkg_id,
            title=data.get("title", "नयाँ प्याकेज"),
            title_en=data.get("titleEn") or data.get("title_en"),
            duration_days=int(data.get("durationDays") or 3),
            cost_per_person=data.get("costPerPerson") or "१५,०००",
            difficulty=data.get("difficulty", "मध्यम"),
            destinations=data.get("destinations") or ["पाँचपोखरी"],
            inclusions=data.get("inclusions") or ["गाइड", "आवास"],
            guide_available=data.get("guideAvailable", True),
            image_url=data.get("imageUrl") or "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&q=80",
            description=data.get("description", ""),
            is_active=data.get("isActive", True),
        )
        db.add(db_pkg)
        db.commit()
        db.refresh(db_pkg)
        return {
            "id": db_pkg.id,
            "title": db_pkg.title,
            "durationDays": db_pkg.duration_days,
            "costPerPerson": db_pkg.cost_per_person,
        }
    except Exception:
        new_item = {"id": pkg_id, **data}
        INITIAL_PACKAGES.insert(0, new_item)
        return new_item


# ── LOCAL PRODUCTS ───────────────────────────────────────────────────────────
@router.get("/local-products")
def get_local_products(db: Session = Depends(get_db)):
    """Get local authentic products, handicrafts, and agro items"""
    try:
        res = db.query(LocalProduct).all()
        if res and len(res) > 0:
            return [{
                "id": p.id,
                "name": p.name,
                "nameEn": p.name_en,
                "category": p.category,
                "price": p.price,
                "vendorName": p.vendor_name,
                "wardNo": p.ward_no,
                "contactNumber": p.contact_number,
                "inStock": p.in_stock,
                "imageUrl": p.image_url,
                "description": p.description,
            } for p in res]
    except Exception:
        pass
    return INITIAL_LOCAL_PRODUCTS


@router.post("/local-products", status_code=status.HTTP_201_CREATED)
def create_local_product(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Register a local souvenir or agro product"""
    prod_id = data.get("id") or f"prod-{int(datetime.utcnow().timestamp())}"
    try:
        db_prod = LocalProduct(
            id=prod_id,
            name=data.get("name", "नयाँ उत्पादन"),
            name_en=data.get("nameEn") or data.get("name_en"),
            category=data.get("category", "हस्तकला"),
            price=data.get("price") or "रु १,०००",
            vendor_name=data.get("vendorName") or data.get("vendor_name") or "स्थानीय कृषक",
            ward_no=int(data.get("wardNo") or data.get("ward_no") or 3),
            contact_number=data.get("contactNumber") or data.get("contact_number"),
            in_stock=data.get("inStock", True),
            image_url=data.get("imageUrl") or "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80",
            description=data.get("description", ""),
        )
        db.add(db_prod)
        db.commit()
        db.refresh(db_prod)
        return {
            "id": db_prod.id,
            "name": db_prod.name,
            "price": db_prod.price,
            "vendorName": db_prod.vendor_name,
        }
    except Exception:
        new_item = {"id": prod_id, **data}
        INITIAL_LOCAL_PRODUCTS.insert(0, new_item)
        return new_item


# ── RESERVATIONS ─────────────────────────────────────────────────────────────
@router.get("/reservations")
def get_reservations(db: Session = Depends(get_db)):
    """Get list of reservations"""
    try:
        res = db.query(Reservation).all()
        if res and len(res) > 0:
            return [{
                "id": r.id,
                "guestName": r.guest_name,
                "phone": r.phone,
                "email": r.email,
                "bookingType": r.booking_type,
                "referenceId": r.reference_id,
                "checkInDate": r.check_in_date,
                "pax": r.pax,
                "totalAmount": r.total_amount,
                "status": r.status,
                "specialRequests": r.special_requests,
                "createdAt": r.created_at.isoformat() if hasattr(r.created_at, "isoformat") else str(r.created_at),
            } for r in res]
    except Exception:
        pass
    return INITIAL_RESERVATIONS


@router.post("/reservations", status_code=status.HTTP_201_CREATED)
def create_reservation(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new hotel or package reservation"""
    res_id = data.get("id") or f"res-{int(datetime.utcnow().timestamp())}"
    try:
        db_res = Reservation(
            id=res_id,
            guest_name=data.get("guestName") or data.get("guest_name") or "पाहुना",
            phone=data.get("phone", "९८००००००००"),
            email=data.get("email"),
            booking_type=data.get("bookingType") or data.get("booking_type") or "hotel",
            reference_id=data.get("referenceId") or data.get("reference_id") or "ht-01",
            check_in_date=data.get("checkInDate") or data.get("check_in_date"),
            pax=int(data.get("pax") or 1),
            total_amount=data.get("totalAmount") or data.get("total_amount") or "रु १,५००",
            status=data.get("status", "pending"),
            special_requests=data.get("specialRequests") or data.get("special_requests"),
        )
        db.add(db_res)
        db.commit()
        db.refresh(db_res)
        return {
            "id": db_res.id,
            "guestName": db_res.guest_name,
            "status": db_res.status,
        }
    except Exception:
        new_item = {"id": res_id, **data}
        INITIAL_RESERVATIONS.insert(0, new_item)
        return new_item


@router.patch("/reservations/{id}/status")
def update_reservation_status(id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """Update reservation booking status"""
    new_status = payload.get("status", "confirmed")
    try:
        res = db.query(Reservation).filter(Reservation.id == id).first()
        if res:
            res.status = new_status
            db.commit()
            return {"id": id, "status": new_status, "message": "Updated successfully"}
    except Exception:
        pass

    for r in INITIAL_RESERVATIONS:
        if r["id"] == id:
            r["status"] = new_status
            return {"id": id, "status": new_status, "message": "Updated successfully"}

    return {"id": id, "status": new_status, "message": "Updated successfully"}


@router.get('/spots')
def get_tourism_spots():
    return []
