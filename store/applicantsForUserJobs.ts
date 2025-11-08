import { ApplicationsForBusinessUserState } from "@/type";
import { create } from "zustand";

const useApplicantsForUserJobs = create<ApplicationsForBusinessUserState>((set, get) => ({
    applications: [],
    isLoading: false,
    setApplications: (applications) => set({ applications }),
    setIsLoading: (isLoading) => set({ isLoading }),
    getApplicantsInLastNDays : (days: number) => {
        const state = get();
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        return state.applications.filter(app => new Date(app.appliedAt) >= daysAgo).length;

    }
}))

export default useApplicantsForUserJobs;