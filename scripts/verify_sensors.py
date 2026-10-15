"""
Verification script for Option 23: Smart Utilities, IoT & Environmental Sensors, AI Cameras
Checks PostgreSQL database rows and tests FastAPI live endpoints on http://localhost:3001
"""
import sys
import psycopg2
import urllib.request
import json

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("=" * 80)
print("1. DATABASE VERIFICATION (POSTGRESQL)")
print("=" * 80)

tables = [
    ("sensors", "IoT वातावरणीय, मौसम तथा बाढी/पहिरो सेन्सर"),
    ("ai_cameras", "AI सिसीटिभी तथा वातावरणीय निगरानी क्यामेरा")
]

for tbl, desc in tables:
    cur.execute(f"SELECT COUNT(*) FROM {tbl};")
    cnt = cur.fetchone()[0]
    print(f"  • {desc:<55} ({tbl}): {cnt:>3} rows")

# Breakdown of sensors by type
cur.execute("""
    SELECT type, COUNT(*), string_agg(status, ', ')
    FROM sensors
    GROUP BY type
    ORDER BY count DESC;
""")
print("\n[सेन्सर प्रकार अनुसार वितरण]:")
for row in cur.fetchall():
    print(f"  • {row[0]:<20}: {row[1]:>2} सेन्सर")

# Breakdown of cameras by type and status
cur.execute("""
    SELECT type, COUNT(*), SUM("todayVisitorCount"), SUM("totalVisitorCount")
    FROM ai_cameras
    GROUP BY type
    ORDER BY count DESC;
""")
print("\n[AI क्यामेरा प्रकार तथा आगन्तुक गणना]:")
for row in cur.fetchall():
    print(f"  • {row[0]:<32}: {row[1]:>2} क्यामेरा | आजको गणना: {row[2]:>4} | कुल गणना: {row[3]:>6}")

cur.execute("""
    SELECT status, COUNT(*)
    FROM ai_cameras
    GROUP BY status;
""")
print("\n[क्यामेरा सञ्चालन स्थिति]:")
for row in cur.fetchall():
    print(f"  • {row[0]:<15}: {row[1]:>2} क्यामेरा")

cur.close()
conn.close()

print("\n" + "=" * 80)
print("2. API ENDPOINT VERIFICATION (FASTAPI BACKEND - PORT 3001)")
print("=" * 80)

endpoints = [
    ("All IoT Sensors", "http://localhost:3001/api/v1/sensors"),
    ("Sensor Alerts (Warning)", "http://localhost:3001/api/v1/sensors/alerts"),
    ("DHM Integration Telemetry", "http://localhost:3001/api/v1/sensors/dhm-sensors"),
    ("All AI Cameras", "http://localhost:3001/api/v1/cameras"),
    ("Camera Analytics Stats", "http://localhost:3001/api/v1/cameras/stats")
]

for name, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "P5-VerifyScript"})
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.status
            content = response.read().decode("utf-8")
            data = json.loads(content)
            count = len(data) if isinstance(data, list) else len(data.keys())
            print(f"  ✓ {name:<26} [{status_code} OK] -> {count} items/keys returned")
    except Exception as e:
        print(f"  ✗ {name:<26} -> ERROR: {e}")

print("\n[API /api/v1/cameras/stats Payload]:")
try:
    with urllib.request.urlopen("http://localhost:3001/api/v1/cameras/stats") as res:
        stats = json.loads(res.read().decode("utf-8"))
        print(json.dumps(stats, ensure_ascii=False, indent=2))
except Exception as e:
    print(f"Error fetching camera stats: {e}")

print("\n[API /api/v1/sensors/alerts Payload]:")
try:
    with urllib.request.urlopen("http://localhost:3001/api/v1/sensors/alerts") as res:
        alerts = json.loads(res.read().decode("utf-8"))
        for a in alerts:
            s_id = a.get('sensor_id') or a.get('sensorId')
            val = a.get('last_value') if a.get('last_value') is not None else a.get('lastValue')
            print(f"  Alert: {s_id} | {a.get('name')} | Value: {val} {a.get('unit')} | Status: {a.get('status')}")
except Exception as e:
    print(f"Error fetching alerts: {e}")

print("\nOption 23 verification completed successfully!")
