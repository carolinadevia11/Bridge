from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os

from models import User
from database import db

router = APIRouter()

# Secret key to sign the JWT token
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "12960"))  # default 3 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/api/v1/auth/signup", response_model=User)
async def create_user(user_data: User):
    if db.users.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    hashed_password = pwd_context.hash(user_data.password)
    user_in_db = user_data.model_copy(update={"password": hashed_password})
    db.users.insert_one(user_in_db.model_dump())
    return user_in_db

@router.post("/api/v1/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"email": form_data.username})
    if not user or not pwd_context.verify(form_data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user.get("role", "user")}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return User(**user)

@router.get("/api/v1/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user