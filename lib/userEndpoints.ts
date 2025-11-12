import { Application, InterviewDetails } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const APPLICATIONS_API_URL = `http://192.168.2.29:8080/applications`;
const INTERVIEWS_API_URL = `http://192.168.2.29:8080/interviews`;

export const getUserInterviews = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    if (!token) return []
    const response = await fetch(`${INTERVIEWS_API_URL}/candidate/me`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data as InterviewDetails[];
}

export const getUserApplications = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    if (!token) return []
    const response = await fetch(`${APPLICATIONS_API_URL}/user/me`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data as Application[];
}