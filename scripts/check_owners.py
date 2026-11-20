import sys
sys.path.insert(0, 'fastapi-backend')
from core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
res = db.execute(text("""
    SELECT tablename, tableowner 
    FROM pg_tables 
    WHERE tablename LIKE '%recruitment%';
"""))
for r in res:
    print(r)
db.close()
