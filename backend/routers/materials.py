from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Header, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from backend.database import get_db
from backend.services.document_parser import document_parser
from backend.services.gemini_service import gemini_service
from backend.models.activity import Activity
from backend.config import settings
from backend.services.study_session import register_lecture_session
import uuid

router = APIRouter(prefix="/materials", tags=["Materials & Ingestion"])

SAMPLE_LECTURES = {
    "cpp": (
        "CS 201 Lecture Notes: Modern C++ Memory Architecture & RAII\n\n"
        "1. Pointers & Addresses: A pointer stores the direct memory address of an object. "
        "Dereferencing a null or dangling pointer causes undefined behavior.\n"
        "2. RAII (Resource Acquisition Is Initialization): Resources are tied to object lifetimes. "
        "When an object exits scope, its destructor deallocates heap allocations deterministically.\n"
        "3. Smart Pointers: std::unique_ptr provides strict, zero-cost single ownership. "
        "std::shared_ptr utilizes reference counters for multiple owners. std::weak_ptr breaks circular references.\n"
        "4. Linked List Data Structures: Node pointers require careful pointer manipulation during insertion and reversal."
    ),
    "python": (
        "CS 202 Lecture Notes: Python Function Mechanics & Idiomatic Patterns\n\n"
        "1. First-Class Functions: Functions can be assigned to variables, passed as arguments, and returned.\n"
        "2. Mutable Default Argument Trap: Default argument values are evaluated once when the function is defined. "
        "A mutable default like `target=[]` will retain state across calls. Always use `target=None` with guarded initialization.\n"
        "3. Generators & Iterators: The `yield` keyword pauses execution and maintains frame state, producing lazy evaluation with O(1) memory.\n"
        "4. List Comprehensions: Expressive inline syntax for transforming collections with filter predicates."
    ),
    "java": (
        "CS 203 Lecture Notes: Java OOP Architecture & Reference Semantics\n\n"
        "1. Reference Semantics vs Primitives: Variables store references pointing to heap memory. "
        "The `==` operator compares reference identity (memory address), while `.equals()` evaluates value equality.\n"
        "2. String Pool: String literals are internalized in the PermGen/Metaspace string pool to conserve memory.\n"
        "3. Polymorphism & Interfaces: Interfaces define contracts without implementation. "
        "Classes implement interfaces to guarantee capability (e.g. Comparable, AutoCloseable).\n"
        "4. Memory Reclamation: The Java Garbage Collector automatically tracks unreachable objects and reclaims heap memory."
    )
}

