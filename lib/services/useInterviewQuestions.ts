import { InterviewPrepQuestion } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const INTERVIEWS_API_URL = 'http://192.168.2.29:8080/interviews'

export const useInterviewQuestion = ({interviewId, questionId}: {interviewId: number, questionId: number}) => {
    console.log("Using useInterviewQuestion with interviewId:", interviewId, " questionId:", questionId);
    const fetchInterviewQuestion = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/prepare/questions/${questionId}`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }

    return useQuery<InterviewPrepQuestion, Error>({
        queryKey: ['interview-question', interviewId, questionId],
        queryFn: fetchInterviewQuestion
    })
}