from core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    res = conn.execute(text("""
        SELECT t.typname, e.enumlabel 
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        ORDER BY t.typname, e.enumsortorder;
    """)).fetchall()
    
    enums = {}
    for r in res:
        tname, elabel = r[0], r[1]
        enums.setdefault(tname, []).append(elabel)
        
    for k, v in enums.items():
        print(f"{k}: {v}")
