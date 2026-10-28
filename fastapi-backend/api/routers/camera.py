from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.tenant import TenantContext, get_tenant_context
from models.camera import AiCamera
from schemas.camera import (
    AiCameraSchema,
    AiCameraCreate,
    AiCameraUpdate,
    CameraStats,
    CameraPingPayload
)
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/api/v1/cameras",
    tags=["Cameras & AI Surveillance"]
)

DEFAULT_CAMERAS = [
    {
        "camera_id": "CAM-01",
        "name": "पाँचपोखरी प्रवेशद्वार मुख्य गेट (Panchpokhari Main Gate)",
        "type": "Entrance & Security",
        "location": "पाँचपोखरी गेट, थाङपाल (Ward 3)",
        "latitude": 27.980,
        "longitude": 85.752,
        "status": "Active",
        "today_visitor_count": 64,
        "total_visitor_count": 1420,
        "stream_url": "http://localhost:8889/cam1",
    },
    {
        "camera_id": "CAM-02",
        "name": "मेलम्ची खोला पुल तथा जलसतह निगरानी (Melamchi Bridge & River Feed)",
        "type": "Flood & River Monitoring",
        "location": "थाङपालधाप पुल (Ward 3)",
        "latitude": 27.962,
        "longitude": 85.628,
        "status": "Active",
        "today_visitor_count": 18,
        "total_visitor_count": 450,
        "stream_url": "rtsp://stream.p5digital.local/cam02",
    },
    {
        "camera_id": "CAM-03",
        "name": "चण्डेश्वरी मन्दिर तथा सार्वजनिक चोक (Chandeshowri Heritage & Crowd)",
        "type": "Heritage & Crowd Surveillance",
        "location": "चण्डेश्वरी मन्दिर परिसर (Ward 5)",
        "latitude": 27.952,
        "longitude": 85.705,
        "status": "Active",
        "today_visitor_count": 112,
        "total_visitor_count": 2890,
        "stream_url": "rtsp://stream.p5digital.local/cam03",
    },
    {
        "camera_id": "CAM-04",
        "name": "भोताङ पहिरो सम्भावित क्षेत्र (Bhotang Hazard Area Camera)",
        "type": "Landslide & Weather",
        "location": "भोताङ भिरालो खण्ड (Ward 2)",
        "latitude": 28.012,
        "longitude": 85.669,
        "status": "Active",
        "today_visitor_count": 9,
        "total_visitor_count": 310,
        "stream_url": "rtsp://stream.p5digital.local/cam04",
    },
]

def seed_cameras_if_empty(db: Session, ctx: TenantContext):
    if ctx.is_all or "panchpokhari" in ctx.allowed_tenant_ids:
        count = ctx.filter_query(db.query(AiCamera), AiCamera).count()
        if count == 0:
            for cam in DEFAULT_CAMERAS:
                db_cam = AiCamera(
                    id=str(uuid.uuid4()),
                    tenant_id="panchpokhari",
                    last_ping=datetime.utcnow(),
                    **cam
                )
                db.add(db_cam)
            db.commit()

@router.get("", response_model=List[AiCameraSchema])
def get_cameras(
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    seed_cameras_if_empty(db, ctx)
    cameras = ctx.filter_query(db.query(AiCamera), AiCamera).order_by(AiCamera.camera_id.asc()).all()
    # Ensure UUID id is serialized as string
    for cam in cameras:
        cam.id = str(cam.id)
    return cameras

@router.get("/stats", response_model=CameraStats)
def get_stats(
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    seed_cameras_if_empty(db, ctx)
    cameras = ctx.filter_query(db.query(AiCamera), AiCamera).all()
    today_total = sum(c.today_visitor_count or 0 for c in cameras)
    all_time_total = sum(c.total_visitor_count or 0 for c in cameras)
    return CameraStats(todayTotal=today_total, allTimeTotal=all_time_total)

@router.get("/{id}", response_model=AiCameraSchema)
def get_camera(
    id: str,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    cam = ctx.filter_query(db.query(AiCamera), AiCamera).filter(AiCamera.id == id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return cam

@router.post("", response_model=AiCameraSchema)
def create_camera(
    data: AiCameraCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    db_cam = AiCamera(
        id=str(uuid.uuid4()),
        tenant_id=ctx.effective_tenant_id,
        last_ping=datetime.utcnow(),
        **data.dict()
    )
    db.add(db_cam)
    db.commit()
    db.refresh(db_cam)
    return db_cam

@router.put("/{id}", response_model=AiCameraSchema)
def update_camera(
    id: str,
    data: AiCameraUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    cam = ctx.filter_query(db.query(AiCamera), AiCamera).filter(AiCamera.id == id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cam, key, value)
        
    db.commit()
    db.refresh(cam)
    return cam

@router.delete("/{id}")
def delete_camera(
    id: str,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    cam = ctx.filter_query(db.query(AiCamera), AiCamera).filter(AiCamera.id == id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    db.delete(cam)
    db.commit()
    return {"success": True, "message": "Camera deleted successfully"}

@router.post("/ping", response_model=AiCameraSchema)
def mock_camera_ping(
    payload: CameraPingPayload,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    cam = ctx.filter_query(db.query(AiCamera), AiCamera).filter(AiCamera.camera_id == payload.cameraId).first()
    if not cam:
        cam = AiCamera(
            id=str(uuid.uuid4()),
            tenant_id=ctx.effective_tenant_id,
            camera_id=payload.cameraId,
            name=f"AI Camera {payload.cameraId}",
            type="Entrance",
            today_visitor_count=0,
            total_visitor_count=0,
            status="Active"
        )
        db.add(cam)
        
    cam.today_visitor_count = (cam.today_visitor_count or 0) + payload.count
    cam.total_visitor_count = (cam.total_visitor_count or 0) + payload.count
    cam.last_ping = datetime.utcnow()
    
    db.commit()
    db.refresh(cam)
    return cam
