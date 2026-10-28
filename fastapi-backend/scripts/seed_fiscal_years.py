import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
import datetime
from core.database import SessionLocal
from models.fiscal_year import FiscalYear

def seed_fiscal_years():
    db = SessionLocal()
    try:
        count = db.query(FiscalYear).count()
        if count > 0:
            print(f"Fiscal years already exist ({count} rows).")
            # Ensure current is set to 2081/082
            curr = db.query(FiscalYear).filter(FiscalYear.is_current == True).first()
            if not curr:
                fy81 = db.query(FiscalYear).filter(FiscalYear.year_np.like("%२०८१%")).first()
                if fy81:
                    fy81.is_current = True
                    db.commit()
                    print("Set २०८१/०८२ as current fiscal year.")
            return

        fiscal_years_data = [
            {
                "id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
                "year_np": "२०७८/०७९",
                "year_en": "2021/2022",
                "is_current": False,
                "start_date_ad": datetime.date(2021, 7, 16),
                "end_date_ad": datetime.date(2022, 7, 16),
                "approved_budget_npr": 485000000,
                "expenditure_so_far_npr": 462000000,
                "remarks": "आर्थिक वर्ष २०७८/७९ यथार्थ आय-व्यय प्रतिवेदन पारित",
            },
            {
                "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
                "year_np": "२०७९/०८०",
                "year_en": "2022/2023",
                "is_current": False,
                "start_date_ad": datetime.date(2022, 7, 17),
                "end_date_ad": datetime.date(2023, 7, 16),
                "approved_budget_npr": 528000000,
                "expenditure_so_far_npr": 498500000,
                "remarks": "आर्थिक वर्ष २०७९/८० अन्तिम लेखापरीक्षण सम्पन्न",
            },
            {
                "id": uuid.UUID("33333333-3333-3333-3333-333333333333"),
                "year_np": "२०८०/०८१",
                "year_en": "2023/2024",
                "is_current": False,
                "start_date_ad": datetime.date(2023, 7, 17),
                "end_date_ad": datetime.date(2024, 7, 15),
                "approved_budget_npr": 565000000,
                "expenditure_so_far_npr": 534000000,
                "remarks": "आर्थिक वर्ष २०८०/८१ गाउँसभाबाट अनुमोदन",
            },
            {
                "id": uuid.UUID("44444444-4444-4444-4444-444444444444"),
                "year_np": "२०८१/०८२",
                "year_en": "2024/2025",
                "is_current": True,
                "start_date_ad": datetime.date(2024, 7, 16),
                "end_date_ad": datetime.date(2025, 7, 15),
                "approved_budget_npr": 612500000,
                "expenditure_so_far_npr": 284000000,
                "remarks": "चालु आर्थिक वर्ष (बजेट कार्यान्वयन चरण)",
            },
            {
                "id": uuid.UUID("55555555-5555-5555-5555-555555555555"),
                "year_np": "२०८२/०८३",
                "year_en": "2025/2026",
                "is_current": False,
                "start_date_ad": datetime.date(2025, 7, 16),
                "end_date_ad": datetime.date(2026, 7, 15),
                "approved_budget_npr": 675000000,
                "expenditure_so_far_npr": 0,
                "remarks": "मध्यकालीन खर्च संरचना (MTEF) प्रक्षेपित बजेट",
            },
        ]

        for fy in fiscal_years_data:
            db.add(FiscalYear(**fy))
        db.commit()
        print("Successfully seeded 5 statutory fiscal years into fiscal_years table!")
        print("Active fiscal year: २०८१/०८२ (isCurrent = True)")
    finally:
        db.close()

if __name__ == '__main__':
    seed_fiscal_years()
