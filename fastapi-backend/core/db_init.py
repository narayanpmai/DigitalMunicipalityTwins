import pkgutil
import importlib
import logging
from sqlalchemy import inspect, text
from core.database import Base, engine
import models

logger = logging.getLogger("uvicorn.error")

def init_and_sync_db():
    """
    Dynamically loads all model modules, ensures all tables exist,
    and automatically synchronizes any missing columns on existing tables.
    """
    # 1. Discover and load all model files
    for _, module_name, _ in pkgutil.iter_modules(models.__path__):
        try:
            importlib.import_module(f"models.{module_name}")
        except Exception as e:
            logger.warning(f"Could not load models.{module_name}: {e}")

    # 2. Create any missing tables
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"Base.metadata.create_all failed: {e}")

    # 3. Add any missing columns on existing tables
    try:
        inspector = inspect(engine)
        existing_tables = set(inspector.get_table_names())
        with engine.begin() as conn:
            for table_name, table in Base.metadata.tables.items():
                if table_name in existing_tables:
                    existing_cols = {col['name'] for col in inspector.get_columns(table_name)}
                    for col in table.columns:
                        if col.name not in existing_cols:
                            col_type = col.type.compile(dialect=engine.dialect)
                            stmt = f'ALTER TABLE "{table_name}" ADD COLUMN IF NOT EXISTS "{col.name}" {col_type};'
                            try:
                                conn.execute(text(stmt))
                                logger.info(f"Auto-added missing column: {table_name}.{col.name}")
                            except Exception as col_err:
                                logger.warning(f"Could not auto-add column {table_name}.{col.name}: {col_err}")
    except Exception as e:
        logger.warning(f"Schema sync encountered error: {e}")
