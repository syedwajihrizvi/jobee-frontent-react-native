import { getAPIUrl } from "@/constants";
import { CompanyMember, PagedResponse } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useInfiniteQuery } from "@tanstack/react-query";

const BUSINESS_ACCOUNT_API_URL = getAPIUrl('business-accounts');

export const useCompanyMembers = (companyId: number, page: number, searchQuery: string, userTypeFilter: "ALL" | "ADMIN" | "RECRUITER" | "EMPLOYEE") => {
    const queryParams = new URLSearchParams();
    queryParams.append('pageNumber', page.toString());
    if (searchQuery) {
        queryParams.append('search', searchQuery);
    }
    if (userTypeFilter && userTypeFilter !== "ALL") {
        queryParams.append('role', userTypeFilter);
    }
    const params = queryParams.toString();
    const fetchCompanyMembers = async () => {
        const token = await AsyncStorage.getItem('x-auth-token')
        const response = await fetch(`${BUSINESS_ACCOUNT_API_URL}/company/${companyId}/members?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": `Bearer ${token}`,
            },
        });
        const data: PagedResponse<CompanyMember> = await response.json();
        return { members: data.content, nextPage: page+1, hasMore: data.hasMore, totalElements: data.totalElements };
    }

    return useInfiniteQuery<{members: CompanyMember[]; nextPage: number, hasMore: boolean; totalElements: number}, Error>({
        queryKey: ['company-members', companyId, page, searchQuery, userTypeFilter],
        queryFn: fetchCompanyMembers,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
          return lastPage.hasMore ? lastPage.nextPage : undefined
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    })
}