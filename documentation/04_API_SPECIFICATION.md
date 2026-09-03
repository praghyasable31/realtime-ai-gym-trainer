# 04. API Specification & Endpoints

## 1. Overview

The backend REST API communicates using standard JSON formats over HTTP/HTTPS, while the AI Computer Vision engine communicates over bidirectional WebSockets.

- **Backend REST Base URL**: `http://localhost:5000/api`
- **AI Service WebSocket URL**: `ws://localhost:8000/ws/pose/{exercise}`
- **Authentication Header**: `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Authentication Endpoints

### 2.1 Register User
- **Method**: `POST`
- **Route**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "dailyTargetReps": 50,
    "preferredVoice": true,
    "createdAt": "2026-09-03T10:00:00.000Z"
  }
}
```

---

### 2.2 Login User
- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "dailyTargetReps": 50,
    "preferredVoice": true
  }
}
```

---

### 2.3 Get Profile / Current User
- **Method**: `GET`
- **Route**: `/api/auth/me`
- **Access**: Private (Bearer Token required)
- **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "dailyTargetReps": 50,
    "preferredVoice": true
  }
}
```

---

## 3. Workout Endpoints

### 3.1 Record Completed Workout
- **Method**: `POST`
- **Route**: `/api/workouts`
- **Access**: Private
- **Request Body**:
```json
{
  "exercise": "squat",
  "reps": 15,
  "duration": 45,
  "formScore": 92,
  "feedback": [
    "Great depth and form!",
    "Keep your back straight"
  ]
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "workout": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d9",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "exercise": "squat",
    "reps": 15,
    "duration": 45,
    "formScore": 92,
    "feedback": ["Great depth and form!"],
    "caloriesBurned": 6.8,
    "createdAt": "2026-09-03T10:15:00.000Z"
  }
}
```

---

### 3.2 List User Workouts
- **Method**: `GET`
- **Route**: `/api/workouts?exercise=squat&limit=20&page=1`
- **Access**: Private
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "workouts": [ ... ]
}
```

---

### 3.3 Delete Workout
- **Method**: `DELETE`
- **Route**: `/api/workouts/:id`
- **Access**: Private
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Workout session removed successfully"
}
```

---

## 4. Dashboard Analytics Endpoint

### 4.1 Get Aggregated Dashboard Stats
- **Method**: `GET`
- **Route**: `/api/dashboard/stats`
- **Access**: Private
- **Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "totalWorkouts": 12,
    "totalReps": 180,
    "totalMinutes": 38,
    "totalCalories": 124,
    "avgFormScore": 91,
    "streakDays": 3,
    "personalRecords": {
      "squat": 25,
      "bicep_curl": 18,
      "pushup": 20
    },
    "chartData": [
      { "date": "2026-08-28", "day": "Fri", "reps": 20, "workouts": 1 },
      { "date": "2026-09-03", "day": "Thu", "reps": 35, "workouts": 2 }
    ],
    "recentWorkouts": [ ... ]
  }
}
```

---

## 5. AI Service WebSocket Channel

### 5.1 Bidirectional Pose Stream
- **URL**: `ws://127.0.0.1:8000/ws/pose/{exercise}`
  *(Supported exercises: `squat`, `bicep_curl`, `pushup`)*
- **Client Frame Payload** (sent at ~15-20 FPS):
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```
- **Server Telemetry Response**:
```json
{
  "detected": true,
  "exercise": "squat",
  "reps": 8,
  "stage": "BOTTOM",
  "feedback": "Great Depth! Now drive up",
  "feedback_type": "good",
  "angles": {
    "knee": 88.4,
    "hip": 102.1,
    "torso_tilt": 28.3
  },
  "form_score": 94,
  "is_visible": true,
  "rep_just_completed": false,
  "landmarks": [
    { "x": 0.51, "y": 0.22, "z": -0.15, "visibility": 0.98 }
  ],
  "latency_ms": 16.2
}
```
