import { CreateInterviewForm, InterviewDetails } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { extract24HourTime } from "./utils";

const INTERVIEWS_API_URL = 'http://192.168.2.29:8080/interviews'
export const createInterview = async (
        interview: CreateInterviewForm, jobId: number, 
        candidateId: number,
        applicationId: number) => {
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

export const generateInterviewQuestionPrepTextToSpeech = async (interviewPrepId: number, questionId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return null
    const response = await fetch(`${INTERVIEWS_API_URL}/prep/${interviewPrepId}/questions/${questionId}/audio`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data as {questionAudioUrl: string}
}