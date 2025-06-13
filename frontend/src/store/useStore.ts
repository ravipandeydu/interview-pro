import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, ChatResponse } from '../lib/zod-schemas';
import { tokenManager } from '../lib/api';

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// Theme state interface
interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Chat state interface
interface ChatState {
  messages: ChatResponse[];
  isTyping: boolean;
  addMessage: (message: ChatResponse) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

// Config state interface
interface ConfigState {
  enableChat: boolean;
  enableAuth: boolean;
  setConfig: (config: Partial<Pick<ConfigState, 'enableChat' | 'enableAuth'>>) => void;
}

// Combined store interface
interface AppStore extends AuthState, ThemeState, ChatState, ConfigState {}

// Create the store with persistence for theme and auth
export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        // Remove token from localStorage when logging out
        tokenManager.removeToken();
        set({ user: null, isAuthenticated: false });
      },

      // Theme state
      theme: 'system' as Theme,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
      },

      // Chat state (not persisted)
      messages: [],
      isTyping: false,
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setTyping: (isTyping) => set({ isTyping }),
      clearMessages: () => set({ messages: [] }),

      // Config state
      enableChat: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
      enableAuth: process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true',
      setConfig: (config) => set((state) => ({ ...state, ...config })),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist auth and theme, not chat messages
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        enableChat: state.enableChat,
        enableAuth: state.enableAuth,
      }),
    }
  )
);

// Selector hooks for better performance
export const useAuth = () => useStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  setUser: state.setUser,
  setLoading: state.setLoading,
  logout: state.logout,
}));

export const useTheme = () => useStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
}));

export const useChat = () => useStore((state) => ({
  messages: state.messages,
  isTyping: state.isTyping,
  addMessage: state.addMessage,
  setTyping: state.setTyping,
  clearMessages: state.clearMessages,
}));

export const useConfig = () => useStore((state) => ({
  enableChat: state.enableChat,
  enableAuth: state.enableAuth,
  setConfig: state.setConfig,
}));