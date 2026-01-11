import ee
import json
import os
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.router import router as api_router
from app.core.config import settings
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    if credentials_path and os.path.exists(credentials_path):
        try:
            with open(credentials_path, "r", encoding="utf-8") as handle:
                service_account = json.load(handle).get("client_email", "")
        except (OSError, json.JSONDecodeError):
            service_account = ""
        if service_account:
            credentials = ee.ServiceAccountCredentials(  # pyright: ignore[reportPrivateImportUsage]
                service_account, credentials_path
            )
            ee.Initialize(credentials)
        else:
            ee.Initialize()
    else:
        ee.Initialize()
    yield


app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/health", summary="Health check")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
