import React from 'react';

const MetricCard = ({ title, value, unit = '', subtitle, icon: Icon, color = 'cyan' }) => {
  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40',
      glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40',
      glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    },
    red: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-950/60 text-rose-400 border-rose-800/40',
      glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    },
  };

  const style = colorStyles[color] || colorStyles.cyan;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl glass-panel p-6 border transition-all duration-300 group ${style.border} ${style.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">{value}</span>
            {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3.5 rounded-xl border ${style.iconBg} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
