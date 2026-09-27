from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database import get_db
from backend.models.activity import Activity
from backend.models.student import Student

router = APIRouter(prefix="/instructor", tags=["Instructor Management"])

@router.get("/staged-activities")
def get_staged_activities(db: Session = Depends(get_db)):
    return db.query(Activity).filter(Activity.is_published == False).all()

@router.put("/activity/{activity_id}")
def update_activity(
    activity_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    if "title" in payload: activity.title = payload["title"]
    if "difficulty" in payload: activity.difficulty = payload["difficulty"]
    if "content" in payload: activity.content = payload["content"]
    if "test_cases" in payload: activity.test_cases = payload["test_cases"]

    db.commit()
    db.refresh(activity)
    return activity

@router.post("/publish")
def publish_activities(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    activity_ids = payload.get("activity_ids", [])
    if not activity_ids:
        # Publish all staged
        activities = db.query(Activity).filter(Activity.is_published == False).all()
    else:
        activities = db.query(Activity).filter(Activity.id.in_(activity_ids)).all()

    for act in activities:
        act.is_published = True

    db.commit()
    return {"published_count": len(activities), "status": "deployed_to_students"}

@router.get("/roster-analytics")
def get_roster_analytics(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    if not students:
        return [
            {"id": "s1", "name": "Alex (You)", "level": 2, "xp": 140, "completion_pct": 85},
            {"id": "s2", "name": "ada_lovelace", "level": 4, "xp": 480, "completion_pct": 95},
            {"id": "s3", "name": "jrizal_dev", "level": 3, "xp": 390, "completion_pct": 90},
            {"id": "s4", "name": "kernel_kat", "level": 2, "xp": 210, "completion_pct": 70},
            {"id": "s5", "name": "null_ptr", "level": 1, "xp": 90, "completion_pct": 40}
        ]
    return students
