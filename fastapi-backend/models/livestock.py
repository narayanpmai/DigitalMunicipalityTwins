from sqlalchemy import Column, String, Integer, Numeric, DateTime
from core.database import Base
from datetime import datetime

class LivestockRecord(Base):
    __tablename__ = 'livestock_records'
    __table_args__ = {'extend_existing': True}
    
    tenant_id = Column(String, nullable=True, name='tenant_id')
    id = Column(String, primary_key=True)
    ward_number = Column(Integer, nullable=True, name='wardNumber')
    fiscal_year = Column(String, name='fiscalYear')
    cattle = Column(Integer, nullable=True)
    buffaloes = Column(Integer, nullable=True)
    goats = Column(Integer, nullable=True)
    sheep = Column(Integer, nullable=True)
    pigs = Column(Integer, nullable=True)
    poultry = Column(Integer, nullable=True)
    yaks = Column(Integer, nullable=True)
    milk_production_liters = Column(Numeric(10, 2), nullable=True, name='milkProductionLiters')
    meat_production_kg = Column(Numeric(10, 2), nullable=True, name='meatProductionKg')
    wool_production_kg = Column(Numeric(10, 2), nullable=True, name='woolProductionKg')
    total_households_rearing = Column(Integer, nullable=True, name='totalHouseholdsRearing')
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, name='createdAt')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, name='updatedAt')

    def to_dict(self):
        return {
            "id": str(self.id),
            "wardNumber": self.ward_number or 0,
            "wardNo": self.ward_number or 0,
            "fiscalYear": self.fiscal_year,
            "cattle": self.cattle or 0,
            "buffaloes": self.buffaloes or 0,
            "goats": self.goats or 0,
            "sheep": self.sheep or 0,
            "pigs": self.pigs or 0,
            "poultry": self.poultry or 0,
            "yaks": self.yaks or 0,
            "milkProductionLiters": float(self.milk_production_liters or 0),
            "milkProductionLitersPerDay": float(self.milk_production_liters or 0),
            "meatProductionKg": float(self.meat_production_kg or 0),
            "woolProductionKg": float(self.wool_production_kg or 0),
            "totalHouseholdsRearing": self.total_households_rearing or 0,
            "farmsCount": self.total_households_rearing or 0,
            "notes": self.notes or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
