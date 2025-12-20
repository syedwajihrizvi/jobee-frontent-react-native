import { getAPIUrl } from "@/constants";
import { CreateInterviewForm, InterviewDetails, InterviewerProfileSummary, InterviewPrepQuestion, RequestRescheduleInterviewForm } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { extract24HourTime } from "./utils";

const INTERVIEWS_API_URL = getAPIUrl('interviews'); 
const BUSINESS_PROFILES_API_URL = getAPIUrl('business-profiles');

export const createInterview = async (
    {interview, jobId, candidateId, applicationId, previousInterviewId, meetingCreationResult}: 
    {interview: CreateInterviewForm, jobId: number, candidateId: number, 
    applicationId: number, previousInterviewId?: number, meetingCreationResult?: any}

    ) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const startTime = extract24HourTime(interview.startTime)
    const endTime = extract24HourTime(interview.endTime)
    const phoneNumber = interview.phoneNumber.replace(/\D/g, '');
    const timezone = interview.timezone?.value.toUpperCase()
    const requestBody = {
        ...interview,
        jobId,
        candidateId,
        applicationId,
        startTime,
        endTime,
        phoneNumber,
        timezone,
        previousInterviewId,
        zoomMeetingDetails: null,
        googleMeetingDetails: null,
    }
    if (meetingCreationResult && interview.interviewType === "ONLINE") {
        if (interview.meetingPlatform === 'ZOOM') {
            requestBody.zoomMeetingDetails = meetingCreationResult
        }
        if (interview.meetingPlatform === 'GOOGLE_MEET') {
            requestBody.googleMeetingDetails = meetingCreationResult
        }
    }
    const result = await fetch(`${INTERVIEWS_API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    })
    if (result.status !== 201) return null
    const data = await result.json()
    return data as InterviewDetails
}

export const updateInterview = async (
    {interviewId, meetingCreationResult, interview}: 
    {interviewId: number, meetingCreationResult?: any, interview: CreateInterviewForm}

    ) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const startTime = extract24HourTime(interview.startTime)
    const endTime = extract24HourTime(interview.endTime)
    const phoneNumber = interview.phoneNumber.replace(/\D/g, '');
    const timezone = interview.timezone?.value.toUpperCase()
    const requestBody = {
        ...interview,
        startTime,
        endTime,
        phoneNumber,
        timezone,
        zoomMeetingDetails: null,
        googleMeetingDetails: null,
    }
    if (meetingCreationResult && interview.interviewType === "ONLINE") {
        if (interview.meetingPlatform === 'ZOOM') {
            requestBody.zoomMeetingDetails = meetingCreationResult
        }
        if (interview.meetingPlatform === 'GOOGLE_MEET') {
            requestBody.googleMeetingDetails = meetingCreationResult
        }
    }
    const result = await fetch(`${INTERVIEWS_API_URL}/${interviewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    })
    if (!result.ok) return null
    const data = await result.json()
    return data as InterviewDetails
}

export const getMostRecentInterviewForJob = async (jobId: number) : Promise<InterviewDetails | null> => {
    const result = await fetch(`${INTERVIEWS_API_URL}/job/${jobId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (result.status !== 200) return null
    const interview = await result.json()
    // get the first one as it is the most recent one
    return interview[0] as InterviewDetails
}

export const prepareForInterview = async (interviewId: number) : Promise<boolean> => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false
    const result = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/prepare`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    return result.status === 200
}

export const generateInterviewQuestionPrepTextToSpeech = async (interviewId: number, questionId: number) => {
    console.log("Generating TTS for interview prep id: ", interviewId, " questionId: ", questionId)
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const response = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/prepare/questions/${questionId}/question/text-to-speech`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data as {questionAudioUrl: string}
}

export const generateInterviewQuestionSpeechToText = async (
    interviewId: number, questionId: number, uri: string) : Promise<InterviewPrepQuestion | null> => {
    console.log("Generating STT for interview prep id: ", interviewId, " questionId: ", questionId)
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const formData = new FormData();
    formData.append('audioFile', {
        uri,
        type: 'audio/m4a',
        name: `answer-${questionId}.m4a`
    } as any)
    const response = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/prepare/questions/${questionId}/answer/speech-to-text`, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': `Bearer ${token}`
        },
        body: formData
    })
    const data = await response.json()
    return data as InterviewPrepQuestion
}

export const getFeedbackForAnswer = async (
    intervieId: number, questionId: number, uri: string) : Promise<InterviewPrepQuestion | null> => {
        console.log("Getting feedback for interview id: ", intervieId, " questionId: ", questionId)
        const token = await AsyncStorage.getItem('x-auth-token');
        if (token == null) return null
        const formData = new FormData();
        formData.append('audioFile', {
            uri,
            type: 'audio/m4a',
            name: `answer-feedback-${questionId}.m4a`
        } as any)
        const response = await fetch(`${INTERVIEWS_API_URL}/${intervieId}/prepare/questions/${questionId}/answer/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-auth-token': `Bearer ${token}`
            },
            body: formData
        })
        const data = await response.json()
        return data as InterviewPrepQuestion
}

export const getInterviewerProfileSummary = async (email: string) : Promise<InterviewerProfileSummary | null> => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const queryParams = new URLSearchParams({ email });
    const response = await fetch(`${BUSINESS_PROFILES_API_URL}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (response.status !== 200) return null
    const data = await response.json()
    return data as InterviewerProfileSummary
}

export const markInterviewAsCompleted = async (interviewId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false
    const response = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/mark-as-completed`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    return response.status === 200
}

export const cancelScheduledInterview = async (interviewId: number, reason: string) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false
    const res = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/cancel`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({
            cancellationReason: reason
        })
    })
    return res.status === 200
}

export const rejectCandidateInterview = async (interviewId: number, reason: string, feedback: string) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false
    const res = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/reject-candidate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({
            reason,
            feedback
        })
    })
    return res.status === 200
}

export const requestRescheduleInterview = async ({interviewId, request} : {interviewId: number, request: RequestRescheduleInterviewForm}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false
    const {startTime, interviewDate, reason, timezone} = request
    const res = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/request-reschedule`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({
            startTime: extract24HourTime(startTime),
            interviewDate,
            reason,
            timezone: timezone?.value.toUpperCase(),
        })
    })
    return res.status === 200
}

export const emailInterviewPrepResources = async (interviewId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false
    const res = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/prepare/email-resources`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    console.log("Email Resources Response:", res); // Debug log
    return res.ok
}