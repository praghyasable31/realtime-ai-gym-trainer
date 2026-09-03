from .base import BaseExercise, ExerciseResult
from .squat import SquatAnalyzer
from .bicep_curl import BicepCurlAnalyzer
from .pushup import PushupAnalyzer

def get_exercise_analyzer(exercise_name: str) -> BaseExercise:
    exercise_lower = exercise_name.lower().replace("-", "_").replace(" ", "_")
    if exercise_lower in ["squat", "squats"]:
        return SquatAnalyzer()
    elif exercise_lower in ["bicep_curl", "bicep_curls", "curl", "curls"]:
        return BicepCurlAnalyzer()
    elif exercise_lower in ["pushup", "pushups", "push_up", "push_ups"]:
        return PushupAnalyzer()
    else:
        raise ValueError(f"Unsupported exercise: '{exercise_name}'. Supported: squat, bicep_curl, pushup")
