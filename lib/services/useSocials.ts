import { SocialMedia } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const USER_SOCIALS_API = `http://192.168.2.29:8080/profiles/socialMedia`;
const BUSINESS_SOCIALS_API = `http://192.168.2.29:8080/business-profiles/socialMedia`;

export const useSocials = () => {
    const fetchSocialsForUser = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${USER_SOCIALS_API}/my-social-media`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }
    return useQuery<SocialMedia[], Error>({
        queryKey: ['socials', 'user'],
        queryFn: fetchSocialsForUser
    })
}

export const useBusinessSocials = () => {
    const fetchSocialsForUser = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${BUSINESS_SOCIALS_API}/my-social-media`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        console.log(response)
        const data = await response.json();
        console.log("Fetched business socials:", data);
        return data;
    }
    return useQuery<SocialMedia[], Error>({
        queryKey: ['businessSocials', 'user'],
        queryFn: fetchSocialsForUser
    })    
}