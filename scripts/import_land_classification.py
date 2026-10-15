import os
import sys
import json
import uuid
import collections
import psycopg2
from psycopg2.extras import execute_batch
import pyogrio.raw
import pyproj
from shapely import from_wkb, to_geojson
from shapely.ops import transform
from shapely.geometry import mapping, shape

GDB_PATH = r"C:\Users\UNepal\OneDrive\Panchpokhari offce\ToPachpakhoriLocalLevel\01Data\Geodatabase\SINDHUPALCHOK_PKG_09_MUTM_87.gdb"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "fastapi-backend", "data")
os.makedirs(OUT_DIR, exist_ok=True)

ZONE_META = {
    "AGR": {
        "name_np": "कृषि क्षेत्र",
        "name_en": "Agricultural Zone",
        "color": "#16a34a",
        "rules_np": "खाद्यान्न बाली, तरकारी तथा फलफूल खेती, पशुपालन, मौरीपालन, कृषि वन तथा शीतभण्डार प्रयोजन। अनुमति विना गैर-कृषि घडेरीकरण तथा प्लटिङ गर्न पूर्ण प्रतिबन्धित।",
    },
    "RES": {
        "name_np": "आवासीय क्षेत्र",
        "name_en": "Residential Zone",
        "color": "#eab308",
        "rules_np": "व्यक्तिगत तथा सामूहिक आवास, स्थानीय सेवा पसल, हरियाली पार्क तथा सामुदायिक प्रयोजन। भवन निर्माण संहिता (NBC 105:2020) पालना अनिवार्य।",
    },
    "COM": {
        "name_np": "व्यावसायिक क्षेत्र",
        "name_en": "Commercial Zone",
        "color": "#2563eb",
        "rules_np": "व्यापारिक भवन, बजार केन्द्र, होटल, रिसोर्ट, बैङ्क तथा वित्तीय संस्था, सपिङ कम्प्लेक्स तथा सेवा व्यवसाय सञ्चालन।",
    },
    "IND": {
        "name_np": "औद्योगिक क्षेत्र",
        "name_en": "Industrial Zone",
        "color": "#dc2626",
        "rules_np": "साना तथा मझौला उद्योग, प्रशोधन केन्द्र, उत्पादन कारखाना तथा गोदाम। वातावरणीय मापदण्ड (IEE/EIA) तथा प्रदूषण नियन्त्रण अनिवार्य।",
    },
    "MIN": {
        "name_np": "खानी तथा खनिज क्षेत्र",
        "name_en": "Mines & Minerals Zone",
        "color": "#b45309",
        "rules_np": "ढुङ्गा, गिट्टी, बालुवा तथा खनिज उत्खनन कार्य। भू-क्षय तथा वातावरणीय जोखिम न्यूनीकरण योजना अनिवार्य।",
    },
    "CULARCH": {
        "name_np": "सांस्कृतिक तथा पुरातात्विक क्षेत्र",
        "name_en": "Cultural & Heritage Zone",
        "color": "#9333ea",
        "rules_np": "धार्मिक मन्दिर, गुम्बा, ऐतिहासिक गढी, जात्रा स्थल तथा पुरातात्विक सम्पदा क्षेत्र। मौलिक स्वरूपमा प्रतिकूल असर पर्ने कुनै पनि कार्य निषेध।",
    },
    "FOR": {
        "name_np": "वन क्षेत्र",
        "name_en": "Forest Zone",
        "color": "#15803d",
        "rules_np": "राष्ट्रिय निकुञ्ज, राष्ट्रिय वन, सामुदायिक तथा कबुलियती वन। वन ऐन २०७६ अनुसार रुख कटान, वन अतिक्रमण तथा अनाधिकृत उपयोग पूर्ण निषेधित।",
    },
    "PUB": {
        "name_np": "सार्वजनिक उपयोग तथा खुला क्षेत्र",
        "name_en": "Public Use & Open Space",
        "color": "#64748b",
        "rules_np": "सरकारी तथा अर्ध-सरकारी कार्यालय, सार्वजनिक पार्क, खुला मैदान, विपद् आश्रयस्थल, स्वास्थ्य तथा शैक्षिक पूर्वाधार प्रयोजन।",
    },
    "HYD": {
        "name_np": "नदी, खोला तथा जलस्रोत क्षेत्र",
        "name_en": "River, Stream & Waterbody",
        "color": "#06b6d4",
        "rules_np": "नदी, खोला, सिमसार, ताल तथा जलाधार क्षेत्र। नदी किनारको निश्चित बहाव क्षेत्र (Right of Way / Buffer) भित्र भौतिक संरचना निर्माण निषेध।",
    }
}

