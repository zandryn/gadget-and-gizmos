# MongoDB connection

import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi

load_dotenv('mongo.env')

uri = os.getenv("MONGODB_URL")

if not uri:
    raise ValueError("MONGODB_URL environment variable not set.")

# create a new client & connect to the server
client = AsyncIOMotorClient(uri, server_api=ServerApi('1'))

db = client['gadgets-db']
device_collection = db['devices'] # object for main.py

async def ping_mongoDB():
    """DEBUGGING"""
    try:
        await client.admin.command('ping')
        print("pinged deployment. successfully connected to MongoDB Atlas!")
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False

