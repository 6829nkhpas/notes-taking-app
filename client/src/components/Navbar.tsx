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
    <nav className="fixed top-0 inset-x-0 h-14 bg-white/80 backdrop-blur shadow-sm border-b border-gray-200 z-50">
      <div className="container h-full flex items-center justify-between">
        <div className="font-semibold text-xl text-gray-900">Notes</div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user.name || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
