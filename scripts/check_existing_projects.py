import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

print("Existing rows in 'projects':")
cur.execute('SELECT id, "projectCode", name, "wardNumber", sector, status, budget, "agreementStatus" FROM projects;')
for r in cur.fetchall():
    print(f"  [{r[0]}] {r[1]} - {r[2]} (Ward {r[3]}, {r[4]}): {r[5]} | Budget: {r[6]} | Agr: {r[7]}")

print("\nExisting rows in 'proj_plan_proposals':")
cur.execute('SELECT id, fiscal_year, ward_id, title, estimated_cost, status FROM proj_plan_proposals;')
for r in cur.fetchall():
    print(f"  [{r[0]}] FY: {r[1]}, Ward: {r[2]} | {r[3]} | Cost: {r[4]} | Status: {r[5]}")

print("\nExisting rows in 'proj_executions':")
cur.execute('SELECT id, contract_id, project_code, physical_progress_percent, financial_progress_percent FROM proj_executions;')
for r in cur.fetchall():
    print(f"  [{r[0]}] Code: {r[2]}, Physical: {r[3]}%, Financial: {r[4]}%")

cur.close()
conn.close()
