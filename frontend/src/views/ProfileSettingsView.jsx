// ============================================================================
// FILE: frontend/src/views/ProfileSettingsView.jsx
// PURPOSE: MVVM "View" for editing User Profile, Notification Preferences,
// Privacy Consent, and testing custom SDK events.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { FOCUS_GOALS } from '../models/focusFlowModels';

export default function ProfileSettingsView({
  user,
  onSaveProfile,
  onRequestWebPush,
  onPrivacyOptOutChange,
  onFireCustomEvent
}) {
  const [formState, setFormState] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '1999-07-26',
    occupation: user?.occupation || 'Software Engineer',
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

  // Custom event tester fields for reproducing customer SDK scenarios
  const [customEventName, setCustomEventName] = useState('Habit Milestone Reached');
  const [customPropKey, setCustomPropKey] = useState('Milestone Days');
  const [customPropValue, setCustomPropValue] = useState('7');

  // Sync local form state whenever the user object reloads from SQLite
  useEffect(() => {
    if (!user) return;
    setFormState({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      dob: user.dob || '1999-07-26',
      occupation: user.occupation || 'Software Engineer',
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

  // Updates a top-level profile field (name, email, phone, dob, occupation, focusGoal)
  function handleFieldChange(field, value) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  // Toggles one of the boolean preference switches
  function handleTogglePreference(prefKey) {
    const nextValue = !formState.preferences[prefKey];
    setFormState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [prefKey]: nextValue
      }
    }));

    if (prefKey === 'analyticsOptOut') {
      onPrivacyOptOutChange(nextValue);
    }
  }

  // Saves the updated profile and preferences to SQLite and CleverTap
  function handleFormSubmit(e) {
    e.preventDefault();
    onSaveProfile(formState);
  }

  // Fires the custom event entered in the Custom Event Tester card
  function handleCustomEventSubmit(e) {
    e.preventDefault();
    if (!customEventName.trim()) return;
    onFireCustomEvent(customEventName.trim(), {
      [customPropKey || 'Property']: customPropValue
    });
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Settings &amp; Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account details, notification preferences, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* 1. Profile Details Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Profile</h2>
              <p className="text-xs text-slate-500">
                Stored in SQLite (users table) and synced on profile update
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              ID: {user?.id}
            </span>
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
                Phone Number (E.164 format)
              </label>
              <input
                type="text"
                value={formState.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+919876543210"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
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
        </section>

        {/* 2. Notification Preferences Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
              <p className="text-xs text-slate-500">
                Choose which reminders and nudges FocusFlow sends you
              </p>
            </div>
            <button
              type="button"
              onClick={onRequestWebPush}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer w-fit"
            >
              Enable Browser Web Push
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <PreferenceSwitchRow
              label="Enable Notifications"
              description="Allow FocusFlow to send browser and in-app notifications (MSG-push)"
              checked={formState.preferences.notificationsEnabled}
              onToggle={() => handleTogglePreference('notificationsEnabled')}
            />
            <PreferenceSwitchRow
              label="Productivity Reminders"
              description="Receive daytime nudges to stay on track with your focus goal"
              checked={formState.preferences.productivityReminders}
              onToggle={() => handleTogglePreference('productivityReminders')}
            />
            <PreferenceSwitchRow
              label="Daily Session Reminders"
              description="Get a reminder if you have not logged a focus session today"
              checked={formState.preferences.sessionReminders}
              onToggle={() => handleTogglePreference('sessionReminders')}
            />
            <PreferenceSwitchRow
              label="Weekly Summary Report"
              description="Receive a weekly breakdown of completed tasks and focus hours"
              checked={formState.preferences.weeklySummary}
              onToggle={() => handleTogglePreference('weeklySummary')}
            />
          </div>
        </section>

        {/* 3. Privacy & Data Consent Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Privacy &amp; Data Preferences</h2>
            <p className="text-xs text-slate-500">
              Control marketing communications and analytics tracking consent
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <PreferenceSwitchRow
              label="Product Tips & Email Updates"
              description="Receive productivity tips and feature updates via email (MSG-email)"
              checked={formState.preferences.marketingConsent}
              onToggle={() => handleTogglePreference('marketingConsent')}
            />
            <PreferenceSwitchRow
              label="Opt Out of Analytics Tracking"
              description="Stop sending behavioral analytics events (clevertap.privacy.push optOut)"
              checked={formState.preferences.analyticsOptOut}
              onToggle={() => handleTogglePreference('analyticsOptOut')}
            />
          </div>
        </section>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-xs cursor-pointer"
        >
          Save Profile &amp; Preferences
        </button>
      </form>

      {/* 4. Custom Event Sandbox Card (for reproducing customer SDK event issues) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Custom Event Sandbox
          </h2>
          <p className="text-xs text-slate-500">
            Fire any custom event name and property to test SDK behavior and inspect the payload in the Live Activity drawer.
          </p>
        </div>

        <form onSubmit={handleCustomEventSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Name</label>
            <input
              type="text"
              value={customEventName}
              onChange={(e) => setCustomEventName(e.target.value)}
              placeholder="e.g. Habit Milestone Reached"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Property Key</label>
            <input
              type="text"
              value={customPropKey}
              onChange={(e) => setCustomPropKey(e.target.value)}
              placeholder="e.g. Milestone Days"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Property Value</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPropValue}
                onChange={(e) => setCustomPropValue(e.target.value)}
                placeholder="e.g. 7"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                Push Event
              </button>
            </div>
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

