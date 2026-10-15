"""
Seed Cultural Records & Visitor Records
Panchpokhari Thangpal Rural Municipality Digital Twins
Option 33 Database Seeding
"""
import uuid
from datetime import datetime
from core.database import SessionLocal
from models.heritage import CulturalRecord
from models.visitor import VisitorRecord

TENANT_ID = "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"

CULTURAL_DATA = [
    {
        "recordId": "CUL-001",
        "title": "पञ्चपोखरी जनैपूर्णिमा मेला तथा झाँक्री नृत्य",
        "type": "Festival",
        "description": "प्रत्येक वर्ष जनैपूर्णिमा (भाद्र शुक्ल पूर्णिमा) का दिन ४,१०० मिटर उचाइको पाँचपोखरी तालमा लाग्ने विशाल धार्मिक मेला। तामाङ, ह्योल्मो तथा खस-आर्य समुदायका सयौँ धामीझाँक्रीहरूले परम्परागत पहिरन र ढ्याङ्ग्रोको तालमा विशेष तान्त्रिक नृत्य प्रस्तुत गर्दछन्।",
        "location": "पाँचपोखरी ताल परिसर (वडा नं ३, भोताङ)",
        "latitude": 28.0415,
        "longitude": 85.7142,
        "intervieweeName": "पेम्बा दोर्जे झाँक्री (मूल झाँक्री)",
        "interviewerName": "सुजन श्रेष्ठ (संस्कृति अधिकृत)",
        "interviewDate": datetime(2026, 8, 28, 11, 30),
        "audioUrl": "/media/cultural/audio/panchpokhari_jhankri_dance.mp3",
        "videoUrl": "/media/cultural/video/panchpokhari_fair_2080.mp4",
        "transcriptUrl": "/media/cultural/transcripts/jhankri_oral_history.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-002",
        "title": "ह्योल्मो समुदायको परम्परागत ल्होसार (सोनम तथा ग्याल्पो ल्होसार)",
        "type": "Festival",
        "description": "नयाँ वर्षको रूपमा ह्योल्मो समुदायले मनाउने सबैभन्दा ठूलो सांस्कृतिक चाड। गुम्बामा विशेष पूजा, लामा नृत्य (छाम नृत्य), खाप्स्य र बाबर पकाउने तथा म्हान्दार (परम्परागत ह्योल्मो गीत) गाउने चलन छ।",
        "location": "तार्केघ्याङ, गुन्सा तथा बरुवा (वडा नं १, २ र ५)",
        "latitude": 28.0028,
        "longitude": 85.5562,
        "intervieweeName": "ल्हाक्पा साङ्गे लामा (प्रमुख लामा, तार्केघ्याङ गुम्बा)",
        "interviewerName": "निर्मला ह्योल्मो (पर्यटन सहायक)",
        "interviewDate": datetime(2026, 2, 12, 14, 0),
        "audioUrl": "/media/cultural/audio/lhosar_monastery_chant.mp3",
        "videoUrl": "/media/cultural/video/tarkeghyang_lhosar.mp4",
        "transcriptUrl": "/media/cultural/transcripts/hyolmo_lhosar_customs.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-003",
        "title": "म्हाने नाच तथा तार्केघ्याङ परम्परागत भजन",
        "type": "Folk Music",
        "description": "ह्योल्मो संस्कृतिमा मृत्यु संस्कार, छोर्तेन पूजा र विशेष चाडपर्वमा समूहबद्ध भएर गाइने र नाचिइने म्हाने नाच। यसमा जीवन र मृत्युको दर्शन तथा बुद्धको उपदेश समेटिएको हुन्छ।",
        "location": "तार्केघ्याङ (वडा नं २, बरुवा)",
        "latitude": 28.0019,
        "longitude": 85.5581,
        "intervieweeName": "पासाङ डोल्मा ह्योल्मो (वरिष्ठ लोक गायिका)",
        "interviewerName": "दिनेश अधिकारी (अन्वेषक)",
        "interviewDate": datetime(2026, 3, 15, 10, 15),
        "audioUrl": "/media/cultural/audio/mhane_naach_track.mp3",
        "videoUrl": "/media/cultural/video/mhane_dance_documentary.mp4",
        "transcriptUrl": "/media/cultural/transcripts/mhane_lyrics_translation.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-004",
        "title": "तामाङ सेलो तथा डम्फु निर्माणको पुर्ख्यौली कला",
        "type": "Craft",
        "description": "तामाङ जातिको पहिचान झल्काउने डम्फु बाजा बनाउने परम्परागत काठ र छाला प्रशोधन सीप, साथै ताम्बा (इतिहासकार) हरूले गाउने सेलो गीतको मौखिक इतिहास।",
        "location": "भोताङ तथा बाँसखर्क (वडा नं १ र ३)",
        "latitude": 27.9712,
        "longitude": 85.6021,
        "intervieweeName": "बुद्धिमान तामाङ (डम्फु शिल्पकार)",
        "interviewerName": "रत्न तामाङ (कला संयोजक)",
        "interviewDate": datetime(2026, 4, 10, 13, 45),
        "audioUrl": "/media/cultural/audio/tamba_selo_recitation.mp3",
        "videoUrl": "/media/cultural/video/damphu_making_masterclass.mp4",
        "transcriptUrl": "/media/cultural/transcripts/tamba_lineage_notes.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-005",
        "title": "गुन्सा छोर्तेन पूजा तथा मन्त्र साधना परम्परा",
        "type": "Ritual",
        "description": "३०० वर्षभन्दा पुरानो गुन्सा छोर्तेनमा वार्षिक रूपमा गरिने विश्व शान्ति पूजा, मनि मन्त्र जप र लामाहरूको गुप्त साधना पद्धति।",
        "location": "गुन्सा (वडा नं ५)",
        "latitude": 27.9254,
        "longitude": 85.6110,
        "intervieweeName": "छिरिङ नोर्बु लामा",
        "interviewerName": "सुजन श्रेष्ठ",
        "interviewDate": datetime(2026, 5, 20, 9, 30),
        "audioUrl": "/media/cultural/audio/gunsa_puja_horns.mp3",
        "videoUrl": "/media/cultural/video/gunsa_monastery_prayer.mp4",
        "transcriptUrl": "/media/cultural/transcripts/gunsa_chorten_history.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-006",
        "title": "ढाक्रे जात्रा तथा परम्परागत नुन ढुवानी पदमार्ग गाथा",
        "type": "Oral Tradition",
        "description": "केरुङ (तिब्बत) बाट नुन र भेडा-च्याङ्ग्रा काठमाडौं उपत्यका ल्याउँदा पाँचपोखरीको पदमार्ग प्रयोग गर्ने ढाक्रेहरूको ऐतिहासिक गाथा, लोककथा र बाटोमा गाइने ढाक्रे गीतहरू।",
        "location": "थाङपालकोट तथा तिपेनी बजार (वडा नं ४ र ७)",
        "latitude": 27.9051,
        "longitude": 85.5891,
        "intervieweeName": "गोपाल बहादुर कार्की (९१ वर्षीय ज्येष्ठ नागरिक)",
        "interviewerName": "सुजन श्रेष्ठ",
        "interviewDate": datetime(2026, 6, 5, 15, 0),
        "audioUrl": "/media/cultural/audio/dhakre_folklore_recording.mp3",
        "videoUrl": "/media/cultural/video/salt_trade_route_memories.mp4",
        "transcriptUrl": "/media/cultural/transcripts/dhakre_trail_oral_history.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-007",
        "title": "आमा याङ्ग्री कुलदेवी आराधना तथा चुचुरो पदयात्रा अनुष्ठान",
        "type": "Ritual",
        "description": "ह्योल्मो उपत्यकाकी रक्षा देवी 'आमा याङ्ग्री' को थानमा हरेक वैशाख पूर्णिमामा धूप बालेर शान्ति र प्रकृतिको आशिर्वाद माग्ने वार्षिक आराधना अनुष्ठान।",
        "location": "आमा याङ्ग्री शिखर (३,७७१ मि., वडा नं २)",
        "latitude": 28.0210,
        "longitude": 85.5840,
        "intervieweeName": "कर्म दावा शेर्पा",
        "interviewerName": "निर्मला ह्योल्मो",
        "interviewDate": datetime(2026, 5, 23, 8, 45),
        "audioUrl": "/media/cultural/audio/ama_yangri_incantation.mp3",
        "videoUrl": "/media/cultural/video/ama_yangri_summit_puja.mp4",
        "transcriptUrl": "/media/cultural/transcripts/ama_yangri_mythology.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-008",
        "title": "थाङपाल धाप नेवार समुदायको लाखे नाच तथा रोपाइँ जात्रा",
        "type": "Festival",
        "description": "गाइजात्राको भोलिपल्टदेखि नेवार बस्तीमा निकालिने डरलाग्दो लाखे नाच, परम्परागत धाँ बाजा र असार महिनाको धान रोपाइँ जात्रा।",
        "location": "थाङपालधाप (वडा नं ६)",
        "latitude": 27.8920,
        "longitude": 85.5780,
        "intervieweeName": "कृष्ण बहादुर श्रेष्ठ (गुठी प्रमुख)",
        "interviewerName": "प्रदिप श्रेष्ठ",
        "interviewDate": datetime(2026, 8, 30, 16, 20),
        "audioUrl": "/media/cultural/audio/thangpal_lakhe_dhaa_baja.mp3",
        "videoUrl": "/media/cultural/video/thangpal_lakhe_dance.mp4",
        "transcriptUrl": "/media/cultural/transcripts/thangpal_guthi_traditions.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-009",
        "title": "ह्योल्मो मौलिक पहिरन (ह्योल्मो बख्खु) र हस्तकला बुनाइ",
        "type": "Craft",
        "description": "भेडाको ऊन र स्थानीय धागोबाट बन्ने परम्परागत ह्योल्मो बख्खु, पाङ्देन र काठको तान प्रयोग गरेर बुनिने खादा-पट्टाहरूको प्राचिन प्रविधि।",
        "location": "बरुवा तथा मानेखर्क (वडा नं २ र ४)",
        "latitude": 27.9890,
        "longitude": 85.5670,
        "intervieweeName": "ल्हाक्पा याङ्जोम",
        "interviewerName": "निर्मला ह्योल्मो",
        "interviewDate": datetime(2026, 7, 18, 11, 0),
        "audioUrl": "/media/cultural/audio/bakkhu_weaving_songs.mp3",
        "videoUrl": "/media/cultural/video/hyolmo_weaving_loom.mp4",
        "transcriptUrl": "/media/cultural/transcripts/traditional_weaving_guide.pdf",
        "verificationStatus": "Published",
    },
    {
        "recordId": "CUL-010",
        "title": "ड्रयागन फल्स (झरना) को नागराज लोकविश्वास तथा पूजा",
        "type": "Oral Tradition",
        "description": "अग्लो पहराबाट झरिरहेको रहस्यमयी ड्रयागन झरनामा नाग देवताको बास रहेको र पानी नपरेको बेला स्थानीयले क्षमा पूजा गरेपछि पानी पर्ने लोकविश्वास।",
        "location": "ड्रयागन फल्स, भोताङ (वडा नं ३)",
        "latitude": 27.9940,
        "longitude": 85.6420,
        "intervieweeName": "दावा दोर्जे तामाङ",
        "interviewerName": "सुजन श्रेष्ठ",
        "interviewDate": datetime(2026, 6, 28, 14, 15),
        "audioUrl": "/media/cultural/audio/dragon_falls_myth.mp3",
        "videoUrl": "",
        "transcriptUrl": "/media/cultural/transcripts/dragon_falls_legend.pdf",
        "verificationStatus": "Verified",
    },
    {
        "recordId": "CUL-011",
        "title": "च्याब्रुङ तथा तुङ्ना बाजा वादन परम्परा",
        "type": "Folk Music",
        "description": "पञ्चपोखरीका हिमाली भेगमा लामा र ताम्बाहरूले धार्मिक अनुष्ठान र बिहे-उत्सवमा बजाउने दुर्लभ बाजा तुङ्ना र च्याब्रुङको धुन अभिलेख।",
        "location": "लागर्चे (वडा नं ८)",
        "latitude": 27.8760,
        "longitude": 85.5910,
        "intervieweeName": "मान बहादुर तामाङ",
        "interviewerName": "प्रदिप श्रेष्ठ",
        "interviewDate": datetime(2026, 7, 5, 10, 0),
        "audioUrl": "/media/cultural/audio/tungna_melody_track.mp3",
        "videoUrl": "",
        "transcriptUrl": "/media/cultural/transcripts/tungna_playing_notes.pdf",
        "verificationStatus": "Verified",
    },
    {
        "recordId": "CUL-012",
        "title": "सिपा पोखरी तथा नौलिङ्गेस्वर गुफा तपोभूमि अनुश्रुति",
        "type": "Heritage Site",
        "description": "प्राचिन कालमा तिब्बती महासिद्ध मिलारेपा र गुरु पद्मसंभवले तपस्या गरेको विश्वास गरिने नौलिङ्गेस्वर गुफा र यसको ऐतिहासिक तीर्थ महत्व।",
        "location": "सिपा तथा बरुवा खर्क (वडा नं २)",
        "latitude": 28.0150,
        "longitude": 85.5910,
        "intervieweeName": "रिन्जिङ लामा",
        "interviewerName": "सुजन श्रेष्ठ",
        "interviewDate": datetime(2026, 8, 10, 15, 30),
        "audioUrl": "",
        "videoUrl": "",
        "transcriptUrl": "",
        "verificationStatus": "Draft",
    }
]

