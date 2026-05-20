import { create } from 'zustand';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch custom user details from our backend
        const userData = await api.auth.getMe();
        set({ user: userData, isAuthenticated: true, isLoading: false });
      } else {
        // Check for MASTER_ADMIN_TOKEN in localStorage
        const localToken = localStorage.getItem('token');
        if (localToken === 'MASTER_ADMIN_TOKEN') {
          const userData = await api.auth.getMe();
          set({ user: userData, isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: error.message });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.auth.login(credentials);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },



  logout: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  }
}));
