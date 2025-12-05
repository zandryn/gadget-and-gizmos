# MongoDB connection

import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import certifi  # Add this import

load_dotenv('mongo.env')

uri = os.getenv("MONGODB_URL")

if not uri:
    raise ValueError("MONGODB_URL environment variable not set.")

# Add tlsCAFile=certifi.where() to fix SSL issue
client = AsyncIOMotorClient(
    uri,
    server_api=ServerApi('1'),
    tlsCAFile=certifi.where()  # This fixes the certificate issue
)

db = client['gadgets-db']
device_collection = db['devices']

async def ping_mongoDB():
    """DEBUGGING"""
    try:
        await client.admin.command('ping')
        print("pinged deployment. successfully connected to MongoDB Atlas!")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False