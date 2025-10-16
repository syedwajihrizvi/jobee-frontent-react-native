import { InterviewDetails } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const INTERVIEWS_API_URL = 'http://192.168.2.29:8080/interviews'

export const useBusinessProfileInterviews = () => {
    const fetchBusinessProfileInterviews = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${INTERVIEWS_API_URL}/business`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        console.log(response)
        const data = await response.json();
        console.log(data)
        return data;
    }

    return useQuery<InterviewDetails[], Error>({
        queryKey: ['business-profile-interviews'],
        queryFn: fetchBusinessProfileInterviews
    })
}