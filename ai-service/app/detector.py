"""
Pose Detector module using MediaPipe Pose solution.
"""
from typing import Dict, List, Optional, Tuple
import cv2
import mediapipe as mp
import numpy as np
from .config import CONFIG

class PoseDetector:
    """
    Encapsulates MediaPipe Pose estimation, providing raw landmark extraction,
    normalized coordinates, and visibility metrics.
    """
    # Canonical MediaPipe Pose Landmark Indices
    LANDMARKS = {
        "NOSE": 0,
        "LEFT_EYE_INNER": 1,
        "LEFT_EYE": 2,
        "LEFT_EYE_OUTER": 3,
        "RIGHT_EYE_INNER": 4,
        "RIGHT_EYE": 5,
        "RIGHT_EYE_OUTER": 6,
        "LEFT_EAR": 7,
        "RIGHT_EAR": 8,
        "MOUTH_LEFT": 9,
        "MOUTH_RIGHT": 10,
        "LEFT_SHOULDER": 11,
        "RIGHT_SHOULDER": 12,
        "LEFT_ELBOW": 13,
        "RIGHT_ELBOW": 14,
        "LEFT_WRIST": 15,
        "RIGHT_WRIST": 16,
        "LEFT_PINKY": 17,
        "RIGHT_PINKY": 18,
        "LEFT_INDEX": 19,
        "RIGHT_INDEX": 20,
        "LEFT_THUMB": 21,
        "RIGHT_THUMB": 22,
        "LEFT_HIP": 23,
        "RIGHT_HIP": 24,
        "LEFT_KNEE": 25,
        "RIGHT_KNEE": 26,
        "LEFT_ANKLE": 27,
        "RIGHT_ANKLE": 28,
        "LEFT_HEEL": 29,
        "RIGHT_HEEL": 30,
        "LEFT_FOOT_INDEX": 31,
        "RIGHT_FOOT_INDEX": 32,
    }

    def __init__(
        self,
        min_detection_confidence: float = CONFIG.MIN_DETECTION_CONFIDENCE,
        min_tracking_confidence: float = CONFIG.MIN_TRACKING_CONFIDENCE,
        model_complexity: int = CONFIG.MODEL_COMPLEXITY,
    ):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=model_complexity,
            smooth_landmarks=True,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    def process_frame(self, frame_rgb: np.ndarray) -> Optional[List[Dict[str, float]]]:
        """
        Processes a single RGB image frame and extracts 33 pose landmarks.
        Returns a list of dicts with {'x', 'y', 'z', 'visibility'} normalized to [0, 1].
        """
        results = self.pose.process(frame_rgb)
        if not results.pose_landmarks:
            return None

        landmarks = []
        for lm in results.pose_landmarks.landmark:
            landmarks.append({
                "x": float(lm.x),
                "y": float(lm.y),
                "z": float(lm.z),
                "visibility": float(lm.visibility),
            })
        return landmarks

    def get_joint(self, landmarks: List[Dict[str, float]], name: str) -> Optional[List[float]]:
        """
        Returns [x, y, z, visibility] for a named landmark.
        """
        idx = self.LANDMARKS.get(name)
        if idx is None or idx >= len(landmarks):
            return None
        lm = landmarks[idx]
        return [lm["x"], lm["y"], lm["z"], lm["visibility"]]

    def is_visible(self, landmarks: List[Dict[str, float]], joint_names: List[str]) -> bool:
        """
        Validates if all required joints for an exercise meet the minimum visibility threshold.
        """
        for name in joint_names:
            joint = self.get_joint(landmarks, name)
            if not joint or joint[3] < CONFIG.VISIBILITY_THRESHOLD:
                return False
        return True

    def close(self):
        """Release MediaPipe resources"""
        if self.pose:
            self.pose.close()
