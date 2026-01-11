from datetime import date
from fastapi import APIRouter
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping
from app import crud
from app.ml import predict
from app.database import SessionDep
from app.schemas import FarmBase, FarmOut, NdviPoint
from app.utils.api_calls import (
    compute_ndvi,
    get_ndvi_with_dates,
    get_weather_data,
    get_weather_series,
)


router = APIRouter(tags=["farms"])
HISTORICAL_DAYS = 7
PREDICT_DAYS = 3
FORECAST_DAYS = 14


@router.post("/", summary="Add a new farm", status_code=201, response_model=FarmOut)
def add_farm(db_session: SessionDep, farm: FarmBase) -> FarmOut:
    """Endpoint to add a new farm."""
    new_farm = crud.create_farm(
        db_session=db_session,
        user_id=1,
        farm_data=farm,
    )
    return FarmOut.model_validate(new_farm, from_attributes=True)


@router.put("/{farm_id}", summary="Update a farm", response_model=FarmOut)
def update_farm(db_session: SessionDep, farm_id: int, farm: FarmBase) -> FarmOut:
    updated_farm = crud.update_farm(db_session, farm_id, farm)
    return FarmOut.model_validate(updated_farm, from_attributes=True)


@router.delete("/{farm_id}", summary="Delete a farm", status_code=204)
def delete_farm(db_session: SessionDep, farm_id: int) -> None:
    crud.delete_farm(db_session, farm_id)
    return None


@router.get("/", summary="List farms", response_model=list[FarmOut])
def list_farms(db_session: SessionDep) -> list[FarmOut]:
    """List all farms for the current user."""
    farms = crud.list_farms(db_session, user_id=1)
    return [FarmOut.model_validate(farm, from_attributes=True) for farm in farms]


@router.get("/{farm_id}", summary="Get farm by ID", response_model=FarmOut | None)
def get_farm(db_session: SessionDep, farm_id: int) -> FarmOut | None:
    """Retrieve a farm by its ID."""
    farm = crud.get_farm(db_session, farm_id)
    return FarmOut.model_validate(farm, from_attributes=True) if farm else None


@router.get("/{farm_id}/ndvi", summary="Get NDVI for a farm", response_model=float)
def predict_farm_ndvi(db_session: SessionDep, farm_id: int) -> float:
    """Retrieve the NDVI for a farm by its ID."""
    farm = crud.get_farm(db_session, farm_id)
    polygon = to_shape(farm.area)
    lat = polygon.centroid.y
    lon = polygon.centroid.x
    weather_data = get_weather_data(lat, lon)
    ndvi_lag, ndvi = compute_ndvi(mapping(polygon))
    return predict(ndvi_lag, ndvi, weather_data)

@router.get(
    "/{farm_id}/ndvi-chart",
    summary="Get chart of NDVI values",
    response_model=list[dict],
)
def get_farm_ndvi_chart(db_session: SessionDep, farm_id: int) -> list[dict]:
    """Retrieve the NDVI for a farm by its ID."""
    farm = crud.get_farm(db_session, farm_id)
    polygon = to_shape(farm.area)
    lat = polygon.centroid.y
    lon = polygon.centroid.x
    weather_series = get_weather_series(lat, lon, HISTORICAL_DAYS, FORECAST_DAYS)
    ndvi_points = get_ndvi_with_dates(mapping(polygon))

    ndvi_predictions = []
    for day in range(PREDICT_DAYS):
        ndvi_lag = ndvi_points[-1]["ndvi"]
        ndvi = ndvi_points[-2]["ndvi"]
        weather_data = get_weather_data(lat, lon, forecast_days=7 + day)

        # Get last 6 days of weather data
        weather_data = weather_data[-6:]
        ndvi_pred = predict(ndvi_lag, ndvi, weather_data)
        pred_date = date.fromisoformat(weather_series[HISTORICAL_DAYS + day]["date"])
        ndvi_predictions.append(
            {"date": pred_date.strftime("%Y-%m-%d"), "ndvi": ndvi_pred,}
        )
    return ndvi_points + ndvi_predictions
