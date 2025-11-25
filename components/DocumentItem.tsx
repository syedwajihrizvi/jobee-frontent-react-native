import { deleteUserDocument, updateUserDocument } from "@/lib/manageUserDocs";
import { getS3DocumentPreviewUrl, getS3DocumentUrl } from "@/lib/s3Urls";
import { updatePrimaryResume } from "@/lib/updateUserProfile";
import { convertDocumentTypeToLabel, documentTypes } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import { User, UserDocument } from "@/type";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import CustomInput from "./CustomInput";
import ModalWithBg from "./ModalWithBg";
import RenderSlicedText from "./RenderSlicedText";

const { height, width } = Dimensions.get("window");

const DocumentItem = ({
  document,
  actionIcon = "edit",
  customAction,
  standOut,
  highlightPrimary = true,
  width: customWidth = 100,
  height: customHeight = 120,
  customTitle,
  canEdit = true,
  canDelete = false,
  handleDelete,
}: {
  document: UserDocument;
  actionIcon?: string;
  customAction?: () => void;
  standOut?: boolean;
  width?: number;
  height?: number;
  customTitle?: string;
  highlightPrimary?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  handleDelete?: () => void;
}) => {
  const { user: authUser, setUser } = useAuthStore();
  const { refetchUserDocuments } = useUserStore();
  const user = authUser as User | null;
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updatingPrimary, setUpdatingPrimary] = useState(false);
  const [selectedDocumentInfo, setSelectedDocumentInfo] = useState(document);
  const handleOpen = () => {
    if (customAction) {
      customAction();
    }
    setModalVisible(true);
  };
  const handleClose = () => setModalVisible(false);

  const handleSetPrimary = async (documentId: number) => {
    setUpdatingPrimary(true);
    try {
      const success = await updatePrimaryResume(documentId);
      if (success) {
        setUser({ ...user, primaryResume: document } as User);
        Alert.alert("Success", "Primary resume updated successfully.");
      } else {
        console.log("Failed to set document as primary");
      }
    } catch (error) {
      console.error("Error setting document as primary:", error);
    } finally {
      setUpdatingPrimary(false);
    }
  };

  const handleEdit = () => {
    setModalVisible(false);
    setEditModalVisible(true);
  };

  const handleDeleteDocument = async () => {
    const documentId = document.id;
    setUpdatingPrimary(true);
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this document? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setUpdatingPrimary(false),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteUserDocument(documentId);
              if (success) {
                Alert.alert("Success", "Document deleted successfully.");
                refetchUserDocuments();
                setEditModalVisible(false);
              } else {
                Alert.alert("Error", "Failed to delete document. Please try again.");
              }
            } catch (error) {
              console.error("Error deleting document:", error);
            } finally {
              setUpdatingPrimary(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    try {
      const title = selectedDocumentInfo.title || "";
      const documentType = selectedDocumentInfo.documentType || "RESUME";
      const res = await updateUserDocument(selectedDocumentInfo.id, title, documentType);
      if (res) {
        setEditModalVisible(false);
        Alert.alert("Success", "Document updated successfully.");
        refetchUserDocuments();
      } else {
        Alert.alert("Error", "Failed to update document. Please try again.");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {customAction ? (
        <View className="items-center justify-center">
          <TouchableOpacity
            className={`relative ${standOut ? "border-2 border-emerald-200" : ""}`}
            onPress={handleOpen}
            style={{
              width: customWidth,
              height: customHeight,
              zIndex: 1,
              borderRadius: 8,
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
          >
            {standOut && document.id === user?.primaryResume?.id && highlightPrimary && (
              <View
                className="absolute bg-emerald-100 rounded-lg items-center justify-center"
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.85,
                  zIndex: 10,
                }}
              >
                <View className="items-center">
                  <View className="w-8 h-8 bg-white rounded-full items-center justify-center mb-1">
                    <Feather name="star" size={16} color="#10b981" />
                  </View>
                  <Text className="font-quicksand-bold text-xs text-emerald-600 text-center">PRIMARY</Text>
                </View>
              </View>
            )}
            {canDelete && (
              <TouchableOpacity
                className="absolute bg-emerald-500 rounded-full p-1"
                style={{
                  top: -10,
                  right: -10,
                  zIndex: 11,
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}
                onPress={handleDelete}
              >
                <Feather name="x" size={20} color="white" />
              </TouchableOpacity>
            )}
            {canEdit && (
              <View
                className="absolute bg-white rounded-full p-1"
                style={{
                  top: -4,
                  right: -4,
                  zIndex: 11,
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}
              >
                <Feather name={actionIcon as any} size={14} color="#22c55e" />
              </View>
            )}

            <Image
              source={{ uri: getS3DocumentPreviewUrl(document) }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </TouchableOpacity>

          <View className="mt-1">
            <Text className="font-quicksand-bold text-xs text-emerald-600 text-center" numberOfLines={2}>
              {customTitle ? (
                customTitle
              ) : (
                <RenderSlicedText text={document.title || document.documentType || ""} maxLength={20} />
              )}
            </Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity className="document-item w-20 h-20 flex items-center justify-center" onPress={handleOpen}>
          <Text className="font-quicksand-bold text-sm">Preview</Text>
        </TouchableOpacity>
      )}
      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={handleClose}>
        <View className="flex-1 bg-black/45 justify-center items-center">
          <View
            style={{
              height: height * 0.65,
              width: width * 0.95,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "white",
            }}
          >
            <View className="p-3 flex-row justify-between items-center white">
              <View className="flex-row items-center gap-2">
                <Text className="text-md font-semibold">
                  {customTitle ? customTitle : document.title || convertDocumentTypeToLabel(document.documentType)}
                </Text>
                {document.documentType === "RESUME" && document.id === user?.primaryResume?.id && canEdit && (
                  <View
                    className="bg-blue-500 border border-blue-600 rounded-xl px-3 py-2 flex-row items-center gap-1"
                    style={{
                      shadowColor: "#ef4444",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Feather name="star" size={14} color="white" />
                    <Text className="font-quicksand-bold text-xs text-white">Primary Resume</Text>
                  </View>
                )}

                {!standOut &&
                  document.documentType === "RESUME" &&
                  document.id !== user?.primaryResume?.id &&
                  canEdit && (
                    <TouchableOpacity
                      className="bg-emerald-500 border border-emerald-600 rounded-xl px-3 py-2 flex-row items-center gap-1"
                      style={{
                        shadowColor: "#10b981",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => {
                        handleSetPrimary(document.id);
                      }}
                      activeOpacity={0.8}
                    >
                      {updatingPrimary ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Feather name="star" size={14} color="white" />
                          <Text className="font-quicksand-bold text-xs text-white">Set as Primary</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
              </View>
              <View className="flex-row gap-2">
                {canEdit && (
                  <TouchableOpacity onPress={handleEdit}>
                    <Feather name="edit" size={20} color="black" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleClose}>
                  <AntDesign name="close" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            <WebView
              source={{ uri: getS3DocumentUrl(document.documentUrl) }}
              style={{ flex: 1 }}
              scalesPageToFit
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => <Text>Loading...</Text>}
              renderError={() => <Text>Error loading document</Text>}
            />
          </View>
        </View>
      </Modal>
      <ModalWithBg visible={editModalVisible} customHeight={0.8} customWidth={0.9}>
        <View className="bg-white rounded-2xl p-6 mx-4" style={{ maxWidth: customWidth * 0.9 }}>
          <View className="mb-6">
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">Edit Document</Text>
            <View className="h-1 w-16 bg-emerald-500 rounded-full" />
          </View>

          <CustomInput
            label="Document Title"
            autoCapitalize="words"
            customClass="border border-gray-300 rounded-xl p-3 font-quicksand-medium text-md text-gray-900"
            placeholder="Enter document title"
            value={selectedDocumentInfo.title || ""}
            onChangeText={(text) => {
              setSelectedDocumentInfo({ ...selectedDocumentInfo, title: text });
            }}
          />
          <View className="mb-4 mt-4">
            <Text className="form__input-label mb-2">Document Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {(document.formatType === "IMG"
                ? documentTypes.filter((doc) => doc.value !== "RESUME")
                : documentTypes
              ).map((doc) => (
                <TouchableOpacity
                  key={doc.value}
                  className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${
                    selectedDocumentInfo.documentType === doc.value
                      ? "border-green-200 bg-emerald-50"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{
                    shadowColor: selectedDocumentInfo.documentType === doc.value ? "#6366f1" : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: selectedDocumentInfo.documentType === doc.value ? 0.1 : 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() => setSelectedDocumentInfo({ ...selectedDocumentInfo, documentType: doc.value })}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={doc.icon as any}
                    size={16}
                    color={selectedDocumentInfo.documentType === doc.value ? "#6366f1" : doc.color}
                  />
                  <Text
                    className={`font-quicksand-semibold text-sm ${
                      selectedDocumentInfo.documentType === doc.value ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {doc.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="gap-3 mt-6">
            <TouchableOpacity
              className="bg-emerald-500 rounded-xl px-4 py-4 items-center justify-center"
              style={{
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => {
                handleEditSubmit();
              }}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Feather name="check" size={18} color="white" />
                  <Text className="font-quicksand-bold text-white text-base">Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="border-2 border-red-500 rounded-xl px-4 py-4 items-center justify-center"
              onPress={handleDeleteDocument}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Feather name="trash-2" size={18} color="#ef4444" />
                  <Text className="font-quicksand-bold text-red-500 text-base">Delete Document</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-gray-300 bg-gray-50 rounded-xl px-4 py-4 items-center justify-center"
              onPress={() => {
                setSelectedDocumentInfo(document);
                setEditModalVisible(false);
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="x" size={18} color="#6b7280" />
                <Text className="font-quicksand-bold text-gray-600 text-base">Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ModalWithBg>
    </>
  );
};

export default DocumentItem;
