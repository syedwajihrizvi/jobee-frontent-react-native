import { CreateInterviewForm } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { extract24HourTime } from "./utils";

const INTERVIEWS_API_URL = 'http://10.0.0.135:8080/interviews'
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