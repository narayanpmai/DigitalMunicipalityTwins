import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()

tables = [
    'disaster_events',
    'shelters',
    'emergency_contacts',
    'disaster_relief_inventory',
    'disaster_relief_funds',
    'vulnerable_settlements',
    'drrm_incidents',
    'drrm_damage_reports',
    'drrm_preparedness_items',
    'drrm_recovery_projects',
    'emergency_broadcasts'
]

for tbl in tables:
    cur.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = %s
        );
    """, (tbl,))
    exists = cur.fetchone()[0]
    print(f"\nTable '{tbl}': Exists={exists}")
    if exists:
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s
            ORDER BY ordinal_position;
        """, (tbl,))
        cols = cur.fetchall()
        for c in cols:
            print(f"    - {c[0]} ({c[1]}, nullable={c[2]})")

cur.close()
conn.close()
