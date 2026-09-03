"""
Bicep Curl movement analyzer, state machine, and form evaluator.
"""
import time
from typing import Dict, List
from .base import BaseExercise, ExerciseResult
from ..geometry import calculate_angle, AngleSmoother

class BicepCurlAnalyzer(BaseExercise):
    def __init__(self):
        super().__init__("Bicep Curl")
        self.smoother = AngleSmoother(window_size=4, alpha=0.65)
        self.reached_curl_peak: bool = False
        self.min_curl_angle: float = 180.0
        self.elbow_swing_penalty: bool = False

    def analyze(self, landmarks: List[Dict[str, float]]) -> ExerciseResult:
        if not landmarks or len(landmarks) < 33:
            return ExerciseResult(
                reps=self.reps,
                stage="NO_POSE",
                feedback="Step into camera view (upper body visible)",
                feedback_type="warning",
                angles={},
                form_score=self.form_score,
                is_visible=False,
            )

        l_shoulder = [landmarks[11]["x"], landmarks[11]["y"], landmarks[11]["z"], landmarks[11]["visibility"]]
        r_shoulder = [landmarks[12]["x"], landmarks[12]["y"], landmarks[12]["z"], landmarks[12]["visibility"]]
        l_elbow = [landmarks[13]["x"], landmarks[13]["y"], landmarks[13]["z"], landmarks[13]["visibility"]]
        r_elbow = [landmarks[14]["x"], landmarks[14]["y"], landmarks[14]["z"], landmarks[14]["visibility"]]
        l_wrist = [landmarks[15]["x"], landmarks[15]["y"], landmarks[15]["z"], landmarks[15]["visibility"]]
        r_wrist = [landmarks[16]["x"], landmarks[16]["y"], landmarks[16]["z"], landmarks[16]["visibility"]]
        l_hip = [landmarks[23]["x"], landmarks[23]["y"], landmarks[23]["z"], landmarks[23]["visibility"]]
        r_hip = [landmarks[24]["x"], landmarks[24]["y"], landmarks[24]["z"], landmarks[24]["visibility"]]

        # Select arm with higher confidence
        l_vis = min(l_shoulder[3], l_elbow[3], l_wrist[3])
        r_vis = min(r_shoulder[3], r_elbow[3], r_wrist[3])

        if l_vis >= r_vis:
            shoulder, elbow, wrist, hip = l_shoulder, l_elbow, l_wrist, l_hip
            side = "Left"
        else:
            shoulder, elbow, wrist, hip = r_shoulder, r_elbow, r_wrist, r_hip
            side = "Right"

        if min(shoulder[3], elbow[3], wrist[3]) < 0.5:
            return ExerciseResult(
                reps=self.reps,
                stage="LOW_VISIBILITY",
                feedback="Keep your shoulder, elbow, and wrist clearly visible",
                feedback_type="warning",
                angles={},
                form_score=self.form_score,
                is_visible=False,
            )

        raw_elbow_angle = calculate_angle(shoulder, elbow, wrist)
        raw_upper_arm_angle = calculate_angle(hip, shoulder, elbow)

        elbow_angle = self.smoother.smooth(f"{side}_elbow", raw_elbow_angle)
        upper_arm_angle = self.smoother.smooth(f"{side}_upper_arm", raw_upper_arm_angle)

        rep_just_completed = False
        feedback = "Good Form"
        feedback_type = "good"
        now = time.time()

        # State Machine Transitions
        # Extended: > 155°
        # Curling: 50° < angle <= 155°
        # Curled: <= 45°
        # Returning: angle increasing towards 155°

        if self.stage in ["START", "ARM_EXTENDED"]:
            if elbow_angle > 150:
                self.stage = "ARM_EXTENDED"
                feedback = "Ready - Curl upward"
                feedback_type = "info"
            elif elbow_angle <= 145:
                self.stage = "CURLING"
                self.rep_start_time = now
                self.reached_curl_peak = False
                self.min_curl_angle = elbow_angle
                self.elbow_swing_penalty = False

        elif self.stage == "CURLING":
            feedback = "Curling up..."
            feedback_type = "info"
            if elbow_angle < self.min_curl_angle:
                self.min_curl_angle = elbow_angle

            if elbow_angle <= 48:
                self.stage = "FULLY_CURLED"
                self.reached_curl_peak = True
                feedback = "Peak contraction! Lower with control"
                feedback_type = "good"
            elif elbow_angle > 130 and (now - self.rep_start_time) > 0.6:
                if not self.reached_curl_peak:
                    feedback = "Curl higher! Bring wrist closer to shoulder"
                    feedback_type = "warning"
                    self.bad_form_frames += 1
                self.stage = "ARM_EXTENDED"

        elif self.stage == "FULLY_CURLED":
            if elbow_angle > 60:
                self.stage = "RETURNING"
                feedback = "Lower arm slowly and controlled"
                feedback_type = "info"

        elif self.stage == "RETURNING":
            if elbow_angle > 150:
                duration = now - self.rep_start_time
                if duration >= self.min_rep_duration:
                    self.reps += 1
                    rep_just_completed = True
                    self.last_rep_time = now
                    
                    if self.reached_curl_peak and not self.elbow_swing_penalty:
                        feedback = f"Clean Curl #{self.reps}! Full range of motion"
                        feedback_type = "good"
                        self.good_form_frames += 1
                    else:
                        feedback = f"Rep #{self.reps} finished! Lock elbows by your side"
                        feedback_type = "warning"
                
                self.stage = "ARM_EXTENDED"
                self.reached_curl_peak = False

        # Posture: detect excessive upper arm swinging (elbow drift)
        if upper_arm_angle > 40 and self.stage in ["CURLING", "FULLY_CURLED"]:
            feedback = "Keep elbows pinned by your ribs! Don't swing shoulders"
            feedback_type = "warning"
            self.elbow_swing_penalty = True
            self.bad_form_frames += 1

        total_frames = self.good_form_frames + self.bad_form_frames
        if total_frames > 0:
            score = int((self.good_form_frames / total_frames) * 100)
            self.form_score = max(55, min(100, score))
        else:
            self.form_score = 96

        return ExerciseResult(
            reps=self.reps,
            stage=self.stage,
            feedback=feedback,
            feedback_type=feedback_type,
            angles={
                "elbow": elbow_angle,
                "upper_arm": upper_arm_angle,
            },
            form_score=self.form_score,
            is_visible=True,
            rep_just_completed=rep_just_completed,
            debug_metrics={"side": side, "peak_angle": self.min_curl_angle},
        )
