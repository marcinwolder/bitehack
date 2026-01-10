from fastapi import APIRouter
from app.schemas import FarmBase, FarmOut
from app import crud
from app.database import SessionDep

router = APIRouter(tags=["farms"])


@router.post("/", summary="Add a new farm", status_code=201, response_model=FarmOut)
def add_farm(db_session: SessionDep, farm: FarmBase) -> FarmOut:
    """Endpoint to add a new farm."""
    new_farm = crud.create_farm(
        db_session=db_session,
        user_id=1,
        farm_data=farm,
    )
    return FarmOut.model_validate(new_farm, from_attributes=True)


@router.get("/{farm_id}", summary="Get farm by ID", response_model=FarmOut | None)
def get_farm(db_session: SessionDep, farm_id: int) -> FarmOut | None:
    """Retrieve a farm by its ID."""
    farm = crud.get_farm(db_session, farm_id)
    return FarmOut.model_validate(farm, from_attributes=True) if farm else None

