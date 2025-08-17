
import * as DocumentPicker from 'expo-document-picker';
const USER_DOCS_API_URL = "http://10.0.0.135:8080/user-documents";

export const uploadUserDocument = async (
    document: DocumentPicker.DocumentPickerResult,
    documentType: string) => {
    // Simulate an API call
    const formData = new FormData();
    formData.append('document', {
        uri: document.assets![0].uri,
        name: document.assets![0].name,
        type: document.assets![0].mimeType,
    } as any)
    formData.append('documentType', documentType);
    const response = await fetch(
        USER_DOCS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        body: formData
    })
    console.log('Upload response:', response);
}