import { getDropBoxFiles } from "@/lib/oauth/dropbox";
import { formatDate, getFileIcon } from "@/lib/utils";
import useOAuthDocStore from "@/store/oauth-doc.store";
import { DropBoxPathContent } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onClose: () => void;
};

const DropBoxFileSelector = ({ onClose }: Props) => {
  const [currentPath, setCurrentPath] = useState<string[]>(["/"]);
  const [currentPathContent, setCurrentPathContent] = useState<DropBoxPathContent[]>([]);
  const { dropboxFile, setDropboxFile } = useOAuthDocStore();
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPathContent = async () => {
      const result = await getDropBoxFiles(
        cursor || undefined,
        currentPath ? currentPath[currentPath.length - 1] : undefined
      );
      if (!result) return;
      const { entries, hasMore, cursor: newCursor } = result;
      const rootPathContents = entries.map((entry) => {
        return {
          id: entry.id,
          name: entry.name,
          pathDisplay: entry.path_display,
          fileType: entry[".tag"],
          serverModified: entry.server_modified,
          clientModified: entry.client_modified,
        } as DropBoxPathContent;
      });
      setCursor(newCursor);
      setHasMore(hasMore);
      setCurrentPathContent(rootPathContents);
    };
    setIsLoading(true);
    try {
      fetchPathContent();
    } catch (error) {
      console.log("Error fetching Dropbox path content:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPath]);

  const loadMoreDropboxFiles = async () => {
    if (!hasMore || !cursor) return;
    setIsLoading(true);
    try {
      const result = await getDropBoxFiles(cursor, currentPath ? currentPath[currentPath.length - 1] : undefined);
      if (!result) {
        return;
      }
      const { entries, hasMore, cursor: newCursor } = result;
      const moreContents = entries.map((entry) => {
        return {
          id: entry.id,
          name: entry.name,
          pathDisplay: entry.path_display,
          fileType: entry[".tag"],
          serverModified: entry.server_modified,
        } as DropBoxPathContent;
      });
      setCursor(newCursor);
      setHasMore(hasMore);
      setCurrentPathContent((prev) => [...prev, ...moreContents]);
    } catch (error) {
      console.log("Error loading more Google Drive files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Selected Dropbox File: ", dropboxFile);
  const handleContentSelection = (content: DropBoxPathContent) => {
    console.log("Selected content:", content);
    if (content.fileType === "folder") {
      setCursor(null);
      setCurrentPath((prev) => [...prev, content.pathDisplay]);
    }
    if (content.fileType === "file") {
      setDropboxFile(content);
    }
  };

  const displayCurrentPath = () => {
    return currentPath.join("/").replace("//", "/").replace(/^\//, "");
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
                const fileIcon = getFileIcon(item.fileType);
                const isSelected = dropboxFile?.id === item.id;
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
                            {formatDate(item.serverModified || item.clientModified || "")}
                          </Text>
                        </View>
                      </View>
                      {item.fileType !== "folder" && (
                        <View className="items-center">
                          {isSelected ? (
                            <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                              <Feather name="check" size={14} color="white" />
                            </View>
                          ) : (
                            <View className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                          )}
                        </View>
                      )}
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
                            setCursor(null);
                            setDropboxFile(null);
                          }}
                          activeOpacity={0.7}
                        >
                          <Feather name="arrow-left" size={18} color="#6b7280" />
                        </TouchableOpacity>
                      )}

                      <View className="flex-1">
                        <Text className="font-quicksand-bold text-lg text-gray-900 mb-1">
                          {currentPath[currentPath.length - 1] === "/"
                            ? "OneDrive"
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
                hasMore ? (
                  <TouchableOpacity
                    className="bg-green-500 rounded-xl p-4 flex-row items-center justify-center gap-3 mb-4"
                    style={{
                      shadowColor: "#3b82f6",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={loadMoreDropboxFiles}
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
                return (
                  <View className="flex-1 items-center justify-center">
                    <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                      <Feather name="folder" size={28} color="#9ca3af" />
                    </View>
                    <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">
                      No Files Found in {displayCurrentPath()}
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-gray-500 text-center"></Text>
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
              setDropboxFile(null);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-xl py-4 items-center justify-center ${
              dropboxFile ? "bg-green-500" : "bg-gray-300"
            }`}
            style={{
              shadowColor: dropboxFile ? "#3b82f6" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: dropboxFile ? 0.2 : 0,
              shadowRadius: 4,
              elevation: dropboxFile ? 3 : 0,
            }}
            onPress={onClose}
            disabled={!dropboxFile}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Feather name="check" size={18} color={dropboxFile ? "white" : "#9ca3af"} />
                <Text className={`font-quicksand-bold text-base ${dropboxFile ? "text-white" : "text-gray-500"}`}>
                  Done
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Text className="font-quicksand-medium text-blue-800 text-sm text-center">
            {dropboxFile && dropboxFile.name ? `Selected: ${dropboxFile.name}` : "No file selected."}
          </Text>
        </View>
      </View>
    </>
  );
};

export default DropBoxFileSelector;
