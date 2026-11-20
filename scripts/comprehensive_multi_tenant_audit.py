import sys
sys.path.insert(0, 'fastapi-backend')
from core.database import SessionLocal, engine
from sqlalchemy import inspect, text
import json

def run_audit():
    insp = inspect(engine)
    tables = sorted(insp.get_table_names())
    print(f"Total tables in database: {len(tables)}")
    
    db = SessionLocal()
    
    # 1. Inspect users and tenants
    print("\n" + "="*80)
    print("1. USERS & TENANTS AUDIT")
    print("="*80)
    try:
        users = db.execute(text('SELECT id, email, "fullName", role, tenant_id FROM users ORDER BY tenant_id, "fullName"')).fetchall()
        print(f"Total Users: {len(users)}")
        tenant_user_counts = {}
        for u in users:
            d = dict(u._mapping)
            t = d.get('tenant_id') or 'NULL'
            tenant_user_counts[t] = tenant_user_counts.get(t, 0) + 1
            if 'Ranjit' in str(d.get('fullName')) or t == 'gaushala' or 'gaushala' in str(d.get('email')):
                print(f"  -> Gaushala user: {d}")
        print(f"User counts by tenant: {tenant_user_counts}")
    except Exception as e:
        print(f"Error reading users: {e}")

    # 2. Inspect all tables for tenant_id and data counts
    print("\n" + "="*80)
    print("2. DATABASE TABLES & TENANT_ID COVERAGE AUDIT")
    print("="*80)
    
    table_stats = []
    tables_without_tenant_id = []
    tables_with_null_tenant_id = []
    tables_with_data = []

    for t in tables:
        cols = [c['name'] for c in insp.get_columns(t)]
        has_tenant = 'tenant_id' in cols
        
        try:
            total_count = db.execute(text(f'SELECT count(*) FROM "{t}"')).scalar()
        except Exception:
            total_count = -1
            
        stat = {
            "table": t,
            "has_tenant_id": has_tenant,
            "total_rows": total_count,
            "tenant_breakdown": {}
        }
        
        if total_count > 0:
            tables_with_data.append(t)
            if has_tenant:
                try:
                    breakdown = db.execute(text(f'SELECT COALESCE(tenant_id, \'NULL\') as tid, count(*) FROM "{t}" GROUP BY tenant_id')).fetchall()
                    stat["tenant_breakdown"] = {r[0]: r[1] for r in breakdown}
                    if 'NULL' in stat["tenant_breakdown"]:
                        tables_with_null_tenant_id.append((t, stat["tenant_breakdown"]['NULL'], total_count))
                except Exception as e:
                    stat["tenant_breakdown"] = {"error": str(e)}
            else:
                tables_without_tenant_id.append((t, total_count))
        elif not has_tenant:
            tables_without_tenant_id.append((t, 0))
            
        table_stats.append(stat)

    print(f"\nTotal tables with data (>0 rows): {len(tables_with_data)}")
    print(f"Tables WITH tenant_id but having NULL tenant_id rows: {len(tables_with_null_tenant_id)}")
    for t, null_cnt, tot in tables_with_null_tenant_id:
        print(f"  [NULL TENANT LEAK RISK] {t}: {null_cnt} / {tot} rows have tenant_id = NULL")

    print(f"\nTables WITHOUT tenant_id that HAVE data: {len([x for x in tables_without_tenant_id if x[1] > 0])}")
    for t, tot in [x for x in tables_without_tenant_id if x[1] > 0]:
        print(f"  [MISSING TENANT_ID] {t}: {tot} rows")

    # Save detailed JSON report
    with open('scripts/db_audit_inventory.json', 'w', encoding='utf-8') as f:
        json.dump(table_stats, f, indent=2, ensure_ascii=False)
    print("\nDetailed audit report saved to scripts/db_audit_inventory.json")

    db.close()

if __name__ == '__main__':
    run_audit()
