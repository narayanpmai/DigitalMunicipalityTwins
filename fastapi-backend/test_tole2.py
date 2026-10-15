from core.database import SessionLocal
from models.demographics import Household
from schemas.demographics import HouseholdResponse

db = SessionLocal()
h = db.query(Household).first()
print('SQLAlchemy tole:', h.tole)
p = HouseholdResponse.model_validate(h)
print('Pydantic tole:', getattr(p, 'tole', None))
print('Dump keys:', p.model_dump(by_alias=True).keys())
