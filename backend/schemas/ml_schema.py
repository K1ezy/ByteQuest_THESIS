from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class StudentFeatureVector(BaseModel):
    student_id: str
    task_id: str
    language: str
    prior_quiz_accuracy: float   # 0.0 to 1.0
    avg_solve_time_seconds: float
    compilation_error_count: int
    attempts_before_success: int
    hints_requested_count: int
    task_difficulty_level: int   # 1=Easy, 2=Medium, 3=Hard
    target_task_success: int     # Ground Truth: 1=Passed, 0=Failed

class ConfusionMatrixSchema(BaseModel):
    true_positive: int
    false_positive: int
    false_negative: int
    true_negative: int

class ModelMetrics(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    training_time_ms: float
    confusion_matrix: ConfusionMatrixSchema
    feature_importances: Optional[Dict[str, float]] = None

class ModelComparisonResponse(BaseModel):
    dataset_size: int
    train_size: int
    test_size: int
    logistic_regression: ModelMetrics
    random_forest: ModelMetrics
    recommended_model: str
    rationale: str

class PredictionRequest(BaseModel):
    prior_quiz_accuracy: float
    avg_solve_time_seconds: float
    compilation_error_count: int
    attempts_before_success: int = 1
    hints_requested_count: int
    task_difficulty_level: int

class PredictionResponse(BaseModel):
    logistic_regression_prob: float
    random_forest_prob: float
    success_probability: float
    predicted_success: bool
    risk_level: str # Low, Moderate, High
    pedagogical_recommendation: str
    scaffolding_needed: bool
