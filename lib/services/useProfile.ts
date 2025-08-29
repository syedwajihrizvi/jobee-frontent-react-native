import { ApplicationDetailsForBusiness } from "@/type";
import { useQuery } from "@tanstack/react-query";

const APPLICATIONS_API_URL = `http://10.0.0.135:8080/applications`;

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