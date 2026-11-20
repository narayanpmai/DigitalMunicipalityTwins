import json

with open('scripts/db_audit_inventory.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"{'TABLE NAME':<35} | {'TOTAL':<6} | {'HAS_TENANT':<10} | {'BREAKDOWN'}")
print("-" * 90)
for d in data:
    if d['total_rows'] > 0:
        print(f"{d['table']:<35} | {d['total_rows']:<6} | {str(d['has_tenant_id']):<10} | {d['tenant_breakdown']}")
