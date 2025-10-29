import { DropBoxPathContent, GoogleDrivePathContent, OneDrivePathContent } from "@/type";
import { create } from "zustand";

type OAuthDocState = {
    googleDriveFile: GoogleDrivePathContent | null;
    oneDriveFile: OneDrivePathContent | null;
    dropboxFile: DropBoxPathContent | null;
    setGoogleDriveFile: (file: GoogleDrivePathContent | null) => void;
    setOneDriveFile: (file: OneDrivePathContent | null) => void;
    setDropboxFile: (file: DropBoxPathContent | null) => void;
    resetState: () => void;
}
const useOAuthDocStore = create<OAuthDocState>((set) => ({
    googleDriveFile: null,
    oneDriveFile: null,
    dropboxFile: null,
    setGoogleDriveFile: (file) => set({ googleDriveFile: file }),
    setOneDriveFile: (file) => set({ oneDriveFile: file }),
    setDropboxFile: (file) => set({ dropboxFile: file }),
    resetState: () => set({ googleDriveFile: null, oneDriveFile: null, dropboxFile: null }),
}));

export default useOAuthDocStore