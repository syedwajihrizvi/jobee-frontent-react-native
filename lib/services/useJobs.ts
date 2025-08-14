import { Job, JobFilters } from '@/type';
import { useQuery } from '@tanstack/react-query';

const JOBS_API_URL = `http://10.0.0.135:8080/jobs`;
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