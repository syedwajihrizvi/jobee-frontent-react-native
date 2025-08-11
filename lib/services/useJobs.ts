import { Job } from '@/type';
import { useQuery } from '@tanstack/react-query';

const JOBS_API_URL = "http://192.168.2.29:8080/jobs";
export const useJobs = () => {
    const fetchJobs = async () => {
        const response = await fetch(JOBS_API_URL)
        const data = await response.json()
        return data
    }
    return useQuery<Job[], Error>({
        queryKey: ['jobs'],
        queryFn: fetchJobs,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}