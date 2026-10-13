// ============================================================================
// FILE: frontend/src/views/ProgressAnalyticsView.jsx
// PURPOSE: MVVM "View" for the Progress & Habit Analytics screen.
// ============================================================================

import React from 'react';
import { TASK_CATEGORIES } from '../models/focusFlowModels';

export default function ProgressAnalyticsView({ dashboard, tasks, sessions }) {
  // Formats raw focus minutes into hours and minutes (e.g. "2h 15m")
  function formatMinutes(totalMinutes) {
    const mins = Number(totalMinutes) || 0;
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
  }

  // Computes a 7-day array of completed focus sessions for the weekly bar chart
  function computeWeeklyActivityBars() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const completedForDay = sessions.filter((s) => {
        if (s.status !== 'COMPLETED') return false;
        const ts = s.completedAt || s.startedAt;
        return ts && ts.startsWith(dateStr);
      });

      const minutesForDay = completedForDay.reduce(
        (sum, s) => sum + (Number(s.duration) || 0),
        0
      );

      days.push({
        dayLabel,
        count: completedForDay.length,
        minutes: minutesForDay
      });
    }
    return days;
  }

  const weeklyBars = computeWeeklyActivityBars();
  const maxSessionsInDay = Math.max(...weeklyBars.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Progress &amp; Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track how you are building your daily focus habit over time.
        </p>
      </div>

      {/* 1. Lifetime Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Tasks Completed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {dashboard.totalTasksCompleted}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Sessions Completed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {dashboard.totalFocusSessionsCompleted}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Total Focus Time</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatMinutes(dashboard.totalFocusMinutes)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Current Streak</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {dashboard.currentStreak}d
          </p>
        </div>
      </div>

      {/* 2. Weekly Activity Bar Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Focus Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Weekly Focus Activity (Last 7 Days)
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Number of completed Pomodoro sessions per day
          </p>

          <div className="flex items-end justify-between gap-3 h-40 pt-4">
            {weeklyBars.map((item, idx) => {
              const barHeightPx =
                item.count > 0 ? Math.max(20, Math.round((item.count / maxSessionsInDay) * 110)) : 6;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    {item.count > 0 ? `${item.count}` : ''}
                  </span>
                  <div className="w-full flex items-end justify-center h-28">
                    <div
                      style={{ height: `${barHeightPx}px` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                        item.count > 0 ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{item.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Tasks by Category
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Completion rate across your focus areas
          </p>

          <div className="space-y-4">
            {TASK_CATEGORIES.map((category) => {
              const catTasks = tasks.filter((t) => t.category === category);
              const catCompleted = catTasks.filter((t) => t.completed).length;
              const pct = catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-700">{category}</span>
                    <span className="text-slate-500">
                      {catCompleted} / {catTasks.length} completed ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Full Session History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Focus Session Log</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No focus sessions logged yet.</p>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{session.taskTitle}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Duration: {session.duration} minutes · Started {new Date(session.startedAt).toLocaleString()}
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

