# 05. BTech Major Project Viva Preparation Guide
## 30+ Comprehensive Questions & Authoritative Answers

---

### Category 1: Computer Vision & MediaPipe

#### Q1: Why did you choose Google MediaPipe Pose over YOLOv8-Pose or OpenPose?
**Answer**:
MediaPipe Pose provides a lightweight, real-time two-stage detector/tracker pipeline designed for edge devices and standard CPUs without dedicated GPU acceleration.
- **Compared to OpenPose**: OpenPose uses a multi-stage Part Affinity Fields (PAFs) bottom-up approach that requires substantial GPU VRAM and yields high latency (10-15 FPS on average hardware). MediaPipe runs at 30+ FPS on CPU.
- **Compared to YOLO-Pose**: YOLO-Pose is a pure object detection model that outputs 17 keypoints. MediaPipe outputs 33 3D landmarks (including hips, heels, and foot indices critical for squat depth evaluation) and performs temporal landmark smoothing out of the box.

#### Q2: How does MediaPipe Pose work under the hood?
**Answer**:
MediaPipe uses a two-step detector-tracker ML pipeline:
1. **Detector (BlazePose Detector)**: First locates the Region of Interest (ROI) containing the human body (person bounding box) using face and torso anchors.
2. **Landmark Model (Pose Tracker)**: Predicts 33 3D landmark coordinates within the cropped bounding box. For subsequent frames, the model only runs the tracker within the previous bounding box, running the expensive detector only when tracking confidence drops below a threshold (`0.5`).

#### Q3: What do the (x, y, z, visibility) values in MediaPipe represent?
**Answer**:
- `x` and `y`: Normalized coordinates in range $[0.0, 1.0]$, representing horizontal and vertical positions scaled relative to image width and height.
- `z`: Represents landmark depth with the midpoint of hips as the origin coordinate ($z=0$). Negative values indicate the joint is closer to the camera than the hip midpoint.
- `visibility`: Probability in $[0.0, 1.0]$ that the landmark is present in the frame and not occluded by limbs or objects.

#### Q4: How does the system handle occluded joints or when a user steps out of frame?
**Answer**:
Before evaluating angles, our detector verifies the `visibility` attribute of the critical joints (e.g. hip, knee, ankle). If any joint visibility drops below `0.5`, the state machine transitions to `LOW_VISIBILITY` or `NO_POSE`, and prompts the user: *"Step into camera frame (full body visible)"*, preventing phantom rep counts.

---

### Category 2: Kinematics, Mathematics & State Machines

#### Q5: How do you mathematically calculate the angle between three body joints?
**Answer**:
Given three points $A$, $B$ (vertex), and $C$:
1. Construct 2D vectors: $\vec{u} = A - B$ and $\vec{v} = C - B$.
2. Compute their Euclidean norms $\|\vec{u}\| = \sqrt{u_x^2 + u_y^2}$ and $\|\vec{v}\| = \sqrt{v_x^2 + v_y^2}$.
3. Calculate the scalar dot product: $\vec{u} \cdot \vec{v} = u_x v_x + u_y v_y$.
4. Use the definition of the dot product $\vec{u} \cdot \vec{v} = \|\vec{u}\| \|\vec{v}\| \cos(\theta)$ to isolate $\cos(\theta)$.
5. Clamp $\cos(\theta)$ to $[-1.0, 1.0]$ to prevent precision errors and take the inverse cosine: $\theta = \arccos(\cos^*(\theta)) \times \frac{180^\circ}{\pi}$.

#### Q6: Why did you use a finite state machine instead of simply counting every time the knee bends?
**Answer**:
If you count every time an angle crosses a threshold, camera noise or slight vibrations cause the angle to oscillate across the threshold (e.g. fluctuating between 99° and 101°), resulting in dozens of false repetitions per second.
A **State Machine** enforces a complete physiological cycle:
$$\text{STANDING} \longrightarrow \text{GOING\_DOWN} \longrightarrow \text{BOTTOM (Parallel)} \longrightarrow \text{GOING\_UP} \longrightarrow \text{REP\_COMPLETED}$$
A repetition is only accredited when the entire ordered loop is traversed.

