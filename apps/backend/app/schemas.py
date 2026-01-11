from pydantic import BaseModel, ConfigDict, field_validator
from shapely.geometry import mapping
from geoalchemy2.shape import to_shape
from typing import List, Literal
from pydantic import field_serializer

class Polygon(BaseModel):
    type: Literal["Polygon"]
    coordinates: List[List[List[float]]]

class FarmBase(BaseModel):
    name: str
    crop: str
    area: Polygon

class PolygonOut(BaseModel):
    type: Literal["Polygon"]
    coordinates: List[List[List[float]]]

class FarmOut(BaseModel):
    id: int
    user_id: int
    name: str
    crop: str
    area: PolygonOut

    model_config = ConfigDict(from_attributes=True)

    @field_validator("area", mode="before")
    @classmethod
    def convert_area(cls, value):
        if value is None:
            return value
        return mapping(to_shape(value))

    @field_serializer("area")
    def serialize_area(self, area):
        if isinstance(area, PolygonOut):
            return area
        geojson = mapping(to_shape(area))
        return PolygonOut(**geojson)

class NdviPoint(BaseModel):
    date: str
    value: float
    is_forecast: bool
