import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Dumbbell,
  Cpu,
  ShieldCheck,
  Zap,
  TrendingUp,
  Camera,
  Flame,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 bg-grid-pattern">
        {/* Subtle background glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs sm:text-sm font-semibold mb-8 animate-pulse-slow">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI-Powered Real-Time Biomechanics & Rep Tracking</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Transform Every Rep with{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Real-Time AI Vision
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate guesswork from your fitness. MediaPipe 33-point pose estimation tracks joint angles in real time,
            counts valid repetitions, and gives instant corrective voice feedback.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/exercises" : "/register"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-5 h-5" />
              {isAuthenticated ? "Launch Workout Session" : "Start Free Workout"}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/exercises"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base glass-panel border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-500/40 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5 text-cyan-400" />
              Explore Exercises
            </Link>
          </div>

          {/* Highlights Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Cpu className="w-4 h-4" /> 33 Landmarks
              </div>
              <p className="text-xs text-slate-400 mt-1">Full-body skeletal tracking</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Zap className="w-4 h-4" /> &lt;25ms Latency
              </div>
              <p className="text-xs text-slate-400 mt-1">Real-time WebSocket streaming</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" /> State Machine
              </div>
              <p className="text-xs text-slate-400 mt-1">Anti-cheat rep debouncing</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <TrendingUp className="w-4 h-4" /> Voice Coach
              </div>
              <p className="text-xs text-slate-400 mt-1">Hands-free audio guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exercises Showcase */}
      <section className="py-20 bg-[#070b13] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Supported Workouts</h2>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Biomechanical Precision for Foundational Movements
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Each exercise runs a discrete kinematic state machine calculating joint vectors in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Squats */}
            <div className="rounded-2xl glass-panel p-6 border border-slate-800 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bodyweight Squats</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Tracks Hip-Knee-Ankle angles and spine incline. Verifies parallel thigh depth (&le;100&deg;) and prevents torso leaning.
              </p>
              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Standing &rarr; Bottom &rarr; Ascend
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Audio cues: "Go Lower", "Good Form"
                </div>
              </div>
            </div>

            {/* Bicep Curls */}
            <div className="rounded-2xl glass-panel p-6 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bicep Curls</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Tracks Shoulder-Elbow-Wrist flexion. Detects full arm extension (&gt;150&deg;), peak contraction (&le;48&deg;), and prevents elbow flare.
              </p>
              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Extended &rarr; Peak Curl &rarr; Lower
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Warns against upper arm swing
                </div>
              </div>
            </div>

            {/* Push-ups */}
            <div className="rounded-2xl glass-panel p-6 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Standard Push-ups</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Tracks elbow flexion (&le;90&deg;) and plank alignment (Shoulder-Hip-Ankle). Enforces rigid core without hip sagging.
              </p>
              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Up Plank &rarr; Chest Down &rarr; Lockout
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Posture score: 0 to 100%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="py-20 bg-[#090e17] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Architecture</h2>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              From Raw Webcam Stream to Biomechanical Intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-3xl font-black text-cyan-500/30">01</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Webcam Capture</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browser captures HTML5 video frames at 30fps and streams compressed frames via WebSocket.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-3xl font-black text-emerald-500/30">02</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">MediaPipe Detection</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Python AI backend extracts 33 standardized 3D body landmarks with visibility confidence weights.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-3xl font-black text-indigo-500/30">03</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Kinematic Math</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vector dot products calculate joint angles with moving-average noise smoothing filters.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-3xl font-black text-amber-500/30">04</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Feedback & Cues</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discrete state machine advances rep count, calculates form score, and emits audio cues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#090e17] to-[#070b13] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="glass-panel-glow p-10 sm:p-14 rounded-3xl border border-cyan-500/30">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Experience the Future of Fitness Coaching?
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              No extra hardware or sensors required. Just your browser and webcam.
            </p>
            <div className="mt-8">
              <Link
                to={isAuthenticated ? "/exercises" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-xl shadow-cyan-500/25 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                {isAuthenticated ? "Launch Live Workout" : "Create Account & Start"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
