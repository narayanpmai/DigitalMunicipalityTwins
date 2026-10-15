from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter(prefix="/analytics", tags=["Data Science & Forecasting"])

class CropForecastRequest(BaseModel):
    crop_name: str
    area_hectares: float
    rainfall_factor: float = 1.0 # 0.8 to 1.2
    fertilizer_applied: bool = True

class BudgetForecastRequest(BaseModel):
    fiscal_year: str
    target_growth_rate: float = 0.08

@router.post("/crop-yield-forecast")
async def forecast_crop_yield(req: CropForecastRequest):
    """
    Predictive crop production estimator based on hectare coverage and climate factor
    """
    base_yield_map = {
        "आलु": 12.0,       # 12 ton/ha
        "किबी": 6.0,        # 6 ton/ha
        "स्याउ": 6.0,       # 6 ton/ha
        "मकै": 2.5,        # 2.5 ton/ha
        "अलैँची": 0.5       # 0.5 ton/ha
    }
    
    base_yield = base_yield_map.get(req.crop_name, 4.0)
    adjusted_yield = base_yield * req.rainfall_factor * (1.15 if req.fertilizer_applied else 0.9)
    estimated_production_metric_tons = req.area_hectares * adjusted_yield
    
    return {
        "crop_name": req.crop_name,
        "cultivated_area_hectares": req.area_hectares,
        "predicted_yield_ton_per_ha": round(adjusted_yield, 2),
        "total_estimated_production_metric_tons": round(estimated_production_metric_tons, 2),
        "projected_revenue_npr": round(estimated_production_metric_tons * 35000, 2) # approx NPR 35/kg
    }

@router.post("/revenue-forecast")
async def forecast_municipal_revenue(req: BudgetForecastRequest):
    """
    Predictive municipal internal revenue model
    """
    current_revenue = 45000000.0 # NPR 4.5 crore internal
    projected = current_revenue * (1 + req.target_growth_rate)
    
    return {
        "base_fiscal_year": "2081/082",
        "forecast_fiscal_year": req.fiscal_year,
        "base_revenue_npr": current_revenue,
        "projected_revenue_npr": round(projected, 2),
        "top_growing_sectors": ["पर्यटन शुल्क", "व्यवसाय कर", "मालपोत तथा सिफारिस"]
    }
