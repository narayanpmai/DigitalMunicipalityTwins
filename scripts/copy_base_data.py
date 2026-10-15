import psycopg

src_conn = psycopg.connect("host=127.0.0.1 port=5432 user=p5admin password=P5_Prod_Secure_Passwd_2026! dbname=p5digital")
dst_conn = psycopg.connect("host=127.0.0.1 port=5432 user=p5admin password=P5_Prod_Secure_Passwd_2026! dbname=municipal_twin_db")

tables_to_copy = ["tenants", "roles", "users", "mdm_wards", "branches", "municipality_profile", "system_settings"]

src_cur = src_conn.cursor()
dst_cur = dst_conn.cursor()

for t in tables_to_copy:
    try:
        # Get common columns
        src_cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{t}';")
        src_cols = set(r[0] for r in src_cur.fetchall())
        
        dst_cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{t}';")
        dst_cols = set(r[0] for r in dst_cur.fetchall())
        
        common_cols = list(src_cols.intersection(dst_cols))
        if not common_cols:
            print(f"Skipping {t}: no common columns")
            continue
            
        cols_str = ", ".join([f'"{c}"' for c in common_cols])
        placeholders = ", ".join(["%s"] * len(common_cols))
        
        src_cur.execute(f'SELECT {cols_str} FROM "{t}";')
        rows = src_cur.fetchall()
        
        insert_query = f'INSERT INTO "{t}" ({cols_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING;'
        dst_cur.executemany(insert_query, rows)
        dst_conn.commit()
        print(f"Successfully copied {len(rows)} rows into {t}")
    except Exception as e:
        dst_conn.rollback()
        print(f"Error copying {t}: {e}")

src_conn.close()
dst_conn.close()
print("Done seeding municipal_twin_db!")
