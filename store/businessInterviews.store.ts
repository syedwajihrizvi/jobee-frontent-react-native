import { getInterviewsForJobAndFilter } from "@/lib/userEndpoints";
import { InterviewDetails, InterviewFilter, InterviewFilters } from "@/type";
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
    interviewIdToStatus: Record<number, string>;
    interviewsByJobIdAndFilter: Record<string, InterviewDetails[]>;
    loadingInterviewStates: Record<string, boolean>;
    totalCounts: Record<string, number>;
    pagination: Record<string, { currentPage: number, hasMore: boolean}>;
    lastFetchedInterviews: Record<string, number>;

    fetchInterviewsForJobAndFilter: (filter: InterviewFilters, page?: number) => Promise<void>;

    getInterviewsForJobAndFilter(filter: InterviewFilters): InterviewDetails[];
    getTotalCountForJobAndFilter(filter: InterviewFilters): number;
    getPaginationForJobAndFilter(filter: InterviewFilters): { currentPage: number, hasMore: boolean } | undefined;
    getInterviewStatus: (interviewId: number) => string | undefined;
    setInterviewStatus: (interview: InterviewDetails, status: string) => void;
    isLoadingInterviewsForJobAndFilter(filter: InterviewFilters): boolean;

    hasValidCachedInterviews: (filter: InterviewFilters) => boolean;
    refreshInterviewsForJobAndFilter: (filter: InterviewFilters) => Promise<void>;
    removeAllInterviewsForJob: (jobId: number) => void;
    removeFromUpcomingInterviews: (interviewId: number) => void;
    refreshUpcomingInterviews: () => Promise<void>;
    refreshUpcomingInterviewsForJob: (jobId: number) => Promise<void>;
    refreshEverything: () => Promise<void>;
}

const useBusinessInterviewsStore = create<InterviewsState>((set, get) => ({
    interviewIdToStatus: {},
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
            const updatedInterviews = [...existingInterviews];
            newInterviews.forEach((newInterview) => {
                const index = updatedInterviews.findIndex(interview => interview.id === newInterview.id);
                if (index !== -1) {
                    updatedInterviews[index] = newInterview;
                } else {
                    updatedInterviews.push(newInterview);
                }
            });
            const updatedInterviewIdToStatus = { ...state.interviewIdToStatus };
            newInterviews.forEach(interview => {
                updatedInterviewIdToStatus[interview.id] = interview.status;
            });
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
                },
                interviewIdToStatus: updatedInterviewIdToStatus,
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
    },
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
    getInterviewStatus: (interviewId) => {
        const state = get();
        return state.interviewIdToStatus[interviewId];
    },
    setInterviewStatus: (interview, status) => {
        const interviewId = interview.id;
        const oldStatus = interview.status;
        const jobId = interview.jobId;
        const oldStatusFilter = { jobId: jobId, status: oldStatus as InterviewFilter };
        const newStatusFilter = { jobId: jobId, status: status as InterviewFilter };
        const oldFilterKey = createFilterKey(oldStatusFilter);
        const newFilterKey = createFilterKey(newStatusFilter);
        set((state) => ({
            interviewIdToStatus: {
                ...state.interviewIdToStatus,
                [interviewId]: status,
            },
            interviewsByJobIdAndFilter: {
                ...state.interviewsByJobIdAndFilter,
                [oldFilterKey]: (state.interviewsByJobIdAndFilter[oldFilterKey] || []).filter(i => i.id !== interviewId),
                [newFilterKey]: [ ...(state.interviewsByJobIdAndFilter[newFilterKey] || []), { ...interview, status } ],
            }
        }));

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
        const fiveMinutes = 2 * 60 * 1000;
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
    },
    removeAllInterviewsForJob: (jobId) => {
        const state = get();
        const newInterviewsByJobIdAndFilter: Record<string, InterviewDetails[]> = {};
        const newTotalCounts: Record<string, number> = {};
        const newPagination: Record<string, { currentPage: number, hasMore: boolean}> = {};
        const newLastFetchedInterviews: Record<string, number> = {};

        Object.keys(state.interviewsByJobIdAndFilter).forEach((filterKey) => {
            const filters = filterKey.split('-');
            const filterJobId = Number(filters[0]);
            if (filterJobId !== jobId) {
                newInterviewsByJobIdAndFilter[filterKey] = state.interviewsByJobIdAndFilter[filterKey];
                newTotalCounts[filterKey] = state.totalCounts[filterKey];
                newPagination[filterKey] = state.pagination[filterKey];
                newLastFetchedInterviews[filterKey] = state.lastFetchedInterviews[filterKey];
            }
        });
        set({
            interviewsByJobIdAndFilter: newInterviewsByJobIdAndFilter,
            totalCounts: newTotalCounts,
            pagination: newPagination,
            lastFetchedInterviews: newLastFetchedInterviews,
        });
    },
    removeFromUpcomingInterviews: (interviewId: number) => {
        Object.keys(get().interviewsByJobIdAndFilter).forEach((filterKey) => {
            console.log("Existing filterKey:", filterKey);
        });
        const targetFilter = { status: "SCHEDULED" as InterviewFilter } as InterviewFilters;
        const filterKey = createFilterKey(targetFilter);
        const state = get();
        const existingInterviews = state.interviewsByJobIdAndFilter[filterKey] || [];
        const updatedInterviews = existingInterviews.filter(interview => interview.id !== interviewId);
        set((state) => ({
            interviewsByJobIdAndFilter: {
                ...state.interviewsByJobIdAndFilter,
                [filterKey]: updatedInterviews,
            }
        }))
    },
    refreshUpcomingInterviews: async () => {
        const targetFilter = { status: "SCHEDULED" as InterviewFilter } as InterviewFilters;
        await get().refreshInterviewsForJobAndFilter(targetFilter);
    },
    refreshUpcomingInterviewsForJob: async (jobId: number) => {
        const targetFilter = { jobId: jobId, status: "SCHEDULED" as InterviewFilter } as InterviewFilters;
        await get().refreshInterviewsForJobAndFilter(targetFilter);
    },
    refreshEverything: async () => {
        const newState = get();
        set(() => ({
            interviewIdToStatus: {},
            interviewsByJobIdAndFilter: {},
            loadingInterviewStates: {},
            totalCounts: {},
            lastFetchedInterviews: {},
            pagination: {},
        }))
        await newState.fetchInterviewsForJobAndFilter({});
        await newState.fetchInterviewsForJobAndFilter({ status: "SCHEDULED" as InterviewFilter });
    }
}))

export default useBusinessInterviewsStore;