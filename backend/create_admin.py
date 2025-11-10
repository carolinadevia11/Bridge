#!/usr/bin/env python3
"""
Script to create an admin user in the database
"""
from passlib.context import CryptContext
from database import db

# Password hashing context (same as in auth.py)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Create an admin user with predefined credentials"""
    
    admin_email = "admin@gmail.com"
    admin_password = "12345678"
    
    # Check if admin already exists
    existing_admin = db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"❌ Admin user with email {admin_email} already exists!")
        
        # Update to admin role if not already
        if existing_admin.get("role") != "admin":
            db.users.update_one(
                {"email": admin_email},
                {"$set": {"role": "admin"}}
            )
            print(f"✅ Updated existing user {admin_email} to admin role")
        else:
            print(f"ℹ️  User {admin_email} is already an admin")
        
        return
    
    # Hash the password
    hashed_password = pwd_context.hash(admin_password)
    
    # Create admin user
    admin_user = {
        "firstName": "Admin",
        "lastName": "User",
        "email": admin_email,
        "password": hashed_password,
        "role": "admin"
    }
    
    try:
        result = db.users.insert_one(admin_user)
        print(f"✅ Admin user created successfully!")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   User ID: {result.inserted_id}")
        print(f"\n🔐 You can now login at http://localhost:5137/login")
        print(f"   Then access the admin dashboard at http://localhost:5137/admin")
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("Creating Admin User")
    print("=" * 60)
    create_admin_user()
    print("=" * 60)

