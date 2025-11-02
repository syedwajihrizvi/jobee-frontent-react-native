import { ApplicationSummary } from "@/type";
import { create } from "zustand";

type ApplicationForJobState = {
    applications: ApplicationSummary[];
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    setApplications: (applications: ApplicationSummary[]) => void
    setApplicationStatus: (applicationId: number, status: string) => void;
};
const useApplicantsForJobStore = create<ApplicationForJobState>((set) => ({
    applications: [],
    isLoading: false,
    setApplications: (applications) => set({ applications }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setApplicationStatus: (applicationId, status) =>
        set((state) => ({
            applications: state.applications.map((app) =>
                app.id === applicationId ? { ...app, status } : app
            ),
        })),
}));

export default useApplicantsForJobStore;