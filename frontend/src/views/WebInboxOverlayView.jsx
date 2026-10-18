// ============================================================================
// FILE: frontend/src/views/WebInboxOverlayView.jsx
// PURPOSE: Official CleverTap Web Inbox Window (<ct-web-inbox>):
// - Renders notifications stacked under the Web Inbox window
// - Operational Scenarios:
//     1. Click selector -> toggles open/close
//     2. Click outside anywhere on the page -> auto-closes
//     3. Close button -> closes
// - Notification Viewed (viewed once per message) & Notification Clicked tracking
// - Recommended Image Specs:
//     * Text with icon: Icon 1:1
//     * Text with icon and image: Icon 1:1, Image 4:3
// - Font family & CSS overrides (--inbox-width, --inbox-height, positioning)
// - Mobile fullscreen behavior (<= 480px)
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';

export default function WebInboxOverlayView({
  isOpen,
  onClose,
  messages = [],
  unreadCount = 0,
  positionStyle = {},
  inboxStyles = {},
  onNotificationViewed,
  onNotificationClicked,
  onMarkRead,
  onMarkAllRead,
  onDeleteMessage
}) {
  const inboxRef = useRef(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Filter messages based on tab
  const displayedMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.isRead;
    return true;
  });

  // Track Notification Viewed for newly visible messages (CleverTap spec: raised only once per message)
  useEffect(() => {
    if (isOpen && displayedMessages.length > 0 && onNotificationViewed) {
      displayedMessages.forEach((msg) => {
        onNotificationViewed(msg);
      });
    }
  }, [isOpen, displayedMessages, onNotificationViewed]);

  // Operational Scenario: If inbox is open and user clicks anywhere else on the page, close inbox
  useEffect(() => {
    if (!isOpen) return;

    function handlePageClick(e) {
      // Check if click was inside inbox or inside the bell trigger
      if (inboxRef.current && inboxRef.current.contains(e.target)) {
        return;
      }
      const bellTrigger = document.getElementById('ct-inbox-bell-trigger');
      if (bellTrigger && bellTrigger.contains(e.target)) {
        return;
      }
      onClose();
    }

    // Capture click outside
    document.addEventListener('mousedown', handlePageClick);
    document.addEventListener('touchstart', handlePageClick);

    return () => {
      document.removeEventListener('mousedown', handlePageClick);
      document.removeEventListener('touchstart', handlePageClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const width = inboxStyles.width || '392px';
  const height = inboxStyles.height || '546px';
  const fontFamily = inboxStyles.fontFamily || 'inherit';

  // Inline CSS variables matching ct-web-inbox documentation
  const customCssVars = {
    '--inbox-width': width,
    '--inbox-height': height,
    fontFamily
  };

  return (
    <div
      ref={inboxRef}
      id="ct-web-inbox-wrapper"
      style={{
        ...positionStyle,
        ...customCssVars
      }}
      className="fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150"
    >
      {/* 1. Web Inbox Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">Web Inbox</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">Personalized notifications</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-[11px] text-indigo-300 hover:text-white font-medium transition-colors cursor-pointer"
              title="Mark all as read"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Inbox"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. Filter Tabs (All / Unread) */}
      <div className="flex items-center border-b border-slate-100 bg-slate-50/70 px-4 py-2 shrink-0 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-white text-indigo-600 shadow-2xs font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          All ({messages.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-white text-indigo-600 shadow-2xs font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* 3. Messages List Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50/30">
        {displayedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center text-slate-400 space-y-2">
            <span className="text-3xl">📭</span>
            <p className="text-sm font-semibold text-slate-600">No notifications here</p>
            <p className="text-xs text-slate-400">
              {filter === 'unread'
                ? 'All caught up! No unread notifications right now.'
                : 'Your inbox is clear.'}
            </p>
          </div>
        ) : (
          displayedMessages.map((msg) => (
            <div
              key={msg.id || msg.msgId}
              onClick={() => onNotificationClicked && onNotificationClicked(msg)}
              className={`p-4 transition-all cursor-pointer hover:bg-indigo-50/40 relative ${
                !msg.isRead ? 'bg-indigo-50/20' : 'bg-white'
              }`}
            >
              {/* Unread indicator dot */}
              {!msg.isRead && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-600" />
              )}

              {/* TEMPLATE A: TEXT WITH ICON (Icon 1:1 Aspect Ratio) */}
              {msg.template === 'text_icon' && (
                <div className="flex items-start gap-3.5">
                  {msg.iconUrl && (
                    <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.iconUrl}
                        alt="icon"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {msg.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {msg.body}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      {msg.actionText && (
                        <span className="text-[11px] font-semibold text-indigo-600 hover:underline">
                          {msg.actionText} →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE B: TEXT WITH ICON & IMAGE (Icon 1:1, Image 4:3 Aspect Ratio) */}
              {msg.template === 'text_icon_image' && (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    {msg.iconUrl && (
                      <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.iconUrl}
                          alt="icon"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {msg.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {msg.imageUrl && (
                    <div className="w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.imageUrl}
                        alt="banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {msg.body}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      clevertap.renderNotificationViewed()
                    </span>
                    {msg.actionText && (
                      <span className="text-[11px] font-semibold text-indigo-600 hover:underline">
                        {msg.actionText} →
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* TEMPLATE C: SIMPLE TEXT */}
              {msg.template === 'simple_text' && (
                <div className="space-y-1.5 pr-3">
                  <h4 className="text-xs font-bold text-slate-900">
                    {msg.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {msg.body}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    {msg.actionText && (
                      <span className="text-[11px] font-semibold text-indigo-600 hover:underline">
                        {msg.actionText} →
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Card Footer Controls (Mark Read & Delete) */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                {!msg.isRead ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead && onMarkRead(msg.msgId || msg.id);
                    }}
                    className="hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    Mark as read
                  </button>
                ) : (
                  <span className="text-slate-400">Read</span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMessage && onDeleteMessage(msg.msgId || msg.id);
                  }}
                  className="hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete notification"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0">
        <span className="text-[10px] text-slate-500 font-mono">
          Powered by CleverTap Web SDK (eu1)
        </span>
      </div>
    </div>
  );
}
