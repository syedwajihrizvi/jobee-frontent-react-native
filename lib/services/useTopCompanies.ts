import { useQuery } from "@tanstack/react-query";

const COMPANIES_API_URL = `http://192.168.2.29:8080/api/companies`;

export const useTopCompanies = () => {
    const fetchTopCompanies = async () => {
        const response = await fetch(`${COMPANIES_API_URL}/top-hiring-companies`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return data as {id: number, name: string, jobCount: number}[];
    }

    return useQuery({
        queryKey: ['top-companies'],
        queryFn: fetchTopCompanies,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}