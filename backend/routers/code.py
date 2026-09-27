from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.execution_schema import CodeExecutionRequest, CodeExecutionResponse
from backend.services.code_executor import code_executor
from backend.services.gemini_service import gemini_service
from backend.models.submission import Submission
from backend.models.telemetry import TelemetryRecord
import uuid

router = APIRouter(prefix="/code", tags=["Code Execution & Sandboxing"])

@router.post("/submit", response_model=CodeExecutionResponse)
def submit_and_evaluate_code(
    req: CodeExecutionRequest,
    x_gemini_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    try:
        # Run in sandbox
        exec_res = code_executor.execute_and_evaluate(
            language=req.language,
            code=req.code,
            test_cases=req.test_cases
        )

        # AI assessment feedback if needed
        ai_eval = gemini_service.assess_code_submission(
            code=req.code,
            prompt=f"Challenge ID: {req.challenge_id}",
            rubric=["Compiles and executes without error", "Passes input/output test specifications"],
            language=req.language,
            api_key=x_gemini_key
        )
        exec_res.ai_feedback = ai_eval.get("feedback")

        # Save submission record
        sub = Submission(
            id=f"sub_{uuid.uuid4().hex[:8]}",
            student_id=req.student_id,
            activity_id=req.challenge_id,
            code_submitted=req.code,
            passed_tests=exec_res.passed_count,
            total_tests=exec_res.total_count,
            score_pct=exec_res.score_pct,
            execution_output=exec_res.compilation_error or "Executed successfully.",
            is_success=exec_res.passed_all
        )
        db.add(sub)

        # Log ML telemetry feature vector
        telemetry = TelemetryRecord(
            id=f"tel_{uuid.uuid4().hex[:8]}",
            student_id=req.student_id,
            task_id=req.challenge_id,
            language=req.language,
            prior_quiz_accuracy=0.80, # default or query from DB
            avg_solve_time_seconds=req.time_spent_seconds,
            compilation_error_count=1 if exec_res.compilation_error else 0,
            attempts_before_success=1,
            hints_requested_count=req.hints_used,
            task_difficulty_level=2,
            target_task_success=1 if exec_res.passed_all else 0
        )
        db.add(telemetry)
        db.commit()

        return exec_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code execution error: {str(e)}")
