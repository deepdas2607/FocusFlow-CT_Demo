/**
 * FocusFlow Public Landing Page (app/page.tsx)
 * 
 * Next.js App Router Architecture:
 * - In Next.js (App Router), any page without the `'use client';` directive is rendered as a
 *   React Server Component (RSC) on the server.
 * - This improves performance because zero JavaScript bundle overhead is sent to the client
 *   for purely presentational layouts like this landing page.
 * 
 * Navigation:
 * - We import the `<Link>` component from 'next/link'.
 * - `<Link>` performs client-side soft navigation (SPA style) without triggering a full page refresh.
 * - It also automatically prefetches linked routes in the background when links appear in viewport.
 */

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        {/* Brand identity: icon and title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold text-gray-900">FocusFlow</span>
        </div>

        {/* Authentication navigation CTAs */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <main className="container mx-auto px-6 py-20 text-center">
        {/* Value proposition heading */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Build better focus,
          <br />
          <span className="text-indigo-600">one session at a time.</span>
        </h1>

        {/* Subtitle explaining the application's core feature set */}
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          FocusFlow helps you manage tasks, run Pomodoro-style focus sessions, and track your
          productivity over time.
        </p>

        {/* Primary Call-to-Action linking to account creation */}
        <Link
          href="/register"
          className="inline-block bg-indigo-600 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
        >
          Start for free →
        </Link>

        {/* ─── Core Product Features Grid ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          {/* Feature 1: Tasks */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Management</h3>
            <p className="text-gray-500 text-sm">
              Create and organize tasks by category and priority. Never lose track of what matters.
            </p>
          </div>

          {/* Feature 2: Focus Sessions */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Focus Sessions</h3>
            <p className="text-gray-500 text-sm">
              Start 25, 45, or 60-minute focus sessions. Pause, resume, or complete them at your
              pace.
            </p>
          </div>

          {/* Feature 3: Progress & Streaks */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-500 text-sm">
              View your streaks, total focus time, and completed tasks to stay motivated.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


