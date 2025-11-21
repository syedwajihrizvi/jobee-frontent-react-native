import { getJobsForBusinessAndFilter } from "@/lib/userEndpoints";
import { Job, JobFilters } from "@/type";
import { create } from "zustand";

const createFilterKey = (filters: JobFilters) => {
    const parts = [
        filters.search || '',
        (filters.locations || []).join(','),
        (filters.tags || []).join(','),
        (filters.companies || []).join(','),
        (filters.distance || ''),
        filters.minSalary !== undefined ? filters.minSalary.toString() : '',
        filters.maxSalary !== undefined ? filters.maxSalary.toString() : '',
        (filters.employmentTypes || []).join(','),
        (filters.workArrangements || []).join(','),
        (filters.experience || []).join(','),
    ]
    return parts.join('-');
}

interface BusinessJobState {
    businessJobsByIdAndFilter: Record<string, Job[]>;
    pendingApplicationsByJobId: Record<string, number>;
    interviewsByJobId: Record<string, number>;
    loadingJobStates: Record<string, boolean>;
    totalCounts: Record<string, number>;
    pagination: Record<string, { currentPage: number, hasMore: boolean}>;
    lastFetchedJobs: Record<string, number>;

    fetchJobsForBusinessAndFilter: (filter: JobFilters, page?: number) => Promise<void>;

    getInterviewsForJobAndFilter(filter: JobFilters): Job[];
    getTotalCountForJobAndFilter(filter: JobFilters): number;
    getPendingApplicationsForJob(jobId: number): number;
    getInterviewsForJob(jobId: number): number;
    getPaginationForJobAndFilter(filter: JobFilters): { currentPage: number, hasMore: boolean } | undefined;
    isLoadingJobsForBusinessAndFilter(filter: JobFilters): boolean;

    hasValidCachedJobs: (filter: JobFilters) => boolean;
    refreshJobsForBusinessAndFilter: (filter: JobFilters) => Promise<void>;
    refreshEverything: () => Promise<void>;
}

const useBusinessJobsStore = create<BusinessJobState>((set, get) => ({
    businessJobsByIdAndFilter: {},
    loadingJobStates: {},
    totalCounts: {},
    lastFetchedJobs: {},
    pagination: {},
    pendingApplicationsByJobId: {},
    interviewsByJobId: {},

    fetchJobsForBusinessAndFilter: async (filter, page = 0) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        if (state.loadingJobStates[filterKey]) return;
        set((state) => ({
            loadingJobStates: {
                ...state.loadingJobStates,
                [filterKey]: true,
            }
        }))
        try {
            const pageSize = 3;
            const response = await getJobsForBusinessAndFilter(page, pageSize, filter);
            const { content: newJobs, totalElements, hasMore } = response;
            const existingJobs = state.businessJobsByIdAndFilter[filterKey] || [];
            const updatedJobs = [...existingJobs, ...newJobs];
            newJobs.forEach((job) => {
                set((state) => ({
                    pendingApplicationsByJobId: {
                        ...state.pendingApplicationsByJobId,
                        [job.id]: job.pendingApplicationsSize || 0,
                    },
                    interviewsByJobId: {
                        ...state.interviewsByJobId,
                        [job.id]: job.totalInterviews || 0,
                    }
                }))
            })
            set((state) => ({
                businessJobsByIdAndFilter: {
                    ...state.businessJobsByIdAndFilter,
                    [filterKey]: updatedJobs,
                },
                totalCounts: {
                    ...state.totalCounts,
                    [filterKey]: totalElements,
                },
                pagination: {
                    ...state.pagination,
                    [filterKey]: {
                        currentPage: page,
                        hasMore: hasMore,
                    },
                },
                loadingJobStates: {
                    ...state.loadingJobStates,
                    [filterKey]: false,
                },
                lastFetchedJobs: {
                    ...state.lastFetchedJobs,
                    [filterKey]: Date.now(),
                }
            }))
        } catch (error) {
            console.log("Error fetching jobs for business and filter:", error);
        } finally {
            set((state) => ({
                loadingJobStates: {
                    ...state.loadingJobStates,
                    [filterKey]: false,
                }
            }))
        }
    },
    getInterviewsForJobAndFilter: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        return state.businessJobsByIdAndFilter[filterKey];
    },
    getTotalCountForJobAndFilter: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        return state.totalCounts[filterKey] || 0;
    },
    getPendingApplicationsForJob: (jobId) => {
        const state = get();
        return state.pendingApplicationsByJobId[jobId] || 0;
    },
    getPaginationForJobAndFilter: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        return state.pagination[filterKey];
    },
    getInterviewsForJob: (jobId) => {
        const state = get();
        return state.interviewsByJobId[jobId] || 0;
    },
    isLoadingJobsForBusinessAndFilter: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        return state.loadingJobStates[filterKey] || false;
    },
    hasValidCachedJobs: (filter) => {
        const filterKey = createFilterKey(filter);
        const state = get();
        const lastFetched = state.lastFetchedJobs[filterKey];
        if (!lastFetched) return false;
        const now = Date.now();
        const FIVE_MINUTES = 5 * 60 * 1000;
        return (now - lastFetched) < FIVE_MINUTES;
    },
    refreshJobsForBusinessAndFilter: async (filter) => {
        const filterKey = createFilterKey(filter);
        const newState = get();
        delete newState.businessJobsByIdAndFilter[filterKey];
        delete newState.totalCounts[filterKey];
        delete newState.pagination[filterKey];
        delete newState.lastFetchedJobs[filterKey];
        set(() => ({
            businessJobsByIdAndFilter: newState.businessJobsByIdAndFilter,
            totalCounts: newState.totalCounts,
            pagination: newState.pagination,
            lastFetchedJobs: newState.lastFetchedJobs,
        }));
        await newState.fetchJobsForBusinessAndFilter(filter, 0);
    },
    refreshEverything: async () => {
        const newState = get();
        set(() => ({
            businessJobsByIdAndFilter: {},
            totalCounts: {},
            pagination: {},
            lastFetchedJobs: {},
        }));
        await newState.fetchJobsForBusinessAndFilter({} as JobFilters, 0);
    }
}))

export default useBusinessJobsStore;