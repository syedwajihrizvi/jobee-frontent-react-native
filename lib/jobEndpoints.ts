import { Application, CreateApplication } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const APPLICATION_API_URL = 'http://10.0.0.135:8080/applications'

export const applyToJob = async (application: CreateApplication) => {
    return new Promise<Application | null>((resolve, reject) => {
        setTimeout(async () => {
            const token = await AsyncStorage.getItem('x-auth-token');
            if (token == null) return resolve(null);
            const result = await fetch(`${APPLICATION_API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            },
            body: JSON.stringify(application)
            })
            if (result.status !== 201)
                return resolve(null);
            const response = await result.json();
            return resolve(response as Application);
        }, 3000)
    })
}

export const shortListCandidate = async ({applicationId}: {applicationId: number}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false;
    const result = await fetch(`${APPLICATION_API_URL}/${applicationId}/shortList`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    return result.status === 200;
}

export const unshortListCandidate = async ({applicationId}: {applicationId: number}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false;
    const result = await fetch(`${APPLICATION_API_URL}/${applicationId}/unShortList`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    return result.status === 200;
}