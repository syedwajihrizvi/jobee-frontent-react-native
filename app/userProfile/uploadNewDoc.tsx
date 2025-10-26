import BackBar from "@/components/BackBar";
import LinkInput from "@/components/LinkInput";
import ModalWithBg from "@/components/ModalWithBg";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import { UserDocumentType } from "@/constants";
import {
  connectToGoogleDriveOAuth,
  fetchGoogleDocAsPdfAndCreateTempFile,
  getGoogleDriveFiles,
  isGoogleDriveAccessTokenValid,
} from "@/lib/auth";
import { sendDocumentLinkToServer, uploadGoogleDriveDocumentToServer, uploadUserDocument } from "@/lib/manageUserDocs";
import { converOAuthProviderToText, isValidGoogleDriveLink } from "@/lib/utils";
import { GoogleDriveFile } from "@/type";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const documentTypes = [
  { label: "Resume", value: UserDocumentType.RESUME, icon: "file-text", color: "#3b82f6" },
  { label: "Cover Letter", value: UserDocumentType.COVER_LETTER, icon: "mail", color: "#8b5cf6" },
  { label: "Certificate", value: UserDocumentType.CERTIFICATE, icon: "award", color: "#f59e0b" },
  { label: "Transcript", value: UserDocumentType.TRANSCRIPT, icon: "book", color: "#10b981" },
  { label: "Recommendation", value: UserDocumentType.RECOMMENDATION, icon: "star", color: "#ef4444" },
];

