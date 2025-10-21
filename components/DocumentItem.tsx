import { images } from "@/constants";
import { getS3DocumentUrl } from "@/lib/s3Urls";
import { updatePrimaryResume } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { User, UserDocument } from "@/type";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import RenderSlicedText from "./RenderSlicedText";

const { height, width } = Dimensions.get("window");

const DocumentItem = ({
  document,
  actionIcon = "edit",
  customAction,
  standOut,
}: {
  document: UserDocument;
  actionIcon?: string;
  customAction?: () => void;
  standOut?: boolean;
}) => {
  const { user: authUser, setUser } = useAuthStore();
  const user = authUser as User | null;
  const [modalVisible, setModalVisible] = useState(false);
  const [updatingPrimary, setUpdatingPrimary] = useState(false);
  const handleOpen = () => setModalVisible(true);
  const handleClose = () => setModalVisible(false);

  const handleSetPrimary = async (documentId: number) => {
    console.log("Set document as primary:", documentId);
    // Logic to set the document as primary
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

  const handleRemovePrimary = (documentId: number) => {
    // Logic to remove the document as primary
    console.log("Remove document as primary:", documentId);
  };
  return (
    <>
      {customAction ? (
        <View className="items-center justify-center">
          <TouchableOpacity
            className={`w-20 h-20 relative ${standOut ? "border-2 border-emerald-400" : ""}`}
            onPress={handleOpen}
            style={{
              zIndex: 1,
              borderRadius: 8,
              ...(standOut && {
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              }),
            }}
          >
            {standOut && (
              <View
                className="absolute bg-emerald-500 rounded-lg items-center justify-center"
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
                  <Text className="font-quicksand-bold text-xs text-white text-center">PRIMARY</Text>
                </View>
              </View>
            )}
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

            <Image source={images.resumeImage} className="w-full h-full rounded-lg" resizeMode="cover" />
          </TouchableOpacity>

          <View className="mt-1">
            <Text className="font-quicksand-bold text-xs text-emerald-600 text-center">
              {<RenderSlicedText text={document.title || document.documentType || ""} maxLength={10} />}
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
              height: height * 0.6,
              width: width * 0.9,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "white",
            }}
          >
            <View className="p-3 flex-row justify-between items-center bg-gray-200">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-semibold">{document.title || document.documentType}</Text>
                {standOut && document.documentType === "RESUME" && (
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

                {!standOut && document.documentType === "RESUME" && (
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
                <TouchableOpacity onPress={handleClose}>
                  <Feather name="edit" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClose}>
                  <AntDesign name="close" size={24} color="black" />
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
    </>
  );
};

export default DocumentItem;
