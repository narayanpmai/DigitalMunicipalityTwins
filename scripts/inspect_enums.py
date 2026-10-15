"""
Inspect enum types for citizen_services and other Option 18 tables
"""
import psycopg2

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute("""
    SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder)
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    GROUP BY t.typname
    ORDER BY t.typname;
""")
for r in cur.fetchall():
    print(f"{r[0]}: {r[1]}")

cur.close()
conn.close()
