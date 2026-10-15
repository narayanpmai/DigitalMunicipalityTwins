from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from core.database import get_db

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics (विश्लेषण तथा AI पूर्वानुमान)"]
)


def _safe_query(db: Session, sql: str):
    try:
        return db.execute(text(sql)).fetchall()
    except Exception:
        return []


def _safe_one(db: Session, sql: str):
    try:
        return db.execute(text(sql)).fetchone()
    except Exception:
        return None


# ── Dashboard summary ─────────────────────────────────────────────────────────

@router.get("/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    एडमिन ड्यासबोर्ड सारांश: प्रयोगकर्ता, वडा, नागरिक, परियोजना, बजेट आदि।
    Uses direct SQL for cross-table aggregate speed.
    """
    queries = {
        "totalUsers":               'SELECT COUNT(*) FROM users WHERE "deletedAt" IS NULL',
        "totalWards":               'SELECT COUNT(*) FROM wards',
        "totalCitizens":            'SELECT COUNT(*) FROM citizens WHERE "deletedAt" IS NULL',
        "totalProjects":            'SELECT COUNT(*) FROM projects WHERE "deletedAt" IS NULL',
        "totalComplaints":          'SELECT COUNT(*) FROM complaints',
        "totalServiceApplications": 'SELECT COUNT(*) FROM citizen_services',
    }
    budget_sql = 'SELECT COALESCE(SUM("allocatedAmount"), 0) FROM budgets WHERE "deletedAt" IS NULL'
    contract_sql = 'SELECT COALESCE(SUM("contractAmount"), 0) FROM contracts WHERE "deletedAt" IS NULL'

    result = {}
    for key, sql in queries.items():
        row = _safe_one(db, sql)
        result[key] = int(row[0]) if row else 0

    budget_row = _safe_one(db, budget_sql)
    result["totalBudgetAllocated"] = float(budget_row[0]) if budget_row and budget_row[0] else 0.0

    contract_row = _safe_one(db, contract_sql)
    result["totalContractValue"] = float(contract_row[0]) if contract_row and contract_row[0] else 0.0

    from datetime import datetime
    result["generatedAt"] = datetime.utcnow().isoformat()
    return result


# ── Population by ward ────────────────────────────────────────────────────────

@router.get("/population")
def get_population_by_ward(db: Session = Depends(get_db)):
    """वडा अनुसार जनसंख्या वितरण"""
    rows = _safe_query(db, 'SELECT "wardNumber", population, households FROM wards ORDER BY "wardNumber" ASC')
    return [{"wardNumber": r[0], "population": r[1], "households": r[2]} for r in rows]


# ── Projects by status ────────────────────────────────────────────────────────

@router.get("/projects")
def get_projects_by_status(db: Session = Depends(get_db)):
    """स्थिति अनुसार परियोजनाहरूको सारांश"""
    rows = _safe_query(db, 'SELECT status, COUNT(*) as count FROM projects WHERE "deletedAt" IS NULL GROUP BY status')
    return [{"status": r[0], "count": int(r[1])} for r in rows]


# ── Complaints trend (6 months) ───────────────────────────────────────────────

@router.get("/complaints-trend")
def get_complaints_trend(db: Session = Depends(get_db)):
    """पछिल्लो ६ महिनाको गुनासो प्रवृत्ति"""
    rows = _safe_query(db, """
        SELECT DATE_TRUNC('month', "createdAt") as month, status, COUNT(*) as count
        FROM complaints
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month, status
        ORDER BY month ASC
    """)
    return [{"month": str(r[0]), "status": r[1], "count": int(r[2])} for r in rows]


# ── Budget utilization ────────────────────────────────────────────────────────

@router.get("/budget")
def get_budget_utilization(db: Session = Depends(get_db)):
    """क्षेत्र अनुसार बजेट विनियोजन र खर्च विश्लेषण"""
    rows = _safe_query(db, """
        SELECT sector, SUM("allocatedAmount") as allocated, SUM("spentAmount") as spent
        FROM budgets WHERE "deletedAt" IS NULL
        GROUP BY sector ORDER BY allocated DESC
    """)
    return [
        {
            "sector": r[0],
            "allocated": float(r[1]) if r[1] else 0.0,
            "spent": float(r[2]) if r[2] else 0.0,
        }
        for r in rows
    ]


# ── Demographics analytics ────────────────────────────────────────────────────

@router.get("/demographics")
def get_demographics_analytics(db: Session = Depends(get_db)):
    """घरधुरी सर्वेक्षणबाट जनसांख्यिकी विश्लेषण (जोखिम क्षेत्र, लिंग आधारित)"""
    risk_row = _safe_one(db, """
        SELECT
          SUM(CASE WHEN "isRiverbankHouse" = true THEN 1 ELSE 0 END) as riverbank_households,
          SUM(CASE WHEN "isRiverbankHouse" = false THEN 1 ELSE 0 END) as safe_households
        FROM household_registries
        WHERE "deletedAt" IS NULL
    """)
    gender_rows = _safe_query(db, """
        SELECT "headGender", COUNT(*) as count
        FROM household_registries
        WHERE "deletedAt" IS NULL
        GROUP BY "headGender"
    """)

    return {
        "risk": {
            "riverbank_households": int(risk_row[0]) if risk_row and risk_row[0] else 0,
            "safe_households": int(risk_row[1]) if risk_row and risk_row[1] else 0,
        },
        "gender": [{"headGender": r[0], "count": int(r[1])} for r in gender_rows],
    }


# ── Crop yield forecast (AI / fallback) ──────────────────────────────────────

BASE_YIELD_MAP = {
    "आलु": 12.0,
    "किवी": 6.0,
    "स्याउ": 6.0,
    "मकै": 2.5,
    "अलैँची": 0.5,
    "potato": 12.0,
    "kiwi": 6.0,
    "apple": 6.0,
    "maize": 2.5,
    "cardamom": 0.5,
}


@router.post("/crop-yield-forecast")
async def forecast_crop_yield(
    body: dict = Body(
        ...,
        example={
            "crop_name": "आलु",
            "area_hectares": 2.5,
            "rainfall_factor": 1.0,
            "fertilizer_applied": True,
        }
    )
):
    """
    AI कृषि उपज पूर्वानुमान — AI microservice उपलब्ध छ भने त्यसलाई call गर्छ,
    अन्यथा स्थानीय heuristic fallback प्रयोग गर्छ।
    """
    import os, httpx
    crop_name = body.get("crop_name", "")
    area_ha = float(body.get("area_hectares", 1.0))
    rainfall = float(body.get("rainfall_factor", 1.0))
    fertilizer = bool(body.get("fertilizer_applied", False))

    # Try AI microservice
    ai_url = os.getenv("AI_SERVICE_URL", "http://ai_service:8000")
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                f"{ai_url}/api/v1/analytics/crop-yield-forecast",
                json=body,
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass

    # Heuristic fallback
    base_yield = BASE_YIELD_MAP.get(crop_name, 4.0)
    fertilizer_boost = 1.15 if fertilizer else 0.9
    adjusted_yield = round(base_yield * rainfall * fertilizer_boost, 2)
    total_production = round(area_ha * adjusted_yield, 2)
    revenue = round(total_production * 35000)

    return {
        "crop_name": crop_name,
        "cultivated_area_hectares": area_ha,
        "predicted_yield_ton_per_ha": adjusted_yield,
        "total_estimated_production_metric_tons": total_production,
        "projected_revenue_npr": revenue,
        "source": "heuristic_fallback",
    }


@router.get('/realtime')
def get_analytics_realtime():
    return {'total': 0}
