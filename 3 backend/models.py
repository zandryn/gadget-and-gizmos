# creating data objects

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class DeviceType(str, Enum):
    computer = "computer"
    camera = "camera"
    appliance = "appliance"
    misc = "miscellaneous"

class DeviceStatus(str, Enum):
    active = "active"
    retired = "retired"
    repairing = "repairing"

class RepairPart(BaseModel):
    name: str
    cost: float

class RepairEvent(BaseModel):
    date: datetime
    type: str  # repair/upgrade/maintenance
    description: str
    parts_used: List[RepairPart] = []
    time_spent: float  # hours
    photos_before_after: List[str] = []

class GalleryPhoto(BaseModel):
    url: str
    caption: Optional[str] = None
    paired_device_id: Optional[str] = None  # link to another device shown in photo

class PairedDevice(BaseModel):
    device_id: str
    nickname: Optional[str] = None
    model: Optional[str] = None

class DeviceBase(BaseModel):
    # required fields for all devices
    nickname: str
    model: str
    brand: str
    device_type: DeviceType
    adopted_date: datetime
    purchase_price: float
    source: str

    # optional for all
    current_value: Optional[float] = None
    status: DeviceStatus = DeviceStatus.active
    notes: Optional[str] = None

    # photo fields
    thumbnail: Optional[str] = None      # main card image
    hover_photo: Optional[str] = None    # shown on hover (aritzia style)
    main_photo: Optional[str] = None     # legacy/fallback
    gallery: List[GalleryPhoto] = []     # additional photos

    # paired devices (up to 3)
    paired_devices: List[PairedDevice] = []

    # optional for computers
    cpu: Optional[str] = None
    ram: Optional[str] = None
    storage: Optional[str] = None
    os: Optional[str] = None
    battery_model: Optional[str] = None

    # optional for cameras
    sensor_type: Optional[str] = None
    lens_mount: Optional[str] = None
    megapixels: Optional[float] = None
    film_type: Optional[str] = None

    # optional for misc/appliance
    battery_life: Optional[str] = None
    connectivity: Optional[str] = None

    # repair history
    repairs: List[RepairEvent] = []

class Device(DeviceBase):
    id: Optional[str] = Field(default=None, alias="_id")

    class Config:
        populate_by_name = True
