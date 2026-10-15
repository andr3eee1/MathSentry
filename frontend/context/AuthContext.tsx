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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
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
          const data = await api.getMe();
          setUser(data.user);
          setStats(data.stats);
        } else {
          // Check cached user
          const cachedUserJson = await AsyncStorage.getItem('@mathsentry_user');
          if (cachedUserJson) {
            setUser(JSON.parse(cachedUserJson));
          }
        }
      } catch {
        // Fallback demo user
        setUser({
          id: 'user_demo_01',
          email: 'olimpic@mathsentry.ro',
          username: 'Andrei Popescu',
          rank: 'Olympiad Candidate',
          streak: 7,
        });
        setStats({
          totalProofs: 24,
          soundPercentage: 81,
          streak: 7,
          rank: 'Olympiad Candidate',
        });
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
      await refreshStats();
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email, password, username);
      setToken(res.token);
      setUser(res.user);
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        isLoading,
        login,
        register,
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
