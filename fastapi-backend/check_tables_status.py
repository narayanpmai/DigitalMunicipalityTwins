from core.database import engine
from sqlalchemy import inspect, text

insp = inspect(engine)
empty = []
populated = []

with engine.connect() as conn:
    for t in sorted(insp.get_table_names()):
        try:
            cnt = conn.execute(text(f'SELECT COUNT(*) FROM "{t}"')).scalar()
            if cnt == 0:
                empty.append(t)
            else:
                populated.append((t, cnt))
        except Exception as e:
            empty.append(f"{t} ({e})")

print(f"Total tables: {len(insp.get_table_names())}")
print(f"Populated Tables ({len(populated)}):")
for t, c in populated:
    print(f"  {t}: {c}")

print(f"\nEmpty Tables ({len(empty)}):")
for t in empty:
    print(f"  {t}")
