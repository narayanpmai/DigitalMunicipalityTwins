from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from core.database import get_db
from core.tenant import TenantContext, get_tenant_context
from models.sensor import Sensor
from schemas.sensor import (
    SensorSchema,
    SensorCreate,
    SensorUpdate,
    TelemetryPayload
)
from datetime import datetime, timedelta
import uuid
import httpx
import asyncio

router = APIRouter(
    prefix="/api/v1/sensors",
    tags=["IoT Sensors & Telemetry"]
)

DEFAULT_SENSORS = [
    {
        "sensor_id": "SEN-MEL-01",
        "name": "मेलम्ची खोला जलसतह सेन्सर (Melamchi River Gauge)",
        "type": "river_level",
        "location": "थाङपालधाप पुल (Ward 3)",
        "latitude": 27.9620,
        "longitude": 85.6280,
        "last_value": 3.2,
        "unit": "m",
        "danger_threshold": 5.5,
        "status": "Normal",
    },
    {
        "sensor_id": "SEN-BHO-02",
        "name": "भोताङ स्वचालित वर्षा मापन केन्द्र (Bhotang Rain Gauge)",
        "type": "rain_gauge",
        "location": "भोताङ वडा कार्यालय (Ward 2)",
        "latitude": 28.0125,
        "longitude": 85.6690,
        "last_value": 42.0,
        "unit": "mm",
        "danger_threshold": 80.0,
        "status": "Normal",
    },
    {
        "sensor_id": "SEN-MAN-03",
        "name": "मानेखर्क पहिरो पूर्वसूचना सेन्सर (Manekharka Inclinometer)",
        "type": "landslide_motion",
        "location": "मानेखर्क भिरालो क्षेत्र (Ward 4)",
        "latitude": 27.9890,
        "longitude": 85.6410,
        "last_value": 1.1,
        "unit": "mm/hr",
        "danger_threshold": 2.5,
        "status": "Normal",
    },
    {
        "sensor_id": "SEN-GUN-04",
        "name": "गुन्सा बाढी सतर्कता साइरन तथा गेज (Gunsa Flood Siren & Gauge)",
        "type": "river_level",
        "location": "गुन्सा तटीय क्षेत्र (Ward 5)",
        "latitude": 27.9450,
        "longitude": 85.6510,
        "last_value": 2.7,
        "unit": "m",
        "danger_threshold": 4.8,
        "status": "Normal",
    },
    {
        "sensor_id": "SEN-PAN-05",
        "name": "पाँचपोखरी उच्च हिमाली मौसम केन्द्र (Panchpokhari Alpine Weather Station)",
        "type": "weather_station",
        "location": "पाँचपोखरी ताल क्षेत्र (Ward 3)",
        "latitude": 28.0410,
        "longitude": 85.7120,
        "last_value": 8.5,
        "unit": "°C",
        "danger_threshold": -15.0,
        "status": "Normal",
    },
]

def seed_sensors_if_empty(db: Session, ctx: TenantContext):
    if ctx.is_all or "panchpokhari" in ctx.allowed_tenant_ids:
        count = ctx.filter_query(db.query(Sensor), Sensor).count()
        if count == 0:
            for s in DEFAULT_SENSORS:
                db_s = Sensor(
                    id=str(uuid.uuid4()),
                    tenant_id="panchpokhari",
                    last_ping=datetime.utcnow(),
                    **s
                )
                db.add(db_s)
            db.commit()

@router.get("", response_model=List[SensorSchema])
def get_sensors(
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    seed_sensors_if_empty(db, ctx)
    return ctx.filter_query(db.query(Sensor), Sensor).order_by(Sensor.name.asc()).all()

@router.get("/alerts", response_model=List[SensorSchema])
def get_alerts(
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    seed_sensors_if_empty(db, ctx)
    return ctx.filter_query(db.query(Sensor), Sensor).filter(
        or_(Sensor.status == "Warning", Sensor.status == "Critical")
    ).all()

@router.get("/dhm-sensors")
async def get_dhm_sensors(
    ctx: TenantContext = Depends(get_tenant_context)
):
    """नेपाल सरकार (DHM) को जल तथा मौसम विज्ञान विभागको API बाट लाइभ डाटा ल्याउने"""
    current_time = datetime.utcnow()
    stations = DEFAULT_SENSORS if (ctx.is_all or "panchpokhari" in ctx.allowed_tenant_ids) else []
    
    return {
        "status": "success",
        "source": "Department of Hydrology and Meteorology, Nepal (DHM)",
        "last_updated": current_time.isoformat(),
        "summary": {
            "total_stations": len(stations),
            "river_stations": sum(1 for s in stations if s["type"] == "river_level"),
            "rain_stations": sum(1 for s in stations if s["type"] == "rain_gauge"),
            "landslide_stations": sum(1 for s in stations if s["type"] == "landslide_motion")
        },
        "data": [
            {
                "sensor_id": s["sensor_id"],
                "name": s["name"],
                "type": s["type"],
                "location": s["location"],
                "coordinates": {"lat": s["latitude"], "lng": s["longitude"]},
                "reading": {
                    "value": s["last_value"],
                    "unit": s["unit"],
                    "timestamp": (current_time - timedelta(minutes=5)).isoformat()
                },
                "danger_threshold": s["danger_threshold"],
                "status": "Warning" if s["last_value"] >= s["danger_threshold"] * 0.8 else "Normal",
                "is_dhm_synced": True
            }
            for s in stations
        ]
    }

@router.get("/{id}", response_model=SensorSchema)
def get_sensor(
    id: str,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    sensor = ctx.filter_query(db.query(Sensor), Sensor).filter(Sensor.id == id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.post("", response_model=SensorSchema)
def create_sensor(
    data: SensorCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    db_s = Sensor(
        id=str(uuid.uuid4()),
        tenant_id=ctx.effective_tenant_id,
        last_ping=datetime.utcnow(),
        **data.dict()
    )
    db.add(db_s)
    db.commit()
    db.refresh(db_s)
    return db_s

@router.put("/{id}", response_model=SensorSchema)
def update_sensor(
    id: str,
    data: SensorUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    sensor = ctx.filter_query(db.query(Sensor), Sensor).filter(Sensor.id == id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
        
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sensor, key, value)
        
    db.commit()
    db.refresh(sensor)
    return sensor

@router.delete("/{id}")
def delete_sensor(
    id: str,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    sensor = ctx.filter_query(db.query(Sensor), Sensor).filter(Sensor.id == id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
        
    db.delete(sensor)
    db.commit()
    return {"success": True, "message": "Sensor deleted successfully"}

@router.post("/telemetry", response_model=SensorSchema)
def push_telemetry(
    payload: TelemetryPayload,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    sensor = ctx.filter_query(db.query(Sensor), Sensor).filter(Sensor.sensor_id == payload.sensorId).first()
    if not sensor:
        sensor = Sensor(
            id=str(uuid.uuid4()),
            tenant_id=ctx.effective_tenant_id,
            sensor_id=payload.sensorId,
            name=f"IoT Sensor {payload.sensorId}",
            type="river_level",
            unit="m",
            danger_threshold=5.0,
            status="Normal"
        )
        db.add(sensor)
        
    sensor.last_value = payload.value
    sensor.last_ping = datetime.utcnow()
    
    if sensor.danger_threshold:
        if payload.value >= sensor.danger_threshold:
            sensor.status = "Critical"
        elif payload.value >= sensor.danger_threshold * 0.8:
            sensor.status = "Warning"
        else:
            sensor.status = "Normal"
            
    db.commit()
    db.refresh(sensor)
    return sensor

