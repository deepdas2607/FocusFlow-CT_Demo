// ============================================================================
// FILE: frontend/src/views/ActivityLogInspectorView.jsx
// PURPOSE: MVVM "View" for the collapsible Live Activity & Payload Inspector.
// Shows real-time SQLite Backend requests and CleverTap SDK JSON payloads.
// ============================================================================

import React, { useMemo, useState } from 'react';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All', badgeColor: 'bg-slate-700 text-slate-200' },
  { id: 'CLEVERTAP_SDK', label: 'CleverTap SDK', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'CLEVERTAP_WEBPUSH', label: 'Web Push', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { id: 'CLEVERTAP_POPUP', label: 'Web Pop-ups', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'CLEVERTAP_NATIVE', label: 'Native Display', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'CLEVERTAP_INBOX', label: 'Web Inbox', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'BACKEND_SQLITE', label: 'SQLite DB', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40' }
];

export default function ActivityLogInspectorView({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onPurgeCache = () => {}
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Calculates counts per category dynamically for easy tab badge rendering
  const { categoryCounts, filteredLogs } = useMemo(() => {
    const logsList = Array.isArray(logs) ? logs : [];
    const counts = { ALL: logsList.length };
    CATEGORY_TABS.forEach((cat) => {
      if (cat.id !== 'ALL') counts[cat.id] = 0;
    });

    for (let i = 0; i < logsList.length; i++) {
      const src = logsList[i].source;
      if (counts[src] !== undefined) {
        counts[src] += 1;
      }
    }

    const filtered =
      selectedCategory === 'ALL'
        ? logsList
        : logsList.filter((entry) => entry.source === selectedCategory);

    return { categoryCounts: counts, filteredLogs: filtered };
  }, [logs, selectedCategory]);

  if (!isOpen) return null;

  // Returns category-specific styling and friendly display badge
  function getCategoryBadge(source) {
    switch (source) {
      case 'CLEVERTAP_SDK':
        return { label: 'CleverTap Core', className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'CLEVERTAP_WEBPUSH':
        return { label: 'Web Push', className: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'CLEVERTAP_POPUP':
        return { label: 'Pop-ups & Exit', className: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'CLEVERTAP_NATIVE':
        return { label: 'Native Display', className: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'CLEVERTAP_INBOX':
        return { label: 'Web Inbox', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'BACKEND_SQLITE':
        return { label: 'SQLite API', className: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      default:
        return { label: source, className: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  }

  return (
    <aside className="w-full lg:w-[440px] bg-slate-900 text-slate-100 border-l border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 shadow-2xl z-30">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white leading-none truncate">
              Live Activity &amp; Payload Inspector
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              Category-filtered CleverTap SDK &amp; API stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPurgeCache}
            title="Purge CleverTap LocalStorage Cache (WZRK_CAMP)"
            className="px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Purge Cache
          </button>
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

      {/* Category Filter Pills (Horizontal Scrollable, No Wrapping / No Clipping) */}
      <div className="px-3 py-2.5 bg-slate-950/70 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {CATEGORY_TABS.map((tab) => {
            const count = categoryCounts[tab.id] || 0;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stream of JSON Payloads */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-sans">
            <p className="text-sm font-medium">No activity payloads for this category yet.</p>
            <p className="text-xs mt-1 text-slate-400">
              Trigger actions on the site or switch categories to inspect event payloads.
            </p>
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const badge = getCategoryBadge(entry.source);
            return (
              <div
                key={entry.id}
                className="rounded-xl bg-slate-800/90 border border-slate-700/80 p-3 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{entry.timestamp}</span>
                </div>

                <div className="text-xs font-semibold text-white font-sans break-words">
                  {entry.actionName}
                </div>

                <pre className="text-[11px] text-slate-300 bg-slate-950/90 p-2.5 rounded-lg overflow-x-auto break-words whitespace-pre-wrap leading-relaxed max-h-72">
                  {JSON.stringify(entry.payload, null, 2)}
                </pre>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

