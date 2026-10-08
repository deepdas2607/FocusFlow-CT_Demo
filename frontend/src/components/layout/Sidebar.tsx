'use client';

/**
 * Navigation sidebar for authenticated pages.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* App logo and Header */}
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
