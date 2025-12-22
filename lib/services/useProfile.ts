import { getAPIUrl } from "@/constants";
import { ApplicationDetailsForBusiness, InterviewDetails, InterviewSummary } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const APPLICATIONS_API_URL = getAPIUrl('applications');
const INTERVIEWS_API_URL = getAPIUrl('interviews');

export const useApplicant = (applicantId?: number, jobId?: number, candidateId?: number) => {
    const fetchApplicant = async () => {
        if (!jobId && !candidateId) {
            const response = await fetch(`${APPLICATIONS_API_URL}/${applicantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json()
            return data
        } else {
            const response = await fetch(`${APPLICATIONS_API_URL}?jobId=${jobId}&userId=${candidateId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json()
            if (data.length === 0) {
                return null;
            }
            const res = data[0]
            return res as ApplicationDetailsForBusiness;
        }
    }
    return useQuery<ApplicationDetailsForBusiness, Error>({
        queryKey: ['applicant', applicantId, jobId, candidateId],
        queryFn: fetchApplicant,
        staleTime: 1000 * 60 * 5,
        enabled: !!applicantId,
    })
}

export const useProfileInterviews = (userId?: number) => {
    const fetchInterviewsForProfile = async () => {
        const response = await fetch(`${INTERVIEWS_API_URL}/candidate/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json()
        return data
    }
    return useQuery<InterviewSummary[], Error>({
        queryKey: ['profileInterviews', userId],
        queryFn: fetchInterviewsForProfile,
        staleTime: 1000 * 60 * 5,
        enabled: !!userId,
    })
}

export const useInterviewDetails = (interviewId?: number) => {
    const fetchInterviewDetails = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${INTERVIEWS_API_URL}/${interviewId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            }
        })
        const data = await response.json()
        return data
    }
    return useQuery<InterviewDetails, Error>({
        queryKey: ['interviewDetails', interviewId],
        queryFn: fetchInterviewDetails,
        staleTime: 1000 * 60 * 5,
        enabled: !!interviewId,

    })
}