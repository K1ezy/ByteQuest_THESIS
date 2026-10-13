from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.execution_schema import CodeExecutionRequest, CodeExecutionResponse
from backend.services.code_executor import code_executor
from backend.services.gemini_service import gemini_service
from backend.models.submission import Submission, QuizSubmission
from backend.models.activity import Activity
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

        # 1. Compute dynamic prior quiz accuracy for this student
        student_quizzes = db.query(QuizSubmission).filter(
            QuizSubmission.student_id == req.student_id
        ).order_by(QuizSubmission.created_at.desc()).limit(10).all()

        if student_quizzes:
            subj_quizzes = [q for q in student_quizzes if q.subject == req.language]
            active_quizzes = subj_quizzes if subj_quizzes else student_quizzes
            prior_quiz_acc = round(sum(q.accuracy for q in active_quizzes) / len(active_quizzes), 3)
        else:
            prior_quiz_acc = 0.75

        # 2. Count true submission attempts on this challenge
        prior_attempts = db.query(Submission).filter(
            Submission.student_id == req.student_id,
            Submission.activity_id == req.challenge_id
        ).count()
        attempts_count = prior_attempts + 1

        # 3. Determine real challenge difficulty level (1=Easy, 2=Medium, 3=Hard)
        diff_level = 2
        challenge_act = db.query(Activity).filter(Activity.id == req.challenge_id).first()
        if challenge_act and challenge_act.difficulty:
            d_str = challenge_act.difficulty.lower()
            if "easy" in d_str:
                diff_level = 1
            elif "hard" in d_str:
                diff_level = 3
            else:
                diff_level = 2

        # Log authentic ML telemetry feature vector
        telemetry = TelemetryRecord(
            id=f"tel_{uuid.uuid4().hex[:8]}",
            student_id=req.student_id,
            task_id=req.challenge_id,
            language=req.language,
            prior_quiz_accuracy=prior_quiz_acc,
            avg_solve_time_seconds=req.time_spent_seconds,
            compilation_error_count=1 if exec_res.compilation_error else 0,
            attempts_before_success=attempts_count,
            hints_requested_count=req.hints_used,
            task_difficulty_level=diff_level,
            target_task_success=1 if exec_res.passed_all else 0
        )
        db.add(telemetry)
        db.commit()


        return exec_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code execution error: {str(e)}")
