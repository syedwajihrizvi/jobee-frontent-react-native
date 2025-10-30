import { DropBoxPathContent, GoogleDrivePathContent, OneDrivePathContent, SelectedUploadMethod } from "@/type";
import * as DocumentPicker from "expo-document-picker";
import { create } from "zustand";

type ProfileCompleteState = {
    uploadMethod: SelectedUploadMethod;
    documentTitle: string;
    uploadedDocument: DocumentPicker.DocumentPickerResult | null;
    documentLink: string;
    googleDriveFile: GoogleDrivePathContent | null;
    dropboxFile: DropBoxPathContent | null;
    oneDriveFile: OneDrivePathContent | null;
    setUploadMethod: (method: SelectedUploadMethod) => void;
    setDocumentTitle: (title: string) => void;
    setUploadedDocument: (document: DocumentPicker.DocumentPickerResult | null) => void;
    setDocumentLink: (link: string) => void;
    setGoogleDriveFile: (file: GoogleDrivePathContent | null) => void;
    setDropboxFile: (file: DropBoxPathContent | null) => void;
    setOneDriveFile: (file: OneDrivePathContent | null) => void;
    resetState: () => void;
}

const useCompleteProfileStore = create<ProfileCompleteState>((set) => ({
    uploadMethod: null,
    documentTitle: "",
    uploadedDocument: null,
    documentLink: "",
    googleDriveFile: null,
    dropboxFile: null,
    oneDriveFile: null,
    setUploadMethod: (method) => set({ uploadMethod: method }),
    setDocumentTitle: (title) => set({ documentTitle: title }),
    setUploadedDocument: (document) => set({ uploadedDocument: document }),
    setDocumentLink: (link) => set({ documentLink: link }),
    setGoogleDriveFile: (file) => set({ googleDriveFile: file }),
    setDropboxFile: (file) => set({ dropboxFile: file }),
    setOneDriveFile: (file) => set({ oneDriveFile: file }),
    resetState: () => set({
        uploadMethod: null,
        documentTitle: "",
        uploadedDocument: null,
        documentLink: "",
        googleDriveFile: null,
        dropboxFile: null,
        oneDriveFile: null,
    }),
}));

export default useCompleteProfileStore