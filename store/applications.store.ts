import { getCandidatesForJob } from "@/lib/jobEndpoints";
import { getApplicationsForJob, getShortListedApplicationsForJob } from "@/lib/userEndpoints";
import { ApplicantFilters, Application, CandidateForJob } from "@/type";
import {
    create
} from "zustand";

const createFilterKey = (jobId: number, filters: ApplicantFilters) => {
  const parts = [
    jobId.toString(),
    filters.locations.sort().join(','),
    filters.skills.sort().join(','),
    filters.educations,
    filters.experiences,
    filters.hasVideoIntro ? '1' : '0',
    filters.hasCoverLetter ? '1' : '0',
    filters.applicationDateRange ? filters.applicationDateRange.toString() : 'any',
    filters.search ? filters.search.toLowerCase() : '',
    filters.applicationStatus ? filters.applicationStatus : 'any'
  ]
  return parts.join('-')
}

interface ApplicationsState {
    applicationsByJobAndFilter: Record<string, Application[]>;
    shortListedApplicationsByJob: Record<number, number[]>;
    loadingApplicationStates: Record<string, boolean>;
    loadingShortListedStates: Record<number, boolean>;
    loadingCandidatesStates: Record<number, boolean>;
    candidatesForJob: Record<number, CandidateForJob[]>;
    totalCounts: Record<string, number>
    pagination: Record<string, {
        currentPage: number;
        hasMore: boolean;
    }>;

    lastFetchApplicants: Record<string, number>;
    lastFetchedShortListedApplicants: Record<number, number>;
    lastFetchedCandidates: Record<number, number>;

    fetchShortListedApplicationsForJob: (jobId: number) => Promise<void>;
    fetchApplicationsForJob: (jobId: number, filters: ApplicantFilters, page?: number) => Promise<void>;
    fetchCandidatesForJob: (jobId: number) => Promise<void>;

    getApplicationsForJob: (jobId: number, filters: ApplicantFilters) => Application[] | undefined;
    getShortListedApplicationsForJob: (jobId: number) => number[] | undefined;
    getCandidatesForJob: (jobId: number) => CandidateForJob[] | undefined;
    getPaginationForJobAndFilter: (jobId: number, filters: ApplicantFilters) => { currentPage: number; hasMore: boolean } | undefined;
    getApplicationsCountForJob: (jobId: number, filters: ApplicantFilters) => number | undefined;

    isLoadingApplicationStatesForJob: (jobId: number, filters: ApplicantFilters) => boolean;
    isLoadingShortListedStatesForJob: (jobId: number) => boolean;
    isLoadingCandidatesStatesForJob: (jobId: number) => boolean;

    hasValidApplicantCache: (jobId: number, filters: ApplicantFilters) => boolean;
    hasValidShortListedCache: (jobId: number) => boolean;
    hasValidCandidatesCache: (jobId: number) => boolean;

    refreshApplicationsForJobAndFilter: (jobId: number, filters: ApplicantFilters) => Promise<void>;
    refreshShortListedApplicationsForJob: (jobId: number) => Promise<void>;
    refreshCandidatesForJob: (jobId: number) => Promise<void>;

    addToShortListedApplications: (jobId: number, applicationId: number) => void;
    removeFromShortListedApplications: (jobId: number, applicationId: number) => void;
    setApplicationStatus: (jobId: number, applicationId: number, status: string) => void;

    isCandidateShortListed: (jobId: number, applicationId: number) => boolean;
}

