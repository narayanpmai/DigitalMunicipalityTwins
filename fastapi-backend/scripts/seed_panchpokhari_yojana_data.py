import os
import sys
import re
import uuid
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal, engine
from core.db_init import init_and_sync_db
from models.budget import Budget, BudgetSource

def nepali_to_ascii(s: str) -> str:
    nepali_digits = {'०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'}
    return ''.join(nepali_digits.get(c, c) for c in str(s))

def parse_num(s: str) -> float:
    ascii_str = nepali_to_ascii(s)
    clean = re.sub(r'[^\d.]', '', ascii_str)
    try:
        return float(clean)
    except Exception:
        return 0.0

def seed():
    print("Ensuring database tables and columns are synchronized...")
    init_and_sync_db()

    db = SessionLocal()
    tenant_id = "panchpokhari"

    # 1. Parse and seed Budget Sources
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates_sources = [
        os.path.join(script_dir, "data", "योजना सम्झौता - बजेट स्रोत सुची.html"),
        r"C:\Users\UNepal\Desktop\Yojana\योजना सम्झौता - बजेट स्रोत सुची.html",
        "/app/scripts/data/योजना सम्झौता - बजेट स्रोत सुची.html"
    ]
    sources_html_path = next((p for p in candidates_sources if os.path.exists(p)), None)
    if sources_html_path:
        print(f"Reading Budget Sources from {sources_html_path}...")
        with open(sources_html_path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()

        rows = re.findall(r'<tr>(.*?)</tr>', html, re.DOTALL)
        source_count = 0
        for r in rows:
            cols = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)
            cols = [re.sub(r'<[^>]+>', '', c).strip() for c in cols]
            if len(cols) >= 3 and cols[0] != 'क्र.स.' and cols[1]:
                sn_str = cols[0]
                name = cols[1]
                status = cols[2] if len(cols) > 2 and cols[2] else "सक्रिय"
                sn_num = int(parse_num(sn_str)) if parse_num(sn_str) > 0 else (source_count + 1)

                existing = db.query(BudgetSource).filter(BudgetSource.name == name).first()
                if not existing:
                    bs = BudgetSource(
                        id=uuid.uuid4(),
                        tenant_id=tenant_id,
                        sn=sn_num,
                        name=name,
                        status=status,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(bs)
                    source_count += 1
                else:
                    existing.sn = sn_num
                    existing.status = status
                    existing.tenant_id = tenant_id

        db.commit()
        print(f"Seeded/Updated {source_count} new Budget Sources.")
    else:
        print(f"File not found: {sources_html_path}")

    # 2. Parse and seed Budget Sub-Heads
    candidates_subheads = [
        os.path.join(script_dir, "data", "योजना सम्झौता - बजेट उप-शिर्षक सुची.html"),
        r"C:\Users\UNepal\Desktop\Yojana\योजना सम्झौता - बजेट उप-शिर्षक सुची.html",
        "/app/scripts/data/योजना सम्झौता - बजेट उप-शिर्षक सुची.html"
    ]
    subheads_html_path = next((p for p in candidates_subheads if os.path.exists(p)), None)
    if subheads_html_path:
        print(f"Reading Budget Sub-Heads from {subheads_html_path}...")
        with open(subheads_html_path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()

        rows = re.findall(r'<tr>(.*?)</tr>', html, re.DOTALL)
        subhead_count = 0
        for r in rows:
            cols = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)
            cols = [re.sub(r'<[^>]+>', '', c).strip() for c in cols]
            if len(cols) >= 8 and cols[0] != 'क्र.स.' and cols[2]:
                sub_head_no = cols[1]
                title = cols[2]
                amount = parse_num(cols[3])
                source = cols[4]
                level = cols[5]
                expense_type = cols[6]
                status = cols[7]
                approval_state = cols[8] if len(cols) > 8 else "स्विकृत भएको"

                # Extract ward number if present in title
                ward_no = 0
                ward_match = re.search(r'वडा\s*नं\.?\s*([०-९\d]+)', title)
                if ward_match:
                    ward_no = int(parse_num(ward_match.group(1)))

                existing = db.query(Budget).filter(Budget.title == title).first()
                if not existing:
                    b = Budget(
                        id=uuid.uuid4(),
                        tenant_id=tenant_id,
                        title=title,
                        sub_head_no=sub_head_no,
                        level=level or ("वडा स्तरिय" if ward_no > 0 else "नगर स्तरिय"),
                        expense_type=expense_type or "पुँजीगत खर्च",
                        approval_state=approval_state or "स्विकृत भएको",
                        fiscal_year="२०८१/०८२",
                        type="capital" if "पुँजीगत" in (expense_type or "") else "recurrent",
                        status="approved" if "स्विकृत" in (approval_state or "") else "active",
                        sector="पूर्वाधार विकास" if any(k in title for k in ["बाटो", "मन्दिर", "पुल", "सडक", "भवन"]) else "सामाजिक विकास",
                        ward_number=ward_no if ward_no > 0 else None,
                        allocated_amount=amount,
                        released_amount=amount,
                        spent_amount=0,
                        source_of_fund=source or "आन्तरीक स्रोत",
                        description=f"बजेट उप-शीर्षक नं. {sub_head_no} अन्तर्गत विनियोजित कार्यक्रम",
                        approved_by="गाउँसभा / कार्यपालिका",
                        approved_at=datetime.utcnow(),
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(b)
                    subhead_count += 1
                else:
                    existing.sub_head_no = sub_head_no
                    existing.level = level or existing.level
                    existing.expense_type = expense_type or existing.expense_type
                    existing.approval_state = approval_state or existing.approval_state
                    existing.source_of_fund = source or existing.source_of_fund
                    if amount > 0:
                        existing.allocated_amount = amount

        db.commit()
        print(f"Seeded/Updated {subhead_count} new Budget Sub-Heads.")
    else:
        print(f"File not found: {subheads_html_path}")

    # Summary
    total_sources = db.query(BudgetSource).count()
    total_budgets = db.query(Budget).count()
    print(f"COMPLETED! Total Budget Sources in DB: {total_sources}, Total Budgets in DB: {total_budgets}")
    db.close()

if __name__ == "__main__":
    seed()
