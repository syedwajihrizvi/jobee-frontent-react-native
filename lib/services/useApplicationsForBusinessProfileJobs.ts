import { ApplicationSummary } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const APPLICATIONS_API_URL = 'http://192.168.2.29:8080/applications'

export const useApplicationsForBusinessProfileJobs = ({userId}: {userId: number | undefined}) => {
    const fetchApplicationsForBusinessProfileJobs = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) return null;
        const response = await fetch(`${APPLICATIONS_API_URL}/me?pending=true`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        })
        const data = await response.json();
        return data
    }

    return useQuery<ApplicationSummary[], Error>({
        queryKey: ['application-for-business-profile', userId],
        queryFn: fetchApplicationsForBusinessProfileJobs,
        enabled: !!userId
    })
}

export default useApplicationsForBusinessProfileJobs;