const useApplicationStore = create<ApplicationsState>((set, get) => ({
    // State variables in interface order
    applicationsByJobAndFilter: {},
    shortListedApplicationsByJob: {},
    loadingApplicationStates: {},
    loadingShortListedStates: {},
    loadingCandidatesStates: {},
    candidatesForJob: {},
    totalCounts: {},
    pagination: {},
    lastFetchApplicants: {},
    lastFetchedShortListedApplicants: {},
    lastFetchedCandidates: {},

    fetchShortListedApplicationsForJob: async (jobId) => {
        const state = get();
        if (state.shortListedApplicationsByJob[jobId]) return;
        set((state) => ({
            loadingShortListedStates: {...state.loadingShortListedStates, [jobId]: true}
        }))
        try {
            const response = await getShortListedApplicationsForJob(jobId);
            set((state) => ({
                shortListedApplicationsByJob: {
                    ...state.shortListedApplicationsByJob,
                    [jobId]: response
                }
            }))
        } catch (error) {
            console.log("SYED-DEBUG: Applications Store - Error fetching shortlisted applications for job", error);
        } finally {
            set((state) => ({
                loadingShortListedStates: {...state.loadingShortListedStates, [jobId]: false}
            }))
        }
    },

    fetchApplicationsForJob: async (jobId, filters, page = 0) => {
        const filterKey = createFilterKey(jobId, filters);
        const state = get();
        if (state.loadingApplicationStates[filterKey]) return;
        set((state) => ({
            loadingApplicationStates: {...state.loadingApplicationStates, [filterKey]: true}
        }))
        try {
            const pageSize = 3;
            const response = await getApplicationsForJob(jobId, page, pageSize, filters);
            const { content: newApplications, totalElements, hasMore } = response;
            const existingApplications = state.applicationsByJobAndFilter[filterKey] || [];
            const updatedApplications = [...existingApplications, ...newApplications];
            set((state) => ({
                applicationsByJobAndFilter: {
                    ...state.applicationsByJobAndFilter,
                    [filterKey]: updatedApplications
                },
                totalCounts: {
                    ...state.totalCounts,
                    [filterKey]: totalElements
                },
                pagination: {
                    ...state.pagination,
                    [filterKey]: {
                        currentPage: page,
                        hasMore: hasMore
                    }
                },
                lastFetchApplicants: {
                    ...state.lastFetchApplicants,
                    [filterKey]: Date.now()
                }
            }))
        } catch (error) {
            console.log("SYED-DEBUG: Applications Store - Error fetching applications for job", error);
        } finally {
            set((state) => ({
                loadingApplicationStates: {...state.loadingApplicationStates, [filterKey]: false}
            }))  
        }
    },

    fetchCandidatesForJob: async (jobId) => {
        const state = get();
        if (state.loadingCandidatesStates[jobId]) return;
        set((state) => ({
            loadingCandidatesStates: {...state.loadingCandidatesStates, [jobId]: true}
        }))
        try {
            const response = await getCandidatesForJob(jobId);
            set((state) => ({
                candidatesForJob: {
                    ...state.candidatesForJob,
                    [jobId]: response ?? []
                },
                lastFetchedCandidates: {
                    ...state.lastFetchedCandidates,
                    [jobId]: Date.now()
                }
            }))
        } catch (error) {
            console.error("Error fetching candidates for job:", error);
        } finally {
            set((state) => ({
                loadingCandidatesStates: {...state.loadingCandidatesStates, [jobId]: false}
            }))
        }
    },

    // Getter methods in interface order
    getApplicationsForJob: (jobId, filters) => {
        const state = get();
        const filterKey = createFilterKey(jobId, filters);
        return state.applicationsByJobAndFilter[filterKey];
    },

    getShortListedApplicationsForJob: (jobId) => {
        const state = get();
        return state.shortListedApplicationsByJob[jobId];
    },

    getCandidatesForJob: (jobId) => {
        const state = get();
        return state.candidatesForJob[jobId];
    },

    getPaginationForJobAndFilter: (jobId, filters) => {
        const state = get();
        const filterKey = createFilterKey(jobId, filters);
        return state.pagination[filterKey];
    },

    getApplicationsCountForJob: (jobId, filters) => {
        const state = get();
        const filterKey = createFilterKey(jobId, filters);
        return state.totalCounts[filterKey];
    },

    // Loading state methods in interface order
    isLoadingApplicationStatesForJob: (jobId, filters) => {
        const state = get();
        const filterKey = createFilterKey(jobId, filters);
        return state.loadingApplicationStates[filterKey] || false;
    },

    isLoadingShortListedStatesForJob: (jobId) => {
        const state = get();
        return state.loadingShortListedStates[jobId] || false;
    },

    isLoadingCandidatesStatesForJob: (jobId) => {
        const state = get();
        return state.loadingCandidatesStates[jobId] || false;
    },

    // Cache validation methods in interface order
    hasValidApplicantCache: (jobId, filters) => {
        const state = get();
        const filterKey = createFilterKey(jobId, filters);
        const CACHE_DURATION = 5 * 60 * 1000;
        const lastFetched = state.lastFetchApplicants[filterKey];
        if (!lastFetched) return false;
        const isFresh = Date.now() - lastFetched < CACHE_DURATION;
        return isFresh;
    },

    hasValidShortListedCache: (jobId) => {
        const state = get();
        const CACHE_DURATION = 10 * 60 * 1000;
        const lastFetched = state.lastFetchApplicants[jobId];
        if (!lastFetched) return false;
        const isFresh = Date.now() - lastFetched < CACHE_DURATION;
        return isFresh;
    },

    hasValidCandidatesCache: (jobId) => {
        const state = get();
        const CACHE_DURATION = 5 * 60 * 1000;
        const lastFetched = state.lastFetchedCandidates[jobId];
        if (!lastFetched) return false;
        const isFresh = Date.now() - lastFetched < CACHE_DURATION;
        return isFresh;
    },

    // Refresh methods in interface order
    refreshApplicationsForJobAndFilter: async (jobId, filters) => {
        const filterKey = createFilterKey(jobId, filters);
        const newState = get();
        delete newState.applicationsByJobAndFilter[filterKey];
        delete newState.pagination[filterKey];
        delete newState.totalCounts[filterKey];
        delete newState.lastFetchApplicants[filterKey];
        set(() => ({
            applicationsByJobAndFilter: { ...newState.applicationsByJobAndFilter },
            pagination: { ...newState.pagination },
            totalCounts: { ...newState.totalCounts },
            lastFetchApplicants: { ...newState.lastFetchApplicants }
        }));
        await newState.fetchApplicationsForJob(jobId, filters, 0);
    },

    refreshShortListedApplicationsForJob: async (jobId) => {
        const newState = get()
        if (newState.shortListedApplicationsByJob[jobId]) {
            delete newState.shortListedApplicationsByJob[jobId];
            delete newState.lastFetchedShortListedApplicants[jobId];
            set(() => ({
                shortListedApplicationsByJob: { ...newState.shortListedApplicationsByJob },
                lastFetchedShortListedApplicants: { ...newState.lastFetchApplicants }
            }));
        }
        await newState.fetchShortListedApplicationsForJob(jobId);
    },

    refreshCandidatesForJob: async (jobId) => {
        const newState = get();
        if (newState.candidatesForJob[jobId]) {
            delete newState.candidatesForJob[jobId];
            delete newState.lastFetchedCandidates[jobId];
            set(() => ({
                candidatesForJob: { ...newState.candidatesForJob },
                lastFetchedCandidates: { ...newState.lastFetchedCandidates }
            }));
        }
        await newState.fetchCandidatesForJob(jobId);
    },

    addToShortListedApplications: (jobId, applicationId) => {
        const state = get();
        const existingList = state.shortListedApplicationsByJob[jobId] || [];
        if (!existingList.includes(applicationId)) {
            const updatedList = [...existingList, applicationId];
            set((state) => ({
                shortListedApplicationsByJob: {
                    ...state.shortListedApplicationsByJob,
                    [jobId]: updatedList
                }
            }));
        }
    },

    removeFromShortListedApplications: (jobId, applicationId) => {
        const state = get();
        const existingList = state.shortListedApplicationsByJob[jobId] || [];
        if (existingList.includes(applicationId)) {
            const updatedList = existingList.filter(id => id !== applicationId);
            set((state) => ({
                shortListedApplicationsByJob: {
                    ...state.shortListedApplicationsByJob,
                    [jobId]: updatedList
                }
            }));
        }
    },
    
    setApplicationStatus: (jobId, applicationId, status) => {
        // Find all keys that start with 'jobId-'
        // and update the status of the matching application in those lists
        const state = get();
        const prefix = `${jobId}-`;
        const updatedApplicationsByJobAndFilter = { ...state.applicationsByJobAndFilter };
        Object.keys(updatedApplicationsByJobAndFilter).forEach(key => {
            if (key.startsWith(prefix)) {
                const applications = updatedApplicationsByJobAndFilter[key];
                const updatedApplications = applications.map(app =>
                    app.id === applicationId ? { ...app, status } : app
                );
                updatedApplicationsByJobAndFilter[key] = updatedApplications;
            }
        })
        set(() => ({
            applicationsByJobAndFilter: updatedApplicationsByJobAndFilter
        }));
    },
    isCandidateShortListed: (jobId, applicationId) => {
        const state = get();
        const shortListed = state.shortListedApplicationsByJob[jobId] || [];
        return shortListed.includes(applicationId);
    }
}));

export default useApplicationStore;