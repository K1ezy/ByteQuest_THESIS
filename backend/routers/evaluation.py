from fastapi import APIRouter, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/evaluation", tags=["Thesis Evaluation & SUS Instrument"])

class SusSurveySubmission(BaseModel):
    student_id: str = "std_001_alex"
    scores: Optional[List[int]] = None
    q1_frequent_use: int = 4
    q2_complexity: int = 2
    q3_ease_of_use: int = 4
    q4_tech_support_need: int = 1
    q5_integration: int = 4
    q6_inconsistency: int = 1
    q7_learnability: int = 4
    q8_cumbersome: int = 1
    q9_confidence: int = 4
    q10_learning_curve: int = 2
    qualitative_feedback: str = ""

@router.post("/sus-submit")
def submit_sus_survey(survey: SusSurveySubmission):
    # Standard SUS Calculation:
    # Odd items (1, 3, 5, 7, 9) contribute: score - 1
    # Even items (2, 4, 6, 8, 10) contribute: 5 - score
    # Multiply sum by 2.5 to get 0-100 score.
    if survey.scores and len(survey.scores) == 10:
        odd_scores = sum((survey.scores[i] - 1) for i in [0, 2, 4, 6, 8])
        even_scores = sum((5 - survey.scores[i]) for i in [1, 3, 5, 7, 9])
    else:
        odd_scores = (
            (survey.q1_frequent_use - 1) +
            (survey.q3_ease_of_use - 1) +
            (survey.q5_integration - 1) +
            (survey.q7_learnability - 1) +
            (survey.q9_confidence - 1)
        )
        even_scores = (
            (5 - survey.q2_complexity) +
            (5 - survey.q4_tech_support_need) +
            (5 - survey.q6_inconsistency) +
            (5 - survey.q8_cumbersome) +
            (5 - survey.q10_learning_curve)
        )
    sus_score = (odd_scores + even_scores) * 2.5

    grade = "A (Excellent)" if sus_score >= 80.3 else ("B (Good)" if sus_score >= 68 else "C (Average)")

    return {
        "student_id": survey.student_id,
        "raw_sus_score": round(sus_score, 1),
        "sus_score": round(sus_score, 1),
        "adjective_rating": grade,
        "grade": grade,
        "status": "Recorded for thesis Objective 9 usability report"
    }

@router.get("/instrument-questions")
def get_sus_questions():
    return [
        {"id": "q1", "text": "I think that I would like to use ByteQuest frequently for CS practice."},
        {"id": "q2", "text": "I found the system unnecessarily complex."},
        {"id": "q3", "text": "I thought the system was easy to use."},
        {"id": "q4", "text": "I think that I would need the support of a technical person to be able to use ByteQuest."},
        {"id": "q5", "text": "I found the various functions in this system were well integrated."},
        {"id": "q6", "text": "I thought there was too much inconsistency in this system."},
        {"id": "q7", "text": "I would imagine that most CS students would learn to use ByteQuest very quickly."},
        {"id": "q8", "text": "I found the system very cumbersome to use."},
        {"id": "q9", "text": "I felt very confident using the ByteBot tutor and IDE sandbox."},
        {"id": "q10", "text": "I needed to learn a lot of things before I could get going with this platform."}
    ]
