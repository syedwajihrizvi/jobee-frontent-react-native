import { getAPIUrl } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
const APPLICATIONS_API_URL = getAPIUrl('applications');
export const updateApplicationStatus = async (applicationId: number, status: string) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false;
    const result = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/updateStatus?status=${status}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    });
    return result.status === 200;
}