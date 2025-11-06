import { Application, CandidateForJob, CreateApplication, CreateJobForm } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const APPLICATION_API_URL = 'http://192.168.2.29:8080/applications'
const JOBS_API_URL = 'http://192.168.2.29:8080/jobs'
const USER_PROFILE_API_URL = 'http://192.168.2.29:8080/profiles'

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

export const quickApplyToJob = async (jobId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const result = await fetch(`${APPLICATION_API_URL}/quickApply`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
    })
    if (result.status !== 201) return null;
    const data = await result.json();
    return data as Application;
}

export const quickApplyBatch = async (jobIds: number[]) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const result = await fetch(`${APPLICATION_API_URL}/quickApplyBatch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({ jobIds })
    })
    if (result.status !== 200) return null;
    const data = await result.json();
    return data.applications as Application[];
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

// TODO: Remove business account id since token will be used
export const createJob = async (createJobForm: CreateJobForm, businessAccountId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const result = await fetch(`${JOBS_API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({ ...createJobForm, businessAccountId })
    })
    if (result.status !== 201) return null;
    const data = await result.json();
    return data;
}

export const getUserAppliedJobs = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const result = await fetch(`${USER_PROFILE_API_URL}/appliedJobs`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (result.status !== 200) return null;
    const data = await result.json();
    return data;
}

export const addViewToJobs = async (jobId: number) => {

    try {
        const result = await fetch(`${JOBS_API_URL}/${jobId}/views`, {
            method: 'PATCH'
        })
        console.log("Status of View: " + result.status)
    } catch (error) {
        console.error("Error adding view to job:", error)
    }
}    

export const checkJobMatchForUser = async (jobId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const result = await fetch(`${JOBS_API_URL}/${jobId}/check-match`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (result.status !== 200) return null;
    const data = await result.json();
    return { matchPercentage: data.match };
}

export const getCandidatesForJob = async (jobId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const result = await fetch(`${JOBS_API_URL}/${jobId}/find-candidates`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (result.status !== 200) return null;
    const data = await result.json();
    return data as CandidateForJob[];
}

export const getAIJobInsights = async (jobId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const result = await fetch(`${JOBS_API_URL}/${jobId}/ai-insights`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (result.status !== 200) return null;
    const data = await result.json();
    console.log("AI Insights Data: ", data);
    return data as string[];
}