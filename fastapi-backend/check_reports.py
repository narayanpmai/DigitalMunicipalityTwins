from core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
res = db.execute(text('SELECT count(*), "moduleTitleNepali" FROM progress_indicator_records GROUP BY "moduleTitleNepali"')).fetchall()
for row in res:
    print(row)
db.close()
