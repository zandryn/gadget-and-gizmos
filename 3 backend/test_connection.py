import asyncio
import os
from dotenv import load_dotenv

# load env variables
load_dotenv('mongo.env')

print(f"Current directory: {os.getcwd()}")
print(f"Looking for .env file...")
print(f"MONGODB_URL from env: {os.getenv('MONGODB_URL')}")

from database import ping_mongoDB

async def main():
    connected = await ping_mongoDB()
    if connected:
        print("🎉 We're connected to MongoDB!")
    else:
        print("😔 Connection failed - check your .env file")

if __name__ == "__main__":
    asyncio.run(main())