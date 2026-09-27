from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class QuizQuestionSchema(BaseModel):
    id: str = Field(description="Unique question identifier")
    concept: str = Field(description="Core programming concept tested")
    difficulty: Literal["easy", "medium", "hard"]
    question: str
    code_snippet: Optional[str] = None
    options: List[str] = Field(min_length=4, max_length=4)
    correct_index: int = Field(ge=0, le=3)
    explanation: str

class TestCaseSchema(BaseModel):
    input_data: str
    expected_output: str
    is_hidden: bool = False

class CodeChallengeSchema(BaseModel):
    id: str
    title: str
    language: Literal["python", "cpp", "java"]
    concept: str
    difficulty: Literal["easy", "medium", "hard"]
    prompt: str
    starter_code: str
    solution_code: str
    test_cases: List[TestCaseSchema]

class ReviewerSectionSchema(BaseModel):
    concept: str
    summary: str
    key_takeaways: List[str]
    code_sample: Optional[str] = None

class GeneratedCurriculumSchema(BaseModel):
    subject: Literal["python", "cpp", "java"]
    quizzes: List[QuizQuestionSchema]
    reviewer: List[ReviewerSectionSchema] = []
    challenges: List[CodeChallengeSchema]
