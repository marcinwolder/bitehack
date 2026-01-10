from fastapi import APIRouter

from app.api.routes.farms import router as farms_router

router = APIRouter()
router.include_router(farms_router, prefix="/farms")