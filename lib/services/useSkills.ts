import { UserSkill } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const USER_SKILL_API = `http://192.168.2.29:8080/profiles/skills`;

export const useSkills = () => {
    const fetchSkillsByUser = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${USER_SKILL_API}/my-skills`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }

    return useQuery<UserSkill[], Error>({
        queryKey: ['skills', 'user'],
        queryFn: fetchSkillsByUser,
        staleTime: 1000 * 60 * 60, // 1 hour for now
    })
}