WARD_NAMES = {
    1: "वडा नं. १ (बाँसखर्क)",
    2: "वडा नं. २ (बरुवा)",
    3: "वडा नं. ३ (भोताङ)",
    4: "वडा नं. ४ (थाङपालकोट)",
    5: "वडा नं. ५ (गुन्सा)",
    6: "वडा नं. ६ (थाङपालधाप)",
    7: "वडा नं. ७ (तिपेनी)",
    8: "वडा नं. ८ (लागर्चे)",
    99: "लाङटाङ राष्ट्रिय निकुञ्ज क्षेत्र"
}

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
    print(f"Reading GDB from: {GDB_PATH}")
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

    # Create tables if not exist
    cur.execute("""
    CREATE TABLE IF NOT EXISTS gis_ward_boundaries (
        id VARCHAR PRIMARY KEY,
        tenant_id VARCHAR DEFAULT 'panchpokhari',
        ward_no INTEGER NOT NULL,
        ward_name_np VARCHAR(100) NOT NULL,
        area_sqm DOUBLE PRECISION DEFAULT 0.0,
        area_hectare DOUBLE PRECISION DEFAULT 0.0,
        center_lat DOUBLE PRECISION,
        center_lng DOUBLE PRECISION,
        geojson_geometry JSON NOT NULL,
        bbox JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gis_land_classifications (
        id VARCHAR PRIMARY KEY,
        tenant_id VARCHAR DEFAULT 'panchpokhari',
        ward_no INTEGER NOT NULL,
        zone_code VARCHAR(20) NOT NULL,
        zone_name_np VARCHAR(100) NOT NULL,
        zone_name_en VARCHAR(100) NOT NULL,
        color VARCHAR(20) DEFAULT '#10b981',
        area_sqm DOUBLE PRECISION DEFAULT 0.0,
        area_hectare DOUBLE PRECISION DEFAULT 0.0,
        area_ropani_str VARCHAR(100),
        remarks VARCHAR(255),
        hazard_info JSON DEFAULT '{}'::json,
        rules_np TEXT,
        geojson_geometry JSON NOT NULL,
        bbox JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_land_class_ward ON gis_land_classifications(ward_no);
    CREATE INDEX IF NOT EXISTS idx_land_class_zone ON gis_land_classifications(zone_code);
    CREATE INDEX IF NOT EXISTS idx_ward_bound_ward ON gis_ward_boundaries(ward_no);
    """)
    conn.commit()

    # ── PART A: Extract Ward Boundaries ──
    print("\n--- Extracting Ward Boundaries (Sindhupalchok_Wards) ---")
    meta_w, idx_w, geom_w, fields_w = pyogrio.raw.read(GDB_PATH, layer='Sindhupalchok_Wards')
    crs_src = pyproj.CRS.from_wkt(meta_w['crs'])
    crs_dst = pyproj.CRS.from_epsg(4326)
    proj = pyproj.Transformer.from_crs(crs_src, crs_dst, always_xy=True).transform

    gapa_idx = list(meta_w['fields']).index('GaPa_NaPa')
    ward_idx = list(meta_w['fields']).index('NEW_WARD_N')
    area_idx = list(meta_w['fields']).index('Shape_Area')

    from shapely.ops import unary_union

    ward_geoms = collections.defaultdict(list)
    ward_areas = collections.defaultdict(float)

    for i in range(len(geom_w)):
        gapa = str(fields_w[gapa_idx][i])
        if 'Panchpokhari' in gapa:
            w_no = int(fields_w[ward_idx][i])
            area_m2 = float(fields_w[area_idx][i])
            ward_areas[w_no] += area_m2

            g = from_wkb(geom_w[i])
            g_wgs = transform(proj, g)
            ward_geoms[w_no].append(g_wgs)

    ward_features = []
    ward_db_rows = []

    for w_no in sorted(ward_geoms.keys()):
        w_name = WARD_NAMES.get(w_no, f"वडा नं. {w_no}")
        area_m2 = ward_areas[w_no]
        area_ha = area_m2 / 10000.0

        merged_g = unary_union(ward_geoms[w_no])
        merged_simp = merged_g.simplify(0.00008, preserve_topology=True)
        g_json = json.loads(to_geojson(merged_simp))

        center = merged_simp.centroid
        b = merged_simp.bounds
        bbox_list = [b[0], b[1], b[2], b[3]]

        row_id = f"ward-{w_no}"
        ward_db_rows.append((
            row_id, 'panchpokhari', w_no, w_name, area_m2, area_ha,
            center.y, center.x, json.dumps(g_json), json.dumps(bbox_list)
        ))

        ward_features.append({
            "type": "Feature",
            "id": row_id,
            "properties": {
                "ward_no": w_no,
                "ward_name": w_name,
                "area_sqm": area_m2,
                "area_hectare": round(area_ha, 2),
                "center": [center.y, center.x]
            },
            "geometry": g_json
        })

    # Clear and bulk insert Ward Boundaries
    cur.execute("DELETE FROM gis_ward_boundaries WHERE tenant_id = 'panchpokhari';")
    execute_batch(cur, """
        INSERT INTO gis_ward_boundaries 
        (id, tenant_id, ward_no, ward_name_np, area_sqm, area_hectare, center_lat, center_lng, geojson_geometry, bbox)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, ward_db_rows)
    conn.commit()
    print(f"Inserted {len(ward_db_rows)} Ward Boundaries into database.")

    # Save Ward GeoJSON
    ward_collection = {
        "type": "FeatureCollection",
        "features": sorted(ward_features, key=lambda x: x['properties']['ward_no'])
    }
    ward_json_path = os.path.join(OUT_DIR, "ward_boundaries_geojson.json")
    with open(ward_json_path, "w", encoding="utf-8") as f:
        json.dump(ward_collection, f, ensure_ascii=False)
    print(f"Saved Ward Boundaries GeoJSON to: {ward_json_path}")

    # ── PART B: Extract Land Classification (Panchpokhari_no_road) ──
    print("\n--- Extracting Land Classification (Panchpokhari_no_road) ---")
    meta_l, idx_l, geom_l, fields_l = pyogrio.raw.read(GDB_PATH, layer='Panchpokhari_no_road')
    f_names = list(meta_l['fields'])
    
    zone_idx = f_names.index('ZoneType')
    w_idx = f_names.index('WARD_NO')
    area_idx = f_names.index('Shape_Area')
    rem_idx = f_names.index('Remarks') if 'Remarks' in f_names else -1

    haz_fields = ['Fire', 'Flood', 'BankCut', 'Fault', 'Liquifac', 'Seismic', 'LandSL']
    haz_indices = [(h, f_names.index(h)) for h in haz_fields if h in f_names]

    land_db_rows = []
    land_features = []

    summary_by_zone = collections.defaultdict(lambda: {
        "zone_code": "", "zone_name_np": "", "zone_name_en": "", "color": "",
        "polygon_count": 0, "total_area_sqm": 0.0, "total_area_ha": 0.0, "area_ropani_str": ""
    })
    summary_by_ward = collections.defaultdict(lambda: {
        "ward_no": 0, "ward_name": "", "total_area_sqm": 0.0, "total_area_ha": 0.0, "zones": collections.defaultdict(float)
    })

    total_count = len(geom_l)
    print(f"Total features to process: {total_count}...")

    for i in range(total_count):
        raw_zone = str(fields_l[zone_idx][i]).strip().upper()
        if raw_zone not in ZONE_META:
            raw_zone = "AGR" # fallback

        z_info = ZONE_META[raw_zone]
        
        try:
            w_no = int(fields_l[w_idx][i])
        except (ValueError, TypeError):
            w_no = 1

        area_m2 = float(fields_l[area_idx][i])
        area_ha = area_m2 / 10000.0
        ropani_str = sqm_to_ropani_str(area_m2)
        remarks = str(fields_l[rem_idx][i]).strip() if rem_idx >= 0 and fields_l[rem_idx][i] else None

        hazards = {}
        for h_name, h_idx in haz_indices:
            val = fields_l[h_idx][i]
            if val and str(val).strip() and str(val).strip() != '0':
                hazards[h_name] = str(val).strip()

        # Reproject geometry & simplify slightly
        g = from_wkb(geom_l[i])
        g_wgs = transform(proj, g)
        g_simp = g_wgs.simplify(0.00004, preserve_topology=True)
        g_json = json.loads(to_geojson(g_simp))
        b = g_simp.bounds
        bbox_list = [b[0], b[1], b[2], b[3]]

        f_id = f"land-{raw_zone}-{w_no}-{i+1}"

        land_db_rows.append((
            f_id, 'panchpokhari', w_no, raw_zone, z_info['name_np'], z_info['name_en'],
            z_info['color'], area_m2, area_ha, ropani_str, remarks,
            json.dumps(hazards), z_info['rules_np'], json.dumps(g_json), json.dumps(bbox_list)
        ))

        # Build feature for web
        land_features.append({
            "type": "Feature",
            "id": f_id,
            "properties": {
                "id": f_id,
                "ward_no": w_no,
                "zone_code": raw_zone,
                "zone_name_np": z_info['name_np'],
                "zone_name_en": z_info['name_en'],
                "color": z_info['color'],
                "area_sqm": round(area_m2, 1),
                "area_hectare": round(area_ha, 3),
                "area_ropani": ropani_str,
                "remarks": remarks,
                "hazards": hazards,
                "rules": z_info['rules_np']
            },
            "geometry": g_json
        })

        # Summaries
        s_zone = summary_by_zone[raw_zone]
        s_zone["zone_code"] = raw_zone
        s_zone["zone_name_np"] = z_info["name_np"]
        s_zone["zone_name_en"] = z_info["name_en"]
        s_zone["color"] = z_info["color"]
        s_zone["polygon_count"] += 1
        s_zone["total_area_sqm"] += area_m2
        s_zone["total_area_ha"] += area_ha

        s_ward = summary_by_ward[w_no]
        s_ward["ward_no"] = w_no
        s_ward["ward_name"] = WARD_NAMES.get(w_no, f"वडा नं. {w_no}")
        s_ward["total_area_sqm"] += area_m2
        s_ward["total_area_ha"] += area_ha
        s_ward["zones"][raw_zone] += area_ha

        if (i + 1) % 500 == 0:
            print(f"  Processed {i + 1} / {total_count} polygons...")

    # Finalize summaries
    total_palika_sqm = sum(z["total_area_sqm"] for z in summary_by_zone.values())
    total_palika_ha = total_palika_sqm / 10000.0

    zone_summary_list = []
    for z_code, z_data in summary_by_zone.items():
        pct = (z_data["total_area_sqm"] / total_palika_sqm * 100) if total_palika_sqm > 0 else 0
        z_data["percentage"] = round(pct, 2)
        z_data["total_area_ha"] = round(z_data["total_area_ha"], 2)
        z_data["area_ropani_str"] = sqm_to_ropani_str(z_data["total_area_sqm"])
        z_data["rules_np"] = ZONE_META[z_code]["rules_np"]
        zone_summary_list.append(z_data)

    zone_summary_list.sort(key=lambda x: -x["total_area_sqm"])

    ward_summary_list = []
    for w_no in sorted(summary_by_ward.keys()):
        w_data = summary_by_ward[w_no]
        w_data["total_area_ha"] = round(w_data["total_area_ha"], 2)
        w_data["area_ropani_str"] = sqm_to_ropani_str(w_data["total_area_sqm"])
        w_data["zones"] = {k: round(v, 2) for k, v in w_data["zones"].items()}
        ward_summary_list.append(w_data)

    final_summary = {
        "palika_name": "पाँचपोखरी थाङपाल गाउँपालिका",
        "total_polygons": total_count,
        "total_area_sqm": total_palika_sqm,
        "total_area_ha": round(total_palika_ha, 2),
        "total_area_ropani": sqm_to_ropani_str(total_palika_sqm),
        "zones": zone_summary_list,
        "wards": ward_summary_list
    }

    # Save summary JSON
    summary_path = os.path.join(OUT_DIR, "land_classification_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(final_summary, f, ensure_ascii=False, indent=2)
    print(f"Saved Land Classification Summary to: {summary_path}")

    # Save Full GeoJSON
    land_geojson_path = os.path.join(OUT_DIR, "land_classification_geojson.json")
    with open(land_geojson_path, "w", encoding="utf-8") as f:
        json.dump({
            "type": "FeatureCollection",
            "features": land_features
        }, f, ensure_ascii=False)
    print(f"Saved Land Classification GeoJSON to: {land_geojson_path}")

    # Clear and bulk insert Land Classifications into database
    print("\nInserting polygons into PostgreSQL gis_land_classifications...")
    cur.execute("DELETE FROM gis_land_classifications WHERE tenant_id = 'panchpokhari';")
    execute_batch(cur, """
        INSERT INTO gis_land_classifications 
        (id, tenant_id, ward_no, zone_code, zone_name_np, zone_name_en, color, area_sqm, area_hectare, area_ropani_str, remarks, hazard_info, rules_np, geojson_geometry, bbox)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, land_db_rows, page_size=250)
    conn.commit()
    print(f"Successfully inserted {len(land_db_rows)} classification polygons into PostgreSQL!")

    cur.close()
    conn.close()
    print("\nAll tasks completed successfully!")

if __name__ == '__main__':
    run()
