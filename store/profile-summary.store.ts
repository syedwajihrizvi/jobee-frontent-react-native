import { getUserProfileDashboardSummary } from "@/lib/auth";
import { ProfileSummaryState } from "@/type";
import { create } from "zustand";

const useProfileSummaryStore = create<ProfileSummaryState>((set) => ({
    profileSummary: null,
    isLoading: false,
    setProfileSummary(summary) {
        set({ profileSummary: summary });
    },
    setIsLoading(isLoading) {
        set({ isLoading });
    },
    fetchProfileSummary: async () => {
        try {
            const response = await getUserProfileDashboardSummary();
            if (!response) {
                set({ profileSummary: null });
                return;
            }
            set({ profileSummary: response });
        } catch (error) {
            console.error("Error fetching profile summary:", error);
        } finally {
            set({ isLoading: false });
        }
    }
}));

export default useProfileSummaryStore