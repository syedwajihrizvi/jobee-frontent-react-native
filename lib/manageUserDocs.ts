
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
const USER_DOCS_API_URL = "http://192.168.2.29:8080/user-documents";

export const uploadUserDocument = async (
    document: DocumentPicker.DocumentPickerResult,
    documentType: string,
    documentTitle: string
    ) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData();
    const safeName = document.assets![0].name
    ?.trim()
    .replace(/\s+/g, "_") 
    .replace(/[^a-zA-Z0-9._-]/g, "");
    
    formData.append('document', {
        uri: document.assets![0].uri,
        name: safeName || 'document.pdf',
        type: document.assets![0].mimeType,
    } as any)
    formData.append('documentType', documentType);
    formData.append('title', documentTitle);
    const response = await fetch(
        USER_DOCS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': `Bearer ${token}`,
        },
        body: formData
    })
    if (response.status !== 201)
        return false
    return true
}
