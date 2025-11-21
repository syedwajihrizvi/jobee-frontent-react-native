import { getAPIUrl } from "@/constants";
import { User } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const USER_PROFILE_API_URL = getAPIUrl('profiles');

export const useUserProfileForBusiness = (userId: number) => {
    const fetchUserProfile = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${USER_PROFILE_API_URL}/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            },
        })
        const data = await response.json();
        return data
    }

    return useQuery<User, Error>({
        queryKey: ['userProfileForBusiness', userId],
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5,
        enabled: !!userId,
    })
}