#### Q7: What is debounce hysteresis and how is it implemented?
**Answer**:
Debouncing uses two techniques:
1. **Geometric Hysteresis**: Different angles for entering and leaving a state (e.g., must go below $100^\circ$ to enter `BOTTOM`, but must rise above $160^\circ$ to complete the rep).
2. **Temporal Debouncing**: Enforces a minimum physical repetition duration ($1.0\text{ s}$). No human can perform a valid biomechanical squat in 200 milliseconds.

#### Q8: How is the Form Score (0-100%) calculated?
**Answer**:
During the repetition cycle, each frame is audited against clinical criteria (e.g. knee depth $\le 100^\circ$, torso tilt $\le 45^\circ$, elbow flare $\le 40^\circ$). The system calculates the ratio of compliant frames versus non-compliant frames:
$$\text{Form Score} = \max\left(50, \min\left(100, \frac{\text{Compliant Frames}}{\text{Total Cycle Frames}} \times 100\right)\right)$$

---

### Category 3: System Architecture & Real-Time Performance

#### Q9: Why did you decouple the AI Service from the Express Node.js backend?
**Answer**:
1. **Concurrency & Event Loop**: Node.js has a single-threaded event loop. If CPU-intensive image decoding and computer vision were run in Node.js, the event loop would block, freezing all database queries and HTTP API requests for all users.
2. **Ecosystem Fit**: Python has native compiled bindings for OpenCV and MediaPipe (written in C++).
3. **Horizontal Scalability**: The AI service can be scaled independently on compute-optimized instances while the Node.js backend runs on lightweight web tiers.

#### Q10: Why did you use WebSockets instead of HTTP POST for video streaming?
**Answer**:
HTTP is request-response based and establishes a new TCP handshake (or TLS negotiation) with heavy header overhead for each frame.
At 20-30 FPS, sending 20-30 HTTP requests per second causes network thrashing and 150-300ms latency.
A **WebSocket** establishes a persistent, full-duplex TCP socket where lightweight JPEG frames are streamed continuously with sub-25ms round-trip latency.

#### Q11: How do you achieve 60 FPS skeleton rendering if camera stream is 15-30 FPS?
**Answer**:
The video and skeleton canvas use the browser's native `requestAnimationFrame` loop (60 Hz). When a new landmark packet arrives via WebSocket, coordinates are stored in state, and canvas draws with sub-pixel interpolation on every screen refresh tick.

---

### Category 4: Security, Authentication & Database

#### Q12: How is user authentication secured?
**Answer**:
1. **Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 salt rounds (utilizing Blowfish cipher).
2. **JWT Tokens**: Signed with a secure server-side secret using HMAC-SHA256 (`HS256`). Tokens carry expiration times (`30d`).
3. **Route Guards**: Express middleware extracts the `Bearer <token>` header, verifies the signature, and attaches the sanitized user object to `req.user`.

#### Q13: Why MongoDB instead of PostgreSQL or MySQL?
**Answer**:
Workouts contain semi-structured telemetry data: per-rep angle details, dynamic arrays of coaching feedback strings, and varying exercise attributes. Document-based schemas allow appending new metrics without complex schema migrations. MongoDB compound indexes on `(userId, createdAt)` provide sub-5ms chronological query speeds.

---

### Category 5: Practical Applications & Future Scope

#### Q14: What are the current limitations of this project?
**Answer**:
1. Single camera angle (2D projection of 3D motion): While MediaPipe estimates depth ($Z$), it is monocular estimation. Complex rotation out-of-plane can cause occlusion.
2. Lighting conditions: Low-light environments reduce edge contrast and landmark confidence.

#### Q15: What is the future scope of this system?
**Answer**:
1. Expansion to barbell and dumbbell free-weight detection using object tracking.
2. Integration of custom temporal LSTM / Transformer models for 3D gesture trajectory classification.
3. Mobile app conversion via React Native or WebRTC P2P streams.
