from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Boolean, Text
from datetime import datetime
from backend.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    activity_id = Column(String, index=True, nullable=False)
    code_submitted = Column(Text, nullable=True)
    passed_tests = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)
    score_pct = Column(Float, default=0.0)
    execution_output = Column(Text, nullable=True)
    is_success = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    subject = Column(String, index=True, nullable=False) # cpp, java, python
    concept = Column(String, nullable=True)
    total_questions = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0) # 0.0 to 1.0
    time_spent_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

