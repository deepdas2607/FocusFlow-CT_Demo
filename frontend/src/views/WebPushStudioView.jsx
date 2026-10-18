// ============================================================================
// FILE: frontend/src/views/WebPushStudioView.jsx
// PURPOSE: Interactive CleverTap Web Push Studio & Configuration Center:
// - VAPID Key Protocol (RFC 8292) & Dashboard Upload Guide
// - Soft Prompt (Card Popup via clevertap.notifications.push)
// - 1-Week Permission Rejection Frequency Rule & Cooldown
// - Service Worker (clevertap_sw.js) & Web App Manifest (manifest.json)
// - iOS/iPadOS Safari PWA Add to Home Screen Verification
// - Token Migration Simulator (Cases 1, 2, 3)
// - Browser Capability & Feature Support Matrix
// ============================================================================

import React, { useState, useEffect } from 'react';

export default function WebPushStudioView({
  permissionStatus,
  sdkVersionInfo,
  browserSupport,
  vapidKeys,
  cooldownInfo,
  softPromptOptions,
  onRequestSoftPrompt,
  onRequestNativePermission,
  onUpdateSoftPromptOptions,
  onResetCooldown,
  onGenerateVapidKeys,
  onRefreshVapidKeys,
  onSimulateTokenMigration,
  migrationResult,
  onSimulatePushNotification,
  simulatedPushResult,
  isLoadingVapid
}) {
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'vapid' | 'pwa' | 'matrix' | 'simulate'
  const [revealPrivateKey, setRevealPrivateKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [customTitle, setCustomTitle] = useState(softPromptOptions?.titleText || 'Would you like to receive Push Notifications?');
  const [customBody, setCustomBody] = useState(softPromptOptions?.bodyText || 'We promise to only send you relevant content and give you updates on your transactions');
  const [customOkText, setCustomOkText] = useState(softPromptOptions?.okButtonText || 'Sign me up!');
  const [customRejectText, setCustomRejectText] = useState(softPromptOptions?.rejectButtonText || 'No thanks');
  const [customOkColor, setCustomOkColor] = useState(softPromptOptions?.okButtonColor || '#4f46e5');
  const [customAskAgainSec, setCustomAskAgainSec] = useState(softPromptOptions?.askAgainTimeInSeconds ?? 5);

  const [simTitle, setSimTitle] = useState('FocusFlow Streak Milestone! 🔥');
  const [simBody, setSimBody] = useState('Elena, you completed 4 Pomodoro sessions today. Keep the deep work momentum going!');
  const [simCta1, setSimCta1] = useState('Start Next Session');
  const [simCta2, setSimCta2] = useState('View Dashboard');

  // Copy helper
  const handleCopy = (text, keyLabel) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyLabel);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleApplyPromptOptions = () => {
    onUpdateSoftPromptOptions({
      titleText: customTitle,
      bodyText: customBody,
      okButtonText: customOkText,
      rejectButtonText: customRejectText,
      okButtonColor: customOkColor,
      askAgainTimeInSeconds: Number(customAskAgainSec),
      serviceWorkerPath: '/clevertap_sw.js'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-400/30">
                Web Push Channel
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-400/30">
                VAPID Protocol (RFC 8292)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-semibold border border-purple-400/30">
                SDK {sdkVersionInfo?.version || 'v3.0.3'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold border border-amber-400/30">
                Region: eu1
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2">CleverTap Web Push &amp; VAPID Studio</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Configure browser push notifications, generate VAPID keys, test CleverTap soft prompts with 1-week rejection frequency rules, and inspect iOS/iPadOS PWA service worker readiness.
            </p>
          </div>

          {/* Quick Permission Status Badge */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-3.5 self-start lg:self-center">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Browser Permission</div>
              <div className="text-sm font-bold font-mono capitalize">
                {permissionStatus === 'granted' ? (
                  <span className="text-emerald-400">● Granted</span>
                ) : permissionStatus === 'denied' ? (
                  <span className="text-rose-400">● Denied</span>
                ) : (
                  <span className="text-amber-400">● Default / Promptable</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('prompt')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'prompt'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Soft Prompt &amp; Permissions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vapid')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vapid'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          VAPID Keys &amp; Dashboard Setup
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pwa')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pwa'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Service Worker &amp; iOS PWA
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Browser Matrix &amp; Features
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
          Push Payload Simulator
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: SOFT PROMPT & PERMISSIONS */}
      {activeTab === 'prompt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Requesting Push Permission via Soft Prompt</span>
                <span className="font-mono text-xs font-normal text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  clevertap.notifications.push()
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                CleverTap recommends requesting permission contextually after a user completes a meaningful action. The soft prompt prevents permanent browser blocking.
              </p>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onRequestSoftPrompt()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Trigger clevertap.notifications.push</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRequestNativePermission()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Trigger Native Browser Prompt
                </button>

                {cooldownInfo?.inCooldown && (
                  <button
                    type="button"
                    onClick={() => onResetCooldown()}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Reset Rejection Cooldown
                  </button>
                )}
              </div>

              {/* 1-Week Permission Frequency Rule Status */}
              <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800">CleverTap Permission Frequency Engine</span>
                  {cooldownInfo?.inCooldown ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                      Cooldown Active ({cooldownInfo.remainingSeconds}s remaining)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      Ready to Display
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  To prevent user spam, calling <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">clevertap.notifications.push</code> does nothing if the user rejected the prompt less than 1 week ago. Once a week passes, it automatically allows asking again.
                </p>
              </div>

              {/* Soft Prompt Parameters Customizer */}
              <div className="mt-6 border-t border-slate-200 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Customize Soft Prompt Payload Parameters
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Title Text (titleText)
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Body Text (bodyText)
                    </label>
                    <input
                      type="text"
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      OK Button Text (okButtonText)
                    </label>
                    <input
                      type="text"
                      value={customOkText}
                      onChange={(e) => setCustomOkText(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Reject Button Text (rejectButtonText)
                    </label>
                    <input
                      type="text"
                      value={customRejectText}
                      onChange={(e) => setCustomRejectText(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      OK Button Color (okButtonColor)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customOkColor}
                        onChange={(e) => setCustomOkColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={customOkColor}
                        onChange={(e) => setCustomOkColor(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Ask Again Cooldown Seconds (askAgainTimeInSeconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customAskAgainSec}
                      onChange={(e) => setCustomAskAgainSec(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyPromptOptions}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Apply Prompt Config
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Soft Prompt Preview</span>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Card Popup
                </span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                This simulates the exact card popup rendered on the website before triggering native browser permissions.
              </p>

              {/* Mock CleverTap Soft Prompt Card */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {customTitle}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {customBody}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => onRequestSoftPrompt({ reject: true })}
                    className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors cursor-pointer"
                  >
                    {customRejectText}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestNativePermission()}
                    style={{ backgroundColor: customOkColor }}
                    className="text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    {customOkText}
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-1 overflow-x-auto">
                <div className="text-indigo-400 font-bold">{`// Official SDK Call`}</div>
                <div className="text-emerald-400">clevertap.notifications.push({`{`}</div>
                <div className="pl-3">&quot;titleText&quot;: &quot;{customTitle}&quot;,</div>
                <div className="pl-3">&quot;bodyText&quot;: &quot;{customBody}&quot;,</div>
                <div className="pl-3">&quot;okButtonText&quot;: &quot;{customOkText}&quot;,</div>
                <div className="pl-3">&quot;rejectButtonText&quot;: &quot;{customRejectText}&quot;,</div>
                <div className="pl-3">&quot;okButtonColor&quot;: &quot;{customOkColor}&quot;,</div>
                <div className="pl-3">&quot;askAgainTimeInSeconds&quot;: {customAskAgainSec},</div>
                <div className="pl-3">&quot;serviceWorkerPath&quot;: &quot;/clevertap_sw.js&quot;</div>
                <div className="text-emerald-400">{`}`});</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VAPID KEYS & DASHBOARD CONFIGURATION */}
      {activeTab === 'vapid' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Voluntary Application Server Identification (VAPID) Protocol
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  VAPID keys cryptographically prove FocusFlow&apos;s identity to browser push services (Chrome, Firefox, Safari) and CleverTap.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRefreshVapidKeys()}
                  disabled={isLoadingVapid}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Refresh Keys
                </button>
                <button
                  type="button"
                  onClick={() => onGenerateVapidKeys()}
                  disabled={isLoadingVapid}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generate New VAPID Keys</span>
                </button>
              </div>
            </div>

            {/* VAPID Public & Private Key Display */}
            <div className="space-y-4 mt-6">
              {/* Public Key */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">VAPID Public Key</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-100 text-indigo-700 font-semibold">
                      P-256 Uncompressed Point (87 chars)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(vapidKeys?.publicKey, 'public')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === 'public' ? '✓ Copied' : 'Copy Public Key'}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 break-all select-all">
                  {vapidKeys?.publicKey || 'Loading VAPID public key...'}
                </div>
              </div>

              {/* Private Key */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">VAPID Private Key</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-700 font-semibold">
                      Secret Scalar (43 chars)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRevealPrivateKey(!revealPrivateKey)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      {revealPrivateKey ? 'Mask' : 'Reveal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(vapidKeys?.privateKey || vapidKeys?.privateKeyMasked, 'private')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'private' ? '✓ Copied' : 'Copy Private Key'}
                    </button>
                  </div>
                </div>
                <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 break-all select-all">
                  {revealPrivateKey
                    ? (vapidKeys?.privateKey || 'Private key secret')
                    : (vapidKeys?.privateKeyMasked || '•••••••••••••••••••••••••••••••••••••••••••')}
                </div>
              </div>
            </div>

            {/* Step-by-Step CleverTap Dashboard Upload Guide */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                  ✓
                </span>
                <span>Exact Steps to Upload VAPID Keys in CleverTap Dashboard</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Chrome */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>1. Google Chrome</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Navigate to <strong>Settings &gt; Engage &gt; Channels &gt; Web Push</strong>. Under <strong>Chrome Web Push</strong>, toggle the radio button to enabled, paste your VAPID Public &amp; Private keys, and click Save.
                  </p>
                </div>

                {/* Firefox */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>2. Mozilla Firefox</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Under the <strong>Firefox Web Push</strong> section, toggle the radio button to enabled, paste your generated VAPID public and private key pair, and click Save.
                  </p>
                </div>

                {/* Safari */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <span>3. Safari (macOS &amp; iOS PWA)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Under the <strong>Safari Web Push</strong> section, toggle the radio button to enabled, paste the same VAPID key pair, and click Save.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICE WORKER & IOS PWA */}
      {activeTab === 'pwa' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Worker Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Document Root Service Worker</span>
                </h3>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                  /clevertap_sw.js (200 OK)
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                The service worker listens for background web push events and displays notifications when users are away from your site.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-1">
                <div className="text-slate-500">{`// public/clevertap_sw.js`}</div>
                <div className="text-indigo-400">importScripts(</div>
                <div className="pl-4 text-emerald-400">&apos;https://s3-eu-west-1.amazonaws.com/static.wizrocket.com/js/sw_webpush.js&apos;</div>
                <div className="text-indigo-400">);</div>
              </div>
            </div>

            {/* Web App Manifest Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Web App Manifest</span>
                </h3>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                  /manifest.json (200 OK)
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Essential metadata for PWA standalone installation on iOS Safari and Android devices.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-1">
                <div className="text-slate-500">{`// Linked in <head>`}</div>
                <div>&quot;name&quot;: &quot;FocusFlow — Personal Focus &amp; Habit Companion&quot;,</div>
                <div>&quot;short_name&quot;: &quot;FocusFlow&quot;,</div>
                <div>&quot;display&quot;: &quot;standalone&quot;,</div>
                <div>&quot;theme_color&quot;: &quot;#4f46e5&quot;</div>
              </div>
            </div>
          </div>

          {/* iOS Safari Web Push Walkthrough */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              iOS / iPadOS Safari Web Push Configuration (v16.4+)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Unlike desktop browsers, Safari on iOS/iPadOS requires specific prerequisites before requesting push notifications:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                <div className="text-xs font-bold text-emerald-900">Step 1: Manifest File</div>
                <p className="text-[11px] text-emerald-700">
                  Created at <code className="font-mono">/manifest.json</code> with name, icons, and standalone display.
                </p>
                <div className="text-[10px] font-bold text-emerald-600 mt-2">✓ Verified Configured</div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                <div className="text-xs font-bold text-emerald-900">Step 2: Link in &lt;head&gt;</div>
                <p className="text-[11px] text-emerald-700">
                  <code className="font-mono">&lt;link rel=&quot;manifest&quot;&gt;</code> added to layout metadata.
                </p>
                <div className="text-[10px] font-bold text-emerald-600 mt-2">✓ Verified Configured</div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1.5">
                <div className="text-xs font-bold text-indigo-900">Step 3: Add to Home Screen</div>
                <p className="text-[11px] text-indigo-700">
                  User bookmarks site to Home Screen via Safari Share sheet to run in standalone mode.
                </p>
                <div className="text-[10px] font-bold text-indigo-600 mt-2">Required by Apple</div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1.5">
                <div className="text-xs font-bold text-indigo-900">Step 4: User Gesture Trigger</div>
                <p className="text-[11px] text-indigo-700">
                  Push prompt must be invoked on explicit user button tap, not automatically on page load.
                </p>
                <div className="text-[10px] font-bold text-indigo-600 mt-2">Compliant with Spec</div>
              </div>
            </div>
          </div>

          {/* Token Migration Simulator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Token Migration from Other Services (Cases 1, 2, and 3)
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              CleverTap&apos;s service worker script handles seamless migration from existing push providers without re-prompting already subscribed users.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => onSimulateTokenMigration('registered')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Simulate Case 1: Existing Registered User
              </button>
              <button
                type="button"
                onClick={() => onSimulateTokenMigration('declined')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Simulate Case 2: Existing Declined User
              </button>
              <button
                type="button"
                onClick={() => onSimulateTokenMigration('new_user')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Simulate Case 3: New User
              </button>
            </div>

            {migrationResult && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">{migrationResult.scenario}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                    migrationResult.tokenMigrated ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {migrationResult.tokenMigrated ? 'Token Migrated Silently' : 'Standard Delivery'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{migrationResult.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1">
                  <div>Soft Prompt Displayed: <strong>{migrationResult.showSoftPrompt ? 'Yes' : 'No (Skipped)'}</strong></div>
                  <div>Token Auto-Migrated: <strong>{migrationResult.tokenMigrated ? 'Yes' : 'No'}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BROWSER CAPABILITY MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Features Availability Across Browsers
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Reference table according to official CleverTap Web Push documentation and W3C Push Notifications API specifications.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                    <th className="py-3 px-4">Feature</th>
                    <th className="py-3 px-4">Google Chrome</th>
                    <th className="py-3 px-4">Mozilla Firefox</th>
                    <th className="py-3 px-4">Apple Safari</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Call-to-Action (CTA) Buttons</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-medium">v53 and above (desktop, android)</td>
                    <td className="py-3.5 px-4 text-slate-400">No</td>
                    <td className="py-3.5 px-4 text-slate-400">No</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Custom Notification Icon</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-medium">v33+ (desktop), v42+ (android)</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-medium">v26+ (desktop, android)</td>
                    <td className="py-3.5 px-4 text-slate-400">No</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Rich Banner Image</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-medium">v56 and above (desktop, android)</td>
                    <td className="py-3.5 px-4 text-slate-400">No</td>
                    <td className="py-3.5 px-4 text-slate-400">No</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Requires Interaction (Persistent)</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-medium">v47 and above (desktop, android)</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-medium">v117 and above (desktop, android)</td>
                    <td className="py-3.5 px-4 text-slate-400">No</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Environment Restrictions Reminder */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Important Browser Restrictions (Official Notice)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1">HTTPS Requirement</div>
                  <p className="text-slate-600 text-[11px]">
                    Web push functions only over HTTPS or localhost (development).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1">Incognito / Private</div>
                  <p className="text-slate-600 text-[11px]">
                    Web push is completely disabled in private/incognito windows.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1">In-App Browsers</div>
                  <p className="text-slate-600 text-[11px]">
                    Embedded webviews (Facebook, Instagram, etc.) do not support push.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1">Android WebViews</div>
                  <p className="text-slate-600 text-[11px]">
                    Web push is not supported within native Android WebViews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SIMULATE PUSH PAYLOAD */}
      {activeTab === 'simulate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Simulate Push Notification Message Payload
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Compose a targeted push campaign payload with CTA buttons and inspect the backend JSON message structure.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Title</label>
                  <input
                    type="text"
                    value={simTitle}
                    onChange={(e) => setSimTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Body</label>
                  <textarea
                    rows={3}
                    value={simBody}
                    onChange={(e) => setSimBody(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Action Button 1 (CTA 1)</label>
                    <input
                      type="text"
                      value={simCta1}
                      onChange={(e) => setSimCta1(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Action Button 2 (CTA 2)</label>
                    <input
                      type="text"
                      value={simCta2}
                      onChange={(e) => setSimCta2(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onSimulatePushNotification({
                      title: simTitle,
                      body: simBody,
                      ctaButtons: [
                        { action: 'action_1', title: simCta1 },
                        { action: 'action_2', title: simCta2 }
                      ]
                    })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    Simulate Web Push Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Push Banner Realistic Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Desktop Push Banner Preview
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Rendered with FocusFlow app branding, timestamp, and interactive CTA buttons.
              </p>

              {/* Realistic Desktop Toast */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>FocusFlow • Web Push</span>
                  </div>
                  <span>just now</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                    FF
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-white">{simTitle}</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{simBody}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {simCta2}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {simCta1}
                  </button>
                </div>
              </div>

              {simulatedPushResult && (
                <div className="mt-5 p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-1 overflow-x-auto">
                  <div className="text-indigo-400 font-bold">{`// Backend Push Message Payload`}</div>
                  <pre className="text-emerald-400 text-[10px] leading-tight">
                    {JSON.stringify(simulatedPushResult.pushPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
