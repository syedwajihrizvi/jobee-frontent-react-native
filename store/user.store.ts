import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";

type UserType = {
    type: 'user' | 'business',
    setType: (type: 'user' | 'business') => Promise<void>,
}

const useUserStore = create<UserType>((set) => ({
    type: 'user',
    setType: async (type: 'user' | 'business') => {
        await AsyncStorage.setItem('userType', type);
        set({ type });
    },
}))

export default useUserStore;