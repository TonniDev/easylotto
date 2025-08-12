"use client";

import { useState, useEffect } from 'react';
import { User } from '@lib/definitions/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAuthState({
          user: result.user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token');
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = (token: string, user: User) => {
    localStorage.setItem('auth_token', token);
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    const token = authState.token;
    
    if (token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    localStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const getAuthHeaders = () => {
    if (authState.token) {
      return {
        'Authorization': `Bearer ${authState.token}`,
      };
    }
    return {};
  };

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders,
  };
}
