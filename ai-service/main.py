"""
FastAPI AI Service Entrypoint
Provides REST endpoints and WebSocket channels for real-time video stream pose analysis.
"""
import base64
import json
import logging
import time
from typing import Optional
import cv2
import numpy as np
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.detector import PoseDetector
from app.exercises import get_exercise_analyzer, BaseExercise

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_gym_service")

app = FastAPI(
    title="Real-Time AI Gym Trainer Service",
    description="MediaPipe Pose detection, angle calculation, and exercise state machines",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pose detector instance
pose_detector = PoseDetector()

class AnalyzeFrameRequest(BaseModel):
    image: str  # base64 data URL or raw base64 string
    exercise: str = "squat"

def decode_base64_image(base64_string: str) -> Optional[np.ndarray]:
    """Decodes a base64 encoded image string into a OpenCV BGR numpy array."""
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        image_bytes = base64.b64decode(base64_string)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        logger.error(f"Image decode error: {e}")
        return None

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Gym Trainer Computer Vision Engine",
        "mediapipe": "active",
        "supported_exercises": ["squat", "bicep_curl", "pushup"],
        "timestamp": time.time(),
    }

@app.post("/analyze-frame")
def analyze_frame_http(req: AnalyzeFrameRequest):
    """
    HTTP fallback endpoint for processing single frames without persistent WebSocket.
    """
    frame = decode_base64_image(req.image)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    # Convert BGR to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    landmarks = pose_detector.process_frame(frame_rgb)

    try:
        analyzer = get_exercise_analyzer(req.exercise)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not landmarks:
        return {
            "success": True,
            "detected": False,
            "reps": 0,
            "stage": "NO_PERSON",
            "feedback": "No person detected in frame",
            "feedback_type": "warning",
            "angles": {},
            "form_score": 100,
            "landmarks": [],
        }

    res = analyzer.analyze(landmarks)
    return {
        "success": True,
        "detected": True,
        "reps": res.reps,
        "stage": res.stage,
        "feedback": res.feedback,
        "feedback_type": res.feedback_type,
        "angles": res.angles,
        "form_score": res.form_score,
        "is_visible": res.is_visible,
        "rep_just_completed": res.rep_just_completed,
        "landmarks": landmarks,
    }

@app.websocket("/ws/pose/{exercise}")
async def pose_websocket(websocket: WebSocket, exercise: str):
    """
    Ultra-low latency bidirectional WebSocket channel.
    Accepts video frames and streams back landmarks, state machine status, reps, and feedback.
    """
    await websocket.accept()
    logger.info(f"WebSocket connected for exercise: {exercise}")

    try:
        analyzer: BaseExercise = get_exercise_analyzer(exercise)
    except ValueError as e:
        await websocket.send_json({"error": str(e)})
        await websocket.close()
        return

    frame_count = 0
    start_time = time.time()

    try:
        while True:
            # Receive frame data (either JSON with base64 string or raw text)
            data = await websocket.receive_text()
            t0 = time.time()
            
            # Support either plain base64 string or JSON envelope
            if data.startswith("{"):
                payload = json.loads(data)
                img_data = payload.get("image", "")
                # Support resetting session in-flight
                if payload.get("action") == "reset":
                    analyzer.reset()
                    await websocket.send_json({"status": "reset_acknowledged", "reps": 0})
                    continue
            else:
                img_data = data

            if not img_data:
                continue

            frame = decode_base64_image(img_data)
            if frame is None:
                await websocket.send_json({
                    "detected": False,
                    "error": "Failed to decode frame",
                })
                continue

            frame_count += 1
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            landmarks = pose_detector.process_frame(frame_rgb)

            if not landmarks:
                await websocket.send_json({
                    "detected": False,
                    "reps": analyzer.reps,
                    "stage": "SEARCHING",
                    "feedback": "Step into camera frame",
                    "feedback_type": "warning",
                    "angles": {},
                    "form_score": analyzer.form_score,
                    "landmarks": [],
                    "latency_ms": round((time.time() - t0) * 1000, 1),
                })
                continue

            # Run exercise biomechanics analysis
            res = analyzer.analyze(landmarks)
            latency_ms = round((time.time() - t0) * 1000, 1)

            # Compact response containing pose landmarks and state machine metrics
            await websocket.send_json({
                "detected": True,
                "exercise": exercise,
                "reps": res.reps,
                "stage": res.stage,
                "feedback": res.feedback,
                "feedback_type": res.feedback_type,
                "angles": res.angles,
                "form_score": res.form_score,
                "is_visible": res.is_visible,
                "rep_just_completed": res.rep_just_completed,
                "landmarks": landmarks,
                "latency_ms": latency_ms,
            })

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for exercise: {exercise}")
    except Exception as e:
        logger.error(f"WebSocket processing error: {e}")
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
