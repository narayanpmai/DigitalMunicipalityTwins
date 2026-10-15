from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.employee_task import EmployeeTask
from schemas.employee_task import EmployeeTaskSchema, EmployeeTaskCreate
import uuid
import json

router = APIRouter(
    prefix="/api/v1/employee-tasks",
    tags=["Employee Tasks"]
)

@router.get("", response_model=List[EmployeeTaskSchema])
def get_employee_tasks(db: Session = Depends(get_db)):
    return db.query(EmployeeTask).all()

@router.post("", response_model=EmployeeTaskSchema)
def create_employee_task(task: EmployeeTaskCreate, db: Session = Depends(get_db)):
    db_task = EmployeeTask(
        id=str(uuid.uuid4()),
        **task.dict()
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{id}", response_model=EmployeeTaskSchema)
def get_employee_task(id: str, db: Session = Depends(get_db)):
    task = db.query(EmployeeTask).filter(EmployeeTask.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{id}", response_model=EmployeeTaskSchema)
def update_employee_task(id: str, task_update: EmployeeTaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(EmployeeTask).filter(EmployeeTask.id == id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{id}")
def delete_employee_task(id: str, db: Session = Depends(get_db)):
    db_task = db.query(EmployeeTask).filter(EmployeeTask.id == id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}
