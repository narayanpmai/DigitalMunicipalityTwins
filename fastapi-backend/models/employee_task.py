from sqlalchemy import Column, String, DateTime, JSON
from core.database import Base
from datetime import datetime

class EmployeeTask(Base):
    __tablename__ = 'employee_tasks'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    title = Column(String)
    description = Column(String, nullable=True)
    department = Column(String, nullable=True)
    assignee_id = Column(String, nullable=True, name='assignee_id')
    assigned_by = Column(String, nullable=True, name='assignedBy')
    priority = Column(String, default='Medium')
    status = Column(String, default='To Do')
    due_date_bs = Column(String, nullable=True, name='dueDateBs')
    collaborator_ids = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')
