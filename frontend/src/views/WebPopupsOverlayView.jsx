/* eslint-disable @next/next/no-img-element */
// ============================================================================
// FILE: frontend/src/views/WebPopupsOverlayView.jsx
// PURPOSE: Renders authentic CleverTap DOM structures for Web Pop-ups & Exit Intent:
// - Box (#wizParDiv0)
// - Banner (#wizParDiv2)
// - Interstitial (#intentOpacityDiv + #intentPreview)
// - Image Only (#wzrkImageOnlyDiv)
// - Picture-in-Picture (<ct-web-popup-pip> with 9 anchor positions)
// - Custom HTML Pop-up (with wzrk_c2a click tracking)
// - Custom Notification Callback render
// Supports official close button snippets and renderNotificationClicked / Viewed.
// ============================================================================

import React, { useState } from 'react';
import { getPipPositionClasses } from '../services/clevertapSdkService';

export default function WebPopupsOverlayView({
  popup,
  pipConfig,
  onClose,
  onActionClick,
  onPipControl
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (!popup) return null;

  // 1. BOX POP-UP (#wizParDiv0)
  if (popup.type === 'box') {
    return (
      <div
        id="wizParDiv0"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      >
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 animate-scaleUp">
          {/* Official Close Button via #wizParDiv0 */}
          <button
            type="button"
            onClick={() => onClose('box')}
            aria-label="Close Pop-up"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
              CleverTap Box Pop-up
            </span>
            <code className="text-[10px] text-slate-400">#wizParDiv0</code>
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
            {popup.title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {popup.description}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onActionClick();
                onClose('box');
              }}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {popup.c2aText || 'Claim Offer'}
            </button>
            <button
              type="button"
              onClick={() => onClose('box')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              {popup.secondaryText || 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. BANNER POP-UP (#wizParDiv2)
  if (popup.type === 'banner') {
    return (
      <div
        id="wizParDiv2"
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl border-b border-indigo-700/50 px-4 py-3 animate-slideDown"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase border border-indigo-400/30">
              Banner (#wizParDiv2)
            </span>
            <div>
              <span className="text-xs font-bold block sm:inline mr-2">{popup.title}:</span>
              <span className="text-xs text-indigo-100">{popup.description}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onActionClick();
                onClose('banner');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {popup.c2aText || 'View Details'}
            </button>
            {/* Official Close Button for #wizParDiv2 */}
            <button
              type="button"
              onClick={() => onClose('banner')}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-800/80 hover:bg-indigo-700 text-indigo-200 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. INTERSTITIAL POP-UP (#intentOpacityDiv + #intentPreview)
  if (popup.type === 'interstitial') {
    return (
      <>
        {/* Official Overlay Backdrop (#intentOpacityDiv) */}
        <div
          id="intentOpacityDiv"
          onClick={() => onClose('interstitial')}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn"
        />

        {/* Official Wrapper Modal (#intentPreview) */}
        <div
          id="intentPreview"
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp p-6 sm:p-8"
        >
          {/* Official Close Button for Interstitial */}
          <button
            type="button"
            onClick={() => onClose('interstitial')}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              popup.isExitIntent ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-purple-100 text-purple-800'
            }`}>
              {popup.isExitIntent ? '⚡ Desktop Exit Intent Interstitial' : 'CleverTap Interstitial'}
            </span>
            <code className="text-[10px] text-slate-400">#intentPreview</code>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-2">
            {popup.title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {popup.description}
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              ⚡
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Pro Deep Work Sprint Bonus</span>
              <span className="text-slate-500">Includes audio immersion tracks + distraction shield.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onActionClick();
                onClose('interstitial');
              }}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              {popup.c2aText || 'Claim Offer & Continue'}
            </button>
            <button
              type="button"
              onClick={() => onClose('interstitial')}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              {popup.secondaryText || 'Dismiss'}
            </button>
          </div>
        </div>
      </>
    );
  }

  // 4. IMAGE ONLY POP-UP (#wzrkImageOnlyDiv)
  if (popup.type === 'imageOnly') {
    return (
      <div
        id="wzrkImageOnlyDiv"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      >
        <div className="relative max-w-md w-full bg-transparent overflow-hidden rounded-2xl shadow-2xl">
          <button
            type="button"
            onClick={() => onClose('imageOnly')}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
          <div
            onClick={() => {
              onActionClick();
              onClose('imageOnly');
            }}
            className="cursor-pointer group relative"
          >
            <img
              src={popup.mediaUrl}
              alt={popup.title}
              className="w-full h-auto object-cover rounded-2xl transition-transform group-hover:scale-101"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-xs font-bold">{popup.title}</span>
              <span className="text-[11px] text-slate-200 mt-1">Click image to learn more (#wzrkImageOnlyDiv)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. PICTURE-IN-PICTURE (PIP) POP-UP (<ct-web-popup-pip>)
  if (popup.type === 'pip') {
    const positionClasses = getPipPositionClasses(popup.anchor || pipConfig.anchor);

    return (
      <div
        id="ct-web-popup-pip"
        data-pip-anchor={popup.anchor || pipConfig.anchor}
        className={`fixed z-50 transition-all duration-300 ease-out ${
          pipConfig.isExpanded
            ? 'inset-6 max-w-4xl max-h-[85vh] mx-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : `w-80 sm:w-96 ${positionClasses}`
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col text-white">
          {/* Header Controls Bar */}
          <div className="px-3.5 py-2.5 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold truncate text-[11px] text-slate-200">
                &lt;ct-web-popup-pip&gt;
              </span>
              <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-700/50">
                {popup.anchor || pipConfig.anchor}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand / Collapse Button */}
              <button
                type="button"
                onClick={() => onPipControl('expand_collapse')}
                title={pipConfig.isExpanded ? 'Collapse' : 'Expand Fullscreen'}
                className="w-6 h-6 rounded bg-slate-700/60 hover:bg-slate-700 flex items-center justify-center text-[10px] cursor-pointer"
              >
                {pipConfig.isExpanded ? '↙' : '↗'}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => onClose('pip')}
                title="Dismiss PIP"
                className="w-6 h-6 rounded bg-slate-700/60 hover:bg-rose-600 flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Media / Video Simulation Area */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            <img
              src={popup.mediaUrl}
              alt="PIP Media"
              className={`w-full h-full object-cover transition-opacity duration-300 ${pipConfig.isPlaying ? 'opacity-90' : 'opacity-60'}`}
            />

            {/* Play/Pause Overlay indicator */}
            {!pipConfig.isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-xl">
                  ▶
                </span>
              </div>
            )}

            {/* Quick Action Badges */}
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-slate-300">
                {pipConfig.isPlaying ? '02:45 / 03:00' : 'PAUSED'}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-slate-300">
                {pipConfig.isMuted ? 'MUTED' : 'AUDIO ON'}
              </span>
            </div>
          </div>

          {/* Title & Interactive Controls Bar */}
          <div className="p-3.5 bg-slate-900 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold truncate text-slate-100">{popup.title}</span>
              <span className="text-[10px] text-slate-400 shrink-0">Web SDK v2.7+</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onPipControl('play_pause')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold cursor-pointer"
                >
                  {pipConfig.isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  type="button"
                  onClick={() => onPipControl('mute_unmute')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold cursor-pointer"
                >
                  {pipConfig.isMuted ? '🔇 Unmute' : '🔊 Mute'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onActionClick();
                  onPipControl('open_tab');
                }}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer transition-all"
              >
                Open CTA ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. CUSTOM HTML POP-UP (with wzrk_c2a tracking)
  if (popup.type === 'customHtml') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
          <button
            type="button"
            onClick={() => onClose('customHtml')}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
              Custom HTML Click Tracking
            </span>
            <code className="text-[10px] text-slate-400">wzrk_c2a</code>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">{popup.title}</h3>
          <p className="text-xs text-slate-600 mb-5">{popup.description}</p>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Tracked Elements with <code className="text-indigo-600">wzrk_c2a</code> attribute:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                data-wzrk-c2a="true"
                onClick={() => onActionClick({ msgId: popup.msgId, pivotId: 'Option_A' })}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Option A (Tracked)
              </button>
              <button
                type="button"
                data-wzrk-c2a="true"
                onClick={() => onActionClick({ msgId: popup.msgId, pivotId: 'Option_B' })}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Option B (Tracked)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. CUSTOM CALLBACK POP-UP
  if (popup.type === 'customCallback') {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-indigo-200 p-5 animate-slideUp">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
            notificationCallback UI
          </span>
          <button
            type="button"
            onClick={() => onClose('customCallback')}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
        <h4 className="text-sm font-bold text-slate-900">{popup.title}</h4>
        <p className="text-xs text-slate-600 mt-1 mb-4">{popup.description}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onActionClick({ msgId: popup.msgId, pivotId: popup.pivotId });
              onClose('customCallback');
            }}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
          >
            Raise renderNotificationClicked
          </button>
        </div>
      </div>
    );
  }

  return null;
}
