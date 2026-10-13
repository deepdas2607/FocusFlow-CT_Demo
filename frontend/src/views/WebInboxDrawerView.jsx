// ============================================================================
// FILE: frontend/src/views/WebInboxDrawerView.jsx
// PURPOSE: MVVM "View" for the slide-over Notification Inbox drawer (#side-drawer)
// opened when clicking the Notification Bell (#bell-button).
// ============================================================================

import React from 'react';

export default function WebInboxDrawerView({ isOpen, onClose }) {
  if (!isOpen) return null;

  const inboxMessages = [
    {
      id: 'msg_1',
      title: 'Welcome to FocusFlow!',
      body: 'Start a 25-minute Pomodoro session today to begin your daily focus streak.',
      tag: 'Onboarding',
      time: 'Just now'
    },
    {
      id: 'msg_2',
      title: 'Daily Deep Work Reminder',
      body: 'Your highest-energy hours are in the morning. Pick 1 High Priority task and start your timer.',
      tag: 'Habit Nudge',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div
        id="side-drawer"
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between p-6"
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifications Inbox</h2>
              <p className="text-xs text-slate-500">
                In-App &amp; Web Inbox Messages (#side-drawer)
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {inboxMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {msg.tag}
                  </span>
                  <span className="text-[11px] text-slate-400">{msg.time}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{msg.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{msg.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
          Selector <span className="font-mono font-semibold text-slate-800">#bell-button</span> and container{' '}
          <span className="font-mono font-semibold text-slate-800">#side-drawer</span> are ready for Web Inbox bindings.
        </div>
      </div>
    </div>
  );
}
