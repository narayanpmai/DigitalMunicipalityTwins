"""
Inspect tables related to Option 18: Digital Governance & Citizen Services
"""
import psycopg2

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

keywords = ['charter', 'badapatra', 'sifaris', 'rti', 'citizen', 'employee', 'staff', 'representative', 'branch', 'service']
query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' 
    ORDER BY table_name;
"""
cur.execute(query)
all_tables = [r[0] for r in cur.fetchall()]

matched = []
for t in all_tables:
    for kw in keywords:
        if kw in t.lower():
            matched.append(t)
            break

print("Matched Tables for Governance & Citizen Services:")
for t in sorted(matched):
    cur.execute(f"SELECT COUNT(*) FROM {t}")
    cnt = cur.fetchone()[0]
    print(f"  - {t:<35} : {cnt} rows")

cur.close()
conn.close()
