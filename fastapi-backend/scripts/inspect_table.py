import sys
from core.database import engine
from sqlalchemy import text

table_name = sys.argv[1] if len(sys.argv) > 1 else 'esrv_payments'

with engine.connect() as conn:
    cols = conn.execute(text(f"""
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = '{table_name}' 
        ORDER BY ordinal_position
    """)).fetchall()
    print(f"=== Columns for {table_name} ===")
    for c in cols:
        print(c)
