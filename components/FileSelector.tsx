import { UserDocumentType } from "@/constants";
import {
  handleDropboxUpload,
  handleGoogleDriveUpload,
  handleOneDriveUpload,
  sendDocumentLinkToServer,
  uploadResume,
  uploadUserDocument,
  uploadUserDocumentViaImage,
} from "@/lib/manageUserDocs";
import { connectToDropboxOAuth, isDropboxAccessTokenValid } from "@/lib/oauth/dropbox";
import { connectToGoogleDriveOAuth, isGoogleDriveAccessTokenValid } from "@/lib/oauth/googledrive";
import { connectToOneDriveOAuth, isOneDriveAccessTokenValid } from "@/lib/oauth/onedrive";
import { compressImage, converOAuthProviderToText, isValidGoogleDriveLink } from "@/lib/utils";
import useCompleteProfileStore from "@/store/completeProfile.store";
import useOAuthDocStore from "@/store/oauth-doc.store";
import useUserStore from "@/store/user.store";
import { SelectedUploadMethod } from "@/type";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropBoxFileSelector from "./DropBoxFileSelector";
import GoogleDriveFileSelector from "./GoogleDriveFileSelector";
import LinkInput from "./LinkInput";
import ModalWithBg from "./ModalWithBg";
import OneDriveFileSelector from "./OneDriveFileSelector";

type Props = {
  selectedDocumentType: string;
  handleUploadSuccess: () => void;
  customHandleUploadMethod?: boolean;
  customUploadMethod?: () => void;
};

