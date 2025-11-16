import { getAppliedJobsForUserAndFilter, getFavoriteJobsForUser, getJobsForUserAndFilter, getRecommendedJobs } from "@/lib/userEndpoints";
import { ApplicationStatusFilter, Job, JobFilters } from "@/type";
import { create } from "zustand";

const createAppliedJobsByFilterKey = (filter: ApplicationStatusFilter) => {
    return filter || 'all';
}

const createJobsByFilterKey = (filters: JobFilters) => {
    const parts = [
        filters.search || '',
        (filters.locations || []).join(','),
        (filters.companies || []).join(','),
        (filters.tags || []).join(','),
        (filters.distance || ''),
        filters.minSalary !== undefined ? filters.minSalary.toString() : '',
        filters.maxSalary !== undefined ? filters.maxSalary.toString() : '',
        (filters.employmentTypes || []).join(','),
        (filters.workArrangements || []).join(','),
        (filters.experience || []).join(','),
    ]
    return parts.join('-');
}

interface UserJobsState {
    userJobsByFilter: Record<string, Job[]>;
    recommendedJobs: { job: Job, match: number }[];
    favoriteJobs: Job[];
    appliedJobsByFilter: Record<string, Job[]>;

    loadingJobsByFilterStates: Record<string, boolean>;
    loadingFavoriteJobs: boolean;
    loadingRecommendedJobsState: boolean;
    loadingAppliedJobsByFilterStates: Record<string, boolean>;

    totalCountsByFilter: Record<string, number>;
    totalFavoriteJobsCount: number;
    totalAppliedJobsCountByFilter: Record<string, number>;

    paginationJobsbyFilter: Record<string, { currentPage: number, hasMore: boolean }>;
    paginationFavoriteJobs: { currentPage: number, hasMore: boolean };
    paginationAppliedJobsByFilter: Record<string, { currentPage: number, hasMore: boolean }>;

    lastFetchedJobsByFilter: Record<string, number>;
    lastFetchedFavoriteJobs: number | null;
    lastFetchedAppliedJobsByFilter: Record<string, number>;

    fetchJobsForUserAndFilter: (filter: JobFilters, page?: number) => Promise<void>;
    fetchRecommendedJobs: () => Promise<void>;
    fetchFavoriteJobsForUserAndFilter: (page?: number) => Promise<void>;
    fetchAppliedJobsForUserAndFilter: (filter: ApplicationStatusFilter, page?: number) => Promise<void>;

    getJobsByFilter(filter: JobFilters): Job[];
    getTotalCountForJobsByFilter(filter: JobFilters): number;
    getTotalCountForFavoriteJobs(): number;
    getTotalCountForAppliedJobsByFilter(filter: ApplicationStatusFilter): number;

    getPaginationForJobsByFilter(filter: JobFilters): { currentPage: number, hasMore: boolean } | undefined;
    getPaginationForFavoriteJobs(): { currentPage: number, hasMore: boolean } | undefined;
    getPaginationForAppliedJobsByFilter(filter: ApplicationStatusFilter): { currentPage: number, hasMore: boolean } | undefined;

    getRecommendedJobs(): { job: Job, match: number }[];
    getFavoriteJobs(): Job[];
    getAppliedJobsByFilter(filter: ApplicationStatusFilter): Job[];

    isLoadingJobsForFilter(filter: JobFilters): boolean;
    isLoadingFavoriteJobs(): boolean;
    isLoadingRecommendedJobs(): boolean;
    isLoadingAppliedJobsForFilter(filter: ApplicationStatusFilter): boolean;

    hasValidCachedJobs: (filter: JobFilters) => boolean;
    hasValidFavoriteJobsCache: () => boolean;
    hasValidRecommendedJobsCache: () => boolean;
    hasValidAppliedJobsCache: (filter: ApplicationStatusFilter) => boolean;

    refreshJobsForUserAndFilter: (filter: JobFilters) => Promise<void>;
    refreshFavoriteJobs: () => Promise<void>;
    refreshRecommendedJobs: () => Promise<void>;
    refreshAppliedJobsForUserAndFilter: (filter: ApplicationStatusFilter) => Promise<void>;

    addJobToFavorites: (job: Job) => void;
    removeJobFromFavorites: (jobId: number) => void;
    addAppliedJob: (job: Job) => void;
    addAppliedJobs: (jobs: Job[]) => void;
}

