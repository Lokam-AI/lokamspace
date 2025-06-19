import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

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

const cookieStorage = {
  getItem: (name: string) => {
    const cookie = getCookie(name);
    if (typeof cookie === 'string') {
      return cookie;
    }
    return null;
  },
  setItem: (name: string, value: string) => {
    setCookie(name, value, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  },
  removeItem: (name: string) => {
    deleteCookie(name);
  },
};

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
      storage: createJSONStorage(() => cookieStorage),
    }
  )
); 