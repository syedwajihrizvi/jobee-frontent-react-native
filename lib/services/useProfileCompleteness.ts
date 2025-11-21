import { getAPIUrl } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const PROFILES_API_URL = getAPIUrl('profiles');

export const useProfileCompleteness = () => {
    const fetchProfileCompleteness = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (token == null) return null;
        const result = await fetch(`${PROFILES_API_URL}/profile-completeness`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            },
        })
        if (result.status !== 200) return null;
        const data = await result.json();
        return data as { completeness: number };
    }

    return useQuery({
        queryKey: ['profile-completeness'],
        queryFn: fetchProfileCompleteness,
        staleTime: 1000 * 60 * 120, // 2 hours
    })
}