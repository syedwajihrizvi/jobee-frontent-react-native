import { getUserApplications, getUserInterviews } from '@/lib/userEndpoints';
import { Application, InterviewDetails } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";

type UserType = {
    type: 'user' | 'business',
    isLoadingInterviews: boolean,
    isLoadingApplications: boolean,
    interviews: InterviewDetails[],
    applications: Application[],
    setType: (type: 'user' | 'business') => Promise<void>,
    fetchUserData: () => Promise<void>,
    refetchInterviews: () => Promise<void>,
    setInterviews: (interviews: InterviewDetails[]) => void,
    setApplications: (applications: Application[]) => void,
    setApplicationStatus: (applicationId: number, status: string) => void,
    setInterviewStatus: (interviewId: number, status: string) => void,
    setInterviewDecision: (interviewId: number, decision: string) => void,

}

const useUserStore = create<UserType>((set) => ({
    type: 'user',
    isLoadingInterviews: false,
    isLoadingApplications: false,
    interviews: [],
    applications: [],
    setType: async (type: 'user' | 'business') => {
        await AsyncStorage.setItem('userType', type);
        set({ type });
    },
    fetchUserData: async () => {
        set({ isLoadingInterviews: true, isLoadingApplications: true });
        const [interviewsResult, applicationsResult] = await Promise.allSettled([
            getUserInterviews(),
            getUserApplications()
        ]);
        if (interviewsResult.status === 'fulfilled') {
            set({ interviews: interviewsResult.value });
        } else {
            console.log(interviewsResult)
            console.error("Error fetching user interviews:", interviewsResult.reason);
        }
        
        if (applicationsResult.status === 'fulfilled') {
            set({ applications: applicationsResult.value });
        } else {
            console.error("Error fetching user applications:", applicationsResult.reason);
        }
        set({ isLoadingInterviews: false, isLoadingApplications: false });
    },
    refetchInterviews: async () => {
        set({ isLoadingInterviews: true });
        try {
            const interviews = await getUserInterviews();
            set({ interviews });
        } catch (error) {
            console.error("Error refetching user interviews:", error);
        } finally {
            set({ isLoadingInterviews: false });
        }
    },
    setInterviews: (interviews: InterviewDetails[]) => set({ interviews }),
    setInterviewStatus: (interviewId: number, status: string) => set((state) => ({
        interviews: state.interviews.map(interview => 
            interview.id === interviewId ? { ...interview, status} : interview
        )
    })),
    setApplications: (applications: Application[]) => set({ applications }),
    setApplicationStatus: (applicationId: number, status: string) => set((state) => ({
        applications: state.applications.map(app => 
            app.id === applicationId ? { ...app, status } : app
        )
    })),
    setInterviewDecision: (interviewId: number, decision: string) => set((state) => ({
        interviews: state.interviews.map(interview => 
            interview.id === interviewId ? { ...interview, decision } : interview
        )
    }))
}))

export default useUserStore;