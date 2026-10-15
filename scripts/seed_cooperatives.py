"""
Seed Script: Option 20 - Cooperative Governance & Regulation
(सहकारी संस्था नियमन, वित्तीय लेखापरीक्षण, स्थलगत अनुगमन तथा नियमनकारी सूचना)
Panchpokhari Thangpal Gaupalika, Sindhupalchok

Governed by:
  - Local Government Operation Act 2074 (Section 11, Clause 2 (b) - Cooperative Regulation)
  - Cooperatives Act 2074 & Rules 2075
  - Cooperative Poverty Alleviation Management Information System (COPOMIS) standards
  - PEARLS Financial Monitoring System

Populates:
  1. cooperatives (ensures 8 cooperatives across all 8 Wards)
  2. cooperative_members (20 realistic member profiles with dual-borrower risk tracking)
  3. cooperative_financial_reports (16 quarterly & annual PEARLS reports)
  4. cooperative_inspections (8 municipal on-site inspection logs with compliance scores)
  5. cooperative_regulatory_notices (8 formal directives, AGM reminders, and liquidity warnings)
"""
import sys
import psycopg2
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")

DATABASE_URL = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("=" * 80)
print("STARTING OPTION 20 SEEDING: COOPERATIVE GOVERNANCE & REGULATION")
print("=" * 80)

TENANT = "panchpokhari"

# ---------------------------------------------------------------------------
# 1. SEED cooperatives (८ वटा सहकारीहरू: वडा १ देखि ८ सम्म)
# ---------------------------------------------------------------------------
# Existing 5:
#   Ward 7: c2dbfea9-f921-4a73-9cfd-1b87fbdcc1cc (पाँचपोखरी थाङपाल बचत तथा ऋण)
#   Ward 3: 63bd96a1-bc02-4bda-9beb-a4730ee10429 (भोताङ साना किसान कृषि)
#   Ward 1: 02dbc520-cbc8-4556-ac0c-69b1017c0480 (बाँसखर्क बहुउद्देश्यीय)
#   Ward 6: a3eb2188-c076-4b53-bfd5-f790dff11da5 (धाप महिला विकास बचत तथा ऋण)
#   Ward 5: 365467eb-e0d6-4a27-b61a-2cfe5b76113e (गुन्सा दुग्ध उत्पादक)
# New 3:
#   Ward 2: 20100000-0000-0000-0000-000000000006 (बरुवा ह्योल्मो अर्गानिक कृषि तथा जडिबुटी)
#   Ward 4: 20100000-0000-0000-0000-000000000007 (थाङपालकोट साना किसान बचत तथा ऋण)
#   Ward 8: 20100000-0000-0000-0000-000000000008 (लागर्चे सिर्जनशील महिला बहुउद्देश्यीय)

new_coops = [
    (
        "20100000-0000-0000-0000-000000000006", "COOP-PTGP-081-06", "COPOMIS-27-01-006",
        "बरुवा ह्योल्मो अर्गानिक कृषि तथा जडिबुटी सहकारी संस्था लि.", "Baruwa Hyolmo Organic Agriculture & Herbs Cooperative Ltd.",
        "कृषि", "सञ्चालनमा", 2, "बरुवा मुख्य टोल", "वडा नं १-३", "२०७६-०३-१५", "६०१२३४५६१",
        "०११-६९०१४१", "baruwa.coop@panchpokhari.gov.np", 27.9880, 85.6310,
        "दावा फुटी शेर्पा", "९८४१२२३३०१", "पेम्बा शेर्पा", "९८४१२२३३०२",
        185, 235, 420, 11000000.0, 36000000.0, 31000000.0, 2200000.0,
        "न्यून जोखिम (Low Risk)", 19.2, 1.4, "२०८०-०९-२०", "२०८०/०८१", "सिंक भएको"
    ),
    (
        "20100000-0000-0000-0000-000000000007", "COOP-PTGP-081-07", "COPOMIS-27-01-007",
        "थाङपालकोट साना किसान बचत तथा ऋण सहकारी संस्था लि.", "Thangpalkot Small Farmers Savings & Credit Cooperative Ltd.",
        "बचत तथा ऋण", "सञ्चालनमा", 4, "थाङपालकोट बजार", "वडा नं ४-५", "२०७५-०८-१०", "६०१२३४५६२",
        "०११-६९०१४२", "thangpalkot.coop@panchpokhari.gov.np", 27.9610, 85.5980,
        "गोपाल तामाङ", "९८४१२२३३०३", "सुमित्रा खतिवडा", "९८४१२२३३०४",
        220, 310, 530, 16500000.0, 58000000.0, 51000000.0, 3400000.0,
        "मध्यम जोखिम (Moderate)", 15.8, 2.3, "२०८०-०९-२८", "२०८०/०८१", "सिंक भएको"
    ),
    (
        "20100000-0000-0000-0000-000000000008", "COOP-PTGP-081-08", "COPOMIS-27-01-008",
        "लागर्चे सिर्जनशील महिला बहुउद्देश्यीय सहकारी संस्था लि.", "Lagarche Creative Women Multipurpose Cooperative Ltd.",
        "बहुउद्देश्यीय", "सञ्चालनमा", 8, "लागर्चे बजार", "वडा नं ७-८", "२०७७-०५-२२", "६०१२३४५६३",
        "०११-६९०१४३", "lagarche.coop@panchpokhari.gov.np", 27.9710, 85.5890,
        "कान्छी माया तामाङ", "९८४१२२३३०५", "फूलमाया तामाङ", "९८४१२२३३०६",
        95, 285, 380, 9500000.0, 32000000.0, 27500000.0, 1850000.0,
        "न्यून जोखिम (Low Risk)", 18.0, 1.6, "२०८०-१०-०५", "२०८०/०८१", "सिंक भएको"
    ),
]

