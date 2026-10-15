import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

tables = [
    "tourism_destinations",
    "tourism_hotels",
    "tourism_packages",
    "tourism_local_products",
    "tourism_reservations",
    "tourism_tourist_logs",
    "heritage_sites",
    "museum_assets",
    "gis_tourism_heritage"
]

print("=" * 65)
print("TOURISM & HERITAGE DATABASE VERIFICATION REPORT")
print("=" * 65)

for t in tables:
    cur.execute(f"SELECT count(*) FROM {t}")
    cnt = cur.fetchone()[0]
    print(f"{t:30}: {cnt:>4} rows")

print("\n" + "=" * 65)
print("TOURIST DESTINATIONS ACROSS PANCHPOKHARI")
print("=" * 65)
cur.execute('SELECT "wardNo", name, category, "altitudeMeters", "bestSeason" FROM tourism_destinations ORDER BY "wardNo", name;')
for r in cur.fetchall():
    print(f"Ward {r[0]} | {r[1]} ({r[3]}m) | {r[2]} | सिजन: {r[4]}")

print("\n" + "=" * 65)
print("HOTELS, RESORTS & HOMESTAYS REGISTERED")
print("=" * 65)
cur.execute('SELECT "wardNo", name, type, classification, "totalRooms", "bedCapacity", "pricePerNight" FROM tourism_hotels ORDER BY "wardNo", name;')
for r in cur.fetchall():
    print(f"Ward {r[0]} | {r[1]} [{r[2]} - वर्ग '{r[3]}'] | कोठा: {r[4]}, बेड: {r[5]} | मूल्य: रु {r[6]}")

print("\n" + "=" * 65)
print("HERITAGE SITES BY WARD")
print("=" * 65)
cur.execute('SELECT "wardNumber", "nameNp", type, latitude, longitude FROM heritage_sites ORDER BY "wardNumber", "nameNp";')
for r in cur.fetchall():
    print(f"Ward {r[0]} | {r[1]} | {r[2]} | GPS: ({r[3]}, {r[4]})")

print("\n" + "=" * 65)
print("HYOLMO CULTURAL MUSEUM ASSETS (तार्केघ्याङ)")
print("=" * 65)
cur.execute('SELECT "assetId", "nameNp", category, "estimatedPeriod", condition FROM museum_assets ORDER BY "assetId";')
for r in cur.fetchall():
    print(f"[{r[0]}] {r[1]} | {r[2]} | {r[3]} | स्थिति: {r[4]}")

print("\n" + "=" * 65)
print("TOURIST LOGS & REVENUE SUMMARY")
print("=" * 65)
cur.execute('SELECT count(*), sum("entryFeeNpr") FROM tourism_tourist_logs;')
tot_tourists, tot_fee = cur.fetchone()
print(f"Total Logged Tourists: {tot_tourists} | Total Entry Fees Collected: NPR {tot_fee:,.2f}")

cur.close()
conn.close()
