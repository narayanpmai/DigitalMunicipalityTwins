"""
Script to calculate key metrics and populate the dash_analytics_cache table.
This acts as a background caching job for the Dashboard.
"""
import uuid
import json
from datetime import datetime
from sqlalchemy import text, func
from core.database import SessionLocal
from models.dashboard_analytics import DashboardAnalyticsCache
from models.demographics import Household, DemographicValue
from models.budget import Budget
from models.citizen import Citizen
from models.master_data import InfrastructureMaster, AssetMaster

TENANT_ID = "f07c2bcc-81ad-4e27-aeff-1a65f04e9f06"

def refresh_dashboard_cache():
    db = SessionLocal()
    try:
        print("📊 Starting Dashboard Analytics Cache generation...")
        
        # 1. Total Households
        total_households = db.query(Household).count()
        _upsert_metric(db, "TOTAL_HOUSEHOLDS", {"value": total_households, "label": "कुल घरधुरी"})
        
        # 2. Total Citizens
        total_citizens = db.query(Citizen).count()
        _upsert_metric(db, "TOTAL_CITIZENS", {"value": total_citizens, "label": "कुल नागरिक"})
        
        # 3. Citizens by Ward
        ward_citizens = db.execute(text('SELECT "wardNumber", count(*) FROM citizens GROUP BY "wardNumber" ORDER BY "wardNumber"')).fetchall()
        ward_data = [{"ward": str(r[0]), "count": r[1]} for r in ward_citizens]
        _upsert_metric(db, "CITIZENS_BY_WARD", {"data": ward_data})
        
        # 4. Total Wards
        total_wards = 8 # Panchpokhari Thangpal has 8 wards
        _upsert_metric(db, "TOTAL_WARDS", {"value": total_wards})
        
        # 5. Total Budget Valuation (Sum of allocated budget)
        budget_sum = db.query(Budget).with_entities(func.sum(Budget.allocated_amount)).scalar()
        _upsert_metric(db, "TOTAL_BUDGET", {"value": float(budget_sum or 0), "formatted": f"रु {float(budget_sum or 0):,.2f}"})
        
        # 6. Infrastructure count
        infra_count = db.query(InfrastructureMaster).count()
        _upsert_metric(db, "TOTAL_INFRASTRUCTURE", {"value": infra_count or 0})
        
        # 7. Asset count
        asset_count = db.query(AssetMaster).count()
        _upsert_metric(db, "TOTAL_ASSETS", {"value": asset_count or 0})
        
        db.commit()
        print("✅ Dashboard Analytics Cache successfully updated.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating cache: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def _upsert_metric(db, key, value_dict):
    cache = db.query(DashboardAnalyticsCache).filter(DashboardAnalyticsCache.metric_key == key).first()
    if not cache:
        cache = DashboardAnalyticsCache(
            id=str(uuid.uuid4()),
            tenant_id=TENANT_ID,
            metric_key=key,
            metric_value=value_dict,
            last_calculated_at=datetime.utcnow()
        )
        db.add(cache)
    else:
        cache.metric_value = value_dict
        cache.last_calculated_at = datetime.utcnow()

if __name__ == "__main__":
    refresh_dashboard_cache()
