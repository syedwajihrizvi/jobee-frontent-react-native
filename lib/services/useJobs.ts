import { Job, JobFilters } from '@/type';
import { useQuery } from '@tanstack/react-query';

const JOBS_API_URL = `http://10.0.0.135:8080/jobs`;
const APPLICATIONS_API_URL = `http://10.0.0.135:8080/applications`;

export const useJobs = (jobFilters: JobFilters) => {
    const { search, location, company, distance, salary, experience } = jobFilters
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (location) queryParams.append('location', location)
    if (company) queryParams.append('company', company)
    if (distance !== undefined) queryParams.append('distance', Math.round(distance).toString())
    if (salary !== undefined) queryParams.append('salary', Math.round(salary).toString())
    if (experience !== undefined) queryParams.append('experience', Math.round(experience).toString())
    
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

export const useJobsByCompany = (companyId?: number) => {
  const fetchCompanyJobs = async () => {
    const response = await fetch(`${JOBS_API_URL}/companies/${companyId}/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data
  }

  return useQuery<Job[], Error>({
    queryKey: ['jobs', 'company', companyId],
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
    console.log(data)
    return data
  }
  return useQuery<Job, Error>({
    queryKey: ['job', 'business', companyId, jobId],
    queryFn: fetchJobForBusiness,
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId && !!jobId,
  })
}