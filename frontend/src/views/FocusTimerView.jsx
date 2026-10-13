// ============================================================================
// FILE: frontend/src/views/FocusTimerView.jsx
// PURPOSE: MVVM "View" for the Pomodoro Focus Timer screen with circular progress ring.
// ============================================================================

import React from 'react';
import { TIMER_PRESETS } from '../models/focusFlowModels';

export default function FocusTimerView({
  tasks,
  sessions,
  activeSession,
  selectedPreset,
  secondsRemaining,
  selectedTaskId,
  onSelectTaskId,
  onSelectPreset,
  onStartSession,
  onCompleteSession,
  onAbandonSession
}) {
  // Formats raw seconds into MM:SS digital display
  function formatClockDisplay(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Computes SVG circle stroke offset for smooth countdown progress ring
  const totalSecondsForPreset = selectedPreset?.seconds || 1500;
  const progressFraction = Math.max(
    0,
    Math.min(1, secondsRemaining / totalSecondsForPreset)
  );
  const circleRadius = 96;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progressFraction);

  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Focus Timer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a duration, link a task, and stay in uninterrupted flow.
        </p>
      </div>

      {/* Main Timer Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs flex flex-col items-center">
        {/* 1. Preset Duration Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {TIMER_PRESETS.map((preset) => {
            const isSelected = selectedPreset?.label === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                disabled={Boolean(activeSession)}
                onClick={() => onSelectPreset(preset)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* 2. Circular SVG Countdown Ring */}
        <div className="relative w-60 h-60 flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
            <circle
              cx="110"
              cy="110"
              r={circleRadius}
              stroke="#F1F5F9"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="110"
              cy="110"
              r={circleRadius}
              stroke={activeSession ? '#4F46E5' : '#94A3B8'}
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-extrabold font-mono text-slate-900 tracking-tight">
              {formatClockDisplay(secondsRemaining)}
            </span>
            <span className="text-xs font-semibold text-indigo-600 mt-2">
              {activeSession ? 'SESSION IN PROGRESS' : selectedPreset?.label}
            </span>
          </div>
        </div>

        {/* 3. Optional Task Linker */}
        <div className="w-full max-w-md mb-6">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-center">
            Link to an Active Task (Optional)
          </label>
          <select
            disabled={Boolean(activeSession)}
            value={selectedTaskId}
            onChange={(e) => onSelectTaskId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:bg-slate-100"
          >
            <option value="">General Deep Work Session (No specific task)</option>
            {pendingTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} ({task.category})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Start / Complete / Abandon Action Buttons */}
        {!activeSession ? (
          <button
            type="button"
            onClick={onStartSession}
            className="w-full max-w-md py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm cursor-pointer"
          >
            Start Focus Session
          </button>
        ) : (
          <div className="w-full max-w-md grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onCompleteSession(activeSession.id)}
              className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Complete Session
            </button>
            <button
              type="button"
              onClick={onAbandonSession}
              className="py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold transition-colors cursor-pointer"
            >
              Abandon Session
            </button>
          </div>
        )}
      </div>

      {/* Recent Focus Sessions History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Recent Timer Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No focus sessions recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {sessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{session.taskTitle}</p>
                  <p className="text-xs text-slate-500">
                    {session.duration} min · {new Date(session.startedAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    session.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
