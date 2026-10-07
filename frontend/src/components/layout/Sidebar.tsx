'use client';

/**
 * Navigation sidebar for authenticated pages.
 *
 * CLEVERTAP INTEGRATION TOUCHPOINTS:
 * 1. Web Inbox (App Inbox):
 *    - Bell icon trigger with id="ct-inbox-button"
 *    - Calls showInbox() to display persistent CleverTap messages
 * 2. Web Push Notifications:
 *    - Quick opt-in button calling requestWebPushPermission()
 * 3. Logout:
 *    - Tracks 'User Logged Out' event and ends active CleverTap session
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  showInbox,
  getUnreadInboxMessageCount,
  requestWebPushPermission,
} from '../../lib/clevertap/client';

// Navigation items
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/tasks', label: 'Tasks', icon: '✅' },
  { href: '/focus', label: 'Focus', icon: '⏱️' },
  { href: '/progress', label: 'Progress', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check for any unread Web Inbox messages
    const count = getUnreadInboxMessageCount();
    setUnreadCount(count);
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* App logo and Web Inbox Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-gray-900">FocusFlow</span>
          </div>
          {user && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              Hi, {user.name.split(' ')[0]}!
            </p>
          )}
        </div>

        {/* CleverTap Web Inbox trigger icon */}
        <button
          id="ct-inbox-button"
          onClick={() => {
            showInbox();
            setUnreadCount(0);
          }}
          title="Open Web Inbox"
          className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* CleverTap Web Push Action Card */}
        <div className="pt-6">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-left">
            <p className="text-xs font-semibold text-indigo-900 mb-1">📢 Web Push Reminders</p>
            <p className="text-[11px] text-indigo-600 mb-2">
              Receive streak nudges & session reminders via browser push.
            </p>
            <button
              onClick={() => requestWebPushPermission()}
              className="w-full text-xs font-medium bg-indigo-600 text-white py-1.5 px-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Enable Push
            </button>
          </div>
        </div>
      </nav>

      {/* Logout button at the bottom */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
