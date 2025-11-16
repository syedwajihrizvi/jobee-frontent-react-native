import { getCurrentUser } from '@/lib/auth';
import { AuthState, User } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isReady: false,
  userType: 'user',
  setUser: (user) => set({ user }),
  setUserType: (type) => set({ userType: type }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setAuthReady: () => set({ isReady: true }),
  resetCanBatchQuickApply: () => {
    const state = get();
    const newTime = Date.now() + 6 * 60 * 60 * 1000;
    const updatedUser = {...(state.user as User), canQuickApplyBatch: false, nextQuickApplyBatchTime: newTime.toString()} as User
    set({ user: updatedUser });
  },
  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      if (!user) {
        set({ user: null, isAuthenticated: false });
        return;
      }
      const type = await AsyncStorage.getItem('userType');
      const userType = !type || type === 'user' ? 'user' : 'business';
      set({ user, isAuthenticated: true, userType, isReady: true });
    } catch (error) {
    } finally {
      set({ isLoading: false });
    }
  },
  removeUser: () => set({ user: null, isAuthenticated: false }),
}))

export default useAuthStore;