import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

tables = [
    "waste_vehicles",
    "waste_rates",
    "waste_schedules",
    "waste_disposal_sites",
    "waste_sanitation_workers",
    "waste_alerts",
    "waste_wallets",
    "waste_transactions"
]

print("Checking Foreign Key constraints:")
for t in tables:
    cur.execute(f"""
        SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='{t}';
    """)
    fks = cur.fetchall()
    if fks:
        print(f"Table '{t}' FKs: {fks}")
    else:
        print(f"Table '{t}' has NO foreign key constraints.")

cur.close()
conn.close()
