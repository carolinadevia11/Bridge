from fastapi import APIRouter, Depends, HTTPException
from typing import List
import uuid

from ..models import Family, FamilyCreate, Child, ChildCreate, ChildUpdate, User
from .auth import get_current_user

router = APIRouter()

# In-memory "database" for demonstration purposes
fake_families_db = {}

@router.post("/api/v1/family", response_model=Family)
async def create_family(family_data: FamilyCreate, current_user: User = Depends(get_current_user)):
    """Create a new family profile for the current user."""
    # Check if user already has a family
    for family in fake_families_db.values():
        if family.parent1_email == current_user.email or family.parent2_email == current_user.email:
            raise HTTPException(status_code=400, detail="User already has a family profile")
    
    family_id = str(uuid.uuid4())
    family = Family(
        id=family_id,
        familyName=family_data.familyName,
        parent1_email=current_user.email,
        parent2_email=family_data.parent2_email,
        children=[],
        custodyArrangement=family_data.custodyArrangement
    )
    fake_families_db[family_id] = family
    return family

@router.get("/api/v1/family", response_model=Family)
async def get_family(current_user: User = Depends(get_current_user)):
    """Get the current user's family profile."""
    for family in fake_families_db.values():
        if family.parent1_email == current_user.email or family.parent2_email == current_user.email:
            return family
    
    raise HTTPException(status_code=404, detail="Family profile not found")

@router.post("/api/v1/children", response_model=Child)
async def add_child(child_data: ChildCreate, current_user: User = Depends(get_current_user)):
    """Add a new child to the family."""
    # Find the user's family
    user_family = None
    for family in fake_families_db.values():
        if family.parent1_email == current_user.email or family.parent2_email == current_user.email:
            user_family = family
            break
    
    if not user_family:
        raise HTTPException(status_code=404, detail="Family profile not found")
    
    child_id = str(uuid.uuid4())
    child = Child(
        id=child_id,
        name=child_data.name,
        dateOfBirth=child_data.dateOfBirth,
        grade=child_data.grade,
        school=child_data.school,
        allergies=child_data.allergies,
        medications=child_data.medications,
        notes=child_data.notes
    )
    
    user_family.children.append(child)
    return child

@router.put("/api/v1/children/{child_id}", response_model=Child)
async def update_child(child_id: str, child_data: ChildUpdate, current_user: User = Depends(get_current_user)):
    """Update a child's information."""
    # Find the user's family
    user_family = None
    for family in fake_families_db.values():
        if family.parent1_email == current_user.email or family.parent2_email == current_user.email:
            user_family = family
            break
    
    if not user_family:
        raise HTTPException(status_code=404, detail="Family profile not found")
    
    # Find the child
    child_to_update = None
    for child in user_family.children:
        if child.id == child_id:
            child_to_update = child
            break
    
    if not child_to_update:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Update child fields if provided
    update_data = child_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(child_to_update, field, value)
    
    return child_to_update

@router.delete("/api/v1/children/{child_id}")
async def delete_child(child_id: str, current_user: User = Depends(get_current_user)):
    """Remove a child from the family."""
    # Find the user's family
    user_family = None
    for family in fake_families_db.values():
        if family.parent1_email == current_user.email or family.parent2_email == current_user.email:
            user_family = family
            break
    
    if not user_family:
        raise HTTPException(status_code=404, detail="Family profile not found")
    
    # Find and remove the child
    child_index = None
    for i, child in enumerate(user_family.children):
        if child.id == child_id:
            child_index = i
            break
    
    if child_index is None:
        raise HTTPException(status_code=404, detail="Child not found")
    
    user_family.children.pop(child_index)
    return {"message": "Child removed successfully"}