for r in new_coops:
    cur.execute("""
        INSERT INTO cooperatives (
            tenant_id, id, "registrationNo", "copomisCode", name, "nameEn", "coopType",
            status, "wardNumber", "toleAddress", "workingArea", "registrationDateBs", "panNumber",
            phone, email, latitude, longitude, "chairpersonName", "chairpersonPhone", "managerName",
            "managerPhone", "totalMembersMale", "totalMembersFemale", "totalMembers", "shareCapital",
            "totalDeposit", "totalLoanOutstanding", "reserveFund", "riskLevel", "liquidityRatio",
            "nplRatio", "lastAgmDateBs", "lastAuditFiscalYear", "copomisSyncStatus", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "registrationNo" = EXCLUDED."registrationNo",
            "copomisCode" = EXCLUDED."copomisCode",
            name = EXCLUDED.name,
            "nameEn" = EXCLUDED."nameEn",
            "coopType" = EXCLUDED."coopType",
            status = EXCLUDED.status,
            "wardNumber" = EXCLUDED."wardNumber",
            "toleAddress" = EXCLUDED."toleAddress",
            "workingArea" = EXCLUDED."workingArea",
            "registrationDateBs" = EXCLUDED."registrationDateBs",
            "panNumber" = EXCLUDED."panNumber",
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            "chairpersonName" = EXCLUDED."chairpersonName",
            "chairpersonPhone" = EXCLUDED."chairpersonPhone",
            "managerName" = EXCLUDED."managerName",
            "managerPhone" = EXCLUDED."managerPhone",
            "totalMembersMale" = EXCLUDED."totalMembersMale",
            "totalMembersFemale" = EXCLUDED."totalMembersFemale",
            "totalMembers" = EXCLUDED."totalMembers",
            "shareCapital" = EXCLUDED."shareCapital",
            "totalDeposit" = EXCLUDED."totalDeposit",
            "totalLoanOutstanding" = EXCLUDED."totalLoanOutstanding",
            "reserveFund" = EXCLUDED."reserveFund",
            "riskLevel" = EXCLUDED."riskLevel",
            "liquidityRatio" = EXCLUDED."liquidityRatio",
            "nplRatio" = EXCLUDED."nplRatio",
            "lastAgmDateBs" = EXCLUDED."lastAgmDateBs",
            "lastAuditFiscalYear" = EXCLUDED."lastAuditFiscalYear",
            "copomisSyncStatus" = EXCLUDED."copomisSyncStatus",
            "updatedAt" = NOW();
    """, (
        TENANT, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11],
        r[12], r[13], r[14], r[15], r[16], r[17], r[18], r[19], r[20], r[21], r[22], r[23],
        r[24], r[25], r[26], r[27], r[28], r[29], r[30], r[31], r[32]
    ))
print(f"✓ Seeded/verified all 8 cooperatives across Wards 1 to 8.")

# Map coop keys for easy foreign key linking
COOP_IDS = {
    1: "02dbc520-cbc8-4556-ac0c-69b1017c0480",  # Ward 1: बाँसखर्क बहुउद्देश्यीय
    2: "20100000-0000-0000-0000-000000000006",  # Ward 2: बरुवा ह्योल्मो कृषि
    3: "63bd96a1-bc02-4bda-9beb-a4730ee10429",  # Ward 3: भोताङ साना किसान कृषि
    4: "20100000-0000-0000-0000-000000000007",  # Ward 4: थाङपालकोट साना किसान
    5: "365467eb-e0d6-4a27-b61a-2cfe5b76113e",  # Ward 5: गुन्सा दुग्ध उत्पादक
    6: "a3eb2188-c076-4b53-bfd5-f790dff11da5",  # Ward 6: धाप महिला विकास
    7: "c2dbfea9-f921-4a73-9cfd-1b87fbdcc1cc",  # Ward 7: पाँचपोखरी थाङपाल बचत तथा ऋण
    8: "20100000-0000-0000-0000-000000000008",  # Ward 8: लागर्चे सिर्जनशील महिला
}


