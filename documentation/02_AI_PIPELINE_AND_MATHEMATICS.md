# 02. AI Pipeline, Kinematics & Mathematics

## 1. Overview

The AI engine avoids opaque black-box machine learning for rep counting. Instead, it employs **MediaPipe Pose** for feature extraction combined with **Vector Trigonometry** and **Deterministic Finite State Automata (DFA)**. This delivers predictable, explainable, and zero-drift repetition counts.

---

## 2. MediaPipe Pose Landmark Topology

MediaPipe Pose identifies 33 3D skeletal landmark points. The primary tracking coordinates used in our system include:

| Landmark Index | Anatomical Name | Used in Exercise |
|---|---|---|
| `11` | Left Shoulder | Squat (torso), Curl, Push-up (plank) |
| `12` | Right Shoulder | Squat (torso), Curl, Push-up (plank) |
| `13` | Left Elbow | Bicep Curl, Push-up |
| `14` | Right Elbow | Bicep Curl, Push-up |
| `15` | Left Wrist | Bicep Curl, Push-up |
| `16` | Right Wrist | Bicep Curl, Push-up |
| `23` | Left Hip | Squat, Push-up (plank) |
| `24` | Right Hip | Squat, Push-up (plank) |
| `25` | Left Knee | Squat |
| `26` | Right Knee | Squat |
| `27` | Left Ankle | Squat, Push-up (plank) |
| `28` | Right Ankle | Squat, Push-up (plank) |

Each landmark point $P_i$ contains normalized coordinates:
$$P_i = (x_i, y_i, z_i, v_i)$$
where:
- $x_i, y_i \in [0.0, 1.0]$: Normalized frame coordinates.
- $z_i$: Relative landmark depth (distance from camera).
- $v_i \in [0.0, 1.0]$: Visibility confidence score.

---

## 3. Mathematical Formulations

### 3.1 Three-Joint Interior Angle
Given three connected anatomical joints $A$, $B$ (vertex), and $C$:
1. Construct vector $\vec{u} = A - B$:
   $$\vec{u} = \begin{bmatrix} x_A - x_B \\ y_A - y_B \end{bmatrix}$$
2. Construct vector $\vec{v} = C - B$:
   $$\vec{v} = \begin{bmatrix} x_C - x_B \\ y_C - y_B \end{bmatrix}$$
3. Compute Euclidean vector norms:
   $$\|\vec{u}\| = \sqrt{u_x^2 + u_y^2}, \quad \|\vec{v}\| = \sqrt{v_x^2 + v_y^2}$$
4. Compute the scalar dot product:
   $$\vec{u} \cdot \vec{v} = u_x v_x + u_y v_y$$
5. Solve for cosine of angle $\theta$:
   $$\cos(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$$
6. Numerical Clamping (prevents float NaN errors caused by precision drift outside $[-1, 1]$):
   $$\cos^*(\theta) = \max\left(-1.0, \min\left(1.0, \cos(\theta)\right)\right)$$
7. Compute interior angle in degrees:
   $$\theta = \arccos\left(\cos^*(\theta)\right) \times \frac{180^\circ}{\pi}$$

---

### 3.2 Spine / Torso Incline Angle
To evaluate back posture during squats:
$$\Delta x = |x_{\text{shoulder}} - x_{\text{hip}}|, \quad \Delta y = |y_{\text{shoulder}} - y_{\text{hip}}|$$
$$\theta_{\text{torso}} = \arctan2(\Delta x, \Delta y) \times \frac{180^\circ}{\pi}$$
- $\theta_{\text{torso}} \le 45^\circ$: Safe, upright spine.
- $\theta_{\text{torso}} > 45^\circ$: Warning triggered: *"Keep your back straight!"*

---

### 3.3 Angle Smoothing Filter (EMA)
Raw webcam landmarks exhibit high-frequency jitter. We implement an **Exponential Moving Average (EMA)**:
$$S_t = \alpha \cdot \theta_t + (1 - \alpha) \cdot S_{t-1}$$
where smoothing coefficient $\alpha = 0.65$. This reduces sensor noise without introducing latency.

---

## 4. State Machine Transition Diagrams

### 4.1 Squat State Machine
```
   [ START ]
       |
       v (Knee > 160°)
  [ STANDING ] -------- (Knee <= 155°) ---------> [ GOING_DOWN ]
       ^                                                 |
       |                                                 v (Knee <= 100°)
[ REP_COMPLETED ] <--- (Knee > 160°) --- [ GOING_UP ] <-- [ BOTTOM ]
```

### 4.2 Bicep Curl State Machine
```
   [ START ]
       |
       v (Elbow > 150°)
 [ ARM_EXTENDED ] ----- (Elbow <= 145°) --------> [ CURLING ]
       ^                                                 |
       |                                                 v (Elbow <= 48°)
[ REP_COMPLETED ] <--- (Elbow > 150°) --- [ RETURNING ] <- [ FULLY_CURLED ]
```

### 4.3 Push-up State Machine
```
   [ START ]
       |
       v (Elbow > 150°)
  [ UP_PLANK ] -------- (Elbow <= 145°) --------> [ GOING_DOWN ]
       ^                                                 |
       |                                                 v (Elbow <= 90°)
[ REP_COMPLETED ] <--- (Elbow > 150°) --- [ PUSHING_UP ] <- [ BOTTOM ]
```
