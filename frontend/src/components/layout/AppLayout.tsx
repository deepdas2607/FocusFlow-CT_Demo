'use client';

/**
 * AppLayout - Wraps authenticated pages with the sidebar + main content area.
 * Also redirects unauthenticated users to the login page.
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

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show a loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-500">Loading FocusFlow...</p>
        </div>
      </div>
    );
  }

  // Don't render the layout if not authenticated (prevents flash before redirect)
  if (!isAuthenticated) {
    return null;
  }

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

