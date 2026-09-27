from backend.routers.materials import router as materials_router
from backend.routers.student import router as student_router
from backend.routers.instructor import router as instructor_router
from backend.routers.code import router as code_router
from backend.routers.ml import router as ml_router
from backend.routers.evaluation import router as evaluation_router

__all__ = [
    "materials_router",
    "student_router",
    "instructor_router",
    "code_router",
    "ml_router",
    "evaluation_router"
]
