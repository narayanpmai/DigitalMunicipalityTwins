import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
import datetime
from core.database import SessionLocal
from models.fiscal_year import FiscalYear

TEN_YEAR_FISCAL_YEARS_DATA = [
    {
        "id": uuid.UUID("10740000-0000-0000-0000-000000002074"),
        "year_np": "२०७४/०७५",
        "year_en": "2017/2018",
        "is_current": False,
        "start_date_ad": datetime.date(2017, 7, 16),
        "end_date_ad": datetime.date(2018, 7, 16),
        "approved_budget_npr": 320000000,
        "expenditure_so_far_npr": 298000000,
        "remarks": "स्थानीय तह प्रथम निर्वाचन तथा संघीयता कार्यान्वयन पहिलो वर्ष (बेसलाइन वर्ष)",
    },
    {
        "id": uuid.UUID("10750000-0000-0000-0000-000000002075"),
        "year_np": "२०७५/०७६",
        "year_en": "2018/2019",
        "is_current": False,
        "start_date_ad": datetime.date(2018, 7, 17),
        "end_date_ad": datetime.date(2019, 7, 16),
        "approved_budget_npr": 365000000,
        "expenditure_so_far_npr": 348000000,
        "remarks": "आवधिक योजना तर्जुमा तथा संस्थागत संरचना निर्माण",
    },
    {
        "id": uuid.UUID("10760000-0000-0000-0000-000000002076"),
        "year_np": "२०७६/०७७",
        "year_en": "2019/2020",
        "is_current": False,
        "start_date_ad": datetime.date(2019, 7, 17),
        "end_date_ad": datetime.date(2020, 7, 15),
        "approved_budget_npr": 410000000,
        "expenditure_so_far_npr": 382000000,
        "remarks": "कोभिड-१९ महामारी व्यवस्थापन तथा आधारभूत पूर्वाधार",
    },
    {
        "id": uuid.UUID("10770000-0000-0000-0000-000000002077"),
        "year_np": "२०७७/०७८",
        "year_en": "2020/2021",
        "is_current": False,
        "start_date_ad": datetime.date(2020, 7, 16),
        "end_date_ad": datetime.date(2021, 7, 15),
        "approved_budget_npr": 450000000,
        "expenditure_so_far_npr": 428000000,
        "remarks": "विपद् पुनरुत्थान तथा स्वास्थ्य चौकी स्तरोन्नति",
    },
    {
        "id": uuid.UUID("10780000-0000-0000-0000-000000002078"),
        "year_np": "२०७८/०७९",
        "year_en": "2021/2022",
        "is_current": False,
        "start_date_ad": datetime.date(2021, 7, 16),
        "end_date_ad": datetime.date(2022, 7, 16),
        "approved_budget_npr": 485000000,
        "expenditure_so_far_npr": 462000000,
        "remarks": "प्रथम स्थानीय सरकारको ५ वर्षे कार्यकाल सम्पन्न तथा समीक्षा",
    },
    {
        "id": uuid.UUID("10790000-0000-0000-0000-000000002079"),
        "year_np": "२०७९/०८०",
        "year_en": "2022/2023",
        "is_current": False,
        "start_date_ad": datetime.date(2022, 7, 17),
        "end_date_ad": datetime.date(2023, 7, 16),
        "approved_budget_npr": 528000000,
        "expenditure_so_far_npr": 498500000,
        "remarks": "दोस्रो स्थानीय तह निर्वाचन (मिडलाइन वर्ष)",
    },
    {
        "id": uuid.UUID("10800000-0000-0000-0000-000000002080"),
        "year_np": "२०८०/०८१",
        "year_en": "2023/2024",
        "is_current": False,
        "start_date_ad": datetime.date(2023, 7, 17),
        "end_date_ad": datetime.date(2024, 7, 15),
        "approved_budget_npr": 565000000,
        "expenditure_so_far_npr": 534000000,
        "remarks": "डिजिटल सुशासन, SuTRA र सामाजिक सुरक्षा पूर्ण अनलाइन",
    },
    {
        "id": uuid.UUID("10810000-0000-0000-0000-000000002081"),
        "year_np": "२०८१/०८२",
        "year_en": "2024/2025",
        "is_current": True,
        "start_date_ad": datetime.date(2024, 7, 16),
        "end_date_ad": datetime.date(2025, 7, 15),
        "approved_budget_npr": 612500000,
        "expenditure_so_far_npr": 284000000,
        "remarks": "चालु आर्थिक वर्ष (बजेट तथा योजना कार्यान्वयन चरण)",
    },
    {
        "id": uuid.UUID("10820000-0000-0000-0000-000000002082"),
        "year_np": "२०८२/०८३",
        "year_en": "2025/2026",
        "is_current": False,
        "start_date_ad": datetime.date(2025, 7, 16),
        "end_date_ad": datetime.date(2026, 7, 15),
        "approved_budget_npr": 675000000,
        "expenditure_so_far_npr": 0,
        "remarks": "आगामी आवधिक योजना तथा MTEF प्रक्षेपित बजेट",
    },
    {
        "id": uuid.UUID("10830000-0000-0000-0000-000000002083"),
        "year_np": "२०८३/०८४",
        "year_en": "2026/2027",
        "is_current": False,
        "start_date_ad": datetime.date(2026, 7, 16),
        "end_date_ad": datetime.date(2027, 7, 15),
        "approved_budget_npr": 730000000,
        "expenditure_so_far_npr": 0,
        "remarks": "दीर्घकालीन पूर्वाधार विस्तार तथा कृषि आधुनिकीकरण",
    },
    {
        "id": uuid.UUID("10840000-0000-0000-0000-000000002084"),
        "year_np": "२०८४/०८५",
        "year_en": "2027/2028",
        "is_current": False,
        "start_date_ad": datetime.date(2027, 7, 16),
        "end_date_ad": datetime.date(2028, 7, 15),
        "approved_budget_npr": 790000000,
        "expenditure_so_far_npr": 0,
        "remarks": "१० वर्षे दीर्घकालीन समृद्ध पाँचपोखरी लक्ष्य (२०७४-२०८४)",
    },
]

def seed_fiscal_years():
    db = SessionLocal()
    try:
        count = db.query(FiscalYear).count()
        if count >= len(TEN_YEAR_FISCAL_YEARS_DATA):
            print(f"Fiscal years already seeded ({count} rows).")
            return

        for fy in TEN_YEAR_FISCAL_YEARS_DATA:
            existing = db.query(FiscalYear).filter(
                (FiscalYear.year_np == fy["year_np"]) | (FiscalYear.year_en == fy["year_en"])
            ).first()
            if not existing:
                db.add(FiscalYear(**fy))
            else:
                existing.remarks = fy["remarks"]
                existing.is_current = fy["is_current"]
                if fy.get("approved_budget_npr"):
                    existing.approved_budget_npr = fy["approved_budget_npr"]
        db.commit()
        print(f"Successfully seeded {len(TEN_YEAR_FISCAL_YEARS_DATA)} statutory fiscal years (२०७४/०७५ to २०८४/०८५)!")
    finally:
        db.close()

if __name__ == '__main__':
    seed_fiscal_years()
