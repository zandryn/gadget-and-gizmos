from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import ping_mongoDB, device_collection
from models import Device, DeviceBase
from bson import ObjectId
from google.cloud import storage
from dotenv import load_dotenv
import uuid
import os

load_dotenv()

# initialize gcs
storage_client = None
bucket = None

try:
    storage_client = storage.Client()
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if bucket_name:
        bucket = storage_client.bucket(bucket_name)
        print(f"GCS bucket '{bucket_name}' connected successfully!")
    else:
        print("Warning: GCS_BUCKET_NAME not set. Photo uploads will be disabled.")
except Exception as e:
    print(f"Warning: Could not initialize GCS: {e}")
    print("Photo uploads will be disabled.")

app = FastAPI(title="Gadgets & Gizmos API")

# local upload directory as fallback
upload_directory = "./uploads"
if not os.path.exists(upload_directory):
    os.makedirs(upload_directory)

app.mount("/static", StaticFiles(directory=upload_directory), name="static")

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
    return {"message": "Gadgets & Gizmos API is running!"}


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


@app.get("/devices/{device_id}")
async def get_device(device_id: str):
    try:
        device = await device_collection.find_one({"_id": ObjectId(device_id)})
        if device:
            device["_id"] = str(device["_id"])
            return device
        raise HTTPException(status_code=404, detail="Device not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/devices/{device_id}")
async def update_device(device_id: str, device: DeviceBase):
    try:
        device_dict = device.model_dump(by_alias=True, exclude_none=True)
        result = await device_collection.replace_one(
            {"_id": ObjectId(device_id)},
            device_dict
        )
        if result.modified_count == 1 or result.matched_count == 1:
            updated_device = await device_collection.find_one({"_id": ObjectId(device_id)})
            updated_device["_id"] = str(updated_device["_id"])
            return updated_device
        raise HTTPException(status_code=404, detail="Device not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/devices/{device_id}")
async def delete_device(device_id: str):
    try:
        result = await device_collection.delete_one({"_id": ObjectId(device_id)})
        if result.deleted_count == 1:
            return {"message": "Device deleted successfully"}
        raise HTTPException(status_code=404, detail="Device not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/upload-photo")
async def upload_photo(
        file: UploadFile = File(...),
        photo_type: str = Form(default="thumbnail")  # thumbnail, hover_photo, or gallery
):
    """
    Upload a photo and return the URL.
    photo_type can be: thumbnail, hover_photo, or gallery
    """
    try:
        # validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")

        # validate photo_type
        valid_types = ["thumbnail", "hover_photo", "gallery"]
        if photo_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"photo_type must be one of: {valid_types}")

        # generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.jpg'
        unique_filename = f"{photo_type}/{uuid.uuid4()}{file_extension}"

        # try GCS first, fall back to local storage
        if bucket:
            # upload to gcs
            blob = bucket.blob(f"devices/{unique_filename}")
            file.file.seek(0)
            blob.upload_from_file(file.file, content_type=file.content_type)
            blob.make_public()
            image_url = blob.public_url
        else:
            # fallback to local storage
            local_path = os.path.join(upload_directory, unique_filename.replace("/", "_"))
            file.file.seek(0)
            with open(local_path, "wb") as f:
                f.write(file.file.read())
            image_url = f"/static/{unique_filename.replace('/', '_')}"

        return {
            "url": image_url,
            "photo_type": photo_type,
            "filename": unique_filename,
            "message": "Photo uploaded successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading photo: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/devices/{device_id}/upload-photo")
async def upload_device_photo(
        device_id: str,
        file: UploadFile = File(...),
        photo_type: str = Form(default="thumbnail")
):
    """
    Upload a photo and automatically attach it to a device.
    """
    try:
        # verify device exists
        device = await device_collection.find_one({"_id": ObjectId(device_id)})
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")

        # validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")

        # generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.jpg'
        unique_filename = f"devices/{device_id}/{photo_type}/{uuid.uuid4()}{file_extension}"

        # upload to gcs or local
        if bucket:
            blob = bucket.blob(unique_filename)
            file.file.seek(0)
            blob.upload_from_file(file.file, content_type=file.content_type)
            blob.make_public()
            image_url = blob.public_url
        else:
            local_path = os.path.join(upload_directory, f"{device_id}_{photo_type}_{uuid.uuid4()}{file_extension}")
            file.file.seek(0)
            with open(local_path, "wb") as f:
                f.write(file.file.read())
            image_url = f"/static/{os.path.basename(local_path)}"

        # update device with new photo url
        update_field = {}
        if photo_type in ["thumbnail", "hover_photo"]:
            update_field[photo_type] = image_url
        elif photo_type == "gallery":
            # add to gallery array
            await device_collection.update_one(
                {"_id": ObjectId(device_id)},
                {"$push": {"gallery": {"url": image_url, "caption": None, "paired_device_id": None}}}
            )
            updated_device = await device_collection.find_one({"_id": ObjectId(device_id)})
            updated_device["_id"] = str(updated_device["_id"])
            return {"url": image_url, "photo_type": photo_type, "device": updated_device}

        if update_field:
            await device_collection.update_one(
                {"_id": ObjectId(device_id)},
                {"$set": update_field}
            )

        updated_device = await device_collection.find_one({"_id": ObjectId(device_id)})
        updated_device["_id"] = str(updated_device["_id"])

        return {
            "url": image_url,
            "photo_type": photo_type,
            "device": updated_device,
            "message": "Photo uploaded and attached to device"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading device photo: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/devices/search/{query}")
async def search_devices(query: str):
    """Search devices by nickname, model, or brand for pairing dropdown"""
    try:
        devices_cursor = device_collection.find({
            "$or": [
                {"nickname": {"$regex": query, "$options": "i"}},
                {"model": {"$regex": query, "$options": "i"}},
                {"brand": {"$regex": query, "$options": "i"}}
            ]
        })
        devices = await devices_cursor.to_list(length=20)
        for device in devices:
            device["_id"] = str(device["_id"])
        return devices
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))