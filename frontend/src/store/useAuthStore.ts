import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AuthService, { User } from '@/services/auth.service';

// Using User interface imported from auth.service

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  loadUser: () => Promise<User | null>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.login({ email, password });
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Login failed', 
            isLoading: false 
          });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          // Format data to match backend expectations
          const registrationData = {
            email: data.email,
            password: data.password,
            password2: data.password2,
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: null,  // Optional fields
            date_of_birth: null,
            profile_picture: null
          };
          await AuthService.register(registrationData);
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Registration error:', error.response?.data || error);
          set({ 
            error: error.response?.data?.email || 
                  error.response?.data?.password || 
                  error.response?.data?.detail || 
                  'Registration failed. Please try again.', 
            isLoading: false 
          });
        }
      },

      logout: () => {
        AuthService.logout();
        set({ user: null, isAuthenticated: false });
      },

      clearError: () => {
        set({ error: null });
      },

      loadUser: async () => {
        if (!AuthService.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return null;
        }

        set({ isLoading: true });
        try {
          const user = await AuthService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error: any) {
          // Don't automatically logout on error to prevent redirect loops
          // Just clear the authentication state
          set({ user: null, isAuthenticated: false, isLoading: false });
          // Clear tokens only if they're invalid
          if (error?.response && (error.response.status === 401 || error.response.status === 403)) {
            AuthService.logout();
          }
          return null;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
