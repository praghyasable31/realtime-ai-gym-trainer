"""
Feedback generation and audio coaching phrase mapping.
"""
from typing import Dict, Optional

class FeedbackGenerator:
    """
    Translates raw state changes and angle deviations into encouraging,
    actionable fitness cues designed for screen readouts and text-to-speech.
    """
    SQUAT_CUES = {
        "depth_warning": "Go lower - bend your knees until thighs are parallel!",
        "back_warning": "Keep your back straight and chest lifted!",
        "rep_good": "Great depth and form! Good repetition.",
        "bottom_reached": "Bottom reached, now explode up!",
    }

    CURL_CUES = {
        "range_warning": "Fully extend your arms at the bottom!",
        "swing_warning": "Keep your elbows still - don't swing your shoulders!",
        "peak_curl": "Squeeze your biceps at the peak!",
        "rep_good": "Controlled curl! Rep logged.",
    }

    PUSHUP_CUES = {
        "depth_warning": "Lower your chest closer to the floor!",
        "plank_warning": "Lock your core - keep your hips and back aligned!",
        "bottom_reached": "Chest down, push the floor away!",
        "rep_good": "Clean pushup! Strong plank.",
    }

    @classmethod
    def get_coach_cue(cls, exercise: str, key: str) -> str:
        cue_map = {
            "squat": cls.SQUAT_CUES,
            "bicep_curl": cls.CURL_CUES,
            "pushup": cls.PUSHUP_CUES,
        }
        return cue_map.get(exercise, {}).get(key, "Keep going!")
