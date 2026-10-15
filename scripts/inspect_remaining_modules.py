"""
Inspect row counts for remaining modules: complaints, cooperatives, assets, library, camera, sensor, audit_logs
"""
import psycopg2

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

tables = [
    'complaints', 'cooperatives', 'assets', 'library_books', 'library_members',
    'cameras', 'sensors', 'sensor_readings', 'audit_logs', 'notifications'
]

cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
""")
existing_tables = set(r[0] for r in cur.fetchall())

print("Remaining Candidates Status:")
for t in tables:
    if t in existing_tables:
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        cnt = cur.fetchone()[0]
        print(f"  - {t:<25} : {cnt} rows")
    else:
        print(f"  - {t:<25} : [NOT FOUND IN DB]")

cur.close()
conn.close()