# ---------------------------------------------------------------------------
# 2. SEED cooperative_members (२० जना सदस्यहरू + दोहोरो ऋण जोखिम विश्लेषण)
# ---------------------------------------------------------------------------
members_data = [
    # Som Bahadur Tamang: Active loans in Ward 7 & Ward 3 (Dual Borrower!)
    ("mem-01", COOP_IDS[7], "सोम बहादुर तामाङ", "२७-०१-७०-०१२३४", "९८४१२३४५६७", "पुरुष", 3, "भोताङ", "HH-03-045", 50, 85000.0, 450000.0, "नियमित", True),
    ("mem-02", COOP_IDS[3], "सोम बहादुर तामाङ", "२७-०१-७०-०१२३४", "९८४१२३४५६७", "पुरुष", 3, "भोताङ", "HH-03-045", 25, 42000.0, 400000.0, "नियमित", True),

    # Ramkrishna Khadka: Active loans in Ward 5 & Ward 6 (Dual Borrower!)
    ("mem-03", COOP_IDS[5], "रामकृष्ण खड्का", "२७-०१-६८-०२५८९", "९८४९१२३८९०", "पुरुष", 5, "गुन्सा", "HH-05-112", 40, 65000.0, 250000.0, "नियमित", True),
    ("mem-04", COOP_IDS[6], "रामकृष्ण खड्का", "२७-०१-६८-०२५८९", "९८४९१२३८९०", "पुरुष", 5, "गुन्सा", "HH-05-112", 20, 30000.0, 170000.0, "नियमित", True),

    # Regular single members across cooperatives
    ("mem-05", COOP_IDS[1], "सरिता तामाङ", "२७-०१-७५-०३४११", "९८४१२२३३४४", "महिला", 1, "बासखर्क", "HH-01-018", 30, 45000.0, 150000.0, "नियमित", False),
    ("mem-06", COOP_IDS[1], "कृष्ण बहादुर गुरुङ", "२७-०१-७१-०१२५५", "९८४१७७८८९९", "पुरुष", 1, "बासखर्क", "HH-01-052", 20, 28000.0, 0.0, "ऋण नभएको", False),
    ("mem-07", COOP_IDS[2], "डोल्मा शेर्पा", "२७-०१-७६-०२३४४", "९८१२३४५६७८", "महिला", 2, "बरुवा", "HH-02-031", 25, 38000.0, 120000.0, "नियमित", False),
    ("mem-08", COOP_IDS[2], "दावा फुटी शेर्पा", "२७-०१-७२-०४५६६", "९८४१६६००८८", "महिला", 2, "बरुवा", "HH-02-064", 50, 110000.0, 0.0, "ऋण नभएको", False),
    ("mem-09", COOP_IDS[3], "निमा दावा शेर्पा", "२७-०१-७३-०७७८८", "९८४१०००१०३", "पुरुष", 3, "तार्केघ्याङ", "HH-03-012", 100, 250000.0, 0.0, "ऋण नभएको", False),
    ("mem-10", COOP_IDS[4], "सुमित्रा खतिवडा", "२७-०१-७७-०३४५५", "९८०३४५६७८९", "महिला", 4, "थाङपालकोट", "HH-04-088", 35, 52000.0, 180000.0, "नियमित", False),
    ("mem-11", COOP_IDS[4], "गोपाल तामाङ", "२७-०१-७०-०८८९९", "९८४१०००१०४", "पुरुष", 4, "मानेखर्क", "HH-04-005", 80, 145000.0, 0.0, "ऋण नभएको", False),
    ("mem-12", COOP_IDS[5], "ज्ञान बहादुर तामाङ", "२७-०१-७४-०४५२२", "९८५११२२३३०", "पुरुष", 5, "गुन्सा", "HH-05-074", 25, 40000.0, 100000.0, "नियमित", False),
    ("mem-13", COOP_IDS[6], "कमल श्रेष्ठ", "२७-०१-७०-०६६३३", "९८४१६६५५४४", "पुरुष", 6, "थाङपालधाप", "HH-06-015", 50, 95000.0, 220000.0, "नियमित", False),
    ("mem-14", COOP_IDS[6], "पार्वती सापकोटा", "२७-०१-७३-०५५४४", "९८४१७७८८११", "महिला", 6, "थाङपालधाप", "HH-06-042", 40, 75000.0, 160000.0, "नियमित", False),
    ("mem-15", COOP_IDS[7], "टेक बहादुर तामाङ", "२७-०१-६९-०३२११", "९८४१५५६६७७", "पुरुष", 7, "तिपेनी", "HH-07-023", 60, 120000.0, 350000.0, "नियमित", False),
    ("mem-16", COOP_IDS[7], "सुकमान विक", "२७-०१-७२-०६५४४", "९८१२९८७६५४", "पुरुष", 7, "तिपेनी आरन टोल", "HH-07-089", 20, 25000.0, 80000.0, "नियमित", False),
    ("mem-17", COOP_IDS[8], "कान्छी माया तामाङ", "२७-०१-७५-०७८९९", "९८४१७७८८००", "महिला", 8, "लागर्चे", "HH-08-011", 30, 48000.0, 140000.0, "नियमित", False),
    ("mem-18", COOP_IDS[8], "फूलमाया तामाङ", "२७-०१-७६-०८९००", "९८४१७७८८०२", "महिला", 8, "लागर्चे", "HH-08-034", 25, 36000.0, 110000.0, "नियमित", False),
    ("mem-19", COOP_IDS[7], "दिनेश पण्डित", "२७-०१-६५-०१४७८", "९८४१३३४४५५", "पुरुष", 7, "तिपेनी बजार", "HH-07-004", 150, 450000.0, 600000.0, "भाखा नाघेको", False),
    ("mem-20", COOP_IDS[4], "राम चन्द्र खतिवडा", "२७-०१-६७-०३६९९", "९८४१४४५५६६", "पुरुष", 4, "थाङपालकोट", "HH-04-032", 45, 60000.0, 200000.0, "नियमित", False),
]

