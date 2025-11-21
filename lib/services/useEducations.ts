import { getAPIUrl } from "@/constants";
import { Education } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const USER_EDUCATION_API = getAPIUrl('profiles/education');

export const useEducations = () => {
    const fetchEducationsForUser = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${USER_EDUCATION_API}/my-education`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }

    return useQuery<Education[], Error>({
        queryKey: ['education', 'user'],
        queryFn: fetchEducationsForUser
    })
}