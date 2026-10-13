// ============================================================================
// FILE: frontend/src/views/ProfileSettingsView.jsx
// PURPOSE: MVVM "View" for User Profile, Preferences, and CleverTap Web SDK
// Quick Start Guide controls (Init, Token, Region, SPA, Identify, Location,
// Increment/Decrement, Charged Purchases, Events, Debug, Offline, Privacy).
// ============================================================================

import React, { useState, useEffect } from 'react';
import { FOCUS_GOALS } from '../models/focusFlowModels';

export default function ProfileSettingsView({
  user,
  clevertapConfig,
  isProUser,
  onOpenProModal,
  onSaveProfile,
  onManualOnUserLogin,
  onManualProfilePush,
  onUpdateCleverTapConfig,
  onPurchaseProPlan,
  onSetLocation,
  onIncrementProperty,
  onDecrementProperty,
  onPrivacyChange,
  onDebugLevelChange,
  onToggleOfflineMode,
  onFireCustomEvent
}) {
  const [formState, setFormState] = useState({
    name: user?.name || 'Elena Vance',
    email: user?.email || 'elena.vance@focusflow.app',
    phone: user?.phone || '+14155552671',
    dob: user?.dob || '1998-05-14',
    occupation: user?.occupation || 'Senior Product Designer',
    focusGoal: user?.focusGoal || 'Deep Work',
    preferences: {
      notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
      productivityReminders: user?.preferences?.productivityReminders ?? true,
      sessionReminders: user?.preferences?.sessionReminders ?? true,
      weeklySummary: user?.preferences?.weeklySummary ?? true,
      marketingConsent: user?.preferences?.marketingConsent ?? true,
      analyticsOptOut: user?.preferences?.analyticsOptOut ?? false
    }
  });

  // Local state for CleverTap SDK credentials & initialization fields
  const [sdkForm, setSdkForm] = useState({
    accountId: clevertapConfig?.accountId || '587-878-Z97Z',
    token: clevertapConfig?.token || 'bab-ab5',
    region: clevertapConfig?.region || 'eu1',
    targetDomain: clevertapConfig?.targetDomain || '',
    spa: clevertapConfig?.spa ?? true
  });

  // Manual location state
  const [latitude, setLatitude] = useState('51.5074');
  const [longitude, setLongitude] = useState('-0.1278');

  // Charged purchase simulator fields
  const [chargeAmount, setChargeAmount] = useState('29.99');
  const [chargePaymentMode, setChargePaymentMode] = useState('Credit Card');
  const [chargeItemName, setChargeItemName] = useState('FocusFlow Pro Annual Plan');
  const [chargeItemCategory, setChargeItemCategory] = useState('Subscription');

  // Custom event tester fields
  const [customEventName, setCustomEventName] = useState('Product Viewed');
  const [includeProps, setIncludeProps] = useState(true);
  const [customPropKey, setCustomPropKey] = useState('Category');
  const [customPropValue, setCustomPropValue] = useState('Focus Tools');

  // Sync local profile form state when user reloads from SQLite
  useEffect(() => {
    if (!user) return;
    setFormState({
      name: user.name || 'Elena Vance',
      email: user.email || 'elena.vance@focusflow.app',
      phone: user.phone || '+14155552671',
      dob: user.dob || '1998-05-14',
      occupation: user.occupation || 'Senior Product Designer',
      focusGoal: user.focusGoal || 'Deep Work',
      preferences: {
        notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
        productivityReminders: user.preferences?.productivityReminders ?? true,
        sessionReminders: user.preferences?.sessionReminders ?? true,
        weeklySummary: user.preferences?.weeklySummary ?? true,
        marketingConsent: user.preferences?.marketingConsent ?? true,
        analyticsOptOut: user.preferences?.analyticsOptOut ?? false
      }
    });
  }, [user]);

  function handleFieldChange(field, value) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function handleTogglePreference(prefKey) {
    const nextValue = !formState.preferences[prefKey];
    setFormState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [prefKey]: nextValue
      }
    }));
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    onSaveProfile(formState);
  }

  function handleSdkConfigSubmit(e) {
    e.preventDefault();
    onUpdateCleverTapConfig(sdkForm);
  }

  function handleCustomEventSubmit(e) {
    e.preventDefault();
    if (!customEventName.trim()) return;
    if (includeProps && customPropKey.trim()) {
      onFireCustomEvent(customEventName.trim(), {
        [customPropKey.trim()]: customPropValue,
        Date: new Date().toISOString()
      });
    } else {
      onFireCustomEvent(customEventName.trim(), null);
    }
  }

  function handleChargedFormSubmit(e) {
    e.preventDefault();
    onPurchaseProPlan('Custom', chargePaymentMode);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Settings &amp; Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage Elena Vance&apos;s FocusFlow profile, SQLite preferences, and CleverTap Web SDK features.
        </p>
      </div>

      {/* SECTION 1: USER PROFILE & IDENTITY (SQLite + onUserLogin / profile.push) */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  1. User Profile &amp; Identity
                </h2>
                {isProUser && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    ⭐ PRO MEMBER
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Stored in SQLite (users table) and synced via clevertap.onUserLogin / profile.push
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onManualOnUserLogin}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Push onUserLogin
              </button>
              <button
                type="button"
                onClick={onManualProfilePush}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Push profile.push
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formState.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone (with Country Code)
              </label>
              <input
                type="text"
                value={formState.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+14155552671"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth (Sent as Date Object)
              </label>
              <input
                type="date"
                value={formState.dob}
                onChange={(e) => handleFieldChange('dob', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                value={formState.occupation}
                onChange={(e) => handleFieldChange('occupation', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Focus Goal
              </label>
              <select
                value={formState.focusGoal}
                onChange={(e) => handleFieldChange('focusGoal', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {FOCUS_GOALS.map((goal) => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 divide-y divide-slate-100">
            <PreferenceSwitchRow
              label="Enable Push Notifications (MSG-push)"
              description="Controls whether Elena Vance accepts push notifications"
              checked={formState.preferences.notificationsEnabled}
              onToggle={() => handleTogglePreference('notificationsEnabled')}
            />
            <PreferenceSwitchRow
              label="Enable Email Updates (MSG-email)"
              description="Controls whether Elena Vance accepts email notifications"
              checked={formState.preferences.marketingConsent}
              onToggle={() => handleTogglePreference('marketingConsent')}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-xs cursor-pointer"
          >
            Save Profile to SQLite &amp; Push to CleverTap (profile.push)
          </button>
        </section>
      </form>

      {/* SECTION 2: CLEVERTAP SDK INITIALIZATION, CREDENTIALS & REGION */}
      <form
        onSubmit={handleSdkConfigSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900">
            2. SDK Credentials, Region &amp; SPA Mode
          </h2>
          <p className="text-xs text-slate-500">
            Configure Project ID, Project Token, Region (eu1), and clevertap.spa = true
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project ID (Account ID)
            </label>
            <input
              type="text"
              required
              value={sdkForm.accountId}
              onChange={(e) => setSdkForm((prev) => ({ ...prev, accountId: e.target.value }))}
              placeholder="587-878-Z97Z"
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Token
            </label>
            <input
              type="text"
              value={sdkForm.token}
              onChange={(e) => setSdkForm((prev) => ({ ...prev, token: e.target.value }))}
              placeholder="bab-ab5"
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Region Code
            </label>
            <select
              value={sdkForm.region}
              onChange={(e) => setSdkForm((prev) => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="eu1">eu1 — Europe (Your Region)</option>
              <option value="in1">in1 — India</option>
              <option value="us1">us1 — United States</option>
              <option value="sg1">sg1 — Singapore</option>
              <option value="aps3">aps3 — Indonesia</option>
              <option value="mec1">mec1 — Middle East (UAE)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Domain (Optional)
            </label>
            <input
              type="text"
              value={sdkForm.targetDomain}
              onChange={(e) => setSdkForm((prev) => ({ ...prev, targetDomain: e.target.value }))}
              placeholder="clevertap-prod.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <PreferenceSwitchRow
          label="Single Page Application Mode (clevertap.spa = true)"
          description="Recommended best practice for SPAs so dynamic view transitions are tracked automatically"
          checked={sdkForm.spa}
          onToggle={() => setSdkForm((prev) => ({ ...prev, spa: !prev.spa }))}
        />

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Re-Initialize SDK — clevertap.init(&apos;{sdkForm.accountId}&apos;, &apos;{sdkForm.region}&apos;)
        </button>
      </form>

      {/* SECTION 3: PURCHASES & CHARGED SPECIAL EVENT */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              3. Recording Purchases — &quot;Charged&quot; Special Event
            </h2>
            <p className="text-xs text-slate-500">
              Captures transaction Amount, Payment mode, Charged ID, and Items collection in CleverTap
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenProModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Open Pro Upgrade Modal
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-700 mb-2">Simulate Custom Purchase Transaction:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount ($)</label>
              <input
                type="number"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment Mode</label>
              <select
                value={chargePaymentMode}
                onChange={(e) => setChargePaymentMode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Apple Pay">Apple Pay</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Item Name</label>
              <input
                type="text"
                value={chargeItemName}
                onChange={(e) => setChargeItemName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
              <input
                type="text"
                value={chargeItemCategory}
                onChange={(e) => setChargeItemCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleChargedFormSubmit}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Fire clevertap.event.push(&quot;Charged&quot;, payload)
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: LOCATION & NUMERIC INCREMENT / DECREMENT OPERATORS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            4. Location &amp; Increment / Decrement Operators
          </h2>
          <p className="text-xs text-slate-500">
            Enrich user location (clevertap.getLocation) and modify numeric profile metrics (handleIncrementValue)
          </p>
        </div>

        {/* Location Controls */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <p className="text-xs font-bold text-slate-700">Set User Location ($ct.location):</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitude</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="51.5074"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitude</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-0.1278"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => onSetLocation(latitude, longitude)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
              >
                Set Location
              </button>
              <button
                type="button"
                onClick={() => onSetLocation(null, null)}
                className="py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                title="Auto-detect using browser geolocation"
              >
                Auto Detect
              </button>
            </div>
          </div>
        </div>

        {/* Increment / Decrement Operators */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-700 mb-2">
            Increment / Decrement Profile Properties (clevertap.handleIncrementValue):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onIncrementProperty('Total Tasks Completed', 1)}
              className="py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer text-left"
            >
              +1 Tasks Completed
            </button>
            <button
              type="button"
              onClick={() => onIncrementProperty('Total Focus Minutes', 25)}
              className="py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer text-left"
            >
              +25 Focus Minutes
            </button>
            <button
              type="button"
              onClick={() => onIncrementProperty('Current Streak', 1)}
              className="py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer text-left"
            >
              +1 Streak Day
            </button>
            <button
              type="button"
              onClick={() => onDecrementProperty('Total Tasks Completed', 1)}
              className="py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer text-left"
            >
              -1 Tasks Completed
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: DEBUGGING, OFFLINE MODE & PRIVACY CONTROLS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            5. Debugging, Offline Mode &amp; Privacy Controls
          </h2>
          <p className="text-xs text-slate-500">
            Control clevertap.setLogLevel(), sessionStorage[&apos;WZRK_D&apos;], clevertap.setOffline(), and clevertap.privacy.push()
          </p>
        </div>

        <div className="pt-1">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            SDK Log Level — clevertap.setLogLevel(LOG_LEVEL)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { level: 0, label: '0: Disable All' },
              { level: 1, label: '1: Errors Only' },
              { level: 2, label: '2: Errors & Info' },
              { level: 3, label: '3: All Verbose Logs' }
            ].map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => onDebugLevelChange(item.level, clevertapConfig?.wzrkDebug)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  Number(clevertapConfig?.logLevel) === item.level
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <PreferenceSwitchRow
            label="Verbose Console Debugging (sessionStorage['WZRK_D'] = '')"
            description="Logs all communication with CleverTap servers in the browser Developer Console"
            checked={Boolean(clevertapConfig?.wzrkDebug)}
            onToggle={() =>
              onDebugLevelChange(clevertapConfig?.logLevel ?? 3, !clevertapConfig?.wzrkDebug)
            }
          />

          <PreferenceSwitchRow
            label="Offline Mode — clevertap.setOffline(true / false)"
            description="When true, events are queued locally; when set back to false, queued events fire immediately"
            checked={Boolean(clevertapConfig?.isOffline)}
            onToggle={() => onToggleOfflineMode(!clevertapConfig?.isOffline)}
          />

          <PreferenceSwitchRow
            label="Opt Out of Data Sharing — clevertap.privacy.push({ optOut })"
            description="Set to true if the user of the device opts out of sharing their data"
            checked={Boolean(clevertapConfig?.optOut)}
            onToggle={() => onPrivacyChange(!clevertapConfig?.optOut, clevertapConfig?.useIP)}
          />

          <PreferenceSwitchRow
            label="Share IP Address — clevertap.privacy.push({ useIP })"
            description="Set to true if the user agrees to share their IP data with CleverTap"
            checked={Boolean(clevertapConfig?.useIP)}
            onToggle={() => onPrivacyChange(clevertapConfig?.optOut, !clevertapConfig?.useIP)}
          />
        </div>
      </section>

      {/* SECTION 6: CUSTOM EVENT TESTER (clevertap.event.push) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            6. Track Custom User Events — clevertap.event.push()
          </h2>
          <p className="text-xs text-slate-500">
            Test pushing events without properties or with custom key/value pairs
          </p>
        </div>

        <form onSubmit={handleCustomEventSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Name</label>
              <input
                type="text"
                value={customEventName}
                onChange={(e) => setCustomEventName(e.target.value)}
                placeholder="e.g. Product Viewed"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Key</label>
              <input
                type="text"
                disabled={!includeProps}
                value={customPropKey}
                onChange={(e) => setCustomPropKey(e.target.value)}
                placeholder="e.g. Category"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Value</label>
              <input
                type="text"
                disabled={!includeProps}
                value={customPropValue}
                onChange={(e) => setCustomPropValue(e.target.value)}
                placeholder="e.g. Focus Tools"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeProps}
                onChange={(e) => setIncludeProps(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Include event properties key/value object
            </label>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Push Custom Event (clevertap.event.push)
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

// Reusable accessible toggle switch row component
function PreferenceSwitchRow({ label, description, checked, onToggle }) {
  return (
    <div className="py-3.5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 cursor-pointer ${
          checked ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