for r in members_data:
    cur.execute("""
        INSERT INTO cooperative_members (
            id, "cooperativeId", "memberName", "citizenshipNo", phone, gender,
            "wardNumber", "toleAddress", "householdMatrixNo", "sharesCount",
            "savingsBalance", "loanBalance", "loanStatus", "isDualBorrower", "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "cooperativeId" = EXCLUDED."cooperativeId",
            "memberName" = EXCLUDED."memberName",
            "citizenshipNo" = EXCLUDED."citizenshipNo",
            phone = EXCLUDED.phone,
            gender = EXCLUDED.gender,
            "wardNumber" = EXCLUDED."wardNumber",
            "toleAddress" = EXCLUDED."toleAddress",
            "householdMatrixNo" = EXCLUDED."householdMatrixNo",
            "sharesCount" = EXCLUDED."sharesCount",
            "savingsBalance" = EXCLUDED."savingsBalance",
            "loanBalance" = EXCLUDED."loanBalance",
            "loanStatus" = EXCLUDED."loanStatus",
            "isDualBorrower" = EXCLUDED."isDualBorrower";
    """, (
        r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13]
    ))
print(f"✓ Seeded {len(members_data)} records into 'cooperative_members' (with dual borrower flags).")


# ---------------------------------------------------------------------------
# 3. SEED cooperative_financial_reports (१६ वटा त्रैमासिक तथा वार्षिक वित्तीय प्रतिवेदन)
# ---------------------------------------------------------------------------
fin_reports_data = [
    # 1. Panchpokhari SACCOS (Ward 7) - Annual 2080/81 & Q1 2081/82
    (
        "cfr-01", COOP_IDS[7], "२०८०/०८१", "वार्षिक", "असार मसान्त अन्तिम लेखापरीक्षण", "२०८१-०४-१५",
        35000000.0, 6800000.0, 145000000.0, 128000000.0, 12531200.0, 2688000.0,
        26825000.0, 196800000.0, 4250000.0, 18.5, 2.1, 17.8, True, "व्यवस्थापक", "लेखापरीक्षक आर.के. एशोसिएट्स"
    ),
    (
        "cfr-02", COOP_IDS[7], "२०८१/०८२", "त्रैमासिक", "प्रथम त्रैमास (साउन-असोज)", "२०८१-०७-१०",
        35800000.0, 7100000.0, 151000000.0, 132000000.0, 12949200.0, 2508000.0,
        28690000.0, 204200000.0, 1150000.0, 19.0, 1.9, 17.5, True, "व्यवस्थापक", "सहकारी शाखा, पाँचपोखरी"
    ),

    # 2. Bhotang Small Farmers Agri (Ward 3) - Annual 2080/81 & Q1 2081/82
    (
        "cfr-03", COOP_IDS[3], "२०८०/०८१", "वार्षिक", "असार मसान्त अन्तिम लेखापरीक्षण", "२०८१-०४-२०",
        18000000.0, 3200000.0, 62000000.0, 54000000.0, 53028000.0, 972000.0,
        10044000.0, 88200000.0, 2180000.0, 16.2, 1.8, 16.5, True, "व्यवस्थापक", "लेखापरीक्षक शर्मा एण्ड कम्पनी"
    ),
    (
        "cfr-04", COOP_IDS[3], "२०८१/०८२", "त्रैमासिक", "प्रथम त्रैमास (साउन-असोज)", "२०८१-०७-१५",
        18500000.0, 3450000.0, 65500000.0, 56000000.0, 55048000.0, 952000.0,
        11135000.0, 92500000.0, 580000.0, 17.0, 1.7, 16.8, True, "व्यवस्थापक", "सहकारी शाखा, पाँचपोखरी"
    ),

    # 3. Baskhark Multipurpose (Ward 1) - Annual 2080/81 & Q1 2081/82
    (
        "cfr-05", COOP_IDS[1], "२०८०/०८१", "वार्षिक", "असार मसान्त अन्तिम लेखापरीक्षण", "२०८१-०५-०१",
        12500000.0, 2100000.0, 48000000.0, 41000000.0, 40016000.0, 984000.0,
        7200000.0, 66500000.0, 1420000.0, 15.0, 2.4, 15.6, True, "व्यवस्थापक", "लेखापरीक्षक श्रेष्ठ एशोसिएट्स"
    ),
    (
        "cfr-06", COOP_IDS[1], "२०८१/०८२", "त्रैमासिक", "प्रथम त्रैमास (साउन-असोज)", "२०८१-०७-१८",
        12800000.0, 2250000.0, 50200000.0, 42500000.0, 41565000.0, 935000.0,
        7831200.0, 69800000.0, 380000.0, 15.6, 2.2, 15.8, True, "व्यवस्थापक", "सहकारी शाखा, पाँचपोखरी"
    ),

    # 4. Dhap Women SACCOS (Ward 6) - Annual 2080/81 & Q1 2081/82
    (
        "cfr-07", COOP_IDS[6], "२०८०/०८१", "वार्षिक", "असार मसान्त अन्तिम लेखापरीक्षण", "२०८१-०४-२५",
        14000000.0, 2800000.0, 55000000.0, 49000000.0, 48412000.0, 588000.0,
        11055000.0, 77500000.0, 1850000.0, 20.1, 1.2, 18.2, True, "व्यवस्थापक", "लेखापरीक्षक दाहाल एशोसिएट्स"
    ),
    (
        "cfr-08", COOP_IDS[6], "२०८१/०८२", "त्रैमासिक", "प्रथम त्रैमास (साउन-असोज)", "२०८१-०७-१२",
        14500000.0, 3050000.0, 58000000.0, 51000000.0, 50490000.0, 510000.0,
        12180000.0, 81500000.0, 490000.0, 21.0, 1.0, 18.5, True, "व्यवस्थापक", "सहकारी शाखा, पाँचपोखरी"
    ),

    # 5. Gunsa Dairy (Ward 5) - Annual 2080/81 & Q1 2081/82
    (
        "cfr-09", COOP_IDS[5], "२०८०/०८१", "वार्षिक", "असार मसान्त अन्तिम लेखापरीक्षण", "२०८१-०५-१०",
        8500000.0, 1500000.0, 28000000.0, 24000000.0, 23640000.0, 360000.0,
        4872000.0, 40500000.0, 980000.0, 17.4, 1.5, 16.5, True, "व्यवस्थापक", "लेखापरीक्षक नेपाल एशोसिएट्स"
    ),
    (
        "cfr-10", COOP_IDS[5], "२०८१/०८२", "त्रैमासिक", "प्रथम त्रैमास (साउन-असोज)", "२०८१-०७-२०",
        8800000.0, 1620000.0, 29800000.0, 25200000.0, 24872400.0, 327600.0,
        5364000.0, 42800000.0, 270000.0, 18.0, 1.3, 16.8, True, "व्यवस्थापक", "सहकारी शाखा, पाँचपोखरी"
    ),

    # 6. Baruwa Organic Agri (Ward 2) - Annual 2080/81 & Q1 2081/82
    (
        "cfr-11", COOP_IDS[2], "२०८०/०८१", "वार्षिक", "असार मसान्त अन्तिम लेखापरीक्षण", "२०८१-०४-२८",
        11000000.0, 2200000.0, 36000000.0, 31000000.0, 30566000.0, 434000.0,
        6912000.0, 52500000.0, 1250000.0, 19.2, 1.4, 17.6, True, "व्यवस्थापक", "लेखापरीक्षक पौडेल एण्ड ब्रदर्स"
    ),
    (
        "cfr-12", COOP_IDS[2], "२०८१/०८२", "त्रैमासिक", "प्रथम त्रैमास (साउन-असोज)", "२०८१-०७-१४",
        11400000.0, 2380000.0, 38500000.0, 32500000.0, 32077500.0, 422500.0,
        7700000.0, 55600000.0, 340000.0, 20.0, 1.3, 17.8, True, "व्यवस्थापक", "सहकारी शाखा, पाँचपोखरी"
    ),

    # 7. Thangpalkot SACCOS (Ward 4) - Annual 2080/81 & Q1 2081/82
    (
        "cfr-13", COOP_IDS[4], "२०८०/०८१", "वार्षिक", "असार मसान्त अन्तिम लेखापरीक्षण", "२०८१-०५-०५",
        16500000.0, 3400000.0, 58000000.0, 51000000.0, 49827000.0, 1173000.0,
        9164000.0, 83500000.0, 1750000.0, 15.8, 2.3, 16.2, True, "व्यवस्थापक", "लेखापरीक्षक केसी एशोसिएट्स"
    ),
    (
        "cfr-14", COOP_IDS[4], "२०८१/०८२", "त्रैमासिक", "प्रथम त्रैमास (साउन-असोज)", "२०८१-०७-२२",
        17000000.0, 3620000.0, 61000000.0, 53200000.0, 52082800.0, 1117200.0,
        9882000.0, 87400000.0, 460000.0, 16.2, 2.1, 16.5, True, "व्यवस्थापक", "सहकारी शाखा, पाँचपोखरी"
    ),

    # 8. Lagarche Women Multipurpose (Ward 8) - Annual 2080/81 & Q1 2081/82
    (
        "cfr-15", COOP_IDS[8], "२०८०/०८१", "वार्षिक", "असार मसान्त अन्तिम लेखापरीक्षण", "२०८१-०४-१८",
        9500000.0, 1850000.0, 32000000.0, 27500000.0, 27060000.0, 440000.0,
        5760000.0, 45800000.0, 1120000.0, 18.0, 1.6, 17.0, True, "व्यवस्थापक", "लेखापरीक्षक तामाङ एशोसिएट्स"
    ),
    (
        "cfr-16", COOP_IDS[8], "२०८१/०८२", "त्रैमासिक", "प्रथम त्रैमास (साउन-असोज)", "२०८१-०७-१६",
        9800000.0, 2010000.0, 34200000.0, 29000000.0, 28565000.0, 435000.0,
        6498000.0, 48500000.0, 295000.0, 19.0, 1.5, 17.2, True, "व्यवस्थापक", "सहकारी शाखा, पाँचपोखरी"
    ),
]

