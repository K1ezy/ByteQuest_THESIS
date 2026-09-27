from pydantic import BaseModel
from typing import List, Optional, Literal
from backend.schemas.content_schema import TestCaseSchema

class CodeExecutionRequest(BaseModel):
    student_id: str
    challenge_id: str
    language: Literal["python", "cpp", "java"]
    code: str
    test_cases: List[TestCaseSchema]
    hints_used: int = 0
    time_spent_seconds: float = 30.0

class TestCaseResult(BaseModel):
    test_case_index: int
    input_data: str
    expected_output: str
    actual_output: str
    passed: bool
    runtime_ms: float
    error_message: Optional[str] = None

class CodeExecutionResponse(BaseModel):
    passed_all: bool
    passed_count: int
    total_count: int
    score_pct: float
    compilation_error: Optional[str] = None
    results: List[TestCaseResult]
    ai_feedback: Optional[str] = None
