from sqlalchemy import Column, String, Integer, DateTime, JSON, Boolean, Text
from datetime import datetime
from backend.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, index=True)
    subject = Column(String, index=True) # python, cpp, java
    activity_type = Column(String, index=True) # quiz, challenge, reviewer
    title = Column(String, nullable=False)
    concept = Column(String, nullable=False)
    difficulty = Column(String, default="medium") # easy, medium, hard
    content = Column(JSON, nullable=False) # Question details, options, starter code, rubric
    test_cases = Column(JSON, default=list) # [{input_data, expected_output, is_hidden}]
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
