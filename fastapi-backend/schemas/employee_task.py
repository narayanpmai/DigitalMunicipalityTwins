from pydantic import BaseModel, ConfigDict
from typing import Optional, Union
from datetime import datetime
from pydantic.alias_generators import to_camel
import uuid

class EmployeeTaskSchema(BaseModel):
    id: Union[str, uuid.UUID]
    title: str
    description: Optional[str] = None
    department: Optional[str] = None
    assignee_id: Optional[Union[str, uuid.UUID]] = None
    assigned_by: Optional[str] = None
    priority: str = 'Medium'
    status: str = 'To Do'
    due_date_bs: Optional[str] = None
    collaborator_ids: Optional[list[str]] = None
    
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

class EmployeeTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    department: Optional[str] = None
    assignee_id: Optional[Union[str, uuid.UUID]] = None
    assigned_by: Optional[str] = None
    priority: str = 'Medium'
    due_date_bs: Optional[str] = None
    collaborator_ids: Optional[list[str]] = None
    
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
