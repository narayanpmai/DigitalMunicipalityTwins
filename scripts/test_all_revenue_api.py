import urllib.request
import json
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

time.sleep(3)
base = 'http://localhost:8080/api/v1/revenue'

print("=== Complete Revenue & Tax Module API Verification (Port 8080) ===")

# 1. GET /revenue
req = urllib.request.Request(base)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print(f"✓ GET  /api/v1/revenue                 : HTTP {resp.status} -> {len(data)} receipts loaded")

# 2. GET /revenue/stats
req = urllib.request.Request(f"{base}/stats")
with urllib.request.urlopen(req) as resp:
    stats = json.loads(resp.read().decode('utf-8'))
    print(f"✓ GET  /api/v1/revenue/stats           : HTTP {resp.status} -> Total: रु. {stats['totalRevenue']:,.2f}, Receipts: {stats['totalReceipts']}")
    print(f"       - Property Tax                  : रु. {stats['propertyTaxAmount']:,.2f}")
    print(f"       - Business Tax                  : रु. {stats['businessTaxAmount']:,.2f}")
    print(f"       - Recommendation Fee            : रु. {stats['recommendationFeeAmount']:,.2f}")

# 3. GET /revenue/{receipt_no}
receipt_no = "P5-REV-2081-00001"
req = urllib.request.Request(f"{base}/{receipt_no}")
with urllib.request.urlopen(req) as resp:
    rec = json.loads(resp.read().decode('utf-8'))
    print(f"✓ GET  /api/v1/revenue/{receipt_no}    : HTTP {resp.status} -> Payer: {rec['payerName']}, Amt: रु. {rec['amount']:,.2f}, Verified: {rec['verified']}")

# 4. POST /revenue/calculate-tax (Property Tax calculation engine)
calc_payload = json.dumps({
    "taxCategory": "property",
    "landAreaRopani": 2.5,
    "landAreaAana": 4.0,
    "landGrade": "abbal",
    "roadAccess": "main",
    "builtAreaSqFt": 1800,
    "structureType": "rcc",
    "isEarlyRebateEligible": True
}).encode('utf-8')
req = urllib.request.Request(f"{base}/calculate-tax", data=calc_payload, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    calc_res = json.loads(resp.read().decode('utf-8'))
    print(f"✓ POST /api/v1/revenue/calculate-tax   : HTTP {resp.status} -> Base: रु. {calc_res['baseTax']:,.2f}, Rebate: रु. {calc_res['discountAmount']:,.2f}, Net: रु. {calc_res['netPayable']:,.2f}")

# 5. POST /revenue/calculate-tax (Business Tax calculation engine)
biz_calc_payload = json.dumps({
    "taxCategory": "business",
    "businessCapital": 3500000
}).encode('utf-8')
req = urllib.request.Request(f"{base}/calculate-tax", data=biz_calc_payload, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    biz_res = json.loads(resp.read().decode('utf-8'))
    print(f"✓ POST /api/v1/revenue/calculate-tax   : HTTP {resp.status} -> Business Fee: रु. {biz_res['netPayable']:,.2f} ({biz_res['breakdown'][0]['title']})")

# 6. Frontend Route Verification
for page in ['/revenue', '/app/revenue']:
    status = urllib.request.urlopen(f"http://localhost:8080{page}").status
    print(f"✓ Web  {page.ljust(32)}: HTTP {status} OK")
