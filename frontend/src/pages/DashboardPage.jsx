import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutService } from '../api/workoutService';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import {
  Activity,
  Dumbbell,
  Flame,
  Clock,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await workoutService.getDashboardStats();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setError('Could not fetch workout statistics. Check server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading your performance metrics...</p>
      </div>
    );
  }

  const exerciseNames = {
    squat: 'Squats',
    bicep_curl: 'Bicep Curls',
    pushup: 'Push-ups',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-panel-glow border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {user?.name || 'Athlete'}
            </h1>
            {stats?.streakDays > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {stats.streakDays} Day Streak!
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track real-time joint kinematic progress, posture consistency, and rep volumes.
          </p>
        </div>

        <Link
          to="/exercises"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Start New Workout
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Workouts"
          value={stats?.totalWorkouts || 0}
          subtitle="Completed sessions"
          icon={Dumbbell}
          color="cyan"
        />
        <MetricCard
          title="Total Reps"
          value={stats?.totalReps || 0}
          subtitle="Biomechanical reps logged"
          icon={Activity}
          color="emerald"
        />
        <MetricCard
          title="Avg Form Score"
          value={stats?.avgFormScore || 0}
          unit="%"
          subtitle="Kinematic posture accuracy"
          icon={Award}
          color="amber"
        />
        <MetricCard
          title="Time Active"
          value={stats?.totalMinutes || 0}
          unit="min"
          subtitle="Total training duration"
          icon={Clock}
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Rep Activity Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Repetition Volume (Last 7 Days)</h3>
              <p className="text-xs text-slate-400">Daily valid repetitions completed</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
              Weekly
            </span>
          </div>

          <div className="h-64 w-full">
            {stats?.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="repsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reps"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#repsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No activity data yet. Complete your first workout!
              </div>
            )}
          </div>
        </div>

        {/* Personal Bests & Records */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1">Personal Records</h3>
            <p className="text-xs text-slate-400 mb-6">Max repetitions in a single session</p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Squats</p>
                    <p className="text-[10px] text-slate-400">Target: Hip &lt; 100°</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-cyan-400">
                    {stats?.personalRecords?.squat || 0}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">reps</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Bicep Curls</p>
                    <p className="text-[10px] text-slate-400">Target: Elbow &lt; 50°</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-400">
                    {stats?.personalRecords?.bicep_curl || 0}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">reps</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Push-ups</p>
                    <p className="text-[10px] text-slate-400">Target: Elbow &lt; 90°</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-indigo-400">
                    {stats?.personalRecords?.pushup || 0}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">reps</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <Link
              to="/exercises"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1"
            >
              Train to beat your records <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Workouts Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Sessions</h3>
            <p className="text-xs text-slate-400">Latest AI-analyzed training logs</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View Full History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentWorkouts && stats.recentWorkouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Exercise</th>
                  <th className="pb-3 font-semibold">Reps</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Form Score</th>
                  <th className="pb-3 font-semibold">Calories</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recentWorkouts.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      {exerciseNames[w.exercise] || w.exercise}
                    </td>
                    <td className="py-3.5 font-mono text-cyan-300 font-bold">{w.reps}</td>
                    <td className="py-3.5 text-slate-300 font-mono">{Math.round(w.duration)}s</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          w.formScore >= 80
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {w.formScore}%
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300">{w.caloriesBurned || 0} kcal</td>
                    <td className="py-3.5 text-slate-400 text-xs">
                      {new Date(w.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No workout sessions recorded yet.</p>
            <Link
              to="/exercises"
              className="mt-3 inline-block text-xs font-bold text-cyan-400 hover:underline"
            >
              Start your first session &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
