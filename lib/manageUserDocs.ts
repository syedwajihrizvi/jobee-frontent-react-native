
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

export const sendDocumentLinkToServer = async (
    documentLink: string,
    documentType: string,
    documentTitle: string,
    documentUrlType: 'GOOGLE_DRIVE' | 'DROPBOX'
) => {
    console.log('Sending document link to server:', { documentLink, documentType, documentTitle, documentUrlType });
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const response = await fetch(
        USER_DOCS_API_URL + '/link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`,
        },
        body: JSON.stringify({
            documentLink: "https://www.dropbox.com/scl/fi/f8hpvxqu27rxle8yl01v6/Resume.pdf?rlkey=77bwp4zn0o577vptz2jzx074y&st=xwpefrcw&dl=0",
            documentType,
            documentTitle,
            documentUrlType: 'DROPBOX'
        })
    })
    if (response.status !== 201)
        return false
    return true
}