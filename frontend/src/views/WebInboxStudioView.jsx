// ============================================================================
// FILE: frontend/src/views/WebInboxStudioView.jsx
// PURPOSE: Interactive Studio for CleverTap Web Inbox:
// - Operational Scenarios (open/close toggle, outside click dismissal)
// - 8 Position Modes with respect to the bell icon
// - Image aspect ratio specs (Icon 1:1, Image 4:3)
// - CSS overrides (--inbox-width, --inbox-height, font-family)
// - Complete 10-method JavaScript API suite tester
// ============================================================================

import React, { useState } from 'react';
import { INBOX_POSITION_MODES } from '../services/clevertapSdkService';

export default function WebInboxStudioView({
  inboxMessages = [],
  unreadCount = 0,
  isInboxOpen = false,
  onToggleInbox,
  inboxPosition = 'top-right',
  onSetPosition,
  inboxStyles = {},
  onUpdateStyles,
  onSimulateIncomingMessage,
  onMarkRead,
  onMarkAllRead,
  onDeleteMessage,
  onNotificationClicked,
  apiSuiteResults = null,
  onRunApiTest
}) {
  const [activeTab, setActiveTab] = useState('position'); // 'position' | 'simulate' | 'styling' | 'api'
  const [simTitle, setSimTitle] = useState('⚡ 2x XP Focus Hour Activated');
  const [simBody, setSimBody] = useState('Complete a 25-minute Pomodoro in the next hour to claim double productivity points.');
  const [simTemplate, setSimTemplate] = useState('text_icon_image'); // 'text_icon' | 'text_icon_image' | 'simple_text'
  const [simIconUrl, setSimIconUrl] = useState('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=128&h=128&q=80');
  const [simImageUrl, setSimImageUrl] = useState('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=600&q=80');
  const [simActionText, setSimActionText] = useState('Join Challenge');
  const [selectedApiMethod, setSelectedApiMethod] = useState('getInboxMessageCount');

  const positionOptions = [
    { id: INBOX_POSITION_MODES.TOP_RIGHT, label: 'Top-Right (Default)', desc: 'Below bell icon on right' },
    { id: INBOX_POSITION_MODES.TOP_LEFT, label: 'Top-Left', desc: 'Below bell icon on left' },
    { id: INBOX_POSITION_MODES.BOTTOM_RIGHT, label: 'Bottom-Right', desc: 'Above bell icon on right' },
    { id: INBOX_POSITION_MODES.BOTTOM_LEFT, label: 'Bottom-Left', desc: 'Above bell icon on left' },
    { id: INBOX_POSITION_MODES.TOP_CENTER, label: 'Top-Center', desc: 'Below bell icon centered' },
    { id: INBOX_POSITION_MODES.BOTTOM_CENTER, label: 'Bottom-Center', desc: 'Above bell icon centered' },
    { id: INBOX_POSITION_MODES.LEFT_CENTER, label: 'Left-Center', desc: 'Right of bell icon' },
    { id: INBOX_POSITION_MODES.RIGHT_CENTER, label: 'Right-Center', desc: 'Left of bell icon' }
  ];

  function handleCreateSimulated() {
    onSimulateIncomingMessage({
      title: simTitle,
      body: simBody,
      template: simTemplate,
      iconUrl: simIconUrl,
      imageUrl: simImageUrl,
      actionText: simActionText,
      actionUrl: '/timer'
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-400/30">
                Web Inbox Channel
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-400/30">
                &lt;ct-web-inbox&gt;
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-semibold border border-purple-400/30">
                8 Positioning Modes
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold border border-amber-400/30">
                Viewed &amp; Clicked Tracking
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2">CleverTap Web Inbox Studio</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Deliver personalized notifications in real time stacked under the Web Inbox window. Test bell trigger operational scenarios, 8 positioning anchors, template image ratios (Icon 1:1, Image 4:3), and custom CSS styling.
            </p>
          </div>

          {/* Quick Bell Trigger Tester Card */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Inbox Bell Trigger</div>
              <div className="text-sm font-bold font-mono text-indigo-300">
                {isInboxOpen ? 'Window OPEN' : 'Window CLOSED'}
              </div>
            </div>

            {/* Live Interactive Bell Element */}
            <button
              id="ct-inbox-bell-trigger-studio"
              type="button"
              onClick={onToggleInbox}
              className={`relative p-3 rounded-xl transition-all cursor-pointer shadow-md ${
                isInboxOpen
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Click to toggle Web Inbox"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span
                  id="unviewedBadge-studio"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Studio Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('position')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'position'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Operational Scenarios &amp; 8 Positions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('simulate')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'simulate'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Templates &amp; Aspect Ratios (1:1 / 4:3)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('styling')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'styling'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          CSS Variables &amp; Mobile Breakpoints
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'api'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          JavaScript API Reference Console
        </button>
      </div>

      {/* 3. TAB 1: OPERATIONAL SCENARIOS & 8 POSITIONS */}
      {activeTab === 'position' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 8 Positions Selector (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                8 Inbox Positioning Modes
              </h2>
              <p className="text-xs text-slate-500">
                According to CleverTap documentation, the Web Inbox window can be anchored in 8 distinct positions relative to the bell trigger. Select a positioning mode below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {positionOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSetPosition(opt.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      inboxPosition === opt.id
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                      {inboxPosition === opt.id && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-600">
                  Current anchor: <strong className="font-mono text-indigo-600">{inboxPosition}</strong>
                </span>
                <button
                  type="button"
                  onClick={onToggleInbox}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  {isInboxOpen ? 'Close Inbox Window' : 'Open Inbox Window'}
                </button>
              </div>
            </div>

            {/* Operational Scenarios Spec Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Official Operational Scenarios
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">1.</span>
                  <span><strong>Closed &rarr; Click Trigger:</strong> If inbox is closed and the user clicks on the inbox selector (<code className="font-mono text-indigo-600">#ct-inbox-bell-trigger</code>), the inbox is opened.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">2.</span>
                  <span><strong>Open &rarr; Click Trigger:</strong> If the inbox is open and the user clicks on the inbox selector, the inbox is closed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">3.</span>
                  <span><strong>Open &rarr; Click Outside:</strong> If the inbox is open and the user clicks anywhere else on the page, the inbox automatically closes.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Interactive Demo Canvas (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Interactive Canvas &amp; Bell Simulation</span>
                <span className="text-xs font-normal text-slate-400">Fixed Anchor Test</span>
              </h3>
              <p className="text-xs text-slate-500">
                Click the interactive bell in the canvas below to test opening, closing, and outside click auto-dismissal.
              </p>

              <div className="h-80 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/20 p-6 relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">Canvas: Top Edge</div>
                  {/* Top-Right Simulator Bell */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={onToggleInbox}
                      className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-transform active:scale-95 flex items-center gap-2 text-xs font-semibold"
                    >
                      <span>🔔</span>
                      <span>Bell ({unreadCount})</span>
                    </button>
                    {isInboxOpen && (
                      <div className="absolute top-12 right-0 w-48 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] shadow-xl border border-slate-700 z-10 animate-in fade-in">
                        <div className="font-bold text-indigo-400">Web Inbox Active</div>
                        <div className="text-slate-300 mt-0.5">Click canvas or outside to close</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1 text-slate-400 text-xs">
                  <p>Current Inbox State: <strong className={isInboxOpen ? 'text-emerald-600' : 'text-slate-500'}>{isInboxOpen ? 'OPEN' : 'CLOSED'}</strong></p>
                  <p>Unread Messages: <strong>{unreadCount}</strong> / Total: <strong>{inboxMessages.length}</strong></p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <div>Canvas: Bottom-Left</div>
                  <div>Canvas: Bottom-Right</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                <div>
                  <strong>Notification Viewed Rule:</strong> Raised only <em>once</em> for a given message in CleverTap.
                </div>
                <span className="font-mono text-[11px] bg-white px-2.5 py-1 rounded-md text-indigo-700 font-semibold shadow-2xs">
                  eu1 SDK
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: TEMPLATES & IMAGE ASPECT RATIO SPECS */}
      {activeTab === 'simulate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Message Generator &amp; Aspect Ratio Validator
              </h2>
              <p className="text-xs text-slate-500">
                Create and inject new notifications matching official CleverTap Web Inbox templates.
              </p>

              {/* Template selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Template Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimTemplate('text_icon')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                      simTemplate === 'text_icon'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Text with Icon (1:1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimTemplate('text_icon_image')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                      simTemplate === 'text_icon_image'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Icon (1:1) &amp; Image (4:3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimTemplate('simple_text')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                      simTemplate === 'simple_text'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Simple Text
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notification Title</label>
                <input
                  type="text"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Body input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notification Body Message</label>
                <textarea
                  rows={2}
                  value={simBody}
                  onChange={(e) => setSimBody(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Icon & Image URL inputs */}
              {simTemplate !== 'simple_text' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Icon URL</label>
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold">Aspect Ratio 1:1</span>
                  </div>
                  <input
                    type="text"
                    value={simIconUrl}
                    onChange={(e) => setSimIconUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-600"
                  />
                </div>
              )}

              {simTemplate === 'text_icon_image' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Banner Image URL</label>
                    <span className="text-[10px] font-mono text-purple-600 font-semibold">Aspect Ratio 4:3</span>
                  </div>
                  <input
                    type="text"
                    value={simImageUrl}
                    onChange={(e) => setSimImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono text-slate-600"
                  />
                </div>
              )}

              {/* CTA Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Call-to-Action Text</label>
                <input
                  type="text"
                  value={simActionText}
                  onChange={(e) => setSimActionText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCreateSimulated}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  + Inject Notification into Web Inbox
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Aspect Ratio Reference & Current Messages List (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Official Image Specifications Table
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Template</th>
                      <th className="p-3">Image Aspect Ratio</th>
                      <th className="p-3">Recommended Dimensions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Text with icon template</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">Icon - 1:1</td>
                      <td className="p-3 font-mono">128 x 128 px</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Text with icon and image</td>
                      <td className="p-3 font-mono text-purple-600 font-bold">Icon - 1:1, Image - 4:3</td>
                      <td className="p-3 font-mono">Icon 128x128, Image 800x600 px</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">Simple text template</td>
                      <td className="p-3 text-slate-400 italic">None</td>
                      <td className="p-3 font-mono">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Current Stacked Notifications ({inboxMessages.length})</span>
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {inboxMessages.map((m) => (
                    <div
                      key={m.msgId || m.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${m.isRead ? 'bg-slate-300' : 'bg-indigo-600'}`} />
                          <h5 className="font-bold text-slate-900 truncate">{m.title}</h5>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          Template: {m.template} &bull; Pivot: {m.wzrk_pivot}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onDeleteMessage(m.msgId || m.id)}
                          className="text-red-500 hover:text-red-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: CSS VARIABLES & STYLING STUDIO */}
      {activeTab === 'styling' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                CSS Variables &amp; Layout Overrides
              </h2>
              <p className="text-xs text-slate-500">
                According to the documentation, default width is 392px and default height is 546px. Override them via custom properties on <code className="font-mono text-indigo-600">ct-web-inbox</code>:
              </p>

              {/* Width Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700">--inbox-width</label>
                  <span className="font-mono text-indigo-600 font-bold">{inboxStyles.width || '392px'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ width: '360px' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    360px
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ width: '392px' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-indigo-600"
                  >
                    392px (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ width: '420px' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    420px
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ width: '460px' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    460px
                  </button>
                </div>
              </div>

              {/* Height Options */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700">--inbox-height</label>
                  <span className="font-mono text-indigo-600 font-bold">{inboxStyles.height || '546px'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ height: '480px' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    480px
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ height: '546px' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-indigo-600"
                  >
                    546px (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ height: '620px' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    620px
                  </button>
                </div>
              </div>

              {/* Font Family Options */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700">Font Family</label>
                  <span className="font-mono text-indigo-600 font-bold">{inboxStyles.fontFamily || 'inherit'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ fontFamily: 'inherit' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    inherit (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ fontFamily: 'monospace' })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 font-mono"
                  >
                    monospace
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStyles({ fontFamily: "'Plus Jakarta Sans', sans-serif" })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Plus Jakarta Sans
                  </button>
                </div>
              </div>

              {/* Mobile Breakpoint Note */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong>📱 Mobile Viewport Behavior (&le; 480px):</strong>
                <p>
                  As stated in the official documentation, all style customizations apply to desktops and tablets only. On mobile devices, the Web Inbox automatically occupies the entire screen width and height (<code className="font-mono text-amber-800">100vw, 100vh</code>).
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Code Preview (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-slate-300 font-mono text-[11px] space-y-3">
              <div className="text-indigo-400 font-bold flex items-center justify-between">
                <span>{`/* Custom Web Inbox CSS */`}</span>
                <span className="text-emerald-400 text-[10px]">CSS Properties</span>
              </div>
              <pre className="text-emerald-400 text-xs leading-relaxed overflow-x-auto">
{`ct-web-inbox {
  --inbox-width: ${inboxStyles.width || '392px'};
  --inbox-height: ${inboxStyles.height || '546px'};
  font-family: ${inboxStyles.fontFamily || 'inherit'};
  position: fixed;
}

/* Example: Pin to Right Screen Edge */
ct-web-inbox.right-pinned {
  --inbox-top: 0px;
  --inbox-left: unset;
  --inbox-right: 0px;
  --inbox-bottom: unset;
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: COMPLETE 10-METHOD JAVASCRIPT API REFERENCE CONSOLE */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Official Web Inbox JavaScript APIs
              </h2>
              <p className="text-xs text-slate-500">
                Click any of the 10 official CleverTap Web Inbox methods below to execute it in real time and verify its output:
              </p>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {[
                  { id: 'getInboxMessageCount', label: 'clevertap.getInboxMessageCount()', desc: 'Returns total message count' },
                  { id: 'getInboxMessageUnreadCount', label: 'clevertap.getInboxMessageUnreadCount()', desc: 'Returns unread message count' },
                  { id: 'getAllInboxMessages', label: 'clevertap.getAllInboxMessages()', desc: 'Returns all messages array' },
                  { id: 'getUnreadInboxMessages', label: 'clevertap.getUnreadInboxMessages()', desc: 'Returns unread messages array' },
                  { id: 'getInboxMessageForId', label: 'clevertap.getInboxMessageForId(msgId)', desc: 'Returns message by ID' },
                  { id: 'markReadInboxMessage', label: 'clevertap.markReadInboxMessage(msgId)', desc: 'Marks message as read' },
                  { id: 'markReadAllInboxMessage', label: 'clevertap.markReadAllInboxMessage()', desc: 'Marks all messages as read' },
                  { id: 'deleteInboxMessage', label: 'clevertap.deleteInboxMessage(msgId)', desc: 'Deletes message from Inbox' },
                  { id: 'renderNotificationViewed', label: 'clevertap.renderNotificationViewed({ msgId, wzrk_pivot })', desc: 'Raised only once per message' },
                  { id: 'renderNotificationClicked', label: 'clevertap.renderNotificationClicked({ msgId, wzrk_pivot })', desc: 'Raised each time user clicks' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedApiMethod(item.id);
                      onRunApiTest(item.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedApiMethod === item.id
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{item.label}</span>
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
                        Run &rarr;
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Output Console (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-slate-300 font-mono text-[11px] space-y-3">
              <div className="text-indigo-400 font-bold flex items-center justify-between">
                <span>{`// API Execution Result: ${selectedApiMethod}`}</span>
                <span className="text-emerald-400 text-[10px]">200 OK</span>
              </div>
              <pre className="text-emerald-400 text-xs leading-relaxed overflow-x-auto max-h-96">
                {JSON.stringify(apiSuiteResults || { message: 'Click any API method on the left to execute.' }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
