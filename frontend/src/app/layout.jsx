// ============================================================================
// FILE: frontend/src/app/layout.jsx
// PURPOSE: Root HTML layout and typography setup for FocusFlow.
// ============================================================================

import './globals.css';

export const metadata = {
  title: 'FocusFlow — Personal Focus & Habit Companion',
  description: 'Manage your daily focus tasks, Pomodoro sessions, and productivity habits.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
