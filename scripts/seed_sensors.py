"""
Seed script for Option 23: Smart Utilities, IoT & Environmental Sensors, AI Surveillance
(वातावरण अनुगमन, मौसम, नदी जलस्तर सेन्सर, पहिरो जोखिम सेन्सर, सिसीटिभी निगरानी)
Panchpokhari Thangpal Rural Municipality
"""
import sys
import uuid
import datetime
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("Seeding Option 23: Smart Utilities, IoT & Environmental Sensors, AI Cameras...")

# 1. Clean existing records to replace corrupted/truncated auto-seeded data
cur.execute("TRUNCATE TABLE sensors CASCADE;")
cur.execute("TRUNCATE TABLE ai_cameras CASCADE;")
conn.commit()
print("Cleaned existing sensor and camera records.")

now = datetime.datetime.utcnow()
recent_ping = now - datetime.timedelta(minutes=3)

# -------------------------------------------------------------------------
# 2. SEED sensors (16 IoT Stations across Wards 1 to 8)
# -------------------------------------------------------------------------
sensors_data = [
    # Ward 1: Banskharka
    (
        str(uuid.uuid4()),
        "SEN-W01-RAIN-01",
        "बाँसखर्क किबी पकेट स्वचालित वर्षा मापन केन्द्र (Banskharka Agro Rain Gauge)",
        "rain_gauge",
        "बाँसखर्क किबी स्रोत केन्द्र (वडा नं १)",
        27.8821,
        85.5342,
        34.5,
        "mm",
        80.0,
        "Normal",
        recent_ping,
        now, now
    ),
    (
        str(uuid.uuid4()),
        "SEN-W01-LND-02",
        "बाँसखर्क-मानेखर्क भिरालो जमिन पहिरो पूर्वसूचना सेन्सर (Banskharka Inclinometer)",
        "landslide_motion",
        "मानेखर्क भिरालो खण्ड (वडा नं १)",
        27.8856,
        85.5389,
        0.8,
        "mm/hr",
        5.0,
        "Normal",
        recent_ping,
        now, now
    ),

    # Ward 2: Baruwa
    (
        str(uuid.uuid4()),
        "SEN-W02-RIV-01",
        "बरुवा खोला जलसतह मापन तथा बाढी साइरन (Baruwa Khola River Gauge)",
        "river_level",
        "बरुवा खोला काठेपुल नजिक (वडा नं २)",
        27.9312,
        85.5518,
        1.8,
        "m",
        4.0,
        "Normal",
        recent_ping,
        now, now
    ),
    (
        str(uuid.uuid4()),
        "SEN-W02-AWS-02",
        "बरुवा उच्च पहाडी मौसम केन्द्र (Baruwa AWS Station)",
        "weather_station",
        "बरुवा मानेडाँडा (वडा नं २)",
        27.9345,
        85.5562,
        14.2,
        "°C",
        35.0,
        "Normal",
        recent_ping,
        now, now
    ),

    # Ward 3: Bhotang
    (
        str(uuid.uuid4()),
        "SEN-W03-RAIN-01",
        "भोताङ स्वचालित वर्षा मापन केन्द्र (Bhotang DHM Rain Gauge)",
        "rain_gauge",
        "भोताङ स्वास्थ्य चौकी डाँडा (वडा नं ३)",
        27.9612,
        85.5821,
        52.0,
        "mm",
        100.0,
        "Normal",
        recent_ping,
        now, now
    ),
    (
        str(uuid.uuid4()),
        "SEN-W03-AWS-02",
        "पाँचपोखरी उच्च हिमाली अल्पाइन मौसम केन्द्र (Panchpokhari Alpine AWS 4100m)",
        "weather_station",
        "पाँचपोखरी ताल क्षेत्र, जुगल आधार (वडा नं ३)",
        28.0245,
        85.6189,
        6.4,
        "°C",
        25.0,
        "Normal",
        recent_ping,
        now, now
    ),
    (
        str(uuid.uuid4()),
        "SEN-W03-LND-03",
        "भोताङ-हवेली पहिरो जोखिम इन्क्लिनोमिटर (Bhotang Landslide Sensor)",
        "landslide_motion",
        "हवेली भीर खण्ड (वडा नं ३)",
        27.9715,
        85.5902,
        3.8,
        "mm/hr",
        5.0,
        "Warning",
        recent_ping,
        now, now
    ),

    # Ward 4: Thangpalkot
    (
        str(uuid.uuid4()),
        "SEN-W04-RIV-01",
        "थाङपालकोट खोला जलसतह तथा गेग्रान बहाव सेन्सर (Thangpalkot Stream Radar)",
        "river_level",
        "थाङपालकोट तटबन्ध क्षेत्र (वडा नं ४)",
        27.9145,
        85.5712,
        2.1,
        "m",
        3.8,
        "Normal",
        recent_ping,
        now, now
    ),
    (
        str(uuid.uuid4()),
        "SEN-W04-LND-02",
        "थाङपालकोट गढी भिरालो जमिन विस्थापन सेन्सर (Thangpalkot Motion Sensor)",
        "landslide_motion",
        "प्राचीन गढी फेदी (वडा नं ४)",
        27.9189,
        85.5745,
        0.5,
        "mm/hr",
        4.5,
        "Normal",
        recent_ping,
        now, now
    ),

    # Ward 5: Gunsa
    (
        str(uuid.uuid4()),
        "SEN-W05-RIV-01",
        "गुन्सा सिपाघाट याङ्ग्री खोला बाढी सतर्कता साइरन तथा गेज (Gunsa Flood Siren & Gauge)",
        "river_level",
        "सिपाघाट झोलुङ्गे पुल, याङ्ग्री खोला (वडा नं ५)",
        27.8924,
        85.5912,
        2.9,
        "m",
        4.5,
        "Normal",
        recent_ping,
        now, now
    ),
    (
        str(uuid.uuid4()),
        "SEN-W05-RAIN-02",
        "गुन्सा डाँडा वर्षा मापन केन्द्र (Gunsa Rain Gauge)",
        "rain_gauge",
        "गुन्सा आधारभूत विद्यालय (वडा नं ५)",
        27.8967,
        85.5945,
        28.4,
        "mm",
        75.0,
        "Normal",
        recent_ping,
        now, now
    ),

    # Ward 6: Thangpaldhap
    (
        str(uuid.uuid4()),
        "SEN-W06-RIV-01",
        "मेलम्ची खोला थाङपालधाप पक्की पुल जलसतह राडार सेन्सर (Melamchi Bridge Radar Gauge)",
        "river_level",
        "थाङपालधाप मोटरपुल (वडा नं ६)",
        27.8745,
        85.6021,
        3.4,
        "m",
        5.2,
        "Normal",
        recent_ping,
        now, now
    ),
    (
        str(uuid.uuid4()),
        "SEN-W06-AWS-02",
        "थाङपाल उपत्यका स्वचालित मौसम स्टेसन (Thangpaldhap Valley AWS)",
        "weather_station",
        "थाङपालधाप बजार कृषि केन्द्र (वडा नं ६)",
        27.8768,
        85.6054,
        19.8,
        "°C",
        36.0,
        "Normal",
        recent_ping,
        now, now
    ),

    # Ward 7: Tipeni / Bhotenamlang
    (
        str(uuid.uuid4()),
        "SEN-W07-RIV-01",
        "तिपेनी इन्द्रावती-मेलम्ची दोभान जलसतह सेन्सर (Tipeni Confluence Gauge)",
        "river_level",
        "तिपेनी बजार दोभान किनार (वडा नं ७)",
        27.8612,
        85.6214,
        3.8,
        "m",
        5.5,
        "Normal",
        recent_ping,
        now, now
    ),
    (
        str(uuid.uuid4()),
        "SEN-W07-AWS-02",
        "गाउँपालिका केन्द्रीय मौसम अनुगमन केन्द्र (Tipeni Palika HQ Weather Station)",
        "weather_station",
        "गाउँपालिका प्रशासनिक भवन परिसर (वडा नं ७)",
        27.8645,
        85.6248,
        21.2,
        "°C",
        38.0,
        "Normal",
        recent_ping,
        now, now
    ),

    # Ward 8: Lagarche
    (
        str(uuid.uuid4()),
        "SEN-W08-RIV-01",
        "लागर्चे इन्द्रावती नदी तटीय बाढी पूर्वसूचना प्रणाली (Lagarche Indrawati Radar Gauge)",
        "river_level",
        "लागर्चे बगर तटीय क्षेत्र (वडा नं ८)",
        27.8345,
        85.6412,
        4.1,
        "m",
        6.0,
        "Normal",
        recent_ping,
        now, now
    ),
]

