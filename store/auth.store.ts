import { getCurrentUser } from '@/lib/auth';
import { AuthState } from '@/type';
import { create } from 'zustand';

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      if (!user) {
        set({ user: null, isAuthenticated: false });
        return;
      }
      set({ user, isAuthenticated: true });
    } catch (error) {
    } finally {
      set({ isLoading: false });
    }
  },
  removeUser: () => set({ user: null, isAuthenticated: false })
}))

export default useAuthStore;