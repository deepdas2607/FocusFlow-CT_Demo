// ============================================================================
// FILE: frontend/src/views/WebPopupsStudioView.jsx
// PURPOSE: Interactive Studio & Testing Center for CleverTap Web Pop-ups & Exit Intent.
// Supports: Box, Banner, Interstitial, Image Only, Advanced Builder, PIP (Picture-in-Picture)
// with 9 anchor positions, Desktop Exit Intent, Dismiss Spam Control (session rules),
// SPA auto-dismissal, custom notificationCallback (renderNotificationViewed / renderNotificationClicked),
// custom HTML popupCallback, and wzrk_c2a click tracking.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { PIP_ANCHOR_POSITIONS, getPipPositionClasses } from '../services/clevertapSdkService';

export default function WebPopupsStudioView({
  activePopup,
  dismissSpamControl,
  exitIntentEnabled,
  pipConfig,
  customNotificationMsg,
  popupAnalytics,
  shownCampaignsInSession,
  onTriggerPopup,
  onClosePopup,
  onPopupActionClick,
  onToggleDismissSpamControl,
  onToggleExitIntent,
  onPipAnchorChange,
  onPipControl,
  onResetSessionCampaigns,
  onNavigateTab
}) {
  const [selectedTab, setSelectedTab] = useState('templates'); // 'templates' | 'pip' | 'exitIntent' | 'spamControl' | 'customCallback'
  const [viewportWidth, setViewportWidth] = useState(1024);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth);
      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isDesktop = viewportWidth > 480;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Live Status Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider">
                CleverTap Web Pop-ups &amp; Exit Intent
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                SDK v3.0.3 Native
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Web Pop-ups &amp; Exit Intent Studio
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Test and verify Simple Web Pop-ups (Box, Banner, Interstitial, Image Only), Picture-in-Picture (PIP with 9 anchors), Desktop Exit Intent, Dismiss Spam Control session logic, and custom callbacks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-300 block uppercase">Viewed</span>
              <span className="text-xl font-black text-indigo-300">{popupAnalytics.viewedCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-300 block uppercase">Clicked</span>
              <span className="text-xl font-black text-emerald-300">{popupAnalytics.clickedCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-300 block uppercase">Dismissed</span>
              <span className="text-xl font-black text-amber-300">{popupAnalytics.dismissedCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-300 block uppercase">Spam Blocked</span>
              <span className="text-xl font-black text-rose-300">{popupAnalytics.spamBlockedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feature Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedTab === 'templates'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Pop-up Templates (Box, Banner, Interstitial)
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('pip')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedTab === 'pip'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          PIP (Picture-in-Picture) &amp; 9 Anchors
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('exitIntent')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedTab === 'exitIntent'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Desktop Exit Intent
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('spamControl')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedTab === 'spamControl'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Dismiss Spam Control &amp; Sessions
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('customCallback')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedTab === 'customCallback'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Custom Callback &amp; wzrk_c2a Tracking
        </button>
      </div>

      {/* 3. TAB 1: POP-UP TEMPLATES (Box, Banner, Interstitial, Image Only, Advanced Builder) */}
      {selectedTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Box Pop-up Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                    Template: Box
                  </span>
                  <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    #wizParDiv0
                  </code>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Box Web Pop-up</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Modal dialog centered on the screen. Contains customizable header, body text, image, and interactive action buttons.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono mb-4">
                  <span className="text-slate-400 block mb-1 font-sans font-medium text-[10px]">Close Button Snippet:</span>
                  document.getElementById(&apos;wizParDiv0&apos;).remove();
                </div>
              </div>
              <button
                type="button"
                onClick={() => onTriggerPopup('box')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Trigger Box Pop-up</span>
              </button>
            </div>

            {/* Banner Pop-up Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                    Template: Banner
                  </span>
                  <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    #wizParDiv2
                  </code>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Banner Web Pop-up</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Full-width floating banner anchored to the top or bottom of the screen. Ideal for announcements, promotions, and flash sales.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono mb-4">
                  <span className="text-slate-400 block mb-1 font-sans font-medium text-[10px]">Close Button Snippet:</span>
                  document.getElementById(&apos;wizParDiv2&apos;).remove();
                </div>
              </div>
              <button
                type="button"
                onClick={() => onTriggerPopup('banner')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Trigger Banner Pop-up</span>
              </button>
            </div>

            {/* Interstitial Pop-up Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold uppercase tracking-wider">
                    Template: Interstitial
                  </span>
                  <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    #intentPreview
                  </code>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Interstitial Pop-up</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Full-screen modal with darkened backdrop (#intentOpacityDiv). Captures complete user attention before key milestones.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono mb-4">
                  <span className="text-slate-400 block mb-1 font-sans font-medium text-[10px]">Close Button Snippet:</span>
                  overlay.remove(); wrapper.remove();
                </div>
              </div>
              <button
                type="button"
                onClick={() => onTriggerPopup('interstitial')}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Trigger Interstitial Pop-up</span>
              </button>
            </div>

            {/* Image Only Pop-up Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                    Template: Image Only
                  </span>
                  <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    #wzrkImageOnlyDiv
                  </code>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Image-Only Pop-up</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Renders a standalone creative visual asset without text containers. Entire graphic is clickable to trigger destination URLs.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono mb-4">
                  <span className="text-slate-400 block mb-1 font-sans font-medium text-[10px]">Close Button Snippet:</span>
                  document.getElementById(&apos;wzrkImageOnlyDiv&apos;).remove();
                </div>
              </div>
              <button
                type="button"
                onClick={() => onTriggerPopup('imageOnly')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Trigger Image Only Pop-up</span>
              </button>
            </div>

            {/* Advanced Builder & Dark Mode Isolation Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between md:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                    Advanced Builder
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    color-scheme: none
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Advanced Web Popup Builder &amp; Dark Mode Isolation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Renders rich popups in an isolated full-screen iframe managed directly by the CleverTap Web SDK.
                  Starting in Web SDK v2.6.2, the SDK automatically injects <code className="text-indigo-600 font-semibold font-mono">color-scheme: none</code> into the iframe to guarantee visual fidelity regardless of the host site&apos;s system dark mode.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>No dark-mode color distortion inside the campaign iframe</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Full compatibility with custom HTML and responsive CSS</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onTriggerPopup('interstitial', {
                      title: 'Advanced Builder Campaign: Design Sprint',
                      description: 'Isolated in iframe with automatic color-scheme: none protection.'
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex-1"
                >
                  Preview Advanced Builder Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: PIP (PICTURE-IN-PICTURE) & 9 ANCHORS */}
      {selectedTab === 'pip' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                    Web Custom Element
                  </span>
                  <code className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    &lt;ct-web-popup-pip&gt;
                  </code>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Picture-in-Picture (PIP) Floating Player
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Available from Web SDK v2.7.0 onwards. Renders as a draggable floating video or image popup that remains on screen while the user continues browsing and switching tasks.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Viewport Breakpoint</span>
                  <span className="text-xs font-bold text-slate-700">
                    {viewportWidth}px ({isDesktop ? 'Desktop > 480px' : 'Mobile ≤ 480px'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onTriggerPopup('pip')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Launch PIP Popup
                </button>
              </div>
            </div>

            {/* 9 Anchor Positions Grid */}
            <div className="pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Anchor Position (9 Screen Zones)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Configured via campaign payload <code className="text-indigo-600 font-mono">anchor</code>. If no anchor is configured, the popup snaps to the nearest anchor based on its on-screen position after dragging.
              </p>

              <div className="max-w-md mx-auto p-4 bg-slate-100 rounded-2xl border border-slate-300 grid grid-cols-3 gap-2.5 shadow-inner">
                {PIP_ANCHOR_POSITIONS.map((pos) => {
                  const isSelected = pipConfig.anchor === pos;
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => onPipAnchorChange(pos)}
                      className={`h-16 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-102 ring-2 ring-indigo-400'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="capitalize">{pos.replace('-', ' ')}</span>
                      {isSelected && <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded">Active</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Controls & Click Actions */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  2. Interactive User Controls
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onPipControl('play_pause')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Play / Pause</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${pipConfig.isPlaying ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      {pipConfig.isPlaying ? 'Playing' : 'Paused'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPipControl('mute_unmute')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Mute / Unmute</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${pipConfig.isMuted ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {pipConfig.isMuted ? 'Muted' : 'Unmuted'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPipControl('expand_collapse')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Expand / Collapse</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {pipConfig.isExpanded ? 'Fullscreen' : 'Floating'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPipControl('open_tab')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Open in new tab</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Target URL</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  3. Responsive Click Action Routing
                </h3>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Desktop Breakpoint (&gt; 480px):</span>
                    <code className="text-indigo-600 font-bold font-mono">display.pip.onClick</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Mobile Breakpoint (≤ 480px):</span>
                    <code className="text-indigo-600 font-bold font-mono">display.mobile.pip.onClick</code>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    If mobile click action is not configured, the Web SDK seamlessly falls back to the default desktop <code className="font-mono">display.pip</code> click handler.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: DESKTOP EXIT INTENT */}
      {selectedTab === 'exitIntent' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold uppercase tracking-wider">
                    Desktop Only
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Compatible with Box, Banner, Image Only, Advanced Builder</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Web Exit Intent Notifications
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Exit intent detects when the user moves their mouse pointer outside the browser window (e.g. towards the address bar, tabs, or close button) and triggers a targeted retention modal before they leave.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleExitIntent(!exitIntentEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    exitIntentEnabled
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Exit Intent: {exitIntentEnabled ? 'Active (ON)' : 'Disabled (OFF)'}
                </button>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  How Exit Intent Works
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span><strong>Pointer Tracking:</strong> Listens for mouse movement exiting the top edge (<code className="font-mono">clientY ≤ 10px</code>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span><strong>Desktop Only Constraint:</strong> Ignored on mobile devices (<code className="font-mono">innerWidth ≤ 480px</code>) where pointer boundaries do not exist.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span><strong>Spam Control Evaluation:</strong> Evaluated alongside <code className="font-mono">dismissSpamControl</code> to prevent harassing users who already dismissed the message.</span>
                  </li>
                </ul>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerPopup('interstitial', {
                        isExitIntent: true,
                        campaignId: 'camp_exit_intent_streak_saver',
                        pivotId: 'Variant_Exit_ManualSim',
                        title: 'Wait! Don’t Break Your Focus Streak!',
                        description: 'Simulated Exit Intent triggered! Complete a 25-minute Pomodoro session today to keep your streak intact.',
                        c2aText: 'Stay & Focus Now',
                        secondaryText: 'Leave Anyway'
                      });
                    }}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Simulate Pointer Leaving Window (Trigger Exit Intent)</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Or move your mouse cursor above the browser window header to trigger the real listener!
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Live Exit Intent Status
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Listener Status:</span>
                      <span className={exitIntentEnabled ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                        {exitIntentEnabled ? 'Active & Listening' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Viewport Mode:</span>
                      <span className="font-semibold text-slate-800">
                        {isDesktop ? 'Desktop (Eligible)' : 'Mobile (Ineligible)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Session Exit Triggers:</span>
                      <span className="font-bold text-indigo-600">{popupAnalytics.exitIntentTriggers}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 mt-4">
                  💡 <strong>Pro Tip:</strong> Exit intent modals have an average 18% higher conversion rate when paired with a streak preservation incentive.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: DISMISS SPAM CONTROL & SESSIONS */}
      {selectedTab === 'spamControl' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                    Spam Control Flag
                  </span>
                  <code className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    clevertap.dismissSpamControl
                  </code>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Dismiss Spam Control &amp; Session Delivery
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Controls whether a user can see the same Web Pop-up or Exit Intent notification again after closing it during the same browser session.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleDismissSpamControl(!dismissSpamControl)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dismissSpamControl
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  dismissSpamControl = {dismissSpamControl ? 'true' : 'false'}
                </button>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* When True */}
              <div className={`p-5 rounded-2xl border transition-all ${
                dismissSpamControl ? 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">When dismissSpamControl = true</h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                    SDK v2.0+ Default
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Overrides repeat restrictions and allows the same campaign to be shown repeatedly to a user as long as they qualify, even within the same session after dismissal.
                </p>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>✓ Ideal for user-initiated guides or persistent notifications</div>
                  <div>✓ Precise delivery can be governed via dashboard delivery limits</div>
                </div>
              </div>

              {/* When False */}
              <div className={`p-5 rounded-2xl border transition-all ${
                !dismissSpamControl ? 'bg-amber-50/50 border-amber-200 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">When dismissSpamControl = false</h4>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                    Session Restriction
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Ensures a campaign, once shown and closed, will NOT be shown again until a brand new session begins. Evaluated at the individual campaign level.
                </p>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>✓ Prevents user annoyance from repeated pop-ups</div>
                  <div>✓ Strict 1-delivery-per-session ceiling</div>
                </div>
              </div>
            </div>

            {/* Interactive Session Simulation Testing */}
            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Test Session Spam Suppression</span>
                <span className="text-xs text-slate-500">
                  Active campaigns tracked in this session: {Object.keys(shownCampaignsInSession).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTriggerPopup('box', { campaignId: 'camp_spam_test_fixed' })}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Trigger Test Campaign
                </button>
                <button
                  type="button"
                  onClick={onResetSessionCampaigns}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
                >
                  Reset Session History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 5: CUSTOM CALLBACK & CLICK TRACKING (wzrk_c2a) */}
      {selectedTab === 'customCallback' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="pb-6 border-b border-slate-200">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                Developer API
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Custom Callbacks &amp; Custom HTML wzrk_c2a Click Tracking
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Define custom render callbacks with <code className="text-indigo-600 font-mono">clevertap.notificationCallback</code>, explicitly raise viewed and clicked events, and track selective buttons with the <code className="text-indigo-600 font-mono">wzrk_c2a</code> attribute.
              </p>
            </div>

            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom Callback Showcase */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. clevertap.notificationCallback
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Allows you to completely override CleverTap&apos;s default pop-up UI and render your own custom React components, while still reporting viewed &amp; clicked analytics back to the dashboard.
                </p>

                <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-emerald-400 font-mono overflow-x-auto">
                  <pre>{`clevertap.notificationCallback = function(msg) {
  clevertap.renderNotificationViewed({
    msgId: msg.msgId,
    pivotId: msg.pivotId
  });
  // Render custom UI...
};`}</pre>
                </div>

                <button
                  type="button"
                  onClick={() => onTriggerPopup('customCallback')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simulate clevertap.notificationCallback Message
                </button>
              </div>

              {/* Custom HTML Click Tracking wzrk_c2a */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Custom HTML wzrk_c2a Click Tracking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When creating custom HTML pop-ups, add the <code className="font-mono text-indigo-600 font-semibold">wzrk_c2a</code> attribute to any button or anchor to track clicks without writing manual listeners.
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-semibold text-slate-700 block">Sample Custom HTML Elements:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-wzrk-c2a="true"
                      onClick={() => onPopupActionClick({ msgId: 'custom_html_c2a_btn1', pivotId: 'Variant_A' })}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer hover:bg-indigo-700"
                    >
                      &lt;button wzrk_c2a&gt;Tracked CTA 1&lt;/button&gt;
                    </button>
                    <button
                      type="button"
                      data-wzrk-c2a="true"
                      onClick={() => onPopupActionClick({ msgId: 'custom_html_c2a_btn2', pivotId: 'Variant_B' })}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer hover:bg-emerald-700"
                    >
                      &lt;button wzrk_c2a&gt;Tracked CTA 2&lt;/button&gt;
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-indigo-300 font-mono overflow-x-auto">
                  <pre>{`// In Custom HTML Popup:
window.parent.clevertap.popupCallback = (data) => {
  notificationObj = data;
};
window.parent.clevertap.raisePopupNotificationClicked(notificationObj);`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. SINGLE PAGE APPLICATION (SPA) AUTO-DISMISSAL DEMONSTRATION */}
      <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              SPA Navigation Route Dismissal Active
            </h4>
          </div>
          <p className="text-xs text-indigo-900/80 leading-relaxed">
            Because <code className="font-mono font-semibold">clevertap.spa = true</code> is active, switching to any tab (e.g. Dashboard, Tasks, Timer) automatically cleans up any open Box, Banner, or Image-Only pop-up to protect user flow.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition-all cursor-pointer whitespace-nowrap"
          >
            Switch to Dashboard (Test Auto-Dismiss)
          </button>
        </div>
      </div>
    </div>
  );
}