VISITOR_DATA = [
    {
        "fiscalYear": "२०८१/०८२",
        "month": 5,
        "visitorType": "domestic",
        "count": 4850,
        "destination": "पाँचपोखरी ताल (जनैपूर्णिमा मेला)",
        "revenueNPR": 2425000.00,
        "averageStayDays": 4,
        "nationality": "नेपाली",
        "notes": "जनैपूर्णिमा मेलाको अवसरमा काठमाडौं, काभ्रे, सिन्धुपाल्चोक र आसपासबाट आएका तीर्थयात्री तथा पदयात्री।"
    },
    {
        "fiscalYear": "२०८१/०८२",
        "month": 5,
        "visitorType": "international",
        "count": 320,
        "destination": "पाँचपोखरी तथा ह्योल्मो हेरिटेज ट्रेल",
        "revenueNPR": 640000.00,
        "averageStayDays": 6,
        "nationality": "फ्रान्स, जर्मनी, अमेरिका",
        "notes": "सांस्कृतिक अनुसन्धान तथा फोटोग्राफी पदयात्रा।"
    },
    {
        "fiscalYear": "२०८१/०८२",
        "month": 6,
        "visitorType": "domestic",
        "count": 1820,
        "destination": "आमा याङ्ग्री तथा तार्केघ्याङ",
        "revenueNPR": 910000.00,
        "averageStayDays": 3,
        "nationality": "नेपाली",
        "notes": "शरद ऋतुको सफा मौसममा आमा याङ्ग्री चुचुरो पदयात्रा।"
    },
    {
        "fiscalYear": "२०८१/०८२",
        "month": 6,
        "visitorType": "international",
        "count": 450,
        "destination": "आमा याङ्ग्री - पाँचपोखरी सर्किट",
        "revenueNPR": 900000.00,
        "averageStayDays": 7,
        "nationality": "संयुक्त अधिराज्य (UK), अस्ट्रेलिया, जापान",
        "notes": "हिमाल अवलोकन तथा लामा गुम्बा भ्रमण।"
    },
    {
        "fiscalYear": "२०८१/०८२",
        "month": 7,
        "visitorType": "domestic",
        "count": 2150,
        "destination": "ड्रयागन फल्स तथा छिम्ती",
        "revenueNPR": 860000.00,
        "averageStayDays": 2,
        "nationality": "नेपाली",
        "notes": "दशैं-तिहार विदामा आन्तरिक क्याम्पिङ तथा पारिवारिक भ्रमण।"
    },
    {
        "fiscalYear": "२०८१/०८२",
        "month": 7,
        "visitorType": "international",
        "count": 580,
        "destination": "पाँचपोखरी उच्च हिमाली सर्किट",
        "revenueNPR": 1160000.00,
        "averageStayDays": 8,
        "nationality": "जर्मनी, स्पेन, इटाली",
        "notes": "जुगल हिमशृङ्खला ट्रेक।"
    },
    {
        "fiscalYear": "२०८१/०८२",
        "month": 8,
        "visitorType": "domestic",
        "count": 940,
        "destination": "तार्केघ्याङ ह्योल्मो बस्ती तथा गुम्बा",
        "revenueNPR": 470000.00,
        "averageStayDays": 3,
        "nationality": "नेपाली",
        "notes": "होमस्टे अनुभव तथा स्याउ फार्म भ्रमण।"
    },
    {
        "fiscalYear": "२०८१/०८२",
        "month": 8,
        "visitorType": "international",
        "count": 210,
        "destination": "ह्योल्मो सांस्कृतिक मार्ग",
        "revenueNPR": 420000.00,
        "averageStayDays": 5,
        "nationality": "क्यानडा, कोरिया",
        "notes": "बौद्ध ध्यान तथा संस्कृति अध्ययन।"
    },
    {
        "fiscalYear": "२०८०/०८१",
        "month": 1,
        "visitorType": "domestic",
        "count": 1450,
        "destination": "आमा याङ्ग्री (बुद्ध जयन्ती तथा पूजा)",
        "revenueNPR": 725000.00,
        "averageStayDays": 3,
        "nationality": "नेपाली",
        "notes": "वैशाख पूर्णिमा विशेष दर्शन।"
    },
    {
        "fiscalYear": "२०८०/०८१",
        "month": 1,
        "visitorType": "international",
        "count": 390,
        "destination": "हेलम्बु - पाँचपोखरी पदमार्ग",
        "revenueNPR": 780000.00,
        "averageStayDays": 7,
        "nationality": "अमेरिका, नेदरल्यान्ड्स",
        "notes": "वसन्त ऋतुको लालीगुराँस पदयात्रा।"
    },
    {
        "fiscalYear": "२०८०/०८१",
        "month": 5,
        "visitorType": "domestic",
        "count": 4200,
        "destination": "पाँचपोखरी तीर्थस्थल",
        "revenueNPR": 2100000.00,
        "averageStayDays": 4,
        "nationality": "नेपाली",
        "notes": "२०८० जनैपूर्णिमा मेला।"
    },
    {
        "fiscalYear": "२०८०/०८१",
        "month": 5,
        "visitorType": "international",
        "count": 280,
        "destination": "पाँचपोखरी मेला",
        "revenueNPR": 560000.00,
        "averageStayDays": 6,
        "nationality": "फ्रान्स, अस्ट्रिया",
        "notes": "झाँक्री नृत्य डकुमेन्ट्री छायाङ्कन।"
    }
]

