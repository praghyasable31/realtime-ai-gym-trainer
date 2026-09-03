"""
Base class and data contracts for all exercise analyzers.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import time

@dataclass
class ExerciseResult:
    reps: int
    stage: str
    feedback: str
    feedback_type: str  # "good", "warning", "info", "error"
    angles: Dict[str, float]
    form_score: int  # 0 to 100
    is_visible: bool
    rep_just_completed: bool = False
    rep_time_seconds: float = 0.0
    debug_metrics: Dict[str, float] = field(default_factory=dict)

class BaseExercise(ABC):
    """
    Abstract exercise analyzer enforcing uniform interface for
    pose detection, state machine progression, rep debouncing, and form auditing.
    """
    def __init__(self, name: str):
        self.name = name
        self.reps: int = 0
        self.stage: str = "START"
        self.form_score: int = 100
        self.last_rep_time: float = time.time()
        self.rep_start_time: float = time.time()
        self.min_rep_duration: float = 1.0  # seconds to avoid false rapid spikes
        self.bad_form_frames: int = 0
        self.good_form_frames: int = 0

    @abstractmethod
    def analyze(self, landmarks: List[Dict[str, float]]) -> ExerciseResult:
        """Process landmarks, evaluate angles, advance state machine, compute feedback."""
        pass

    def reset(self):
        """Reset exercise state for a fresh session."""
        self.reps = 0
        self.stage = "START"
        self.form_score = 100
        self.last_rep_time = time.time()
        self.rep_start_time = time.time()
        self.bad_form_frames = 0
        self.good_form_frames = 0
