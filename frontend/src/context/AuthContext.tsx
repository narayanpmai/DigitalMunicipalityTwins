import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tenantId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('p5_token');
      const storedUser = localStorage.getItem('p5_user');
      if (token && storedUser) {
        const parsed: AuthUser = JSON.parse(storedUser);
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem('p5_token');
      localStorage.removeItem('p5_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: AuthUser, token: string) => {
    localStorage.setItem('p5_token', token);
    localStorage.setItem('p5_user', JSON.stringify(userData));
    localStorage.setItem('p5_role', userData.role || 'admin');
    localStorage.setItem('p5_email', userData.email || '');
    localStorage.setItem('p5_name', userData.fullName || '');
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('p5_token');
    localStorage.removeItem('p5_user');
    localStorage.removeItem('p5_role');
    localStorage.removeItem('p5_email');
    localStorage.removeItem('p5_name');
    sessionStorage.clear();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
