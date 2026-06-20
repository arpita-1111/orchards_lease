import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import axios from 'axios';
import {
  setAccessToken,
  setSessionId,
  setAuthFailureHandler,
} from '@/lib/apiClient';
import { authService } from '@/services/auth.service';
import type { User, Role } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  register: (body: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthFailure = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setSessionId(null);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(handleAuthFailure);
  }, [handleAuthFailure]);

  // Bootstrap: try to refresh the session on first load (cookie-based)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.data.accessToken);
        const me = await authService.me();
        setUser(me);
      } catch {
        handleAuthFailure();
      } finally {
        setLoading(false);
      }
    })();
  }, [handleAuthFailure]);

  const login = useCallback(async (email: string, password: string, remember = false) => {
    const { user: u, accessToken, sessionId } = await authService.login({
      email,
      password,
      remember,
    });
    setAccessToken(accessToken);
    if (sessionId) setSessionId(sessionId);
    setUser(u);
    return u;
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    const { user: u, accessToken } = await authService.adminLogin({ email, password });
    setAccessToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(
    async (body: { name: string; email: string; password: string; role: Role; phone?: string }) => {
      const { user: u, accessToken, sessionId } = await authService.register(body);
      setAccessToken(accessToken);
      if (sessionId) setSessionId(sessionId);
      setUser(u);
      return u;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      handleAuthFailure();
    }
  }, [handleAuthFailure]);

  const refreshUser = useCallback(async () => {
    const me = await authService.me();
    setUser(me);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
