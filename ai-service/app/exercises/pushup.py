"""
Push-up movement analyzer, state machine, and plank form evaluator.
"""
import time
from typing import Dict, List
from .base import BaseExercise, ExerciseResult
from ..geometry import calculate_angle, AngleSmoother

class PushupAnalyzer(BaseExercise):
    def __init__(self):
        super().__init__("Push-up")
        self.smoother = AngleSmoother(window_size=4, alpha=0.65)
        self.reached_bottom: bool = False
        self.min_elbow_angle: float = 180.0
        self.hip_sag_penalty: bool = False

    def analyze(self, landmarks: List[Dict[str, float]]) -> ExerciseResult:
        if not landmarks or len(landmarks) < 33:
            return ExerciseResult(
                reps=self.reps,
                stage="NO_POSE",
                feedback="Step into camera view (horizontal side view recommended)",
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
        l_ankle = [landmarks[27]["x"], landmarks[27]["y"], landmarks[27]["z"], landmarks[27]["visibility"]]
        r_ankle = [landmarks[28]["x"], landmarks[28]["y"], landmarks[28]["z"], landmarks[28]["visibility"]]

        # Select side with highest overall visibility
        l_vis = min(l_shoulder[3], l_elbow[3], l_hip[3])
        r_vis = min(r_shoulder[3], r_elbow[3], r_hip[3])

        if l_vis >= r_vis:
            shoulder, elbow, wrist, hip, ankle = l_shoulder, l_elbow, l_wrist, l_hip, l_ankle
            side = "Left"
        else:
            shoulder, elbow, wrist, hip, ankle = r_shoulder, r_elbow, r_wrist, r_hip, r_ankle
            side = "Right"

        if min(shoulder[3], elbow[3], hip[3]) < 0.45:
            return ExerciseResult(
                reps=self.reps,
                stage="LOW_VISIBILITY",
                feedback="Ensure shoulder, elbow, and hip are clearly visible",
                feedback_type="warning",
                angles={},
                form_score=self.form_score,
                is_visible=False,
            )

        raw_elbow = calculate_angle(shoulder, elbow, wrist)
        raw_body_line = calculate_angle(shoulder, hip, ankle)

        elbow_angle = self.smoother.smooth(f"{side}_elbow", raw_elbow)
        body_line = self.smoother.smooth(f"{side}_plank", raw_body_line)

        rep_just_completed = False
        feedback = "Good Form"
        feedback_type = "good"
        now = time.time()

        # State Machine Transitions
        # Plank / Up: elbow > 155°
        # Going Down: 90° < elbow <= 155°
        # Bottom: elbow <= 90°
        # Pushing Up: elbow increasing from bottom

        if self.stage in ["START", "UP_PLANK"]:
            if elbow_angle > 150:
                self.stage = "UP_PLANK"
                feedback = "Plank held - Lower chest to floor"
                feedback_type = "info"
            elif elbow_angle <= 145:
                self.stage = "GOING_DOWN"
                self.rep_start_time = now
                self.reached_bottom = False
                self.min_elbow_angle = elbow_angle
                self.hip_sag_penalty = False

        elif self.stage == "GOING_DOWN":
            feedback = "Lowering chest..."
            feedback_type = "info"
            if elbow_angle < self.min_elbow_angle:
                self.min_elbow_angle = elbow_angle

            if elbow_angle <= 90:
                self.stage = "BOTTOM"
                self.reached_bottom = True
                feedback = "Chest down! Drive up through palms"
                feedback_type = "good"
            elif elbow_angle > 135 and (now - self.rep_start_time) > 0.6:
                if not self.reached_bottom:
                    feedback = "Go Lower! Aim for 90-degree elbows"
                    feedback_type = "warning"
                    self.bad_form_frames += 1
                self.stage = "UP_PLANK"

        elif self.stage == "BOTTOM":
            if elbow_angle > 95:
                self.stage = "PUSHING_UP"
                feedback = "Lock out at top"
                feedback_type = "info"

        elif self.stage == "PUSHING_UP":
            if elbow_angle > 150:
                duration = now - self.rep_start_time
                if duration >= self.min_rep_duration:
                    self.reps += 1
                    rep_just_completed = True
                    self.last_rep_time = now
                    
                    if self.reached_bottom and not self.hip_sag_penalty:
                        feedback = f"Solid Push-up #{self.reps}! Strong plank maintained"
                        feedback_type = "good"
                        self.good_form_frames += 1
                    else:
                        feedback = f"Rep #{self.reps} logged! Keep core tight"
                        feedback_type = "warning"
                
                self.stage = "UP_PLANK"
                self.reached_bottom = False

        # Posture checking: Straight plank body line (should be ~160° - 180°)
        if body_line < 150 and self.stage in ["GOING_DOWN", "BOTTOM", "PUSHING_UP"]:
            feedback = "Keep your body straight! Don't let hips sag or pike"
            feedback_type = "warning"
            self.hip_sag_penalty = True
            self.bad_form_frames += 1

        total_frames = self.good_form_frames + self.bad_form_frames
        if total_frames > 0:
            score = int((self.good_form_frames / total_frames) * 100)
            self.form_score = max(50, min(100, score))
        else:
            self.form_score = 94

        return ExerciseResult(
            reps=self.reps,
            stage=self.stage,
            feedback=feedback,
            feedback_type=feedback_type,
            angles={
                "elbow": elbow_angle,
                "body_line": body_line,
            },
            form_score=self.form_score,
            is_visible=True,
            rep_just_completed=rep_just_completed,
            debug_metrics={"side": side, "depth_elbow": self.min_elbow_angle},
        )
