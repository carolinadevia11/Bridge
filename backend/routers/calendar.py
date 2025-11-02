from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
import uuid
from datetime import datetime

from ..models import Event, EventCreate, User, ChangeRequest, ChangeRequestCreate, ChangeRequestUpdate
from .auth import get_current_user

router = APIRouter()

# In-memory "database" for demonstration purposes
fake_events_db = {}
fake_change_requests_db = {}

@router.get("/api/v1/calendar/events", response_model=List[Event])
async def get_calendar_events(
    year: int = Query(..., description="Year to fetch events for"),
    month: int = Query(..., description="Month to fetch events for (1-12)")
    # TODO: Re-enable authentication: current_user: User = Depends(get_current_user)
):
    """Get calendar events for a specific month."""
    # In a real implementation, we would:
    # 1. Get the user's family_id
    # 2. Query events for that family_id within the specified month
    
    # For now, return all events (filtered by month in a real implementation)
    events = []
    for event in fake_events_db.values():
        # Filter by year and month
        if event.date.year == year and event.date.month == month:
            events.append(event)
    
    return events

@router.post("/api/v1/calendar/events", response_model=Event)
async def create_calendar_event(
    event_data: EventCreate
    # TODO: Re-enable authentication: current_user: User = Depends(get_current_user)
):
    """Create a new calendar event."""
    # In a real implementation, we would:
    # 1. Get the user's family_id from the database
    # 2. Verify the user has permission to create events for this family
    
    # For now, use a placeholder family_id
    family_id = "placeholder-family-id"
    
    event_id = str(uuid.uuid4())
    event = Event(
        id=event_id,
        family_id=family_id,
        date=event_data.date,
        type=event_data.type,
        title=event_data.title,
        parent=event_data.parent,
        isSwappable=event_data.isSwappable
    )
    
    fake_events_db[event_id] = event
    return event

@router.post("/api/v1/calendar/change-requests", response_model=ChangeRequest)
async def create_change_request(
    request_data: ChangeRequestCreate
    # TODO: Re-enable authentication: current_user: User = Depends(get_current_user)
):
    """Submit a change request for a calendar event."""
    # In a real implementation, we would:
    # 1. Verify the event exists
    # 2. Verify the user has permission to request changes
    # 3. Get the user's email from the current_user
    
    # Check if event exists
    if request_data.event_id not in fake_events_db:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # For now, use a placeholder email
    user_email = "placeholder@example.com"
    
    request_id = str(uuid.uuid4())
    change_request = ChangeRequest(
        id=request_id,
        event_id=request_data.event_id,
        requestedBy_email=user_email,
        status="pending",
        requestedDate=request_data.requestedDate,
        reason=request_data.reason,
        createdAt=datetime.utcnow()
    )
    
    fake_change_requests_db[request_id] = change_request
    return change_request

@router.put("/api/v1/calendar/change-requests/{request_id}", response_model=ChangeRequest)
async def update_change_request(
    request_id: str,
    update_data: ChangeRequestUpdate
    # TODO: Re-enable authentication: current_user: User = Depends(get_current_user)
):
    """Approve or reject a change request."""
    # In a real implementation, we would:
    # 1. Verify the change request exists
    # 2. Verify the user has permission to approve/reject (is the other parent)
    # 3. If approved and requestedDate is set, update the event's date
    
    # Check if change request exists
    if request_id not in fake_change_requests_db:
        raise HTTPException(status_code=404, detail="Change request not found")
    
    change_request = fake_change_requests_db[request_id]
    
    # Validate status
    if update_data.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    # Update the status
    change_request.status = update_data.status
    
    # If approved and there's a requested date, update the event
    if update_data.status == "approved" and change_request.requestedDate:
        event_id = change_request.event_id
        if event_id in fake_events_db:
            fake_events_db[event_id].date = change_request.requestedDate
    
    fake_change_requests_db[request_id] = change_request
    return change_request

@router.get("/api/v1/calendar/change-requests", response_model=List[ChangeRequest])
async def get_change_requests(
    # TODO: Re-enable authentication: current_user: User = Depends(get_current_user)
):
    """Get all change requests for the user's family."""
    # In a real implementation, we would:
    # 1. Get the user's family_id
    # 2. Query change requests for events belonging to that family
    
    # For now, return all change requests
    return list(fake_change_requests_db.values())