import { getAPIUrl } from "@/constants";
import { InterviewPreparation } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const INTERVIEWS_API_URL = getAPIUrl("interviews");

export const useInterviewPrep = ({interviewId}: {interviewId: number}) => {
    const fetchInterviewPreparation = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${INTERVIEWS_API_URL}/${interviewId}/prepare`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }

    return useQuery<InterviewPreparation, Error>({
        queryKey: ['interview-preparation', interviewId],
        queryFn: fetchInterviewPreparation
    })
}