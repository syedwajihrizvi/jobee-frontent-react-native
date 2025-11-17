import { getOneDriveFiles } from "@/lib/oauth/onedrive";
import { formatDate, getOneDriveFileType, isValidFileType } from "@/lib/utils";
import useOAuthDocStore from "@/store/oauth-doc.store";
import { OneDrivePathContent } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import FileTypeIcon from "./FileTypeIcon";

type Props = {
  onClose: () => void;
};

const OneDriveFileSelector = ({ onClose }: Props) => {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>(["/"]);
  const [currentPathContent, setCurrentPathContent] = useState<OneDrivePathContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { oneDriveFile, setOneDriveFile } = useOAuthDocStore();
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchRootFolderContent = async () => {
      setIsLoading(true);
      try {
        const result = await getOneDriveFiles(currentPath.join("/"));
        if (result) {
          const { files, nextLink } = result;
          const rootPathContents = files.map((file) => {
            console.log("OneDrive File:", file);
            const fileType = getOneDriveFileType(file);
            return {
              id: file.id,
              name: file.name,
              fileType: fileType,
              lastModifiedDateTime: file.lastModifiedDateTime,
              mimeType: file.file ? file.file.mimeType : undefined,
              downloadUrl: file["@microsoft.graph.downloadUrl"] || undefined,
              fileSize: file.size || undefined,
            } as OneDrivePathContent;
          });
          setCurrentPathContent(rootPathContents);
          setNextPageToken(nextLink || null);
        }
      } catch (error) {
        console.log("Error fetching OneDrive root folder content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRootFolderContent();
  }, [currentPath]);

  const loadMoreOneDriveFiles = async () => {
    if (!nextPageToken) return;
    setIsLoading(true);
    try {
      const result = await getOneDriveFiles(currentPath.join("/"), nextPageToken);
      if (result) {
        const { files, nextLink } = result;
        const moreContents = files.map((file) => {
          console.log("OneDrive File:", file);
          const fileType = getOneDriveFileType(file);
          return {
            id: file.id,
            name: file.name,
            fileType: fileType,
            lastModifiedDateTime: file.lastModifiedDateTime,
            mimeType: file.file ? file.file.mimeType : undefined,
            downloadUrl: file["@microsoft.graph.downloadUrl"] || undefined,
            fileSize: file.size || undefined,
          } as OneDrivePathContent;
        });
        setCurrentPathContent((prevContents) => [...prevContents, ...moreContents]);
        setNextPageToken(nextLink || null);
      }
    } catch (error) {
      console.log("Error loading more OneDrive files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSelection = (content: OneDrivePathContent) => {
    if (content.fileType === "folder") {
      setCurrentPath((prevPath) => [...prevPath, content.name]);
      setFolderId(content.id);
      setNextPageToken(null);
    } else if (content.fileType === "file") {
      if (content.fileSize && content.fileSize > 10 * 1024 * 1024) {
        Alert.alert(
          "File Too Large",
          "Please select a document smaller than 10 MB. Your file was " + content.fileSize + " bytes."
        );
        return;
      }
      if (content.mimeType && !isValidFileType(content.mimeType)) {
        Alert.alert("Invalid File Type", "Please select a PDF or Word document");
        return;
      }
      setOneDriveFile(content);
    }
  };

  const displayCurrentPath = () => {
    return currentPath.join("/").replace("//", "/");
  };

  return (
    <>
      <View className="flex-1 px-6 py-4">
        {isLoading && currentPathContent.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4285F4" />
            <Text className="font-quicksand-medium text-gray-600 mt-4">Loading your files...</Text>
          </View>
        ) : (
          <View className="flex-1">
            <FlatList
              data={currentPathContent}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
              renderItem={({ item }) => {
                const isSelected = oneDriveFile?.id === item.id;
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
                    activeOpacity={0.7}
                    onPress={() => handleContentSelection(item)}
                  >
                    <View className="flex-row items-center gap-3">
                      <FileTypeIcon fileType={item.fileType} mimeType={item.mimeType || ""} />

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
                            {formatDate(item.lastModifiedDateTime)}
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
              ListHeaderComponent={() => {
                return (
                  <View className="mb-4">
                    <View className="flex-row items-center gap-3 mb-4">
                      {currentPath.length > 1 && (
                        <TouchableOpacity
                          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                          onPress={() => {
                            const newPath = currentPath.slice(0, -1);
                            setCurrentPath(newPath);
                            setOneDriveFile(null);
                          }}
                          activeOpacity={0.7}
                        >
                          <Feather name="arrow-left" size={18} color="#6b7280" />
                        </TouchableOpacity>
                      )}

                      <View className="flex-1">
                        <Text className="font-quicksand-bold text-lg text-gray-900 mb-1">
                          {currentPath[currentPath.length - 1] === "/"
                            ? "OneDrive Root"
                            : currentPath[currentPath.length - 1]}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Feather name="folder" size={12} color="#6b7280" />
                          <Text className="font-quicksand-medium text-xs text-gray-500" numberOfLines={1}>
                            {displayCurrentPath()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="h-px bg-gray-200 mb-4" />
                  </View>
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
                    onPress={loadMoreOneDriveFiles}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
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
              ListEmptyComponent={() => {
                if (isLoading) {
                  return (
                    <View className="flex-1 items-center justify-center">
                      <ActivityIndicator size="large" color="#4285F4" />
                      <Text className="font-quicksand-medium text-gray-600 mt-4">
                        Loading files from {displayCurrentPath()}...
                      </Text>
                    </View>
                  );
                }

                return (
                  <View className="flex-1 items-center justify-center">
                    <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                      <Feather name="folder" size={28} color="#9ca3af" />
                    </View>
                    <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">
                      No Files Found in {displayCurrentPath()}
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-gray-500 text-center">
                      This folder appears to be empty
                    </Text>
                  </View>
                );
              }}
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
              setOneDriveFile(null);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-xl py-4 items-center justify-center ${
              oneDriveFile ? "bg-emerald-500" : "bg-gray-300"
            }`}
            style={{
              shadowColor: oneDriveFile ? "#3b82f6" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: oneDriveFile ? 0.2 : 0,
              shadowRadius: 4,
              elevation: oneDriveFile ? 3 : 0,
            }}
            onPress={onClose}
            disabled={!oneDriveFile}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="check" size={18} color={oneDriveFile ? "white" : "#9ca3af"} />
              <Text className={`font-quicksand-bold text-base ${oneDriveFile ? "text-white" : "text-gray-500"}`}>
                Done
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Text className="font-quicksand-medium text-blue-800 text-sm text-center">
            {oneDriveFile && oneDriveFile.name ? `Selected: ${oneDriveFile.name}` : "No file selected."}
          </Text>
        </View>
      </View>
    </>
  );
};

export default OneDriveFileSelector;
