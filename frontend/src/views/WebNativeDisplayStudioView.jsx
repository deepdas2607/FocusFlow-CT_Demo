// ============================================================================
// FILE: frontend/src/views/WebNativeDisplayStudioView.jsx
// PURPOSE: Interactive Studio for CleverTap Web Native Display:
// - Custom Key-Value Pairs (topic-based routing & real-time personalization)
// - Fallback content vs personalized content rendering
// - Banner & Carousel container Div ID targeting & explicit height
// - Campaign Priority Handling (Conflicting topics, unique topics, selector conflicts)
// - Notification Viewed & Clicked event tracking
// ============================================================================

import React, { useState } from 'react';

export default function WebNativeDisplayStudioView({
  nativeDisplayData,
  activeTopic,
  onTriggerTopic,
  onResetToFallback,
  onElementActionClicked,
  onResolvePriorities,
  priorityResults,
  isResolvingPriority,
  campaignsList
}) {
  const [activeTab, setActiveTab] = useState('kv'); // 'kv' | 'banner' | 'priority' | 'code'
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const carouselItems = [
    {
      title: 'Binaural Focus Soundscapes',
      tag: 'Pro Feature',
      desc: 'Alpha wave frequencies scientifically proven to lengthen deep work sprints.',
      bg: 'from-indigo-900 to-purple-900'
    },
    {
      title: 'Streak Multiplier Challenge',
      tag: 'Daily Habit',
      desc: 'Complete 3 focus blocks before 2 PM to double your weekly streak score.',
      bg: 'from-amber-900 to-orange-900'
    },
    {
      title: 'Smart Task Auto-Categorization',
      tag: 'Productivity AI',
      desc: 'Organize high-impact goals automatically with machine intelligence.',
      bg: 'from-emerald-900 to-teal-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-400/30">
                Web Native Display
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-400/30">
                Custom KV Template
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-semibold border border-purple-400/30">
                CT_web_native_display
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold border border-amber-400/30">
                Priority Engine Active
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2">CleverTap Web Native Display Studio</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Deliver real-time contextual personalization through custom key-value pairs, fallback content safety, Div ID banner targeting, and multi-campaign priority conflict resolution.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-3.5 self-start lg:self-center">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Active Topic</div>
              <div className="text-sm font-bold font-mono text-indigo-300">
                {activeTopic ? `"${activeTopic}"` : 'Fallback (Default)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('kv')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'kv'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Custom KV &amp; Topics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('banner')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'banner'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Banner &amp; Carousel Templates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('priority')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'priority'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Campaign Priority Handling
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'code'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Code &amp; Event Reference
        </button>
      </div>

      {/* 3. TAB 1: CUSTOM KEY-VALUE & TOPIC PERSONALIZATION */}
      {activeTab === 'kv' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Simulate Topic Triggers</span>
                <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                  CT_web_native_display
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Click any topic below to emit a real <code className="font-mono text-indigo-600">CT_web_native_display</code> event and observe real-time element personalization.
              </p>

              <div className="space-y-2.5 pt-2">
                {/* 1. Official Cart drop-off */}
                <button
                  type="button"
                  onClick={() => onTriggerTopic('Cart drop-off')}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeTopic === 'Cart drop-off'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Topic: &quot;Cart drop-off&quot;</span>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                      Official Doc Spec
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Personalized cart recovery with Name: &quot;Elena Vance&quot;, Cart: &quot;Roadster Jacket&quot;, code: SALE20.
                  </p>
                </button>

                {/* 2. Focus Streak Milestone */}
                <button
                  type="button"
                  onClick={() => onTriggerTopic('Focus Streak Milestone')}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeTopic === 'Focus Streak Milestone'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Topic: &quot;Focus Streak Milestone&quot;</span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                      Habit Reward
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Personalized celebration for reaching 7 consecutive daily Pomodoro focus blocks.
                  </p>
                </button>

                {/* 3. Pro Upgrade Offer */}
                <button
                  type="button"
                  onClick={() => onTriggerTopic('Pro Upgrade Offer')}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeTopic === 'Pro Upgrade Offer'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Topic: &quot;Pro Upgrade Offer&quot;</span>
                    <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                      50% Off Offer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Contextual conversion incentive offering Annual Pro upgrade at $29.99.
                  </p>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onResetToFallback}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Reset to Fallback / Default Content
                </button>
              </div>
            </div>

            {/* Active Payload Inspector Box */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-slate-300 font-mono text-[11px] space-y-1 overflow-x-auto">
              <div className="text-indigo-400 font-bold flex items-center justify-between">
                <span>{`// CT_web_native_display Event Payload`}</span>
                <span className="text-emerald-400 text-[10px]">topic is 1st key</span>
              </div>
              <pre className="text-emerald-400 text-[10px] leading-tight mt-2">
                {JSON.stringify(
                  nativeDisplayData || {
                    status: 'fallback_active',
                    message: 'No campaign payload received yet. Rendering default fallback content.'
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>

          {/* Personalized Element Container (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Personalized Container ({nativeDisplayData ? 'Dynamic Content' : 'Fallback Content'})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selector: <code className="font-mono text-indigo-600">#container</code> with fallback safety
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  nativeDisplayData ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {nativeDisplayData ? 'Personalized Live' : 'Default Fallback'}
                </span>
              </div>

              {/* RENDER CASE A: CART DROP-OFF (Matching official CleverTap documentation HTML) */}
              {activeTopic === 'Cart drop-off' && nativeDisplayData && (
                <div id="container" className="border-2 border-indigo-500 rounded-2xl p-6 bg-gradient-to-br from-indigo-50/50 to-white relative overflow-hidden shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={nativeDisplayData.kv?.BannerImage || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'}
                      alt="Cart dropoff"
                      className="w-full sm:w-36 h-36 object-cover rounded-xl shrink-0 shadow-2xs"
                    />
                    <div className="message space-y-2 flex-1">
                      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        Personalized Cart Recovery
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Hello <span id="user-name" className="text-indigo-600">{nativeDisplayData.kv?.Name}</span>,
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Still thinking about the <strong id="product-name" className="text-slate-900 font-bold">{nativeDisplayData.kv?.Cart}</strong> in your cart? We get it — it&apos;s fabulous.
                      </p>
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-semibold inline-block">
                        Use {nativeDisplayData.kv?.DiscountCode || 'SALE20'} and avail {nativeDisplayData.kv?.DiscountPercent || '20%'} off
                      </div>
                      <p className="text-[11px] text-slate-500">What are you waiting for??</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-indigo-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      clevertap.renderNotificationViewed() fired
                    </span>
                    <button
                      type="button"
                      onClick={() => onElementActionClicked(nativeDisplayData)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      Complete Purchase Now →
                    </button>
                  </div>
                </div>
              )}

              {/* RENDER CASE B: STREAK MILESTONE */}
              {activeTopic === 'Focus Streak Milestone' && nativeDisplayData && (
                <div id="container" className="border-2 border-emerald-500 rounded-2xl p-6 bg-gradient-to-br from-emerald-50/50 to-white relative overflow-hidden shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 text-2xl shadow-md">
                      🔥
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        Milestone Unlocked!
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Way to go, <span className="text-emerald-700">{nativeDisplayData.kv?.Name}</span>!
                      </h4>
                      <p className="text-xs text-slate-600">
                        {nativeDisplayData.kv?.CelebrationMessage}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold">
                        <span>🏆</span>
                        <span>Badge: {nativeDisplayData.kv?.MilestoneBadge}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-emerald-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      clevertap.renderNotificationViewed() fired
                    </span>
                    <button
                      type="button"
                      onClick={() => onElementActionClicked(nativeDisplayData)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      Share Streak Achievement →
                    </button>
                  </div>
                </div>
              )}

              {/* RENDER CASE C: PRO UPGRADE OFFER */}
              {activeTopic === 'Pro Upgrade Offer' && nativeDisplayData && (
                <div id="container" className="border-2 border-purple-500 rounded-2xl p-6 bg-gradient-to-br from-purple-50/50 to-white relative overflow-hidden shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 text-xl font-bold shadow-md">
                      PRO
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                        Exclusive Upgrade Offer
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Special for <span className="text-purple-700">{nativeDisplayData.kv?.Name}</span>
                      </h4>
                      <p className="text-xs text-slate-600">
                        Get <strong>{nativeDisplayData.kv?.PlanName}</strong> for only{' '}
                        <span className="text-emerald-600 font-bold text-sm">{nativeDisplayData.kv?.OfferPrice}</span>{' '}
                        <span className="line-through text-slate-400">{nativeDisplayData.kv?.OriginalPrice}</span>.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Includes: {nativeDisplayData.kv?.Perks}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-purple-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      clevertap.renderNotificationViewed() fired
                    </span>
                    <button
                      type="button"
                      onClick={() => onElementActionClicked(nativeDisplayData)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      Claim 50% Off Pro →
                    </button>
                  </div>
                </div>
              )}

              {/* RENDER CASE D: DEFAULT FALLBACK CONTENT */}
              {(!activeTopic || !nativeDisplayData) && (
                <div id="container" className="border border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 relative">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <h4 className="text-sm font-bold text-slate-700">
                      Default / Fallback Content (Active)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Per CleverTap prerequisites: <em>&quot;Ensure that the default/fallback content is configured on your website to render in case of delayed response from CleverTap servers.&quot;</em>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Welcome to FocusFlow! Manage your tasks and Pomodoro sessions seamlessly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: BANNER & CAROUSEL TEMPLATES */}
      {activeTab === 'banner' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Banner Container Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Web Native Banner Template
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target Selector: <code className="font-mono text-indigo-600">#native-banner-container</code>
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                  100% Width Auto-Aspect
                </span>
              </div>

              {/* Targeted Container */}
              <div
                id="native-banner-container"
                className="relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white p-6 min-h-[180px] flex flex-col justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white uppercase tracking-wider">
                    Targeted Banner
                  </span>
                  <h4 className="text-lg font-bold mt-2">
                    Summer Deep Work Accelerator
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">
                    Join over 12,000 knowledge workers sprinting towards Q4 goals with structured daily Pomodoros.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                  <span className="text-[10px] text-slate-400 font-mono">Div ID: native-banner-container</span>
                  <button
                    type="button"
                    onClick={() => onElementActionClicked({ msgId: 'banner_summer_accelerator' })}
                    className="bg-white text-indigo-950 hover:bg-slate-100 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Explore Accelerator →
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">CleverTap Div Height Guidance:</div>
                <p className="text-[11px] leading-relaxed">
                  If CSS height is not explicitly set, the banner takes 100% container width with height auto-adjusted. If explicit height is set, specify it under the Div height input field in the dashboard.
                </p>
              </div>
            </div>

            {/* Carousel Container Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Web Native Carousel Template
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target Selector: <code className="font-mono text-indigo-600">#native-carousel-container</code>
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">
                  Multi-Slide
                </span>
              </div>

              {/* Targeted Container */}
              <div
                id="native-carousel-container"
                className={`relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-r ${carouselItems[activeCarouselIndex].bg} text-white p-6 min-h-[180px] flex flex-col justify-between transition-all duration-300`}
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                    {carouselItems[activeCarouselIndex].tag}
                  </span>
                  <h4 className="text-lg font-bold mt-2">
                    {carouselItems[activeCarouselIndex].title}
                  </h4>
                  <p className="text-xs text-slate-200 mt-1 max-w-md">
                    {carouselItems[activeCarouselIndex].desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                  <div className="flex items-center gap-1.5">
                    {carouselItems.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveCarouselIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          activeCarouselIndex === idx ? 'bg-white w-5' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onElementActionClicked({ msgId: `carousel_slide_${activeCarouselIndex}` })}
                    className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    View Details →
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Dynamic Content Replacement:</div>
                <p className="text-[11px] leading-relaxed">
                  At campaign creation, users specify the Div ID. Existing content inside the container is dynamically replaced by the CleverTap campaign upon delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: CAMPAIGN PRIORITY HANDLING */}
      {activeTab === 'priority' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  CleverTap Campaign Priority Conflict Resolution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  When multiple campaigns target the same selector or topic, CleverTap executes the highest-priority campaign and suppresses conflicts.
                </p>
              </div>

              <button
                type="button"
                onClick={onResolvePriorities}
                disabled={isResolvingPriority}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Run Priority Resolution Engine</span>
              </button>
            </div>

            {/* The 4 Standard Rules Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Rule 1: Conflicting Topics</div>
                <p className="text-slate-600 text-[11px]">
                  Two KV campaigns share same topic &rarr; Highest priority executes, lower is ignored.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Rule 2: Unique Topics</div>
                <p className="text-slate-600 text-[11px]">
                  Multiple KV campaigns with different topics &rarr; All execute concurrently.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Rule 3: Selector Conflicts</div>
                <p className="text-slate-600 text-[11px]">
                  Campaigns targeting same DOM node &rarr; Highest priority wins entirely.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Rule 4: Cross-Event Isolation</div>
                <p className="text-slate-600 text-[11px]">
                  JSON &amp; Visual Editor events do not compete; both execute independently.
                </p>
              </div>
            </div>

            {/* Results Display */}
            {priorityResults && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {priorityResults.executedCount} Campaigns Executed
                  </span>
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                    {priorityResults.suppressedCount} Campaigns Suppressed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Executed list */}
                  <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/40 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✓</span>
                      <span>Winning / Executed Campaigns</span>
                    </h4>
                    <div className="space-y-2">
                      {priorityResults.executed?.map((c) => (
                        <div key={c.id} className="p-3 rounded-lg bg-white border border-emerald-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{c.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                              Priority: {c.priority}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Topic/Selector: <strong>{c.topic || c.selector || c.eventName}</strong>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            {c.resolution || c.executionReason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suppressed list */}
                  <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/40 space-y-3">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✕</span>
                      <span>Suppressed Campaigns</span>
                    </h4>
                    <div className="space-y-2">
                      {priorityResults.suppressed?.map((c) => (
                        <div key={c.id} className="p-3 rounded-lg bg-white border border-rose-200 text-xs space-y-1 opacity-80">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span className="line-through text-slate-500">{c.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-mono">
                              Priority: {c.priority}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Topic/Selector: <strong>{c.topic || c.selector || c.eventName}</strong>
                          </div>
                          <div className="text-[11px] text-rose-700">
                            {c.resolution || c.suppressionReason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: CODE & EVENT REFERENCE */}
      {activeTab === 'code' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Official CleverTap Web Native Display Implementation Code
          </h2>
          <p className="text-xs text-slate-500">
            Canonical event listener, topic routing, and Notification Viewed/Clicked tracking pattern from official documentation.
          </p>

          <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-1 overflow-x-auto leading-relaxed">
            <div className="text-indigo-400 font-bold">{`// 1. Listen to CT_web_native_display CustomEvent`}</div>
            <div>document.addEventListener(<span className="text-emerald-400">&quot;CT_web_native_display&quot;</span>, function(event) {`{`}</div>
            <div className="pl-4">const data = event.detail;</div>
            <div className="pl-4">const topic = data.kv?.topic; <span className="text-slate-500">{`// First key is always topic`}</span></div>
            <div className="pl-4">switch (topic) {`{`}</div>
            <div className="pl-8">case <span className="text-emerald-400">&quot;Cart drop-off&quot;</span>: {`{`}</div>
            <div className="pl-12">renderCartDropOffPersonalisationCampaign(data);</div>
            <div className="pl-12">break;</div>
            <div className="pl-8">{`}`}</div>
            <div className="pl-4">{`}`}</div>
            <div>{`}`});</div>
            <br />
            <div className="text-indigo-400 font-bold">{`// 2. Custom Rendering Function with Notification Viewed & Clicked`}</div>
            <div>function renderCartDropOffPersonalisationCampaign(data) {`{`}</div>
            <div className="pl-4">const name = data.kv.Name;</div>
            <div className="pl-4">const product = data.kv.Cart;</div>
            <div className="pl-4">const containerEl = document.getElementById(<span className="text-emerald-400">&apos;container&apos;</span>);</div>
            <div className="pl-4">const userNameEl = containerEl.querySelector(<span className="text-emerald-400">&apos;#user-name&apos;</span>);</div>
            <div className="pl-4">userNameEl.innerText = name;</div>
            <div className="pl-4">const productNameEl = containerEl.querySelector(<span className="text-emerald-400">&apos;#product-name&apos;</span>);</div>
            <div className="pl-4">productNameEl.innerText = product;</div>
            <br />
            <div className="pl-4 text-emerald-400">{`// Track viewed event in CleverTap`}</div>
            <div className="pl-4">clevertap.renderNotificationViewed(data);</div>
            <br />
            <div className="pl-4 text-emerald-400">{`// Track click event on interaction`}</div>
            <div className="pl-4">containerEl.addEventListener(<span className="text-emerald-400">&apos;click&apos;</span>, () =&gt; {`{`}</div>
            <div className="pl-8">clevertap.renderNotificationClicked(data);</div>
            <div className="pl-4">{`}`});</div>
            <div>{`}`}</div>
          </div>
        </div>
      )}
    </div>
  );
}