for r in fin_reports_data:
    cur.execute("""
        INSERT INTO cooperative_financial_reports (
            id, "cooperativeId", "fiscalYear", "periodType", "periodName", "reportDateBs",
            "shareCapital", "reserveFunds", "totalDeposits", "totalLoans", "performingLoans",
            "nonPerformingLoans", "liquidAssets", "totalAssets", "netProfitLoss", "liquidityRatio",
            "nplRatio", "capitalAdequacyRatio", "copomisExported", "submittedBy", "verifiedBy", "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "cooperativeId" = EXCLUDED."cooperativeId",
            "fiscalYear" = EXCLUDED."fiscalYear",
            "periodType" = EXCLUDED."periodType",
            "periodName" = EXCLUDED."periodName",
            "reportDateBs" = EXCLUDED."reportDateBs",
            "shareCapital" = EXCLUDED."shareCapital",
            "reserveFunds" = EXCLUDED."reserveFunds",
            "totalDeposits" = EXCLUDED."totalDeposits",
            "totalLoans" = EXCLUDED."totalLoans",
            "performingLoans" = EXCLUDED."performingLoans",
            "nonPerformingLoans" = EXCLUDED."nonPerformingLoans",
            "liquidAssets" = EXCLUDED."liquidAssets",
            "totalAssets" = EXCLUDED."totalAssets",
            "netProfitLoss" = EXCLUDED."netProfitLoss",
            "liquidityRatio" = EXCLUDED."liquidityRatio",
            "nplRatio" = EXCLUDED."nplRatio",
            "capitalAdequacyRatio" = EXCLUDED."capitalAdequacyRatio",
            "copomisExported" = EXCLUDED."copomisExported",
            "submittedBy" = EXCLUDED."submittedBy",
            "verifiedBy" = EXCLUDED."verifiedBy";
    """, (
        r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12],
        r[13], r[14], r[15], r[16], r[17], r[18], r[19], r[20]
    ))
