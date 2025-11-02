from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import pymongo
from .routers import auth, family, calendar

load_dotenv()

app = FastAPI()

# CORS middleware must be added BEFORE including routers
# Using wildcard for testing - should be restricted in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Database connection
try:
    client = pymongo.MongoClient(os.getenv("MONGODB_URI"))
    db = client.test # Replace "test" with your database name if different
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    db_connection_status = "successful"
except pymongo.errors.ConnectionFailure:
    db_connection_status = "failed"

# Include routers AFTER middleware
app.include_router(auth.router)
app.include_router(family.router)
app.include_router(calendar.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Family App API"}

@app.get("/healthz")
def health_check():
    return {"status": "ok", "db_connection": db_connection_status}