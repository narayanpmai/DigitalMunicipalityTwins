"""
Seed Script for Option 11: Agriculture & Livestock Management
Panchpokhari Thangpal Gaupalika (8 Wards)
Digital Twin System
"""

import sys
import json
import uuid
import datetime
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")

DB_URI = "postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital"
TENANT_ID = "panchpokhari"

# ==============================================================================
# Helper Nepali Unicode Strings
# ==============================================================================
# Wards & Villages
V_BANSKHARKA  = "\u092c\u093e\u0901\u0938\u0916\u0930\u094d\u0915"          # बाँसखर्क (Ward 1)
V_BARUWA      = "\u092c\u0930\u0941\u0935\u093e"              # बरुवा (Ward 2)
V_BHOTANG     = "\u092d\u094b\u0924\u093e\u0919"              # भोताङ (Ward 3 / 7)
V_THANGPALDHAP= "\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a"      # थाङपालधाप (Ward 4)
V_GUNSA       = "\u0917\u0941\u0928\u094d\u0938\u093e"          # गुन्सा (Ward 5)
V_THANGPALKOT = "\u0925\u093e\u0919\u092a\u093e\u0932\u0915\u094b\u091f"      # थाङपालकोट (Ward 6)
V_MANEKHARKA  = "\u092e\u093e\u0928\u0947\u0916\u0930\u094d\u0915"          # मानेखर्क
V_LAGARCHE    = "\u0932\u093e\u0917\u093e\u0930\u094d\u091a\u0947"          # लागार्चे (Ward 8)
V_TIPENI      = "\u0924\u093f\u092a\u0947\u0928\u0940"            # तिपेनी

# Farmer Categories
CAT_SMALL     = "\u0938\u093e\u0928\u093e \u0915\u093f\u0938\u093e\u0928 (\u0968-\u0967\u0966 \u0930\u094b\u092a\u0928\u0940)"
CAT_MARGINAL  = "\u0938\u0940\u092e\u093e\u0928\u094d\u0924\u0915\u0943\u0924 \u0915\u093f\u0938\u093e\u0928 (<\u0968 \u0930\u094b\u092a\u0928\u0940)"
CAT_COMMERCIAL= "\u0935\u094d\u092f\u093e\u0935\u0938\u093e\u092f\u093f\u0915 \u0915\u093f\u0938\u093e\u0928 (>\u0967\u0966 \u0930\u094b\u092a\u0928\u0940)"

STATUS_VERIFIED = "\u092a\u094d\u0930\u092e\u093e\u0923\u093f\u0924 (Verified)"
G_MALE          = "\u092a\u0941\u0930\u0941\u0937"
G_FEMALE        = "\u092e\u0939\u093f\u0932\u093e"

BANK_ADBL = "\u0915\u0943\u0937\u093f \u0935\u093f\u0915\u093e\u0938 \u092c\u0948\u0902\u0915 (ADBL)"
BANK_NBL  = "\u0928\u0947\u092a\u093e\u0932 \u092c\u0948\u0902\u0915 \u0932\u093f\u092e\u093f\u091f\u0947\u0921"
BANK_RBB  = "\u0930\u093e\u0937\u094d\u0920\u094d\u0930\u093f\u092f \u092c\u093e\u0923\u093f\u091c\u094d\u092f \u092c\u0948\u0902\u0915"


def seed_livestock_records(cur):
    """Seed livestock_records for all 8 wards."""
    print("--- 1. Seeding livestock_records ---")
    data = [
        # (id, wardNumber, fiscalYear, cattle, buffaloes, goats, sheep, pigs, poultry, yaks, milk_liters, meat_kg, wool_kg, hh_count, notes)
        ("a1000000-0000-0000-0000-000000000001", 1, "2080/081", 420, 280, 1150, 40,  95,  3800, 0,   1250.0, 14200.0, 50.0,   340, "\u092c\u093e\u0901\u0938\u0916\u0930\u094d\u0915 - \u0917\u093e\u0908\u092d\u0948\u0901\u0938\u0940 \u0924\u0925\u093e \u092c\u093e\u0916\u094d\u0930\u093e\u092a\u093e\u0932\u0928 \u092a\u094d\u0930\u092e\u0941\u0916"),
        ("a1000000-0000-0000-0000-000000000002", 2, "2080/081", 380, 240, 980,  65,  110, 3100, 0,   1020.0, 12500.0, 80.0,   295, "\u092c\u0930\u0941\u0935\u093e - \u092a\u0936\u0941\u092a\u093e\u0932\u0928 \u0924\u0925\u093e \u092c\u093e\u0916\u094d\u0930\u093e \u092a\u093e\u0932\u0928 \u0915\u0947\u0928\u094d\u0926\u094d\u0930"),
        ("a1000000-0000-0000-0000-000000000003", 3, "2080/081", 450, 310, 1340, 120, 85,  4200, 15,  1450.0, 16800.0, 180.0,  380, "\u092d\u094b\u0924\u093e\u0919/\u092e\u093e\u0928\u0947\u0916\u0930\u094d\u0915 - \u0926\u0941\u0917\u094d\u0927 \u0909\u0924\u094d\u092a\u093e\u0926\u0928 \u0924\u0925\u093e \u0938\u0902\u0915\u0932\u0928 \u0915\u0947\u0928\u094d\u0926\u094d\u0930"),
        ("a1000000-0000-0000-0000-000000000004", 4, "2080/081", 510, 390, 1420, 50,  60,  5500, 0,   1820.0, 18400.0, 60.0,   410, "\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a - \u0935\u094d\u092f\u093e\u0935\u0938\u093e\u092f\u093f\u0915 \u0917\u093e\u0908 \u0924\u0925\u093e \u0915\u0941\u0916\u0941\u0930\u093e\u092a\u093e\u0932\u0928"),
        ("a1000000-0000-0000-0000-000000000005", 5, "2080/081", 340, 190, 890,  140, 75,  2800, 25,  890.0,  10900.0, 220.0,  260, "\u0917\u0941\u0928\u094d\u0938\u093e - \u092e\u093f\u0936\u094d\u0930\u093f\u0924 \u092a\u0936\u0941\u092a\u093e\u0932\u0928 \u0924\u0925\u093e \u092d\u0947\u0921\u093e\u092a\u093e\u0932\u0928"),
        ("a1000000-0000-0000-0000-000000000006", 6, "2080/081", 290, 120, 760,  310, 45,  1900, 85,  780.0,  9200.0,  550.0,  230, "\u0925\u093e\u0919\u092a\u093e\u0932\u0915\u094b\u091f - \u091a\u094c\u0902\u0930\u0940, \u092d\u0947\u0921\u093e \u0924\u0925\u093e \u091b\u0941\u0930\u094d\u092a\u0940 \u0909\u0924\u094d\u092a\u093e\u0926\u0928"),
        ("a1000000-0000-0000-0000-000000000007", 7, "2080/081", 210, 70,  650,  480, 30,  1400, 145, 620.0,  8100.0,  980.0,  210, "\u092d\u094b\u0924\u093e\u0919 - \u0909\u091a\u094d\u091a \u0939\u093f\u092e\u093e\u0932\u0940 \u091a\u094c\u0902\u0930\u0940 \u0924\u0925\u093e \u092d\u0947\u0921\u093e \u0917\u094b\u0920 \u0915\u0947\u0928\u094d\u0926\u094d\u0930"),
        ("a1000000-0000-0000-0000-000000000008", 8, "2080/081", 180, 45,  520,  620, 20,  1100, 230, 540.0,  7400.0,  1420.0, 185, "\u0932\u093e\u0917\u093e\u0930\u094d\u091a\u0947/\u092a\u093e\u0901\u091a\u092a\u094b\u0916\u0930\u0940 - \u092a\u094d\u0930\u092e\u0941\u0916 \u092f\u093e\u0915/\u091a\u094c\u0902\u0930\u0940 \u0924\u0925\u093e \u090a\u0928 \u0909\u0924\u094d\u092a\u093e\u0926\u0928 \u0915\u094d\u0937\u0947\u0924\u094d\u0930"),
    ]
    query = """
        INSERT INTO livestock_records (
            id, tenant_id, "wardNumber", "fiscalYear", cattle, buffaloes, goats, sheep,
            pigs, poultry, yaks, "milkProductionLiters", "meatProductionKg",
            "woolProductionKg", "totalHouseholdsRearing", notes, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            cattle = EXCLUDED.cattle,
            buffaloes = EXCLUDED.buffaloes,
            goats = EXCLUDED.goats,
            sheep = EXCLUDED.sheep,
            pigs = EXCLUDED.pigs,
            poultry = EXCLUDED.poultry,
            yaks = EXCLUDED.yaks,
            "milkProductionLiters" = EXCLUDED."milkProductionLiters",
            "meatProductionKg" = EXCLUDED."meatProductionKg",
            "woolProductionKg" = EXCLUDED."woolProductionKg",
            "totalHouseholdsRearing" = EXCLUDED."totalHouseholdsRearing",
            notes = EXCLUDED.notes,
            "updatedAt" = NOW();
    """
    for r in data:
        cur.execute(query, (
            r[0], TENANT_ID, r[1], r[2], r[3], r[4], r[5], r[6],
            r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[14]
        ))
    print(f"  Inserted/Updated {len(data)} livestock_records.")


