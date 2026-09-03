import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Dumbbell,
  Flame,
  Camera,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

const ExerciseSelectPage = () => {
  const navigate = useNavigate();

  const exercises = [
    {
      id: 'squat',
      title: 'Bodyweight Squats',
      category: 'Lower Body & Core',
      difficulty: 'Beginner',
      muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
      description:
        'Standard bodyweight squat focusing on full knee flexion (&le;100°), upright spine posture, and steady cadence.',
      icon: Activity,
      color: 'cyan',
      cameraTip: 'Position camera at hip height, 6 to 8 feet away. Full body from head to feet must be visible.',
      targetReps: 15,
      rules: [
        'Knee angle &le; 100° at bottom for valid rep',
        'Keep torso incline under 45° to prevent lower back strain',
        'Drive through heels upon ascending',
      ],
    },
    {
      id: 'bicep_curl',
      title: 'Dumbbell Bicep Curls',
      category: 'Upper Body & Arms',
      difficulty: 'Beginner',
      muscles: ['Biceps Brachii', 'Brachialis', 'Forearms'],
      description:
        'Arm curl focusing on elbow flexion isolation, full elbow extension (&gt;150°), and preventing shoulder swinging.',
      icon: Dumbbell,
      color: 'emerald',
      cameraTip: 'Position camera at chest/waist level, 4 to 6 feet away. Shoulders, elbows, and wrists must remain visible.',
      targetReps: 12,
      rules: [
        'Elbow flexion &le; 48° at peak contraction',
        'Full arm lockout &gt; 150° at the bottom',
        'Keep upper arms pinned to ribs (no elbow drift)',
      ],
    },
    {
      id: 'pushup',
      title: 'Standard Push-ups',
      category: 'Chest, Arms & Core',
      difficulty: 'Intermediate',
      muscles: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid', 'Core Plank'],
      description:
        'Horizontal press tracking 90° elbow depth and straight plank line from shoulders through hips down to ankles.',
      icon: Flame,
      color: 'indigo',
      cameraTip: 'Place camera on the floor or low stool at 90-degree side angle to capture full horizontal body line.',
      targetReps: 10,
      rules: [
        'Elbow angle &le; 90° at bottom depth',
        'Full plank line angle between 155° and 180°',
        'No sagging hips or piking during movement',
      ],
    },
  ];

  const handleStart = (exerciseId) => {
    navigate(`/workout/${exerciseId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Biomechanical Exercise Library</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Select Your Exercise
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Choose a movement to launch the live AI vision feed with automated rep counting and real-time form coaching.
        </p>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {exercises.map((ex) => {
          const Icon = ex.icon;
          return (
            <div
              key={ex.id}
              className="rounded-3xl glass-panel p-7 border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.12)] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700">
                    {ex.difficulty}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-1">{ex.title}</h3>
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4">{ex.category}</p>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">{ex.description}</p>

                {/* Targeted Muscles */}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Targeted Muscles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ex.muscles.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-900/90 text-slate-300 border border-slate-800"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Form Rules */}
                <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    Biomechanical Criteria
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {ex.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Camera Placement Tip */}
                <div className="mb-6 text-xs text-slate-400 flex items-start gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                  <Camera className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{ex.cameraTip}</span>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() => handleStart(ex.id)}
                className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Launch {ex.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseSelectPage;