const documentTypes = [
  { label: "Resume", value: UserDocumentType.RESUME, icon: "file-text", color: "#3b82f6" },
  { label: "Cover Letter", value: UserDocumentType.COVER_LETTER, icon: "mail", color: "#8b5cf6" },
  { label: "Certificate", value: UserDocumentType.CERTIFICATE, icon: "award", color: "#f59e0b" },
  { label: "Transcript", value: UserDocumentType.TRANSCRIPT, icon: "book", color: "#10b981" },
  { label: "Recommendation", value: UserDocumentType.RECOMMENDATION, icon: "star", color: "#ef4444" },
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const FileSelector = ({
  selectedDocumentType,
  handleUploadSuccess,
  customHandleUploadMethod = false,
  customUploadMethod,
}: Props) => {
  const { refetchUserDocuments, refetchCandidateInformation } = useUserStore();
  const [uploadView, setUploadView] = useState<"Direct" | "Cloud" | "Link">("Direct");
  const [uploadedDocument, setUploadedDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [isConnectedToGoogleDrive, setIsConnectedToGoogleDrive] = useState(false);
  const [isConnectedToDropbox, setIsConnectedToDropbox] = useState(false);
  const [isConnectedToOneDrive, setIsConnectedToOneDrive] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [showOauthPickerModal, setShowOauthPickerModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<"GOOGLE_DRIVE" | "DROPBOX" | "ONEDRIVE" | null>(null);
  const [selectedUploadMethod, setSelectedUploadMethod] = useState<SelectedUploadMethod>(null);
  const { googleDriveFile, oneDriveFile, dropboxFile, resetState } = useOAuthDocStore();
  const {
    setUploadMethod,
    setDocumentTitle: setDocumentTitleStore,
    setUploadedDocument: setUploadedDocumentStore,
    setDocumentLink: setDocumentLinkStore,
    setGoogleDriveFile,
    setDropboxFile,
    setOneDriveFile,
  } = useCompleteProfileStore();
  const [documentLink, setDocumentLink] = useState("");

  useEffect(() => {
    const checkGoogleDriveAccessToken = async () => {
      if (await isGoogleDriveAccessTokenValid()) {
        setIsConnectedToGoogleDrive(true);
      }
    };
    const checkDropboxAccessToken = async () => {
      if (await isDropboxAccessTokenValid()) {
        setIsConnectedToDropbox(true);
      }
    };
    const checkOneDriveAccessToken = async () => {
      if (await isOneDriveAccessTokenValid()) {
        setIsConnectedToOneDrive(true);
      }
    };
    checkGoogleDriveAccessToken();
    checkDropboxAccessToken();
    checkOneDriveAccessToken();
  }, []);
  const noFileSelected = () => {
    return (
      uploadedDocument == null &&
      selectedImage == null &&
      documentLink.trim() === "" &&
      !googleDriveFile &&
      !dropboxFile &&
      !oneDriveFile
    );
  };
  const handleUploadConfirmation = () => {
    if (noFileSelected()) {
      Alert.alert("No File Selected", "Please upload a document or provide a link.");
      return;
    }
    setShowConfirmationModal(true);
  };
  const handleDocImagePicker = async (noAccessMsg: string, uploadByPhotoMsg: string, uploadByGalleryMsg: string) => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.granted === false) {
      Alert.alert(noAccessMsg);
      return;
    }
    Alert.alert("Add new Document", "Choose an option", [
      {
        text: uploadByPhotoMsg,
        onPress: async () => {
          const cameraResult = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
            console.log("Image picked from camera:", cameraResult.assets[0]);
            setSelectedImage(cameraResult);
          }
          return;
        },
      },
      {
        text: uploadByGalleryMsg,
        onPress: async () => {
          const galleryResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!galleryResult.canceled && galleryResult.assets && galleryResult.assets.length > 0) {
            console.log("Image picked from gallery:", galleryResult.assets[0]);
            setSelectedImage(galleryResult);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };
  const handleUpload = async () => {
    setUploadingDocument(true);
    try {
      const document = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (document && !document.canceled && document.assets && document.assets.length > 0) {
        if (document.assets[0].size! > MAX_FILE_SIZE_BYTES) {
          Alert.alert(
            "File Too Large",
            "Please select a document smaller than 10 MB. Your file was " +
              formatFileSize(document.assets[0].size!) +
              "."
          );
          return;
        }
        setUploadedDocument(document);
      }
    } catch (error) {
      console.error("Error picking document: ", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    } finally {
      setUploadingDocument(false);
    }
  };
  const handleGoogleDrivePress = async () => {
    setActiveOAuthProvider("GOOGLE_DRIVE");
    if (!isConnectedToGoogleDrive) {
      try {
        const result = await connectToGoogleDriveOAuth();
        if (result) {
          setIsConnectedToGoogleDrive(true);
        } else {
          Alert.alert("Google Drive Connection Failed", "Unable to connect to Google Drive. Please try again.");
          return;
        }
      } catch (error) {
        console.log("Error during OneDrive OAuth");
      }
    }
    setShowOauthPickerModal(true);
  };

  const handleDropboxPress = async () => {
    setActiveOAuthProvider("DROPBOX");
    if (!isConnectedToDropbox) {
      try {
        const result = await connectToDropboxOAuth();
        if (result) {
          setIsConnectedToDropbox(true);
        } else {
          Alert.alert("Dropbox Connection Failed", "Unable to connect to Dropbox. Please try again.");
          return;
        }
      } catch {
        console.log("Error during Dropbox OAuth");
      } finally {
        console.log("Finish Dropbox OAuth");
      }
    }
    setShowOauthPickerModal(true);
  };

  const handleOnedrivePress = async () => {
    setActiveOAuthProvider("ONEDRIVE");
    if (!isConnectedToOneDrive) {
      try {
        const result = await connectToOneDriveOAuth();
        if (result) {
          setIsConnectedToOneDrive(true);
        } else {
          Alert.alert("OneDrive Connection Failed", "Unable to connect to OneDrive. Please try again.");
          return;
        }
      } catch (error) {
        console.log("Error during OneDrive OAuth");
      }
    }
    setShowOauthPickerModal(true);
  };
  const inferUploadMethod = () => {
    if (selectedUploadMethod) {
      return selectedUploadMethod;
    }
    if (selectedImage) return "IMAGE_UPLOAD";
    if (uploadedDocument) return "DIRECT_UPLOAD";
    if (documentLink.trim() !== "") return "LINK_INPUT";
    if (googleDriveFile) return "GOOGLE_DRIVE";
    if (dropboxFile) return "DROPBOX";
    if (oneDriveFile) return "ONEDRIVE";
    return null;
  };

  const handleDocumentUploadSubmit = async () => {
    const uploadMethod = inferUploadMethod();
    if (customHandleUploadMethod) {
      setSelectedImage(selectedImage);
      setUploadMethod(uploadMethod);
      setDocumentTitleStore(documentTitle);
      setUploadedDocumentStore(uploadedDocument);
      setDocumentLinkStore(documentLink);
      setGoogleDriveFile(googleDriveFile);
      setDropboxFile(dropboxFile);
      setOneDriveFile(oneDriveFile);
      setShowConfirmationModal(false);
      if (customUploadMethod) {
        customUploadMethod();
      }
      return;
    }
    setUploadingDocument(true);
    if (selectedDocumentType === "RESUME") {
      uploadResume(
        uploadMethod!,
        uploadedDocument,
        documentLink,
        googleDriveFile,
        dropboxFile,
        oneDriveFile,
        selectedDocumentType,
        documentTitle
      );
      handleUploadSuccess();
    } else {
      try {
        if (
          uploadMethod === "IMAGE_UPLOAD" &&
          selectedImage &&
          !selectedImage.canceled &&
          selectedImage.assets.length > 0
        ) {
          const compressedUri = await compressImage(selectedImage.assets[0].uri);
          const res = await uploadUserDocumentViaImage(
            selectedImage,
            compressedUri,
            selectedDocumentType,
            documentTitle
          );
          if (!res) {
            Alert.alert("Error", "Failed to upload image document. Please try again.");
            return;
          }
        } else if (uploadMethod === "DIRECT_UPLOAD" && uploadedDocument) {
          const res = await uploadUserDocument(uploadedDocument, selectedDocumentType, documentTitle);
          if (!res) {
            Alert.alert("Error", "Failed to upload document. Please try again.");
            return;
          }
        } else if (uploadMethod === "LINK_INPUT" && documentLink.trim() !== "") {
          if (!isValidGoogleDriveLink(documentLink) && !documentLink.includes("dropbox.com")) {
            Alert.alert("Invalid Link", "Please provide a valid Google Drive or Dropbox link.");
            return;
          }
          const documentLinkType = isValidGoogleDriveLink(documentLink) ? "GOOGLE_DRIVE" : "DROPBOX";
          const res = await sendDocumentLinkToServer(
            documentLink,
            selectedDocumentType,
            documentTitle,
            documentLinkType
          );
          if (!res) {
            Alert.alert("Error", "Failed to upload document link. Please try again.");
            return;
          }
        } else if (uploadMethod === "GOOGLE_DRIVE") {
          const res = await handleGoogleDriveUpload(googleDriveFile, selectedDocumentType, documentTitle);
          if (!res) {
            Alert.alert("Error", "An error occurred while uploading the Google Drive document.");
            return;
          }
        } else if (uploadMethod === "DROPBOX") {
          const res = await handleDropboxUpload(dropboxFile, selectedDocumentType, documentTitle);
          if (!res) {
            Alert.alert("Error", "An error occurred while uploading the Dropbox document.");
            return;
          }
        } else if (uploadMethod === "ONEDRIVE") {
          const res = await handleOneDriveUpload(oneDriveFile, selectedDocumentType, documentTitle);
          if (!res) {
            Alert.alert("Error", "An error occurred while uploading the OneDrive document.");
            return;
          }
        }
        resetForm();
        handleSuccessFullUpload();
      } catch (error) {
        console.error("Error uploading document:", error);
      } finally {
        setUploadingDocument(false);
      }
    }
  };

  const resetForm = () => {
    setDocumentTitle("");
    setUploadedDocument(null);
    setDocumentLink("");
    resetState();
  };

  const handleSuccessFullUpload = () => {
    if (selectedDocumentType === UserDocumentType.RESUME) {
      refetchCandidateInformation();
    } else {
      refetchUserDocuments();
    }
    setShowConfirmationModal(false);
    handleUploadSuccess();
    setShowOauthPickerModal(false);
  };
  const getFileIcon = (filename: string) => {
    if (filename.toLowerCase().includes(".pdf")) return "file-text";
    if (filename.toLowerCase().includes(".doc")) return "file-text";
    return "file";
  };
  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderUploadedImageInfo = () => {
    if (selectedImage && !selectedImage.canceled && selectedImage.assets && selectedImage.assets.length > 0) {
      const image = selectedImage.assets[0];
      return (
        <View
          className="bg-white border-2 border-blue-200 rounded-2xl p-6 mb-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="items-center">
            <View className="w-full max-w-xs aspect-[3/4] bg-gray-100 rounded-2xl mb-4 overflow-hidden border border-gray-200">
              <Image source={{ uri: image.uri }} className="w-full h-full" style={{ resizeMode: "cover" }} />
            </View>
            <View className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                  <Feather name="camera" size={16} color="white" />
                </View>
                <Text className="font-quicksand-bold text-blue-900 text-base">Image Captured</Text>
              </View>

              <View className="gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="font-quicksand-medium text-blue-700 text-sm">Dimensions:</Text>
                  <Text className="font-quicksand-bold text-blue-900 text-sm">
                    {image.width} × {image.height}
                  </Text>
                </View>

                {image.fileSize && (
                  <View className="flex-row justify-between items-center">
                    <Text className="font-quicksand-medium text-blue-700 text-sm">Size:</Text>
                    <Text className="font-quicksand-bold text-blue-900 text-sm">{formatFileSize(image.fileSize)}</Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center">
                  <Text className="font-quicksand-medium text-blue-700 text-sm">Type:</Text>
                  <Text className="font-quicksand-bold text-blue-900 text-sm">Image Document</Text>
                </View>
              </View>
            </View>
            <View className="bg-emerald-50 border border-green-200 rounded-xl px-4 py-3 mb-4 w-full">
              <View className="flex-row items-center justify-center gap-2">
                <Feather name="check-circle" size={16} color="#22c55e" />
                <Text className="font-quicksand-semibold text-green-700 text-sm">Image ready for upload!</Text>
              </View>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-xl p-4 flex-row items-center justify-center gap-2"
              style={{
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => handleDocImagePicker("Camera access needed!", "Take Photo", "Choose from Gallery")}
              activeOpacity={0.8}
            >
              <Feather name="camera" size={16} color="white" />
              <Text className="font-quicksand-bold text-white text-sm">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-500 rounded-xl p-4 flex-row items-center justify-center gap-2"
              style={{
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => setSelectedImage(null)}
              activeOpacity={0.8}
            >
              <Feather name="trash-2" size={16} color="white" />
              <Text className="font-quicksand-bold text-white text-sm">Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  const renderUploadedResumeInfo = () => {
    if (
      uploadedDocument &&
      !uploadedDocument.canceled &&
      uploadedDocument.assets &&
      uploadedDocument.assets.length > 0
    ) {
      const file = uploadedDocument.assets[0];
      return (
        <View
          className="bg-white border-2 border-green-200 rounded-2xl p-6 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="items-center">
            <View className="w-16 h-16 bg-emerald-100 rounded-2xl items-center justify-center mb-2">
              <Feather name={getFileIcon(file.name || "")} size={28} color="#22c55e" />
            </View>
            <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-1" numberOfLines={2}>
              {file.name || "Unknown file"}
            </Text>
            <Text className="font-quicksand-medium text-sm text-gray-500">
              {file.size ? formatFileSize(file.size) : "Size unknown"}
            </Text>
            <View className="bg-emerald-50 border border-green-200 rounded-xl px-3 py-2 mt-2 mb-2">
              <View className="flex-row items-center gap-2">
                <Feather name="check-circle" size={14} color="#22c55e" />
                <Text className="font-quicksand-semibold text-green-700 text-xs">Resume uploaded successfully!</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="bg-red-500 rounded-xl p-4 flex-row items-center justify-center gap-3"
            style={{
              shadowColor: "#ef4444",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={() => setUploadedDocument(null)}
            activeOpacity={0.8}
          >
            <Feather name="trash-2" size={18} color="white" />
            <Text className="font-quicksand-bold text-white text-base">Remove Document</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };
  const multipleUploadMethodsSelected = () => {
    let count = 0;
    if (selectedImage) count++;
    if (uploadedDocument) count++;
    if (documentLink.trim() !== "") count++;
    if (googleDriveFile) count++;
    if (dropboxFile) count++;
    if (oneDriveFile) count++;
    return count > 1;
  };
  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find((doc) => doc.value === type) || documentTypes[0];
  };
  const selectedDocInfo = getDocumentTypeInfo(selectedDocumentType);
  return (
    <>
      <View className="mb-2">
        <Text className="font-quicksand-bold text-base text-gray-900 mb-3">Document Title</Text>
        <TextInput
          className="border border-gray-200 rounded-xl p-4 font-quicksand-medium bg-white"
          autoCapitalize="words"
          style={{
            fontSize: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
          placeholder="e.g., Software Engineer Resume 2024"
          value={documentTitle}
          onChangeText={setDocumentTitle}
        />
      </View>
      {uploadedDocument?.assets?.[0]?.name && (
        <View
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-2"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
              <Feather name="check" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-emerald-800 text-sm">Document Selected</Text>
              <Text className="font-quicksand-medium text-emerald-700 text-xs" numberOfLines={1}>
                {uploadedDocument.assets[0].name}
              </Text>
            </View>
          </View>
        </View>
      )}
      <View className="mb-4">
        <Text className="font-quicksand-bold text-md text-gray-900 mb-2">Choose Upload Method</Text>
        <Text className="font-quicksand-medium text-sm text-gray-600 mb-2">
          Select how you would like to add your document
        </Text>
        <View className="flex-row gap-2 mb-4">
          {["Direct", "Cloud", "Link"].map((method) => (
            <TouchableOpacity
              key={method}
              onPress={() => setUploadView(method as "Direct" | "Cloud" | "Link")}
              className={`px-4 py-2 rounded-md border-2 ${
                uploadView === method ? "bg-emerald-500 border-emerald-500" : "bg-white border-emerald-200"
              }`}
              style={{
                shadowColor: uploadView === method ? "#10b981" : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: uploadView === method ? 0.2 : 0.05,
                shadowRadius: 4,
                elevation: uploadView === method ? 3 : 1,
              }}
              activeOpacity={0.8}
            >
              <Text
                className={`font-quicksand-semibold text-center text-sm ${
                  uploadView === method ? "text-white" : "text-emerald-600"
                }`}
              >
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {!uploadedDocument ? (
          <View className="space-y-4">
            {uploadView === "Direct" && (
              <View className="mb-6">
                <Text className="font-quicksand-semibold text-base text-gray-800 mb-3">📁 Direct Upload</Text>
                <View className="gap-3">
                  <TouchableOpacity
                    className="bg-white border-2 border-emerald-500 rounded-xl p-4 flex-row items-center justify-center gap-3"
                    style={{
                      shadowColor: "#10b981",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    onPress={handleUpload}
                    activeOpacity={0.8}
                  >
                    <Feather name="upload" size={18} color="#10b981" />
                    <Text className="font-quicksand-bold text-emerald-600 text-base">Upload from Device</Text>
                  </TouchableOpacity>
                  {selectedDocumentType !== UserDocumentType.RESUME &&
                    (!selectedImage ? (
                      <TouchableOpacity
                        className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center justify-center gap-3"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        onPress={() =>
                          handleDocImagePicker("Camera access needed!", "Take Photo", "Choose from Gallery")
                        }
                        activeOpacity={0.7}
                      >
                        <Feather name="camera" size={18} color="#6b7280" />
                        <Text className="font-quicksand-bold text-gray-700 text-base">Take Photo</Text>
                      </TouchableOpacity>
                    ) : (
                      renderUploadedImageInfo()
                    ))}
                </View>
              </View>
            )}
            {uploadView === "Cloud" && (
              <View className="mb-6">
                <Text className="font-quicksand-semibold text-base text-gray-800 mb-3">☁️ Cloud Storage</Text>
                <View className="gap-3">
                  <TouchableOpacity
                    className={`rounded-xl p-4 flex-row items-center gap-4 border-2 ${
                      isConnectedToGoogleDrive
                        ? "bg-blue-50 border-emerald-200"
                        : "bg-white border-dashed border-emerald-300"
                    }`}
                    style={{
                      shadowColor: "#4285F4",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isConnectedToGoogleDrive ? 0.15 : 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={handleGoogleDrivePress}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isConnectedToGoogleDrive ? "bg-emerald-100" : "bg-emerald-50 border border-emerald-200"
                      }`}
                    >
                      <AntDesign name="google" size={20} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-quicksand-bold text-base text-emerald-600">Google Drive</Text>
                        {!isConnectedToGoogleDrive && (
                          <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                            <Text className="font-quicksand-bold text-xs text-amber-600">Secure</Text>
                          </View>
                        )}
                      </View>
                      <Text className="font-quicksand-medium text-sm text-emerald-500">
                        {isConnectedToGoogleDrive
                          ? googleDriveFile
                            ? `Selected: ${googleDriveFile.name}`
                            : "Select a Google Drive File"
                          : "Connect to browse your Google Drive files"}
                      </Text>
                    </View>
                    {isConnectedToGoogleDrive && googleDriveFile && activeOAuthProvider === "GOOGLE_DRIVE" ? (
                      <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center">
                        <Feather name="check" size={12} color="white" />
                      </View>
                    ) : !isConnectedToGoogleDrive ? (
                      <View className="flex-row items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
                        <Feather name="plus" size={12} color="#10b981" />
                        <Text className="font-quicksand-bold text-xs text-emerald-600">Connect</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`rounded-xl p-4 flex-row items-center gap-4 border-2 ${
                      isConnectedToDropbox
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-dashed border-emerald-300"
                    }`}
                    style={{
                      shadowColor: "#0061FF",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isConnectedToDropbox ? 0.15 : 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={handleDropboxPress}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isConnectedToDropbox ? "bg-emerald-100" : "bg-emerald-50 border border-emerald-200"
                      }`}
                    >
                      <AntDesign name="dropbox" size={20} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-quicksand-bold text-base text-emerald-600">Dropbox</Text>
                        {!isConnectedToDropbox && (
                          <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                            <Text className="font-quicksand-bold text-xs text-amber-600">Secure</Text>
                          </View>
                        )}
                      </View>
                      <Text className="font-quicksand-medium text-sm text-emerald-500">
                        {isConnectedToDropbox
                          ? dropboxFile
                            ? `Selected: ${dropboxFile.name}`
                            : "Select a Dropbox File"
                          : "Connect to browse your Dropbox files"}
                      </Text>
                    </View>
                    {isConnectedToDropbox && dropboxFile && activeOAuthProvider === "DROPBOX" ? (
                      <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center">
                        <Feather name="check" size={12} color="white" />
                      </View>
                    ) : !isConnectedToDropbox ? (
                      <View className="flex-row items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
                        <Feather name="plus" size={12} color="#10b981" />
                        <Text className="font-quicksand-bold text-xs text-emerald-600">Connect</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`rounded-xl p-4 flex-row items-center gap-4 border-2 ${
                      isConnectedToOneDrive
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-dashed border-emerald-300"
                    }`}
                    style={{
                      shadowColor: "#0078D4",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isConnectedToOneDrive ? 0.15 : 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={handleOnedrivePress}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isConnectedToOneDrive ? "bg-emerald-100" : "bg-emerald-50 border border-emerald-200"
                      }`}
                    >
                      <Entypo name="onedrive" size={20} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-quicksand-bold text-base text-emerald-600">OneDrive</Text>
                        {!isConnectedToOneDrive && (
                          <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                            <Text className="font-quicksand-bold text-xs text-amber-600">Secure</Text>
                          </View>
                        )}
                      </View>
                      <Text className="font-quicksand-medium text-sm text-emerald-500">
                        {isConnectedToOneDrive
                          ? oneDriveFile
                            ? `Selected: ${oneDriveFile.name}`
                            : "Select a OneDrive File"
                          : "Connect to browse your OneDrive files"}
                      </Text>
                    </View>
                    {isConnectedToOneDrive && oneDriveFile && activeOAuthProvider === "ONEDRIVE" ? (
                      <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center">
                        <Feather name="check" size={12} color="white" />
                      </View>
                    ) : !isConnectedToOneDrive ? (
                      <View className="flex-row items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
                        <Feather name="plus" size={12} color="#10b981" />
                        <Text className="font-quicksand-bold text-xs text-emerald-600">Connect</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {uploadView === "Link" && (
              <View className="mb-6">
                <Text className="font-quicksand-semibold text-base text-gray-800 mb-3">🔗 Direct Link</Text>
                <Text className="font-quicksand-medium text-xs text-gray-600 mb-3">
                  Paste a shareable link from supported services
                </Text>
                <View className="flex flex-row items-center gap-2 mb-3">
                  <AntDesign name="google" size={14} color="#4285F4" />
                  <AntDesign name="dropbox" size={14} color="#0061FF" />
                  <Text className="font-quicksand-medium text-xs text-gray-500 ml-2">Supported services</Text>
                </View>
                <LinkInput
                  value={documentLink}
                  handleChangeText={(text) => setDocumentLink(text)}
                  onIconPress={handleDocumentUploadSubmit}
                />
              </View>
            )}
          </View>
        ) : (
          renderUploadedResumeInfo()
        )}
      </View>
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
          onPress={handleUploadConfirmation}
          disabled={uploadingDocument}
          activeOpacity={0.8}
        >
          {uploadingDocument ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-bold text-white text-base">
                {customHandleUploadMethod ? "Save Document" : "Upload Document"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {!customHandleUploadMethod && (
          <TouchableOpacity
            className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <ModalWithBg visible={showOauthPickerModal} customHeight={0.8} customWidth={0.9}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">
              Upload file from {converOAuthProviderToText(activeOAuthProvider || "Cloud")}
            </Text>
            <TouchableOpacity onPress={() => setShowOauthPickerModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {activeOAuthProvider === "GOOGLE_DRIVE" && (
            <GoogleDriveFileSelector onClose={() => setShowOauthPickerModal(false)} />
          )}
          {activeOAuthProvider === "DROPBOX" && <DropBoxFileSelector onClose={() => setShowOauthPickerModal(false)} />}
          {activeOAuthProvider === "ONEDRIVE" && (
            <OneDriveFileSelector onClose={() => setShowOauthPickerModal(false)} />
          )}
        </View>
      </ModalWithBg>
      <ModalWithBg visible={showConfirmationModal} customHeight={0.8} customWidth={0.9}>
        <ScrollView className="flex-1 p-4">
          <View className="py-4 border-b border-gray-200">
            <View className="flex-row items-center gap-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: `${selectedDocInfo.color}20` }}
              >
                <Feather name={selectedDocInfo.icon as any} size={20} color={selectedDocInfo.color} />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-bold text-lg text-gray-900">Confirm Upload</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">
                  Review your document details before uploading
                </Text>
              </View>
            </View>
          </View>
          <View className="py-4">
            <Text className="font-quicksand-bold text-base text-gray-900 mb-4">Document Details</Text>
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-quicksand-medium text-sm text-gray-600">Title</Text>
                <Text className="font-quicksand-bold text-sm text-gray-900 flex-1 text-right" numberOfLines={1}>
                  {documentTitle || "Untitled Document"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="font-quicksand-medium text-sm text-gray-600">Type</Text>
                <View className="flex-row items-center gap-2">
                  <Feather name={selectedDocInfo.icon as any} size={14} color={selectedDocInfo.color} />
                  <Text className="font-quicksand-bold text-sm text-gray-900">{selectedDocInfo.label}</Text>
                </View>
              </View>
            </View>
          </View>
          <View>
            <Text className="font-quicksand-bold text-base text-gray-900">Upload Method</Text>
            {multipleUploadMethodsSelected() ? (
              <View className="gap-3">
                <Text className="font-quicksand-semibold text-MD text-gray-600 mt-4">
                  Multiple upload methods detected. Please choose only one.
                </Text>
                {selectedImage?.assets?.[0] && (
                  <TouchableOpacity
                    className={`rounded-xl p-8 border ${
                      selectedUploadMethod === "IMAGE_UPLOAD"
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => setSelectedUploadMethod("IMAGE_UPLOAD")}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center">
                          <Feather name="image" size={18} color="#22c55e" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-quicksand-bold text-sm text-gray-900">Image Upload</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-600" numberOfLines={1}>
                            {selectedImage.assets[0].fileName}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                {uploadedDocument?.assets?.[0] && (
                  <TouchableOpacity
                    className={`rounded-xl p-8 border ${
                      selectedUploadMethod === "DIRECT_UPLOAD"
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => setSelectedUploadMethod("DIRECT_UPLOAD")}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center">
                          <Feather name="upload" size={18} color="#22c55e" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-quicksand-bold text-sm text-gray-900">Direct Upload</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-600" numberOfLines={1}>
                            {uploadedDocument.assets[0].name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                {googleDriveFile && (
                  <TouchableOpacity
                    className={`rounded-xl p-4 border ${
                      selectedUploadMethod === "GOOGLE_DRIVE"
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => setSelectedUploadMethod("GOOGLE_DRIVE")}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                          <AntDesign name="google" size={18} color="#4285F4" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-quicksand-bold text-sm text-gray-900">Google Drive</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-600" numberOfLines={1}>
                            {googleDriveFile.name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                {dropboxFile && (
                  <TouchableOpacity
                    className={`rounded-xl p-4 border ${
                      selectedUploadMethod === "DROPBOX" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                    }`}
                    onPress={() => setSelectedUploadMethod("DROPBOX")}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                          <AntDesign name="dropbox" size={18} color="#0061FF" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-quicksand-bold text-sm text-gray-900">Dropbox</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-600" numberOfLines={1}>
                            {dropboxFile.name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                {oneDriveFile && (
                  <TouchableOpacity
                    className={`rounded-xl p-4 border ${
                      selectedUploadMethod === "ONEDRIVE" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                    }`}
                    onPress={() => setSelectedUploadMethod("ONEDRIVE")}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                          <Entypo name="onedrive" size={18} color="#0078D4" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-quicksand-bold text-sm text-gray-900">OneDrive</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-600" numberOfLines={1}>
                            {oneDriveFile.name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                {documentLink.trim() && (
                  <TouchableOpacity
                    className={`rounded-xl p-4 border ${
                      selectedUploadMethod === "LINK_INPUT" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                    }`}
                    onPress={() => setSelectedUploadMethod("LINK_INPUT")}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center">
                          <Feather name="link" size={18} color="#8b5cf6" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-quicksand-bold text-sm text-gray-900">Direct Link</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-600" numberOfLines={1}>
                            {documentLink}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                {uploadedDocument?.assets?.[0] && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center">
                      <Feather name="upload" size={18} color="#22c55e" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-sm text-blue-900">Direct Upload</Text>
                      <Text className="font-quicksand-medium text-xs text-blue-700" numberOfLines={1}>
                        {uploadedDocument.assets[0].name}
                      </Text>
                    </View>
                    <Feather name="check-circle" size={20} color="#22c55e" />
                  </View>
                )}
                {selectedImage?.assets?.[0] && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center">
                      <Feather name="image" size={18} color="#22c55e" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-sm text-blue-900">Image Upload</Text>
                      <Text className="font-quicksand-medium text-xs text-blue-700" numberOfLines={1}>
                        {selectedImage.assets[0].fileName}
                      </Text>
                    </View>
                    <Feather name="check-circle" size={20} color="#22c55e" />
                  </View>
                )}
                {googleDriveFile && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                      <AntDesign name="google" size={18} color="#4285F4" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-sm text-blue-900">Google Drive</Text>
                      <Text className="font-quicksand-medium text-xs text-blue-700" numberOfLines={1}>
                        {googleDriveFile.name}
                      </Text>
                    </View>
                    <Feather name="check-circle" size={20} color="#22c55e" />
                  </View>
                )}

                {dropboxFile && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                      <AntDesign name="dropbox" size={18} color="#0061FF" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-sm text-blue-900">Dropbox</Text>
                      <Text className="font-quicksand-medium text-xs text-blue-700" numberOfLines={1}>
                        {dropboxFile.name}
                      </Text>
                    </View>
                    <Feather name="check-circle" size={20} color="#22c55e" />
                  </View>
                )}
                {oneDriveFile && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                      <Entypo name="onedrive" size={18} color="#0078D4" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-sm text-blue-900">OneDrive</Text>
                      <Text className="font-quicksand-medium text-xs text-blue-700" numberOfLines={1}>
                        {oneDriveFile.name}
                      </Text>
                    </View>
                    <Feather name="check-circle" size={20} color="#22c55e" />
                  </View>
                )}

                {documentLink.trim() && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center">
                      <Feather name="link" size={18} color="#8b5cf6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-sm text-blue-900">Direct Link</Text>
                      <Text className="font-quicksand-medium text-xs text-blue-700" numberOfLines={1}>
                        {documentLink}
                      </Text>
                    </View>
                    <Feather name="check-circle" size={20} color="#22c55e" />
                  </View>
                )}
              </View>
            )}
          </View>
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={handleDocumentUploadSubmit}
              disabled={uploadingDocument}
              activeOpacity={0.8}
            >
              {uploadingDocument ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-bold text-white text-base">Confirm</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
              activeOpacity={0.7}
              onPress={() => setShowConfirmationModal(false)}
            >
              <View className="flex-row items-center gap-2">
                <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ModalWithBg>
    </>
  );
};

export default FileSelector;
