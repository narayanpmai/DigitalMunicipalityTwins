import os
import sys
import time
import json
import collections
import psycopg2
from psycopg2.extras import execute_batch
import pyogrio.raw
import pyproj
from shapely import from_wkb, to_geojson
from shapely.ops import transform

GDB_PATH = r"C:\Users\UNepal\OneDrive\Panchpokhari offce\ToPachpakhoriLocalLevel\01Data\Geodatabase\SINDHUPALCHOK_PKG_09_MUTM_87.gdb"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "fastapi-backend", "data")
os.makedirs(OUT_DIR, exist_ok=True)

def sqm_to_ropani_str(sqm: float) -> str:
    if not sqm or sqm <= 0:
        return "० रोपनी"
    ropani_sqm = 508.72
    aana_sqm = 31.795
    paisa_sqm = 7.94875
    daam_sqm = 1.9871875
    
    ropani = int(sqm // ropani_sqm)
    rem1 = sqm % ropani_sqm
    aana = int(rem1 // aana_sqm)
    rem2 = rem1 % aana_sqm
    paisa = int(rem2 // paisa_sqm)
    rem3 = rem2 % paisa_sqm
    daam = round(rem3 / daam_sqm, 1)
    
    parts = []
    if ropani > 0:
        parts.append(f"{ropani:,} रोपनी")
    if aana > 0:
        parts.append(f"{aana} आना")
    if paisa > 0:
        parts.append(f"{paisa} पैसा")
    if daam > 0 and len(parts) < 3:
        parts.append(f"{daam} दाम")
    if not parts:
        parts.append(f"{daam} दाम")
    return " ".join(parts)


def run():
    print(f"Reading Cadastre from GDB: {GDB_PATH}")
    if not os.path.exists(GDB_PATH):
        print(f"Error: Path {GDB_PATH} not found!")
        sys.exit(1)

    # 1. Connect to PostgreSQL
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "5433")),
        user=os.getenv("DB_USER", "p5admin"),
        password=os.getenv("DB_PASSWORD", "P5Digital@2024!"),
        dbname=os.getenv("DB_NAME", "p5digital")
    )
    cur = conn.cursor()
    print("Connected to PostgreSQL successfully.")

    # Create table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS gis_cadastre_parcels (
        id VARCHAR PRIMARY KEY,
        tenant_id VARCHAR DEFAULT 'panchpokhari',
        parcel_key VARCHAR(100),
        parcel_no VARCHAR(50) NOT NULL,
        ward_no INTEGER NOT NULL,
        grid_sheet VARCHAR(50),
        parcel_type VARCHAR(50),
        area_sqm DOUBLE PRECISION DEFAULT 0.0,
        area_ropani_str VARCHAR(100),
        zoning VARCHAR(50),
        landuse VARCHAR(100),
        center_lat DOUBLE PRECISION,
        center_lng DOUBLE PRECISION,
        min_lat DOUBLE PRECISION,
        max_lat DOUBLE PRECISION,
        min_lng DOUBLE PRECISION,
        max_lng DOUBLE PRECISION,
        geojson_geometry JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_cadastre_ward_pno ON gis_cadastre_parcels(ward_no, parcel_no);
    CREATE INDEX IF NOT EXISTS idx_cadastre_pno ON gis_cadastre_parcels(parcel_no);
    CREATE INDEX IF NOT EXISTS idx_cadastre_ward ON gis_cadastre_parcels(ward_no);
    CREATE INDEX IF NOT EXISTS idx_cadastre_bbox ON gis_cadastre_parcels(min_lat, max_lat, min_lng, max_lng);
    """)
    conn.commit()

    # Read Cadastre layer
    t0 = time.time()
    meta, idx, geom, fields = pyogrio.raw.read(GDB_PATH, layer='Cadastre')
    total_count = len(geom)
    print(f"Loaded {total_count} raw cadastral features in {time.time() - t0:.2f}s")

    crs_src = pyproj.CRS.from_wkt(meta['crs'])
    crs_dst = pyproj.CRS.from_epsg(4326)
    proj = pyproj.Transformer.from_crs(crs_src, crs_dst, always_xy=True).transform

    fnames = list(meta['fields'])
    pkey_idx = fnames.index('PARCELKEY') if 'PARCELKEY' in fnames else -1
    pno_idx = fnames.index('PARCELNO')
    wno_idx = fnames.index('WARDNO')
    grid_idx = fnames.index('GRIDS1') if 'GRIDS1' in fnames else -1
    ptype_idx = fnames.index('PARCELTY') if 'PARCELTY' in fnames else -1
    shape_area_idx = fnames.index('Shape_Area') if 'Shape_Area' in fnames else -1
    lu_idx = fnames.index('Landuse') if 'Landuse' in fnames else -1
    zoning_idx = fnames.index('Zoning') if 'Zoning' in fnames else -1

    # Clear previous parcels for clean import
    cur.execute("TRUNCATE TABLE gis_cadastre_parcels;")
    conn.commit()

    insert_sql = """
    INSERT INTO gis_cadastre_parcels (
        id, tenant_id, parcel_key, parcel_no, ward_no, grid_sheet,
        parcel_type, area_sqm, area_ropani_str, zoning, landuse,
        center_lat, center_lng, min_lat, max_lat, min_lng, max_lng,
        geojson_geometry
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    batch = []
    batch_size = 2000
    ward_counts = collections.Counter()
    total_area_sqm = 0.0

    print("Transforming and inserting parcels into PostgreSQL...")
    t_start = time.time()
    
    for i in range(total_count):
        try:
            g = from_wkb(geom[i])
            g_wgs = transform(proj, g)
            # Simplify slightly for high web performance while retaining exact parcel boundaries
            g_simp = g_wgs.simplify(0.000015, preserve_topology=True)
            g_json = json.loads(to_geojson(g_simp))
        except Exception:
            continue

        pno = str(fields[pno_idx][i]).strip()
        try:
            wno = int(fields[wno_idx][i])
        except (ValueError, TypeError):
            wno = 1

        ward_counts[wno] += 1

        area_sqm = float(fields[shape_area_idx][i]) if shape_area_idx >= 0 else 0.0
        total_area_sqm += area_sqm
        ropani = sqm_to_ropani_str(area_sqm)
        c = g_wgs.centroid
        b = g_wgs.bounds

        pkey = str(fields[pkey_idx][i]) if pkey_idx >= 0 else ""
        gsheet = str(fields[grid_idx][i]) if grid_idx >= 0 else ""
        ptype = str(fields[ptype_idx][i]) if ptype_idx >= 0 else ""
        zoning = str(fields[zoning_idx][i]) if zoning_idx >= 0 else ""
        lu = str(fields[lu_idx][i]) if lu_idx >= 0 else ""

        row_id = f"cp-{wno}-{pno}-{i}"
        batch.append((
            row_id, "panchpokhari", pkey, pno, wno, gsheet,
            ptype, area_sqm, ropani, zoning, lu,
            c.y, c.x, b[1], b[3], b[0], b[2],
            json.dumps(g_json)
        ))

        if len(batch) >= batch_size:
            execute_batch(cur, insert_sql, batch)
            conn.commit()
            batch = []
            print(f"  Inserted {i+1}/{total_count} parcels... ({((i+1)/total_count*100):.1f}%)")

    if batch:
        execute_batch(cur, insert_sql, batch)
        conn.commit()
        print(f"  Inserted final batch. Total inserted: {total_count} parcels.")

    # Save summary JSON for fast front-end retrieval
    summary_data = {
        "gdb_path": GDB_PATH,
        "projection": "Nepal_Nagarkot_TM_87",
        "central_meridian": 87,
        "datum": "Nepal 1981 / Everest 1830",
        "total_parcels": total_count,
        "total_area_sqm": total_area_sqm,
        "total_area_ha": round(total_area_sqm / 10000.0, 2),
        "total_area_ropani": sqm_to_ropani_str(total_area_sqm),
        "ward_distribution": [
            {"ward_no": w, "parcel_count": c}
            for w, c in sorted(ward_counts.items())
        ]
    }
    summary_path = os.path.join(OUT_DIR, "cadastre_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary_data, f, ensure_ascii=False, indent=2)

    print(f"\nCadastre import completed successfully in {time.time() - t_start:.2f}s!")
    print(f"Summary written to: {summary_path}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    run()
