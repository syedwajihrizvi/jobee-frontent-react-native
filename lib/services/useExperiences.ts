import { Experience } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const USER_EDUCATION_API = `http://192.168.2.29:8080/profiles/experiences`;

export const useExperiences = () => {
    const fetchSkillsByUser = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${USER_EDUCATION_API}/my-experiences`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
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