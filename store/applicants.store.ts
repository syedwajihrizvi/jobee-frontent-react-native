import { ApplicationForJobState } from "@/type";
import { create } from "zustand";

const useApplicantsForJobStore = create<ApplicationForJobState>((set) => ({
    applications: [],
    isLoading: false,
    setApplications: (applications) => set({ applications }),
    setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useApplicantsForJobStore;