"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@lib/definitions/auth';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const publicRoutes = ['/', '/auth'];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    // Handle route protection
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/auth');
      } else if (isAuthenticated && pathname === '/auth') {
        router.push('/generator');
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router]);

  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        await verifyToken(storedToken);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setIsLoading(false);
    }
  };

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        setToken(tokenToVerify);
        setIsAuthenticated(true);
      } else {
        // Token is invalid
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
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
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth');
  };

  const getAuthHeaders = () => {
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
    return {};
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated (unless on public route)
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-foreground/60">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
