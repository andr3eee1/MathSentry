import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { OlympiadAnalysisResult, UserProblem } from '@/types/olympiad';

const STORAGE_TOKEN_KEY = '@mathsentry_token';
const STORAGE_USER_KEY = '@mathsentry_user';

// Prefer explicit environment variable (e.g. for physical phone or tunnel), then fallback based on platform
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api'
    : 'http://localhost:4000/api');

export interface User {
  id: string;
  email: string;
  username: string;
  rank: string;
  streak: number;
  isGuest?: boolean;
}

export interface UserStats {
  totalProofs: number;
  soundPercentage: number;
  averageOnm: number | null;
  streak: number;
  rank: string;
  auditsLeftToday: number;
  dailyLimit: number;
}

/** Error carrying the HTTP status so callers can react (e.g. quota vs. outage). */
export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const REQUEST_TIMEOUT_MS = 90000; // AI grading of a photographed proof can take a while

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
  private onUnauthorized: (() => void) | null = null;

  /** Called when the server rejects the stored session (expired or deleted account). */
  setUnauthorizedHandler(handler: (() => void) | null) {
    this.onUnauthorized = handler;
  }

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

    const send = async (baseUrl: string): Promise<T> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(`${baseUrl}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw new ApiError('Serverul nu a răspuns la timp. Încearcă din nou.', 0, 'TIMEOUT');
        }
        throw err;
      } finally {
        clearTimeout(timeout);
      }

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401 && this.token && !endpoint.startsWith('/auth/login')) {
          this.onUnauthorized?.();
        }
        throw new ApiError(
          data?.error || `Eroare de server (${response.status}).`,
          response.status,
          data?.code
        );
      }
      return data as T;
    };

    try {
      return await send(API_BASE_URL);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      // Android emulator: 10.0.2.2 can fail when using `adb reverse`; retry on localhost
      if (Platform.OS === 'android' && !process.env.EXPO_PUBLIC_API_URL) {
        try {
          return await send('http://localhost:4000/api');
        } catch (retryErr: any) {
          if (retryErr instanceof ApiError) throw retryErr;
        }
      }
      throw new ApiError('Nu există conexiune cu serverul MathSentry. Verifică internetul.', 0, 'NETWORK');
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

  async createGuest(): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/guest', { method: 'POST' });
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

  async getProofById(id: string): Promise<OlympiadAnalysisResult> {
    return this.request<OlympiadAnalysisResult>(`/proof/${encodeURIComponent(id)}`);
  }

  async analyzeProof(params: {
    id?: string;
    fixedCondition?: boolean;
    proofText?: string;
    problemTitle?: string;
    enunt?: string;
    imageBase64?: string;
    mimeType?: string;
  }): Promise<OlympiadAnalysisResult> {
    return this.request<OlympiadAnalysisResult>('/proof/analyze', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // --- Problem Bank & Per-Problem Solutions ---
  async getProblems(): Promise<UserProblem[]> {
    return this.request<UserProblem[]>('/problems');
  }

  async createProblem(params: {
    title?: string;
    domain?: string;
    enuntRo?: string;
    imageBase64?: string;
    mimeType?: string;
  }): Promise<UserProblem> {
    return this.request<UserProblem>('/problems', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getProblemById(id: string): Promise<any> {
    return this.request<any>(`/problems/${encodeURIComponent(id)}`);
  }

  async submitProblemSolution(
    problemId: string,
    params: {
      proofText?: string;
      imageBase64?: string;
      mimeType?: string;
    }
  ): Promise<OlympiadAnalysisResult> {
    return this.request<OlympiadAnalysisResult>(`/problems/${encodeURIComponent(problemId)}/solutions`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async deleteProblem(id: string): Promise<any> {
    return this.request<any>(`/problems/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
