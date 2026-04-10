import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken }),

  setUser: (user) =>
    set({ user }),

  logout: () =>
    set({ accessToken: null, refreshToken: null, user: null }),
}));
