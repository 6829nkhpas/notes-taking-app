import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/useAuthStore';
import Loader from '../../components/Loader';

export default function Welcome() {
  const navigate = useNavigate();
  const { user, loading, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!user) {
      fetchMe();
    }
  }, [user, fetchMe]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 pb-24 px-4">
        <div className="text-center">
          <Loader size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-24 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || 'User'}!
          </h1>
          
          <p className="text-gray-600 mb-6">
            You're signed in as <strong>{user.email}</strong>
          </p>
          
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {user.provider === 'google' ? 'Google Account' : 'Email + OTP'}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/notes')}
            className="form-button"
          >
            Go to Notes
          </button>
          
          <button
            onClick={() => navigate('/signup')}
            className="w-full px-6 py-2 text-gray-600 hover:text-gray-900 underline"
          >
            Sign in with different account
          </button>
        </div>
      </div>
    </div>
  );
}
