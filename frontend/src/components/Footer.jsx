import React from 'react';
import { Activity, ShieldCheck, Cpu, Code2, Database } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060a12] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[2px]">
              <div className="w-full h-full bg-[#070b13] rounded-[6px] flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Aegis<span className="text-cyan-400">AI</span> Gym Trainer
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Real-time computer vision fitness coach utilizing MediaPipe 33-point pose landmarks,
            kinematic vector mathematics, and discrete state machines to deliver rep counting and biomechanical posture feedback.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-cyan-300 border border-slate-700">
              <Cpu className="w-3 h-3" /> MediaPipe Pose
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-emerald-300 border border-slate-700">
              <Code2 className="w-3 h-3" /> React + FastAPI
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-indigo-300 border border-slate-700">
              <Database className="w-3 h-3" /> MongoDB
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-amber-300 border border-slate-700">
              <ShieldCheck className="w-3 h-3" /> JWT Auth
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Supported Exercises</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-cyan-400 transition-colors">Bodyweight Squats</li>
            <li className="hover:text-cyan-400 transition-colors">Dumbbell Bicep Curls</li>
            <li className="hover:text-cyan-400 transition-colors">Standard Push-ups</li>
            <li className="text-slate-500 text-xs italic">+ Modular API for Lunges & Deadlifts</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Academic Project</h4>
          <ul className="space-y-2 text-sm">
            <li>BTech Final Year Major Project</li>
            <li>Computer Science & Engineering</li>
            <li>Real-Time Biomechanical Analysis</li>
            <li className="text-cyan-400 font-medium">Viva & Demonstration Ready</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 AegisAI Gym Trainer. BTech Major Project Engineering Suite.</p>
        <p>Built with MediaPipe, OpenCV, React, Express, and MongoDB.</p>
      </div>
    </footer>
  );
};

export default Footer;