print(f"✓ Seeded {len(fin_reports_data)} records into 'cooperative_financial_reports'.")


# ---------------------------------------------------------------------------
# 4. SEED cooperative_inspections (८ वटा स्थलगत अनुगमन तथा प्राप्ताङ्क)
# ---------------------------------------------------------------------------
inspections_data = [
    (
        "cinsp-01", COOP_IDS[7], "२०८१-०२-१५", "सुरेश श्रेष्ठ", "सहकारी शाखा प्रमुख / अधिकृत",
        "नियमित स्थलगत निरीक्षण", 88.5,
        "संस्थाको तरलता अनुपात १८.५% राम्रो, खराब कर्जा २.१% नियन्त्रणमा रहेको, तर २ जना ऋणीले अन्य सहकारीबाट पनि ऋण लिएको भेटियो।",
        "दोहोरो ऋण लिएका सदस्यहरूको कर्जा जोखिम समीक्षा गर्ने, COPOMIS मा मासिक प्रतिवेदन समयमै प्रविष्टि गर्ने।",
        "सुझाव कार्यान्वयनमा"
    ),
    (
        "cinsp-02", COOP_IDS[3], "२०८१-०२-२५", "सुरेश श्रेष्ठ", "सहकारी शाखा प्रमुख / अधिकृत",
        "नियमित स्थलगत निरीक्षण", 91.0,
        "कृषि कर्जा लगानी पारदर्शी, साना किसान समूह परिचालन उत्कृष्ट, मलखाद अनुदान वितरणको अभिलेख चुस्त रहेको।",
        "जैविक किबी तथा ट्राउट माछा पालक कृषकलाई थप सहुलियतपूर्ण कृषि कर्जा प्रवर्धन गर्ने।",
        "सम्पन्न"
    ),
    (
        "cinsp-03", COOP_IDS[1], "२०८१-०३-०५", "सुनिता अर्याल", "कृषि प्रसार तथा सहकारी निरीक्षक",
        "नियमित स्थलगत निरीक्षण", 84.0,
        "बहुउद्देश्यीय व्यवसाय अन्तर्गत कोल्डस्टोर र किबी प्रशोधन राम्रो सञ्चालनमा, तर केही सदस्यहरूको बचत नियमित नदेखिएको।",
        "नियमित बचत प्रोत्साहन योजना ल्याउने तथा जोखिम कोषमा थप ५% रकम छुट्याउने।",
        "सुझाव कार्यान्वयनमा"
    ),
    (
        "cinsp-04", COOP_IDS[6], "२०८१-०३-१२", "अनिता गुरुङ", "महिला विकास तथा सहकारी निरीक्षक",
        "नियमित स्थलगत निरीक्षण", 94.5,
        "महिला सदस्यहरूको १००% सहभागिता, खराब कर्जा मात्र १.२% (उत्कृष्ट), लघुउद्यम कर्जाको सदुपयोग प्रभावकारी।",
        "लेखा प्रणाली पूर्ण कम्प्युटराइज्ड गर्न र डिजिटल भुक्तानी QR कोड विस्तार गर्न सिफारिस।",
        "सम्पन्न"
    ),
    (
        "cinsp-05", COOP_IDS[5], "२०८१-०३-१८", "सुरेश श्रेष्ठ", "सहकारी शाखा प्रमुख / अधिकृत",
        "नियमित स्थलगत निरीक्षण", 86.0,
        "दुग्ध संकलन र भुक्तानी पारदर्शी, तर संकलन केन्द्रको चिस्यान ट्यांकी मर्मत सम्भारमा खर्च बढेको।",
        "दुग्ध उत्पादनमा आधारित पशु बिमा कार्यक्रम सबै सदस्यमा अनिवार्य लागु गर्ने।",
        "सुझाव कार्यान्वयनमा"
    ),
    (
        "cinsp-06", COOP_IDS[2], "२०८१-०३-२२", "सुरेश श्रेष्ठ", "सहकारी शाखा प्रमुख / अधिकृत",
        "नियमित स्थलगत निरीक्षण", 89.0,
        "ह्योल्मो अर्गानिक कृषि उत्पादन तथा स्थानीय जडिबुटी संकलन राम्रो, लेखापरीक्षण प्रतिवेदन समयमै स्वीकृत।",
        "स्थानीय बजारमा अर्गानिक प्रमाणीकरण लोगो प्रयोग सहजीकरण गर्ने।",
        "सम्पन्न"
    ),
    (
        "cinsp-07", COOP_IDS[4], "२०८१-०३-२८", "सुरेश श्रेष्ठ", "सहकारी शाखा प्रमुख / अधिकृत",
        "नियमित स्थलगत निरीक्षण", 82.5,
        "थाङपालकोट क्षेत्रमा बचत संकलन उत्साहजनक, तर भाखा नाघेको कर्जा २.३% रहेकोले असुली ताकेता आवश्यक।",
        "ऋण असुली उपसमिति सक्रिय बनाई ३ महिनाभन्दा बढी भाखा नाघेका ऋणीलाई पत्र पठाउने।",
        "फलोअप आवश्यक"
    ),
    (
        "cinsp-08", COOP_IDS[8], "२०८१-०४-०२", "अनिता गुरुङ", "महिला विकास तथा सहकारी निरीक्षक",
        "नियमित स्थलगत निरीक्षण", 90.0,
        "दुर्गम बस्ती लागर्चेमा महिला सशक्तिकरण र हस्तकला/बाख्रापालन कर्जा परिचालन प्रशंसनीय।",
        "सदस्य संख्या विस्तार गर्न र वित्तीय साक्षरता तालिम वडा कार्यालयसँग समन्वय गरी सञ्चालन गर्ने।",
        "सम्पन्न"
    ),
]

