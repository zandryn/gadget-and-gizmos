from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import ping_mongoDB, device_collection
from models import Device, DeviceBase
from bson import ObjectId

app = FastAPI(title="gadgets & gizmos API")

# for later - frontend stuff
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await ping_mongoDB()


@app.get("/")
async def root():
    return {"message": "API is running successfully!"}


@app.get("/devices")
async def get_all_devices():
    devices_cursor = device_collection.find({})
    devices = await devices_cursor.to_list(length=None)

    for device in devices:
        device["_id"] = str(device["_id"])
    return devices


@app.post("/devices")
async def create_device(device: DeviceBase):
    device_dict = device.model_dump(by_alias=True, exclude_none=True)
    result = await device_collection.insert_one(device_dict)
    device_dict["_id"] = str(result.inserted_id)
    return device_dict