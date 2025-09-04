import { ApplicationDetailsForBusiness, InterviewDetails, InterviewSummary } from "@/type";
import { useQuery } from "@tanstack/react-query";

const APPLICATIONS_API_URL = `http://10.0.0.135:8080/applications`;
const INTERVIEWS_API_URL = `http://10.0.0.135:8080/interviews`;

export const useApplicant = (applicantId?: number) => {
    const fetchApplicant = async () => {
        const response = await fetch(`${APPLICATIONS_API_URL}/${applicantId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await response.json()
        return data
    }
    return useQuery<ApplicationDetailsForBusiness, Error>({
        queryKey: ['applicant', applicantId],
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
        const response = await fetch(`${INTERVIEWS_API_URL}/${interviewId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json()
        console.log(data)
        return data
    }
    return useQuery<InterviewDetails, Error>({
        queryKey: ['interviewDetails', interviewId],
        queryFn: fetchInterviewDetails,
        staleTime: 1000 * 60 * 5,
        enabled: !!interviewId,
    })
}