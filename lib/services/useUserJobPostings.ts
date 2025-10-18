import { Job } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const JOBS_API_URL = 'http://192.168.2.29:8080/jobs'

export const useUserJobPostings = (id: number, search: string) => {
    const fetchUserJobPostings = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${JOBS_API_URL}/businessUser?search=${search}`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }

    return useQuery<Job[], Error>({
        queryKey: ['user-job-postings', id, search],
        queryFn: fetchUserJobPostings
    })
}
    