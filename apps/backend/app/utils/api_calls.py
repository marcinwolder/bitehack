import ee
import requests
from datetime import date, timedelta

def compute_ndvi(geo_json) -> tuple[float, float]:
    current_date = date.today()
    polygon = ee.Geometry.Polygon(geo_json["coordinates"])
    collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
    .filterBounds(polygon) \
    .filterDate('2023-01-01', current_date.strftime('%Y-%m-%d')) \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
    .sort('system:time_start', False)

    latest_image = collection.first()
    penultimate_image = ee.Image(collection.toList(2).get(1))

    ndvi = latest_image.normalizedDifference(['B8', 'B4']).rename('NDVI').clip(polygon)
    stats = ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=polygon,
        scale=10
    )

    lag_ndvi = penultimate_image.normalizedDifference(['B8', 'B4']).rename('NDVI').clip(polygon)
    lag_stats = lag_ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=polygon,
        scale=10
    )
    mean_ndvi = stats.get('NDVI').getInfo()
    lag_mean_ndvi = lag_stats.get('NDVI').getInfo()
    return lag_mean_ndvi, mean_ndvi

def compute_ndvi_for_date(geo_json, target_date: date) -> float | None:
    polygon = ee.Geometry.Polygon(geo_json["coordinates"])
    start_date = target_date.strftime('%Y-%m-%d')
    end_date = (target_date + timedelta(days=1)).strftime('%Y-%m-%d')
    collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
    .filterBounds(polygon) \
    .filterDate(start_date, end_date) \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
    .sort('system:time_start', False)

    if collection.size().getInfo() == 0:
        return None

    latest_image = collection.first()
    ndvi = latest_image.normalizedDifference(['B8', 'B4']).rename('NDVI').clip(polygon)
    stats = ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=polygon,
        scale=10
    )
    return stats.get('NDVI').getInfo()

def get_weather_series(
    lat: float,
    lon: float,
    historical_days: int = 7,
    forecast_days: int = 14
) -> list[dict]:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_mean,precipitation_sum",
        "timezone": "auto",
        "past_days": historical_days,
        "forecast_days": forecast_days
    }
    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()
    data = response.json()
    
    times = data.get('daily', {}).get('time', [])
    temps = data.get('daily', {}).get('temperature_2m_mean', [])
    rains = data.get('daily', {}).get('precipitation_sum', [])

    series = []
    for index, date_str in enumerate(times):
        series.append({
            "date": date_str,
            "temperature": temps[index] if index < len(temps) else 0,
            "precipitation": rains[index] if index < len(rains) else 0,
            "is_forecast": index >= historical_days
        })
    return series

def get_weather_data(lat: float, lon: float, forecast_days: int = 6) -> list:
    series = get_weather_series(
        lat,
        lon,
        historical_days=0,
        forecast_days=forecast_days
    )
    return [(point["temperature"], point["precipitation"]) for point in series]
