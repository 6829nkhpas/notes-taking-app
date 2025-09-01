import { create } from 'zustand';
import { me, logout as logoutApi } from './api';

export interface User {
  id: string;
  email: string;
  name?: string;
  provider: 'email' | 'google';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),
  clearUser: () => set({ user: null, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchMe: async () => {
    try {
      set({ loading: true, error: null });
      const response = await me();
      set({ user: response.data.data.user, loading: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string }, status?: number } };
      console.log('AuthStore: fetchMe failed:', axiosError?.response?.data);
      
      // Clear user state on authentication failure
      if (axiosError?.response?.status === 401) {
        localStorage.removeItem('access_token');
        set({ user: null, error: null, loading: false });
      } else {
        set({ 
          error: axiosError?.response?.data?.message || 'Failed to fetch user', 
          loading: false 
        });
      }
    }
  },

  logout: async () => {
    try {
      await logoutApi();
      // Clear localStorage token
      localStorage.removeItem('access_token');
      set({ user: null, error: null, loading: false });
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear user state and localStorage even if API call fails
      localStorage.removeItem('access_token');
      set({ user: null, error: null, loading: false });
    }
  }
}));
