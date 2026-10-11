'use client';

/**
 * FocusFlow Dashboard Page (app/dashboard/page.tsx)
 * 
 * Architecture & Features:
 * 1. Single API Fetch: On component mount (`useEffect`), calls GET /api/dashboard via `dashboardApi.getData()`.
 *    This receives today's tasks, streak count, completed counts, and total focus minutes in one trip.
 * 2. Personalization: Displays a time-aware greeting ('Good morning' / 'Good afternoon' / 'Good evening')
 *    and the user's first name.
 * 3. Quick Actions: Provides immediate navigation to launch a focus session timer (`/focus`)
 *    or jump to full task management (`/tasks`).
 * 4. Responsive UI: Renders summary metric cards in a grid and a list of today's highest priority tasks.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi, DashboardData, Task } from '../../lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Stores aggregated statistics received from the backend
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // UI state for loading indicators and error banners
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data once when the component mounts
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await dashboardApi.getData();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Could not load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /**
   * Helper: formatFocusTime
   * Formats raw minutes into a clean human-readable string:
   * - 45 -> "45m"
   * - 120 -> "2h"
   * - 135 -> "2h 15m"
   */
  const formatFocusTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  /**
   * Helper: getGreeting
   * Computes a natural greeting string based on the user's local clock hour.
   */
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };


  return (
    <AppLayout>
      {/* Page header with greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s how you&apos;re doing today.</p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Dashboard content */}
      {dashboardData && !isLoading && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="✅"
              label="Tasks Today"
              value={`${dashboardData.tasksCompletedToday} / ${dashboardData.todaysTasks.length}`}
            />
            <StatCard
              icon="🔥"
              label="Current Streak"
              value={`${dashboardData.currentStreak} day${dashboardData.currentStreak !== 1 ? 's' : ''}`}
            />
            <StatCard
              icon="🏆"
              label="Tasks Completed"
              value={String(dashboardData.totalTasksCompleted)}
            />
            <StatCard
              icon="⏱️"
              label="Focus Time"
              value={formatFocusTime(dashboardData.totalFocusMinutes)}
            />
          </div>

          {/* Start Focus Session button */}
          <div className="bg-indigo-600 rounded-2xl p-6 mb-8 text-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Ready to focus?</h2>
              <p className="text-indigo-200 text-sm">Start a timed session to get things done.</p>
            </div>
            <button
              onClick={() => router.push('/focus')}
              className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shrink-0"
            >
              Start Session →
            </button>
          </div>

          {/* Today's tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Tasks</h2>
              <button
                onClick={() => router.push('/tasks')}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                View all →
              </button>
            </div>

            {dashboardData.todaysTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-gray-500 mb-4">No tasks created today yet.</p>
                <button
                  onClick={() => router.push('/tasks')}
                  className="text-indigo-600 font-medium hover:text-indigo-700"
                >
                  Create your first task →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.todaysTasks.slice(0, 5).map((task) => (
                  <DashboardTaskRow key={task.id} task={task} />
                ))}
                {dashboardData.todaysTasks.length > 5 && (
                  <button
                    onClick={() => router.push('/tasks')}
                    className="w-full text-center text-sm text-indigo-600 font-medium py-2 hover:text-indigo-700"
                  >
                    +{dashboardData.todaysTasks.length - 5} more tasks
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function DashboardTaskRow({ task }: { task: Task }) {
  const priorityColors: Record<string, string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      {/* Completion indicator */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
          task.completed
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-300'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-gray-900 truncate ${
            task.completed ? 'line-through text-gray-400' : ''
          }`}
        >
          {task.title}
        </p>
        <p className="text-xs text-gray-400">{task.category}</p>
      </div>
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${
          priorityColors[task.priority] || 'bg-gray-100 text-gray-600'
        }`}
      >
        {task.priority}
      </span>
    </div>
  );
}

