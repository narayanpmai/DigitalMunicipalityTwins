import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from core.database import engine

def migrate():
    with engine.connect() as conn:
        queries = [
            'ALTER TABLE chalani ADD COLUMN IF NOT EXISTS "sourceModule" character varying;',
            'ALTER TABLE chalani ADD COLUMN IF NOT EXISTS "sourceRecordId" character varying;',
            'ALTER TABLE chalani ADD COLUMN IF NOT EXISTS "sourceTitle" character varying;',
            'ALTER TABLE chalani ADD COLUMN IF NOT EXISTS "letterType" character varying;',
            'ALTER TABLE chalani ADD COLUMN IF NOT EXISTS "metadataJson" text;',
            'CREATE INDEX IF NOT EXISTS idx_chalani_source ON chalani ("sourceModule", "sourceRecordId");',
            'CREATE INDEX IF NOT EXISTS idx_chalani_dispatch_fy ON chalani ("fiscalYear", "dispatchNo");',
        ]
        for q in queries:
            conn.execute(text(q))
            print("Executed:", q)
        conn.commit()
    print("Chalani table migration completed successfully!")

if __name__ == '__main__':
    migrate()
