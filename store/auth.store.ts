import { getCurrentUser } from '@/lib/auth';
import { AuthState } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userType: 'user',
  setUser: (user) => set({ user }),
  setUserType: (type) => set({ userType: type }),
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
      const type = await AsyncStorage.getItem('userType');
      console.log("Fetched user type from storage:", type);
      const userType = !type || type === 'user' ? 'user' : 'business';
      set({ user, isAuthenticated: true, userType });
    } catch (error) {
    } finally {
      set({ isLoading: false });
    }
  },
  removeUser: () => set({ user: null, isAuthenticated: false }),
}))

export default useAuthStore;