import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")
DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("--- Current SENSORS ---")
cur.execute('SELECT "sensorId", name, type, location, "lastValue", unit, status FROM sensors')
for r in cur.fetchall():
    print(r)

print("\n--- Current AI_CAMERAS ---")
cur.execute('SELECT "cameraId", name, type, location, status, "todayVisitorCount", "totalVisitorCount" FROM ai_cameras')
for r in cur.fetchall():
    print(r)

cur.close()
conn.close()
