'use client';

/**
 * Settings / Profile page - Manages user profile, preferences, and privacy consent.
 */

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import { profileApi } from '../../lib/api';

const DURATION_OPTIONS = [
  { label: '25 minutes (Pomodoro)', value: 25 },
  { label: '45 minutes (Deep work)', value: 45 },
  { label: '60 minutes (Flow state)', value: 60 },
];

export default function SettingsPage() {
  const { user, setUser } = useAuth();

  // Profile form fields
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [interests, setInterests] = useState('');
  const [preferredFocusDuration, setPreferredFocusDuration] = useState(25);

  // Notification preference fields
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [productivityReminders, setProductivityReminders] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);

  // Privacy & Consent state (GDPR)
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Populate form fields
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOccupation(user.occupation || '');
      setInterests(user.interests || '');
      setPreferredFocusDuration(user.preferredFocusDuration || 25);
      setNotificationsEnabled(user.preferences?.notificationsEnabled ?? true);
      setProductivityReminders(user.preferences?.productivityReminders ?? true);
      setSessionReminders(user.preferences?.sessionReminders ?? true);
      setWeeklySummary(user.preferences?.weeklySummary ?? true);
    }
  }, [user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Name is required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await profileApi.update({
        name: name.trim(),
        occupation: occupation.trim(),
        interests: interests.trim(),
        preferredFocusDuration,
        notificationsEnabled,
        productivityReminders,
        sessionReminders,
        weeklySummary,
      });

      setUser(response.user);
      setSuccessMessage('Profile and preferences saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Could not save profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Analytics Opt-Out
  const handleAnalyticsOptOutToggle = (optOut: boolean) => {
    setAnalyticsOptOut(optOut);
  };

  return (
    <AppLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings & Profile</h1>
        <p className="text-gray-500 mt-1">
          Configure profile attributes, notification preferences, and privacy consent.
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        {/* Alerts */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
            ✓ {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* 1. Profile information */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
              User Profile
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="settings-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Used to identify your account across sessions.
              </p>
            </div>

            <div>
              <label
                htmlFor="settings-occupation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Occupation / Role
                <span className="text-xs text-gray-400 font-normal ml-1">
                  (helps customize your workspace)
                </span>
              </label>
              <input
                id="settings-occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager, Student"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="settings-interests"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Interests & Skills
                <span className="text-xs text-gray-400 font-normal ml-1">
                  (comma-separated)
                </span>
              </label>
              <input
                id="settings-interests"
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. programming, reading, ai, deep-work"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </section>

        {/* 2. Focus Preferences (Personalization) */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Focus Preferences</h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
              Focus Settings
            </span>
          </div>
          <div>
            <label
              htmlFor="settings-duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Preferred Session Duration
            </label>
            <select
              id="settings-duration"
              value={preferredFocusDuration}
              onChange={(e) => setPreferredFocusDuration(parseInt(e.target.value, 10))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Default focus duration for new sessions.
            </p>
          </div>
        </section>

        {/* 3. Notification preferences */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Notification Preferences</h2>
          <p className="text-sm text-gray-500 mb-5">
            Choose which notifications and nudges you would like to receive.
          </p>
          <div className="space-y-4">
            <ToggleRow
              id="pref-notifications"
              label="Enable Notifications"
              description="Allow FocusFlow to send notifications"
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />
            <ToggleRow
              id="pref-productivity"
              label="Productivity Reminders"
              description="Nudges during your workday to keep focus"
              checked={productivityReminders}
              onChange={setProductivityReminders}
            />
            <ToggleRow
              id="pref-session"
              label="Session Reminders"
              description="Nudge if no session is logged today"
              checked={sessionReminders}
              onChange={setSessionReminders}
            />
            <ToggleRow
              id="pref-weekly"
              label="Weekly Summary"
              description="Receive weekly productivity reports"
              checked={weeklySummary}
              onChange={setWeeklySummary}
            />
          </div>
        </section>

        {/* 4. Privacy & Consent */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Privacy & Data Preferences</h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
              Privacy
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Manage your data preferences and personalization options.
          </p>
          <div className="space-y-4">
            <ToggleRow
              id="pref-marketing-consent"
              label="Product Tips & Updates"
              description="Receive productivity recommendations and feature highlights"
              checked={marketingConsent}
              onChange={setMarketingConsent}
            />
            <ToggleRow
              id="pref-opt-out"
              label="Opt Out of Analytics Tracking"
              description="Cease collecting anonymized usage metrics"
              checked={analyticsOptOut}
              onChange={handleAnalyticsOptOutToggle}
            />
          </div>
        </section>

        {/* Save button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </AppLayout>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
