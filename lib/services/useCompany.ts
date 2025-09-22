import { Company } from "@/type";
import { useQuery } from "@tanstack/react-query";

const COMPANIES_API_URL = `http://192.168.2.29:8080/api/companies`;
export const useCompany = (companyId?: number) => {
    const fetchCompany = async () => {
        const response = await fetch(`${COMPANIES_API_URL}/${companyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return data as Company;
    }

    return useQuery<Company, Error>({
        queryKey: ['company', companyId],
        queryFn: fetchCompany,
        enabled: !!companyId,
    })
}