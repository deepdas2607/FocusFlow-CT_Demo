'use client';

/**
 * FocusFlow Authenticated AppLayout (components/layout/AppLayout.tsx)
 * 
 * Route Guard Pattern:
 * 1. Checks `isAuthenticated` and `isLoading` from AuthContext.
 * 2. If session verification is still in flight (`isLoading: true`), displays a friendly loading spinner.
 * 3. If unauthenticated (`!isAuthenticated`), imperatively redirects the browser to `/login` via `router.push('/login')`.
 * 4. Returns `null` while redirecting to prevent a "Flash of Unauthenticated Content" (FOUC).
 * 5. Once confirmed authenticated, wraps the page `children` alongside the persistent `<Sidebar />`.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Route Guard: Redirect to login if user is not authenticated once initial check settles
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Render centered loading indicator while validating localStorage JWT token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-500 font-medium">Loading FocusFlow...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of private content during the brief moment before redirect finishes
  if (!isAuthenticated) {
    return null;
  }

  // Two-column layout: fixed Sidebar on left, scrollable main content area on right
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar navigation on the left */}
      <Sidebar />

      {/* Main content area on the right */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}


