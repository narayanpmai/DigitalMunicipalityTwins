import sys
sys.path.insert(0, 'fastapi-backend')
from core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
users = db.execute(text('SELECT id, email, "fullName", role, tenant_id, "isActive" FROM users ORDER BY tenant_id, role, "fullName"')).fetchall()
print(f"Total users: {len(users)}\n")
print(f"{'TENANT_ID':<38} | {'ROLE':<15} | {'EMAIL':<32} | {'FULL NAME'}")
print("-" * 115)
for u in users:
    d = dict(u._mapping)
    tid = str(d['tenant_id'] or 'NULL')
    print(f"{tid:<38} | {d['role']:<15} | {d['email']:<32} | {d['fullName']}")
db.close()
