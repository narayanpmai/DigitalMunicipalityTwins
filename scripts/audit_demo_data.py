import sys
sys.path.insert(0, 'fastapi-backend')
from core.database import SessionLocal
from sqlalchemy import text
import json

db = SessionLocal()

print("="*80)
print("DEMO / TEST RECORDS AUDIT IN 26 ACTIVE TABLES")
print("="*80)

# 1. Inspect recruitment_applications
print("\n--- 1. recruitment_applications (6 rows) ---")
apps = db.execute(text("SELECT id, application_no, full_name_np, full_name_en, citizenship_no, contact_phone, status, payment_status, tenant_id FROM recruitment_applications ORDER BY application_no")).fetchall()
for a in apps:
    d = dict(a._mapping)
    is_demo = any(term in str(d).lower() for term in ['नमुना', 'परीक्षण', 'test', 'demo', 'sample', 'अडिट'])
    flag = "[DEMO/TEST]" if is_demo else "[REAL CANDIDATE]"
    print(f"  {flag} {d['application_no']}: {d['full_name_np']} ({d['full_name_en']}) | phone: {d['contact_phone']} | status: {d['status']} | pay: {d['payment_status']} | tenant: {d['tenant_id']}")

# 2. Inspect recruitment_vacancies
print("\n--- 2. recruitment_vacancies (2 rows) ---")
vacs = db.execute(text("SELECT id, vacancy_no, title, level, openings_count, status, tenant_id FROM recruitment_vacancies")).fetchall()
for v in vacs:
    d = dict(v._mapping)
    print(f"  {d['vacancy_no']}: {d['title']} ({d['level']}) openings: {d['openings_count']} | status: {d['status']} | tenant: {d['tenant_id']}")

# 3. Inspect recruitment_payments
print("\n--- 3. recruitment_payments (8 rows) ---")
pays = db.execute(text("SELECT id, application_no, amount, gateway, status, transaction_uuid, created_at FROM recruitment_payments")).fetchall()
for p in pays:
    d = dict(p._mapping)
    print(f"  {d['application_no']}: amount: {d['amount']} | gw: {d['gateway']} | status: {d['status']} | txn: {d['transaction_uuid']}")

# 4. Inspect employees
print("\n--- 4. employees (1 row) ---")
emps = db.execute(text("SELECT * FROM employees")).fetchall()
for e in emps:
    print(dict(e._mapping))

# 5. Inspect users with test/demo flags or emails
print("\n--- 5. users (34 rows) - Test/Demo identification ---")
users = db.execute(text('SELECT id, email, "fullName", role, tenant_id FROM users ORDER BY tenant_id, email')).fetchall()
for u in users:
    d = dict(u._mapping)
    is_test_user = any(term in str(d).lower() for term in ['test', 'demo', 'sample', 'dummy'])
    flag = "[TEST ACCOUNT]" if is_test_user else "[OFFICIAL ACCOUNT]"
    print(f"  {flag} tenant={d['tenant_id'] or 'NULL':<15} | role={d['role']:<15} | email={d['email']:<35} | name={d['fullName']}")

# 6. Check household_registries (5357 rows)
print("\n--- 6. household_registries summary ---")
hh_count = db.execute(text("SELECT count(*) FROM household_registries")).scalar()
hh_wards = db.execute(text("SELECT ward_no, count(*) FROM household_registries GROUP BY ward_no ORDER BY ward_no")).fetchall()
print(f"  Total Household Records: {hh_count}")
print(f"  By Ward: {[dict(w._mapping) for w in hh_wards]}")

db.close()
