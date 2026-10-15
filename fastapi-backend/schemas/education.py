from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SchoolSchema(BaseModel):
    id: str
    name: str
    ward_number: int
    type: str = 'public'
    level: str = 'basic'
    total_students: int = 0
    total_teachers: int = 0
    emis_code: Optional[str] = None
    principal_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class StudentSchema(BaseModel):
    full_name: str
    school_id: Optional[str] = None
    class_grade: Optional[str] = None
    roll_number: int = 1
    gender: str = 'छात्र'
    caste_category: str = 'जनजाति'
    scholarship_type: str = 'छैन'
    
    class Config:
        from_attributes = True
