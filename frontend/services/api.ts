import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_TOKEN_KEY = '@mathsentry_token';
const STORAGE_USER_KEY = '@mathsentry_user';

// Localhost for Web & iOS, 10.0.2.2 for Android emulator
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api'
    : 'http://localhost:4000/api';

export interface User {
  id: string;
  email: string;
  username: string;
  rank: string;
  streak: number;
}

export interface UserStats {
  totalProofs: number;
  soundPercentage: number;
  streak: number;
  rank: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
  status: 'ok' | 'flaw';
  scorePercentage: number;
  onmScore: number;
}

class ApiService {
  private token: string | null = null;

  async init(): Promise<string | null> {
    try {
      this.token = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
      return this.token;
    } catch {
      return null;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      AsyncStorage.setItem(STORAGE_TOKEN_KEY, token).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_TOKEN_KEY).catch(() => {});
      AsyncStorage.removeItem(STORAGE_USER_KEY).catch(() => {});
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      return data;
    } catch (err: any) {
      // If Android emulator fails on 10.0.2.2, retry on localhost
      if (Platform.OS === 'android' && err?.message?.includes('Network request failed')) {
        const fallbackUrl = `http://localhost:4000/api${endpoint}`;
        const response = await fetch(fallbackUrl, { ...options, headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        return data;
      }
      throw err;
    }
  }

  // --- Auth APIs ---
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.user));
    return res;
  }

  async register(email: string, password: string, username: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
    this.setToken(res.token);
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.user));
    return res;
  }

  async getMe(): Promise<{ user: User; stats: UserStats }> {
    return this.request<{ user: User; stats: UserStats }>('/auth/me');
  }

  async logout(): Promise<void> {
    this.setToken(null);
  }

  // --- Proof & Olympiad Engine APIs ---
  async getHistory(): Promise<HistoryItem[]> {
    return this.request<HistoryItem[]>('/proof/history');
  }

  async getProofById(id: string): Promise<any> {
    return this.request<any>(`/proof/${id}`);
  }

  async analyzeProof(params: { fixedCondition?: boolean } = {}): Promise<any> {
    return this.request<any>('/proof/analyze', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async reAnalyzeProof(params: { fixedCondition: boolean }): Promise<any> {
    return this.request<any>('/proof/re-analyze', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async scanProof(imageUri?: string): Promise<any> {
    return this.request<any>('/proof/scan', {
      method: 'POST',
      body: JSON.stringify({ imageUri }),
    });
  }
}

export const api = new ApiService();
