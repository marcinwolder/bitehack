import ee
import requests
from datetime import date

def compute_ndvi(geo_json) -> float:
    current_date = date.today()
    polygon = ee.Geometry.Polygon(geo_json["coordinates"])
    collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
    .filterBounds(polygon) \
    .filterDate('2023-01-01', current_date.strftime('%Y-%m-%d')) \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
    .sort('system:time_start', False)

    latest_image = collection.first()

    ndvi = latest_image.normalizedDifference(['B8', 'B4']).rename('NDVI').clip(polygon)
    stats = ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=polygon,
        scale=10
    )
    mean_ndvi = stats.get('NDVI').getInfo()
    return mean_ndvi

def get_weather_data(lat: float, lon: float) -> list:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,rain_sum",
        "timezone": "auto",
        "forecast_days": 6
    }
    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()
    data = response.json()
    
    temps = data['daily']['temperature_2m_max']
    rains = data['daily']['rain_sum']

    return list(zip(temps, rains))
