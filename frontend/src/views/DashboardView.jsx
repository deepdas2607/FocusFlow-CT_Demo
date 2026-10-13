// ============================================================================
// FILE: frontend/src/views/DashboardView.jsx
// PURPOSE: MVVM "View" for the main FocusFlow Dashboard screen.
// ============================================================================

import React from 'react';

export default function DashboardView({
  user,
  dashboard,
  onNavigateTab,
  onToggleTaskComplete
}) {
  // Returns a time-appropriate greeting based on the user's current hour
  function getTimeOfDayGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  // Formats total focus minutes into a clean human-readable string (e.g. "1h 10m")
  function formatFocusMinutes(totalMinutes) {
    const mins = Number(totalMinutes) || 0;
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
  }

  const firstName = (user?.name || 'User').split(' ')[0];
  const priorityBadgeStyles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="space-y-8">
      {/* 1. Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {getTimeOfDayGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Primary Goal: <span className="font-semibold text-indigo-600">{user?.focusGoal || 'Deep Work'}</span> · Here is your daily productivity overview.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('tasks')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            + New Task
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('focus')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Start Focus Session
          </button>
        </div>
      </div>

      {/* 2. Summary Metric Cards (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Completed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Tasks Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {dashboard.totalTasksCompleted} <span className="text-sm font-normal text-slate-400">/ {dashboard.totalTasksCount}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {dashboard.tasksCompletedToday} completed today
          </p>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Current Streak</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {dashboard.currentStreak} {dashboard.currentStreak === 1 ? 'day' : 'days'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Active daily habit</p>
        </div>

        {/* Focus Sessions Done */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Focus Sessions</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {dashboard.totalFocusSessionsCompleted}
          </p>
          <p className="text-xs text-slate-500 mt-1">Completed Pomodoros</p>
        </div>

        {/* Total Focus Time */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Focus Time</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatFocusMinutes(dashboard.totalFocusMinutes)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Logged in SQLite DB</p>
        </div>
      </div>

      {/* 3. Hero Call-to-Action Banner */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Ready to enter deep work?</h2>
          <p className="text-indigo-100 text-sm mt-1">
            Launch a timed Pomodoro session linked to one of your tasks and track your focus progress.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('focus')}
          className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-sm px-6 py-3 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          Launch Focus Timer →
        </button>
      </div>

      {/* 4. Today's Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Active Tasks</h2>
            <p className="text-xs text-slate-500">Click any checkbox to mark a task completed</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('tasks')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            Manage all tasks →
          </button>
        </div>

        {(!dashboard.todaysTasks || dashboard.todaysTasks.length === 0) ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm text-slate-500 mb-3">No tasks created yet.</p>
            <button
              type="button"
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              + Create your first task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dashboard.todaysTasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  task.completed
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleTaskComplete(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      task.completed
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {task.completed && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {task.category} · Est. {task.estimatedMinutes || 25}m
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                    priorityBadgeStyles[task.priority] || 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
