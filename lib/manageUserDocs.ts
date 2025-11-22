
import { getAPIUrl } from '@/constants';
import { DropBoxPathContent, GoogleDrivePathContent, OneDrivePathContent } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as ImagePicker from "expo-image-picker";
import { Alert } from 'react-native';
import { fetchDropboxFileAsPdfAndCreateTempFile } from './oauth/dropbox';
import { fetchGoogleDocAsPdfAndCreateTempFile } from './oauth/googledrive';
import { fetchOneDriveFileAsPdfAndCreateTempFile } from './oauth/onedrive';
import { isValidGoogleDriveLink } from './utils';

const USER_DOCS_API_URL = getAPIUrl('user-documents');

export const uploadUserDocument = async (
    document: DocumentPicker.DocumentPickerResult,
    documentType: string,
    documentTitle: string,
    generateSummary: boolean = false
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
    console.log(USER_DOCS_API_URL)
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

export const uploadUserDocumentViaImage = async (
    document: ImagePicker.ImagePickerResult,
    documentUri: string,
    documentType: string,
    documentTitle: string
) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData();
    const safeName = document.assets![0].fileName
    ?.trim()
    .replace(/\s+/g, "_") 
    .replace(/[^a-zA-Z0-9._-]/g, "");
    
    formData.append('documentImage', {
        uri: documentUri,
        name: safeName || 'document.jpg',
        type: document.assets![0].type || "image/jpeg",
    } as any)
    formData.append('documentType', documentType);
    formData.append('title', documentTitle);
    const response = await fetch(
        `${USER_DOCS_API_URL}/image`, {
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

export const uploadDropboxDocumentToServer = async (
    document: File,
    documentType: string,
    documentTitle: string,
    generateSummary: boolean = false
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
    documentTitle: string,
    generateSummary: boolean = false
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
    documentUrlType: 'GOOGLE_DRIVE' | 'DROPBOX' | 'ONE_DRIVE',
    generateSummary: boolean = false
) => {
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
            documentLink,
            documentType,
            documentTitle,
            documentUrlType: documentUrlType
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
    if (tempFile == null) {
    throw new Error("Failed to fetch the selected OneDrive file.");
    }
    const title = documentTitle ||oneDriveFile.name;
    const res = await uploadOneDriveDocumentToServer(tempFile, selectedDocumentType, title);
    return res;
};

export const handleGoogleDriveUpload = async (googleDriveFile: GoogleDrivePathContent | null, documentType: string, documentTitle: string) => {
    if (!googleDriveFile) return;
    try {
      const res = await processGoogleDriveUpload(googleDriveFile, documentType, documentTitle);
      return res;
    } catch (error) {
      Alert.alert("Error", "An error occurred while uploading the Google Drive document.");
    }
    return null;
}

export const handleDropboxUpload = async (dropboxFile: DropBoxPathContent | null, documentType: string, documentTitle: string) => {
    if (!dropboxFile) return;
    try {
      const res = await processDropboxUpload(dropboxFile, documentType, documentTitle);
      return res;
    } catch (error) {
      Alert.alert("Error", "An error occurred while uploading the Dropbox document.");
    }
    return null;
}

export const handleOneDriveUpload = async (oneDriveFile: OneDrivePathContent | null, documentType: string, documentTitle: string) => {
    if (!oneDriveFile) return;
    try {
      const res = await processOneDriveUpload(oneDriveFile, documentType, documentTitle);
      return res;
    } catch (error) {
      Alert.alert("Error", "An error occurred while uploading the OneDrive document.");
    }
    return null;
}

export const uploadResume = async (uploadMethod: string, uploadedDocument: DocumentPicker.DocumentPickerResult | null, documentLink: string | null, googleDriveFile: GoogleDrivePathContent | null, dropboxFile: DropBoxPathContent | null, oneDriveFile: OneDrivePathContent | null, selectedDocumentType: string, documentTitle: string) => {
      if (uploadMethod === "DIRECT_UPLOAD" && uploadedDocument) {
        uploadUserDocument(uploadedDocument, selectedDocumentType, documentTitle)
          .then(() => console.log("Direct document upload completed"))
          .catch((error) => console.error("Error uploading document:", error));
      } else if (uploadMethod === "LINK_INPUT") {
        if (!documentLink || documentLink.trim() !== "") return;
        const documentLinkType = isValidGoogleDriveLink(documentLink) ? "GOOGLE_DRIVE" : "DROPBOX";
        sendDocumentLinkToServer(documentLink, selectedDocumentType, documentTitle, documentLinkType)
          .then(() => console.log("Document link sent successfully"))
          .catch((error) => console.error("Error sending document link:", error));
      } else if (uploadMethod === "GOOGLE_DRIVE") {
        handleGoogleDriveUpload(googleDriveFile, selectedDocumentType, documentTitle)
          .then(() => console.log("Google Drive upload completed"))
          .catch((error) => console.error("Error with Google Drive upload:", error));
      } else if (uploadMethod === "DROPBOX") {
        handleDropboxUpload(dropboxFile, selectedDocumentType, documentTitle)
          .then(() => console.log("Dropbox upload completed"))
          .catch((error) => console.error("Error with Dropbox upload:", error));
      } else if (uploadMethod === "ONEDRIVE") {
        handleOneDriveUpload(oneDriveFile, selectedDocumentType, documentTitle)
          .then(() => console.log("OneDrive upload completed"))
          .catch((error) => console.error("Error with OneDrive upload:", error));
      }
}