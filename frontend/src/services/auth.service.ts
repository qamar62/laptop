import api from './api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface ResetPasswordData {
  email: string;
}

export interface ConfirmResetData {
  token: string;
  password: string;
  password2: string;
}

const AuthService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/users/token/', credentials);
    // Store tokens in localStorage
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/users/users/', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/users/me/');
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post('/users/password-reset/', data);
    return response.data;
  },

  confirmReset: async (data: ConfirmResetData) => {
    const response = await api.post('/users/password-reset-confirm/', data);
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default AuthService;
