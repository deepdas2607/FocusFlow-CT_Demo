'use client';

/**
 * Focus Session page - The core productivity feature.
 *
 * How it works:
 * 1. User selects a task (optional) and a duration (25/45/60 min)
 * 2. User clicks Start - the backend creates a session record
 * 3. A countdown timer runs in the browser
 * 4. User can Pause, Resume, Complete, or Abandon the session
 * 5. On Complete/Abandon, the backend is notified
 *
 * NOTE: The timer is client-side only (JavaScript setInterval).
 * The session record in the database tracks start time and status.
 * If the user closes the tab, the session remains "STARTED" in the DB.
 * This is intentional - we keep the backend simple.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { focusApi, tasksApi, Task, FocusSession } from '../../lib/api';

type SessionState = 'idle' | 'running' | 'paused' | 'completed' | 'abandoned';

const DURATION_OPTIONS = [
  { label: '25 min', value: 25, description: 'Pomodoro' },
  { label: '45 min', value: 45, description: 'Deep work' },
  { label: '60 min', value: 60, description: 'Flow state' },
];

export default function FocusPage() {
  // Tasks for the dropdown selector
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Track when the session was last paused (to calculate elapsed time properly)
  const pausedSecondsRef = useRef(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load the user's incomplete tasks for the selector
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await tasksApi.getAll();
        // Only show incomplete tasks in the selector
        setTasks(response.tasks.filter((t) => !t.completed));
      } catch {
        // Non-critical - user can still start a session without a task
      }
    };
    loadTasks();
  }, []);

  // Update secondsRemaining when the user picks a different duration (before starting)
  useEffect(() => {
    if (sessionState === 'idle') {
      setSecondsRemaining(selectedDuration * 60);
    }
  }, [selectedDuration, sessionState]);

  // Timer countdown logic
  const startTimer = useCallback(() => {
    // Clear any existing timer before starting a new one
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timer reached zero - auto-complete the session
          clearInterval(timerIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Start a new focus session
  const handleStart = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await focusApi.start({
        taskId: selectedTaskId || undefined,
        duration: selectedDuration,
      });

      setCurrentSession(response.session);
      setSessionState('running');
      setSecondsRemaining(selectedDuration * 60);
      setSecondsElapsed(0);
      startTimer();
    } catch (err: any) {
      setError(err.message || 'Could not start focus session.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pause the running timer
  const handlePause = () => {
    stopTimer();
    setSessionState('paused');
    pausedSecondsRef.current = secondsElapsed;
  };

  // Resume a paused timer
  const handleResume = () => {
    setSessionState('running');
    startTimer();
  };

  // Complete the session (user finishes early or timer hits zero)
  const handleComplete = async () => {
    if (!currentSession) return;
    stopTimer();
    setIsLoading(true);

    try {
      const response = await focusApi.complete(currentSession.id);
      setCurrentSession(response.session);
      setSessionState('completed');
      setSuccessMessage('🎉 Great work! Focus session completed.');
    } catch (err: any) {
      setError(err.message || 'Could not complete session.');
    } finally {
      setIsLoading(false);
    }
  };

  // Abandon the session (user gives up early)
  const handleAbandon = async () => {
    if (!currentSession) return;
    if (!confirm('Are you sure you want to abandon this focus session?')) return;

    stopTimer();
    setIsLoading(true);

    try {
      const response = await focusApi.abandon(currentSession.id);
      setCurrentSession(response.session);
      setSessionState('abandoned');
      setSuccessMessage('Session ended. Better luck next time!');
    } catch (err: any) {
      setError(err.message || 'Could not abandon session.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to idle state so the user can start a new session
  const handleReset = () => {
    setSessionState('idle');
    setCurrentSession(null);
    setSecondsRemaining(selectedDuration * 60);
    setSecondsElapsed(0);
    setSuccessMessage('');
    setError('');
  };

  // Format seconds as "MM:SS"
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Calculate what percentage of the session has elapsed (for the progress ring)
  const progressPercentage = selectedDuration > 0
    ? ((selectedDuration * 60 - secondsRemaining) / (selectedDuration * 60)) * 100
    : 0;

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <AppLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Focus Session</h1>
        <p className="text-gray-500 mt-1">
          Pick a task, choose your duration, and get to work.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
          {successMessage}
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {/* Session setup (shown when idle) */}
        {sessionState === 'idle' && (
          <div className="space-y-6">
            {/* Task selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="task-select" className="block text-sm font-medium text-gray-700 mb-3">
                Task to focus on (optional)
              </label>
              <select
                id="task-select"
                value={selectedTaskId || ''}
                onChange={(e) =>
                  setSelectedTaskId(e.target.value ? parseInt(e.target.value, 10) : null)
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              >
                <option value="">No specific task</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Session duration</p>
              <div className="grid grid-cols-3 gap-3">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-colors ${
                      selectedDuration === option.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-lg">{option.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Starting...' : '▶ Start Focus Session'}
            </button>
          </div>
        )}

        {/* Active session timer */}
        {(sessionState === 'running' || sessionState === 'paused') && (
          <div className="space-y-6">
            {/* Task label */}
            {selectedTask && (
              <div className="text-center text-gray-500 text-sm">
                Focusing on: <span className="font-medium text-gray-900">{selectedTask.title}</span>
              </div>
            )}

            {/* Timer display */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              {/* Circular progress indicator */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercentage / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                {/* Time in the center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-4xl font-bold text-gray-900 font-mono">
                      {formatTime(secondsRemaining)}
                    </p>
                    <p className="text-sm text-gray-400 text-center">
                      {sessionState === 'paused' ? 'Paused' : 'Remaining'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Elapsed time */}
              <p className="text-sm text-gray-500 mb-6">
                Elapsed: {formatTime(secondsElapsed)}
              </p>

              {/* Control buttons */}
              <div className="flex gap-3 justify-center">
                {sessionState === 'running' ? (
                  <button
                    onClick={handlePause}
                    className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-200 transition-colors"
                  >
                    ⏸ Pause
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-colors"
                  >
                    ▶ Resume
                  </button>
                )}

                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  ✓ Complete
                </button>

                <button
                  onClick={handleAbandon}
                  disabled={isLoading}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  ✕ Abandon
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session ended (completed or abandoned) */}
        {(sessionState === 'completed' || sessionState === 'abandoned') && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
            <div className="text-5xl mb-4">
              {sessionState === 'completed' ? '🎉' : '😔'}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {sessionState === 'completed' ? 'Session Complete!' : 'Session Ended'}
            </h2>
            <p className="text-gray-500">
              You focused for {formatTime(secondsElapsed)}.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start Another Session
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

