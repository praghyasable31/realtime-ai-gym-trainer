"""
Squat movement analyzer, state machine, and form evaluator.
"""
import time
from typing import Dict, List
from .base import BaseExercise, ExerciseResult
from ..geometry import calculate_angle, calculate_vertical_angle, AngleSmoother

class SquatAnalyzer(BaseExercise):
    def __init__(self):
        super().__init__("Squat")
        self.smoother = AngleSmoother(window_size=4, alpha=0.65)
        self.reached_bottom: bool = False
        self.max_depth_angle: float = 180.0
        self.torso_penalty: bool = False

    def analyze(self, landmarks: List[Dict[str, float]]) -> ExerciseResult:
        if not landmarks or len(landmarks) < 33:
            return ExerciseResult(
                reps=self.reps,
                stage="NO_POSE",
                feedback="Step into camera view (full body)",
                feedback_type="warning",
                angles={},
                form_score=self.form_score,
                is_visible=False,
            )

        # Landmark points
        l_shoulder = [landmarks[11]["x"], landmarks[11]["y"], landmarks[11]["z"], landmarks[11]["visibility"]]
        r_shoulder = [landmarks[12]["x"], landmarks[12]["y"], landmarks[12]["z"], landmarks[12]["visibility"]]
        l_hip = [landmarks[23]["x"], landmarks[23]["y"], landmarks[23]["z"], landmarks[23]["visibility"]]
        r_hip = [landmarks[24]["x"], landmarks[24]["y"], landmarks[24]["z"], landmarks[24]["visibility"]]
        l_knee = [landmarks[25]["x"], landmarks[25]["y"], landmarks[25]["z"], landmarks[25]["visibility"]]
        r_knee = [landmarks[26]["x"], landmarks[26]["y"], landmarks[26]["z"], landmarks[26]["visibility"]]
        l_ankle = [landmarks[27]["x"], landmarks[27]["y"], landmarks[27]["z"], landmarks[27]["visibility"]]
        r_ankle = [landmarks[28]["x"], landmarks[28]["y"], landmarks[28]["z"], landmarks[28]["visibility"]]

        # Visibility evaluation: pick side with best confidence
        l_vis = min(l_hip[3], l_knee[3], l_ankle[3])
        r_vis = min(r_hip[3], r_knee[3], r_ankle[3])

        if l_vis >= r_vis:
            hip, knee, ankle, shoulder = l_hip, l_knee, l_ankle, l_shoulder
            side = "Left"
        else:
            hip, knee, ankle, shoulder = r_hip, r_knee, r_ankle, r_shoulder
            side = "Right"

        if min(hip[3], knee[3], ankle[3]) < 0.5:
            return ExerciseResult(
                reps=self.reps,
                stage="LOW_VISIBILITY",
                feedback="Ensure hips, knees, and ankles are clearly visible",
                feedback_type="warning",
                angles={},
                form_score=self.form_score,
                is_visible=False,
            )

        # Raw angles
        raw_knee_angle = calculate_angle(hip, knee, ankle)
        raw_hip_angle = calculate_angle(shoulder, hip, knee)
        raw_torso_tilt = calculate_vertical_angle(shoulder, hip)

        # Smoothed angles
        knee_angle = self.smoother.smooth(f"{side}_knee", raw_knee_angle)
        hip_angle = self.smoother.smooth(f"{side}_hip", raw_hip_angle)
        torso_tilt = self.smoother.smooth(f"{side}_torso", raw_torso_tilt)

        rep_just_completed = False
        feedback = "Good Form"
        feedback_type = "good"
        now = time.time()

        # State Machine Transitions
        # Knee angles:
        # Standing: > 160
        # Going down: 100 < angle <= 160
        # Bottom: <= 100 (parallel or below parallel)
        # Going up: angle increasing after bottom

        if self.stage in ["START", "STANDING"]:
            if knee_angle > 160:
                self.stage = "STANDING"
                feedback = "Ready - Begin squat"
                feedback_type = "info"
            elif knee_angle <= 155:
                self.stage = "GOING_DOWN"
                self.rep_start_time = now
                self.reached_bottom = False
                self.max_depth_angle = knee_angle
                self.torso_penalty = False

        elif self.stage == "GOING_DOWN":
            feedback = "Squatting down..."
            feedback_type = "info"
            if knee_angle < self.max_depth_angle:
                self.max_depth_angle = knee_angle

            if knee_angle <= 100:
                self.stage = "BOTTOM"
                self.reached_bottom = True
                feedback = "Great Depth! Now drive up"
                feedback_type = "good"
            elif knee_angle > 145 and (now - self.rep_start_time) > 0.5:
                # User aborted without hitting bottom
                if not self.reached_bottom:
                    feedback = "Go Lower! Aim for thighs parallel to floor"
                    feedback_type = "warning"
                    self.bad_form_frames += 1
                self.stage = "STANDING"

        elif self.stage == "BOTTOM":
            if knee_angle > 105:
                self.stage = "GOING_UP"
                feedback = "Push through heels to the top"
                feedback_type = "info"

        elif self.stage == "GOING_UP":
            if knee_angle > 160:
                # Rep completion check
                cycle_duration = now - self.rep_start_time
                if cycle_duration >= self.min_rep_duration:
                    self.reps += 1
                    rep_just_completed = True
                    self.last_rep_time = now
                    
                    if self.reached_bottom and not self.torso_penalty:
                        feedback = f"Excellent Rep #{self.reps}! Full depth achieved"
                        feedback_type = "good"
                        self.good_form_frames += 1
                    elif not self.reached_bottom:
                        feedback = f"Rep #{self.reps} counted, but remember to squat deeper"
                        feedback_type = "warning"
                    else:
                        feedback = f"Good Rep #{self.reps}! Keep chest proud"
                        feedback_type = "good"
                
                self.stage = "STANDING"
                self.reached_bottom = False

        # Continuous Form Evaluation
        if torso_tilt > 45 and self.stage in ["GOING_DOWN", "BOTTOM", "GOING_UP"]:
            feedback = "Keep your back straight! Avoid leaning forward"
            feedback_type = "warning"
            self.torso_penalty = True
            self.bad_form_frames += 1

        # Calculate Form Score percentage
        total_eval_frames = self.good_form_frames + self.bad_form_frames
        if total_eval_frames > 0:
            raw_score = int((self.good_form_frames / total_eval_frames) * 100)
            self.form_score = max(50, min(100, raw_score))
        else:
            self.form_score = 95

        return ExerciseResult(
            reps=self.reps,
            stage=self.stage,
            feedback=feedback,
            feedback_type=feedback_type,
            angles={
                "knee": knee_angle,
                "hip": hip_angle,
                "torso_tilt": torso_tilt,
            },
            form_score=self.form_score,
            is_visible=True,
            rep_just_completed=rep_just_completed,
            debug_metrics={"side": side, "depth": self.max_depth_angle},
        )
