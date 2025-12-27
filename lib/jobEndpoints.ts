import { getAPIUrl } from "@/constants";
import { Application, CandidateForJob, CreateApplication, CreateJobForm, HiringTeamMemberForm, Job } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const APPLICATION_API_URL = getAPIUrl('applications');
const JOBS_API_URL = getAPIUrl('jobs');
const USER_PROFILE_API_URL = getAPIUrl('profiles');

export const applyToJob = async (application: CreateApplication) => {
            const token = await AsyncStorage.getItem('x-auth-token');
            if (token == null) return null;
            const result = await fetch(`${APPLICATION_API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            },
            body: JSON.stringify(application)
            })
            if (result.status !== 201)
                return null;
            const response = await result.json();
            return response as Application;
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

export const createJob = async (
    createJobForm: CreateJobForm, 
    businessAccountId: number,
    hiringTeam: HiringTeamMemberForm[]) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const result = await fetch(`${JOBS_API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({ ...createJobForm, businessAccountId, hiringTeam })
    })
    if (result.status !== 201) return null;
    const data = await result.json();
    return data as Job;
}

export const updateJob = async (
    updateJobForm: CreateJobForm,
    jobId: number,
    hiringTeam: HiringTeamMemberForm[]
) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const result = await fetch(`${JOBS_API_URL}/${jobId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({ ...updateJobForm,  hiringTeam })
    })
    if (result.status !== 200) return null;
    const data = await result.json();
    return data as Job;
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

export const getAIJobInsights = async (jobId: number) => {4
    const result = await fetch(`${JOBS_API_URL}/${jobId}/ai-insights`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (result.status !== 200) return null;
    const data = await result.json();
    return data as string[];
}

export const getAIJobDescription = async (jobInfo: CreateJobForm) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null;
    const result = await fetch(`${JOBS_API_URL}/generate-ai-description`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(jobInfo)
    })
    if (result.status !== 200) return null;
    const data = await result.json();
    return data.aiGeneratedJobDescription as string;

}

export const updateJobOfferStatus = async (applicationId: number, status: boolean) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false;
    const res = await fetch(`${APPLICATION_API_URL}/${applicationId}/job-offer?accepted=${status}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    return res.ok;
}