@router.post("/upload")
async def upload_material(
    file: UploadFile = File(...),
    subject: str = Form("cpp"),
    x_gemini_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    try:
        if x_gemini_key and not gemini_service.api_key:
            gemini_service.api_key = x_gemini_key
            gemini_service._init_client()

        content_bytes = await file.read()
        extracted_text = document_parser.extract_text(content_bytes, file.filename)
        detected_subject = document_parser.detect_subject(extracted_text, file.filename)
        final_subject = detected_subject or subject or "cpp"
        register_lecture_session(final_subject, file.filename, extracted_text)

        ext = file.filename.split(".")[-1].lower() if file.filename else ""
        mime_type = "application/pdf" if ext == "pdf" else None

        curriculum = gemini_service.generate_curriculum(
            document_text=extracted_text,
            subject=final_subject,
            api_key=x_gemini_key,
            file_bytes=content_bytes if mime_type else None,
            mime_type=mime_type
        )

        # Populate student curriculum: reviewer study guide, quizzes, and coding challenges
        created_activities = []

        for r in curriculum.reviewer:
            act = Activity(
                id=f"act_r_{uuid.uuid4().hex[:8]}",
                subject=final_subject,
                activity_type="reviewer",
                title=f"{final_subject.upper()}: {r.concept}",
                concept=r.concept,
                difficulty="medium",
                content=r.model_dump(),
                test_cases=[],
                is_published=True
            )
            db.add(act)
            created_activities.append(act)

        for q in curriculum.quizzes:
            act = Activity(
                id=f"act_q_{uuid.uuid4().hex[:8]}",
                subject=final_subject,
                activity_type="quiz",
                title=f"{final_subject.upper()}: {q.concept}",
                concept=q.concept,
                difficulty=q.difficulty,
                content=q.model_dump(),
                test_cases=[],
                is_published=True
            )
            db.add(act)
            created_activities.append(act)

        for c in curriculum.challenges:
            act = Activity(
                id=f"act_c_{uuid.uuid4().hex[:8]}",
                subject=final_subject,
                activity_type="challenge",
                title=c.title,
                concept=c.concept,
                difficulty=c.difficulty,
                content=c.model_dump(),
                test_cases=[tc.model_dump() for tc in c.test_cases],
                is_published=True
            )
            db.add(act)
            created_activities.append(act)

        db.commit()

        return {
            "filename": file.filename,
            "detected_subject": final_subject,
            "word_count": len(extracted_text.split()),
            "curriculum": curriculum.model_dump(),
            "staged_count": len(created_activities),
            "is_published": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document ingestion failed: {str(e)}")

@router.post("/sample/{subject}")
def load_sample_material(
    subject: str,
    publish_immediately: bool = True,
    x_gemini_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    1-click instant sample lecture ingestion for interactive evaluation.
    Stages activities and generates rich curriculum.
    """
    sample_text = SAMPLE_LECTURES.get(subject.lower(), SAMPLE_LECTURES["cpp"])
    register_lecture_session(subject, f"Sample_Lecture_{subject.upper()}.txt", sample_text)
    curriculum = gemini_service.generate_curriculum(sample_text, subject, api_key=x_gemini_key)

    created_activities = []
    for r in curriculum.reviewer:
        act = Activity(
            id=f"act_r_{uuid.uuid4().hex[:8]}",
            subject=subject,
            activity_type="reviewer",
            title=f"{subject.upper()}: {r.concept}",
            concept=r.concept,
            difficulty="medium",
            content=r.model_dump(),
            test_cases=[],
            is_published=publish_immediately
        )
        db.add(act)
        created_activities.append(act)

    for q in curriculum.quizzes:
        act = Activity(
            id=f"act_q_{uuid.uuid4().hex[:8]}",
            subject=subject,
            activity_type="quiz",
            title=f"{subject.upper()}: {q.concept}",
            concept=q.concept,
            difficulty=q.difficulty,
            content=q.model_dump(),
            test_cases=[],
            is_published=publish_immediately
        )
        db.add(act)
        created_activities.append(act)

    for c in curriculum.challenges:
        act = Activity(
            id=f"act_c_{uuid.uuid4().hex[:8]}",
            subject=subject,
            activity_type="challenge",
            title=c.title,
            concept=c.concept,
            difficulty=c.difficulty,
            content=c.model_dump(),
            test_cases=[tc.model_dump() for tc in c.test_cases],
            is_published=publish_immediately
        )
        db.add(act)
        created_activities.append(act)

    db.commit()

    return {
        "subject": subject,
        "filename": f"Sample_Lecture_{subject.upper()}.txt",
        "word_count": len(sample_text.split()),
        "curriculum": curriculum.model_dump(),
        "staged_count": len(created_activities),
        "is_published": publish_immediately
    }

@router.post("/verify-key")
def verify_gemini_key(payload: Dict[str, str] = Body(...)):
    key = payload.get("api_key", "").strip()
    if not key:
        return {"valid": False, "message": "API key cannot be empty"}
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=key)
        cfg = types.GenerateContentConfig(
            max_output_tokens=10,
            automatic_function_calling={"disable": True}
        )

        # 1. Attempt dynamic model discovery for this specific key
        discovered_models = []
        try:
            for m in client.models.list():
                m_name = m.name or ""
                clean_name = m_name.replace("models/", "")
                if "gemini" in clean_name.lower():
                    discovered_models.append(clean_name)
                    discovered_models.append(m_name)
        except Exception as list_err:
            err_str = str(list_err)
            if "404" in err_str or "NOT_FOUND" in err_str or "not found for API version" in err_str:
                return {
                    "valid": False,
                    "message": (
                        "404 NOT_FOUND: Generative Language API is not enabled on this Google Cloud project. "
                        "To fix this in 30 seconds: Go to https://aistudio.google.com/app/apikey, click 'Create API key', "
                        "and select 'Create API key in NEW project' (do not pick an old existing GCP project)."
                    )
                }

        # 2. Build candidate list prioritizing discovered models
        candidates = []
        for pref in ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3-flash", "gemini-2.0-flash-exp"]:
            for d in discovered_models:
                if pref in d and d not in candidates:
                    candidates.append(d)

        for d in discovered_models:
            if d not in candidates:
                candidates.append(d)

        # Defaults if listing returned no gemini models
        for default_m in [settings.GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"]:
            if default_m not in candidates:
                candidates.append(default_m)

        reply = None
        used_model = None
        last_err = None

        for m in candidates:
            try:
                res = client.models.generate_content(
                    model=m,
                    contents="State 'ByteQuest Connected' in 2 words.",
                    config=cfg
                )
                if res.text:
                    reply = res.text.strip()
                    used_model = m
                    break
            except Exception as ex:
                last_err = ex
                continue

        if reply:
            gemini_service.api_key = key
            gemini_service._init_client()
            settings.GEMINI_API_KEY = key
            return {"valid": True, "message": f"Verified with {used_model}! Response: '{reply}'"}

        err_msg = str(last_err)
        if "404" in err_msg or "NOT_FOUND" in err_msg:
            return {
                "valid": False,
                "message": (
                    "404 NOT_FOUND: The selected Google Cloud project does not have the Gemini / Generative Language API enabled. "
                    "Fix: Go to https://aistudio.google.com/app/apikey, click 'Create API key', and choose "
                    "'Create API key in NEW project' (not an existing GCP project)."
                )
            }
        return {"valid": False, "message": f"Verification failed: {err_msg}"}
    except Exception as e:
        return {"valid": False, "message": f"Verification error: {str(e)}"}
