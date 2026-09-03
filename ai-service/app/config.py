"""
Global configurations and constants for the AI Pose Pipeline.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class PoseConfig:
    MIN_DETECTION_CONFIDENCE: float = 0.5
    MIN_TRACKING_CONFIDENCE: float = 0.5
    MODEL_COMPLEXITY: int = 1  # 0: Fast (lite), 1: Balanced (full), 2: Heavy
    SMOOTH_LANDMARKS: bool = True
    STATIC_IMAGE_MODE: bool = False

    # Joint Visibility Threshold (landmarks below this are deemed untrusted/occluded)
    VISIBILITY_THRESHOLD: float = 0.55

    # Moving average window size for angle smoothing
    ANGLE_SMOOTHING_WINDOW: int = 5

CONFIG = PoseConfig()
