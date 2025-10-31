
import { DropBoxPathContent, GoogleDrivePathContent, OneDrivePathContent } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { fetchDropboxFileAsPdfAndCreateTempFile } from './oauth/dropbox';
import { fetchGoogleDocAsPdfAndCreateTempFile } from './oauth/googledrive';
import { fetchOneDriveFileAsPdfAndCreateTempFile } from './oauth/onedrive';
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

export const uploadGoogleDriveDocumentToServer = async (
    document: File,
    documentType: string,
    documentTitle: string
) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData();
    const safeName = document.name
    ?.trim()
    .replace(/\s+/g, "_") 
    .replace(/[^a-zA-Z0-9._-]/g, "");
    
    formData.append('document', {
        uri: document.uri,
        name: safeName || 'document.pdf',
        type: "application/pdf",
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

export const uploadDropboxDocumentToServer = async (
    document: File,
    documentType: string,
    documentTitle: string,
    
) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData();
    const safeName = document.name
    ?.trim()
    .replace(/\s+/g, "_") 
    .replace(/[^a-zA-Z0-9._-]/g, "");
    
    formData.append('document', {
        uri: document.uri,
        name: safeName || 'document.pdf',
        type: "application/pdf",
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

export const uploadOneDriveDocumentToServer = async (
    document: File,
    documentType: string,
    documentTitle: string
) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData();
    const safeName = document.name
    ?.trim()
    .replace(/\s+/g, "_") 
    .replace(/[^a-zA-Z0-9._-]/g, "");
    
    console.log("Uploading OneDrive Document to Server:", { documentType, documentTitle, documentName: safeName });
    formData.append('document', {
        uri: document.uri,
        name: safeName || 'document.pdf',
        type: document.type,
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
    documentUrlType: 'GOOGLE_DRIVE' | 'DROPBOX' | 'ONE_DRIVE'
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
    console.log(response)
    if (response.status !== 201)
        return false
    return true
}

export const processGoogleDriveUpload = async (googleDriveFile: GoogleDrivePathContent, selectedDocumentType: string, documentTitle: string) => {
    const { id, name, mimeType } = googleDriveFile;
    const tempFile = await fetchGoogleDocAsPdfAndCreateTempFile(id, name, mimeType || "application/pdf");
    if (tempFile == null) {
    throw new Error("Failed to fetch the document from Google Drive.");
    }
    const title = documentTitle || name;
    const res = await uploadGoogleDriveDocumentToServer(tempFile, selectedDocumentType, title);
    return res
};

export const processDropboxUpload = async (dropboxFile: DropBoxPathContent, selectedDocumentType: string, documentTitle: string) => {
    const { id, name, mimeType, pathDisplay} = dropboxFile;
    console.log("Dropbox File Info:", { id, name, mimeType, pathDisplay });
    const tempFile = await fetchDropboxFileAsPdfAndCreateTempFile(id, name, mimeType || "application/pdf", pathDisplay);
    if (tempFile == null) {
        throw new Error("Failed to fetch the selected Dropbox file.");
    }
    const title = documentTitle || name
    const res = await uploadDropboxDocumentToServer(tempFile, selectedDocumentType, title);
    return res;
};

export const processOneDriveUpload = async (oneDriveFile: OneDrivePathContent, selectedDocumentType: string, documentTitle: string) => {
    const tempFile = await fetchOneDriveFileAsPdfAndCreateTempFile(oneDriveFile.downloadUrl!, oneDriveFile.name);
    console.log("OneDrive Temp File:", tempFile);
    if (tempFile == null) {
    throw new Error("Failed to fetch the selected OneDrive file.");
    }
    const title = documentTitle ||oneDriveFile.name;
    const res = await uploadOneDriveDocumentToServer(tempFile, selectedDocumentType, title);
    console.log("OneDrive Upload Result:", res);
    return res;
};