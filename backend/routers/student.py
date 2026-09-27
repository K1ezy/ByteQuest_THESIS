from fastapi import APIRouter, Depends, HTTPException, Body, Header
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.database import get_db
from backend.models.student import Student
from backend.models.activity import Activity
from backend.services.gemini_service import gemini_service
from backend.services.adaptive_engine import adaptive_engine
from backend.services.study_session import get_lecture_session, build_bytebot_system_instruction

router = APIRouter(prefix="/student", tags=["Student Activities"])

@router.get("/profile/{student_id}")
def get_student_profile(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        # Create default profile if not exists
        student = Student(id=student_id, name="Alex (You)", total_xp=140, level=2, streak_days=4, badges=["hello_world"])
        db.add(student)
        db.commit()
        db.refresh(student)
    return student

@router.get("/activities/{subject}")
def get_published_activities(subject: str, db: Session = Depends(get_db)):
    db_activities = db.query(Activity).filter(
        Activity.subject == subject,
        Activity.is_published == True
    ).order_by(Activity.created_at.desc()).all()

    quizzes = []
    challenges = []
    reviewer = []

    for act in db_activities:
        c = act.content if isinstance(act.content, dict) else {}
        if not c.get("id"):
            c["id"] = act.id
        if not c.get("concept"):
            c["concept"] = act.concept
        if not c.get("difficulty"):
            c["difficulty"] = act.difficulty

        if act.activity_type == "quiz":
            quizzes.append(c)
        elif act.activity_type == "challenge":
            if not c.get("test_cases") and act.test_cases:
                c["test_cases"] = act.test_cases
            challenges.append(c)
        elif act.activity_type == "reviewer":
            reviewer.append(c)

    # Always ensure high-quality curriculum sections are populated
    fallback = gemini_service._generate_fallback_curriculum(subject, "")
    if not quizzes:
        quizzes = [q.model_dump() for q in fallback.quizzes]
    if not reviewer:
        reviewer = [r.model_dump() for r in fallback.reviewer]
    if not challenges:
        challenges = [c.model_dump() for c in fallback.challenges]

    return {
        "quizzes": quizzes,
        "reviewer": reviewer,
        "challenges": challenges
    }

@router.post("/chat-tutor")
def socratic_chat(
    payload: Dict[str, Any] = Body(...),
    x_gemini_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if x_gemini_key and not gemini_service.api_key:
        gemini_service.api_key = x_gemini_key
        gemini_service._init_client()

    message = payload.get("message", "")
    subject = payload.get("subject", "cpp").lower()
    context = payload.get("context", "")
    history = payload.get("history", [])

    # Assemble lecture document context
    session = get_lecture_session(subject) or {}
    doc_title = session.get("filename", f"{subject.upper()}_Lecture_Slides.pdf")
    doc_text = session.get("raw_text") or context or ""

    # Fetch active activities from database
    db_acts = db.query(Activity).filter(Activity.subject == subject, Activity.is_published == True).all()
    reviewer_notes = [a.content for a in db_acts if a.activity_type == "reviewer" and isinstance(a.content, dict)]
    quizzes = [a.content for a in db_acts if a.activity_type == "quiz" and isinstance(a.content, dict)]
    challenges = [a.content for a in db_acts if a.activity_type == "challenge" and isinstance(a.content, dict)]

    # Dynamic system instruction giving ByteBot full access to the lecture and study items
    system_instruction = build_bytebot_system_instruction(
        subject=subject,
        document_title=doc_title,
        extracted_text=doc_text,
        reviewer_notes=reviewer_notes,
        quizzes=quizzes,
        challenges=challenges
    )

    reply = gemini_service.socratic_tutor_reply(
        message=message,
        subject=subject,
        context_notes=doc_text,
        chat_history=history,
        api_key=x_gemini_key,
        system_instruction_override=system_instruction,
        doc_title=doc_title,
        reviewer_notes=reviewer_notes
    )
    return reply

@router.post("/adaptive-next")
def get_adaptive_next_activity(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    student_id = payload.get("student_id", "alex_nemsu")
    stats = payload.get("stats", {})
    available = db.query(Activity).filter(Activity.is_published == True).all()
    available_dicts = [a.__dict__ for a in available]

    rec = adaptive_engine.recommend_next_activity(student_id, stats, available_dicts)
    return rec
