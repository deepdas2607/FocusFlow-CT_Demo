import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata: Metadata = {
  title: 'FocusFlow - Productivity & Focus Sessions',
  description: 'Track tasks, run focus sessions, and build better productivity habits.',
};

// This is the root layout that wraps every page in the application.
// AuthProvider gives all pages access to the current user.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-gray-900 bg-gray-50">
        {/* AuthProvider makes user state available throughout the app */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

