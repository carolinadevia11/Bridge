from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from models import MessageCreate, ConversationCreate, Message, Conversation, User
from routers.auth import get_current_user
from database import db

router = APIRouter(prefix="/api/v1/messaging", tags=["messaging"])

# Get all conversations for the current user's family
@router.get("/conversations", response_model=List[dict])
async def get_conversations(current_user: User = Depends(get_current_user)):
    """
    Get all conversations for the current user's family
    """
    try:
        print(f"[GET /conversations] User: {current_user.email}")
        
        # Get user's family
        family = db.families.find_one({"$or": [
            {"parent1_email": current_user.email},
            {"parent2_email": current_user.email}
        ]})
        
        if not family:
            print("[GET /conversations] No family found")
            return []
        
        family_id = str(family["_id"])
        print(f"[GET /conversations] Family ID: {family_id}")
        
        # Get all conversations for this family
        conversations = list(db.conversations.find({"family_id": family_id, "is_archived": False}))
        
        print(f"[GET /conversations] Found {len(conversations)} conversations")
        
        # For each conversation, get message count and unread count
        result = []
        for conv in conversations:
            conv_id = str(conv["_id"])
            
            # Get all messages for this conversation
            messages = list(db.messages.find({"conversation_id": conv_id}).sort("timestamp", 1))
            
            # Count unread messages for current user
            unread_count = sum(1 for msg in messages 
                             if msg.get("sender_email") != current_user.email 
                             and msg.get("status") != "read")
            
            # Get last message timestamp
            last_message_at = messages[-1]["timestamp"] if messages else conv.get("created_at")
            
            result.append({
                "id": conv_id,
                "subject": conv["subject"],
                "category": conv["category"],
                "participants": conv["participants"],
                "messageCount": len(messages),
                "unreadCount": unread_count,
                "lastMessageAt": last_message_at.isoformat() if last_message_at else None,
                "isStarred": conv.get("is_starred", False),
                "isArchived": conv.get("is_archived", False),
                "createdAt": conv.get("created_at").isoformat() if conv.get("created_at") else None
            })
        
        # Sort by last message time (most recent first)
        result.sort(key=lambda x: x["lastMessageAt"] or x["createdAt"], reverse=True)
        
        return result
    except Exception as e:
        print(f"[ERROR] Get conversations: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Create a new conversation
@router.post("/conversations", response_model=dict)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new conversation
    """
    try:
        print(f"[POST /conversations] User: {current_user.email}, Subject: {conversation.subject}")
        
        # Get user's family
        family = db.families.find_one({"$or": [
            {"parent1_email": current_user.email},
            {"parent2_email": current_user.email}
        ]})
        
        if not family:
            raise HTTPException(status_code=404, detail="Family not found")
        
        # Check if family is linked (has both parents)
        if not family.get("parent2_email"):
            raise HTTPException(
                status_code=400, 
                detail="Cannot create conversation until family is linked with both parents"
            )
        
        family_id = str(family["_id"])
        
        # Create conversation document
        conv_doc = {
            "family_id": family_id,
            "subject": conversation.subject,
            "category": conversation.category,
            "participants": [family["parent1_email"], family["parent2_email"]],
            "created_at": datetime.utcnow(),
            "last_message_at": None,
            "is_archived": False,
            "is_starred": False
        }
        
        result = db.conversations.insert_one(conv_doc)
        conv_id = str(result.inserted_id)
        
        print(f"[POST /conversations] Created conversation: {conv_id}")
        
        return {
            "id": conv_id,
            "subject": conversation.subject,
            "category": conversation.category,
            "participants": conv_doc["participants"],
            "messageCount": 0,
            "unreadCount": 0,
            "lastMessageAt": None,
            "isStarred": False,
            "isArchived": False,
            "createdAt": conv_doc["created_at"].isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Create conversation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Get messages for a conversation
@router.get("/conversations/{conversation_id}/messages", response_model=List[dict])
async def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get all messages for a conversation
    """
    try:
        print(f"[GET /messages] Conversation: {conversation_id}, User: {current_user.email}")
        
        # Verify user has access to this conversation
        conversation = db.conversations.find_one({"_id": ObjectId(conversation_id)})
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if current_user.email not in conversation["participants"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get all messages
        messages = list(db.messages.find({"conversation_id": conversation_id}).sort("timestamp", 1))
        
        print(f"[GET /messages] Found {len(messages)} messages")
        
        # Mark messages as read for current user
        db.messages.update_many(
            {
                "conversation_id": conversation_id,
                "sender_email": {"$ne": current_user.email},
                "status": {"$ne": "read"}
            },
            {"$set": {"status": "read"}}
        )
        
        # Format messages for response (reflect read status without re-query)
        result = []
        for msg in messages:
            status = msg.get("status", "sent")
            if msg.get("sender_email") != current_user.email:
                status = "read"
            result.append({
                "id": str(msg["_id"]),
                "conversationId": conversation_id,
                "senderEmail": msg["sender_email"],
                "content": msg["content"],
                "tone": msg["tone"],
                "timestamp": msg["timestamp"].isoformat(),
                "status": status
            })
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Get messages: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Send a message
@router.post("/messages", response_model=dict)
async def send_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Send a message in a conversation
    """
    try:
        print(f"[POST /message] Conversation: {message.conversation_id}, User: {current_user.email}")
        
        # Verify user has access to this conversation
        conversation = db.conversations.find_one({"_id": ObjectId(message.conversation_id)})
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if current_user.email not in conversation["participants"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Create message document
        timestamp = datetime.utcnow()
        msg_doc = {
            "conversation_id": message.conversation_id,
            "sender_email": current_user.email,
            "content": message.content,
            "tone": message.tone,
            "timestamp": timestamp,
            "status": "sent"
        }
        
        result = db.messages.insert_one(msg_doc)
        msg_id = str(result.inserted_id)
        
        # Update conversation's last_message_at
        db.conversations.update_one(
            {"_id": ObjectId(message.conversation_id)},
            {"$set": {"last_message_at": timestamp}}
        )
        
        print(f"[POST /message] Sent message: {msg_id}")
        
        return {
            "id": msg_id,
            "conversationId": message.conversation_id,
            "senderEmail": current_user.email,
            "content": message.content,
            "tone": message.tone,
            "timestamp": timestamp.isoformat(),
            "status": "sent"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Send message: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Toggle star on conversation
@router.patch("/conversations/{conversation_id}/star")
async def toggle_star(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Toggle star status on a conversation
    """
    try:
        # Verify user has access
        conversation = db.conversations.find_one({"_id": ObjectId(conversation_id)})
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if current_user.email not in conversation["participants"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Toggle star
        new_star_status = not conversation.get("is_starred", False)
        db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"is_starred": new_star_status}}
        )
        
        return {"isStarred": new_star_status}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Toggle star: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Archive conversation
@router.patch("/conversations/{conversation_id}/archive")
async def archive_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Archive a conversation
    """
    try:
        # Verify user has access
        conversation = db.conversations.find_one({"_id": ObjectId(conversation_id)})
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if current_user.email not in conversation["participants"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Archive
        db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"is_archived": True}}
        )
        
        return {"message": "Conversation archived"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Archive conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

