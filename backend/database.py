import os
import pymongo
from dotenv import load_dotenv
import certifi

load_dotenv()

# In-memory database for development/testing
class InMemoryCollection:
    def __init__(self):
        self.data = []
    
    def insert_one(self, document):
        self.data.append(document)
        return type('obj', (object,), {'inserted_id': len(self.data)})()
    
    def find_one(self, query=None):
        if not query:
            return self.data[0] if self.data else None
        for doc in self.data:
            match = True
            for key, value in query.items():
                if key == "$or":
                    # Handle $or queries
                    or_match = False
                    for or_condition in value:
                        if all(doc.get(k) == v for k, v in or_condition.items()):
                            or_match = True
                            break
                    if not or_match:
                        match = False
                        break
                elif doc.get(key) != value:
                    match = False
                    break
            if match:
                return doc
        return None
    
    def update_one(self, query, update):
        doc = self.find_one(query)
        if doc:
            if "$set" in update:
                doc.update(update["$set"])
            if "$push" in update:
                for key, value in update["$push"].items():
                    if key not in doc:
                        doc[key] = []
                    doc[key].append(value)
            return type('obj', (object,), {'matched_count': 1, 'modified_count': 1})()
        return type('obj', (object,), {'matched_count': 0, 'modified_count': 0})()
    
    def delete_one(self, query):
        doc = self.find_one(query)
        if doc:
            self.data.remove(doc)
            return type('obj', (object,), {'deleted_count': 1})()
        return type('obj', (object,), {'deleted_count': 0})()

class InMemoryDB:
    def __init__(self):
        self.families = InMemoryCollection()
        self.users = InMemoryCollection()
        self.events = InMemoryCollection()
        self.change_requests = InMemoryCollection()

try:
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        print("MONGODB_URI not found in environment variables - using in-memory storage")
        db = InMemoryDB()
    else:
        client = pymongo.MongoClient(
            mongo_uri, 
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000  # 5 second timeout
        )
        db = client.bridge
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        print("✅ DB connection successful")
except Exception as e:
    print(f"⚠️  DB connection failed: {e}")
    print("🔄 Running in development mode with in-memory database")
    db = InMemoryDB()
