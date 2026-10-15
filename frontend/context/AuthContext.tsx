import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { api, User, UserStats } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  token: string | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  refreshStats: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const refreshStats = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setStats(data.stats);
    } catch {
      // Ignored if offline or unauthorized
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
          } catch {
            const cachedUserJson = await AsyncStorage.getItem('@mathsentry_user');
            if (cachedUserJson) {
              setUser(JSON.parse(cachedUserJson));
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      setUser(res.user);
      setIsGuest(false);
      await refreshStats();
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    await login('olimpic@mathsentry.ro', 'olimpiada2026');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser({
      id: 'guest_user',
      email: 'oaspete@mathsentry.ro',
      username: 'Oaspete Olimpic',
      rank: 'Olympiad Explorer',
      streak: 1,
    });
    setStats({
      totalProofs: 12,
      soundPercentage: 75,
      streak: 1,
      rank: 'Olympiad Explorer',
    });
  };

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email, password, username);
      setToken(res.token);
      setUser(res.user);
      setIsGuest(false);
      await refreshStats();
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
    setStats(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        isLoading,
        isGuest,
        login,
        register,
        loginDemo,
        continueAsGuest,
        logout,
        refreshStats,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
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
