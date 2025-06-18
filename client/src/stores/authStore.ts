import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  userId: number;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (data: { accessToken: string; user: User }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      login: (data) => set({
        accessToken: data.accessToken,
        user: data.user,
        isAuthenticated: true,
      }),
      logout: () => set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'autopulse-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 