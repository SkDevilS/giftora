import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// Get API URL from environment variable (required)
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set. Please check your .env file.');
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      loading: false,
      error: null,

      // Login function
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, access_token, refresh_token } = response.data;

          // Prevent admin users from logging into customer website
          if (user.role === 'admin') {
            set({ loading: false, error: 'Admin users cannot login here. Please use the admin login page.' });
            return { success: false, error: 'Admin users cannot login here. Please use the admin login page.' };
          }

          // Store tokens
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          set({
            isLoggedIn: true,
            user,
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Register function
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const { user, access_token, refresh_token } = response.data;

          // Store tokens
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          set({
            isLoggedIn: true,
            user,
            loading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Logout function
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear tokens and user data
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // Clear cart and wishlist from localStorage
          localStorage.removeItem('cart-storage');
          localStorage.removeItem('wishlist-storage');
          
          set({
            isLoggedIn: false,
            user: null,
            error: null,
          });
        }
      },

      // Verify token and get current user
      verifyAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isLoggedIn: false, user: null });
          return false;
        }

        try {
          const response = await api.get('/auth/me');
          const user = response.data.user;
          
          // Prevent admin users from being logged in on customer website
          if (user.role === 'admin') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({
              isLoggedIn: false,
              user: null,
            });
            return false;
          }
          
          set({
            isLoggedIn: true,
            user: user,
          });
          return true;
        } catch (error) {
          // Token is invalid, clear auth state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({
            isLoggedIn: false,
            user: null,
          });
          return false;
        }
      },

      // Update profile
      updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await api.put('/auth/profile', data);
          set({
            user: response.data.user,
            loading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Failed to update profile.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Change password
      changePassword: async (oldPassword, newPassword) => {
        set({ loading: true, error: null });
        try {
          await api.post('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword,
          });
          set({ loading: false, error: null });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Failed to change password.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
      }),
    }
  )
);

