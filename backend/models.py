from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class User(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str

class Child(BaseModel):
    id: Optional[str] = None
    name: str
    dateOfBirth: date
    grade: Optional[str] = None
    school: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    notes: Optional[str] = None

class Family(BaseModel):
    id: Optional[str] = None
    familyName: str
    parent1_email: str  # Reference to user email
    parent2_email: Optional[str] = None  # Reference to user email
    children: List[Child] = []
    custodyArrangement: Optional[str] = None

class FamilyCreate(BaseModel):
    familyName: str
    parent2_email: Optional[str] = None
    custodyArrangement: Optional[str] = None

class ChildCreate(BaseModel):
    name: str
    dateOfBirth: date
    grade: Optional[str] = None
    school: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    notes: Optional[str] = None

class ChildUpdate(BaseModel):
    name: Optional[str] = None
    dateOfBirth: Optional[date] = None
    grade: Optional[str] = None
    school: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    notes: Optional[str] = None

class Event(BaseModel):
    id: Optional[str] = None
    family_id: str
    date: datetime
    type: str
    title: str
    parent: Optional[str] = None
    isSwappable: Optional[bool] = False

class EventCreate(BaseModel):
    date: datetime
    type: str
    title: str
    parent: Optional[str] = None
    isSwappable: Optional[bool] = False

class ChangeRequest(BaseModel):
    id: Optional[str] = None
    event_id: str
    requestedBy_email: str  # Email of the user who requested the change
    status: str = "pending"  # pending, approved, rejected
    requestedDate: Optional[datetime] = None  # New date if requesting a date change
    reason: Optional[str] = None
    createdAt: datetime

class ChangeRequestCreate(BaseModel):
    event_id: str
    requestedDate: Optional[datetime] = None
    reason: Optional[str] = None

class ChangeRequestUpdate(BaseModel):
    status: str  # approved or rejected