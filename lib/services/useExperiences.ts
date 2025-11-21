import { getAPIUrl } from "@/constants";
import { Experience } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const USER_EXPERIENCES_API = getAPIUrl('profiles/experiences');

export const useExperiences = () => {
    const fetchSkillsByUser = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${USER_EXPERIENCES_API}/my-experiences`, {
            headers: {
                'x-auth-token': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data;
    }

    return useQuery<Experience[], Error>({
        queryKey: ['experience', 'user'],
        queryFn: fetchSkillsByUser
    })
}