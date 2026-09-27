from sqlalchemy import Column, String, Integer, DateTime, JSON
from datetime import datetime
from backend.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, default="student") # student, instructor, researcher
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=1)
    badges = Column(JSON, default=list) # List of badge IDs unlocked
    created_at = Column(DateTime, default=datetime.utcnow)
