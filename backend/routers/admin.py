from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime

from models import User, Family, Child
from routers.auth import get_current_user
from database import db

try:
    from bson import ObjectId
except ImportError:
    # Fallback for in-memory database
    ObjectId = str

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)):
    """Dependency to check if user is admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/api/v1/admin/families")
async def get_all_families(admin: User = Depends(get_admin_user)):
    """Get all families with their details (Admin only)"""
    try:
        families = list(db.families.find())
        
        # Convert MongoDB _id to string and format data
        result = []
        for family in families:
            family['_id'] = str(family['_id'])
            
            # Get user details for parent1
            parent1_user = db.users.find_one({"email": family.get("parent1_email")})
            parent1_info = {
                "email": family.get("parent1_email"),
                "name": family.get("parent1_name", "Unknown"),
                "firstName": parent1_user.get("firstName") if parent1_user else "Unknown",
                "lastName": parent1_user.get("lastName") if parent1_user else "Unknown",
            }
            
            # Get user details for parent2 if exists
            parent2_info = None
            if family.get("parent2_email"):
                parent2_user = db.users.find_one({"email": family.get("parent2_email")})
                parent2_info = {
                    "email": family.get("parent2_email"),
                    "name": family.get("parent2_name", "Unknown"),
                    "firstName": parent2_user.get("firstName") if parent2_user else "Unknown",
                    "lastName": parent2_user.get("lastName") if parent2_user else "Unknown",
                }
            
            result.append({
                "id": family['_id'],
                "familyName": family.get("familyName"),
                "familyCode": family.get("familyCode"),
                "parent1": parent1_info,
                "parent2": parent2_info,
                "children": family.get("children", []),
                "childrenCount": len(family.get("children", [])),
                "custodyArrangement": family.get("custodyArrangement"),
                "createdAt": family.get("createdAt"),
                "linkedAt": family.get("linkedAt"),
                "isLinked": bool(family.get("parent2_email"))
            })
        
        return result
    except Exception as e:
        print(f"Error fetching families: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching families: {str(e)}")

@router.get("/api/v1/admin/families/{family_id}")
async def get_family_details(family_id: str, admin: User = Depends(get_admin_user)):
    """Get detailed information about a specific family (Admin only)"""
    try:
        # Convert family_id to ObjectId for MongoDB query
        try:
            family = db.families.find_one({"_id": ObjectId(family_id)})
        except:
            # If ObjectId conversion fails, try as string (for in-memory DB)
            family = db.families.find_one({"_id": family_id})
        
        if not family:
            raise HTTPException(status_code=404, detail="Family not found")
        
        # Convert _id to string
        if '_id' in family:
            family['_id'] = str(family['_id'])
        
        # Get full user details for both parents
        parent1_user = db.users.find_one({"email": family.get("parent1_email")})
        parent2_user = db.users.find_one({"email": family.get("parent2_email")}) if family.get("parent2_email") else None
        
        # Clean up user data (remove password, convert _id)
        if parent1_user:
            parent1_user = dict(parent1_user)
            if '_id' in parent1_user:
                parent1_user['_id'] = str(parent1_user['_id'])
            parent1_user.pop('password', None)
        
        if parent2_user:
            parent2_user = dict(parent2_user)
            if '_id' in parent2_user:
                parent2_user['_id'] = str(parent2_user['_id'])
            parent2_user.pop('password', None)
        
        return {
            "id": family['_id'],
            "familyName": family.get("familyName"),
            "familyCode": family.get("familyCode"),
            "parent1": parent1_user,
            "parent2": parent2_user,
            "children": family.get("children", []),
            "custodyArrangement": family.get("custodyArrangement"),
            "custodyAgreement": family.get("custodyAgreement"),
            "createdAt": family.get("createdAt"),
            "linkedAt": family.get("linkedAt")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching family details: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching family details: {str(e)}")

@router.get("/api/v1/admin/stats")
async def get_admin_stats(admin: User = Depends(get_admin_user)):
    """Get overall statistics (Admin only)"""
    try:
        total_families = db.families.count_documents({})
        linked_families = db.families.count_documents({"parent2_email": {"$ne": None}})
        total_users = db.users.count_documents({})
        
        # Count total children across all families
        families = list(db.families.find({}, {"children": 1}))
        total_children = sum(len(f.get("children", [])) for f in families)
        
        return {
            "totalFamilies": total_families,
            "linkedFamilies": linked_families,
            "unlinkedFamilies": total_families - linked_families,
            "totalUsers": total_users,
            "totalChildren": total_children
        }
    except Exception as e:
        print(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.get("/api/v1/admin/users")
async def get_all_users(admin: User = Depends(get_admin_user)):
    """Get all users (Admin only)"""
    try:
        users = list(db.users.find({}, {"password": 0}))  # Exclude passwords
        
        for user in users:
            user['_id'] = str(user['_id'])
            
            # Find if user is part of any family
            family = db.families.find_one({
                "$or": [
                    {"parent1_email": user.get("email")},
                    {"parent2_email": user.get("email")}
                ]
            })
            
            user['hasFamily'] = bool(family)
            if family:
                user['familyName'] = family.get("familyName")
                user['familyId'] = str(family['_id'])
        
        return users
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

