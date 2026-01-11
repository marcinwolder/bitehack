def predict(ndvi, weather_data):
    avg_temp = sum(temp for temp, rain in weather_data) / len(weather_data)
    avg_rain = sum(rain for temp, rain in weather_data) / len(weather_data)
    predicted_ndvi = (ndvi + (avg_temp * 0.01) - (avg_rain * 0.005))
    return max(0.0, min(1.0, predicted_ndvi))