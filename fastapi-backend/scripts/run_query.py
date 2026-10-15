import sys
from core.database import engine
from sqlalchemy import text

query = sys.argv[1]

with engine.connect() as conn:
    res = conn.execute(text(query))
    if res.returns_rows:
        rows = res.fetchall()
        print(f"Returned {len(rows)} rows:")
        for r in rows:
            print(dict(r._mapping))
    else:
        conn.commit()
        print("Query executed successfully.")
