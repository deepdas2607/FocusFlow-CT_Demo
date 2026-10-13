// ============================================================================
// FILE: frontend/src/views/SidebarNavigationView.jsx
// PURPOSE: MVVM "View" for the FocusFlow left sidebar navigation and status controls.
// ============================================================================

import React from 'react';

export default function SidebarNavigationView({
  activeTab,
  onSelectTab,
  user,
  activeSession,
  secondsRemaining,
  activityLogsCount,
  isInspectorOpen,
  onToggleInspector,
  clevertapConfig,
  isProUser,
  onOpenProModal,
  onSignOut
}) {
  // Formats remaining timer seconds into MM:SS for the sidebar badge
  function formatShortTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'focus',
      label: 'Focus Timer',
      badge: activeSession ? formatShortTime(secondsRemaining) : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      {/* Top Logo & Navigation Links */}
      <div className="p-5">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight block leading-none">
              FocusFlow
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Deep Work &amp; Habits
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-indigo-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Controls & User Account Card */}
      <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/50">
        {/* Pro Membership Banner / Upgrade Trigger */}
        <div
          onClick={onOpenProModal}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            isProUser
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-900'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span>⭐</span> {isProUser ? 'Pro Member' : 'FocusFlow Pro'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-indigo-700">
              {isProUser ? 'ACTIVE' : 'Upgrade'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            {isProUser ? 'All Pro focus perks unlocked' : 'Fires CleverTap "Charged" purchase event'}
          </p>
        </div>

        {/* CleverTap SDK Connection Status Pill */}
        <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-600">CleverTap SDK</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded ${
              clevertapConfig?.isOffline
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {clevertapConfig?.isOffline ? 'OFFLINE (Queued)' : `ONLINE (${clevertapConfig?.region || 'eu1'})`}
          </span>
        </div>

        {/* Live Activity & Payload Inspector Toggle Button */}
        <button
          type="button"
          onClick={onToggleInspector}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isInspectorOpen
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Activity &amp; Payloads
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
              isInspectorOpen ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {activityLogsCount}
          </span>
        </button>

        {/* Signed-in User Summary */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Switch Account / Sign Out"
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
