import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiFetch, setAuthToken, getAuthToken } from '../services/apiClient';
import { DEMO_USERS } from '../mockData/users';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: keyof User['permissions']) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sentinel_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Attempt session restoration on boot
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch<{ success: boolean; user: User }>('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        } else {
          setAuthToken(null);
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (err) {
        console.warn('Session restoration token check failed:', err);
        // Check saved profile or demo fallback
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved && token.startsWith('mock_jwt_token_')) {
          try {
            setUser(JSON.parse(saved));
          } catch (e) {
            setAuthToken(null);
            setUser(null);
          }
        } else {
          setAuthToken(null);
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      // Default to "password123" if password is mock placeholder or not supplied
      const cleanPassword = (!password || password.includes('•••')) ? 'password123' : password;

      const data = await apiFetch<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password: cleanPassword }),
      });

      if (data.success && data.token) {
        setAuthToken(data.token);
        setUser(data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error: any) {
      console.warn('Backend API auth failed, checking demo fallback:', error.message);

      // Offline / Connection Fallback mode
      const demoUser = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (demoUser) {
        setAuthToken('mock_jwt_token_' + demoUser.role.toLowerCase());
        setUser(demoUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
        return true;
      }

      throw new Error(error.message || 'Verification failed');
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('API logout alert failed:', e);
    }
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = async (role: UserRole) => {
    let targetEmail = 'elena.vance@sentinel-fin.internal';
    if (role === 'FINANCE_OFFICER') {
      targetEmail = 'rajesh.malhotra@sentinel-fin.internal';
    } else if (role === 'DEPARTMENT_HEAD') {
      targetEmail = 'priya.sharma@sentinel-fin.internal';
    }

    try {
      await login(targetEmail, 'password123');
      window.location.reload(); // Force refresh to re-initiate pages
    } catch (e) {
      console.error('Switch role request failed:', e);
    }
  };

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    if (!user) return false;
    return Boolean(user.permissions && user.permissions[permission]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getAuthToken(),
        login,
        logout,
        switchRole,
        hasPermission,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
