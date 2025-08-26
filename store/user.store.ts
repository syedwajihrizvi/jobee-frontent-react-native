import { create } from "zustand";

type UserType = {
    type: 'user' | 'business',
    setType: (type: 'user' | 'business') => void,
}

const useUserStore = create<UserType>((set) => ({
    type: 'user',
    setType: (type: 'user' | 'business') => set({ type }),
}))

export default useUserStore;