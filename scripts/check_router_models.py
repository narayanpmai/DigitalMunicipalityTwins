import os, glob, re

routers = glob.glob('fastapi-backend/api/routers/*.py')

print(f"{'ROUTER':<25} | {'QUERIED MODELS / TABLES':<50}")
print("-" * 80)

for r in sorted(routers):
    with open(r, 'r', encoding='utf-8') as f:
        content = f.read()
    fname = os.path.basename(r)
    has_tenant = 'TenantContext' in content or 'get_tenant_context' in content or 'get_current_tenant' in content
    if not has_tenant:
        # find db.query(...)
        queries = re.findall(r'db\.query\(([A-Za-z0-9_]+)\)', content)
        unique_models = sorted(list(set(queries)))
        print(f"{fname:<25} | {', '.join(unique_models[:5])}")
