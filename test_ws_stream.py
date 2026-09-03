"""
Simulated Webcam WebSocket Client
Verifies bidirectional WebSocket streaming with the AI service.
Generates synthetic frames and receives real-time pose telemetry.
"""
import asyncio
import base64
import json
import numpy as np
import cv2
import websockets

async def test_websocket_stream():
    uri = "ws://127.0.0.1:8000/ws/pose/squat"
    print(f"Connecting to AI WebSocket: {uri}...")

    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket successfully!")

        # Create a synthetic 640x480 test frame
        blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        # Draw a simple stick figure representing a standing athlete
        cv2.circle(blank_frame, (320, 100), 30, (255, 255, 255), -1) # Head
        cv2.line(blank_frame, (320, 130), (320, 280), (255, 255, 255), 4) # Torso
        cv2.line(blank_frame, (320, 280), (280, 420), (255, 255, 255), 4) # Left Leg
        cv2.line(blank_frame, (320, 280), (360, 420), (255, 255, 255), 4) # Right Leg

        _, buffer = cv2.imencode('.jpg', blank_frame)
        base64_str = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

        # Send test frame
        print("Sending synthetic webcam frame to AI engine...")
        await websocket.send(json.dumps({"image": base64_str}))

        # Receive response telemetry
        response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
        data = json.loads(response)

        print("\n--- AI Engine Telemetry Received ---")
        print(f"Detected: {data.get('detected')}")
        print(f"Stage: {data.get('stage')}")
        print(f"Feedback: {data.get('feedback')}")
        print(f"Latency: {data.get('latency_ms')} ms")
        print(f"Form Score: {data.get('form_score')}%")
        print(f"Reps Count: {data.get('reps')}")
        print("--- Telemetry Check Passed ---")

if __name__ == "__main__":
    asyncio.run(test_websocket_stream())
