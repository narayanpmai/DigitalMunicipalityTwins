"""
Inspect schema of Employment and Labour Bank tables:
employment_labour_bank, employment_labour_demands, employment_projects, employment_work_logs, recruitment_vacancies, recruitment_applications
"""
import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")
DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

tables = [
    'employment_labour_bank', 'employment_labour_demands', 
    'employment_projects', 'employment_work_logs',
    'recruitment_vacancies', 'recruitment_applications'
]

cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
""")
existing_tables = set(r[0] for r in cur.fetchall())

for t in tables:
    if t not in existing_tables:
        print(f"Table {t} does NOT exist.")
        continue
    print("=" * 60)
    print(f"TABLE: {t}")
    cur.execute(f"""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = '{t}'
        ORDER BY ordinal_position;
    """)
    for c in cur.fetchall():
        print(f"  {c[0]:<30} | {c[1]:<22} | Nullable: {c[2]} | Default: {c[3]}")
    
    cur.execute(f"""
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = '{t}';
    """)
    print("  Indexes:")
    for idx in cur.fetchall():
        print(f"    {idx[0]}: {idx[1]}")

cur.close()
conn.close()
