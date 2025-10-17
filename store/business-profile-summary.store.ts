import { getBusinessUserProfileDashboardSummary } from "@/lib/auth";
import { BusinessProfileSummaryState } from "@/type";
import { create } from "zustand";

const useBusinessProfileSummaryStore = create<BusinessProfileSummaryState>((set) => ({
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
            const response = await getBusinessUserProfileDashboardSummary();
            if (!response) {
                set({ profileSummary: null });
                return;
            }
            set({ profileSummary: response });
        } catch (error) {
            console.error("Error fetching business profile summary:", error);
        } finally {
            set({ isLoading: false });
        }
    }
}))

export default useBusinessProfileSummaryStore;