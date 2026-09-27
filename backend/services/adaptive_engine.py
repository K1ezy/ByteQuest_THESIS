from typing import Dict, Any, List
from backend.schemas.ml_schema import PredictionRequest
from backend.services.ml_engine import ml_engine

class AdaptiveSequencingEngine:
    @staticmethod
    def recommend_next_activity(
        student_id: str,
        current_stats: Dict[str, Any],
        available_activities: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Subsequent-task sequencing algorithm:
        Predicts student success probability using trained Random Forest & Logistic Regression.
        If P(Success) < 0.50 -> Intercept with foundational Socratic review.
        If P(Success) >= 0.75 -> Promote to advanced challenge tier.
        Otherwise -> Next standard practice quiz item.
        """
        pred_req = PredictionRequest(
            prior_quiz_accuracy=current_stats.get("prior_quiz_accuracy", 0.75),
            avg_solve_time_seconds=current_stats.get("avg_solve_time_seconds", 45.0),
            compilation_error_count=current_stats.get("compilation_error_count", 0),
            attempts_before_success=current_stats.get("attempts_before_success", 1),
            hints_requested_count=current_stats.get("hints_requested_count", 0),
            task_difficulty_level=current_stats.get("task_difficulty_level", 2)
        )

        pred = ml_engine.predict_success_probability(pred_req)

        if pred.scaffolding_needed:
            # Recommend Reviewer / Concept Notes Scaffolding
            target_diff = "easy"
            action_type = "reviewer"
            explanation = "ML models detected high probability of task failure. Redirecting to foundational lecture notes to reinforce key invariants."
        elif pred.random_forest_prob >= 0.75:
            target_diff = "hard"
            action_type = "challenge"
            explanation = "High predicted mastery! Advancing to high-difficulty coding challenge to test algorithmic optimization."
        else:
            target_diff = "medium"
            action_type = "quiz"
            explanation = "Balanced performance. Continuing with adaptive practice quiz."

        # Filter matching activity or fallback
        chosen = None
        for act in available_activities:
            if act.get("difficulty") == target_diff or act.get("activity_type") == action_type:
                chosen = act
                break

        if not chosen and available_activities:
            chosen = available_activities[0]

        return {
            "prediction": pred.model_dump(),
            "recommended_action": action_type,
            "target_difficulty": target_diff,
            "explanation": explanation,
            "activity": chosen
        }

adaptive_engine = AdaptiveSequencingEngine()
