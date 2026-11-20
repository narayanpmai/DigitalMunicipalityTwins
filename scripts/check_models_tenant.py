import os, glob, importlib, sys
sys.path.insert(0, 'fastapi-backend')
from core.database import Base

model_files = glob.glob('fastapi-backend/models/*.py')
for mf in model_files:
    mod_name = os.path.basename(mf)[:-3]
    if mod_name != '__init__':
        try:
            importlib.import_module(f'models.{mod_name}')
        except Exception as e:
            pass

print(f"Total registered SQLAlchemy models in Base.metadata: {len(Base.metadata.tables)}")

tenant_models = []
non_tenant_models = []

for table_name, table in Base.metadata.tables.items():
    cols = [c.name for c in table.columns]
    if 'tenant_id' in cols:
        tenant_models.append(table_name)
    else:
        non_tenant_models.append(table_name)

print(f"\nTables with tenant_id defined ({len(tenant_models)}):")
print(f"Tables WITHOUT tenant_id defined ({len(non_tenant_models)}):")
for t in sorted(non_tenant_models):
    print(f"  - {t}")
