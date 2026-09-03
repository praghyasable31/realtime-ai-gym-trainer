import React from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const FeedbackBadge = ({ stage = 'START', feedback = 'Ready to begin', type = 'info', score = 100 }) => {
  const styles = {
    good: {
      bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    warning: {
      bg: 'bg-amber-950/80 border-amber-500/40 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      pill: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    error: {
      bg: 'bg-rose-950/80 border-rose-500/40 text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
      pill: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    info: {
      bg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200',
      icon: Info,
      iconColor: 'text-cyan-400',
      pill: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  };

  const current = styles[type] || styles.info;
  const Icon = current.icon;

  const stageLabels = {
    START: 'Ready',
    STANDING: 'Standing',
    GOING_DOWN: 'Descending',
    BOTTOM: 'Peak Depth',
    GOING_UP: 'Ascending',
    ARM_EXTENDED: 'Extended',
    CURLING: 'Curling',
    FULLY_CURLED: 'Peak Contraction',
    RETURNING: 'Lowering',
    UP_PLANK: 'Plank Hold',
    PUSHING_UP: 'Driving Up',
    NO_POSE: 'Searching',
    LOW_VISIBILITY: 'Low Visibility',
  };

  return (
    <div className={`rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 ${current.bg} shadow-lg`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 flex-shrink-0 ${current.iconColor}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Form Coach</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${current.pill}`}>
            {stageLabels[stage] || stage}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
            {score}%
          </span>
        </div>
      </div>

      <p className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
        {feedback}
      </p>
    </div>
  );
};

export default FeedbackBadge;
