import { GoogleDriveFile } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

type Props = {
  isLoadingGoogleDriveFiles: boolean;
  googleDriveFiles: GoogleDriveFile[];
  selectedGoogleDriveFile: GoogleDriveFile | null;
  setSelectedGoogleDriveFile: (file: GoogleDriveFile | null) => void;
  nextPageToken: string | null;
  fetchMoreGoogleDriveFiles: () => void;
  setShowOauthPickerModal: (show: boolean) => void;
  noFilesMessage: string;
  selectFileMessage: string;
};

const OAuthFileList = ({
  isLoadingGoogleDriveFiles,
  googleDriveFiles,
  selectedGoogleDriveFile,
  setSelectedGoogleDriveFile,
  nextPageToken,
  fetchMoreGoogleDriveFiles,
  setShowOauthPickerModal,
  noFilesMessage,
  selectFileMessage,
}: Props) => {
  return (
    <>
      <View className="flex-1 px-6 py-4">
        {isLoadingGoogleDriveFiles && googleDriveFiles.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4285F4" />
            <Text className="font-quicksand-medium text-gray-600 mt-4">Loading your files...</Text>
          </View>
        ) : googleDriveFiles.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Feather name="folder" size={28} color="#9ca3af" />
            </View>
            <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">No Files Found</Text>
            <Text className="font-quicksand-medium text-sm text-gray-500 text-center">{noFilesMessage}</Text>
          </View>
        ) : (
          <View className="flex-1">
            <Text className="font-quicksand-semibold text-base text-gray-800 mb-4">{selectFileMessage}</Text>

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
                    return { name: "image", color: "#10b981", bgColor: "bg-emerald-100" };
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
                          <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center">
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
                    className="bg-emerald-500 rounded-xl p-4 flex-row items-center justify-center gap-3 mb-4"
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
              selectedGoogleDriveFile ? "bg-emerald-500" : "bg-gray-300"
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
                console.log("Selected file for upload:", selectedGoogleDriveFile);
                setShowOauthPickerModal(false);
              }
            }}
            disabled={!selectedGoogleDriveFile}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="check" size={18} color={selectedGoogleDriveFile ? "white" : "#9ca3af"} />
              <Text
                className={`font-quicksand-bold text-base ${selectedGoogleDriveFile ? "text-white" : "text-gray-500"}`}
              >
                Done
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {selectedGoogleDriveFile && (
          <View className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="font-quicksand-medium text-blue-800 text-sm text-center">
              Selected: {selectedGoogleDriveFile.name}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default OAuthFileList;
