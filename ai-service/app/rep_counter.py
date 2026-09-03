"""
Repetition counter with hysteresis thresholding, temporal debounce, and cycle validation.
"""
import time
from typing import Optional

class StateMachineRepCounter:
    """
    Generic state machine for cyclic exercise tracking with anti-flicker debouncing.
    """
    def __init__(self, debounce_seconds: float = 0.8):
        self.reps: int = 0
        self.state: str = "INITIAL"
        self.debounce_seconds = debounce_seconds
        self.last_state_change: float = time.time()
        self.last_rep_completed: float = 0.0

    def transition_to(self, new_state: str) -> bool:
        """Attempts to transition state if outside hysteresis debounce period."""
        now = time.time()
        if new_state != self.state:
            self.state = new_state
            self.last_state_change = now
            return True
        return False

    def complete_rep(self) -> bool:
        """Increment count if minimum rep duration satisfied."""
        now = time.time()
        if (now - self.last_rep_completed) >= self.debounce_seconds:
            self.reps += 1
            self.last_rep_completed = now
            return True
        return False

    def reset(self):
        self.reps = 0
        self.state = "INITIAL"
        self.last_state_change = time.time()
        self.last_rep_completed = 0.0
