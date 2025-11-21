import { getAPIUrl } from "@/constants";
import { Project } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const USER_PROJECTS_API = getAPIUrl('profiles/projects');

export const useProjects= () => {
    const fetchProjectsForUser = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${USER_PROJECTS_API}/my-projects`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }

    return useQuery<Project[], Error>({
        queryKey: ['projects', 'user'],
        queryFn: fetchProjectsForUser
    })
}