import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()

cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
""")
all_tables = [r[0] for r in cur.fetchall()]
print(f"Total tables in public schema: {len(all_tables)}")

# Filter for anything that could be DRRM, environment, early warning, resources
keywords = ['disaster', 'drr', 'incident', 'emergency', 'relief', 'hazard', 'weather', 'shelter', 'alert', 'fire', 'flood', 'landslide', 'rescue']
matched = [t for t in all_tables if any(k in t.lower() for k in keywords)]
print(f"\nMatched tables for Disaster & DRRM ({len(matched)}):")
for t in matched:
    cur.execute(f'SELECT count(*) FROM "{t}"')
    print(f"  - {t}: {cur.fetchone()[0]} rows")

cur.close()
conn.close()
