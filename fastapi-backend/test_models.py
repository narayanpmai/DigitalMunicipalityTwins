import pkgutil
import importlib
import sys

sys.path.append("/app")
import models
import core.database

for _, module_name, _ in pkgutil.iter_modules(models.__path__):
    try:
        importlib.import_module(f"models.{module_name}")
    except Exception as e:
        print(f"Error importing models.{module_name}: {e}")

print("Total tables in Base.metadata:", len(core.database.Base.metadata.tables))
try:
    core.database.Base.metadata.create_all(bind=core.database.engine)
    print("Base.metadata.create_all SUCCEEDED!")
except Exception as e:
    print("Base.metadata.create_all FAILED:", e)
