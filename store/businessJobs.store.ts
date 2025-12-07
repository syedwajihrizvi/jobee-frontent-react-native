import { getJobsForBusinessAndFilter, getMostPopularJobs } from "@/lib/userEndpoints";
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
    loadingMostPopularJobs: boolean;
    totalCounts: Record<string, number>;
    mostAppliedJobs: Job[];
    mostViewedJobs: Job[];
    viewsPerJobId: Record<string, number>;
    applicationsPerJobId: Record<string, number>;
    pagination: Record<string, { currentPage: number, hasMore: boolean}>;
    lastFetchedJobs: Record<string, number>;
    lastFetchedMostPopularJobs: number;
    fetchJobsForBusinessAndFilter: (filter: JobFilters, page?: number) => Promise<void>;
    fetchMostPopularJobs: () => Promise<void>;
    getInterviewsForJobAndFilter(filter: JobFilters): Job[];
    getTotalCountForJobAndFilter(filter: JobFilters): number;
    getPendingApplicationsForJob(jobId: number): number;
    getInterviewsForJob(jobId: number): number;
    getPaginationForJobAndFilter(filter: JobFilters): { currentPage: number, hasMore: boolean } | undefined;
    getMostAppliedJobs: () => Job[];
    getMostViewedJobs: () => Job[];
    getViewsForJob(jobId: number): number;
    getApplicationsForJob(jobId: number): number;
    isLoadingJobsForBusinessAndFilter(filter: JobFilters): boolean;

    hasValidCachedJobs: (filter: JobFilters) => boolean;
    hasValidCachedMostPopularJobs: () => boolean;
    refreshJobsForBusinessAndFilter: (filter: JobFilters) => Promise<void>;
    refreshEverything: () => Promise<void>;

    setViewsForJob: (jobId: number, views: number) => void;
    setApplicationsForJob: (jobId: number, applications: number) => void;
    setPendingApplicationsForJob: (jobId: number, pendingApplications: number) => void;
    setInterviewsForJob: (jobId: number, interviews: number) => void;
    decrementPendingApplicationsForJob: (jobId: number) => void;
    incrementInterviewsForJob: (jobId: number) => void;
}

const useBusinessJobsStore = create<BusinessJobState>((set, get) => ({
    businessJobsByIdAndFilter: {},
    loadingJobStates: {},
    loadingMostPopularJobs: false,
    totalCounts: {},
    mostAppliedJobs: [],
    mostViewedJobs: [],
    viewsPerJobId: {},
    applicationsPerJobId: {},
    lastFetchedJobs: {},
    lastFetchedMostPopularJobs: 0,
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
                    },
                    viewsPerJobId: {
                        ...state.viewsPerJobId,
                        [job.id]: job.views || 0,
                    },
                    applicationsPerJobId: {
                        ...state.applicationsPerJobId,
                        [job.id]: job.applicants || 0,
                    },
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
    fetchMostPopularJobs: async () => {
        const state = get();
        if (state.loadingMostPopularJobs) return;
        set({ loadingMostPopularJobs: true });
        try {
            const response = await getMostPopularJobs();
            const { mostAppliedJobs, mostViewedJobs } = response;
            for (const job of [...mostAppliedJobs, ...mostViewedJobs]) {
                set((state) => ({
                    pendingApplicationsByJobId: {
                        ...state.pendingApplicationsByJobId,
                        [job.id]: job.pendingApplicationsSize || 0,
                    },
                    interviewsByJobId: {
                        ...state.interviewsByJobId,
                        [job.id]: job.interviews || 0,
                    },
                    viewsPerJobId: {
                        ...state.viewsPerJobId,
                        [job.id]: job.views || 0,
                    },
                    applicationsPerJobId: {
                        ...state.applicationsPerJobId,
                        [job.id]: job.applicants || 0,
                    },
                }))
            }
            set({
                mostAppliedJobs,
                mostViewedJobs,
                lastFetchedMostPopularJobs: Date.now(),
            });
        } catch (error) {
            
        } finally {
            set({ loadingMostPopularJobs: false });
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
    getMostAppliedJobs: () => {
        const state = get();
        return state.mostAppliedJobs;
    },
    getMostViewedJobs: () => {
        const state = get();
        return state.mostViewedJobs;
    },
    getViewsForJob: (jobId) => {
        const state = get();
        return state.viewsPerJobId[jobId] || 0;
    },
    getApplicationsForJob: (jobId) => {
        const state = get();
        return state.applicationsPerJobId[jobId] || 0;
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
        const TWO_MINUTES = 2 * 60 * 1000;
        return (now - lastFetched) < TWO_MINUTES;
    },
    hasValidCachedMostPopularJobs: () => {
        const state = get();
        const lastFetched = state.lastFetchedMostPopularJobs;
        if (!lastFetched) return false;
        const now = Date.now();
        const TWO_MINUTES = 2 * 60 * 1000;
        return (now - lastFetched) < TWO_MINUTES;
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
    },
    setViewsForJob: (jobId, views) => {
        set((state) => {
            const currentViews = state.viewsPerJobId[jobId];
            if (currentViews === undefined || views > currentViews) {
                return {
                    viewsPerJobId: {
                        ...state.viewsPerJobId,
                        [jobId]: views,
                    }
                };
            }
            return state;
        })
    },
    setApplicationsForJob: (jobId, applications) => {
        set((state) => {
            const currentApplications = state.applicationsPerJobId[jobId];
            if (currentApplications === undefined || applications > currentApplications) {
                return {
                    applicationsPerJobId: {
                        ...state.applicationsPerJobId,
                        [jobId]: applications,
                    }
                };
            }
            return state;
        })
    },
    setPendingApplicationsForJob: (jobId, pendingApplications) => {
        set((state) => {
            const currentPendingApplications = state.pendingApplicationsByJobId[jobId];
            if (currentPendingApplications === undefined || pendingApplications > currentPendingApplications) {
                return {
                    pendingApplicationsByJobId: {
                        ...state.pendingApplicationsByJobId,
                        [jobId]: pendingApplications,
                    }
                };
            }
            return state;
        })
    },
    setInterviewsForJob: (jobId, interviews) => {
        set((state) => {
            const currentInterviews = state.interviewsByJobId[jobId];
            if (currentInterviews === undefined || interviews > currentInterviews) {
                return {
                    interviewsByJobId: {
                        ...state.interviewsByJobId,
                        [jobId]: interviews,
                    }
                };
            }
            return state;
        })
    },
    decrementPendingApplicationsForJob: (jobId) => {
        set((state) => {
            const currentPendingApplications = state.pendingApplicationsByJobId[jobId] || 0;
            const newPendingApplications = Math.max(0, currentPendingApplications - 1);
            return {
                pendingApplicationsByJobId: {
                    ...state.pendingApplicationsByJobId,
                    [jobId]: newPendingApplications,
                }
            };
        })
    },
    incrementInterviewsForJob: (jobId) => {
        set((state) => {
            const currentInterviews = state.interviewsByJobId[jobId] || 0;
            const newInterviews =  currentInterviews + 1;
            return {
                interviewsByJobId: {
                    ...state.interviewsByJobId,
                    [jobId]: newInterviews,
                }
            };
        })
    }
}))

export default useBusinessJobsStore;