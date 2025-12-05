from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # import staticfiles
from database import ping_mongoDB, device_collection
from models import Device, DeviceBase
from bson import ObjectId
from google.cloud import storage
from dotenv import load_dotenv
import uuid # generates unique file names
import os

# load environment variables from .env file (for gcs credentials, etc.)
load_dotenv()

# initialize google cloud storage client and bucket for uploads
try:
    # client is automatically configured using environment variables (e.g., google_application_credentials)
    storage_client = storage.Client()
    # replace 'your-gcs-bucket-name' with your actual bucket name
    bucket = os.getenv("epraudite-gadgets-gizmos")
    if not bucket:
        raise ValueError("gcs_bucket_name environment variable not set.")
    bucket = storage_client.bucket(bucket)
except Exception as e:
    print(f"error initializing google cloud storage: {e}")
    pass


app = FastAPI(title="gadgets & gizmos api")
upload_directory = "./uploads"
# mount the directory containing uploaded photos to be accessible via /static
# /static is the url prefix, and upload_directory is the local folder.
app.mount("/static", StaticFiles(directory=upload_directory), name="static")

# configure cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allows all origins
    allow_methods=["*"], # allows all methods (get, post, put, delete, etc.)
    allow_headers=["*"], # allows all headers
)

# ensure the local upload directory exists
if not os.path.exists(upload_directory):
    os.makedirs(upload_directory)

@app.on_event("startup")
async def startup():
    # ping MongoDB to ensure connection is working
    await ping_mongoDB()

@app.get("/")
async def root():
    # basic endpoint to confirm the api is running
    return {"message": "api is running successfully!"}

@app.get("/devices")
async def get_all_devices():
    # retrieve all devices from the MongoDB collection
    devices_cursor = device_collection.find({})
    devices = await devices_cursor.to_list(length=None)

    # convert objectid to string for json serialization
    for device in devices:
        device["_id"] = str(device["_id"])
    return devices

@app.post("/devices")
async def create_device(device: DeviceBase):
    # convert pydantic model to dictionary, excluding unset values
    device_dict = device.model_dump(by_alias=True, exclude_none=True)
    # insert the new device into the collection
    result = await device_collection.insert_one(device_dict)
    # return the created device with its new string id
    device_dict["_id"] = str(result.inserted_id)
    return device_dict

@app.get("/devices/{device_id}")
async def get_device(device_id: str):
    # get a single device by its MongoDB objectid
    try:
        device = await device_collection.find_one({"_id": ObjectId(device_id)})
        if device:
            # convert objectid to string for json serialization
            device["_id"] = str(device["_id"])
            return device
        # raise 404 if no device is found
        raise HTTPException(status_code=404, detail="device not found")
    except Exception as e:
        # handle invalid objectid format
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/devices/{device_id}")
async def update_device(device_id: str, device: DeviceBase):
    # update an existing device by id
    try:
        # prepare update dictionary
        device_dict = device.model_dump(by_alias=True, exclude_none=True)
        # replace the existing document with the new data
        result = await device_collection.replace_one(
            {"_id": ObjectId(device_id)},
            device_dict
        )
        if result.modified_count == 1:
            # fetch and return the updated document
            updated_device = await device_collection.find_one({"_id": ObjectId(device_id)})
            updated_device["_id"] = str(updated_device["_id"])
            return updated_device
        # raise 404 if no device was modified (not found)
        raise HTTPException(status_code=404, detail="device not found")
    except Exception as e:
        # handle invalid objectid format or other db errors
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/devices/{device_id}")
async def delete_device(device_id: str):
    # delete a device by id
    try:
        # delete the document
        result = await device_collection.delete_one({"_id": ObjectId(device_id)})
        if result.deleted_count == 1:
            # success message
            return {"message": "device deleted successfully"}
        # raise 404 if no device was deleted or not found
        raise HTTPException(status_code=404, detail="device not found")
    except Exception as e:
        # handle invalid objectid format or other db errors
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/devices/{device_id}/upload-photo")
async def upload_device_photo(device_id: str, file: UploadFile = File(...)):
    # upload a photo for a specific device to google cloud storage
    try:
        # 1. check if the device exists
        device = await device_collection.find_one({"_id": ObjectId(device_id)})
        if not device:
            raise HTTPException(status_code=404, detail="device not found")

        # basic file validation for image type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="invalid file type. only images are allowed.")

        # 2. upload the file to gcs - create a unique filename using a uuid and the device id
        file_extension = os.path.splitext(file.filename)[1]
        unique_blob_name = f"devices/{device_id}/{uuid.uuid4()}{file_extension}"

        # get the gcs blob (file reference)
        blob = bucket.blob(unique_blob_name)

        # read the file content and upload it
        # seek to the start (0) because fastapi might have read part of it
        file.file.seek(0)
        blob.upload_from_file(file.file, content_type=file.content_type)

        # make the file publicly readable for direct linking
        blob.make_public()

        # 3. update the database record store the image url in the device document
        image_url = blob.public_url # gcs public url

        await device_collection.update_one(
            {"_id": ObjectId(device_id)},
            {"$set": {"image_url": image_url}}
        )
        return {"filename": unique_blob_name, "url": image_url, "message": "photo uploaded successfully to gcs."}

    except HTTPException:
        # re-raise explicit http exceptions (404, 400)
        raise
    except Exception as e:
        # log unexpected gcs or db errors
        print(f"error during gcs file upload: {e}")
        # return a generic 500 error for internal server issues
        raise HTTPException(status_code=500, detail="internal server error during gcs upload.")