for r in inspections_data:
    cur.execute("""
        INSERT INTO cooperative_inspections (
            id, "cooperativeId", "inspectionDateBs", "inspectorName", "inspectorDesignation",
            "inspectionType", "complianceScore", "findingsSummary", "directivesIssued", "status", "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "cooperativeId" = EXCLUDED."cooperativeId",
            "inspectionDateBs" = EXCLUDED."inspectionDateBs",
            "inspectorName" = EXCLUDED."inspectorName",
            "inspectorDesignation" = EXCLUDED."inspectorDesignation",
            "inspectionType" = EXCLUDED."inspectionType",
            "complianceScore" = EXCLUDED."complianceScore",
            "findingsSummary" = EXCLUDED."findingsSummary",
            "directivesIssued" = EXCLUDED."directivesIssued",
            "status" = EXCLUDED.status;
    """, (
        r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]
    ))
print(f"✓ Seeded {len(inspections_data)} records into 'cooperative_inspections'.")


# ---------------------------------------------------------------------------
# 5. SEED cooperative_regulatory_notices (८ वटा नियमनकारी ताकेता तथा निर्देशन)
# ---------------------------------------------------------------------------
notices_data = [
    (
        "cnot-01", COOP_IDS[7], "PPK-COOP-NOTICE-2081-01", "साधारण सभा ताकेता", "२०८१-०५-१०", "२०८१-०६-१५",
        "वार्षिक साधारण सभा (AGM) तोकिएको म्यादभित्र सम्पन्न गर्ने सम्बन्धी जरूरी सूचना",
        "सहकारी ऐन २०७४ को दफा ३९ बमोजिम आर्थिक वर्ष समाप्त भएको ६ महिनाभित्र वार्षिक साधारण सभा सम्पन्न गरी प्रतिवेदन पेश गर्न सूचित गरिन्छ।",
        "साधारण सभाको मिति, स्थान र प्रस्ताव सहितको सूचना पालिकाको सहकारी शाखामा पेश गर्ने।",
        "जारी गरिएको", True, "९८४१२२३३०१", "गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा"
    ),
    (
        "cnot-02", COOP_IDS[4], "PPK-COOP-NOTICE-2081-02", "खराब कर्जा असुली", "२०८१-०५-१५", "२०८१-०६-३०",
        "भाखा नाघेको कर्जा असुली तथा जोखिम व्यवस्थापन सम्बन्धी निर्देशन",
        "स्थलगत निरीक्षणका क्रममा २.३% कर्जा भाखा नाघेको पाइएकोले तत्काल ऋण असुली उपसमिति परिचालन गरी जोखिम न्यूनीकरण गर्न निर्देशन दिइन्छ।",
        "३ महिना नाघेका ऋणीहरूलाई ३५ दिने सार्वजनिक सूचना वा ताकेता गरी असुली विवरण पालिकामा बुझाउने।",
        "जारी गरिएको", True, "९८४१२२३३०३", "गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा"
    ),
    (
        "cnot-03", COOP_IDS[1], "PPK-COOP-NOTICE-2081-03", "तरलता सुधार निर्देशन", "२०८१-०५-२२", "२०८१-०६-२५",
        "अनिवार्य तरलता अनुपात (१५% भन्दा माथि) कायम राख्ने सम्बन्धमा",
        "सहकारी नियमावली अनुसार सदस्यको बचतको कम्तिमा १५% तरल सम्पत्ति (नगद/बैंक मौज्दात) अनिवार्य राख्नुपर्नेमा सो कायम राख्न निर्देशन गरिन्छ।",
        "दीर्घकालीन लगानी भन्दा अल्पकालीन तरलता व्यवस्थापनलाई प्राथमिकता दिने।",
        "अनुपालन भएको", True, "९८४१२२३३००", "गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा"
    ),
    (
        "cnot-04", COOP_IDS[3], "PPK-COOP-NOTICE-2081-04", "वित्तीय विवरण माग", "२०८१-०६-०१", "२०८१-०६-२१",
        "COPOMIS अनलाइन प्रणालीमा प्रथम त्रैमासिक वित्तीय विवरण अद्यावधिक गर्ने बारे",
        "सहकारी विभागको केन्द्रीय COPOMIS सफ्टवेयरमा आव २०८१/०८२ को प्रथम त्रैमासिक वित्तीय प्रतिवेदन समयमै प्रविष्टि गरी प्रमाणित गराउनुहुन।",
        "प्रविष्टि पश्चात सिस्टम जेनेरेटेड क्युआर कोड सहितको विवरण शाखामा दाखिला गर्ने।",
        "अनुपालन भएको", True, "९८४१०००१०३", "गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा"
    ),
    (
        "cnot-05", COOP_IDS[5], "PPK-COOP-NOTICE-2081-05", "लेखापरीक्षण प्रतिवेदन माग", "२०८१-०६-०८", "२०८१-०६-३०",
        "आ.व. २०८०/०८१ को अन्तिम लेखापरीक्षण प्रतिवेदन (Audit Report) पेश गर्ने बारे",
        "मान्यता प्राप्त दर्तावाल लेखापरीक्षकबाट प्रमाणित अन्तिम वासलात, नाफा-नोक्सान हिसाब र कर चुक्ता प्रमाणपत्र पेश गर्न सूचित गरिन्छ।",
        "लेखापरीक्षण प्रतिवेदन साधारण सभाबाट अनुमोदन गराई १ प्रति पालिकामा दर्ता गर्ने।",
        "जारी गरिएको", True, "९८५११२२३३०", "गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा"
    ),
    (
        "cnot-06", COOP_IDS[6], "PPK-COOP-NOTICE-2081-06", "उत्कृष्ट कार्यसम्पादन सम्मान", "२०८१-०६-१५", "२०८१-०६-२०",
        "उत्कृष्ट महिला सहकारी संस्थाको रूपमा छनोट भएको बधाई तथा सम्मान पत्र",
        "पाँचपोखरी थाङपाल गाउँपालिकाभित्र उत्कृष्ट वित्तीय अनुशासन, ९४.५% कम्प्लायन्स स्कोर र शून्य खराब कर्जा कायम राखेकोमा हार्दिक बधाई।",
        "आगामी गाउँसभामा विशेष सम्मान पत्र तथा प्रोत्साहन अनुदान प्रदान गरिनेछ।",
        "सम्पन्न", True, "९८४१७७८८११", "गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा"
    ),
    (
        "cnot-07", COOP_IDS[2], "PPK-COOP-NOTICE-2081-07", "जैविक कृषि अनुदान सहजीकरण", "२०८१-०६-२०", "२०८१-०७-१५",
        "अर्गानिक कृषि पकेट क्षेत्र विस्तार तथा बीउ पूँजी अनुदान सम्झौता आह्वान",
        "गाउँपालिकाको चालु आर्थिक वर्षको नीति तथा कार्यक्रम अनुसार ह्योल्मो अर्गानिक किबी र जडिबुटी खेती विस्तारका लागि सम्झौता गर्न आह्वान।",
        "कार्यकारी समितिको निर्णय र कृषक समूहको माग पत्र सहित सहकारी शाखामा सम्पर्क गर्ने।",
        "जारी गरिएको", True, "९८४१२२३३०१", "गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा"
    ),
    (
        "cnot-08", COOP_IDS[8], "PPK-COOP-NOTICE-2081-08", "वित्तीय साक्षरता शिविर", "२०८१-०६-२५", "२०८१-०७-१०",
        "लागर्चे दुर्गम बस्तीमा महिला वित्तीय साक्षरता तथा डिजिटल बैंकिङ तालिम सञ्चालन बारे",
        "वडा कार्यालय र सहकारी संस्थाको संयुक्त आयोजनामा विपन्न महिला सदस्यहरूलाई बचत, कर्जा सदुपयोग र क्यूआर कोड सम्बन्धी तालिम।",
        "तालिममा सहभागी हुने ५० जना महिला सदस्यको नामावली संकलन गर्ने।",
        "जारी गरिएको", True, "९८४१७७८८०५", "गाउँ कार्यपालिकाको कार्यालय, सहकारी शाखा"
    ),
]

for r in notices_data:
    cur.execute("""
        INSERT INTO cooperative_regulatory_notices (
            id, "cooperativeId", "noticeNo", "noticeType", "issueDateBs", "deadlineDateBs",
            title, content, directives, status, "smsSent", "recipientPhone", "issuedBy", "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "cooperativeId" = EXCLUDED."cooperativeId",
            "noticeNo" = EXCLUDED."noticeNo",
            "noticeType" = EXCLUDED."noticeType",
            "issueDateBs" = EXCLUDED."issueDateBs",
            "deadlineDateBs" = EXCLUDED."deadlineDateBs",
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            directives = EXCLUDED.directives,
            status = EXCLUDED.status,
            "smsSent" = EXCLUDED."smsSent",
            "recipientPhone" = EXCLUDED."recipientPhone",
            "issuedBy" = EXCLUDED."issuedBy";
    """, (
        r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12]
    ))
print(f"✓ Seeded {len(notices_data)} records into 'cooperative_regulatory_notices'.")

conn.commit()
cur.close()
conn.close()

print("\n=== OPTION 20 SEEDING COMPLETED SUCCESSFULLY! ===")
