"""
Comprehensive Unit Tests for AI Geometry and Exercise State Machines.
"""
import sys
import os
import time

# Add ai-service to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.geometry import calculate_angle, calculate_vertical_angle, AngleSmoother
from app.exercises.squat import SquatAnalyzer
from app.exercises.bicep_curl import BicepCurlAnalyzer
from app.exercises.pushup import PushupAnalyzer

def test_geometry_math():
    print("Testing Vector Angle Calculations...")
    # Right angle (90 degrees)
    a = [0.0, 1.0]
    b = [0.0, 0.0]
    c = [1.0, 0.0]
    ang90 = calculate_angle(a, b, c)
    assert abs(ang90 - 90.0) < 1e-4, f"Expected 90.0, got {ang90}"

    # Straight line (180 degrees)
    a_str = [0.0, -1.0]
    b_str = [0.0, 0.0]
    c_str = [0.0, 1.0]
    ang180 = calculate_angle(a_str, b_str, c_str)
    assert abs(ang180 - 180.0) < 1e-4, f"Expected 180.0, got {ang180}"

    # 45 degrees
    a_45 = [1.0, 1.0]
    b_45 = [0.0, 0.0]
    c_45 = [1.0, 0.0]
    ang45 = calculate_angle(a_45, b_45, c_45)
    assert abs(ang45 - 45.0) < 1e-4, f"Expected 45.0, got {ang45}"

    # Vertical angle
    top = [0.0, 0.0]
    bottom = [0.0, 1.0]
    vert = calculate_vertical_angle(top, bottom)
    assert abs(vert - 0.0) < 1e-4, f"Expected 0.0, got {vert}"

    print(" Geometry Mathematics PASSED")

def create_synthetic_landmarks(joint_positions):
    """Creates a full 33-landmark structure with default visibility 0.95"""
    landmarks = []
    for i in range(33):
        landmarks.append({"x": 0.5, "y": 0.5, "z": 0.0, "visibility": 0.95})
    for idx, pos in joint_positions.items():
        if isinstance(pos, (list, tuple)):
            landmarks[idx] = {
                "x": pos[0],
                "y": pos[1],
                "z": pos[2] if len(pos) > 2 else 0.0,
                "visibility": pos[3] if len(pos) > 3 else 0.95,
            }
        elif isinstance(pos, dict):
            landmarks[idx] = {
                "x": pos.get("x", 0.5),
                "y": pos.get("y", 0.5),
                "z": pos.get("z", 0.0),
                "visibility": pos.get("visibility", 0.95),
            }
    return landmarks

def test_squat_cycle():
    print("Testing Squat State Machine Cycle...")
    analyzer = SquatAnalyzer()
    analyzer.min_rep_duration = 0.0  # Instantaneous for test

    # 1. Standing posture: Hip (0.5, 0.4), Knee (0.5, 0.65), Ankle (0.5, 0.9) -> 180 deg
    standing = create_synthetic_landmarks({
        11: {"x": 0.5, "y": 0.2}, # shoulder
        23: {"x": 0.5, "y": 0.4}, # hip
        25: {"x": 0.5, "y": 0.65}, # knee
        27: {"x": 0.5, "y": 0.9}, # ankle
    })
    for _ in range(3):
        res1 = analyzer.analyze(standing)
    assert res1.stage in ["START", "STANDING"], f"Unexpected stage: {res1.stage}"
    assert res1.reps == 0

    # 2. Going down: Knee bends
    going_down = create_synthetic_landmarks({
        11: {"x": 0.5, "y": 0.3},
        23: {"x": 0.5, "y": 0.5},
        25: {"x": 0.65, "y": 0.65},
        27: {"x": 0.5, "y": 0.85},
    })
    for _ in range(3):
        res2 = analyzer.analyze(going_down)
    assert res2.stage == "GOING_DOWN", f"Expected GOING_DOWN, got {res2.stage}"

    # 3. Bottom position: Knee at right angle or below (<= 90 deg)
    bottom = create_synthetic_landmarks({
        11: {"x": 0.5, "y": 0.4},
        23: {"x": 0.45, "y": 0.65},
        25: {"x": 0.7, "y": 0.65},
        27: {"x": 0.7, "y": 0.9},
    })
    for _ in range(4):
        res3 = analyzer.analyze(bottom)
    assert res3.stage == "BOTTOM", f"Expected BOTTOM, got {res3.stage}"

    # 4. Going up
    going_up = create_synthetic_landmarks({
        11: {"x": 0.5, "y": 0.3},
        23: {"x": 0.5, "y": 0.5},
        25: {"x": 0.55, "y": 0.65},
        27: {"x": 0.5, "y": 0.85},
    })
    for _ in range(3):
        res4 = analyzer.analyze(going_up)
    assert res4.stage == "GOING_UP", f"Expected GOING_UP, got {res4.stage}"

    # 5. Return to standing: Knee > 160 deg
    for _ in range(4):
        res5 = analyzer.analyze(standing)
    assert res5.reps == 1, f"Expected 1 rep completed, got {res5.reps}"
    assert res5.stage == "STANDING"

    print(f" Squat State Machine: Cycle completed, Reps = {res5.reps}, Score = {res5.form_score}% PASSED")

