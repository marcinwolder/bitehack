## BiteHack

BiteHack is a full-stack farm monitoring dashboard. It lets you draw field
boundaries on a map, stores them in PostGIS, pulls weather forecasts, and
computes NDVI from Sentinel-2 imagery via Google Earth Engine. The frontend
visualizes health trends and includes a soil-moisture panel (currently driven
by mock data).

## Features

- Draw, edit, and manage farm polygons on an interactive map.
- Fetch daily temperature and rainfall series from Open-Meteo.
- Compute NDVI for a field using Google Earth Engine.
- Store geospatial farms in PostGIS and expose a FastAPI backend.

## Architecture

- Frontend: React + Vite + Tailwind + DaisyUI + Leaflet.
- Backend: FastAPI + SQLModel + GeoAlchemy2 + PostGIS.
- Integrations: Google Earth Engine (NDVI), Open-Meteo (weather).

## Repo layout

- `apps/frontend`: React dashboard UI.
- `apps/backend`: FastAPI service and database models.
- `infra`: Docker Compose stack (PostGIS + backend + frontend).

## Quick start (Docker Compose)

1) Create `infra/.env` (example values in `infra/.env-example`):
```
cp infra/.env-example infra/.env
```

2) Add your Google Earth Engine service account file at:
`infra/service_account.json`

3) Start the stack:
```
docker compose -f infra/docker-compose.yaml --env-file infra/.env up --build
```

4) Open the app:
- Frontend: http://localhost:3000

## API overview

- `GET /health` - health check.
- `GET /api/farms` - list farms.
- `POST /api/farms` - create farm.
- `PUT /api/farms/{farm_id}` - update farm.
- `DELETE /api/farms/{farm_id}` - delete farm.
- `GET /api/farms/{farm_id}/ndvi` - NDVI-based score for a farm.

## Notes

- Google Earth Engine requires a service account JSON with access enabled.
- Weather data is fetched from Open-Meteo without an API key.
