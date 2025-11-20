# creating data objects

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class DeviceType(str, Enum):
    computer = "computer"
    camera = "camera"
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

class DeviceBase(BaseModel):
    # Required fields for ALL devices
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
    main_photo: Optional[str] = None
    notes: Optional[str] = None

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

    # optional for misc
    battery_life: Optional[str] = None
    connectivity: Optional[str] = None

    # repair history
    repairs: List[RepairEvent] = []

class Device(DeviceBase):
    id: Optional[str] = Field(default=None, alias="_id")

    class Config:
        populate_by_name = True