const UploadNewDoc = () => {
  const queryClient = useQueryClient();
  const [selectedDocumentType, setSelectedDocumentType] = useState("RESUME");
  const [documentLink, setDocumentLink] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [uploadedDocument, setUploadedDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isConnectedToGoogleDrive, setIsConnectedToGoogleDrive] = useState(false);
  const [isConnectedToDropbox, setIsConnectedToDropbox] = useState(false);
  const [isConnectedToOneDrive, setIsConnectedToOneDrive] = useState(false);
  const [showOauthPickerModal, setShowOauthPickerModal] = useState(false);
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<"GOOGLE_DRIVE" | "DROPBOX" | "ONEDRIVE" | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingGoogleDriveFiles, setIsLoadingGoogleDriveFiles] = useState(false);
  const [selectedGoogleDriveFile, setSelectedGoogleDriveFile] = useState<GoogleDriveFile | null>(null);

  useEffect(() => {
    const checkGoogleDriveAccessToken = async () => {
      if (await isGoogleDriveAccessTokenValid()) {
        setIsConnectedToGoogleDrive(true);
      }
    };
    checkGoogleDriveAccessToken();
  }, []);

  const handleGoogleDrivePress = async () => {
    setActiveOAuthProvider("GOOGLE_DRIVE");
    if (!isConnectedToGoogleDrive) {
      const result = await connectToGoogleDriveOAuth();
      if (result) {
        setIsConnectedToGoogleDrive(true);
        handleSelectGoogleDriveDocs();
      } else {
        setShowOauthPickerModal(true);
      }
    }
  };

  const handleSelectGoogleDriveDocs = async () => {
    setIsLoadingGoogleDriveFiles(true);
    try {
      setShowOauthPickerModal(true);
      const result = await getGoogleDriveFiles(nextPageToken || undefined);
      const files = result.files as GoogleDriveFile[];
      if (files && files.length > 0) {
        console.log("Fetched Google Drive files: ", files.length);
        setGoogleDriveFiles((prev) => [...prev, ...files]);
        if (result.nextPageToken) {
          setNextPageToken(result.nextPageToken);
        } else {
          setNextPageToken(null);
        }
      }
    } catch (error) {
      console.log("Error selecting Google Drive document: ", error);
    } finally {
      setIsLoadingGoogleDriveFiles(false);
    }
  };

  const fetchMoreGoogleDriveFiles = async () => {
    if (nextPageToken) {
      setIsLoadingGoogleDriveFiles(true);
      try {
        const result = await getGoogleDriveFiles(nextPageToken);
        const files = result.files as GoogleDriveFile[];
        if (files && files.length > 0) {
          setGoogleDriveFiles((prev) => [...prev, ...files]);
          if (result.nextPageToken) {
            setNextPageToken(result.nextPageToken);
          } else {
            setNextPageToken(null);
          }
        }
        console.log("Fetched more Google Drive files: ", result);
      } catch (error) {
      } finally {
        setIsLoadingGoogleDriveFiles(false);
      }
    }
  };

  const handleDropboxPress = () => {
    setActiveOAuthProvider("DROPBOX");
    console.log("Handle Dropbox OAuth");
  };

  const handleOnedrivePress = () => {
    setActiveOAuthProvider("ONEDRIVE");
    console.log("Handle OneDrive OAuth");
  };
  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find((doc) => doc.value === type) || documentTypes[0];
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
      if (!document.canceled) {
        setUploadedDocument(document);
      }
    } catch (error) {
      console.error("Error picking document: ", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const noFileSelected = () => {
    return uploadedDocument == null && selectedGoogleDriveFile == null && selectedGoogleDriveFile == null;
  };
  const handleDocumentUploadSubmit = async () => {
    if (noFileSelected()) {
      Alert.alert("Error", "Please select a document to upload or provide a link.");
      return;
    }
    // Based on what type of file is provides, we need to handle it differently
    setUploadingDocument(true);
    // Only run if resumeLink is empty, this means user is uploading a document file
    if (documentLink.trim() !== "" && uploadedDocument) {
      try {
        await uploadUserDocument(uploadedDocument, selectedDocumentType, documentTitle);
        Alert.alert("Success", "Document uploaded successfully");
        setUploadedDocument(null);
        setDocumentTitle("");
        queryClient.invalidateQueries({ queryKey: ["documents", "user"] });
        // Invalidate if resume since it may affect profile completeness
        if (selectedDocumentType === UserDocumentType.RESUME) {
          queryClient.invalidateQueries({ queryKey: ["skills", "user"] });
          queryClient.invalidateQueries({ queryKey: ["education", "user"] });
          queryClient.invalidateQueries({ queryKey: ["experience", "user"] });
        }
        setUploadSuccess(true);
      } catch (error) {
        console.error("Error uploading document:", error);
        Alert.alert("Error", "Failed to upload document. Please try again.");
      } finally {
        setUploadingDocument(false);
      }
    } else if (documentLink.trim() !== "") {
      try {
        // if (!isValidDocumentLink(documentLink)) {
        //   Alert.alert("Error", "Please provide a valid Google Drive or Dropbox link.");
        //   return;
        // }
        const documentLinkType = isValidGoogleDriveLink(documentLink) ? "GOOGLE_DRIVE" : "DROPBOX";
        await sendDocumentLinkToServer(documentLink, selectedDocumentType, documentTitle, documentLinkType);
        Alert.alert("Success", "Document uploaded successfully");
        setUploadedDocument(null);
        setDocumentTitle("");
        setDocumentLink("");
        queryClient.invalidateQueries({ queryKey: ["documents", "user"] });
        // Invalidate if resume since it may affect profile completeness
        if (selectedDocumentType === UserDocumentType.RESUME) {
          queryClient.invalidateQueries({ queryKey: ["skills", "user"] });
          queryClient.invalidateQueries({ queryKey: ["education", "user"] });
          queryClient.invalidateQueries({ queryKey: ["experience", "user"] });
        }
        setUploadSuccess(true);
      } catch (error) {
        console.error("Error uploading document link:", error);
        Alert.alert("Error", "Failed to upload document link. Please try again.");
      } finally {
        setUploadingDocument(false);
      }
    } else if (selectedGoogleDriveFile != null) {
      setUploadingDocument(true);
      try {
        const { id, name, mimeType } = selectedGoogleDriveFile;
        const tempFile = await fetchGoogleDocAsPdfAndCreateTempFile(id, name, mimeType);
        if (tempFile == null) {
          Alert.alert("Error", "Failed to process the selected Google Drive document.");
          return;
        }
        const res = await uploadGoogleDriveDocumentToServer(tempFile, selectedDocumentType, documentTitle);
        console.log(res);
        console.log("Uploading selected Google Drive file:", selectedGoogleDriveFile);
        Alert.alert("Success", "Document uploaded successfully");
        setSelectedGoogleDriveFile(null);
        setDocumentTitle("");
        queryClient.invalidateQueries({ queryKey: ["documents", "user"] });
        // Invalidate if resume since it may affect profile completeness
        if (selectedDocumentType === UserDocumentType.RESUME) {
          queryClient.invalidateQueries({ queryKey: ["skills", "user"] });
          queryClient.invalidateQueries({ queryKey: ["education", "user"] });
          queryClient.invalidateQueries({ queryKey: ["experience", "user"] });
        }
        setUploadSuccess(true);
      } catch (error) {
      } finally {
        setUploadingDocument(false);
      }
    }
  };

  const handleDocImagePicker = async (
    noAccessMsg: string,
    accessMsg: string,
    uploadByPhotoMsg: string,
    uploadByGalleryMsg: string
  ) => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.granted === false) {
      Alert.alert(noAccessMsg);
      return;
    }
    Alert.alert("Add new Document", "Choose an option", [
      {
        text: uploadByPhotoMsg,
        onPress: async () => {
          await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
        },
      },
      {
        text: uploadByGalleryMsg,
        onPress: async () => {
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const selectedDocInfo = getDocumentTypeInfo(selectedDocumentType);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackBar
        label="Upload Document"
        optionalCallback={() => {
          console.log("Called");
          setUploadSuccess(false);
        }}
      />
      <KeyboardAwareScrollView className="flex-1 p-6 bg-gray-50" showsVerticalScrollIndicator={false}>
        {uploadSuccess && (
          <SuccessfulUpdate
            type="uploadDocument"
            editingField="Document"
            handleConfirm={() => router.back()}
            handleReedit={() => setUploadSuccess(false)}
          />
        )}
        {!uploadSuccess && (
          <>
            <View className="items-center mb-8">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${selectedDocInfo.color}20` }}
              >
                <Feather name={selectedDocInfo.icon as any} size={28} color={selectedDocInfo.color} />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">Add New Document</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 text-center">
                Upload a new document to your professional library
              </Text>
            </View>
            <View className="mb-8">
              <Text className="font-quicksand-bold text-base text-gray-900 mb-4">Document Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {documentTypes.map((doc) => (
                  <TouchableOpacity
                    key={doc.value}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${
                      selectedDocumentType === doc.value ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                    }`}
                    style={{
                      shadowColor: selectedDocumentType === doc.value ? "#6366f1" : "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedDocumentType === doc.value ? 0.1 : 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={() => setSelectedDocumentType(doc.value)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={doc.icon as any}
                      size={16}
                      color={selectedDocumentType === doc.value ? "#6366f1" : doc.color}
                    />
                    <Text
                      className={`font-quicksand-semibold text-sm ${
                        selectedDocumentType === doc.value ? "text-green-700" : "text-gray-700"
                      }`}
                    >
                      {doc.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="mb-8">
              <Text className="font-quicksand-bold text-base text-gray-900 mb-3">Document Title</Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 font-quicksand-medium bg-white"
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
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8"
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
            <View className="mb-8">
              <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">Choose Upload Method</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 mb-6">
                Select how you would like to add your document
              </Text>

              {!uploadedDocument ? (
                <View className="space-y-4">
                  <View className="mb-6">
                    <Text className="font-quicksand-semibold text-base text-gray-800 mb-3">📁 Direct Upload</Text>
                    <View className="gap-3">
                      <TouchableOpacity
                        className="bg-green-500 rounded-xl p-4 flex-row items-center justify-center gap-3"
                        style={{
                          shadowColor: "#22c55e",
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.2,
                          shadowRadius: 6,
                          elevation: 4,
                        }}
                        onPress={handleUpload}
                        activeOpacity={0.8}
                      >
                        <Feather name="upload" size={18} color="white" />
                        <Text className="font-quicksand-bold text-white text-base">Upload from Device</Text>
                      </TouchableOpacity>

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
                          handleDocImagePicker(
                            "Camera access needed!",
                            "Upload document by taking a photo",
                            "Take Photo",
                            "Choose from Gallery"
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <Feather name="camera" size={18} color="#6b7280" />
                        <Text className="font-quicksand-bold text-gray-700 text-base">Take Photo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="mb-6">
                    <Text className="font-quicksand-semibold text-base text-gray-800 mb-3">☁️ Cloud Storage</Text>
                    <View className="gap-3">
                      <TouchableOpacity
                        className={`rounded-xl p-4 flex-row items-center gap-4 ${
                          isConnectedToGoogleDrive
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-white border border-gray-200"
                        }`}
                        style={{
                          shadowColor: isConnectedToGoogleDrive ? "#4285F4" : "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isConnectedToGoogleDrive ? 0.15 : 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        onPress={!isConnectedToGoogleDrive ? handleGoogleDrivePress : handleSelectGoogleDriveDocs}
                        activeOpacity={0.7}
                      >
                        <View
                          className={`w-10 h-10 rounded-full items-center justify-center ${
                            isConnectedToGoogleDrive ? "bg-blue-100" : "bg-gray-100"
                          }`}
                        >
                          <AntDesign name="google" size={20} color={isConnectedToGoogleDrive ? "#4285F4" : "#6b7280"} />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-quicksand-bold text-base ${
                              isConnectedToGoogleDrive ? "text-blue-700" : "text-gray-700"
                            }`}
                          >
                            Google Drive
                          </Text>
                          <Text
                            className={`font-quicksand-medium text-sm ${
                              isConnectedToGoogleDrive ? "text-blue-600" : "text-gray-500"
                            }`}
                          >
                            {isConnectedToGoogleDrive
                              ? selectedGoogleDriveFile
                                ? selectedGoogleDriveFile.name
                                : "Select a Google Doc or PDF File"
                              : "Connect with OAuth"}
                          </Text>
                        </View>
                        {isConnectedToGoogleDrive && (
                          <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                            <Feather name="check" size={12} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        className={`rounded-xl p-4 flex-row items-center gap-4 ${
                          isConnectedToDropbox ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-200"
                        }`}
                        style={{
                          shadowColor: isConnectedToDropbox ? "#0061FF" : "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isConnectedToDropbox ? 0.15 : 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        onPress={handleDropboxPress}
                        activeOpacity={0.7}
                      >
                        <View
                          className={`w-10 h-10 rounded-full items-center justify-center ${
                            isConnectedToDropbox ? "bg-blue-100" : "bg-gray-100"
                          }`}
                        >
                          <AntDesign name="dropbox" size={20} color={isConnectedToDropbox ? "#0061FF" : "#6b7280"} />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-quicksand-bold text-base ${
                              isConnectedToDropbox ? "text-blue-700" : "text-gray-700"
                            }`}
                          >
                            Dropbox
                          </Text>
                          <Text
                            className={`font-quicksand-medium text-sm ${
                              isConnectedToDropbox ? "text-blue-600" : "text-gray-500"
                            }`}
                          >
                            {isConnectedToDropbox ? "Connected & Ready" : "Connect with OAuth"}
                          </Text>
                        </View>
                        {isConnectedToDropbox && (
                          <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                            <Feather name="check" size={12} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        className={`rounded-xl p-4 flex-row items-center gap-4 ${
                          isConnectedToOneDrive
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-white border border-gray-200"
                        }`}
                        style={{
                          shadowColor: isConnectedToOneDrive ? "#0078D4" : "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isConnectedToOneDrive ? 0.15 : 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        onPress={handleOnedrivePress}
                        activeOpacity={0.7}
                      >
                        <View
                          className={`w-10 h-10 rounded-full items-center justify-center ${
                            isConnectedToOneDrive ? "bg-blue-100" : "bg-gray-100"
                          }`}
                        >
                          <Entypo name="onedrive" size={20} color={isConnectedToOneDrive ? "#0078D4" : "#6b7280"} />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-quicksand-bold text-base ${
                              isConnectedToOneDrive ? "text-blue-700" : "text-gray-700"
                            }`}
                          >
                            OneDrive
                          </Text>
                          <Text
                            className={`font-quicksand-medium text-sm ${
                              isConnectedToOneDrive ? "text-blue-600" : "text-gray-500"
                            }`}
                          >
                            {isConnectedToOneDrive ? "Connected & Ready" : "Connect with OAuth"}
                          </Text>
                        </View>
                        {isConnectedToOneDrive && (
                          <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                            <Feather name="check" size={12} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="mb-6">
                    <Text className="font-quicksand-semibold text-base text-gray-800 mb-3">🔗 Direct Link</Text>
                    <Text className="font-quicksand-medium text-xs text-gray-600 mb-3">
                      Paste a shareable link from supported services
                    </Text>
                    <View className="flex flex-row items-center gap-2 mb-3">
                      <AntDesign name="google" size={14} color="#4285F4" />
                      <AntDesign name="dropbox" size={14} color="#0061FF" />
                      <Entypo name="onedrive" size={16} color="#0078D4" />
                      <Text className="font-quicksand-medium text-xs text-gray-500 ml-2">Supported services</Text>
                    </View>
                    <LinkInput
                      value={documentLink}
                      handleChangeText={(text) => setDocumentLink(text)}
                      onIconPress={handleDocumentUploadSubmit}
                    />
                  </View>
                </View>
              ) : (
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
              )}
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-green-500 rounded-xl py-4 items-center justify-center"
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
                    <Text className="font-quicksand-bold text-white text-base">Save Document</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
                activeOpacity={0.7}
                onPress={() => router.back()}
              >
                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAwareScrollView>
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

          {/* Google Drive Files Content */}
          <View className="flex-1 px-6 py-4">
            {isLoadingGoogleDriveFiles && googleDriveFiles.length === 0 ? (
              // Initial loading state
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#4285F4" />
                <Text className="font-quicksand-medium text-gray-600 mt-4">Loading your files...</Text>
              </View>
            ) : googleDriveFiles.length === 0 ? (
              // Empty state
              <View className="flex-1 items-center justify-center">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Feather name="folder" size={28} color="#9ca3af" />
                </View>
                <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">No Files Found</Text>
                <Text className="font-quicksand-medium text-sm text-gray-500 text-center">
                  No documents found in your Google Drive
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                <Text className="font-quicksand-semibold text-base text-gray-800 mb-4">
                  Select a document from your Google Drive
                </Text>

                <FlatList
                  data={googleDriveFiles}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 120 }} // Space for fixed footer
                  renderItem={({ item }) => {
                    const getFileIcon = (mimeType: string) => {
                      if (mimeType === "application/pdf") {
                        return { name: "file-text", color: "#ef4444", bgColor: "bg-red-100" };
                      } else if (mimeType.startsWith("image/")) {
                        return { name: "image", color: "#10b981", bgColor: "bg-green-100" };
                      } else if (mimeType === "application/vnd.google-apps.document") {
                        return { name: "file-text", color: "#3b82f6", bgColor: "bg-blue-100" };
                      } else if (mimeType.includes("word") || mimeType.includes("document")) {
                        return { name: "file-text", color: "#3b82f6", bgColor: "bg-blue-100" };
                      } else {
                        return { name: "file", color: "#6b7280", bgColor: "bg-gray-100" };
                      }
                    };

                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString);
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                    };

                    const fileIcon = getFileIcon(item.mimeType);
                    const isSelected = selectedGoogleDriveFile?.id === item.id;

                    return (
                      <TouchableOpacity
                        className={`rounded-xl p-4 mb-3 border ${
                          isSelected ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                        }`}
                        style={{
                          shadowColor: isSelected ? "#3b82f6" : "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isSelected ? 0.15 : 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        onPress={() => {
                          if (item.id === selectedGoogleDriveFile?.id) {
                            setSelectedGoogleDriveFile(null);
                            return;
                          }
                          setSelectedGoogleDriveFile(item);
                        }}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center gap-3">
                          <View className={`w-12 h-12 ${fileIcon.bgColor} rounded-lg items-center justify-center`}>
                            <Feather name={fileIcon.name as any} size={20} color={fileIcon.color} />
                          </View>

                          <View className="flex-1">
                            <Text
                              className={`font-quicksand-bold text-base mb-1 ${
                                isSelected ? "text-blue-900" : "text-gray-900"
                              }`}
                              numberOfLines={2}
                            >
                              {item.name}
                            </Text>
                            <View className="flex-row items-center gap-2">
                              <Feather name="calendar" size={12} color="#6b7280" />
                              <Text className="font-quicksand-medium text-xs text-gray-500">
                                {formatDate(item.modifiedTime)}
                              </Text>
                            </View>
                          </View>

                          <View className="items-center">
                            {isSelected ? (
                              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                                <Feather name="check" size={14} color="white" />
                              </View>
                            ) : (
                              <View className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  ListFooterComponent={() =>
                    nextPageToken ? (
                      <TouchableOpacity
                        className="bg-green-500 rounded-xl p-4 flex-row items-center justify-center gap-3 mb-4"
                        style={{
                          shadowColor: "#3b82f6",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                        onPress={fetchMoreGoogleDriveFiles}
                        disabled={isLoadingGoogleDriveFiles}
                        activeOpacity={0.8}
                      >
                        {isLoadingGoogleDriveFiles ? (
                          <>
                            <ActivityIndicator size="small" color="white" />
                            <Text className="font-quicksand-bold text-white text-base">Loading...</Text>
                          </>
                        ) : (
                          <>
                            <Feather name="refresh-cw" size={18} color="white" />
                            <Text className="font-quicksand-bold text-white text-base">Load More</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : null
                  }
                />
              </View>
            )}
          </View>
          <View
            className="bg-white border-t border-gray-200 px-6 py-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
                onPress={() => {
                  setSelectedGoogleDriveFile(null);
                  setShowOauthPickerModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-xl py-4 items-center justify-center ${
                  selectedGoogleDriveFile ? "bg-green-500" : "bg-gray-300"
                }`}
                style={{
                  shadowColor: selectedGoogleDriveFile ? "#3b82f6" : "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedGoogleDriveFile ? 0.2 : 0,
                  shadowRadius: 4,
                  elevation: selectedGoogleDriveFile ? 3 : 0,
                }}
                onPress={() => {
                  if (selectedGoogleDriveFile) {
                    // Handle file selection here
                    console.log("Selected file for upload:", selectedGoogleDriveFile);
                    // You can set this as the uploaded document or trigger upload
                    setShowOauthPickerModal(false);
                  }
                }}
                disabled={!selectedGoogleDriveFile}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="check" size={18} color={selectedGoogleDriveFile ? "white" : "#9ca3af"} />
                  <Text
                    className={`font-quicksand-bold text-base ${
                      selectedGoogleDriveFile ? "text-white" : "text-gray-500"
                    }`}
                  >
                    Done
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Selection indicator */}
            {selectedGoogleDriveFile && (
              <View className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Text className="font-quicksand-medium text-blue-800 text-sm text-center">
                  Selected: {selectedGoogleDriveFile.name}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default UploadNewDoc;
