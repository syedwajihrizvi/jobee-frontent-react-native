import AsyncStorage from "@react-native-async-storage/async-storage";
const APPLICATIONS_API_URL = 'http://192.168.2.29:8080/applications';
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
    console.log("Update application status response status: ", result.status);
    return result.status === 200;
}