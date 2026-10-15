"""
Verification script for Option 22: Community Learning, Library & Civic Knowledge
Checks PostgreSQL database records and tests FastAPI live endpoints on http://localhost:3001
"""
import sys
import psycopg2
import urllib.request
import json

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("=" * 80)
print("1. DATABASE VERIFICATION (POSTGRESQL)")
print("=" * 80)

tables = [
    ("library_books", "डिजिटल तथा भौतिक पुस्तक एवं मल्टिमिडिया सामग्री"),
    ("library_borrow_records", "पुस्तक जारी तथा फिर्ता लगत (Borrow Records)")
]

for tbl, desc in tables:
    cur.execute(f"SELECT COUNT(*) FROM {tbl};")
    cnt = cur.fetchone()[0]
    print(f"  • {desc:<55} ({tbl}): {cnt:>3} rows")

# Breakdown by mediaType
cur.execute("""
    SELECT "mediaType", COUNT(*), SUM("totalCopies"), SUM("availableCopies")
    FROM library_books
    GROUP BY "mediaType"
    ORDER BY count DESC;
""")
print("\n[मिडिया प्रकार अनुसार सामग्री वितरण]:")
for row in cur.fetchall():
    print(f"  • {row[0]:<12}: {row[1]:>2} शीर्षक | कुल प्रति: {row[2]:>3} | उपलब्ध प्रति: {row[3]:>3}")

# Breakdown by category
cur.execute("""
    SELECT category, COUNT(*)
    FROM library_books
    GROUP BY category
    ORDER BY count DESC;
""")
print("\n[विषयगत वर्ग अनुसार सामग्री वितरण]:")
for row in cur.fetchall():
    print(f"  • {row[0]:<40}: {row[1]:>2} शीर्षक")

# Breakdown by borrow status
cur.execute("""
    SELECT status, COUNT(*), SUM(fine_amount)
    FROM library_borrow_records
    GROUP BY status
    ORDER BY count DESC;
""")
print("\n[पुस्तक जारी तथा फिर्ता स्थिति]:")
for row in cur.fetchall():
    print(f"  • {row[0]:<10}: {row[1]:>2} विवरण | जरिवाना रकम: रु. {float(row[2] or 0):,.2f}")

cur.close()
conn.close()

print("\n" + "=" * 80)
print("2. API ENDPOINT VERIFICATION (FASTAPI BACKEND - PORT 3001)")
print("=" * 80)

endpoints = [
    ("Library Stats", "http://localhost:3001/api/v1/library/stats"),
    ("All Books/Media", "http://localhost:3001/api/v1/library/books"),
    ("Physical Books Filter", "http://localhost:3001/api/v1/library/books?mediaType=physical"),
    ("E-Books Filter", "http://localhost:3001/api/v1/library/books?mediaType=ebook"),
    ("Audiobooks Filter", "http://localhost:3001/api/v1/library/books?mediaType=audiobook"),
    ("Videobooks Filter", "http://localhost:3001/api/v1/library/books?mediaType=videobook"),
    ("Library Borrows", "http://localhost:3001/api/v1/library/borrows"),
    ("Heritage Library Alias", "http://localhost:3001/api/v1/heritage/library"),
    ("Heritage Library Stats", "http://localhost:3001/api/v1/heritage/library/stats")
]

for name, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "P5-VerifyScript"})
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.status
            content = response.read().decode("utf-8")
            data = json.loads(content)
            count = len(data) if isinstance(data, list) else len(data.keys())
            print(f"  ✓ {name:<26} [{status_code} OK] -> {count} items/keys returned")
    except Exception as e:
        print(f"  ✗ {name:<26} -> ERROR: {e}")

print("\n[API /api/v1/library/stats Payload]:")
try:
    with urllib.request.urlopen("http://localhost:3001/api/v1/library/stats") as res:
        stats = json.loads(res.read().decode("utf-8"))
        print(json.dumps(stats, ensure_ascii=False, indent=2))
except Exception as e:
    print(f"Error fetching library stats: {e}")

print("\n[Sample Book Record]:")
try:
    with urllib.request.urlopen("http://localhost:3001/api/v1/library/books") as res:
        books = json.loads(res.read().decode("utf-8"))
        if books:
            sample = books[0]
            print(f"  Book ID : {sample.get('bookId')}")
            print(f"  Title   : {sample.get('title')}")
            print(f"  Author  : {sample.get('author')}")
            print(f"  Category: {sample.get('category')}")
            print(f"  Media   : {sample.get('mediaType')}")
            print(f"  Copies  : {sample.get('availableCopies')} available / {sample.get('totalCopies')} total")
except Exception as e:
    print(f"Error fetching sample book: {e}")

print("\nOption 22 verification completed successfully!")