const useUserJobsStore = create<UserJobsState>((set, get) => ({
    // State variables in interface order
    userJobsByFilter: {},
    recommendedJobs: [],
    favoriteJobs: [],
    appliedJobsByFilter: {},

    loadingJobsByFilterStates: {},
    loadingFavoriteJobs: false,
    loadingRecommendedJobsState: false,
    loadingAppliedJobsByFilterStates: {},

    totalCountsByFilter: {},
    totalFavoriteJobsCount: 0,
    totalAppliedJobsCountByFilter: {},

    paginationJobsbyFilter: {},
    paginationFavoriteJobs: {currentPage: 0, hasMore: false},
    paginationAppliedJobsByFilter: {},

    lastFetchedJobsByFilter: {},
    lastFetchedFavoriteJobs: null,
    lastFetchedAppliedJobsByFilter: {},

    fetchJobsForUserAndFilter: async (filter, page = 0) => {
        const filterKey = createJobsByFilterKey(filter);
        const state = get();
        if (state.loadingJobsByFilterStates[filterKey]) return;
        set((state) => ({
            loadingJobsByFilterStates: {
                ...state.loadingJobsByFilterStates,
                [filterKey]: true,
            }
        }))
        try {
            const pageSize = 3;
            const response = await getJobsForUserAndFilter(page, pageSize, filter);
            const { content: newJobs, totalElements, hasMore } = response;
            const existingJobs = state.userJobsByFilter[filterKey] || [];
            const updatedJobs = [...existingJobs, ...newJobs]
            set((state) => ({
                userJobsByFilter: {
                    ...state.userJobsByFilter,
                    [filterKey]: updatedJobs,
                },
                totalCountsByFilter: {
                    ...state.totalCountsByFilter,
                    [filterKey]: totalElements,
                },
                paginationJobsbyFilter: {
                    ...state.paginationJobsbyFilter,
                    [filterKey]: {
                        currentPage: page,
                        hasMore,
                    }
                },
                lastFetchedJobsByFilter: {
                    ...state.lastFetchedJobsByFilter,
                    [filterKey]: Date.now(),
                }
            }))
        } catch (error) {
            console.log("Error fetching jobs for user and filter:", error);
        } finally {
            set((state) => ({
                loadingJobsByFilterStates: {
                    ...state.loadingJobsByFilterStates,
                    [filterKey]: false,
                }
            }))
        }
    },

    fetchRecommendedJobs: async () => {
        const state = get();
        if (state.loadingRecommendedJobsState) return;
        set(() => ({
            loadingRecommendedJobsState: true,
        }))
        try {
            const recommendedJobs= await getRecommendedJobs();
            set(() => ({
                recommendedJobs,
            }))
        } catch (error) {
            console.log("Error fetching recommended jobs for user and filter:", error);
        } finally {
            set(() => ({
                loadingRecommendedJobsState: false,
            }))
        }
    },

    fetchFavoriteJobsForUserAndFilter: async (page = 0) => {
        const state = get();
        if (state.loadingFavoriteJobs) return;
        set(() => ({
            loadingFavoriteJobs: true,
        }))
        try {
            const pageSize = 5;
            const response = await getFavoriteJobsForUser(page, pageSize);
            const { content: newJobs, hasMore, totalElements } = response;
            const existingJobs = state.favoriteJobs || [];
            const updatedJobs = [...existingJobs, ...newJobs]
            set(() => ({
                favoriteJobs: updatedJobs,
                totalFavoriteJobsCount: totalElements,
                paginationFavoriteJobs: {
                    currentPage: page,
                    hasMore,
                },
                lastFetchedFavoriteJobs: Date.now(),
            })) 
        } catch (error) {
            console.log("Error fetching favorite jobs for user and filter:", error);
        } finally {
            set(() => ({
                loadingFavoriteJobs: false,
            }))
        }
    },

    fetchAppliedJobsForUserAndFilter: async (filter, page = 0) => {
        const state = get();
        const filterKey = createAppliedJobsByFilterKey(filter);
        if (state.loadingAppliedJobsByFilterStates[filterKey]) return;
        set((state) => ({
            loadingAppliedJobsByFilterStates: {
                ...state.loadingAppliedJobsByFilterStates,
                [filterKey]: true,
            }
        }))
        try {
            const pageSize = 3;
            const response = await getAppliedJobsForUserAndFilter(page, pageSize, filter);
            const { content: newJobs, totalElements, hasMore } = response
            const existingJobs = state.appliedJobsByFilter[filterKey] || [];
            const updatedJobs = [...existingJobs, ...newJobs]
            set((state) => ({
                appliedJobsByFilter: {
                    ...state.appliedJobsByFilter,
                    [filterKey]: updatedJobs,
                },
                totalAppliedJobsCountByFilter: {
                    ...state.totalAppliedJobsCountByFilter,
                    [filterKey]: totalElements,
                },
                paginationAppliedJobsByFilter: {
                    ...state.paginationAppliedJobsByFilter,
                    [filterKey]: {
                        currentPage: page,
                        hasMore,
                    }
                },
                lastFetchedAppliedJobsByFilter: {
                    ...state.lastFetchedAppliedJobsByFilter,
                    [filterKey]: Date.now(),
                }
            }))
        } catch (error) {
            console.log("Error fetching applied jobs for user and filter:", error);
        } finally {
            set((state) => ({
                loadingAppliedJobsByFilterStates: {
                    ...state.loadingAppliedJobsByFilterStates,
                    [filterKey]: false,
                }
            }))
        }
    },

    // Getter methods in interface order
    getJobsByFilter: (filter) => {
        const filterKey = createJobsByFilterKey(filter);
        const state = get();
        return state.userJobsByFilter[filterKey] || [];
    },

    getTotalCountForJobsByFilter: (filter) => {
        const filterKey = createJobsByFilterKey(filter);
        const state = get();
        return state.totalCountsByFilter[filterKey] || 0;
    },

    getTotalCountForFavoriteJobs: () => {
        const state = get();
        return state.totalFavoriteJobsCount;
    },

    getTotalCountForAppliedJobsByFilter: (filter) => {
        const filterKey = createAppliedJobsByFilterKey(filter);
        const state = get();
        return state.totalAppliedJobsCountByFilter[filterKey] || 0;
    },

    getPaginationForJobsByFilter: (filter) => {
        const filterKey = createJobsByFilterKey(filter);
        const state = get();
        return state.paginationJobsbyFilter[filterKey];
    },

    getPaginationForFavoriteJobs: () => {
        const state = get();
        return state.paginationFavoriteJobs;
    },
    getPaginationForAppliedJobsByFilter: (filter) => {
        const filterKey = createAppliedJobsByFilterKey(filter);
        const state = get();
        return state.paginationAppliedJobsByFilter[filterKey];
    },

    getRecommendedJobs: () => {
        const state = get();
        return Object.values(state.recommendedJobs);
    },

    getFavoriteJobs: () => {
        const state = get();
        return state.favoriteJobs;
    },

    getAppliedJobsByFilter: (filter) => {
        const filterKey = createAppliedJobsByFilterKey(filter);
        const state = get();
        return state.appliedJobsByFilter[filterKey];  
    },

    isLoadingJobsForFilter: (filter) => {
        const filterKey = createJobsByFilterKey(filter);
        const state = get();
        return state.loadingJobsByFilterStates[filterKey] || false;
    },

    isLoadingFavoriteJobs: () => {
        const state = get();
        return state.loadingFavoriteJobs;
    },

    isLoadingRecommendedJobs: () => {
        const state = get();
        return state.loadingRecommendedJobsState;
    },

    isLoadingAppliedJobsForFilter: (filter) => {
        const filterKey = createAppliedJobsByFilterKey(filter);
        const state = get();
        return state.loadingAppliedJobsByFilterStates[filterKey] || false;
    },

    hasValidCachedJobs: (filter) => {
        const filterKey = createJobsByFilterKey(filter);
        const state = get();
        const lastFetched = state.lastFetchedJobsByFilter[filterKey];
        if (!lastFetched) return false;
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        return (now - lastFetched) < tenMinutes;
    },

    hasValidFavoriteJobsCache: () => {
        const state = get();
        const lastFetched = state.lastFetchedFavoriteJobs;
        if (!lastFetched) return false;
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        return (now - lastFetched) < thirtyMinutes;
    },

    hasValidRecommendedJobsCache: () => {
        const state = get();
        const lastFetched = state.lastFetchedJobsByFilter['recommended'];
        if (!lastFetched) return false;
        const now = Date.now();
        const sixHours = 360 * 60 * 1000;
        return (now - lastFetched) < sixHours;
    },

    hasValidAppliedJobsCache: (filter) => {
        const filterKey = createAppliedJobsByFilterKey(filter);
        const state = get();
        const lastFetched = state.lastFetchedAppliedJobsByFilter[filterKey];
        if (!lastFetched) return false;
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        return (now - lastFetched) < tenMinutes;
    },

    refreshJobsForUserAndFilter: async (filter) => {
        const filterKey = createJobsByFilterKey(filter);
        const newState = get();
        delete newState.userJobsByFilter[filterKey];
        delete newState.totalCountsByFilter[filterKey];
        delete newState.paginationJobsbyFilter[filterKey];
        delete newState.lastFetchedJobsByFilter[filterKey];
        set(() => ({
            ...newState
        }));
        await newState.fetchJobsForUserAndFilter(filter, 0);
    },

    refreshFavoriteJobs: async () => {
        const newState = get();
        set(() => ({
            ...newState,
            favoriteJobs: [],
        }));
        await newState.fetchFavoriteJobsForUserAndFilter(0);
    },

    refreshRecommendedJobs: async () => {
        const newState = get();
        set(() => ({
            ...newState,
            recommendedJobs: [],
        }));
        await newState.fetchRecommendedJobs();
    },

    refreshAppliedJobsForUserAndFilter: async (filter) => {
        const filterKey = createAppliedJobsByFilterKey(filter);
        const newState = get();
        delete newState.appliedJobsByFilter[filterKey];
        delete newState.totalAppliedJobsCountByFilter[filterKey];
        delete newState.paginationAppliedJobsByFilter[filterKey];
        delete newState.lastFetchedAppliedJobsByFilter[filterKey];
        set(() => ({
            ...newState
        }));
        await newState.fetchAppliedJobsForUserAndFilter(filter, 0);
    },
    addJobToFavorites: (job) => {
        const state = get();
        const existingJobs = state.favoriteJobs || [];
        console.log("Adding job to favorites in store:", job);
        const updatedJobs = [job, ...existingJobs];
        set(() => ({
            favoriteJobs: updatedJobs,
            totalFavoriteJobsCount: state.totalFavoriteJobsCount + 1,
        }))
    },
    removeJobFromFavorites: (jobId) => {
        const state = get();
        const existingJobs = state.favoriteJobs || [];
        const updatedJobs = existingJobs.filter((job) => job.id !== jobId);
        set(() => ({
            favoriteJobs: updatedJobs,
            totalFavoriteJobsCount: Math.max(0, state.totalFavoriteJobsCount - 1),
        }))
    },
    addAppliedJob: (job) => {
        // When a new job is added to the state, it will be Pending and all
        // Update all filer keys accordinglt
        const state = get();
        Object.keys(state.appliedJobsByFilter).forEach((filterKey) => {
            if (filterKey === 'all' || filterKey === 'PENDING') {
            const existingJobs = state.appliedJobsByFilter[filterKey] || [];
            const updatedJobs = [job, ...existingJobs];
            set((state) => ({
                appliedJobsByFilter: {
                    ...state.appliedJobsByFilter,
                    [filterKey]: updatedJobs,
                },
                totalAppliedJobsCountByFilter: {
                    ...state.totalAppliedJobsCountByFilter,
                    [filterKey]: (state.totalAppliedJobsCountByFilter[filterKey] || 0) + 1,
                }
            }))
            }
        });
    },
    addAppliedJobs: (jobs) => {
        const state = get();
        jobs.forEach((job) => {
            // When a new job is added to the state, it will be Pending and all
            // Update all filer keys accordingly
            Object.keys(state.appliedJobsByFilter).forEach((filterKey) => {
                if (filterKey === 'all' || filterKey === 'PENDING') {
                const existingJobs = state.appliedJobsByFilter[filterKey] || [];
                const updatedJobs = [job, ...existingJobs];
                set((state) => ({
                    appliedJobsByFilter: {
                        ...state.appliedJobsByFilter,
                        [filterKey]: updatedJobs,
                    },
                    totalAppliedJobsCountByFilter: {
                        ...state.totalAppliedJobsCountByFilter,
                        [filterKey]: (state.totalAppliedJobsCountByFilter[filterKey] || 0) + 1,
                    }
                }))
                }
            });
        });
    }
}))

export default useUserJobsStore;