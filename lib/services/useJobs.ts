import { getAPIUrl } from '@/constants';
import { ApplicantFilters, Application, ApplicationSummary, InterviewDetails, Job, JobApplicationStatus, JobFilters, PagedResponse } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryFunctionContext, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getEducationLevel, getExperienceLevel } from '../utils';

const JOBS_API_URL = getAPIUrl('jobs');
const APPLICATIONS_API_URL = `http://192.168.2.29:8080/applications`;
const INTERVIEWS_API_URL = `http://192.168.2.29:8080/interviews`;
const USER_PROFILE_API_URL = getAPIUrl('profiles');

export const useJobs = (jobFilters: JobFilters) => {
    const { search, locations, companies, tags, minSalary, maxSalary, experience, employmentTypes, workArrangements } = jobFilters
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    locations.forEach(location => queryParams.append('locations', location))
    if (companies) companies.forEach(company => queryParams.append('companies', company))
    tags.forEach(tag => queryParams.append('tags', tag))
    employmentTypes?.forEach(type => queryParams.append('employmentTypes', type))
    workArrangements?.forEach(arrangement => queryParams.append('settings', arrangement))
    if (minSalary) queryParams.append('minSalary', minSalary.toString())
    if (maxSalary) queryParams.append('maxSalary', maxSalary.toString())
    if (experience) experience.forEach(exp => queryParams.append('experience', exp))
    const params = queryParams.toString()
    const fetchJobs = async ({ pageParam = 0} : QueryFunctionContext) : Promise<{ jobs: Job[]; nextPage: number; hasMore: boolean }> => {
        const pageSize = 8;
        const page = pageParam as number;
        const response = await fetch(`${JOBS_API_URL}?${params}&pageNumber=${pageParam}&pageSize=${pageSize}`)
        const data : PagedResponse<Job> = await response.json()
        return { jobs: data.content, nextPage: page + 1, hasMore: data.hasMore}
    }
    return useInfiniteQuery<{jobs: Job[]; nextPage: number; hasMore: boolean}, Error>({
        queryKey: ['jobs', params],
        queryFn: fetchJobs,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
          return lastPage.hasMore ? lastPage.nextPage : undefined
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useRecommendedJobs = (isAuthenticated: boolean) => {
  const fetchRecommendedJobs = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return [];
    const response = await fetch(`${USER_PROFILE_API_URL}/recommended-jobs`, {
      headers: {
        'x-auth-token': `Bearer ${token}`
     }
    })
    const data = await response.json()
    return data
  }
  return useQuery<{job: Job, match: number}[], Error>({
    queryKey: ['jobs', 'recommended'],
    queryFn: fetchRecommendedJobs,
    staleTime: 1000 * 60 * 360, //6 Hours
    enabled: isAuthenticated,
  })
}

export const useJob = (id: number) => {
    const fetchJob = async () => {
        const response = await fetch(`${JOBS_API_URL}/${id}`)
        const data = await response.json()
        return data
    }
    return useQuery<Job, Error>({
        queryKey: ['job', id],
        queryFn: fetchJob,
        enabled: !!id,
    })
}

export const useJobsByUserFavorites = () => {
  const fetchFavoriteJobs = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return [];
    const response = await fetch(`${USER_PROFILE_API_URL}/favorite-jobs`, {
      headers: {
        'x-auth-token': `Bearer ${token}`
      }
    })
    const data = await response.json()
    return data
  }

  return useQuery<Job[], Error>({
    queryKey: ['jobs', 'favorites'],
    queryFn: fetchFavoriteJobs,
    staleTime: 1000 * 60 * 5,
  })
}

export const useJobsByUserApplications = (userId?: number) => {
  const fetchAppliedJobs = async () => {
    const response = await fetch(`${APPLICATIONS_API_URL}?userId=${userId}`)
    const data = await response.json()
    return data
  }

  return useQuery<JobApplicationStatus[], Error>({
    queryKey: ['jobs', 'applications', userId],
    queryFn: fetchAppliedJobs,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId
  })
}

export const useApplicationById = (applicationId?: number) => {
  const fetchApplication = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}`, {
      headers: {
        'x-auth-token': `Bearer ${token}`
      }
    })
    const data = await response.json()
    return data as Application;
  }

  return useQuery<Application | null, Error>({
    queryKey: ['application', applicationId],
    queryFn: fetchApplication,
    staleTime: 1000 * 60 * 10,
    enabled: !!applicationId
  })
}

export const useJobForBusinessAccount = (filters?: JobFilters, companyId?: number) => {
  const urlParams = new URLSearchParams()
  if (filters) {
    if (filters.search) urlParams.append('search', filters.search)
    filters.locations.forEach(location => urlParams.append('locations', location))
    filters.tags.forEach(tag => urlParams.append('tags', tag))
    if (filters.minSalary) urlParams.append('minSalary', filters.minSalary.toString())
    if (filters.maxSalary) urlParams.append('maxSalary', filters.maxSalary.toString())
    filters.experience?.forEach(exp => urlParams.append('experience', exp))
  }
  if (companyId) urlParams.append('companyId', companyId.toString())
  const params = urlParams.toString()
  const fetchCompanyJobs = async ({ pageParam = 0} : QueryFunctionContext) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const pageSize = 6;
    const page = pageParam as number;
    const response = await fetch(`${JOBS_API_URL}/companies/${companyId}/jobs?${params}&pageNumber=${page}&pageSize=${pageSize}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': `Bearer ${token}`
      },
    })
    const data : PagedResponse<Job> = await response.json()
    return { jobs: data.content, nextPage: page + 1, hasMore: data.hasMore, totalJobs: data.totalElements}
  }

  return useInfiniteQuery<{jobs: Job[]; nextPage: number; hasMore: boolean; totalJobs: number}, Error>({
    queryKey: ['jobs', 'company', companyId, filters],
    queryFn: fetchCompanyJobs,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId,
  })
}

