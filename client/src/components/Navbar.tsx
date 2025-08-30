import React from 'react';
import { useAuthStore } from '../features/auth/useAuthStore';
import { logout } from '../features/auth/api';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      window.location.href = '/signup';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="fixed top-0 inset-x-0 h-16 bg-white/90 backdrop-blur shadow-sm border-b border-gray-200 z-50">
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414.707l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="font-semibold text-xl text-gray-900">Notes</div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user.name || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium underline transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
