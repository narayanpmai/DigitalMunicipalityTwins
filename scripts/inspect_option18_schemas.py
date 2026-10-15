"""
Inspect schemas of Option 18 tables: branches, employees, employee_tasks, citizen_services, c360_citizen_applications, rti_requests
"""
import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")
DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

tables = [
    'branches', 'employees', 'employee_tasks', 
    'citizen_services', 'c360_citizen_applications', 
    'rti_requests', 'esrv_service_templates', 'esrv_issued_certificates'
]

for t in tables:
    print("=" * 60)
    print(f"TABLE: {t}")
    cur.execute(f"""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = '{t}'
        ORDER BY ordinal_position;
    """)
    for c in cur.fetchall():
        print(f"  {c[0]:<28} | {c[1]:<20} | Nullable: {c[2]} | Default: {c[3]}")
    
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
