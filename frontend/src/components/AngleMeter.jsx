import React from 'react';

const AngleMeter = ({ label, angle = 0, targetRange = [70, 110], unit = '°' }) => {
  const [minTarget, maxTarget] = targetRange;
  const isOptimal = angle >= minTarget && angle <= maxTarget;

  // Percentage within a 0 - 180 degree span
  const pct = Math.min(100, Math.max(0, (angle / 180) * 100));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className={`font-mono font-bold text-sm ${isOptimal ? 'text-emerald-400' : 'text-cyan-400'}`}>
          {Math.round(angle)}{unit}
        </span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
        <div
          className={`h-full transition-all duration-150 rounded-full ${
            isOptimal ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
        <span>0°</span>
        <span className="text-slate-400">Target: {minTarget}° - {maxTarget}°</span>
        <span>180°</span>
      </div>
    </div>
  );
};

export default AngleMeter;
