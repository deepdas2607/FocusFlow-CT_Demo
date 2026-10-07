'use client';

/**
 * AuthContext - Provides user authentication state to the entire React app.
 *
 * HOW THIS WORKS:
 * - This context wraps the entire app (in layout.tsx)
 * - Any component can call useAuth() to get the current user and auth functions
 * - The JWT token is stored in localStorage so the user stays logged in after refresh
 * - On app load, we call GET /api/auth/me to restore the session if a token exists
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, TOKEN_KEY, User } from '../lib/api';
import { identifyUser, logoutCleverTapUser, trackEvent, initWebInbox } from '../lib/clevertap/client';
import { CLEVERTAP_EVENTS } from '../lib/clevertap/events';

// Define what the context will provide to components
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void; // Used after profile updates
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider Component ───────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True while we check for existing session

  // On first load, check if the user has an existing session (token in localStorage)
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        // No token - user is not logged in
        setIsLoading(false);
        return;
      }

      try {
        // Verify the token is still valid by fetching the current user
        const response = await authApi.getMe();
        setUser(response.user);

        // Re-identify the user in CleverTap after page refresh
        // This ensures CleverTap knows who this user is
        identifyUser({
          name: response.user.name,
          email: response.user.email,
          identity: response.user.id,
          occupation: response.user.occupation || undefined,
          interests: response.user.interests || undefined,
          preferredFocusDuration: response.user.preferredFocusDuration,
          notificationsEnabled: response.user.preferences?.notificationsEnabled,
        });

        // Initialize Web Inbox for the authenticated user
        initWebInbox();
      } catch {
        // Token is invalid or expired - remove it
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login function - called from the login page
  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });

    // Store the JWT token in localStorage
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);

    // Identify the user in CleverTap so all future events are tied to their profile
    identifyUser({
      name: response.user.name,
      email: response.user.email,
      identity: response.user.id,
      occupation: response.user.occupation || undefined,
      interests: response.user.interests || undefined,
      preferredFocusDuration: response.user.preferredFocusDuration,
      notificationsEnabled: response.user.preferences?.notificationsEnabled,
    });

    // Initialize Web Inbox
    initWebInbox();

    // Track the login event in CleverTap
    trackEvent(CLEVERTAP_EVENTS.USER_LOGGED_IN);
  }, []);

  // Logout function - clears token and redirects to login
  const logout = useCallback(() => {
    // Track the logout event before clearing user data
    trackEvent(CLEVERTAP_EVENTS.USER_LOGGED_OUT);
    logoutCleverTapUser();

    // Remove the JWT token from localStorage
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);

    // Redirect to the login page
    window.location.href = '/login';
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── useAuth Hook ─────────────────────────────────────────────────────────────

/**
 * Custom hook to access authentication state and functions.
 * Must be used inside a component wrapped by AuthProvider.
 *
 * Usage:
 *   const { user, isAuthenticated, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider component.');
  }

  return context;
}

