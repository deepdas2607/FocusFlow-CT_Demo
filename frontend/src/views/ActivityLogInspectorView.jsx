// ============================================================================
// FILE: frontend/src/views/ActivityLogInspectorView.jsx
// PURPOSE: MVVM "View" for the collapsible Live Activity & Payload Inspector.
// Shows real-time SQLite Backend requests and CleverTap SDK JSON payloads.
// ============================================================================

import React, { useState } from 'react';

export default function ActivityLogInspectorView({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) {
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL' | 'CLEVERTAP_SDK' | 'BACKEND_SQLITE'

  if (!isOpen) return null;

  const filteredLogs = logs.filter((entry) => {
    if (sourceFilter === 'ALL') return true;
    return entry.source === sourceFilter;
  });

  // Returns a badge color based on whether the log is from CleverTap SDK or SQLite Backend
  function getSourceBadgeClass(source) {
    if (source === 'CLEVERTAP_SDK') {
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
    if (source === 'BACKEND_SQLITE') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  }

  return (
    <aside className="w-full lg:w-[420px] bg-slate-900 text-slate-100 border-l border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 shadow-2xl z-30">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-white leading-none">
              Live Activity &amp; Payload Inspector
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Real-time CleverTap SDK &amp; SQLite API stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearLogs}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Close Inspector"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5">
        {[
          { id: 'ALL', label: `All (${logs.length})` },
          {
            id: 'CLEVERTAP_SDK',
            label: `CleverTap SDK (${logs.filter((l) => l.source === 'CLEVERTAP_SDK').length})`
          },
          {
            id: 'BACKEND_SQLITE',
            label: `SQLite DB (${logs.filter((l) => l.source === 'BACKEND_SQLITE').length})`
          }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSourceFilter(tab.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              sourceFilter === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stream of JSON Payloads */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-sans">
            <p className="text-sm">No activity payloads recorded yet.</p>
            <p className="text-xs mt-1">
              Create a task, start a focus session, or update your profile to inspect payloads.
            </p>
          </div>
        ) : (
          filteredLogs.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl bg-slate-800/90 border border-slate-700/80 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSourceBadgeClass(
                    entry.source
                  )}`}
                >
                  {entry.source}
                </span>
                <span className="text-[10px] text-slate-400">{entry.timestamp}</span>
              </div>

              <div className="text-xs font-semibold text-white font-sans">
                {entry.actionName}
              </div>

              <pre className="text-[11px] text-slate-300 bg-slate-950/90 p-2.5 rounded-lg overflow-x-auto leading-relaxed">
                {JSON.stringify(entry.payload, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

