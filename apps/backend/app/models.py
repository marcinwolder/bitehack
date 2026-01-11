from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from geoalchemy2 import Geometry


class Farm(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    crop: str
    user_id: int

    area: str | None = Field(
        sa_column=Column(
            Geometry(geometry_type="POLYGON", srid=4326)
        )
    )

class Recommendation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    farm_id: int
