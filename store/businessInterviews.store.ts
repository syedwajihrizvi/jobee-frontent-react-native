import { getInterviewsForJobAndFilter } from "@/lib/userEndpoints";
import { InterviewDetails, InterviewFilters } from "@/type";
import { create } from "zustand";

const createFilterKey = (filters: InterviewFilters) => {
    const parts = [
        filters.jobId?.toString() || '',
        filters.search || '',
        filters.status || '',
        filters.decisionResult || '',
    ]
    return parts.join('-');
}

interface InterviewsState  {
    interviewsByJobIdAndFilter: Record<string, InterviewDetails[]>;
    loadingInterviewStates: Record<string, boolean>;
    totalCounts: Record<string, number>;
    pagination: Record<string, { currentPage: number, hasMore: boolean}>;
    lastFetchedInterviews: Record<string, number>;

    fetchInterviewsForJobAndFilter: (filter: InterviewFilters, page?: number) => Promise<void>;

    getInterviewsForJobAndFilter(filter: InterviewFilters): InterviewDetails[];
    getTotalCountForJobAndFilter(filter: InterviewFilters): number;
    getPaginationForJobAndFilter(filter: InterviewFilters): { currentPage: number, hasMore: boolean } | undefined;
    isLoadingInterviewsForJobAndFilter(filter: InterviewFilters): boolean;

    hasValidCachedInterviews: (filter: InterviewFilters) => boolean;
    // setInterviewStatus: (jobId: number,interviewId: number, status: string) => void;
    refreshInterviewsForJobAndFilter: (filter: InterviewFilters) => Promise<void>;
}

const useBusinessInterviewsStore = create<InterviewsState>((set, get) => ({
    interviewsByJobIdAndFilter: {},
    loadingInterviewStates: {},
    totalCounts: {},
    lastFetchedInterviews: {},
    pagination: {},
    fetchInterviewsForJobAndFilter: async (filter, page = 0) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        if (state.loadingInterviewStates[filterKey]) return;
        set((state) => ({
            loadingInterviewStates: {
                ...state.loadingInterviewStates,
                [filterKey]: true,
            }
        }))
        try {
            const pageSize = 5;
            const response = await getInterviewsForJobAndFilter(page, pageSize, filter);
            const { content: newInterviews, totalElements, hasMore } = response;
            const existingInterviews = state.interviewsByJobIdAndFilter[filterKey] || [];
            const updatedInterviews = [...existingInterviews, ...newInterviews];
            set((state) => ({
                interviewsByJobIdAndFilter: {
                    ...state.interviewsByJobIdAndFilter,
                    [filterKey]: updatedInterviews,
                },
                totalCounts: {
                    ...state.totalCounts,
                    [filterKey]: totalElements,
                },
                pagination: {
                    ...state.pagination,
                    [filterKey]: {
                        currentPage: page,
                        hasMore,
                    }
                },
                lastFetchedInterviews: {
                    ...state.lastFetchedInterviews,
                    [filterKey]: Date.now(),
                }
            }))
        } catch (error) {
            console.error("Error fetching interviews for job and filter:", error);
        } finally {
            set((state) => ({
                loadingInterviewStates: {
                    ...state.loadingInterviewStates,
                    [filterKey]: false,
                }
            }))
        }
    } ,
    getInterviewsForJobAndFilter: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        return state.interviewsByJobIdAndFilter[filterKey];
    },
    getTotalCountForJobAndFilter: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        return state.totalCounts[filterKey] || 0;
    },
    getPaginationForJobAndFilter: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        return state.pagination[filterKey];
    },
    isLoadingInterviewsForJobAndFilter: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        return state.loadingInterviewStates[filterKey] || false;
    },
    hasValidCachedInterviews: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        const lastFetched = state.lastFetchedInterviews[filterKey];
        if (!lastFetched) return false;
        const now = Date.now();
        const fiveMinutes = 20 * 60 * 1000;
        return (now - lastFetched) < fiveMinutes;
    },
    refreshInterviewsForJobAndFilter: async (filter) => {
        const filterKey = createFilterKey(filter);
        const newState = get();
        delete newState.interviewsByJobIdAndFilter[filterKey];
        delete newState.totalCounts[filterKey];
        delete newState.pagination[filterKey];
        delete newState.lastFetchedInterviews[filterKey];
        set(newState);
        await newState.fetchInterviewsForJobAndFilter(filter, 0);
    }
}))

export default useBusinessInterviewsStore;