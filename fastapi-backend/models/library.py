"""
Digital Library Database Models
Municipal Digital Twins v2.0 — Panchpokhari Thangpal
Aligned with actual PostgreSQL schema
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from core.database import Base
from datetime import datetime
import uuid


class DigitalBook(Base):
    __tablename__ = 'library_books'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(String, nullable=True, name='bookId')
    isbn = Column(String, nullable=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    publisher = Column(String, nullable=True)
    publication_year = Column(String, nullable=True, name='publicationYear')
    edition = Column(String, nullable=True)
    language = Column(String, default='नेपाली')
    category = Column(String, default='विविध')
    subject = Column(String, nullable=True)
    media_type = Column(String, default='physical', name='mediaType')  # 'physical' | 'ebook' | 'audiobook' | 'videobook'
    total_copies = Column(Integer, default=1, name='totalCopies')
    available_copies = Column(Integer, default=1, name='availableCopies')
    rack_no = Column(String, nullable=True, name='rackNo')
    shelf_no = Column(String, nullable=True, name='shelfNo')
    physical_location = Column(String, nullable=True, name='physicalLocation')
    is_available_physical = Column(Boolean, default=True, name='isAvailablePhysical')
    borrow_status = Column(String, default='available', name='borrowStatus')
    pages = Column(Integer, nullable=True)
    cover_url = Column(String, nullable=True, name='coverUrl')
    digital_file_url = Column(String, nullable=True, name='digitalFileUrl')
    audio_url = Column(Text, nullable=True, name='audioUrl')
    audio_duration = Column(String, nullable=True, name='audioDuration')
    narrator = Column(String, nullable=True)
    audio_format = Column(String, nullable=True, name='audioFormat')
    video_url = Column(Text, nullable=True, name='videoUrl')
    video_duration = Column(String, nullable=True, name='videoDuration')
    video_presenter = Column(String, nullable=True, name='videoPresenter')
    video_quality = Column(String, nullable=True, name='videoQuality')
    copyright_status = Column(String, default='Municipality Owned', name='copyrightStatus')
    summary = Column(Text, nullable=True)
    keywords = Column(String, nullable=True)
    verification_status = Column(String, default='Published', name='verificationStatus')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "tenant_id": self.tenant_id,
            "bookId": self.book_id or f"LIB-{str(self.id)[:6]}",
            "book_id": self.book_id or f"LIB-{str(self.id)[:6]}",
            "isbn": self.isbn or "",
            "title": self.title,
            "titleNepali": self.title,
            "author": self.author,
            "publisher": self.publisher or "",
            "publicationYear": self.publication_year or "",
            "edition": self.edition or "१",
            "language": self.language or "नेपाली",
            "category": self.category or "विविध",
            "subject": self.subject or "",
            "mediaType": self.media_type or "physical",
            "media_type": self.media_type or "physical",
            "totalCopies": self.total_copies or 1,
            "availableCopies": self.available_copies if self.available_copies is not None else 1,
            "rackNo": self.rack_no or "",
            "shelfNo": self.shelf_no or "",
            "physicalLocation": self.physical_location or "",
            "isAvailablePhysical": bool(self.is_available_physical),
            "borrowStatus": self.borrow_status or "available",
            "pages": self.pages or 0,
            "coverUrl": self.cover_url or "",
            "digitalFileUrl": self.digital_file_url or "",
            "audioUrl": self.audio_url or "",
            "audioDuration": self.audio_duration or "",
            "narrator": self.narrator or "",
            "audioFormat": self.audio_format or "",
            "videoUrl": self.video_url or "",
            "videoDuration": self.video_duration or "",
            "videoPresenter": self.video_presenter or "",
            "videoQuality": self.video_quality or "",
            "copyrightStatus": self.copyright_status or "Municipality Owned",
            "summary": self.summary or "",
            "keywords": self.keywords or "",
            "verificationStatus": self.verification_status or "Published",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class BorrowRecord(Base):
    __tablename__ = 'library_borrow_records'
    __table_args__ = {'extend_existing': True}

    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(PG_UUID(as_uuid=True), name='book_id')
    borrower_name = Column(String, name='borrower_name')
    borrower_contact = Column(String, nullable=True, name='borrower_contact')
    borrower_card_no = Column(String, nullable=True, name='borrower_card_no')
    borrow_date = Column(String, nullable=True, name='borrow_date')
    due_date = Column(String, nullable=True, name='due_date')
    return_date = Column(String, nullable=True, name='return_date')
    status = Column(String, default='issued')  # 'issued' | 'returned' | 'overdue'
    fine_amount = Column(Numeric(10, 2), default=0, name='fine_amount')
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, name='created_at')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updated_at')

    def to_dict(self, book_title: str = None):
        return {
            "id": str(self.id),
            "tenant_id": self.tenant_id,
            "bookId": str(self.book_id) if self.book_id else "",
            "book_id": str(self.book_id) if self.book_id else "",
            "bookTitle": book_title or "पालिका पुस्तक",
            "book_title": book_title or "पालिका पुस्तक",
            "borrowerName": self.borrower_name,
            "borrower_name": self.borrower_name,
            "borrowerContact": self.borrower_contact or "",
            "borrowerCardNo": self.borrower_card_no or "",
            "borrowDate": self.borrow_date or "",
            "dueDate": self.due_date or "",
            "returnDate": self.return_date or "",
            "status": self.status or "issued",
            "fineAmount": float(self.fine_amount or 0),
            "remarks": self.remarks or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
