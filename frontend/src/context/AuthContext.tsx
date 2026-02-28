import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { ApiResponse, AuthData, User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setToken(storedToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    const verifySession = async () => {
      try {
        if (!storedToken) {
          setIsLoading(false);
          return;
        }
        const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        setUser(response.data.data.user);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession().catch(() => setIsLoading(false));
  }, []);

  const handleAuthSuccess = useCallback((data: AuthData) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        const response = await api.post<ApiResponse<AuthData>>('/auth/login', {
          email,
          password,
        });
        handleAuthSuccess(response.data.data);
        toast.success('Welcome back!');
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Failed to log in. Please try again.';
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        setIsLoading(true);
        const response = await api.post<ApiResponse<AuthData>>('/auth/signup', {
          name,
          email,
          password,
        });
        handleAuthSuccess(response.data.data);
        toast.success('Account created! Welcome.');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          'Failed to create account. Please try again.';
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, token, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

