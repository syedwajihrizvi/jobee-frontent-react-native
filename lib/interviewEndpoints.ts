import { CreateInterviewForm, InterviewDetails, InterviewerProfileSummary, InterviewPrepQuestion } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { extract24HourTime } from "./utils";

const INTERVIEWS_API_URL = 'http://192.168.2.29:8080/interviews'
const BUSINESS_PROFILES_API_URL = 'http://192.168.2.29:8080/business-profiles'

export const createInterview = async (
        interview: CreateInterviewForm, 
        jobId: number, 
        candidateId: number,
        applicationId: number,
        previousInterviewId: number
    ) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const startTime = extract24HourTime(interview.startTime)
    const endTime = extract24HourTime(interview.endTime)
    const timezone = interview.timezone.toUpperCase()
    const requestBody = {
        ...interview,
        jobId,
        candidateId,
        applicationId,
        startTime,
        endTime,
        timezone,
        previousInterviewId
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
    return true
}

export const getMostRecentInterviewForJob = async (jobId: number) : Promise<InterviewDetails | null> => {
    const result = await fetch(`${INTERVIEWS_API_URL}/job/${jobId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    console.log("Fetch most recent interview for job response status: ", result.status)
    if (result.status !== 200) return null
    const interview = await result.json()
    console.log("Fetched interviews for job:", interview)
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
    const url = `${BUSINESS_PROFILES_API_URL}?${queryParams.toString()}`
    console.log("Fetching interviewer profile from URL: ", url)
    const response = await fetch(`${BUSINESS_PROFILES_API_URL}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    console.log("Response status: ", response.status)
    if (response.status !== 200) return null
    const data = await response.json()
    console.log(data)
    return data as InterviewerProfileSummary
}