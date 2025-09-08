import { UserDocument } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const DOCUMENTS_API_URL = `http://10.0.0.135:8080/user-documents`;

export const useDocuments = () => {
    const fetchDocumentsByUser = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${DOCUMENTS_API_URL}/user/me`, {
            headers: {
                'x-auth-token': `Bearer ${token}` || ''
            }
        });
        const data = await response.json();
        return data;
    }
    return useQuery<UserDocument[], Error>({
        queryKey: ['documents', 'user'],
        queryFn: fetchDocumentsByUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}