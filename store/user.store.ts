import { getLastUserApplication, getUserApplications, getUserInterviews } from '@/lib/userEndpoints';
import { Application, InterviewDetails } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";

type UserType = {
    type: 'user' | 'business',
    isLoadingInterviews: boolean,
    isLoadingApplications: boolean,
    isLoadingLastApplication: boolean,
    interviews: InterviewDetails[],
    applications: Application[],
    lastApplication: Application | null,
    lastFetchedLastApplication: number | null,
    setType: (type: 'user' | 'business') => Promise<void>,
    fetchUserData: () => Promise<void>,
    fetchLastApplication: () => Promise<void>,
    refetchInterviews: () => Promise<void>,
    setInterviews: (interviews: InterviewDetails[]) => void,
    setApplications: (applications: Application[]) => void,
    setApplicationStatus: (applicationId: number, status: string) => void,
    setInterviewStatus: (interviewId: number, status: string) => void,
    setInterviewDecision: (interviewId: number, decision: string) => void,
    setLastApplication: (application: Application | null) => void,
    getLastApplication: () => Application | null,
    hasUserAppliedToJob: (jobId: number) => Application | undefined,
    hasValidLastApplication: () => boolean,

}

const useUserStore = create<UserType>((set, get) => ({
    type: 'user',
    isLoadingInterviews: false,
    isLoadingApplications: false,
    isLoadingLastApplication: false,
    interviews: [],
    applications: [],
    lastApplication: null,
    lastFetchedLastApplication: null,
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
    fetchLastApplication: async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) {
            set({ lastApplication: null });
            return;
        }
        set({ isLoadingLastApplication: true });
        try {
            const response = await getLastUserApplication();
            set({ lastApplication: response || null }); 
        } catch (error) {
             console.error("Error fetching last user application:", error);
        } finally {
            set({ isLoadingLastApplication: false });
        }
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
    getLastApplication: () => {
        return get().lastApplication;
    },
    setInterviewDecision: (interviewId: number, decision: string) => set((state) => ({
        interviews: state.interviews.map(interview => 
            interview.id === interviewId ? { ...interview, decision } : interview
        )
    })),
    setLastApplication: (application: Application | null) => {
        set({ lastApplication: application, lastFetchedLastApplication: Date.now() });
    },
    hasUserAppliedToJob: (jobId: number) => {
        return get().applications.find(
            (app) => app.jobId === jobId
        );
    },
    hasValidLastApplication: () => {
        const { lastApplication, lastFetchedLastApplication } = get();
        if (!lastApplication || !lastFetchedLastApplication) return false;
        const THIRTY_MINUTES = 30 * 60 * 1000;
        return (Date.now() - lastFetchedLastApplication) < THIRTY_MINUTES;
    }
}))

export default useUserStore;