from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class DigitalBookBase(BaseModel):
    book_id: Optional[str] = None
    isbn: Optional[str] = None
    title: str
    author: str
    publisher: Optional[str] = None
    publication_year: Optional[str] = None
    edition: Optional[str] = None
    language: str = 'नेपाली'
    category: str = 'विविध'
    subject: Optional[str] = None
    media_type: str = Field(default='physical', description="'physical' | 'ebook' | 'audiobook' | 'videobook'")
    total_copies: int = 1
    available_copies: int = 1
    rack_no: Optional[str] = None
    shelf_no: Optional[str] = None
    physical_location: Optional[str] = None
    is_available_physical: bool = True
    borrow_status: str = 'available'
    pages: Optional[int] = None
    cover_url: Optional[str] = None
    digital_file_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_duration: Optional[str] = None
    narrator: Optional[str] = None
    audio_format: Optional[str] = None
    video_url: Optional[str] = None
    video_duration: Optional[str] = None
    video_presenter: Optional[str] = None
    video_quality: Optional[str] = None
    copyright_status: str = 'Municipality Owned'
    summary: Optional[str] = None
    keywords: Optional[str] = None
    verification_status: str = 'Published'

class DigitalBookCreate(DigitalBookBase):
    pass

class DigitalBookUpdate(BaseModel):
    book_id: Optional[str] = None
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[str] = None
    edition: Optional[str] = None
    language: Optional[str] = None
    category: Optional[str] = None
    subject: Optional[str] = None
    media_type: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    rack_no: Optional[str] = None
    shelf_no: Optional[str] = None
    physical_location: Optional[str] = None
    is_available_physical: Optional[bool] = None
    borrow_status: Optional[str] = None
    pages: Optional[int] = None
    cover_url: Optional[str] = None
    digital_file_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_duration: Optional[str] = None
    narrator: Optional[str] = None
    audio_format: Optional[str] = None
    video_url: Optional[str] = None
    video_duration: Optional[str] = None
    video_presenter: Optional[str] = None
    video_quality: Optional[str] = None
    copyright_status: Optional[str] = None
    summary: Optional[str] = None
    keywords: Optional[str] = None
    verification_status: Optional[str] = None

class DigitalBookSchema(DigitalBookBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BorrowRecordBase(BaseModel):
    book_id: str
    borrower_name: str
    borrower_contact: Optional[str] = None
    borrower_card_no: Optional[str] = None
    borrow_date: Optional[str] = None
    due_date: Optional[str] = None
    return_date: Optional[str] = None
    status: str = 'issued'
    fine_amount: Optional[float] = 0.0
    remarks: Optional[str] = None

class BorrowRecordCreate(BorrowRecordBase):
    pass

class BorrowRecordReturn(BaseModel):
    return_date: Optional[str] = None
    fine_amount: Optional[float] = 0.0

class BorrowRecordSchema(BorrowRecordBase):
    id: str
    tenant_id: Optional[str] = None
    book_title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LibraryStats(BaseModel):
    totalTitles: int
    totalAudiobooks: int
    totalVideobooks: int
    activeBorrows: int
    registeredMembers: int
