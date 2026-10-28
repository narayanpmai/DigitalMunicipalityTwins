import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text, inspect
import urllib.parse

def create_indexes():
    # p5admin is the table owner in PostgreSQL
    admin_url = "postgresql://p5admin:P5_Prod_Secure_Passwd_2026!@127.0.0.1:5432/municipal_twin_db"
    try:
        engine = create_engine(admin_url)
    except Exception:
        from core.database import engine

    insp = inspect(engine)
    index_targets = [
        ('projects', ['tenant_id', 'fiscalYear']),
        ('budgets', ['tenant_id', 'fiscalYear']),
        ('revenues', ['tenant_id', 'fiscalYear']),
        ('darta', ['tenant_id', 'fiscalYear']),
        ('chalani', ['tenant_id', 'fiscalYear']),
        ('procurements', ['tenant_id', 'fiscalYear']),
        ('payments', ['tenant_id', 'fiscalYear']),
        ('household_registries', ['tenant_id', 'wardNumber']),
        ('complaints', ['tenant_id', 'wardNumber']),
        ('schools', ['tenant_id']),
        ('health_facilities', ['tenant_id']),
        ('businesses', ['tenant_id']),
    ]

    created = 0
    with engine.begin() as conn:
        for table, cols in index_targets:
            if not insp.has_table(table):
                print(f"Skipping {table}: table not found")
                continue
            table_cols = [c['name'] for c in insp.get_columns(table)]
            
            # Resolve actual column names if snake_case vs camelCase
            resolved_cols = []
            for col in cols:
                matched = None
                for tc in table_cols:
                    if tc.lower() == col.lower():
                        matched = tc
                        break
                if matched:
                    resolved_cols.append(matched)
                else:
                    print(f"Warning: column {col} not found in {table} (available: {table_cols})")
            
            if len(resolved_cols) == len(cols):
                idx_name = f"idx_{table}_" + "_".join([c.lower() for c in resolved_cols])
                quoted_cols = ", ".join([f'"{c}"' for c in resolved_cols])
                sql = f'CREATE INDEX IF NOT EXISTS {idx_name} ON {table} ({quoted_cols});'
                conn.execute(text(sql))
                print(f"✓ Created index: {idx_name} on {table} ({quoted_cols})")
                created += 1

    print(f"\nSuccessfully verified/created {created} composite indexes for rapid tenant + fiscal year queries!")

if __name__ == '__main__':
    create_indexes()
