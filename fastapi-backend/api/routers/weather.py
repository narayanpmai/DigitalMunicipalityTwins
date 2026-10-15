from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
import models.weather as models
import schemas.weather as schemas
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/weather",
    tags=["Weather Info"]
)

@router.get("/current", response_model=List[schemas.WeatherStationResponse])
def get_current_weather(db: Session = Depends(get_db)):
    stations = db.query(models.WeatherStationData).all()
    if not stations:
        return [
            {
                "id": "stn-gobre", "station_id": "stn-gobre", "name": "गोब्रे वर्षामापन केन्द्र",
                "temp": 18, "rainfall24h": 12.5, "rainfall1h": 2.1, "humidity": 65,
                "status": "Normal", "forecast": "हल्का वर्षाको सम्भावना", "last_updated": datetime.utcnow()
            },
            {
                "id": "stn-thangpaldhap", "station_id": "stn-thangpaldhap", "name": "थाङपालधाप वर्षामापन केन्द्र",
                "temp": 20, "rainfall24h": 5.2, "rainfall1h": 0.0, "humidity": 60,
                "status": "Normal", "forecast": "आंशिक बदली, मौसम सफा", "last_updated": datetime.utcnow()
            },
            {
                "id": "stn-thangpalkot", "station_id": "stn-thangpalkot", "name": "थाङपालकोट वर्षामापन केन्द्र",
                "temp": 19, "rainfall24h": 32.0, "rainfall1h": 15.5, "humidity": 78,
                "status": "Warning", "forecast": "निरन्तर वर्षा, सतर्कता अपनाउनुहोला", "last_updated": datetime.utcnow()
            },
            {
                "id": "stn-banskarka", "station_id": "stn-banskarka", "name": "बाँसखर्क वर्षामापन केन्द्र",
                "temp": 22, "rainfall24h": 0.0, "rainfall1h": 0.0, "humidity": 55,
                "status": "Normal", "forecast": "घाम लाग्ने सम्भावना", "last_updated": datetime.utcnow()
            },
            {
                "id": "stn-bhotang", "station_id": "stn-bhotang", "name": "भोताङ्ग वर्षामापन केन्द्र",
                "temp": 15, "rainfall24h": 85.5, "rainfall1h": 25.0, "humidity": 90,
                "status": "Danger", "forecast": "अति भारी वर्षा, बाढीको उच्च जोखिम", "last_updated": datetime.utcnow()
            },
            {
                "id": "stn-nosyampati", "station_id": "stn-nosyampati", "name": "नोस्यामपाटी वर्षामापन केन्द्र",
                "temp": 12, "rainfall24h": 18.0, "rainfall1h": 5.0, "humidity": 82,
                "status": "Normal", "forecast": "चिसो हावा र हल्का वर्षा", "last_updated": datetime.utcnow()
            }
        ]
    return stations

@router.post("/data", response_model=schemas.WeatherStationResponse, status_code=status.HTTP_201_CREATED)
def add_weather_data(data: schemas.WeatherStationCreate, db: Session = Depends(get_db)):
    # Check if station exists
    existing = db.query(models.WeatherStationData).filter(models.WeatherStationData.station_id == data.station_id).first()
    if existing:
        for key, value in data.model_dump().items():
            setattr(existing, key, value)
        existing.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
        
    db_data = models.WeatherStationData(**data.model_dump())
    db.add(db_data)
    try:
        db.commit()
        db.refresh(db_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_data
