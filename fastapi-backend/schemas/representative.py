from pydantic import BaseModel, Field, field_serializer
from typing import Optional, Union
from datetime import datetime
from uuid import UUID

class RepresentativeBase(BaseModel):
    name: str
    designation: str
    ward_no: Optional[int] = Field(None, alias="wardNo")
    phone: Optional[str] = None
    email: Optional[str] = None
    political_party: Optional[str] = Field(None, alias="politicalParty")
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    is_current: bool = Field(True, alias="isCurrent")
    term_start_date: Optional[datetime] = Field(None, alias="termStartDate")
    term_end_date: Optional[datetime] = Field(None, alias="termEndDate")

    class Config:
        populate_by_name = True
        from_attributes = True

class RepresentativeCreate(RepresentativeBase):
    pass

class RepresentativeUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    ward_no: Optional[int] = Field(None, alias="wardNo")
    phone: Optional[str] = None
    email: Optional[str] = None
    political_party: Optional[str] = Field(None, alias="politicalParty")
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    is_current: Optional[bool] = Field(None, alias="isCurrent")
    term_start_date: Optional[datetime] = Field(None, alias="termStartDate")
    term_end_date: Optional[datetime] = Field(None, alias="termEndDate")

    class Config:
        populate_by_name = True
        from_attributes = True

class RepresentativeSchema(RepresentativeBase):
    id: Union[str, UUID]
    tenant_id: Optional[str] = None
    wardNo: Optional[int] = None
    photoUrl: Optional[str] = None
    isCurrent: Optional[bool] = True
    politicalParty: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('id')
    def serialize_id(self, v: Union[str, UUID]) -> str:
        return str(v)

    class Config:
        populate_by_name = True
        from_attributes = True


