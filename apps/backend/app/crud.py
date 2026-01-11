from fastapi import HTTPException
from sqlalchemy import select
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon as ShapelyPolygon
from app.database import SessionDep
from app.schemas import FarmBase
from app.models import Farm

def get_farm(db_session: SessionDep, farm_id: int) -> Farm:
    """Retrieve a farm by its ID."""
    statement = select(Farm).where(Farm.id == farm_id)
    farm = db_session.exec(statement).scalar_one_or_none()
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm

def list_farms(db_session: SessionDep, user_id: int) -> list[Farm]:
    statement = select(Farm).where(Farm.user_id == user_id)
    farms = db_session.exec(statement).scalars().all()
    return farms

def create_farm(db_session: SessionDep, user_id: int, farm_data: FarmBase) -> Farm:
    """Create a new farm."""
    coords = farm_data.area.coordinates[0]  # outer ring
    area = ShapelyPolygon(coords)
    db_farm = Farm(
        user_id=user_id,
        name=farm_data.name,
        crop=farm_data.crop,
        area=from_shape(area)
    )
    db_session.add(db_farm)
    db_session.commit()
    db_session.refresh(db_farm)
    return db_farm

def update_farm(db_session: SessionDep, farm_id: int, farm_data: FarmBase) -> Farm:
    farm = get_farm(db_session, farm_id)
    coords = farm_data.area.coordinates[0]
    area = ShapelyPolygon(coords)
    farm.name = farm_data.name
    farm.crop = farm_data.crop
    farm.area = from_shape(area)
    db_session.add(farm)
    db_session.commit()
    db_session.refresh(farm)
    return farm

def delete_farm(db_session: SessionDep, farm_id: int) -> None:
    farm = get_farm(db_session, farm_id)
    db_session.delete(farm)
    db_session.commit()

