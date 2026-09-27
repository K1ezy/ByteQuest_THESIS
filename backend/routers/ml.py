from fastapi import APIRouter, Depends, Response
from typing import List
from sqlalchemy.orm import Session
import io
import pandas as pd
from backend.database import get_db
from backend.models.telemetry import TelemetryRecord
from backend.schemas.ml_schema import (
    StudentFeatureVector, ModelComparisonResponse, PredictionRequest, PredictionResponse
)
from backend.services.ml_engine import ml_engine
import uuid

router = APIRouter(prefix="/ml", tags=["Machine Learning Pipeline"])

@router.post("/train-evaluate", response_model=ModelComparisonResponse)
def train_and_evaluate_models(db: Session = Depends(get_db)):
    db_records = db.query(TelemetryRecord).all()
    if len(db_records) < 20:
        # Seed and use synthetic benchmark
        dataset = ml_engine.generate_synthetic_telemetry(120)
        # Store in db for persistence
        for d in dataset[:50]:
            rec = TelemetryRecord(
                id=f"tel_{uuid.uuid4().hex[:8]}",
                student_id=d.student_id,
                task_id=d.task_id,
                language=d.language,
                prior_quiz_accuracy=d.prior_quiz_accuracy,
                avg_solve_time_seconds=d.avg_solve_time_seconds,
                compilation_error_count=d.compilation_error_count,
                attempts_before_success=d.attempts_before_success,
                hints_requested_count=d.hints_requested_count,
                task_difficulty_level=d.task_difficulty_level,
                target_task_success=d.target_task_success
            )
            db.add(rec)
        db.commit()
    else:
        dataset = [
            StudentFeatureVector(
                student_id=r.student_id,
                task_id=r.task_id,
                language=r.language,
                prior_quiz_accuracy=r.prior_quiz_accuracy,
                avg_solve_time_seconds=r.avg_solve_time_seconds,
                compilation_error_count=r.compilation_error_count,
                attempts_before_success=r.attempts_before_success,
                hints_requested_count=r.hints_requested_count,
                task_difficulty_level=r.task_difficulty_level,
                target_task_success=r.target_task_success
            )
            for r in db_records
        ]

    comparison = ml_engine.train_and_compare(dataset)
    return comparison

@router.post("/predict", response_model=PredictionResponse)
def predict_student_success(req: PredictionRequest):
    return ml_engine.predict_success_probability(req)

@router.get("/features", response_model=List[StudentFeatureVector])
def get_telemetry_features(db: Session = Depends(get_db)):
    db_records = db.query(TelemetryRecord).limit(100).all()
    if not db_records:
        return ml_engine.generate_synthetic_telemetry(50)
    return [
        StudentFeatureVector(
            student_id=r.student_id,
            task_id=r.task_id,
            language=r.language,
            prior_quiz_accuracy=r.prior_quiz_accuracy,
            avg_solve_time_seconds=r.avg_solve_time_seconds,
            compilation_error_count=r.compilation_error_count,
            attempts_before_success=r.attempts_before_success,
            hints_requested_count=r.hints_requested_count,
            task_difficulty_level=r.task_difficulty_level,
            target_task_success=r.target_task_success
        )
        for r in db_records
    ]

@router.get("/export-csv")
def export_telemetry_csv(db: Session = Depends(get_db)):
    db_records = db.query(TelemetryRecord).all()
    if not db_records:
        synthetic = ml_engine.generate_synthetic_telemetry(100)
        data = [d.model_dump() for d in synthetic]
    else:
        data = [{
            "student_id": r.student_id,
            "task_id": r.task_id,
            "language": r.language,
            "prior_quiz_accuracy": r.prior_quiz_accuracy,
            "avg_solve_time_seconds": r.avg_solve_time_seconds,
            "compilation_error_count": r.compilation_error_count,
            "attempts_before_success": r.attempts_before_success,
            "hints_requested_count": r.hints_requested_count,
            "task_difficulty_level": r.task_difficulty_level,
            "target_task_success": r.target_task_success,
            "created_at": r.created_at.isoformat()
        } for r in db_records]

    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bytequest_thesis_telemetry.csv"}
    )