def seed_agriculture_crops(cur):
    """Seed comprehensive crop data for all 8 wards."""
    print("--- 2. Seeding agriculture_data (crops) ---")
    crops = [
        # (id, ward, cropName, cropType, areaHectares, productionMt, fiscalYear)
        # Ward 1 (Banskharka - Fruit & Veg focus)
        ("90000000-0000-0000-0000-000000000101", 1, "\u0927\u093e\u0928 (Paddy)", "cereal", 65.0, 195.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000102", 1, "\u092e\u0915\u0948 (Maize)", "cereal", 110.0, 310.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000103", 1, "\u0938\u0941\u0928\u094d\u0924\u0932\u093e \u0924\u0925\u093e \u0915\u093e\u0917\u0924\u0940 (Citrus)", "fruit", 45.0, 220.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000104", 1, "\u0915\u094b\u0926\u094b (Finger Millet)", "cereal", 40.0, 52.0, "2080/081"),

        # Ward 2 (Baruwa)
        ("90000000-0000-0000-0000-000000000201", 2, "\u092e\u0915\u0948 (Maize)", "cereal", 135.0, 385.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000202", 2, "\u0915\u094b\u0926\u094b (Finger Millet)", "cereal", 75.0, 98.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000203", 2, "\u0906\u0932\u0941 (Potato)", "vegetable", 55.0, 680.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000204", 2, "\u0905\u0932\u0948\u0902\u091a\u0940 (Cardamom)", "cash_crop", 22.0, 31.0, "2080/081"),

        # Ward 3 (Manechaur / Bhotang)
        ("90000000-0000-0000-0000-000000000301", 3, "\u092e\u0915\u0948 (Maize)", "cereal", 120.0, 350.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000302", 3, "\u0906\u0932\u0941 (Potato)", "vegetable", 60.0, 850.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000303", 3, "\u0915\u093f\u0935\u0940 \u092b\u0932 (Kiwi Fruit)", "fruit", 28.0, 115.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000304", 3, "\u092c\u0947\u092e\u094c\u0938\u092e\u0940 \u0924\u0930\u0915\u093e\u0930\u0940 (Vegetables)", "vegetable", 35.0, 380.0, "2080/081"),

        # Ward 4 (Thangpaldhap - River basin / Rice bowl)
        ("90000000-0000-0000-0000-000000000401", 4, "\u0927\u093e\u0928 (Paddy)", "cereal", 115.0, 390.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000402", 4, "\u0917\u0939\u0941\u0901 (Wheat)", "cereal", 70.0, 160.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000403", 4, "\u092e\u0915\u0948 (Maize)", "cereal", 95.0, 285.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000404", 4, "\u0915\u093e\u0909\u0932\u0940 \u0930 \u092c\u0928\u094d\u0926\u093e (Cabbage & Cauliflower)", "vegetable", 40.0, 480.0, "2080/081"),

        # Ward 5 (Gunsa)
        ("90000000-0000-0000-0000-000000000501", 5, "\u0905\u0932\u0948\u0902\u091a\u0940 (Cardamom)", "cash_crop", 45.0, 62.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000502", 5, "\u092e\u0915\u0948 (Maize)", "cereal", 90.0, 245.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000503", 5, "\u0915\u094b\u0926\u094b (Finger Millet)", "cereal", 50.0, 65.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000504", 5, "\u0906\u0932\u0941 (Potato)", "vegetable", 42.0, 520.0, "2080/081"),

        # Ward 6 (Thangpalkot - High Elevation)
        ("90000000-0000-0000-0000-000000000601", 6, "\u092b\u093e\u092a\u0930 (Buckwheat)", "cereal", 55.0, 72.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000602", 6, "\u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0930\u093e\u0924\u094b \u0906\u0932\u0941 (Red Potato)", "vegetable", 75.0, 1100.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000603", 6, "\u091c\u094c (Barley)", "cereal", 38.0, 48.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000604", 6, "\u0938\u094d\u092f\u093e\u0909 \u0924\u0925\u093e \u0913\u0916\u0930 (Apple & Walnut)", "fruit", 25.0, 68.0, "2080/081"),

        # Ward 7 (Bhotang - Alpine Highland)
        ("90000000-0000-0000-0000-000000000701", 7, "\u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0906\u0932\u0941 (Highland Potato)", "vegetable", 85.0, 1350.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000702", 7, "\u092b\u093e\u092a\u0930 (Buckwheat)", "cereal", 60.0, 78.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000703", 7, "\u091c\u094c (Barley)", "cereal", 45.0, 56.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000704", 7, "\u0938\u094d\u092f\u093e\u0909 (Apple)", "fruit", 20.0, 55.0, "2080/081"),

        # Ward 8 (Lagarche / Panchpokhari)
        ("90000000-0000-0000-0000-000000000801", 8, "\u0939\u093f\u092e\u093e\u0932\u0940 \u0906\u0932\u0941 (Alpine Potato)", "vegetable", 95.0, 1480.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000802", 8, "\u092b\u093e\u092a\u0930 (Buckwheat)", "cereal", 50.0, 64.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000803", 8, "\u091c\u094c (Barley)", "cereal", 35.0, 42.0, "2080/081"),
        ("90000000-0000-0000-0000-000000000804", 8, "\u091c\u0921\u0940\u092c\u0941\u091f\u0940 \u0924\u0925\u093e \u091a\u093f\u0930\u093e\u0907\u0924\u094b (Medicinal Herbs)", "cash_crop", 18.0, 12.0, "2080/081"),
    ]
    query = """
        INSERT INTO agriculture_data (
            id, "wardNumber", "cropName", "cropType", "areaHectares", "productionMt",
            "fiscalYear", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "wardNumber" = EXCLUDED."wardNumber",
            "cropName" = EXCLUDED."cropName",
            "cropType" = EXCLUDED."cropType",
            "areaHectares" = EXCLUDED."areaHectares",
            "productionMt" = EXCLUDED."productionMt",
            "fiscalYear" = EXCLUDED."fiscalYear",
            "updatedAt" = NOW();
    """
    for c in crops:
        cur.execute(query, c)
    print(f"  Inserted/Updated {len(crops)} crop records.")


def seed_farmers(cur):
    """Seed 48 farmers across all 8 wards with subsidies & soil health cards."""
    print("--- 3. Seeding agriculture_farmers (48 farmers) ---")
    
    # Template farmers per ward (6 per ward)
    raw_farmers = [
        # Ward 1
        (1, "FARM-W01-001", "\u0926\u094b\u0930\u094d\u091c\u0947 \u0924\u093e\u092e\u093e\u0919", G_MALE, "27-01-72-00101", "9841101001", V_BANSKHARKA, CAT_SMALL, 4.5, "\u0927\u093e\u0928, \u092e\u0915\u0948, \u0938\u0941\u0928\u094d\u0924\u0932\u093e", "\u0917\u093e\u0908 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u096a", BANK_ADBL, "01100000000001", 35000, 6.2),
        (1, "FARM-W01-002", "\u092e\u093e\u092f\u093e \u0924\u093e\u092e\u093e\u0919", G_FEMALE, "27-01-75-00102", "9841101002", V_BANSKHARKA, CAT_MARGINAL, 1.8, "\u092e\u0915\u0948, \u0924\u0930\u0915\u093e\u0930\u0940", "\u092c\u093e\u0916\u094d\u0930\u093e \u0969, \u0915\u0941\u0916\u0941\u0930\u093e \u0968\u0966", BANK_NBL, "01100000000002", 12000, 5.9),
        (1, "FARM-W01-003", "\u0915\u0943\u0937\u094d\u0923 \u092a\u094d\u0930\u0938\u093e\u0926 \u0926\u0919\u094d\u0917\u093e\u0932", G_MALE, "27-01-68-00103", "9841101003", V_BANSKHARKA, CAT_COMMERCIAL, 12.0, "\u0938\u0941\u0928\u094d\u0924\u0932\u093e, \u0915\u093f\u0935\u0940, \u0927\u093e\u0928", "\u092d\u0948\u0901\u0938\u0940 \u0969, \u0917\u093e\u0908 \u0968", BANK_RBB, "01100000000003", 55000, 6.4),
        (1, "FARM-W01-004", "\u0938\u0941\u0928\u093f\u0924\u093e \u0926\u0928\u0941\u0935\u093e\u0930", G_FEMALE, "27-01-76-00104", "9841101004", V_BANSKHARKA, CAT_SMALL, 3.2, "\u0927\u093e\u0928, \u0915\u094b\u0926\u094b, \u0924\u0930\u0915\u093e\u0930\u0940", "\u092c\u093e\u0916\u094d\u0930\u093e \u096b", BANK_ADBL, "01100000000004", 18000, 6.0),
        (1, "FARM-W01-005", "\u0930\u093e\u092e \u0915\u093e\u0928\u094d\u091b\u093e \u0924\u093e\u092e\u093e\u0919", G_MALE, "27-01-70-00105", "9841101005", V_BANSKHARKA, CAT_SMALL, 5.0, "\u092e\u0915\u0948, \u0938\u0941\u0928\u094d\u0924\u0932\u093e, \u0905\u0926\u0941\u0935\u093e", "\u0917\u093e\u0908 \u0967, \u092c\u093e\u0916\u094d\u0930\u093e \u096c", BANK_NBL, "01100000000005", 25000, 6.1),
        (1, "FARM-W01-006", "\u092b\u0941\u0932\u092e\u093e\u092f\u093e \u0936\u094d\u0930\u0947\u0937\u094d\u0920", G_FEMALE, "27-01-73-00106", "9841101006", V_BANSKHARKA, CAT_MARGINAL, 2.0, "\u0924\u0930\u0915\u093e\u0930\u0940, \u092e\u0915\u0948", "\u0915\u0941\u0916\u0941\u0930\u093e \u096a\u0966, \u092c\u093e\u0916\u094d\u0930\u093e \u0968", BANK_ADBL, "01100000000006", 15000, 5.8),

        # Ward 2
        (2, "FARM-W02-001", "\u0938\u0941\u0930\u094d\u092f \u092c\u0939\u093e\u0926\u0941\u0930 \u0925\u092a\u0932\u093f\u092f\u093e", G_MALE, "27-01-69-00201", "9841102001", V_BARUWA, CAT_COMMERCIAL, 14.5, "\u092e\u0915\u0948, \u0906\u0932\u0941, \u0905\u0932\u0948\u0902\u091a\u0940", "\u0917\u093e\u0908 \u096a, \u092d\u0948\u0901\u0938\u0940 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u0967\u0966", BANK_ADBL, "01200000000001", 60000, 6.3),
        (2, "FARM-W02-002", "\u0932\u0915\u094d\u0937\u094d\u092e\u0940 \u092a\u094c\u0921\u0947\u0932", G_FEMALE, "27-01-74-00202", "9841102002", V_BARUWA, CAT_SMALL, 4.0, "\u092e\u0915\u0948, \u0915\u094b\u0926\u094b, \u0906\u0932\u0941", "\u092d\u0948\u0901\u0938\u0940 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u096a", BANK_RBB, "01200000000002", 20000, 6.1),
        (2, "FARM-W02-003", "\u092a\u093e\u0938\u093e\u0919 \u0924\u093e\u092e\u093e\u0919", G_MALE, "27-01-71-00203", "9841102003", V_BARUWA, CAT_SMALL, 6.0, "\u0906\u0932\u0941, \u0905\u0932\u0948\u0902\u091a\u0940, \u092e\u0915\u0948", "\u092c\u093e\u0916\u094d\u0930\u093e \u096e, \u0917\u093e\u0908 \u0968", BANK_NBL, "01200000000003", 40000, 5.9),
        (2, "FARM-W02-004", "\u091a\u092e\u094d\u092a\u093e \u092e\u093e\u092f\u093e \u0930\u093e\u0908", G_FEMALE, "27-01-77-00204", "9841102004", V_BARUWA, CAT_MARGINAL, 1.5, "\u0915\u094b\u0926\u094b, \u0924\u0930\u0915\u093e\u0930\u0940", "\u092c\u093e\u0916\u094d\u0930\u093e \u0969, \u092c\u0902\u0917\u0941\u0930 \u0968", BANK_ADBL, "01200000000004", 10000, 6.0),
        (2, "FARM-W02-005", "\u0915\u093e\u0928\u094d\u091b\u093e \u092e\u093e\u0928 \u0936\u094d\u0930\u0947\u0937\u094d\u0920", G_MALE, "27-01-67-00205", "9841102005", V_BARUWA, CAT_SMALL, 7.5, "\u092e\u0915\u0948, \u0906\u0932\u0941, \u092c\u0928\u094d\u0926\u093e", "\u0917\u093e\u0908 \u0968, \u092d\u0948\u0901\u0938\u0940 \u0967", BANK_RBB, "01200000000005", 30000, 6.2),
        (2, "FARM-W02-006", "\u0938\u0919\u094d\u0917\u0940\u0924\u093e \u0917\u0941\u0930\u0941\u0919", G_FEMALE, "27-01-78-00206", "9841102006", V_BARUWA, CAT_SMALL, 3.5, "\u0906\u0932\u0941, \u0924\u0930\u0915\u093e\u0930\u0940, \u0905\u0932\u0948\u0902\u091a\u0940", "\u092c\u093e\u0916\u094d\u0930\u093e \u096a", BANK_ADBL, "01200000000006", 18000, 5.7),

        # Ward 3
        (3, "FARM-W03-001", "\u0926\u093e\u0935\u093e \u091b\u093f\u0930\u093f\u0919 \u0936\u0947\u0930\u094d\u092a\u093e", G_MALE, "27-01-65-00301", "9841103001", V_MANEKHARKA, CAT_COMMERCIAL, 11.0, "\u0915\u093f\u0935\u0940, \u0906\u0932\u0941, \u092e\u0915\u0948", "\u0917\u093e\u0908 \u0969, \u091a\u094c\u0902\u0930\u0940 \u096a", BANK_ADBL, "01300000000001", 50000, 6.0),
        (3, "FARM-W03-002", "\u0938\u0941\u092e\u093f\u0924\u094d\u0930\u093e \u0928\u094d\u092f\u094c\u092a\u093e\u0928\u0947", G_FEMALE, "27-01-73-00302", "9841103002", V_MANEKHARKA, CAT_SMALL, 5.0, "\u092c\u0947\u092e\u094c\u0938\u092e\u0940 \u0924\u0930\u0915\u093e\u0930\u0940, \u0915\u093e\u0909\u0932\u0940", "\u0917\u093e\u0908 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u0969", BANK_NBL, "01300000000002", 35000, 6.3),
        (3, "FARM-W03-003", "\u0917\u0917\u0928 \u092c\u0939\u093e\u0926\u0941\u0930 \u0924\u093e\u092e\u093e\u0919", G_MALE, "27-01-70-00303", "9841103003", V_MANEKHARKA, CAT_SMALL, 6.5, "\u0906\u0932\u0941, \u092e\u0915\u0948, \u0915\u093f\u0935\u0940", "\u092d\u0948\u0901\u0938\u0940 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u096b", BANK_ADBL, "01300000000003", 28000, 5.9),
        (3, "FARM-W03-004", "\u0930\u0940\u0924\u093e \u092e\u093e\u092f\u093e \u092e\u093f\u091c\u093e\u0930", G_FEMALE, "27-01-76-00304", "9841103004", V_MANEKHARKA, CAT_MARGINAL, 1.8, "\u0924\u0930\u0915\u093e\u0930\u0940, \u0915\u094b\u0926\u094b", "\u092c\u093e\u0916\u094d\u0930\u093e \u096a", BANK_RBB, "01300000000004", 12000, 6.2),
        (3, "FARM-W03-005", "\u0928\u093f\u092e\u093e \u0924\u0947\u0928\u094d\u091c\u093f\u0902\u0917 \u0932\u093e\u092e\u093e", G_MALE, "27-01-66-00305", "9841103005", V_MANEKHARKA, CAT_SMALL, 8.0, "\u0906\u0932\u0941, \u0915\u093f\u0935\u0940, \u092b\u093e\u092a\u0930", "\u0917\u093e\u0908 \u0968, \u092d\u0947\u0921\u093e \u0967\u0968", BANK_ADBL, "01300000000005", 45000, 5.8),
        (3, "FARM-W03-006", "\u092a\u0947\u092e\u094d\u092c\u093e \u0921\u094b\u0932\u094d\u092e\u093e \u0936\u0947\u0930\u094d\u092a\u093e", G_FEMALE, "27-01-75-00306", "9841103006", V_MANEKHARKA, CAT_SMALL, 4.2, "\u0915\u093f\u0935\u0940, \u0924\u0930\u0915\u093e\u0930\u0940", "\u0917\u093e\u0908 \u0967, \u092c\u093e\u0916\u094d\u0930\u093e \u0969", BANK_NBL, "01300000000006", 22000, 6.1),

        # Ward 4
        (4, "FARM-W04-001", "\u092c\u093f\u0937\u094d\u0923\u0941 \u092a\u094d\u0930\u0938\u093e\u0926 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", G_MALE, "27-01-63-00401", "9841104001", V_THANGPALDHAP, CAT_COMMERCIAL, 16.0, "\u0927\u093e\u0928, \u0917\u0939\u0941\u0901, \u092e\u0915\u0948", "\u0917\u093e\u0908 \u096b (\u091c\u0930\u094d\u0938\u0940), \u092d\u0948\u0901\u0938\u0940 \u0968", BANK_ADBL, "01400000000001", 75000, 6.5),
        (4, "FARM-W04-002", "\u0930\u093e\u0927\u093f\u0915\u093e \u0905\u0927\u093f\u0915\u093e\u0930\u0940", G_FEMALE, "27-01-72-00402", "9841104002", V_THANGPALDHAP, CAT_SMALL, 5.5, "\u0927\u093e\u0928, \u0915\u093e\u0909\u0932\u0940, \u092c\u0928\u094d\u0926\u093e", "\u0917\u093e\u0908 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u096a", BANK_RBB, "01400000000002", 30000, 6.4),
        (4, "FARM-W04-003", "\u0939\u0930\u093f \u092d\u0915\u094d\u0924 \u091a\u094c\u0932\u093e\u0917\u093e\u0908", G_MALE, "27-01-68-00403", "9841104003", V_THANGPALDHAP, CAT_SMALL, 7.0, "\u0927\u093e\u0928, \u092e\u0915\u0948, \u0924\u094b\u0930\u0940", "\u092d\u0948\u0901\u0938\u0940 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u096c", BANK_NBL, "01400000000003", 25000, 6.2),
        (4, "FARM-W04-004", "\u0917\u0940\u0924\u093e \u0915\u0941\u092e\u093e\u0930\u0940 \u0925\u093e\u092a\u093e", G_FEMALE, "27-01-77-00404", "9841104004", V_THANGPALDHAP, CAT_MARGINAL, 1.9, "\u0924\u0930\u0915\u093e\u0930\u0940, \u0915\u0941\u0916\u0941\u0930\u093e\u092a\u093e\u0932\u0928", "\u0915\u0941\u0916\u0941\u0930\u093e \u0967\u0966\u0966, \u092c\u093e\u0916\u094d\u0930\u093e \u0968", BANK_ADBL, "01400000000004", 15000, 6.3),
        (4, "FARM-W04-005", "\u092c\u0932\u0930\u093e\u092e \u0924\u093f\u092e\u0932\u094d\u0938\u093f\u0928\u093e", G_MALE, "27-01-64-00405", "9841104005", V_THANGPALDHAP, CAT_COMMERCIAL, 10.5, "\u0927\u093e\u0928, \u0917\u0939\u0941\u0901, \u092c\u0947\u092e\u094c\u0938\u092e\u0940 \u0924\u0930\u0915\u093e\u0930\u0940", "\u0917\u093e\u0908 \u0969, \u092c\u093e\u0916\u094d\u0930\u093e \u096e", BANK_ADBL, "01400000000005", 48000, 6.6),
        (4, "FARM-W04-006", "\u0915\u092e\u0932\u093e \u0926\u0947\u0935\u0940 \u092c\u093f\u0915", G_FEMALE, "27-01-79-00406", "9841104006", V_THANGPALDHAP, CAT_MARGINAL, 1.2, "\u0924\u0930\u0915\u093e\u0930\u0940", "\u092c\u093e\u0916\u094d\u0930\u093e \u0969", BANK_RBB, "01400000000006", 8000, 6.0),

        # Ward 5
        (5, "FARM-W05-001", "\u0924\u093e\u0930\u093e \u092c\u0939\u093e\u0926\u0941\u0930 \u0924\u093e\u092e\u093e\u0919", G_MALE, "27-01-67-00501", "9841105001", V_GUNSA, CAT_COMMERCIAL, 13.0, "\u0905\u0932\u0948\u0902\u091a\u0940, \u0906\u0932\u0941, \u092e\u0915\u0948", "\u0917\u093e\u0908 \u0968, \u092d\u0947\u0921\u093e \u0967\u096b", BANK_ADBL, "01500000000001", 55000, 5.8),
        (5, "FARM-W05-002", "\u092e\u093e\u092f\u093e \u0926\u0947\u0935\u0940 \u0917\u093f\u0930\u0940", G_FEMALE, "27-01-74-00502", "9841105002", V_GUNSA, CAT_SMALL, 4.5, "\u092e\u0915\u0948, \u0915\u094b\u0926\u094b, \u0906\u0932\u0941", "\u092d\u0948\u0901\u0938\u0940 \u0967, \u092c\u093e\u0916\u094d\u0930\u093e \u096a", BANK_NBL, "01500000000002", 20000, 6.0),
        (5, "FARM-W05-003", "\u0938\u094b\u0928\u093e\u092e \u0936\u0947\u0930\u094d\u092a\u093e", G_MALE, "27-01-71-00503", "9841105003", V_GUNSA, CAT_SMALL, 6.0, "\u0905\u0932\u0948\u0902\u091a\u0940, \u092b\u093e\u092a\u0930", "\u091a\u094c\u0902\u0930\u0940 \u096b, \u092c\u093e\u0916\u094d\u0930\u093e \u096c", BANK_ADBL, "01500000000003", 38000, 5.6),
        (5, "FARM-W05-004", "\u0930\u0941\u092a\u093e \u0924\u093e\u092e\u093e\u0919", G_FEMALE, "27-01-78-00504", "9841105004", V_GUNSA, CAT_MARGINAL, 1.5, "\u0915\u094b\u0926\u094b, \u0924\u0930\u0915\u093e\u0930\u0940", "\u092c\u093e\u0916\u094d\u0930\u093e \u0969", BANK_RBB, "01500000000004", 10000, 5.9),
        (5, "FARM-W05-005", "\u0915\u0930\u094d\u092e\u093e \u0935\u093e\u0919\u094d\u0917\u0947\u0932 \u0932\u093e\u092e\u093e", G_MALE, "27-01-69-00505", "9841105005", V_GUNSA, CAT_SMALL, 7.0, "\u0905\u0932\u0948\u0902\u091a\u0940, \u0906\u0932\u0941", "\u0917\u093e\u0908 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u096b", BANK_ADBL, "01500000000005", 32000, 5.7),
        (5, "FARM-W05-006", "\u0936\u093e\u0928\u094d\u0924\u093f \u092e\u093e\u092f\u093e \u092a\u0930\u093f\u092f\u093e\u0930", G_FEMALE, "27-01-76-00506", "9841105006", V_GUNSA, CAT_MARGINAL, 1.4, "\u0924\u0930\u0915\u093e\u0930\u0940, \u092e\u0915\u0948", "\u092c\u093e\u0916\u094d\u0930\u093e \u0968", BANK_NBL, "01500000000006", 9000, 6.1),

        # Ward 6
        (6, "FARM-W06-001", "\u092b\u0941\u0930\u094d\u092c\u093e \u0924\u0938\u0947\u0930\u093f\u0919 \u0936\u0947\u0930\u094d\u092a\u093e", G_MALE, "27-01-64-00601", "9841106001", V_THANGPALKOT, CAT_COMMERCIAL, 15.0, "\u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0906\u0932\u0941, \u092b\u093e\u092a\u0930, \u0938\u094d\u092f\u093e\u0909", "\u091a\u094c\u0902\u0930\u0940 \u0967\u0968, \u092d\u0947\u0921\u093e \u0968\u096b", BANK_ADBL, "01600000000001", 65000, 5.5),
        (6, "FARM-W06-002", "\u091b\u0947\u0924\u0947\u0928 \u0921\u094b\u0932\u094d\u092e\u093e \u0932\u093e\u092e\u093e", G_FEMALE, "27-01-73-00602", "9841106002", V_THANGPALKOT, CAT_SMALL, 5.0, "\u0906\u0932\u0941, \u092b\u093e\u092a\u0930, \u091c\u094c", "\u091a\u094c\u0902\u0930\u0940 \u096a, \u092c\u093e\u0916\u094d\u0930\u093e \u096a", BANK_NBL, "01600000000002", 30000, 5.7),
        (6, "FARM-W06-003", "\u0926\u093e\u0935\u093e \u0928\u0941\u0930\u094d\u092c\u0941 \u0936\u0947\u0930\u094d\u092a\u093e", G_MALE, "27-01-68-00603", "9841106003", V_THANGPALKOT, CAT_SMALL, 7.5, "\u0906\u0932\u0941, \u0913\u0916\u0930, \u0938\u094d\u092f\u093e\u0909", "\u091a\u094c\u0902\u0930\u0940 \u096c, \u092d\u0947\u0921\u093e \u0967\u0966", BANK_ADBL, "01600000000003", 42000, 5.6),
        (6, "FARM-W06-004", "\u092e\u093e\u0907\u0932\u0940 \u0924\u093e\u092e\u093e\u0919", G_FEMALE, "27-01-77-00604", "9841106004", V_THANGPALKOT, CAT_MARGINAL, 1.8, "\u0906\u0932\u0941, \u091c\u094c", "\u092c\u093e\u0916\u094d\u0930\u093e \u096a", BANK_RBB, "01600000000004", 12000, 5.8),
        (6, "FARM-W06-005", "\u0917\u094d\u092f\u093e\u0932\u094d\u091c\u0947\u0928 \u0932\u093e\u092e\u093e", G_MALE, "27-01-66-00605", "9841106005", V_THANGPALKOT, CAT_SMALL, 6.0, "\u092b\u093e\u092a\u0930, \u0906\u0932\u0941", "\u091a\u094c\u0902\u0930\u0940 \u096b, \u092d\u0947\u0921\u093e \u0967\u0968", BANK_ADBL, "01600000000005", 35000, 5.4),
        (6, "FARM-W06-006", "\u0906\u0919 \u091b\u094b\u0915\u0940 \u0936\u0947\u0930\u094d\u092a\u093e", G_FEMALE, "27-01-75-00606", "9841106006", V_THANGPALKOT, CAT_SMALL, 3.8, "\u0938\u094d\u092f\u093e\u0909, \u0906\u0932\u0941", "\u0917\u093e\u0908 \u0968, \u092c\u093e\u0916\u094d\u0930\u093e \u0969", BANK_NBL, "01600000000006", 20000, 5.9),

        # Ward 7
        (7, "FARM-W07-001", "\u0928\u093f\u092e\u093e \u0935\u093e\u0919\u094d\u091a\u0941\u0915 \u0936\u0947\u0930\u094d\u092a\u093e", G_MALE, "27-01-62-00701", "9841107001", V_BHOTANG, CAT_COMMERCIAL, 18.0, "\u0906\u0932\u0941, \u092b\u093e\u092a\u0930", "\u091a\u094c\u0902\u0930\u0940 \u0968\u0966, \u092d\u0947\u0921\u093e \u096a\u0966", BANK_ADBL, "01700000000001", 85000, 5.3),
        (7, "FARM-W07-002", "\u092a\u093e\u0938\u093e\u0919 \u0932\u093e\u092e\u0941 \u0936\u0947\u0930\u094d\u092a\u093e", G_FEMALE, "27-01-72-00702", "9841107002", V_BHOTANG, CAT_SMALL, 6.0, "\u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0906\u0932\u0941, \u091c\u094c", "\u091a\u094c\u0902\u0930\u0940 \u096e, \u092d\u0947\u0921\u093e \u0967\u096b", BANK_NBL, "01700000000002", 40000, 5.5),
        (7, "FARM-W07-003", "\u0924\u0947\u0928\u094d\u091c\u093f\u0902\u0917 \u0928\u094b\u0930\u094d\u092c\u0941 \u0932\u093e\u092e\u093e", G_MALE, "27-01-67-00703", "9841107003", V_BHOTANG, CAT_SMALL, 8.5, "\u0906\u0932\u0941, \u092b\u093e\u092a\u0930, \u091c\u0921\u0940\u092c\u0941\u091f\u0940", "\u091a\u094c\u0902\u0930\u0940 \u0967\u0966, \u092d\u0947\u0921\u093e \u0968\u0966", BANK_ADBL, "01700000000003", 45000, 5.4),
        (7, "FARM-W07-004", "\u0926\u093e\u0935\u093e \u092b\u0941\u091f\u093f \u0936\u0947\u0930\u094d\u092a\u093e", G_FEMALE, "27-01-78-00704", "9841107004", V_BHOTANG, CAT_MARGINAL, 1.8, "\u0906\u0932\u0941, \u091c\u094c", "\u092d\u0947\u0921\u093e \u096b, \u092c\u093e\u0916\u094d\u0930\u093e \u0969", BANK_RBB, "01700000000004", 15000, 5.6),
        (7, "FARM-W07-005", "\u091b\u093f\u0930\u093f\u0919 \u0926\u094b\u0930\u094d\u091c\u0947 \u0924\u093e\u092e\u093e\u0919", G_MALE, "27-01-65-00705", "9841107005", V_BHOTANG, CAT_SMALL, 7.0, "\u0906\u0932\u0941, \u092b\u093e\u092a\u0930", "\u091a\u094c\u0902\u0930\u0940 \u096c, \u092d\u0947\u0921\u093e \u0967\u0968", BANK_ADBL, "01700000000005", 38000, 5.5),
        (7, "FARM-W07-006", "\u092f\u093e\u0919\u094d\u091c\u0940 \u0936\u0947\u0930\u094d\u092a\u093e", G_FEMALE, "27-01-76-00706", "9841107006", V_BHOTANG, CAT_SMALL, 4.0, "\u0906\u0932\u0941, \u0938\u094d\u092f\u093e\u0909", "\u091a\u094c\u0902\u0930\u0940 \u096a", BANK_NBL, "01700000000006", 25000, 5.7),

        # Ward 8
        (8, "FARM-W08-001", "\u092a\u0947\u092e\u094d\u092c\u093e \u0917\u094d\u092f\u093e\u0932\u094d\u091c\u0947\u0928 \u0936\u0947\u0930\u094d\u092a\u093e", G_MALE, "27-01-60-00801", "9841108001", V_LAGARCHE, CAT_COMMERCIAL, 20.0, "\u0939\u093f\u092e\u093e\u0932\u0940 \u0906\u0932\u0941, \u092b\u093e\u092a\u0930", "\u092f\u093e\u0915/\u091a\u094c\u0902\u0930\u0940 \u0969\u096b, \u092d\u0947\u0921\u093e \u096c\u0966", BANK_ADBL, "01800000000001", 95000, 5.2),
        (8, "FARM-W08-002", "\u0915\u093e\u0928\u094d\u091b\u0940 \u092e\u093e\u092f\u093e \u0924\u093e\u092e\u093e\u0919", G_FEMALE, "27-01-74-00802", "9841108002", V_LAGARCHE, CAT_SMALL, 5.5, "\u0906\u0932\u0941, \u091c\u094c", "\u091a\u094c\u0902\u0930\u0940 \u096e, \u092d\u0947\u0921\u093e \u0967\u0968", BANK_NBL, "01800000000002", 35000, 5.5),
        (8, "FARM-W08-003", "\u092e\u093f\u0919\u094d\u092e\u093e\u0930 \u0926\u094b\u0930\u094d\u091c\u0947 \u0936\u0947\u0930\u094d\u092a\u093e", G_MALE, "27-01-66-00803", "9841108003", V_LAGARCHE, CAT_COMMERCIAL, 14.0, "\u0906\u0932\u0941, \u091c\u0921\u0940\u092c\u0941\u091f\u0940", "\u091a\u094c\u0902\u0930\u0940 \u0968\u0968, \u092d\u0947\u0921\u093e \u096a\u096b", BANK_ADBL, "01800000000003", 75000, 5.3),
        (8, "FARM-W08-004", "\u0932\u093e\u0915\u094d\u092a\u093e \u0921\u093f\u0915\u0940 \u0936\u0947\u0930\u094d\u092a\u093e", G_FEMALE, "27-01-79-00804", "9841108004", V_LAGARCHE, CAT_MARGINAL, 1.9, "\u0906\u0932\u0941, \u092b\u093e\u092a\u0930", "\u092d\u0947\u0921\u093e \u096e", BANK_RBB, "01800000000004", 15000, 5.4),
        (8, "FARM-W08-005", "\u091b\u093f\u0930\u093f\u0919 \u0917\u094d\u092f\u093e\u0932\u094d\u092a\u094b \u0932\u093e\u092e\u093e", G_MALE, "27-01-68-00805", "9841108005", V_LAGARCHE, CAT_SMALL, 7.0, "\u0906\u0932\u0941, \u091c\u094c", "\u091a\u094c\u0902\u0930\u0940 \u0967\u0966, \u092d\u0947\u0921\u093e \u0967\u096e", BANK_ADBL, "01800000000005", 42000, 5.3),
        (8, "FARM-W08-006", "\u0926\u093f\u0915\u0940 \u0936\u0947\u0930\u094d\u092a\u093e", G_FEMALE, "27-01-77-00806", "9841108006", V_LAGARCHE, CAT_SMALL, 4.5, "\u0906\u0932\u0941, \u091c\u0921\u0940\u092c\u0941\u091f\u0940", "\u091a\u094c\u0902\u0930\u0940 \u096b", BANK_NBL, "01800000000006", 24000, 5.6),
    ]

    query = """
        INSERT INTO agriculture_farmers (
            id, tenant_id, "farmerId", "fullName", gender, "citizenshipNo", "contactPhone",
            "wardNumber", "toleVillage", "farmerCategory", "landAreaRopani", "majorCrops",
            "livestockDetails", "bankName", "bankAccountNo", "subsidiesHistory",
            "soilHealthCard", status, "registeredDateBs", remarks, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT ("farmerId") DO UPDATE SET
            "fullName" = EXCLUDED."fullName",
            gender = EXCLUDED.gender,
            "contactPhone" = EXCLUDED."contactPhone",
            "wardNumber" = EXCLUDED."wardNumber",
            "farmerCategory" = EXCLUDED."farmerCategory",
            "landAreaRopani" = EXCLUDED."landAreaRopani",
            "majorCrops" = EXCLUDED."majorCrops",
            "livestockDetails" = EXCLUDED."livestockDetails",
            "bankName" = EXCLUDED."bankName",
            "bankAccountNo" = EXCLUDED."bankAccountNo",
            "subsidiesHistory" = EXCLUDED."subsidiesHistory",
            "soilHealthCard" = EXCLUDED."soilHealthCard",
            status = EXCLUDED.status,
            "updatedAt" = NOW();
    """

    count = 0
    for idx, f in enumerate(raw_farmers, 1):
        uid = f"b1000000-0000-0000-0000-{idx:012d}"
        ward = f[0]
        farmer_code = f[1]
        name = f[2]
        gender = f[3]
        citizen = f[4]
        phone = f[5]
        village = f[6]
        cat = f[7]
        ropani = f[8]
        crops = f[9]
        livestock = f[10]
        bank = f[11]
        acct = f[12]
        subsidy_amt = f[13]
        soil_ph = f[14]

        # Subsidies JSON history
        subsidies = [
            {
                "programName": "\u096b\u0966% \u0905\u0928\u0941\u0926\u093e\u0928\u092e\u093e \u0915\u0943\u0937\u093f \u092f\u0928\u094d\u0924\u094d\u0930\u0940\u0915\u0930\u0923 \u0924\u0925\u093e \u092c\u0940\u0909 \u0935\u093f\u0924\u0930\u0923",
                "fiscalYear": "\u0968\u0966\u096e\u0966/\u0966\u096e\u0967",
                "subsidyAmount": subsidy_amt,
                "dateBs": "\u0968\u0966\u096e\u0966-\u0966\u096e-\u0967\u096b",
                "item": "\u092e\u093f\u0928\u0940 \u091f\u093f\u0932\u0930 / \u0909\u0928\u094d\u0928\u0924 \u092c\u0940\u0909 \u0935\u093f\u0924\u0930\u0923",
                "status": "\u0938\u092e\u094d\u092a\u0928\u094d\u0928"
            }
        ]

        # Soil health card JSON
        soil_card = {
            "cardNo": f"SHC-2081-W{ward:02d}-{idx:03d}",
            "ph": soil_ph,
            "nitrogen": "\u092e\u0927\u094d\u092f\u092e (Medium)",
            "phosphorus": "\u092e\u0927\u094d\u092f\u092e (Medium)",
            "potassium": "\u0909\u091a\u094d\u091a (High)",
            "organicMatter": "2.8%",
            "advisory": "\u0915\u092e\u094d\u092a\u094b\u0938\u094d\u091f \u092e\u0932 \u092a\u094d\u0930\u092f\u094b\u0917 \u0917\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d, \u091a\u0941\u0928 \u092a\u094d\u0930\u092f\u094b\u0917 \u0917\u0930\u094d\u0926\u093e \u092e\u093e\u091f\u094b\u0915\u094b \u0905\u092e\u094d\u0932\u0940\u092f\u0924\u093e \u0938\u0941\u0927\u093e\u0930 \u0939\u0941\u0928\u094d\u091b\u0964",
            "testDateBs": "\u0968\u0966\u096e\u0967-\u0966\u0968-\u0967\u0966",
            "status": "\u0909\u0924\u094d\u0915\u0943\u0937\u094d\u091f (Optimal)"
        }

        reg_date = "\u0968\u0966\u096e\u0966-\u0966\u096a-\u0967\u096b"
        remarks = f"\u0935\u0921\u093e \u0928\u0902. {ward} \u0915\u0943\u0937\u0915 \u0938\u0942\u091a\u0940\u0915\u0943\u0924"

        cur.execute(query, (
            uid, TENANT_ID, farmer_code, name, gender, citizen, phone,
            ward, village, cat, ropani, crops, livestock, bank, acct,
            json.dumps(subsidies, ensure_ascii=False),
            json.dumps(soil_card, ensure_ascii=False),
            STATUS_VERIFIED, reg_date, remarks
        ))
        count += 1
    print(f"  Inserted/Updated {count} farmers.")


def seed_fertilizer_stocks_and_distributions(cur):
    """Seed fertilizer depots, stocks, and farmer distribution records."""
    print("--- 4. Seeding fertilizer stocks & distributions ---")
    
    # 4 Depots: Thangpaldhap (W4), Manekharka (W3), Banskharka (W1), Bhotang (W7)
    depots = [
        # (id, depotName, ward, contactPerson, contactPhone, type, nepName, totalStock, distKg, availKg, subPrice, mktPrice)
        ("c0000000-0000-0000-0000-000000000001", "\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a \u0915\u0943\u0937\u093f \u0938\u0939\u0915\u093e\u0930\u0940 \u0921\u093f\u092a\u094b", 4, "\u0938\u0941\u0930\u0947\u0936 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", "9851120001", "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 15000.0, 6800.0, 8200.0, 18.0, 55.0),
        ("c0000000-0000-0000-0000-000000000002", "\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a \u0915\u0943\u0937\u093f \u0938\u0939\u0915\u093e\u0930\u0940 \u0921\u093f\u092a\u094b", 4, "\u0938\u0941\u0930\u0947\u0936 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", "9851120001", "DAP", "\u0921\u093f.\u090f.\u092a\u093f. (DAP)", 12000.0, 5400.0, 6600.0, 48.0, 105.0),

        ("c0000000-0000-0000-0000-000000000003", "\u092e\u093e\u0928\u0947\u0916\u0930\u094d\u0915 \u0915\u0943\u0937\u093f \u0938\u0947\u0935\u093e \u0915\u0947\u0928\u094d\u0926\u094d\u0930 \u0921\u093f\u092a\u094b", 3, "\u0926\u093f\u0928\u0947\u0936 \u0936\u094d\u0930\u0947\u0937\u094d\u0920", "9851120002", "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 10000.0, 4200.0, 5800.0, 18.0, 55.0),
        ("c0000000-0000-0000-0000-000000000004", "\u092e\u093e\u0928\u0947\u0916\u0930\u094d\u0915 \u0915\u0943\u0937\u093f \u0938\u0947\u0935\u093e \u0915\u0947\u0928\u094d\u0926\u094d\u0930 \u0921\u093f\u092a\u094b", 3, "\u0926\u093f\u0928\u0947\u0936 \u0936\u094d\u0930\u0947\u0937\u094d\u0920", "9851120002", "POTASH", "\u092a\u094b\u091f\u093e\u0938 (Potash)", 6000.0, 2100.0, 3900.0, 35.0, 85.0),

        ("c0000000-0000-0000-0000-000000000005", "\u092c\u093e\u0901\u0938\u0916\u0930\u094d\u0915 \u092b\u0932\u092b\u0942\u0932 \u0924\u0925\u093e \u0915\u0943\u0937\u093f \u0921\u093f\u092a\u094b", 1, "\u091c\u0917\u0924 \u0924\u093e\u092e\u093e\u0919", "9851120003", "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 8000.0, 3100.0, 4900.0, 18.0, 55.0),
        ("c0000000-0000-0000-0000-000000000006", "\u092c\u093e\u0901\u0938\u0916\u0930\u094d\u0915 \u092b\u0932\u092b\u0942\u0932 \u0924\u0925\u093e \u0915\u0943\u0937\u093f \u0921\u093f\u092a\u094b", 1, "\u091c\u0917\u0924 \u0924\u093e\u092e\u093e\u0919", "9851120003", "DAP", "\u0921\u093f.\u090f.\u092a\u093f. (DAP)", 7000.0, 2800.0, 4200.0, 48.0, 105.0),

        ("c0000000-0000-0000-0000-000000000007", "\u092d\u094b\u0924\u093e\u0919 \u0909\u091a\u094d\u091a \u0939\u093f\u092e\u093e\u0932\u0940 \u0915\u0943\u0937\u093f \u0909\u092a-\u0915\u0947\u0928\u094d\u0926\u094d\u0930", 7, "\u092a\u093e\u0938\u093e\u0919 \u0936\u0947\u0930\u094d\u092a\u093e", "9851120004", "DAP", "\u0921\u093f.\u090f.\u092a\u093f. (DAP)", 6000.0, 2400.0, 3600.0, 48.0, 105.0),
        ("c0000000-0000-0000-0000-000000000008", "\u092d\u094b\u0924\u093e\u0919 \u0909\u091a\u094d\u091a \u0939\u093f\u092e\u093e\u0932\u0940 \u0915\u0943\u0937\u093f \u0909\u092a-\u0915\u0947\u0928\u094d\u0926\u094d\u0930", 7, "\u092a\u093e\u0938\u093e\u0919 \u0936\u0947\u0930\u094d\u092a\u093e", "9851120004", "ORGANIC", "\u091c\u0948\u0935\u093f\u0915 \u092a\u094d\u0930\u093e\u0919\u094d\u0917\u093e\u0930\u093f\u0915 \u092e\u0932", 10000.0, 3500.0, 6500.0, 22.0, 45.0),
    ]

    stock_q = """
        INSERT INTO agriculture_fertilizer_stocks (
            id, "depotName", "wardNumber", "contactPerson", "contactPhone", "fertilizerType",
            "fertilizerNameNepali", "totalStockKg", "distributedKg", "availableStockKg",
            "subsidizedPricePerKg", "marketPricePerKg", "fiscalYear", "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, '२०८१/०८२', NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "totalStockKg" = EXCLUDED."totalStockKg",
            "distributedKg" = EXCLUDED."distributedKg",
            "availableStockKg" = EXCLUDED."availableStockKg",
            "subsidizedPricePerKg" = EXCLUDED."subsidizedPricePerKg",
            "marketPricePerKg" = EXCLUDED."marketPricePerKg",
            "updatedAt" = NOW();
    """
    for d in depots:
        cur.execute(stock_q, d)
    print(f"  Inserted {len(depots)} fertilizer stock records.")

    # 16 Distribution records to farmers
    dist_q = """
        INSERT INTO agriculture_fertilizer_distributions (
            id, "farmerId", "farmerName", "wardNumber", "depotName", "fertilizerType",
            "fertilizerNameNepali", "quantityBags", "quantityKg", "subsidizedRatePerKg",
            "marketRatePerKg", "farmerPaidAmountNpr", "governmentSubsidyAmountNpr",
            "cropSeason", "recommendedQuotaKg", "receiptNo", "distributionDateBs",
            status, remarks, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO NOTHING;
    """

    distributions = [
        # (id, farmerId, farmerName, ward, depot, type, nepName, bags, kg, subRate, mktRate, paid, subsidy, season, quota, receipt, dateBs, status)
        ("d0000000-0000-0000-0000-000000000001", "FARM-W04-001", "\u092c\u093f\u0937\u094d\u0923\u0941 \u092a\u094d\u0930\u0938\u093e\u0926 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", 4, depots[0][1], "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 2, 100, 18.0, 55.0, 1800.0, 3700.0, "\u092c\u0930\u094d\u0916\u0947 \u0927\u093e\u0928 \u092c\u093e\u0932\u0940", 100, "REC-2081-001", "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0967\u096b", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000002", "FARM-W04-001", "\u092c\u093f\u0937\u094d\u0923\u0941 \u092a\u094d\u0930\u0938\u093e\u0926 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", 4, depots[0][1], "DAP", "\u0921\u093f.\u090f.\u092a\u093f. (DAP)", 1, 50, 48.0, 105.0, 2400.0, 2850.0, "\u092c\u0930\u094d\u0916\u0947 \u0927\u093e\u0928 \u092c\u093e\u0932\u0940", 50, "REC-2081-002", "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0967\u096b", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000003", "FARM-W04-002", "\u0930\u093e\u0927\u093f\u0915\u093e \u0905\u0927\u093f\u0915\u093e\u0930\u0940", 4, depots[0][1], "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 1, 50, 18.0, 55.0, 900.0, 1850.0, "\u0927\u093e\u0928 \u0924\u0925\u093e \u0924\u0930\u0915\u093e\u0930\u0940", 50, "REC-2081-003", "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0968\u0966", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000004", "FARM-W03-001", "\u0926\u093e\u0935\u093e \u091b\u093f\u0930\u093f\u0919 \u0936\u0947\u0930\u094d\u092a\u093e", 3, depots[2][1], "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 1, 50, 18.0, 55.0, 900.0, 1850.0, "\u0915\u093f\u0935\u0940 \u0924\u0925\u093e \u0906\u0932\u0941", 50, "REC-2081-004", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0966\u096b", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000005", "FARM-W03-002", "\u0938\u0941\u092e\u093f\u0924\u094d\u0930\u093e \u0928\u094d\u092f\u094c\u092a\u093e\u0928\u0947", 3, depots[2][1], "POTASH", "\u092a\u094b\u091f\u093e\u0938 (Potash)", 1, 50, 35.0, 85.0, 1750.0, 2500.0, "\u092c\u0947\u092e\u094c\u0938\u092e\u0940 \u0924\u0930\u0915\u093e\u0930\u0940", 50, "REC-2081-005", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0966\u096e", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000006", "FARM-W01-001", "\u0926\u094b\u0930\u094d\u091c\u0947 \u0924\u093e\u092e\u093e\u0919", 1, depots[4][1], "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 1, 50, 18.0, 55.0, 900.0, 1850.0, "\u0927\u093e\u0928 \u0924\u0925\u093e \u0938\u0941\u0928\u094d\u0924\u0932\u093e", 50, "REC-2081-006", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0967\u0968", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000007", "FARM-W01-003", "\u0915\u0943\u0937\u094d\u0923 \u092a\u094d\u0930\u0938\u093e\u0926 \u0926\u0919\u094d\u0917\u093e\u0932", 1, depots[4][1], "DAP", "\u0921\u093f.\u090f.\u092a\u093f. (DAP)", 2, 100, 48.0, 105.0, 4800.0, 5700.0, "\u092b\u0932\u092b\u0942\u0932 \u092c\u0917\u0948\u0902\u091a\u093e", 100, "REC-2081-007", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0967\u096b", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000008", "FARM-W07-001", "\u0928\u093f\u092e\u093e \u0935\u093e\u0919\u094d\u091a\u0941\u0915 \u0936\u0947\u0930\u094d\u092a\u093e", 7, depots[6][1], "DAP", "\u0921\u093f.\u090f.\u092a\u093f. (DAP)", 2, 100, 48.0, 105.0, 4800.0, 5700.0, "\u0939\u093f\u092e\u093e\u0932\u0940 \u0906\u0932\u0941 \u092c\u093e\u0932\u0940", 100, "REC-2081-008", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0968\u0966", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000009", "FARM-W07-002", "\u092a\u093e\u0938\u093e\u0919 \u0932\u093e\u092e\u0941 \u0936\u0947\u0930\u094d\u092a\u093e", 7, depots[6][1], "ORGANIC", "\u091c\u0948\u0935\u093f\u0915 \u092a\u094d\u0930\u093e\u0919\u094d\u0917\u093e\u0930\u093f\u0915 \u092e\u0932", 2, 100, 22.0, 45.0, 2200.0, 2300.0, "\u091c\u0948\u0935\u093f\u0915 \u0906\u0932\u0941 \u0916\u0947\u0924\u0940", 100, "REC-2081-009", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0968\u0968", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000010", "FARM-W02-001", "\u0938\u0941\u0930\u094d\u092f \u092c\u0939\u093e\u0926\u0941\u0930 \u0925\u092a\u0932\u093f\u092f\u093e", 2, depots[2][1], "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 1, 50, 18.0, 55.0, 900.0, 1850.0, "\u092e\u0915\u0948 \u0924\u0925\u093e \u0906\u0932\u0941", 50, "REC-2081-010", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0968\u096b", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000011", "FARM-W05-001", "\u0924\u093e\u0930\u093e \u092c\u0939\u093e\u0926\u0941\u0930 \u0924\u093e\u092e\u093e\u0919", 5, depots[0][1], "POTASH", "\u092a\u094b\u091f\u093e\u0938 (Potash)", 1, 50, 35.0, 85.0, 1750.0, 2500.0, "\u0905\u0932\u0948\u0902\u091a\u0940 \u092c\u0917\u0948\u0902\u091a\u093e", 50, "REC-2081-011", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0968\u096e", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000012", "FARM-W06-001", "\u092b\u0941\u0930\u094d\u092c\u093e \u0924\u0938\u0947\u0930\u093f\u0919 \u0936\u0947\u0930\u094d\u092a\u093e", 6, depots[6][1], "ORGANIC", "\u091c\u0948\u0935\u093f\u0915 \u092a\u094d\u0930\u093e\u0919\u094d\u0917\u093e\u0930\u093f\u0915 \u092e\u0932", 2, 100, 22.0, 45.0, 2200.0, 2300.0, "\u0938\u094d\u092f\u093e\u0909 \u092c\u0917\u0948\u0902\u091a\u093e", 100, "REC-2081-012", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0966\u0968", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000013", "FARM-W08-001", "\u092a\u0947\u092e\u094d\u092c\u093e \u0917\u094d\u092f\u093e\u0932\u094d\u091c\u0947\u0928 \u0936\u0947\u0930\u094d\u092a\u093e", 8, depots[6][1], "DAP", "\u0921\u093f.\u090f.\u092a\u093f. (DAP)", 2, 100, 48.0, 105.0, 4800.0, 5700.0, "\u0939\u093f\u092e\u093e\u0932\u0940 \u0906\u0932\u0941", 100, "REC-2081-013", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0966\u096b", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000014", "FARM-W04-005", "\u092c\u0932\u0930\u093e\u092e \u0924\u093f\u092e\u0932\u094d\u0938\u093f\u0928\u093e", 4, depots[0][1], "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 1, 50, 18.0, 55.0, 900.0, 1850.0, "\u0927\u093e\u0928 \u0916\u0947\u0924\u0940", 50, "REC-2081-014", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0967\u0966", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000015", "FARM-W03-005", "\u0928\u093f\u092e\u093e \u0924\u0947\u0928\u094d\u091c\u093f\u0902\u0917 \u0932\u093e\u092e\u093e", 3, depots[2][1], "DAP", "\u0921\u093f.\u090f.\u092a\u093f. (DAP)", 1, 50, 48.0, 105.0, 2400.0, 2850.0, "\u0906\u0932\u0941 \u0924\u0925\u093e \u092b\u093e\u092a\u0930", 50, "REC-2081-015", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0967\u0968", "DISBURSED"),
        ("d0000000-0000-0000-0000-000000000016", "FARM-W01-005", "\u0930\u093e\u092e \u0915\u093e\u0928\u094d\u091b\u093e \u0924\u093e\u092e\u093e\u0919", 1, depots[4][1], "UREA", "\u092f\u0941\u0930\u093f\u092f\u093e (Urea)", 1, 50, 18.0, 55.0, 900.0, 1850.0, "\u092e\u0915\u0948 \u0924\u0925\u093e \u0905\u0926\u0941\u0935\u093e", 50, "REC-2081-016", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0967\u096b", "DISBURSED"),
    ]

    for d in distributions:
        cur.execute(dist_q, (
            d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9],
            d[10], d[11], d[12], d[13], d[14], d[15], d[16], d[17], "\u0905\u0928\u0941\u0926\u093e\u0928 \u092e\u0932 \u0935\u093f\u0924\u0930\u0923 \u0938\u092e\u094d\u092a\u0928\u094d\u0928"
        ))
    print(f"  Inserted {len(distributions)} fertilizer distribution records.")


def seed_vet_services(cur):
    """Seed veterinary medicines, distributions, AI, vaccinations, and diagnoses."""
    print("--- 5. Seeding veterinary medicines, AI, vaccinations, & diagnoses ---")
    
    # 1. Vet Medicines
    med_q = """
        INSERT INTO agriculture_vet_medicines (
            id, "medicineName", "batchNumber", "manufactureDate", "expiryDate",
            "stockQuantity", unit, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "stockQuantity" = EXCLUDED."stockQuantity",
            "updatedAt" = NOW();
    """
    medicines = [
        ("e0000000-0000-0000-0000-000000000001", "FMD Vaccine (खोप - खोरेत)", "FMD-2024-B1", "2024-01-10", "2025-12-30", 850, "डोज (Doses)"),
        ("e0000000-0000-0000-0000-000000000002", "PPR Vaccine (पीपीआर खोप - बाख्रा)", "PPR-2024-08", "2024-02-15", "2026-02-15", 1400, "डोज (Doses)"),
        ("e0000000-0000-0000-0000-000000000003", "Rabies Vaccine (रेबिज खोप)", "RAB-2024-03", "2024-03-01", "2026-03-01", 350, "भाइल (Vials)"),
        ("e0000000-0000-0000-0000-000000000004", "Albendazole 2.5% Suspension (जुकाको औषधि)", "ALB-8821", "2024-01-01", "2026-12-31", 120, "बोतल (Bottles)"),
        ("e0000000-0000-0000-0000-000000000005", "Oxytetracycline 20% LA (एन्टिबायोटिक)", "OXY-9941", "2024-02-10", "2026-08-10", 65, "भाइल (Vials)"),
        ("e0000000-0000-0000-0000-000000000006", "Ivermectin 1% Injection (परजीवी नियन्त्रण)", "IVM-3321", "2024-01-15", "2026-06-30", 80, "भाइल (Vials)"),
        ("e0000000-0000-0000-0000-000000000007", "Calcium Borogluconate 450ml (क्याल्सियम)", "CAL-5512", "2024-03-12", "2026-09-12", 45, "बोतल (Bottles)"),
        ("e0000000-0000-0000-0000-000000000008", "Vitamin AD3E Injection (भिटामिन)", "VIT-7714", "2024-02-20", "2026-05-20", 95, "भाइल (Vials)"),
        ("e0000000-0000-0000-0000-000000000009", "B-Complex + Liver Extract (कलेजो टनिक)", "BCX-4419", "2024-01-05", "2026-01-05", 70, "भाइल (Vials)"),
        ("e0000000-0000-0000-0000-000000000010", "Povidone Iodine Spray & Ointment", "PVD-1102", "2024-03-01", "2027-03-01", 50, "स्प्रे/मलम"),
    ]
    for m in medicines:
        cur.execute(med_q, m)
    print(f"  Inserted {len(medicines)} vet medicines.")

    # 2. Vet Distributions
    vet_dist_q = """
        INSERT INTO agriculture_vet_distributions (
            id, "medicineId", "farmerId", "animalType", "quantityGiven", "distributedDate", remarks, "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, NOW()
        ) ON CONFLICT (id) DO NOTHING;
    """
    vet_dists = [
        ("f0000000-0000-0000-0000-000000000001", medicines[3][0], "FARM-W01-001", "बाख्रा (Goat)", 2, "2024-05-10", "नियमित आन्तरिक परजीवी जुकाको औषधि"),
        ("f0000000-0000-0000-0000-000000000002", medicines[4][0], "FARM-W04-001", "गाई (Cow)", 1, "2024-05-12", "श्वासप्रश्वास समस्या उपचार"),
        ("f0000000-0000-0000-0000-000000000003", medicines[5][0], "FARM-W07-001", "चौंरी (Yak)", 3, "2024-05-15", "बाह्य तथा आन्तरिक परजीवी नियन्त्रण"),
        ("f0000000-0000-0000-0000-000000000004", medicines[6][0], "FARM-W04-002", "गाई (Cow)", 1, "2024-05-18", "ब्याएपछि क्याल्सियम कमी (Milk Fever)"),
        ("f0000000-0000-0000-0000-000000000005", medicines[7][0], "FARM-W03-001", "गाई (Cow)", 2, "2024-05-20", "सामान्य कमजोरी र पोषण"),
        ("f0000000-0000-0000-0000-000000000006", medicines[3][0], "FARM-W08-001", "भेडा (Sheep)", 4, "2024-05-25", "गोठका भेडाबाख्रालाई जुकाको औषधि"),
        ("f0000000-0000-0000-0000-000000000007", medicines[4][0], "FARM-W02-001", "भैँसी (Buffalo)", 1, "2024-06-01", "खुर पाक्ने संक्रमण नियन्त्रण"),
        ("f0000000-0000-0000-0000-000000000008", medicines[9][0], "FARM-W06-001", "चौंरी (Yak)", 1, "2024-06-05", "घाउ सफा गर्ने स्प्रे र मलम"),
    ]
    for vd in vet_dists:
        cur.execute(vet_dist_q, vd)
    print(f"  Inserted {len(vet_dists)} vet medicine distribution records.")

    # 3. Vet AI Records (Artificial Insemination)
    ai_q = """
        INSERT INTO agriculture_vet_ai_records (
            id, "farmerName", "contactPhone", "wardNumber", "animalType", breed,
            "strawNumber", "aiDateBs", "expectedCalvingDateBs", "technicianName",
            status, remarks, "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            "expectedCalvingDateBs" = EXCLUDED."expectedCalvingDateBs";
    """
    ai_records = [
        ("AI-2081-001", "\u092c\u093f\u0937\u094d\u0923\u0941 \u092a\u094d\u0930\u0938\u093e\u0926 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", "9841104001", 4, "\u0917\u093e\u0908", "\u091c\u0930\u094d\u0938\u0940 \u0915\u094d\u0930\u0938 (Jersey Cross)", "NLBO-JER-8891", "\u0968\u0966\u096e\u0967-\u0966\u0968-\u0967\u0968", "\u0968\u0966\u096e\u0967-\u0967\u0967-\u0968\u0968", "\u0926\u093f\u092a\u0947\u0936 \u0924\u093e\u092e\u093e\u0919 (\u091c\u0947\u091f\u0940\u090f)", "\u0917\u0930\u094d\u092d\u0935\u0924\u0940 \u092a\u094d\u0930\u092e\u093e\u0923\u093f\u0924 (Confirmed)", "\u096c\u0966 \u0926\u093f\u0928\u092e\u093e \u0917\u0930\u094d\u092d \u092a\u0930\u0940\u0915\u094d\u0937\u0923 \u0938\u092b\u0932"),
        ("AI-2081-002", "\u0930\u093e\u0927\u093f\u0915\u093e \u0905\u0927\u093f\u0915\u093e\u0930\u0940", "9841104002", 4, "\u0917\u093e\u0908", "\u0939\u094b\u0932\u094d\u0938\u094d\u091f\u093f\u0928 \u0915\u094d\u0930\u0938 (Holstein)", "NLBO-HOL-7742", "\u0968\u0966\u096e\u0967-\u0966\u0968-\u0968\u0966", "\u0968\u0966\u096e\u0967-\u0967\u0967-\u0969\u0966", "\u0926\u093f\u092a\u0947\u0936 \u0924\u093e\u092e\u093e\u0919 (\u091c\u0947\u091f\u0940\u090f)", "\u0917\u0930\u094d\u092d\u0935\u0924\u0940 \u092a\u094d\u0930\u092e\u093e\u0923\u093f\u0924 (Confirmed)", "\u0938\u0941\u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u0917\u093e\u0908"),
        ("AI-2081-003", "\u0926\u093e\u0935\u093e \u091b\u093f\u0930\u093f\u0919 \u0936\u0947\u0930\u094d\u092a\u093e", "9841103001", 3, "\u0917\u093e\u0908", "\u091c\u0930\u094d\u0938\u0940 \u0915\u094d\u0930\u0938", "NLBO-JER-8895", "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0966\u096b", "\u0968\u0966\u096e\u0968-\u0966\u0967-\u0967\u096b", "\u0921\u093e. \u0938\u0941\u091c\u0928 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", "\u0917\u0930\u094d\u092d\u0935\u0924\u0940 \u092a\u094d\u0930\u092e\u093e\u0923\u093f\u0924 (Confirmed)", "\u092a\u0941\u0937\u094d\u091f\u093f \u092d\u090f\u0915\u094b"),
        ("AI-2081-004", "\u0938\u0941\u0930\u094d\u092f \u092c\u0939\u093e\u0926\u0941\u0930 \u0925\u092a\u0932\u093f\u092f\u093e", "9841102001", 2, "\u092d\u0948\u0901\u0938\u0940", "\u092e\u0941\u0930\u094d\u0930\u093e \u0915\u094d\u0930\u0938 (Murrah Cross)", "NLBO-MUR-5510", "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0968\u0968", "\u0968\u0966\u096e\u0968-\u0966\u0967-\u0968\u0968", "\u0926\u093f\u092a\u0947\u0936 \u0924\u093e\u092e\u093e\u0919 (\u091c\u0947\u091f\u0940\u090f)", "\u0928\u093f\u0930\u0940\u0915\u094d\u0937\u0923 \u092c\u093e\u0901\u0915\u0940 (Pending)", "\u092d\u0948\u0901\u0938\u0940 \u0915\u0943\u0924\u094d\u0930\u093f\u092e \u0917\u0930\u094d\u092d\u093e\u0927\u093e\u0928"),
        ("AI-2081-005", "\u0926\u094b\u0930\u094d\u091c\u0947 \u0924\u093e\u092e\u093e\u0919", "9841101001", 1, "\u0917\u093e\u0908", "\u091c\u0930\u094d\u0938\u0940 \u0915\u094d\u0930\u0938", "NLBO-JER-8898", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0966\u096b", "\u0968\u0966\u096e\u0968-\u0966\u0968-\u0967\u096b", "\u0921\u093e. \u0938\u0941\u091c\u0928 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", "\u0917\u0930\u094d\u092d\u0935\u0924\u0940 \u092a\u094d\u0930\u092e\u093e\u0923\u093f\u0924 (Confirmed)", "\u0938\u092b\u0932 \u0917\u0930\u094d\u092d\u093e\u0927\u093e\u0928"),
        ("AI-2081-006", "\u092c\u0932\u0930\u093e\u092e \u0924\u093f\u092e\u0932\u094d\u0938\u093f\u0928\u093e", "9841104005", 4, "\u0917\u093e\u0908", "\u0939\u094b\u0932\u094d\u0938\u094d\u091f\u093f\u0928 \u0915\u094d\u0930\u0938", "NLBO-HOL-7749", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0967\u0968", "\u0968\u0966\u096e\u0968-\u0966\u0968-\u0968\u0968", "\u0926\u093f\u092a\u0947\u0936 \u0924\u093e\u092e\u093e\u0919 (\u091c\u0947\u091f\u0940\u090f)", "\u0928\u093f\u0930\u0940\u0915\u094d\u0937\u0923 \u092c\u093e\u0901\u0915\u0940 (Pending)", "\u092a\u0941\u0928\u0903 \u091c\u093e\u0901\u091a \u092e\u0939\u093f\u0928\u093e \u092a\u091b\u093f"),
        ("AI-2081-007", "\u0915\u093e\u0928\u094d\u091b\u093e \u092e\u093e\u0928 \u0936\u094d\u0930\u0947\u0937\u094d\u0920", "9841102005", 2, "\u0917\u093e\u0908", "\u091c\u0930\u094d\u0938\u0940 \u0915\u094d\u0930\u0938", "NLBO-JER-8901", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0968\u0966", "\u0968\u0966\u096e\u0968-\u0966\u0968-\u0969\u0966", "\u0926\u093f\u092a\u0947\u0936 \u0924\u093e\u092e\u093e\u0919 (\u091c\u0947\u091f\u0940\u090f)", "\u0917\u0930\u094d\u092d\u0935\u0924\u0940 \u092a\u094d\u0930\u092e\u093e\u0923\u093f\u0924 (Confirmed)", "\u0917\u0930\u094d\u092d \u092a\u0941\u0937\u094d\u091f\u093f"),
        ("AI-2081-008", "\u0939\u0930\u093f \u092d\u0915\u094d\u0924 \u091a\u094c\u0932\u093e\u0917\u093e\u0908", "9841104003", 4, "\u092d\u0948\u0901\u0938\u0940", "\u092e\u0941\u0930\u094d\u0930\u093e \u0915\u094d\u0930\u0938", "NLBO-MUR-5515", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0966\u0968", "\u0968\u0966\u096e\u0968-\u0966\u0969-\u0966\u0968", "\u0921\u093e. \u0938\u0941\u091c\u0928 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", "\u0928\u093f\u0930\u0940\u0915\u094d\u0937\u0923 \u092c\u093e\u0901\u0915\u0940 (Pending)", "\u092a\u0939\u093f\u0932\u094b \u092a\u091f\u0915 \u0917\u0930\u094d\u092d\u093e\u0927\u093e\u0928"),
    ]
    for a in ai_records:
        cur.execute(ai_q, a)
    print(f"  Inserted {len(ai_records)} vet AI records.")

    # 4. Vet Vaccinations
    vac_q = """
        INSERT INTO agriculture_vet_vaccinations (
            id, "vaccineName", "earTagNumber", "animalType", "farmerName", "wardNumber",
            "vaccinatedDateBs", "boosterDueDateBs", "batchNumber", "technicianName",
            status, "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'सम्पन्न (Completed)', NOW()
        ) ON CONFLICT (id) DO NOTHING;
    """
    vaccinations = [
        ("VAC-2081-001", "खुरपक्का/खोरेत खोप (FMD)", "NP-P5-04-101", "गाई", "\u092c\u093f\u0937\u094d\u0923\u0941 \u092a\u094d\u0930\u0938\u093e\u0926 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", 4, "\u0968\u0966\u096e\u0967-\u0966\u0968-\u0967\u096b", "\u0968\u0966\u096e\u0968-\u0966\u0968-\u0967\u096b", "FMD-2024-B1", "\u0926\u093f\u092a\u0947\u0936 \u0924\u093e\u092e\u093e\u0919"),
        ("VAC-2081-002", "खुरपक्का/खोरेत खोप (FMD)", "NP-P5-04-102", "गाई", "\u0930\u093e\u0927\u093f\u0915\u093e \u0905\u0927\u093f\u0915\u093e\u0930\u0940", 4, "\u0968\u0966\u096e\u0967-\u0966\u0968-\u0967\u096b", "\u0968\u0966\u096e\u0968-\u0966\u0968-\u0967\u096b", "FMD-2024-B1", "\u0926\u093f\u092a\u0947\u0936 \u0924\u093e\u092e\u093e\u0919"),
        ("VAC-2081-003", "पीपीआर खोप (PPR Vaccine)", "NP-P5-01-201", "बाख्रा", "\u0926\u094b\u0930\u094d\u091c\u0947 \u0924\u093e\u092e\u093e\u0919", 1, "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0966\u0967", "\u0968\u0966\u096e\u096a-\u0966\u0969-\u0966\u0967", "PPR-2024-08", "\u0921\u093e. \u0938\u0941\u091c\u0928 \u0938\u093e\u092a\u0915\u094b\u091f\u093e"),
        ("VAC-2081-004", "पीपीआर खोप (PPR Vaccine)", "NP-P5-01-202", "बाख्रा", "\u092e\u093e\u092f\u093e \u0924\u093e\u092e\u093e\u0919", 1, "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0966\u0967", "\u0968\u0966\u096e\u096a-\u0966\u0969-\u0966\u0967", "PPR-2024-08", "\u0921\u093e. \u0938\u0941\u091c\u0928 \u0938\u093e\u092a\u0915\u094b\u091f\u093e"),
        ("VAC-2081-005", "खुरपक्का/खोरेत खोप (FMD)", "NP-P5-07-301", "चौंरी", "\u0928\u093f\u092e\u093e \u0935\u093e\u0919\u094d\u091a\u0941\u0915 \u0936\u0947\u0930\u094d\u092a\u093e", 7, "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0967\u0968", "\u0968\u0966\u096e\u0968-\u0966\u0969-\u0967\u0968", "FMD-2024-B1", "\u0938\u094b\u0928\u093e\u092e \u0936\u0947\u0930\u094d\u092a\u093e (\u092a\u094d\u0930\u093e\u0935\u093f\u0927\u093f\u0915)"),
        ("VAC-2081-006", "खुरपक्का/खोरेत खोप (FMD)", "NP-P5-08-302", "चौंरी", "\u092a\u0947\u092e\u094d\u092c\u093e \u0917\u094d\u092f\u093e\u0932\u094d\u091c\u0947\u0928 \u0936\u0947\u0930\u094d\u092a\u093e", 8, "\u0968\u0966\u096e\u0967-\u0966\u0969-\u0967\u096b", "\u0968\u0966\u096e\u0968-\u0966\u0969-\u0967\u096b", "FMD-2024-B1", "\u0938\u094b\u0928\u093e\u092e \u0936\u0947\u0930\u094d\u092a\u093e (\u092a\u094d\u0930\u093e\u0935\u093f\u0927\u093f\u0915)"),
        ("VAC-2081-007", "रेबिज खोप (Anti-Rabies)", "NP-P5-03-401", "कुकुर (गोठ)", "\u0926\u093e\u0935\u093e \u091b\u093f\u0930\u093f\u0919 \u0936\u0947\u0930\u094d\u092a\u093e", 3, "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0966\u0967", "\u0968\u0966\u096e\u0968-\u0966\u096a-\u0966\u0967", "RAB-2024-03", "\u0926\u093f\u092a\u0947\u0936 \u0924\u093e\u092e\u093e\u0919"),
        ("VAC-2081-008", "पीपीआर खोप (PPR Vaccine)", "NP-P5-02-203", "बाख्रा", "\u0938\u0941\u0930\u094d\u092f \u092c\u0939\u093e\u0926\u0941\u0930 \u0925\u092a\u0932\u093f\u092f\u093e", 2, "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0966\u096b", "\u0968\u0966\u096e\u096a-\u0966\u096a-\u0966\u096b", "PPR-2024-08", "\u0921\u093e. \u0938\u0941\u091c\u0928 \u0938\u093e\u092a\u0915\u094b\u091f\u093e"),
    ]
    for v in vaccinations:
        cur.execute(vac_q, v)
    print(f"  Inserted {len(vaccinations)} vaccination records.")

    # 5. Vet Diagnoses
    diag_q = """
        INSERT INTO agriculture_vet_diagnoses (
            id, "farmerName", "wardNumber", "animalType", symptoms, "suspectedDisease",
            "prescribedMedicine", "dosageInstructions", "doctorTechnician", "dateBs",
            "followUpDateBs", status, "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            "prescribedMedicine" = EXCLUDED."prescribedMedicine";
    """
    diagnoses = [
        ("DIAG-2081-001", "\u092c\u093f\u0937\u094d\u0923\u0941 \u092a\u094d\u0930\u0938\u093e\u0926 \u0938\u093e\u092a\u0915\u094b\u091f\u093e", 4, "गाई", "\u092c\u093e\u0909\u0928\u094d\u091f\u094b \u0938\u0942\u0928\u093f\u090f\u0915\u094b, \u0926\u0941\u0927\u092e\u093e \u0930\u0917\u0924 \u0930 \u091a\u0915\u094d\u0915\u093e \u0926\u0947\u0916\u093f\u090f\u0915\u094b, \u091c\u094d\u0935\u0930\u094b \u0967\u0966\u0969\u00b0F", "थुनेलो (Mastitis)", "Pendistrin SH intramammary + Meloxicam + Ceftriaxone", "दिनको २ पटक नली चढाउने र ३ दिन सुई लगाउने", "डा. सुजन सापकोटा", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0967\u0968", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0967\u096f", "निको भएको (Recovered)"),
        ("DIAG-2081-002", "\u0938\u0941\u0930\u094d\u092f \u092c\u0939\u093e\u0926\u0941\u0930 \u0925\u092a\u0932\u093f\u092f\u093e", 2, "भैँसी", "\u0916\u0941\u0930 \u092a\u093e\u0915\u0947\u0930 \u0932\u0902\u0917\u0921\u093e\u090f\u0915\u094b, \u0916\u0941\u0930\u0915\u094b \u0915\u093e\u092a\u092e\u093e \u0915\u0940\u0930\u093e \u092a\u0930\u0947\u0915\u094b", "खुर पाक्ने रोग / म्यागट (Foot Rot & Maggots)", "Potassium Permanganate wash + Topicure Spray + Ivermectin", "पोटास पानीले सफा गरी दिनको २ पटक स्प्रे गर्ने", "दिपेश तामाङ", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0968\u0966", "\u0968\u0966\u096e\u0967-\u0966\u096a-\u0968\u096d", "उपचार जारी (Under Treatment)"),
        ("DIAG-2081-003", "\u0928\u093f\u092e\u093e \u0935\u093e\u0919\u094d\u091a\u0941\u0915 \u0936\u0947\u0930\u094d\u092a\u093e", 7, "चौंरी", "\u0930\u094d\u092f\u093e\u0932 \u091a\u0941\u0939\u093e\u0909\u0928\u0947, \u091c\u094d\u0935\u0930\u094b, \u0918\u093e\u0901\u0938 \u0928\u0916\u093e\u0928\u0947, \u092e\u0941\u0916\u092e\u093e \u092b\u094b\u0915\u093e", "खोरेत शंकास्पद (Suspected FMD)", "Sodium Bicarbonate + Boro-Glycerin + Analgesic", "मुख सफा गरी ग्लिसरिन लगाउने, गोठ निसंक्रमण गर्ने", "सोनाम शेर्पा", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0966\u0967", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0966\u096e", "उपचार जारी (Under Treatment)"),
        ("DIAG-2081-004", "\u0926\u094b\u0930\u094d\u091c\u0947 \u0924\u093e\u092e\u093e\u0919", 1, "बाख्रा", "\u0915\u094b\u0916\u093e \u092b\u0941\u0932\u0947\u0915\u094b, \u0938\u093e\u0938 \u092b\u0947\u0930\u094d\u0928 \u0917\u093e\u0939\u094d\u0930\u094b, \u091a\u0930\u094d\u0928 \u0928\u092e\u093e\u0928\u094d\u0928\u0947", "पेट फुल्ने / अफारा (Bloat / Tympanites)", "Tympol / Bloatosil liquid + Carminative mixture", "५० मि.ली. औषधि तोरीको तेलमा मिसाएर खुवाउने", "दिपेश तामाङ", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0966\u096b", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0966\u096c", "निको भएको (Recovered)"),
        ("DIAG-2081-005", "\u092a\u0947\u092e\u094d\u092c\u093e \u0917\u094d\u092f\u093e\u0932\u094d\u091c\u0947\u0928 \u0936\u0947\u0930\u094d\u092a\u093e", 8, "भेडा", "\u090a\u0928 \u091d\u0930\u094d\u0928\u0947, \u091b\u093e\u0932\u093e \u0915\u0928\u094d\u092f\u093e\u0909\u0928\u0947, \u091b\u093e\u0932\u093e\u092e\u093e \u0916\u0921\u094d\u0932\u094b \u092a\u0930\u0947\u0915\u094b", "लुतो तथा बाह्य परजीवी (Sheep Scab & Mange)", "Ivermectin injection + Amitraz dip", "सुई दिने र पुरै बगाललाई औषधियुक्त पानीमा चोप्ने", "सोनाम शेर्पा", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0967\u0966", "\u0968\u0966\u096e\u0967-\u0966\u096b-\u0968\u096a", "उपचार जारी (Under Treatment)"),
    ]
    for d in diagnoses:
        cur.execute(diag_q, d)
    print(f"  Inserted {len(diagnoses)} vet diagnosis records.")


def seed_market_items_and_prices(cur):
    """Seed agri market items and current wholesale/retail market prices."""
    print("--- 6. Seeding agriculture_market_items & market_prices ---")
    
    item_q = """
        INSERT INTO agriculture_market_items (
            id, "itemName", category, unit, icon, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "itemName" = EXCLUDED."itemName",
            category = EXCLUDED.category,
            unit = EXCLUDED.unit;
    """
    price_q = """
        INSERT INTO agriculture_market_prices (
            id, "itemId", date, "minPrice", "maxPrice", "averagePrice", "createdAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "minPrice" = EXCLUDED."minPrice",
            "maxPrice" = EXCLUDED."maxPrice",
            "averagePrice" = EXCLUDED."averagePrice";
    """
    
    today_str = datetime.date.today().strftime("%Y-%m-%d")

    items = [
        # (item_id, price_id, name, cat, unit, icon, minP, maxP)
        ("11000000-0000-0000-0000-000000000001", "12000000-0000-0000-0000-000000000001", "स्थानीय रातो आलु (Local Red Potato)", "तरकारी", "के.जी.", "potato", 45.0, 55.0),
        ("11000000-0000-0000-0000-000000000002", "12000000-0000-0000-0000-000000000002", "बन्दा कोभी (Cabbage)", "तरकारी", "के.जी.", "cabbage", 25.0, 35.0),
        ("11000000-0000-0000-0000-000000000003", "12000000-0000-0000-0000-000000000003", "काउली (Cauliflower)", "तरकारी", "के.जी.", "cauliflower", 40.0, 55.0),
        ("11000000-0000-0000-0000-000000000004", "12000000-0000-0000-0000-000000000004", "रायोको साग (Mustard Green)", "तरकारी", "मुठा", "leaf", 30.0, 45.0),
        ("11000000-0000-0000-0000-000000000005", "12000000-0000-0000-0000-000000000005", "ठूलो अलैंची (Large Cardamom)", "नगदे बाली", "के.जी.", "spice", 1100.0, 1350.0),
        ("11000000-0000-0000-0000-000000000006", "12000000-0000-0000-0000-000000000006", "अकबरे खुर्सानी (Akabare Chili)", "नगदे बाली", "के.जी.", "pepper", 280.0, 350.0),
        ("11000000-0000-0000-0000-000000000007", "12000000-0000-0000-0000-000000000007", "किवी फल (Kiwi Fruit)", "फलफूल", "के.जी.", "kiwi", 220.0, 280.0),
        ("11000000-0000-0000-0000-000000000008", "12000000-0000-0000-0000-000000000008", "स्थानीय सुन्तला (Local Orange)", "फलफूल", "के.जी.", "citrus", 80.0, 110.0),
        ("11000000-0000-0000-0000-000000000009", "12000000-0000-0000-0000-000000000009", "चौंरीको छुर्पी (Yak Chhurpi)", "दुग्धजन्य", "के.जी.", "cheese", 1200.0, 1400.0),
        ("11000000-0000-0000-0000-000000000010", "12000000-0000-0000-0000-000000000010", "चौंरीको घिउ (Yak Ghee)", "दुग्धजन्य", "के.जी.", "butter", 1500.0, 1800.0),
        ("11000000-0000-0000-0000-000000000011", "12000000-0000-0000-0000-000000000011", "स्थानीय कोदो (Finger Millet)", "खाद्यान्न", "के.जी.", "grain", 55.0, 70.0),
        ("11000000-0000-0000-0000-000000000012", "12000000-0000-0000-0000-000000000012", "सिस्नुको धुलो (Stinging Nettle Powder)", "जडीबुटी", "प्याकेट", "tea", 180.0, 250.0),
    ]

    for it in items:
        cur.execute(item_q, (it[0], it[2], it[3], it[4], it[5]))
        avg_p = round((it[6] + it[7]) / 2, 2)
        cur.execute(price_q, (it[1], it[0], today_str, it[6], it[7], avg_p))
    print(f"  Inserted {len(items)} market items and daily prices.")


def seed_advisories(cur):
    """Seed urgent and seasonal agricultural & veterinary advisories."""
    print("--- 7. Seeding agriculture_advisories ---")
    
    adv_q = """
        INSERT INTO agriculture_advisories (
            id, title, content, "advisoryType", "validUntil", "issuedBy", "issuedDate", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            "validUntil" = EXCLUDED."validUntil",
            "updatedAt" = NOW();
    """
    
    advisories = [
        (
            "13000000-0000-0000-0000-000000000001",
            "आलु बालीमा डढुवा रोग (Late Blight) रोकथाम सम्बन्धी जरूरी सूचना",
            "हाल मौसम बदली र निरन्तर चिसो/आद्रताका कारण वडा नं. २, ३, ६, ७ र ८ का आलु बालीमा डढुवा रोगको प्रकोप देखिन सक्ने भएकाले लक्षण देखिनासाथ मेन्कोजेब (Mancozeb 75% WP) २ ग्राम प्रति लिटर पानीमा मिसाएर छर्कन र पानी जम्न नदिन अनुरोध छ।",
            "रोग नियन्त्रण",
            "2026-11-30",
            "पाँचपोखरी थाङपाल गाउँपालिका कृषि विकास शाखा"
        ),
        (
            "13000000-0000-0000-0000-000000000002",
            "बाख्रामा पीपीआर (PPR) विरुद्ध निःशुल्क खोप अभियान सञ्चालन सम्बन्धी",
            "गाउँपालिका अन्तर्गतका सम्पूर्ण वडाहरूमा बाख्रामा लाग्ने महामारीजन्य पीपीआर रोग विरुद्ध निःशुल्क खोप अभियान सञ्चालन भइरहेको छ। आफ्ना ६ महिना माथिका सबै बाख्राहरूलाई नजिकैको पशु सेवा केन्द्रमा लगेर खोप लगाउनुहुन सम्पूर्ण कृषकहरूमा सूचित गरिन्छ।",
            "खोप अभियान",
            "2026-10-31",
            "पशु सेवा शाखा, पाँचपोखरी थाङपाल गाउँपालिका"
        ),
        (
            "13000000-0000-0000-0000-000000000003",
            "उच्च हिमाली भेगमा चौंरी तथा भेडाबाख्राको हिउँदे गोठ व्यवस्थापन र आहारा सल्लाह",
            "हिउँदको अत्यधिक चिसो मौसम सुरु हुन लागेकाले वडा ६, ७ र ८ का उच्च खर्कहरूबाट गोठहरू तल्लो भेगमा सार्न, हिउँदे आहाराको लागि सुकेको घाँस (Hay), साइलेज र मिनरल ब्लक (खनिज ढिकार) को अग्रिम जोहो गर्न पशुपालक किसानहरूमा हार्दिक अनुरोध छ।",
            "पशु व्यवस्थापन",
            "2026-12-15",
            "पशु सेवा शाखा, पाँचपोखरी थाङपाल गाउँपालिका"
        ),
        (
            "13000000-0000-0000-0000-000000000004",
            "हिउँदे गहुँ तथा फापर बालीको समयमै छनोट र उन्नत बीउ ५०% अनुदानमा वितरण",
            "आसन्न हिउँदे मौसमका लागि उन्नत जातको गहुँ (डब्लुएल ७११, विजय) तथा फापरको प्रमाणित बीउ गाउँपालिकाको ५०% अनुदानमा वडा ४ र ३ का कृषि सेवा केन्द्रबाट वितरण भइरहेकोले माग फाराम भरी समयमै बीउ प्राप्त गर्नुहुन सूचित गरिन्छ।",
            "अनुदान सूचना",
            "2026-11-15",
            "पाँचपोखरी थाङपाल गाउँपालिका कृषि विकास शाखा"
        ),
        (
            "13000000-0000-0000-0000-000000000005",
            "रासायनिक मल (युरिया तथा डि.ए.पि.) वितरण कार्यतालिका सम्बन्धी",
            "चालू बालीका लागि नेपाल सरकारको अनुदानित रासायनिक मल वडा नं. १, ३, ४ र ७ का आधिकारिक डिपोहरूबाट कोटा प्रणाली अनुसार वितरण भइरहेको हुँदा कृषक परिचयपत्र सहित सम्पर्क राख्नुहुन जानकारी गराइन्छ।",
            "मल वितरण",
            "2026-10-25",
            "पाँचपोखरी थाङपाल गाउँपालिका कृषि विकास शाखा"
        ),
        (
            "13000000-0000-0000-0000-000000000006",
            "किवी र फलफूलका बिरुवा काँटछाँट (Pruning) तथा बोर्डो मिश्रण छर्कने सल्लाह",
            "फलफूल तथा किवी बगैँचामा सुकेका, रोगग्रस्त हाँगाहरू काँटछाँट गरी कटेको भागमा बोर्डो पेस्ट लगाउन र बगैँचा सफा गरी १% बोर्डो मिश्रण छर्किएमा ढुसीजन्य रोग नियन्त्रण भई आउँदो वर्ष उत्पादन २०% सम्म वृद्धि हुने प्राविधिक सल्लाह छ।",
            "बाली सल्लाह",
            "2026-12-30",
            "पाँचपोखरी थाङपाल गाउँपालिका कृषि विकास शाखा"
        ),
    ]

    for a in advisories:
        cur.execute(adv_q, a)
    print(f"  Inserted {len(advisories)} agri advisories.")


def seed_agriculture_profiles(cur):
    """Seed agriculture_profiles linked to existing household_registries."""
    print("--- 8. Seeding agriculture_profiles ---")
    cur.execute('SELECT id, "wardNumber" FROM household_registries ORDER BY id LIMIT 16;')
    hhs = cur.fetchall()
    if not hhs:
        print("  No household_registries found, skipping profiles.")
        return

    prof_q = """
        INSERT INTO agriculture_profiles (
            id, household_id, "landAreaHectares", "farmerCategory", "mainCrops",
            "livestockDetails", "subsidiesReceived", additionaldetails, "createdAt", "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            "landAreaHectares" = EXCLUDED."landAreaHectares",
            "mainCrops" = EXCLUDED."mainCrops",
            "updatedAt" = NOW();
    """

    crops_list = [
        "धान, मकै, कोदो", "मकै, आलु, तरकारी", "आलु, किवी, फापर", "धान, गहुँ, तोरी",
        "अलैंची, मकै", "फापर, स्याउ, आलु", "उच्च हिमाली आलु, जौ", "आलु, जडीबुटी"
    ]

    for idx, (hh_id, ward) in enumerate(hhs, 1):
        pid = f"14000000-0000-0000-0000-{idx:012d}"
        land_ha = round(0.15 * (idx % 6 + 1), 2)
        crop = crops_list[(ward - 1) % len(crops_list)]
        
        livestock = {
            "cattle": 2 if ward <= 4 else 1,
            "goats": 5,
            "yaks": 6 if ward >= 6 else 0,
            "poultry": 25
        }
        subsidies = [
            {
                "programName": "कृषि यान्त्रिकीकरण अनुदान",
                "fiscalYear": "२०८०/०८१",
                "subsidyAmount": 25000,
                "dateBs": "२०८०-०८-१०",
                "item": "हाते टिलर मेशिन"
            }
        ]
        add_details = {
            "irrigationType": "कुलो / नहर (Canal)",
            "bankName": "कृषि विकास बैंक",
            "wardVerificationStatus": "प्रमाणित (Verified)",
            "insurancePolicyNo": f"AGR-INS-2081-{idx:04d}"
        }

        cur.execute(prof_q, (
            pid, hh_id, land_ha, "small", crop,
            json.dumps(livestock, ensure_ascii=False),
            json.dumps(subsidies, ensure_ascii=False),
            json.dumps(add_details, ensure_ascii=False)
        ))
    print(f"  Inserted {len(hhs)} agriculture_profiles.")


def main():
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = False
    cur = conn.cursor()
    try:
        seed_livestock_records(cur)
        seed_agriculture_crops(cur)
        seed_farmers(cur)
        seed_fertilizer_stocks_and_distributions(cur)
        seed_vet_services(cur)
        seed_market_items_and_prices(cur)
        seed_advisories(cur)
        seed_agriculture_profiles(cur)

        conn.commit()
        print("\nAll Agriculture & Livestock data committed successfully!")
    except Exception as e:
        conn.rollback()
        print(f"\nERROR: Transaction rolled back due to error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()