import { ApplicationsForBusinessUserState } from "@/type";
import { create } from "zustand";

const useApplicantsForUserJobs = create<ApplicationsForBusinessUserState>((set) => ({
    applications: [],
    isLoading: false,
    setApplications: (applications) => set({ applications }),
    setIsLoading: (isLoading) => set({ isLoading }),
}))

export default useApplicantsForUserJobs;