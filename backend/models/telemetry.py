from sqlalchemy import Column, String, Integer, Float, DateTime
from datetime import datetime
from backend.database import Base

class TelemetryRecord(Base):
    __tablename__ = "telemetry_features"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    task_id = Column(String, index=True, nullable=False)
    language = Column(String, nullable=False) # python, cpp, java
    prior_quiz_accuracy = Column(Float, nullable=False) # 0.0 to 1.0
    avg_solve_time_seconds = Column(Float, nullable=False)
    compilation_error_count = Column(Integer, default=0)
    attempts_before_success = Column(Integer, default=1)
    hints_requested_count = Column(Integer, default=0)
    task_difficulty_level = Column(Integer, default=2) # 1=Easy, 2=Medium, 3=Hard
    target_task_success = Column(Integer, nullable=False) # 1=Passed, 0=Failed
    created_at = Column(DateTime, default=datetime.utcnow)
