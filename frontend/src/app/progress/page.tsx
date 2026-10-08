'use client';

/**
 * Progress page - Shows the user's productivity statistics over time.
 *
 * Displays:
 * - Total tasks completed
 * - Total focus sessions
 * - Total focus time
 * - Current streak
 * - Recent focus sessions list
 *
 * No external charting library - we use simple inline bars for weekly activity.
 */

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { dashboardApi, focusApi, FocusSession } from '../../lib/api';

export default function ProgressPage() {
  const [stats, setStats] = useState({
    totalTasksCompleted: 0,
    totalFocusSessions: 0,
    totalFocusMinutes: 0,
    currentStreak: 0,
  });
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        // Load dashboard stats and focus history in parallel
        const [dashboardData, historyData] = await Promise.all([
          dashboardApi.getData(),
          focusApi.getHistory(),
        ]);

        setStats({
          totalTasksCompleted: dashboardData.totalTasksCompleted,
          totalFocusSessions: dashboardData.totalFocusSessionsCompleted,
          totalFocusMinutes: dashboardData.totalFocusMinutes,
          currentStreak: dashboardData.currentStreak,
        });

        setRecentSessions(historyData.sessions);
      } catch (err: any) {
        setError(err.message || 'Could not load progress data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressData();
  }, []);

  // Format minutes as "Xh Ym"
  const formatMinutes = (minutes: number): string => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Format a date string as "Oct 7, 2026"
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get the weekly activity data (last 7 days of sessions)
  const getWeeklyActivity = (): { day: string; count: number }[] => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Count completed sessions on this day
      const count = recentSessions.filter((session) => {
        if (session.status !== 'COMPLETED' || !session.completedAt) return false;
        const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
        return sessionDate === dateStr;
      }).length;

      days.push({ day: dayName, count });
    }
    return days;
  };

  const weeklyActivity = getWeeklyActivity();
  const maxDayCount = Math.max(...weeklyActivity.map((d) => d.count), 1);

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700',
    ABANDONED: 'bg-red-100 text-red-700',
    STARTED: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <AppLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Progress</h1>
        <p className="text-gray-500 mt-1">See how you&apos;re building your focus habit.</p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-16">
          <p className="text-gray-500">Loading your progress...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon="✅" label="Tasks Completed" value={String(stats.totalTasksCompleted)} />
            <StatCard icon="⏱️" label="Sessions Done" value={String(stats.totalFocusSessions)} />
            <StatCard icon="🕐" label="Focus Time" value={formatMinutes(stats.totalFocusMinutes)} />
            <StatCard
              icon="🔥"
              label="Current Streak"
              value={`${stats.currentStreak}d`}
            />
          </div>

          {/* Weekly activity chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Activity (Last 7 Days)
            </h2>
            {weeklyActivity.every((d) => d.count === 0) ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No focus sessions in the last 7 days.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start your first session to see activity here!
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-2 h-32">
                {weeklyActivity.map(({ day, count }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    {/* Bar */}
                    <div className="w-full flex items-end justify-center" style={{ height: '96px' }}>
                      <div
                        className="w-full bg-indigo-500 rounded-t-md transition-all"
                        style={{
                          height: count > 0 ? `${(count / maxDayCount) * 96}px` : '4px',
                          backgroundColor: count > 0 ? '#6366f1' : '#e5e7eb',
                        }}
                      />
                    </div>
                    {/* Day label */}
                    <span className="text-xs text-gray-500">{day}</span>
                    {/* Count */}
                    <span className="text-xs font-medium text-gray-700">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent sessions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>

            {recentSessions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <p className="text-gray-500">You haven&apos;t completed any focus sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                  >
                    {/* Session info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {session.duration}-minute session
                      </p>
                      {session.task && (
                        <p className="text-sm text-gray-500 truncate">
                          Task: {session.task.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(session.startedAt)}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        statusColors[session.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {session.status.charAt(0) + session.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}

// ─── StatCard component ───────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

