# 01. System Architecture & Design

## 1. Overview

The **Real-Time AI Gym Trainer** is an intelligent, full-stack fitness assistant engineered to provide automated repetition tracking and biomechanical posture auditing during resistance and bodyweight exercises.

The system decouples computation into three specialized tiers:
1. **Presentation & Capture Layer (Frontend)**: React 18, Vite, Tailwind CSS, HTML5 Canvas 2D overlay, and the Web Speech API.
2. **Computer Vision & Kinematics Engine (AI Service)**: Python 3.11, FastAPI, WebSocket streaming, MediaPipe Pose (33 3D landmarks), OpenCV, and NumPy.
3. **Data Management & Authentication Tier (Backend)**: Node.js, Express.js, MongoDB (Mongoose ODM), JWT token authentication, and bcryptjs.

---

## 2. Architecture Diagram

```mermaid
flowchart TB
    subgraph ClientLayer [Client Tier: React + Vite SPA]
        Webcam[Webcam Video Stream<br/>HTML5 MediaDevices]
        OverlayCanvas[Skeleton Overlay Canvas<br/>requestAnimationFrame 60fps]
        AudioCoach[Audio Coach<br/>Web Speech API]
        UI[Interactive HUD & Dashboard<br/>Tailwind CSS + Recharts]
    end

    subgraph AIServiceLayer [AI Tier: Python FastAPI Service]
        WSHandler[WebSocket Frame Receiver<br/>ws://127.0.0.1:8000/ws/pose]
        CVDecoder[OpenCV Base64 Decoder & Frame Resizer]
        MPPose[MediaPipe Pose Estimator<br/>33 3D Landmark Points]
        GeoMath[Vector Geometry Engine<br/>Dot Products & EMA Smoothing]
        StateMachine[Exercise State Machine<br/>Squat / Curl / Pushup]
        FormAuditor[Form Auditor & Score Evaluator<br/>Rule-Based Kinematics]
    end

    subgraph BackendLayer [Backend Tier: Node.js Express REST API]
        ExpressRouter[Express API Gateway<br/>http://127.0.0.1:5000/api]
        AuthGuard[JWT Auth Middleware & Bcrypt]
        WorkoutCtrl[Workout Controller & Aggregation Pipeline]
    end

    subgraph StorageLayer [Persistence Tier]
        Mongo[(MongoDB Database<br/>Collections: users, workouts)]
    end

    %% Data Flow
    Webcam -->|Base64 JPEG Frames| WSHandler
    WSHandler --> CVDecoder
    CVDecoder --> MPPose
    MPPose --> GeoMath
    GeoMath --> StateMachine
    StateMachine --> FormAuditor
    FormAuditor -->|Telemetry JSON: Landmarks, Angles, Reps, Feedback| WSHandler
    WSHandler -->|Real-time WebSocket Stream| OverlayCanvas
    WSHandler -->|Voice Cues| AudioCoach
    WSHandler -->|Rep Counts & Metrics| UI

    UI -->|REST: Save Completed Session| ExpressRouter
    UI -->|REST: Auth & Dashboard Analytics| ExpressRouter
    ExpressRouter --> AuthGuard
    AuthGuard --> WorkoutCtrl
    WorkoutCtrl --> Mongo
```

---

## 3. Component Responsibilities

### 3.1 Frontend (Presentation & Capture)
- **Webcam Ingestion**: Accesses user webcam at 30 FPS through `navigator.mediaDevices.getUserMedia`.
- **Canvas Rendering**: Renders glowing neon skeletal connectors and joint markers at 60 FPS over the video feed using hardware-accelerated Canvas 2D.
- **Audio Coach**: Converts textual biomechanics cues into synthesized speech using the browser's native `SpeechSynthesis` engine with priority queue debouncing.
- **Analytics Visualization**: Renders interactive progress charts (daily repetition volume, exercise distribution) powered by Recharts.

### 3.2 AI Computer Vision Engine
- **Decoupled WebSocket Service**: Operates on port `8000` via FastAPI/Uvicorn, ensuring camera frame processing does not block the backend database or REST APIs.
- **MediaPipe Pose Detection**: Identifies 33 bodily landmarks in normalized 3D space $(X, Y, Z)$ along with visibility confidence scores.
- **Kinematic Geometry**: Computes 3-joint angles using vector dot products, mathematically constrained to $[0^\circ, 180^\circ]$ to prevent floating-point anomalies.
- **Anti-Cheat Rep Debouncing**: Utilizes discrete multi-phase state machines with minimum duration hysteresis thresholds (e.g. $1.0\text{ s}$) to prevent double counting from rapid video noise.

### 3.3 Backend (REST & Data Tier)
- **Stateless Authentication**: Issues and validates JSON Web Tokens (JWT) signed with HMAC-SHA256. Passwords hashed with 10 salt rounds of `bcryptjs`.
- **MongoDB Aggregation Pipelines**: Computes dashboard analytics, calculating total repetitions, active workout minutes, estimated caloric expenditure, average form fidelity, and personal best records.
