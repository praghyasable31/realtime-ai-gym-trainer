import React, { useEffect, useRef } from 'react';
import { drawSkeleton } from '../utils/poseRenderer';

const SkeletonCanvas = ({ videoRef, landmarks = [], angles = {}, formType = 'good' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef?.current;

      if (canvas && video && video.readyState >= 2) {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        if (landmarks && landmarks.length > 0) {
          drawSkeleton(ctx, landmarks, width, height, angles, formType);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [landmarks, angles, formType, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none object-cover"
    />
  );
};

export default SkeletonCanvas;
