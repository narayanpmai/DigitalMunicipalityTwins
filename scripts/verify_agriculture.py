import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

conn = psycopg2.connect("postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital")
cur = conn.cursor()

tables = [
    "livestock_records",
    "agriculture_data",
    "agriculture_farmers",
    "agriculture_fertilizer_stocks",
    "agriculture_fertilizer_distributions",
    "agriculture_vet_medicines",
    "agriculture_vet_distributions",
    "agriculture_vet_ai_records",
    "agriculture_vet_vaccinations",
    "agriculture_vet_diagnoses",
    "agriculture_market_items",
    "agriculture_market_prices",
    "agriculture_advisories",
    "agriculture_profiles",
]

print("=" * 60)
print("AGRICULTURE & LIVESTOCK DATABASE VERIFICATION REPORT")
print("=" * 60)

for t in tables:
    cur.execute(f"SELECT count(*) FROM {t}")
    cnt = cur.fetchone()[0]
    print(f"{t:38}: {cnt:>4} rows")

print("\n" + "=" * 60)
print("LIVESTOCK SUMMARY BY WARD (Panchpokhari Thangpal Gaupalika)")
print("=" * 60)
cur.execute('SELECT "wardNumber", cattle, buffaloes, goats, sheep, yaks, "milkProductionLiters", "meatProductionKg", "woolProductionKg", "totalHouseholdsRearing" FROM livestock_records ORDER BY "wardNumber";')
for r in cur.fetchall():
    print(f"Ward {r[0]}: Cattle={r[1]}, Buffalo={r[2]}, Goat={r[3]}, Sheep={r[4]}, Yak={r[5]} | Milk={float(r[6] or 0):.1f} L/day | Meat={float(r[7] or 0):.1f} kg | Wool={float(r[8] or 0):.1f} kg | HH={r[9]}")

print("\n" + "=" * 60)
print("FARMERS REGISTERED BY WARD")
print("=" * 60)
cur.execute('SELECT "wardNumber", count(*) FROM agriculture_farmers GROUP BY "wardNumber" ORDER BY "wardNumber";')
for r in cur.fetchall():
    print(f"Ward {r[0]}: {r[1]} farmers registered")

print("\n" + "=" * 60)
print("CROPS MONITORED BY WARD")
print("=" * 60)
cur.execute('SELECT "wardNumber", count(*) FROM agriculture_data GROUP BY "wardNumber" ORDER BY "wardNumber";')
for r in cur.fetchall():
    print(f"Ward {r[0]}: {r[1]} crops")

print("\n" + "=" * 60)
print("FERTILIZER STOCKS SUMMARY")
print("=" * 60)
cur.execute('SELECT "depotName", "wardNumber", "fertilizerNameNepali", "totalStockKg", "availableStockKg" FROM agriculture_fertilizer_stocks ORDER BY "wardNumber";')
for r in cur.fetchall():
    print(f"Ward {r[1]} - {r[0]}: {r[2]} -> Total={float(r[3] or 0):.0f} kg, Avail={float(r[4] or 0):.0f} kg")

print("\n" + "=" * 60)
print("MARKET PRICES TODAY")
print("=" * 60)
cur.execute('SELECT i."itemName", i.category, i.unit, p."minPrice", p."maxPrice", p."averagePrice" FROM agriculture_market_prices p JOIN agriculture_market_items i ON p."itemId" = i.id ORDER BY i.category, i."itemName";')
for r in cur.fetchall():
    print(f"[{r[1]}] {r[0]} ({r[2]}): Min Rs. {float(r[3]):.1f} | Max Rs. {float(r[4]):.1f} | Avg Rs. {float(r[5]):.1f}")

cur.close()
conn.close()