def test_bicep_curl_cycle():
    print("Testing Bicep Curl State Machine Cycle...")
    analyzer = BicepCurlAnalyzer()
    analyzer.min_rep_duration = 0.0

    extended = create_synthetic_landmarks({
        11: {"x": 0.5, "y": 0.2},
        13: {"x": 0.5, "y": 0.45},
        15: {"x": 0.5, "y": 0.7},
        23: {"x": 0.5, "y": 0.6},
    })
    for _ in range(3):
        res1 = analyzer.analyze(extended)
    assert res1.reps == 0

    curling = create_synthetic_landmarks({
        11: {"x": 0.5, "y": 0.2},
        13: {"x": 0.5, "y": 0.45},
        15: {"x": 0.65, "y": 0.45},
        23: {"x": 0.5, "y": 0.6},
    })
    for _ in range(3):
        res2 = analyzer.analyze(curling)
    assert res2.stage == "CURLING"

    curled = create_synthetic_landmarks({
        11: {"x": 0.5, "y": 0.2},
        13: {"x": 0.5, "y": 0.45},
        15: {"x": 0.52, "y": 0.23},
        23: {"x": 0.5, "y": 0.6},
    })
    for _ in range(4):
        res3 = analyzer.analyze(curled)
    assert res3.stage == "FULLY_CURLED"

    returning = create_synthetic_landmarks({
        11: {"x": 0.5, "y": 0.2},
        13: {"x": 0.5, "y": 0.45},
        15: {"x": 0.6, "y": 0.55},
        23: {"x": 0.5, "y": 0.6},
    })
    for _ in range(3):
        res4 = analyzer.analyze(returning)
    assert res4.stage == "RETURNING"

    for _ in range(4):
        res5 = analyzer.analyze(extended)
    assert res5.reps == 1, f"Expected 1 completed curl, got {res5.reps}"

    print(f" Bicep Curl State Machine: Cycle completed, Reps = {res5.reps} PASSED")

def test_pushup_cycle():
    print("Testing Push-up State Machine Cycle...")
    analyzer = PushupAnalyzer()
    analyzer.min_rep_duration = 0.0

    plank_up = create_synthetic_landmarks({
        11: {"x": 0.3, "y": 0.4},
        13: {"x": 0.3, "y": 0.6},
        15: {"x": 0.3, "y": 0.8},
        23: {"x": 0.55, "y": 0.45},
        27: {"x": 0.8, "y": 0.5},
    })
    for _ in range(3):
        res1 = analyzer.analyze(plank_up)
    assert res1.reps == 0

    down = create_synthetic_landmarks({
        11: {"x": 0.3, "y": 0.55},
        13: {"x": 0.4, "y": 0.65},
        15: {"x": 0.3, "y": 0.8},
        23: {"x": 0.55, "y": 0.6},
        27: {"x": 0.8, "y": 0.65},
    })
    for _ in range(3):
        res2 = analyzer.analyze(down)
    assert res2.stage == "GOING_DOWN"

    bottom = create_synthetic_landmarks({
        11: {"x": 0.3, "y": 0.65},
        13: {"x": 0.45, "y": 0.65},
        15: {"x": 0.3, "y": 0.8},
        23: {"x": 0.55, "y": 0.7},
        27: {"x": 0.8, "y": 0.75},
    })
    for _ in range(4):
        res3 = analyzer.analyze(bottom)
    assert res3.stage == "BOTTOM"

    pushing = create_synthetic_landmarks({
        11: {"x": 0.3, "y": 0.52},
        13: {"x": 0.34, "y": 0.62},
        15: {"x": 0.3, "y": 0.8},
        23: {"x": 0.55, "y": 0.57},
        27: {"x": 0.8, "y": 0.62},
    })
    for _ in range(3):
        res4 = analyzer.analyze(pushing)
    assert res4.stage == "PUSHING_UP"

    for _ in range(4):
        res5 = analyzer.analyze(plank_up)
    assert res5.reps == 1, f"Expected 1 completed pushup, got {res5.reps}"

    print(f" Push-up State Machine: Cycle completed, Reps = {res5.reps} PASSED")

if __name__ == "__main__":
    print("=" * 60)
    print("Running AI Gym Trainer Biomechanics Verification Tests")
    print("=" * 60)
    test_geometry_math()
    test_squat_cycle()
    test_bicep_curl_cycle()
    test_pushup_cycle()
    print("=" * 60)
    print("ALL AI BIOMECHANICS & STATE MACHINE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
