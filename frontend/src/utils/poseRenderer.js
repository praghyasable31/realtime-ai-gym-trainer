/**
 * High-performance HTML5 Canvas skeleton and joint overlay renderer.
 */

// Standard MediaPipe Pose Connectors
export const POSE_CONNECTIONS = [
  // Torso
  [11, 12], [12, 24], [24, 23], [23, 11],
  // Left Arm
  [11, 13], [13, 15],
  // Right Arm
  [12, 14], [14, 16],
  // Left Leg
  [23, 25], [25, 27], [27, 29], [29, 31],
  // Right Leg
  [24, 26], [26, 28], [28, 30], [30, 32],
];

export const drawSkeleton = (ctx, landmarks, width, height, angles = {}, formType = 'good') => {
  if (!ctx || !landmarks || landmarks.length === 0) return;

  ctx.save();

  // Glow color scheme based on form status
  let strokeColor = '#06b6d4'; // cyan
  let jointColor = '#22d3ee';
  let shadowColor = 'rgba(6, 182, 212, 0.6)';

  if (formType === 'warning') {
    strokeColor = '#f59e0b'; // amber
    jointColor = '#fbbf24';
    shadowColor = 'rgba(245, 158, 11, 0.6)';
  } else if (formType === 'error') {
    strokeColor = '#ef4444'; // red
    jointColor = '#f87171';
    shadowColor = 'rgba(239, 68, 68, 0.6)';
  }

  // 1. Draw Connectors (Bones)
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 12;

  POSE_CONNECTIONS.forEach(([i, j]) => {
    const p1 = landmarks[i];
    const p2 = landmarks[j];

    if (p1 && p2 && (p1.visibility || 1.0) > 0.45 && (p2.visibility || 1.0) > 0.45) {
      const x1 = p1.x * width;
      const y1 = p1.y * height;
      const x2 = p2.x * width;
      const y2 = p2.y * height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  });

  // 2. Draw Key Joint Circles
  landmarks.forEach((lm, idx) => {
    // Only draw major body joints (shoulders, elbows, wrists, hips, knees, ankles)
    const keyJoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    if (!keyJoints.includes(idx)) return;

    if ((lm.visibility || 1.0) > 0.45) {
      const x = lm.x * width;
      const y = lm.y * height;

      // Outer halo
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = jointColor;
      ctx.fill();

      // Inner white core
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  });

  // 3. Draw Angle Callouts near active joints
  if (angles && Object.keys(angles).length > 0) {
    ctx.shadowBlur = 0;
    ctx.font = '600 13px Inter, sans-serif';

    // If knee angle exists, draw near left or right knee
    if (angles.knee !== undefined) {
      const kneeIdx = (landmarks[25]?.visibility || 0) >= (landmarks[26]?.visibility || 0) ? 25 : 26;
      const knee = landmarks[kneeIdx];
      if (knee) {
        renderAngleBadge(ctx, knee.x * width, knee.y * height, `Knee: ${Math.round(angles.knee)}°`, strokeColor);
      }
    }

    // If elbow angle exists, draw near left or right elbow
    if (angles.elbow !== undefined) {
      const elbowIdx = (landmarks[13]?.visibility || 0) >= (landmarks[14]?.visibility || 0) ? 13 : 14;
      const elbow = landmarks[elbowIdx];
      if (elbow) {
        renderAngleBadge(ctx, elbow.x * width, elbow.y * height, `Elbow: ${Math.round(angles.elbow)}°`, strokeColor);
      }
    }

    // If hip or torso angle exists
    if (angles.hip !== undefined) {
      const hipIdx = (landmarks[23]?.visibility || 0) >= (landmarks[24]?.visibility || 0) ? 23 : 24;
      const hip = landmarks[hipIdx];
      if (hip) {
        renderAngleBadge(ctx, hip.x * width, hip.y * height - 20, `Hip: ${Math.round(angles.hip)}°`, strokeColor);
      }
    }
  }

  ctx.restore();
};

function renderAngleBadge(ctx, x, y, text, color) {
  const paddingX = 8;
  const paddingY = 4;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = 14;

  const bx = x + 12;
  const by = y - 10;

  // Background pill
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(bx, by - textHeight + 2, textWidth + paddingX * 2, textHeight + paddingY * 2, 6);
  ctx.fill();

  // Border pill
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, bx + paddingX, by + 4);
}
