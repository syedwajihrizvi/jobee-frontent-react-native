import { Application, ApplicationSummary, Job, JobFilters } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { getEducationLevel } from '../utils';

const JOBS_API_URL = `http://10.0.0.135:8080/jobs`;
const APPLICATIONS_API_URL = `http://10.0.0.135:8080/applications`;
const USER_PROFILE_API_URL =`http://10.0.0.135:8080/profiles`;

export const useJobs = (jobFilters: JobFilters) => {
    const { search, locations, companies, tags, minSalary, maxSalary } = jobFilters
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    locations.forEach(location => queryParams.append('locations', location))
    if (companies) companies.forEach(company => queryParams.append('companies', company))
    tags.forEach(tag => queryParams.append('tags', tag))

    if (minSalary) queryParams.append('minSalary', minSalary.toString())
    if (maxSalary) queryParams.append('maxSalary', maxSalary.toString())
    
    const params = queryParams.toString()
    const fetchJobs = async () => {
        const response = await fetch(`${JOBS_API_URL}?${params}`)
        const data = await response.json()
        return data
    }
    return useQuery<Job[], Error>({
        queryKey: ['jobs', params],
        queryFn: fetchJobs,
        staleTime: 1000 * 60 * 5, // 5 minutes
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
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!id, // Only fetch if id is defined
    })
}

export const useFavoriteJobs = () => {
  const fetchFavoriteJobs = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return [];
    const response = await fetch(`${JOBS_API_URL}/favorite-jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })
    const data = await response.json()
    return data
  }

  return useQuery<number[], Error>({
    queryKey: ['jobs', 'favorites'],
    queryFn: fetchFavoriteJobs,
    staleTime: 1000 * 60 * 5,
  })
}

export const useJobsByUserFavorites = (
  userId?: number,
  options?: { enabled?: boolean }
) => {
  const fetchFavoriteJobs = async () => {
    const response = await fetch(`${JOBS_API_URL}/favorites?userId=${userId}`)
    const data = await response.json()
    return data
  }

  return useQuery<Job[], Error>({
    queryKey: ['jobs', 'favorites', userId],  // ✅ userId in key means query refreshes when userId changes
    queryFn: fetchFavoriteJobs,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && (options?.enabled ?? true), // ✅ only run if userId is set
  })
}

export const useJobsByUserApplications = (userId?: number) => {
  const fetchAppliedJobs = async () => {
    const response = await fetch(`${APPLICATIONS_API_URL}?userId=${userId}`)
    const data = await response.json()
    return data
  }

  return useQuery<{job: Job, status: string}[], Error>({
    queryKey: ['jobs', 'applications', userId],
    queryFn: fetchAppliedJobs,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId
  })
}

export const useJobsByCompany = (filters: JobFilters, companyId?: number) => {
  const urlParams = new URLSearchParams()
  if (filters.search) urlParams.append('search', filters.search)
  filters.locations.forEach(location => urlParams.append('locations', location))
  filters.tags.forEach(tag => urlParams.append('tags', tag))
  if (filters.minSalary) urlParams.append('minSalary', filters.minSalary.toString())
  if (filters.maxSalary) urlParams.append('maxSalary', filters.maxSalary.toString())
  const params = urlParams.toString()
  const fetchCompanyJobs = async () => {
    const response = await fetch(`${JOBS_API_URL}/companies/${companyId}/jobs?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data
  }

  return useQuery<Job[], Error>({
    queryKey: ['jobs', 'company', companyId, filters],
    queryFn: fetchCompanyJobs,
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId,
  })
}

export const useJobsForBusiness = (companyId: number, jobId: number) => {
  const fetchJobForBusiness = async () => {
    const response = await fetch(`${JOBS_API_URL}/companies/${companyId}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data
  }
  return useQuery<Job, Error>({
    queryKey: ['job', 'business', companyId, jobId],
    queryFn: fetchJobForBusiness,
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId && !!jobId,
  })
}

export const useApplicantsForJob = (jobId?: number, filters?: { locations: string[], skills: string[], education: string }) => {
  const queryParams = new URLSearchParams()
  const locations = filters?.locations || []
  locations.forEach(location => queryParams.append('locations', location))
  const skills = filters?.skills || []
  skills.forEach(skill => queryParams.append('skills', skill))
  if (filters?.education && filters.education !== 'Any') 
    queryParams.append('educationLevel', getEducationLevel(filters.education) ?? '')
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
    const response = await fetch(`${USER_PROFILE_API_URL}/appliedJobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': `Bearer ${token}`
      },
    })
    const data = await response.json()
    console.log("Job Application Data:", data);
    return data
  }

  return useQuery<Application | Error>({
    queryKey: ['job', jobId, 'application'],
    queryFn: fetchJobApplication,
    staleTime: 1000 * 60 * 5,
    enabled: !!jobId,
  })
}
