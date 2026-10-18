// ============================================================================
// FILE: frontend/src/app/layout.jsx
// PURPOSE: Root HTML layout and typography setup for FocusFlow.
// ============================================================================

import './globals.css';

export const metadata = {
  title: 'FocusFlow — Personal Focus & Habit Companion',
  description: 'Manage your daily focus tasks, Pomodoro sessions, and productivity habits.',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FocusFlow'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
