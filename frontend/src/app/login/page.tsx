'use client';

/**
 * FocusFlow Login Page (app/login/page.tsx)
 * 
 * Next.js Client Component Architecture:
 * - We declare `'use client';` at the top because this component requires browser-side interactivity:
 *   managing form inputs (`useState`), handling submit events (`onSubmit`), and client-side
 *   route transitions (`useRouter`).
 * 
 * Authentication Flow:
 * 1. User enters email and password into controlled inputs.
 * 2. On submit, default browser form refresh is prevented (`event.preventDefault()`).
 * 3. `login(email, password)` from AuthContext is invoked:
 *    - Sends POST /api/auth/login to Express backend.
 *    - Stores JWT token in localStorage (`focusflow_token`).
 *    - Updates React AuthContext state with user profile.
 * 4. User is redirected to `/dashboard` via `router.push()`.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Controlled form state for user credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state for loading spinner and error alerts
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Form submission handler
   * Validates non-empty input and calls AuthContext login function.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent full page reload
    setError('');

    // Pre-flight validation
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // AuthContext handles HTTP request, localStorage persistence, and user state
      await login(email, password);

      // Programmatic navigation to dashboard upon successful login
      router.push('/dashboard');
    } catch (err: any) {
      // Surface user-friendly error message from server
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Log in to continue your focus journey</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-medium hover:text-indigo-700">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

