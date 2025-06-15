// Authentication utility functions and types
export interface User {
  id: string | number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('joyverse_token') || sessionStorage.getItem('joyverse_token');
  return !!token;
};

// Get current user from storage
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('joyverse_user') || sessionStorage.getItem('joyverse_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Get auth token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('joyverse_token') || sessionStorage.getItem('joyverse_token');
};

// Logout user
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('joyverse_user');
  localStorage.removeItem('joyverse_token');
  sessionStorage.removeItem('joyverse_user');
  sessionStorage.removeItem('joyverse_token');
};

// API base configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// API call wrapper with auth
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Auth API functions - replace these with your actual API calls
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // This is a mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'test@joyverse.com' && password === 'password123') {
          resolve({
            success: true,
            user: { id: 1, name: 'Test User', email },
            token: 'mock-jwt-token-' + Date.now()
          });
        } else {
          resolve({
            success: false,
            message: 'Invalid email or password'
          });
        }
      }, 1000);
    });
    
    // Real implementation would look like:
    // return apiCall('/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ email, password })
    // });
  },

  signup: async (userData: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    // This is a mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Account created successfully. Please check your email to verify your account.'
        });
      }, 1500);
    });
    
    // Real implementation would look like:
    // return apiCall('/auth/signup', {
    //   method: 'POST',
    //   body: JSON.stringify(userData)
    // });
  },

  forgotPassword: async (email: string): Promise<AuthResponse> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Password reset instructions sent to your email.'
        });
      }, 1000);
    });
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Email verified successfully.'
        });
      }, 1000);
    });
  }
};
