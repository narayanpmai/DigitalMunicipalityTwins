from core.database import engine
from sqlalchemy import text

with engine.connect() as c:
    r = c.execute(text("""
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'indicators' 
        ORDER BY ordinal_position
    """))
    print("=== indicators table columns ===")
    for row in r.fetchall():
        print(row)
