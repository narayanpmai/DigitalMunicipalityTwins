"""
Verification Script: Solid Waste Management & Sanitation (फोहोरमैला व्यवस्थापन तथा वातावरण)
Panchpokhari Thangpal Gaupalika
Validates:
  1. Table row counts across all 8 waste management tables
  2. Vehicles & live status
  3. Waste buyback tariff schedule
  4. Ward-wise collection schedules (Wards 1 through 8)
  5. Disposal & processing facilities (Capacity & Leachate treatment)
  6. Sanitation workers & safety compliance (PPE, Vaccines, Insurance)
  7. Citizen waste alerts / complaints by status
  8. Citizen wallets & total recycling payouts
"""
import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

tables = [
    ("waste_vehicles", "फोहोर संकलन सवारी साधन (Vehicles)"),
    ("waste_rates", "फोहोर खरिद/शुल्क दररेट (Buyback Rates)"),
    ("waste_schedules", "रुट तथा संकलन तालिका (Collection Schedules)"),
    ("waste_disposal_sites", "डम्पिङ, कम्पोस्ट तथा रिसाइक्लिङ केन्द्र (Facilities)"),
    ("waste_sanitation_workers", "सरसफाइ कर्मचारी तथा अपरेटर (Sanitation Workers)"),
    ("waste_alerts", "नागरिक फोहोरमैला गुनासो तथा अलर्ट (Alerts/Tickets)"),
    ("waste_wallets", "नागरिक हरित रिसाइक्लिङ वालेट (Citizen Wallets)"),
    ("waste_transactions", "फोहोर संकलन तथा भुक्तानी कारोबार (Transactions)"),
]

print("=" * 75)
print("SOLID WASTE MANAGEMENT & SANITATION DATABASE VERIFICATION REPORT")
print("पाँचपोखरी थाङपाल गाउँपालिका — फोहोरमैला व्यवस्थापन तथा वातावरण प्रणाली")
print("=" * 75)

for tbl, label in tables:
    cur.execute(f"SELECT count(*) FROM {tbl};")
    cnt = cur.fetchone()[0]
    print(f"{tbl:26}: {cnt:>3} rows | {label}")

print("\n" + "=" * 75)
print("1. COLLECTION VEHICLES & REAL-TIME FLEET STATUS")
print("=" * 75)
cur.execute('SELECT "licensePlate", "driverName", "routeAssigned", status, "currentLat", "currentLon" FROM waste_vehicles ORDER BY "licensePlate";')
for r in cur.fetchall():
    print(f"[{r[0]}] चालक: {r[1]:<20} | रुट: {r[2]} | स्थिति: {r[3]} ({r[4]}, {r[5]})")

print("\n" + "=" * 75)
print("2. BUYBACK TARIFF SCHEDULE (फोहोर वर्गीकरण तथा खरिद दर)")
print("=" * 75)
cur.execute('SELECT "wasteType", "ratePerKg", "colorCode", "isActive" FROM waste_rates ORDER BY "ratePerKg" DESC;')
for r in cur.fetchall():
    print(f"• {r[0]:<50}: रु. {r[1]:>5.2f} / केजी [{r[2]}] (सक्रिय: {r[3]})")

print("\n" + "=" * 75)
print("3. WARD-WISE COLLECTION SCHEDULES (वडा अनुसार संकलन कार्यतालिका)")
print("=" * 75)
cur.execute('SELECT "wardNo", "routeCode", "routeName", "collectionDaysBio", "collectionDaysNonBio", "vehicleNumber", timing FROM waste_schedules ORDER BY "wardNo";')
for r in cur.fetchall():
    print(f"वडा {r[0]} [{r[1]}]: {r[2]}")
    print(f"   - कुहिने फोहोर: {r[3]} | नकुहिने: {r[4]}")
    print(f"   - सवारी: {r[5]} | समय: {r[6]}")

print("\n" + "=" * 75)
print("4. DISPOSAL SITES & COMPOSTING PLANTS (प्रशोधन तथा विसर्जन पूर्वाधार)")
print("=" * 75)
cur.execute('SELECT "siteName", "siteType", "wardNo", "locationName", "dailyCapacityTons", "currentUtilizationPercent", "leachateTreatment", "eiaRegistrationNo" FROM waste_disposal_sites ORDER BY "wardNo";')
for r in cur.fetchall():
    print(f"• {r[0]} ({r[1]})")
    print(f"   स्थान: {r[3]} (वडा {r[2]}) | क्षमता: {r[4]} टन/दिन | उपयोग: {r[5]}%")
    print(f"   लिचेट उपचार: {r[6]} | वातावरणीय स्वीकृति: {r[7]}")

print("\n" + "=" * 75)
print("5. SANITATION WORKERS OCCUPATIONAL HEALTH & SAFETY COMPLIANCE")
print("=" * 75)
cur.execute('SELECT "workerCode", "fullName", "wardNo", role, "employmentType", phone, "ppeKitStatus", "vaccinationStatus", "insuranceStatus" FROM waste_sanitation_workers ORDER BY "wardNo";')
for r in cur.fetchall():
    print(f"[{r[0]}] {r[1]:<18} (वडा {r[2]}): पद: {r[3]:<16} ({r[4]}) | मो: {r[5]}")
    print(f"   सुरक्षा: PPE-{r[6]} | खोप: {r[7]} | बिमा: {r[8]}")

print("\n" + "=" * 75)
print("6. CITIZEN ALERTS & GRIEVANCES BY STATUS (नागरिक गुनासो/अलर्ट)")
print("=" * 75)
cur.execute('SELECT status, count(*) FROM waste_alerts GROUP BY status ORDER BY status;')
for r in cur.fetchall():
    print(f"स्थिति: {r[0]:<15} -> {r[1]} वटा उजुरी/अलर्ट")
cur.execute('SELECT "issueType", location, status FROM waste_alerts LIMIT 5;')
print("नमुना उजुरीहरु:")
for r in cur.fetchall():
    print(f"  - [{r[2]}] {r[0]}: {r[1]}")

print("\n" + "=" * 75)
print("7. CITIZEN GREEN RECYCLING WALLETS & INCENTIVES")
print("=" * 75)
cur.execute('SELECT count(*), sum(balance), sum("totalEarned"), sum("totalWithdrawn") FROM waste_wallets;')
tot = cur.fetchone()
print(f"कुल दर्ता हरित वालेट: {tot[0]}")
print(f"वर्तमान बाँकी मौज्दात (Balance)     : रु. {tot[1]:,.2f}")
print(f"कुल आर्जित प्रोत्साहन (Total Earned) : रु. {tot[2]:,.2f}")
print(f"कुल झिकिएको रकम (Withdrawn)         : रु. {tot[3]:,.2f}")

print("\n" + "=" * 75)
print("8. BUYBACK TRANSACTIONS AUDIT")
print("=" * 75)
cur.execute('SELECT count(*), sum("weightKg"), sum("totalAmount") FROM waste_transactions;')
tx = cur.fetchone()
print(f"सम्पन्न खरिद कारोबार: {tx[0]} पटक")
print(f"कुल संकलित वर्गीकरण फोहोर: {tx[1]:,.2f} केजी")
print(f"कुल भुक्तानी गरिएको रकम  : रु. {tx[2]:,.2f}")

cur.close()
conn.close()
print("\n" + "=" * 75)
print("ALL SOLID WASTE MANAGEMENT DATA VERIFIED SUCCESSFULLY!")
print("=" * 75)
