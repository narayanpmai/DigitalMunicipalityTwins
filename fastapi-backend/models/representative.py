from sqlalchemy import Column, String, Integer, Boolean, DateTime
from core.database import Base
from datetime import datetime

class Representative(Base):
    __tablename__ = 'representatives'
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    ward_no = Column(Integer, nullable=True, name='wardNo')
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    political_party = Column(String, nullable=True, name='politicalparty')
    photo_url = Column(String, nullable=True, name='photoUrl')
    is_current = Column(Boolean, default=True, name='isCurrent')
    term_start_date = Column(DateTime, nullable=True, name='termStartDate')
    term_end_date = Column(DateTime, nullable=True, name='termEndDate')
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    @property
    def wardNo(self):
        return self.ward_no

    @property
    def photoUrl(self):
        return self.photo_url

    @property
    def isCurrent(self):
        return self.is_current

    @property
    def politicalParty(self):
        return self.political_party

