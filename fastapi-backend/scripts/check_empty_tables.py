from core.database import engine
from sqlalchemy import text

def check():
    with engine.connect() as conn:
        tables = [r[0] for r in conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).fetchall()]
        empty = []
        for t in tables:
            cnt = conn.execute(text(f'SELECT COUNT(*) FROM "{t}"')).scalar()
            if cnt == 0:
                empty.append(t)
        print(f"Total tables: {len(tables)}, Empty tables: {len(empty)}")
        print("Empty table list:", empty)

if __name__ == "__main__":
    check()
