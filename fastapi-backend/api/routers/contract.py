from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.contract import Contract
from schemas.contract import ContractSchema, ContractCreate
import uuid

router = APIRouter(
    prefix="/api/v1/contracts",
    tags=["Contracts (ठेक्कापट्टा)"]
)

@router.get("", response_model=List[ContractSchema])
def get_contracts(db: Session = Depends(get_db)):
    contracts = db.query(Contract).all()
    return [
        {
            "id": str(c.id),
            "contract_no": c.contract_no,
            "title": c.title,
            "contractor_name": c.contractor_name,
            "status": str(c.status),
            "contract_amount": float(c.contract_amount or 0),
            "paid_amount": float(c.paid_amount or 0),
            "progress_percent": int(c.progress_percent or 0),
        }
        for c in contracts
    ]

@router.post("", response_model=ContractSchema)
def create_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    db_contract = Contract(
        id=str(uuid.uuid4()),
        **contract.dict()
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

@router.get("/{id}", response_model=ContractSchema)
def get_contract(id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract
