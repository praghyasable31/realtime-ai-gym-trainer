import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { workoutService } from '../api/workoutService';
import { AIPoseClient } from '../utils/clientPoseDetector';
import { voiceCoach } from '../utils/speech';
import SkeletonCanvas from '../components/SkeletonCanvas';
import RepRing from '../components/RepRing';
import FeedbackBadge from '../components/FeedbackBadge';
import AngleMeter from '../components/AngleMeter';
import Toast from '../components/Toast';
import {
  Camera,
  CameraOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Award,
  Flame,
  AlertTriangle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

const WorkoutSessionPage = () => {
  const { exercise = 'squat' } = useParams();
  const navigate = useNavigate();

  // Video & Canvas Refs
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const aiClientRef = useRef(null);
  const frameLoopRef = useRef(null);

  // Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Telemetry from AI
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState('START');
  const [feedback, setFeedback] = useState('Position your body in full camera view');
  const [feedbackType, setFeedbackType] = useState('info');
  const [formScore, setFormScore] = useState(95);
  const [angles, setAngles] = useState({});
  const [landmarks, setLandmarks] = useState([]);
  const [latencyMs, setLatencyMs] = useState(0);
  const [repJustCompleted, setRepJustCompleted] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  // Voice coach toggle
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Timer
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Completion Modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const exerciseTitles = {
    squat: 'Bodyweight Squats',
    bicep_curl: 'Bicep Curls',
    pushup: 'Standard Push-ups',
  };

  const targetRanges = {
    squat: { label: 'Knee Depth Angle', target: [70, 100], key: 'knee' },
    bicep_curl: { label: 'Elbow Contraction', target: [35, 50], key: 'elbow' },
    pushup: { label: 'Elbow Push Depth', target: [70, 90], key: 'elbow' },
  };

  const currentAngleConfig = targetRanges[exercise] || targetRanges.squat;

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      streamRef.current = stream;
      setCameraStarted(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or device unavailable. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraStarted(false);
  };

  // Connect to AI Service
  useEffect(() => {
    startCamera();

    const handleTelemetry = (data) => {
      if (!data) return;

      if (data.detected) {
        setLandmarks(data.landmarks || []);
        setAngles(data.angles || {});
        setReps(data.reps || 0);
        setStage(data.stage || 'ACTIVE');
        setFeedback(data.feedback || 'Good form');
        setFeedbackType(data.feedback_type || 'good');
        setFormScore(data.form_score || 90);
        setLatencyMs(data.latency_ms || 18);

        if (data.rep_just_completed) {
          setRepJustCompleted(true);
          setTimeout(() => setRepJustCompleted(false), 800);
          voiceCoach.speak(`Rep ${data.reps}!`, true);
        } else if (data.feedback && data.feedback_type === 'warning') {
          voiceCoach.speak(data.feedback);
        }

        // Record feedback for summary
        if (data.feedback && !feedbackHistory.includes(data.feedback)) {
          setFeedbackHistory((prev) => [...prev.slice(-6), data.feedback]);
        }
      } else {
        setStage(data.stage || 'SEARCHING');
        setFeedback(data.feedback || 'Step into camera frame');
        setFeedbackType('warning');
      }
    };

    const client = new AIPoseClient(
      exercise,
      handleTelemetry,
      (status) => console.log('AI Client Status:', status)
    );
    client.connect();
    aiClientRef.current = client;

    return () => {
      stopCamera();
      client.disconnect();
      voiceCoach.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (frameLoopRef.current) cancelAnimationFrame(frameLoopRef.current);
    };
  }, [exercise]);

  // Frame streaming loop
  useEffect(() => {
    let active = true;

    const streamLoop = () => {
      if (!active) return;

      if (
        sessionActive &&
        !isPaused &&
        videoRef.current &&
        captureCanvasRef.current &&
        aiClientRef.current
      ) {
        aiClientRef.current.sendFrame(videoRef.current, captureCanvasRef.current);
      }

      frameLoopRef.current = requestAnimationFrame(streamLoop);
    };

    frameLoopRef.current = requestAnimationFrame(streamLoop);

    return () => {
      active = false;
      if (frameLoopRef.current) cancelAnimationFrame(frameLoopRef.current);
    };
  }, [sessionActive, isPaused]);

  // Timer effect
  useEffect(() => {
    if (sessionActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive, isPaused]);

  // Session Control Handlers
  const handleStartWorkout = () => {
    setSessionActive(true);
    setIsPaused(false);
    voiceCoach.speak(`Starting ${exerciseTitles[exercise] || exercise}! Get ready.`, true);
  };

  const handlePauseWorkout = () => {
    setIsPaused(true);
    voiceCoach.speak('Workout paused');
  };

  const handleResumeWorkout = () => {
    setIsPaused(false);
    voiceCoach.speak('Resuming workout');
  };

  const handleResetWorkout = () => {
    if (aiClientRef.current) {
      aiClientRef.current.resetSession();
    }
    setReps(0);
    setSeconds(0);
    setStage('START');
    setFeedback('Session reset. Ready to begin.');
  };

  const handleFinishWorkout = () => {
    setSessionActive(false);
    setIsPaused(true);
    setShowSummaryModal(true);

    // Blast celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch (e) {}

    voiceCoach.speak(`Great work! You completed ${reps} repetitions!`, true);
  };

  const handleSaveToProfile = async () => {
    setSavingWorkout(true);
    try {
      await workoutService.saveWorkout({
        exercise,
        reps,
        duration: Math.max(1, seconds),
        formScore,
        feedback: feedbackHistory.length > 0 ? feedbackHistory : ['Good session completed'],
      });
      setSavedSuccess(true);
      setToastMessage('Workout session successfully recorded to your profile!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1600);
    } catch (err) {
      console.error('Error saving workout:', err);
      setToastMessage('Could not save workout to server. Please try again.');
    } finally {
      setSavingWorkout(false);
    }
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceCoach.setEnabled(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/exercises')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Back to Exercises"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {exerciseTitles[exercise] || exercise}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MediaPipe AI Pose Engine</span>
              <span>•</span>
              <span className="font-mono text-cyan-400">{latencyMs}ms</span>
            </div>
          </div>
        </div>

        {/* Timer & Sound Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-lg font-bold text-white">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{formatTime(seconds)}</span>
          </div>

          <button
            onClick={toggleVoice}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceEnabled
                ? 'bg-cyan-950/70 border-cyan-800/40 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={voiceEnabled ? 'Voice Coach On' : 'Voice Coach Muted'}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Feed & Skeleton Overlay (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl bg-[#070b13] flex items-center justify-center">
            {/* Webcam Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Skeleton Overlay Canvas */}
            <SkeletonCanvas
              videoRef={videoRef}
              landmarks={landmarks}
              angles={angles}
              formType={feedbackType}
            />

            {/* Hidden frame capture canvas */}
            <canvas ref={captureCanvasRef} className="hidden" />

            {/* Camera Error / Standby Overlay */}
            {!cameraStarted && (
              <div className="absolute inset-0 bg-[#070b13]/90 flex flex-col items-center justify-center p-6 text-center">
                <Camera className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">
                  {cameraError || 'Waiting for webcam feed...'}
                </p>
                {cameraError && (
                  <button
                    onClick={startCamera}
                    className="mt-4 px-4 py-2 text-xs font-bold bg-cyan-500 text-slate-950 rounded-xl"
                  >
                    Retry Camera
                  </button>
                )}
              </div>
            )}

            {/* Live Indicator Badge */}
            {cameraStarted && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-white">
                <span className={`w-2.5 h-2.5 rounded-full ${sessionActive && !isPaused ? 'bg-rose-500 animate-ping' : 'bg-slate-500'}`} />
                <span>{sessionActive ? (isPaused ? 'PAUSED' : 'TRACKING') : 'READY'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Metrics & Feedback HUD (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Rep Ring & Form Score Header */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-around">
              <RepRing reps={reps} target={15} justCompleted={repJustCompleted} />

              <div className="flex flex-col items-center justify-center pl-4 border-l border-slate-800">
                <div className="text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Form Score</span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-4xl font-black text-emerald-400">{formScore}</span>
                    <span className="text-sm text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Est. Calories</span>
                  <p className="text-xl font-bold text-cyan-400 mt-0.5">
                    {Math.round(reps * 0.4 + (seconds / 60) * 2)} kcal
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time Feedback Cue */}
            <FeedbackBadge
              stage={stage}
              feedback={feedback}
              type={feedbackType}
              score={formScore}
            />

            {/* Live Joint Angle Meter */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <AngleMeter
                label={currentAngleConfig.label}
                angle={angles[currentAngleConfig.key] || 0}
                targetRange={currentAngleConfig.target}
              />
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            {!sessionActive ? (
              <button
                onClick={handleStartWorkout}
                className="flex-1 py-4 px-6 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                Start Session
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={handleResumeWorkout}
                    className="flex-1 py-4 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={handlePauseWorkout}
                    className="flex-1 py-4 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                )}

                <button
                  onClick={handleFinishWorkout}
                  className="flex-1 py-4 px-4 rounded-xl font-bold text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finish Workout
                </button>
              </>
            )}

            <button
              onClick={handleResetWorkout}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Reset Reps & Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary / Save Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-cyan-500/30 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-[2px] mx-auto mb-3 shadow-lg shadow-cyan-500/30">
                <div className="w-full h-full bg-[#070b13] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Workout Completed!</h2>
              <p className="text-sm text-slate-400 mt-1">
                Outstanding effort! Here is your AI biomechanical summary.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-slate-400">Total Reps</p>
                <p className="text-3xl font-black text-cyan-400 mt-1">{reps}</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-slate-400">Duration</p>
                <p className="text-2xl font-black text-white mt-1 font-mono">{formatTime(seconds)}</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-slate-400">Form Score</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">{formScore}%</p>
              </div>
            </div>

            {/* Feedback Points */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Form Highlights</p>
              <ul className="space-y-1 text-xs text-slate-300">
                {feedbackHistory.length > 0 ? (
                  feedbackHistory.map((fb, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{fb}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">Full movement range demonstrated.</li>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleSaveToProfile}
                disabled={savingWorkout || savedSuccess}
                className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingWorkout ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recording to Database...
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Saved! Redirecting...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Save to Profile & Dashboard
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Discard & Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default WorkoutSessionPage;
