import { getBusinessUserInterviews } from "@/lib/userEndpoints";
import { InterviewDetails } from "@/type";
import { create } from "zustand";

type BusinessUserType = {
    isLoadingInterviews: boolean,
    interviews: InterviewDetails[],
    fetchBusinessUserData: () => Promise<void>,
    refetchInterviews: () => Promise<void>,
    setInterviews: (interviews: InterviewDetails[]) => void,
    setInterviewStatus: (interviewId: number, status: string) => void,
    getInterviewsByJobId: (jobId: number) => InterviewDetails[],
    reset: () => void,
}

const useBusinessUserStore = create<BusinessUserType>((set, get) => ({
    isLoadingInterviews: false,
    interviews: [],
    fetchBusinessUserData: async () => {
        set({ isLoadingInterviews: true });
        try {
            const interviews = await getBusinessUserInterviews();
            set({ interviews });
        } catch (error) {
            console.error("Error fetching business user interviews:", error);
        } finally {
            set({ isLoadingInterviews: false });
        }
    },
    refetchInterviews: async () => {
        set({ isLoadingInterviews: true });
        try {
            const interviews = await getBusinessUserInterviews();
            set({ interviews });
        } catch (error) {
            console.error("Error refetching business user interviews:", error);
        } finally {
            set({ isLoadingInterviews: false });
        }
    },
    setInterviews: (interviews: InterviewDetails[]) => set({ interviews }),
    setInterviewStatus: (interviewId: number, status: string) => set((state) => ({
        interviews: state.interviews.map(interview => 
            interview.id === interviewId ? { ...interview, status } : interview
        )
    })),
    getInterviewsByJobId: (jobId: number) => {
        return get().interviews.filter(interview => interview.jobId === jobId);
    },
    reset: () => set({
        isLoadingInterviews: false,
        interviews: [],
    }),
}))

export default useBusinessUserStore;