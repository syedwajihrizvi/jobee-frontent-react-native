import { InterviewPrepQuestion } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const INTERVIEWS_API_URL = 'http://192.168.2.29:8080/interviews'

export const useInterviewQuestions = ({interviewId}: {interviewId: number}) => {
    const fetchInterviewQuestion = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/prepare/questions`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }

    return useQuery<InterviewPrepQuestion[], Error>({
        queryKey: ['interview-questions', interviewId],
        queryFn: fetchInterviewQuestion
    })
}