insert_sensor_sql = """
INSERT INTO sensors (
    tenant_id, id, "sensorId", name, type, location, latitude, longitude,
    "lastValue", unit, "dangerThreshold", status, "lastPing", "createdAt", "updatedAt"
) VALUES (
    'panchpokhari', %s, %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s, %s
);
"""

cur.executemany(insert_sensor_sql, sensors_data)
conn.commit()
print(f"Seeded {len(sensors_data)} IoT Environmental & Telemetry Sensors.")

# -------------------------------------------------------------------------
# 3. SEED ai_cameras (12 AI Surveillance & Environmental Monitoring Cameras)
# -------------------------------------------------------------------------
cameras_data = [
    # 1. Palika Main Gate
    (
        str(uuid.uuid4()),
        "CAM-081-W07-01",
        "गाउँपालिका प्रशासनिक भवन मुख्य प्रवेशद्वार (Palika HQ Main Gate AI Camera)",
        "Entrance & Security",
        "तिपेनी गाउँपालिका केन्द्र (वडा नं ७)",
        27.8642,
        85.6245,
        "Active",
        185,
        4820,
        "rtsp://stream.panchpokhari.gov.np:8554/cam01-hq-gate",
        recent_ping,
        now, now
    ),
    # 2. Melamchi River Bridge Feed
    (
        str(uuid.uuid4()),
        "CAM-081-W06-02",
        "थाङपालधाप मेलम्ची खोला पक्की पुल तथा जलसतह निगरानी (Melamchi Bridge Feed)",
        "Flood & River Monitoring",
        "थाङपालधाप मोटरपुल (वडा नं ६)",
        27.8745,
        85.6021,
        "Active",
        42,
        1680,
        "rtsp://stream.panchpokhari.gov.np:8554/cam02-melamchi-bridge",
        recent_ping,
        now, now
    ),
    # 3. Chandeshowri Temple Heritage
    (
        str(uuid.uuid4()),
        "CAM-081-W05-03",
        "चण्डेश्वरी मन्दिर तथा सार्वजनिक चोक निगरानी (Chandeshowri Heritage & Crowd)",
        "Heritage & Crowd Surveillance",
        "चण्डेश्वरी मन्दिर परिसर, गुन्सा (वडा नं ५)",
        27.8942,
        85.5924,
        "Active",
        94,
        3120,
        "rtsp://stream.panchpokhari.gov.np:8554/cam03-chandeshowri",
        recent_ping,
        now, now
    ),
    # 4. Bhotang Hazard Slope Camera
    (
        str(uuid.uuid4()),
        "CAM-081-W03-04",
        "भोताङ पहिरो सम्भावित क्षेत्र तथा पदमार्ग क्यामेरा (Bhotang Hazard Area Camera)",
        "Landslide & Weather",
        "भोताङ भिरालो खण्ड (वडा नं ३)",
        27.9645,
        85.5842,
        "Active",
        28,
        940,
        "rtsp://stream.panchpokhari.gov.np:8554/cam04-bhotang-hazard",
        recent_ping,
        now, now
    ),
    # 5. Banskharka Checkpost
    (
        str(uuid.uuid4()),
        "CAM-081-W01-05",
        "बाँसखर्क कृषि चेकपोस्ट तथा प्रवेशद्वार (Banskharka Agro Checkpost Camera)",
        "Entrance & Security",
        "बाँसखर्क सिमाना चेकपोस्ट (वडा नं १)",
        27.8812,
        85.5312,
        "Active",
        68,
        2240,
        "rtsp://stream.panchpokhari.gov.np:8554/cam05-banskharka-gate",
        recent_ping,
        now, now
    ),
    # 6. Baruwa Heritage Chhorten
    (
        str(uuid.uuid4()),
        "CAM-081-W02-06",
        "बरुवा मानेडाँडा छोर्तेन तथा पदमार्ग क्यामेरा (Baruwa Chhorten & Trail Camera)",
        "Heritage & Crowd Surveillance",
        "बरुवा मानेडाँडा (वडा नं २)",
        27.9324,
        85.5542,
        "Active",
        35,
        1150,
        "rtsp://stream.panchpokhari.gov.np:8554/cam06-baruwa-chhorten",
        recent_ping,
        now, now
    ),
    # 7. Panchpokhari High Camp Gateway
    (
        str(uuid.uuid4()),
        "CAM-081-W03-07",
        "पाँचपोखरी तीर्थस्थल पदमार्ग हवेली बेसक्याम्प क्यामेरा (Panchpokhari Trail Gateway)",
        "Landslide & Weather",
        "हवेली क्याम्प, भोताङ (वडा नं ३)",
        27.9745,
        85.5924,
        "Active",
        54,
        1890,
        "rtsp://stream.panchpokhari.gov.np:8554/cam07-panchpokhari-trail",
        recent_ping,
        now, now
    ),
    # 8. Thangpalkot Heritage Fort Zone
    (
        str(uuid.uuid4()),
        "CAM-081-W04-08",
        "थाङपालकोट प्राचीन गढी तथा विद्यालय चोक (Thangpalkot Fort & School Area)",
        "Heritage & Crowd Surveillance",
        "थाङपालकोट गढी (वडा नं ४)",
        27.9168,
        85.5732,
        "Active",
        72,
        2410,
        "rtsp://stream.panchpokhari.gov.np:8554/cam08-thangpalkot-fort",
        recent_ping,
        now, now
    ),
    # 9. Gunsa Sipaghat Suspended Bridge
    (
        str(uuid.uuid4()),
        "CAM-081-W05-09",
        "गुन्सा सिपाघाट झोलुङ्गे पुल बाढी अनुगमन (Sipaghat Suspended Bridge Camera)",
        "Flood & River Monitoring",
        "सिपाघाट, याङ्ग्री खोला (वडा नं ५)",
        27.8935,
        85.5918,
        "Active",
        49,
        1520,
        "rtsp://stream.panchpokhari.gov.np:8554/cam09-sipaghat-bridge",
        recent_ping,
        now, now
    ),
    # 10. Thangpaldhap Commercial Market
    (
        str(uuid.uuid4()),
        "CAM-081-W06-10",
        "थाङपालधाप मुख्य बजार तथा व्यापारिक केन्द्र (Thangpaldhap Market Hub)",
        "Entrance & Security",
        "थाङपालधाप बजार चोक (वडा नं ६)",
        27.8756,
        85.6042,
        "Active",
        164,
        5280,
        "rtsp://stream.panchpokhari.gov.np:8554/cam10-thangpaldhap-market",
        recent_ping,
        now, now
    ),
    # 11. Tipeni Sports Stadium & Park
    (
        str(uuid.uuid4()),
        "CAM-081-W07-11",
        "तिपेनी खेलमैदान तथा नागरिक पार्क क्यामेरा (Tipeni Stadium & Civic Park)",
        "Heritage & Crowd Surveillance",
        "तिपेनी खेलमैदान (वडा नं ७)",
        27.8624,
        85.6231,
        "Maintenance",
        12,
        840,
        "rtsp://stream.panchpokhari.gov.np:8554/cam11-tipeni-stadium",
        now - datetime.timedelta(hours=6),
        now, now
    ),
    # 12. Lagarche Indrawati Riverbank
    (
        str(uuid.uuid4()),
        "CAM-081-W08-12",
        "लागर्चे इन्द्रावती नदी तटीय तटबन्ध तथा बगर क्यामेरा (Lagarche Riverbank Camera)",
        "Flood & River Monitoring",
        "लागर्चे बगर (वडा नं ८)",
        27.8356,
        85.6421,
        "Active",
        38,
        1340,
        "rtsp://stream.panchpokhari.gov.np:8554/cam12-lagarche-riverbank",
        recent_ping,
        now, now
    )
]

insert_camera_sql = """
INSERT INTO ai_cameras (
    tenant_id, id, "cameraId", name, type, location, latitude, longitude,
    status, "todayVisitorCount", "totalVisitorCount", "streamUrl", "lastPing", "createdAt", "updatedAt"
) VALUES (
    'panchpokhari', %s, %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s, %s
);
"""

cur.executemany(insert_camera_sql, cameras_data)
conn.commit()
print(f"Seeded {len(cameras_data)} AI Surveillance & Environmental Cameras.")

cur.close()
conn.close()
print("Option 23 IoT Sensor & Camera seeding completed successfully!")