export const useJobsForBusiness = (jobId: number) => {
  const fetchJobForBusiness = async () => {
    const response = await fetch(`${JOBS_API_URL}/companies/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data
  }
  return useQuery<Job, Error>({
    queryKey: ['job', 'business', jobId],
    queryFn: fetchJobForBusiness,
    staleTime: 1000 * 60 * 5,
    enabled: !!jobId,
  })
}

export const useMostRecentJobsAtCompany = (companyId: number) => {
  const fetchRecentJobsAtCompany = async () => {
    const response = await fetch(`${JOBS_API_URL}/companies/${companyId}/recent-jobs?limit=3`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data
  }
  return useQuery<Job[], Error>({
    queryKey: ['jobs', 'company', companyId, 'recent'],
    queryFn: fetchRecentJobsAtCompany,
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId,
  })
}

export const useApplicantsForJob = (jobId?: number, filters?: ApplicantFilters) => {
  const queryParams = new URLSearchParams()
  const locations = filters?.locations || []
  const skills = filters?.skills || []
  const educations = filters?.educations
  const experiences = filters?.experiences
  locations.forEach(location => queryParams.append('locations', location))
  skills.forEach(skill => queryParams.append('skills', skill))
  if (filters?.search) {
    queryParams.append('search', filters.search)
  }
  if (educations && educations !== 'Any') 
    queryParams.append('educationLevel', getEducationLevel(educations) ?? '')
  if (experiences && experiences !== 'Any')
    queryParams.append('experienceLevel', getExperienceLevel(experiences) ?? '')
  if (filters?.hasVideoIntro)
    queryParams.append('hasVideoIntro', true.toString())
  if (filters?.hasCoverLetter)
    queryParams.append('hasCoverLetter', true.toString())
  if (filters?.applicationDateRange) {
    queryParams.append('applicationDateRange', filters?.applicationDateRange.toString())
  }
  const params = queryParams.toString()
  const fetchApplicantsForJob = async () => {
    const response = await fetch(`${APPLICATIONS_API_URL}/job/${jobId}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data
  }

  return useQuery<ApplicationSummary[], Error>({
    queryKey: ['applications', 'job', jobId, filters],
    queryFn: fetchApplicantsForJob,
    staleTime: 1000 * 60 * 5,
    enabled: !!jobId,
  })
}

export const useInterviewsForJob = (jobId?: number) => {
  const fetchInterviewsForJob = async () => {
    const response = await fetch(`${INTERVIEWS_API_URL}/job/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data
  }

  return useQuery<InterviewDetails[], Error>({
    queryKey: ['interviews', 'job', jobId],
    queryFn: fetchInterviewsForJob,
    staleTime: 1000 * 60 * 5,
    enabled: !!jobId,
  })
}

export const useShortListedCandidatesForJob = (jobId?: number) => {
  const fetchShortListedCandidatesForJob = async () => {
    const response = await fetch(`${JOBS_API_URL}/${jobId}/shortlisted`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data
  }

  return useQuery<number[], Error>({
    queryKey: [jobId, 'shortlist'],
    queryFn: fetchShortListedCandidatesForJob,
    staleTime: 1000 * 60 * 5,
    enabled: !!jobId,
  })
}

export const useUserAppliedJobs = () => {
  const fetchUserAppliedJobs = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return [];
    const response = await fetch(`${JOBS_API_URL}/applied`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': `Bearer ${token}`
      },
    })
    const data = await response.json()
    return data
  }

  return useQuery<number[], Error>({
    queryKey: ['user', 'appliedJobs'],
    queryFn: fetchUserAppliedJobs,
    staleTime: 1000 * 60 * 5
  })
}

export const useJobApplication = (jobId: number) => {
  const fetchJobApplication = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    console.log("Fetching application for job", jobId);
    const response = await fetch(`${USER_PROFILE_API_URL}/appliedJobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': `Bearer ${token}`
      },
    })
    const data = await response.json()
    return data
  }

  return useQuery<Application | Error>({
    queryKey: ['job', jobId, 'application'],
    queryFn: fetchJobApplication,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: !!jobId && !isNaN(jobId)
  })
}
