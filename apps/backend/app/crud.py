from typing import Optional
from sqlalchemy import select
from app.database import SessionDep
from app.schemas import FarmBase
from app.models import Farm
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon as ShapelyPolygon

def get_farm(db_session: SessionDep, farm_id: int) -> Farm | None:
    """Retrieve a farm by its ID."""
    statement = select(Farm).where(Farm.id == farm_id)
    return db_session.exec(statement).scalar_one_or_none()

def create_farm(db_session: SessionDep, user_id: int, farm_data: FarmBase) -> Farm:
    """Create a new farm."""
    coords = farm_data.area.coordinates[0]  # outer ring
    area = ShapelyPolygon(coords)
    db_farm = Farm(user_id=user_id, name=farm_data.name, area=from_shape(area))
    db_session.add(db_farm)
    db_session.commit()
    db_session.refresh(db_farm)
    return db_farm

