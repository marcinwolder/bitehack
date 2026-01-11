from functools import lru_cache
from pathlib import Path
from joblib import load
import numpy as np

@lru_cache()
def _load_model() -> object | None:
    base_dir = Path(__file__).resolve().parents[2]  # .../apps
    model_path = base_dir / "model" / "model.joblib"
    if not model_path.exists():
        return None
    return load(model_path)

def predict(ndvi_lag, ndvi, weather_data: list[tuple[float, float]]) -> float:
    PRED_MODEL = _load_model()
    temp_today = weather_data[0][0]
    temp_tommorow = weather_data[1][0]
    temp_short = (temp_today + temp_tommorow) / 2

    later_temps = [temp for temp, _ in weather_data[2:]]
    temp_long = sum(later_temps) / len(later_temps)

    percip_mm = sum(precip for _, precip in weather_data)
    temp_mean = sum(temp for temp, _ in weather_data) / len(weather_data)

    water_energy = percip_mm * temp_mean


    X_new = np.array([[ndvi_lag, ndvi, temp_short, temp_long, percip_mm, water_energy]])
    y_pred = PRED_MODEL.predict(X_new)
    return float(y_pred[0])