from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
import models.calendar as models
import schemas.calendar as schemas
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/calendar",
    tags=["Event Calendar"]
)

@router.get("/events", response_model=List[schemas.EventCalendarResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(models.EventCalendar).all()
    # Provide mock data if DB is empty to keep mobile app functional immediately
    if not events:
        return [
            {
                "id": "1", "title": "कार्यपालिका बैठक", "date": 5, "month": "आश्विन", 
                "event_type": "meeting", "time": "११:०० बजे", "location": "गाउँपालिका सभाहल", 
                "created_at": datetime.utcnow()
            },
            {
                "id": "2", "title": "संविधान दिवस", "date": 3, "month": "आश्विन", 
                "event_type": "holiday", "description": "सार्वजनिक विदा", 
                "created_at": datetime.utcnow()
            },
            {
                "id": "3", "title": "कृषक तालिम", "date": 12, "month": "आश्विन", 
                "event_type": "training", "time": "१०:०० बजे", "location": "वडा नं ३ कार्यालय", 
                "created_at": datetime.utcnow()
            },
            {
                "id": "4", "title": "विजया दशमी", "date": 26, "month": "आश्विन", 
                "event_type": "festival", "description": "सार्वजनिक विदा", 
                "created_at": datetime.utcnow()
            },
            {
                "id": "5", "title": "गाउँसभा तयारी", "date": 18, "month": "आश्विन", 
                "event_type": "meeting", "time": "२:०० बजे", "location": "अध्यक्षको कार्यकक्ष",
                "created_at": datetime.utcnow()
            }
        ]
    return events

@router.post("/events", response_model=schemas.EventCalendarResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: schemas.EventCalendarCreate, db: Session = Depends(get_db)):
    db_event = models.EventCalendar(**event.model_dump())
    db.add(db_event)
    try:
        db.commit()
        db.refresh(db_event)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_event
