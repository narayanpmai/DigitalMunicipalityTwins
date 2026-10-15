import pkgutil
import importlib
import sys
from sqlalchemy import inspect, text

import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import models
import core.database

# Import all models
for _, m, _ in pkgutil.iter_modules(models.__path__):
    try:
        importlib.import_module(f"models.{m}")
    except Exception as e:
        print(f"Error importing models.{m}: {e}")

engine = core.database.engine
Base = core.database.Base

# 1. Create any missing tables first
print("Creating any missing tables...")
Base.metadata.create_all(bind=engine)

# 2. Inspect existing tables and columns
inspector = inspect(engine)
existing_tables = set(inspector.get_table_names())

alter_statements = []

for table_name, table in Base.metadata.tables.items():
    if table_name in existing_tables:
        existing_cols = {col['name'] for col in inspector.get_columns(table_name)}
        for col in table.columns:
            if col.name not in existing_cols:
                # Compile type for PostgreSQL
                col_type = col.type.compile(dialect=engine.dialect)
                stmt = f'ALTER TABLE "{table_name}" ADD COLUMN IF NOT EXISTS "{col.name}" {col_type};'
                alter_statements.append((table_name, col.name, stmt))

print(f"Total missing columns to add: {len(alter_statements)}")

with engine.begin() as conn:
    for table_name, col_name, stmt in alter_statements:
        try:
            conn.execute(text(stmt))
            print(f"  + Added column {table_name}.{col_name}")
        except Exception as e:
            print(f"  ! Error on {stmt}: {e}")

print("Schema synchronization complete!")
