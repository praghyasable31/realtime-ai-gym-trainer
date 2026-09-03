import React from 'react';

const RepRing = ({ reps, target = 15, size = 180, strokeWidth = 14, justCompleted = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(1, reps / Math.max(1, target));
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 transition-transform ${justCompleted ? 'scale-110' : 'scale-100'} duration-200`}
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(30, 41, 59, 0.8)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#repGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-300 ease-out"
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="repGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Reps Display */}
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span
          className={`text-5xl font-black tracking-tight text-white transition-all ${
            justCompleted ? 'scale-125 text-emerald-400' : ''
          }`}
        >
          {reps}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
          {reps === 1 ? 'Rep' : 'Reps'}
        </span>
      </div>
    </div>
  );
};

export default RepRing;
