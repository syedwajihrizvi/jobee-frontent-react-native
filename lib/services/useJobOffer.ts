import { getAPIUrl } from "@/constants";
import { JobOffer } from "@/type";
import { useQuery } from "@tanstack/react-query";

const APPLICATIONS_API_URL = getAPIUrl('applications');
export const useJobOffer = (applicationId: number) => {
    const fetchJobOffer = async () => {
        const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/job-offer`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return data as JobOffer;
    }

    return useQuery<JobOffer, Error>({
        queryKey: ['jobOffer', applicationId],
        queryFn: fetchJobOffer,
        enabled: !!applicationId,   
        })
    }