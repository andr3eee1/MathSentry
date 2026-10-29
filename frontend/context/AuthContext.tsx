import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { api, User, UserStats } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '@/components/ToastHelper';

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  token: string | null;
  /** True only while restoring the stored session at startup. */
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearSession = useCallback(() => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    setStats(null);
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      clearSession();
      showToast('Sesiunea a expirat. Autentifică-te din nou.', 'error');
    });
    return () => api.setUnauthorizedHandler(null);
  }, [clearSession]);

  const refreshStats = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setStats(data.stats);
    } catch {
      // Offline: keep showing the last known values
    }
  }, []);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await api.init();
        if (storedToken) {
          setToken(storedToken);
          try {
            const data = await api.getMe();
            setUser(data.user);
            setStats(data.stats);
          } catch (err: any) {
            // Offline at startup: fall back to the cached profile. A 401 has
            // already cleared the session through the unauthorized handler.
            if (err?.status !== 401) {
              const cachedUserJson = await AsyncStorage.getItem('@mathsentry_user');
              if (cachedUserJson) {
                setUser(JSON.parse(cachedUserJson));
              }
            }
          }
        }
      } catch {
        // Leave unauthenticated so user starts on Login screen
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  const applySession = async (res: { token: string; user: User }) => {
    setToken(res.token);
    setUser(res.user);
    await refreshStats();
  };

  const login = async (email: string, password: string) => {
    await applySession(await api.login(email, password));
  };

  const loginDemo = async () => {
    await login('olimpic@mathsentry.ro', 'olimpiada2026');
  };

  const continueAsGuest = async () => {
    await applySession(await api.createGuest());
  };

  const register = async (email: string, password: string, username: string) => {
    // When a guest is signed in, the server upgrades that account in place.
    await applySession(await api.register(email, password, username));
  };

  const logout = async () => {
    await api.logout();
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        isLoading,
        isGuest: Boolean(user?.isGuest),
        login,
        register,
        loginDemo,
        continueAsGuest,
        logout,
        refreshStats,
      }}
    >
      {children}
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