def seed():
    db = SessionLocal()
    try:
        print("🌱 Seeding cultural_records...")
        existing_cult = db.query(CulturalRecord).count()
        if existing_cult == 0:
            for item in CULTURAL_DATA:
                rec = CulturalRecord(
                    id=uuid.uuid4(),
                    tenant_id=TENANT_ID,
                    record_id=item["recordId"],
                    title=item["title"],
                    type=item["type"],
                    description=item["description"],
                    location=item["location"],
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    interviewee_name=item["intervieweeName"],
                    interviewer_name=item["interviewerName"],
                    interview_date=item["interviewDate"],
                    audio_url=item["audioUrl"],
                    video_url=item["videoUrl"],
                    transcript_url=item["transcriptUrl"],
                    verification_status=item["verificationStatus"],
                )
                db.add(rec)
            db.commit()
            print(f"✅ Inserted {len(CULTURAL_DATA)} cultural records.")
        else:
            print(f"ℹ️ cultural_records already has {existing_cult} rows.")

        print("🌱 Seeding visitor_records...")
        existing_vis = db.query(VisitorRecord).count()
        if existing_vis == 0:
            for item in VISITOR_DATA:
                vis = VisitorRecord(
                    id=uuid.uuid4(),
                    tenant_id=TENANT_ID,
                    fiscal_year=item["fiscalYear"],
                    month=item["month"],
                    visitor_type=item["visitorType"],
                    count=item["count"],
                    destination=item["destination"],
                    revenue_npr=item["revenueNPR"],
                    average_stay_days=item["averageStayDays"],
                    nationality=item["nationality"],
                    notes=item["notes"],
                )
                db.add(vis)
            db.commit()
            print(f"✅ Inserted {len(VISITOR_DATA)} visitor records.")
        else:
            print(f"ℹ️ visitor_records already has {existing_vis} rows.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding cultural/visitor records: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
