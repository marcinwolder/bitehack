import ee
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.router import router as api_router
from app.core.config import settings
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
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