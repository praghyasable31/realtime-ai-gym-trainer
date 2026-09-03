import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutService } from '../api/workoutService';
import {
  History,
  Activity,
  Dumbbell,
  Flame,
  Calendar,
  Clock,
  Award,
  Trash2,
  Filter,
  CheckCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Toast from '../components/Toast';

const WorkoutHistoryPage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchWorkouts = async (exerciseFilter = '') => {
    setLoading(true);
    try {
      const data = await workoutService.getWorkouts({
        exercise: exerciseFilter || undefined,
        limit: 50,
      });
      if (data.success) {
        setWorkouts(data.workouts || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts(selectedExercise);
  }, [selectedExercise]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this workout record?')) return;

    setDeletingId(id);
    try {
      await workoutService.deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
      setToastMessage('Workout record removed.');
    } catch (err) {
      console.error('Failed to delete workout:', err);
      setToastMessage('Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const exerciseMap = {
    squat: { name: 'Squats', icon: Activity, color: 'text-cyan-400' },
    bicep_curl: { name: 'Bicep Curls', icon: Dumbbell, color: 'text-emerald-400' },
    pushup: { name: 'Push-ups', icon: Flame, color: 'text-indigo-400' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-cyan-400" />
            Workout History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review past training sessions, repetition volumes, and biomechanical form scores.
          </p>
        </div>

        <Link
          to="/exercises"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-md shadow-cyan-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          New Workout
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {[
          { id: '', label: 'All Exercises' },
          { id: 'squat', label: 'Squats' },
          { id: 'bicep_curl', label: 'Bicep Curls' },
          { id: 'pushup', label: 'Push-ups' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedExercise(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedExercise === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'glass-panel text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading workout history...</p>
        </div>
      ) : workouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((w) => {
            const exInfo = exerciseMap[w.exercise] || {
              name: w.exercise,
              icon: Activity,
              color: 'text-cyan-400',
            };
            const Icon = exInfo.icon;

            return (
              <div
                key={w._id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <Icon className={`w-5 h-5 ${exInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{exInfo.name}</h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(w.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(w._id)}
                      disabled={deletingId === w._id}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete entry"
                    >
                      {deletingId === w._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-4 text-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Reps</span>
                      <p className="text-lg font-black text-cyan-400 mt-0.5">{w.reps}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Duration</span>
                      <p className="text-base font-mono font-bold text-white mt-0.5">
                        {Math.round(w.duration)}s
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Score</span>
                      <p className="text-base font-bold text-emerald-400 mt-0.5">
                        {w.formScore}%
                      </p>
                    </div>
                  </div>

                  {/* Feedback Snippet */}
                  {w.feedback && w.feedback.length > 0 && (
                    <div className="space-y-1 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Coaching Highlights
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {w.feedback.slice(0, 2).map((fb, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 truncate">
                            <CheckCircle className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                            <span className="truncate">{fb}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-right">
                  <span className="text-xs text-slate-400">
                    Est. Calories: <span className="font-bold text-white">{w.caloriesBurned || 0} kcal</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-3xl border border-slate-800 p-8">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Workout History Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {selectedExercise
              ? 'No sessions found for this exercise filter.'
              : 'You have not recorded any workouts yet. Start a live AI session now!'}
          </p>
          <Link
            to="/exercises"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all"
          >
            Start First Session
          </Link>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default WorkoutHistoryPage;
