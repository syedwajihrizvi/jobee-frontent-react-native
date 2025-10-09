import BackBar from "@/components/BackBar";
import LinkInput from "@/components/LinkInput";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import { UserDocumentType } from "@/constants";
import { uploadUserDocument } from "@/lib/manageUserDocs";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const [resumeLink, setResumeLink] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [uploadedDocument, setUploadedDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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

  const handleDocumentUploadSubmit = async () => {
    if (!uploadedDocument) {
      Alert.alert("Error", "Please select a document to upload");
      return;
    }
    setUploadingDocument(true);
    try {
      await uploadUserDocument(uploadedDocument, selectedDocumentType, documentTitle);
      Alert.alert("Success", "Document uploaded successfully");
      setUploadedDocument(null);
      setDocumentTitle("");
      queryClient.invalidateQueries({ queryKey: ["documents", "user"] });
      queryClient.invalidateQueries({ queryKey: ["skills", "user"] });
      queryClient.invalidateQueries({ queryKey: ["education", "user"] });
      queryClient.invalidateQueries({ queryKey: ["experience", "user"] });
      setUploadSuccess(true);
    } catch (error) {
      console.error("Error uploading document:", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    } finally {
      setUploadingDocument(false);
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

  const sendDocumentUriToServer = async () => {
    console.log("Sending document URI to server...");
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
            <View className="items-center mb-6">
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
            <View className="mb-6">
              <Text className="font-quicksand-bold text-base text-gray-900 mb-3">Document Type</Text>
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
            <View className="mb-6">
              <Text className="font-quicksand-bold text-base text-gray-900 mb-2">Document Title</Text>
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
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6"
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
            <View className="mb-6">
              <Text className="font-quicksand-bold text-base text-gray-900 mb-3">Upload Method</Text>
              <View className="gap-3">
                {!uploadedDocument ? (
                  <>
                    <TouchableOpacity
                      className="bg-green-500 rounded-xl p-4 flex-row items-center justify-center gap-3"
                      style={{
                        shadowColor: "#6366f1",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                      onPress={handleUpload}
                      activeOpacity={0.8}
                    >
                      <Feather name="upload" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-base">Upload Document</Text>
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
                  </>
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
            </View>
            <View className="mb-6">
              <Text className="font-quicksand-bold text-base text-gray-900 mb-3">Or Add Link</Text>
              <LinkInput value={resumeLink} onChangeText={setResumeLink} onIconPress={sendDocumentUriToServer} />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-green-500 rounded-xl py-4 items-center justify-center"
                style={{
                  shadowColor: "#6366f1",
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
    </SafeAreaView>
  );
};

export default UploadNewDoc;
