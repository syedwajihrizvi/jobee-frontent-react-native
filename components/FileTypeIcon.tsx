import { Feather } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

type Props = {
  fileType: string;
  mimeType: string;
};

const FileTypeIcon = ({ fileType, mimeType }: Props) => {
  if (fileType === "folder") {
    return (
      <View className="w-12 h-12 bg-yellow-100 rounded-lg items-center justify-center">
        <Feather name="folder" size={20} color="#f59e0b" />
      </View>
    );
  }

  const getFileIconAndColor = (mimeType: string) => {
    switch (mimeType) {
      // Documents
      case "application/pdf":
        return { icon: "file-text", color: "#ef4444", bgColor: "#fef2f2" }; // red
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/vnd.google-apps.document":
      case "application/vnd.oasis.opendocument.text":
      case "application/rtf":
        return { icon: "file-text", color: "#3b82f6", bgColor: "#eff6ff" }; // blue
      case "text/plain":
        return { icon: "file-text", color: "#6b7280", bgColor: "#f9fafb" }; // gray

      // Spreadsheets
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.oasis.opendocument.spreadsheet":
      case "application/vnd.google-apps.spreadsheet":
      case "text/csv":
        return { icon: "grid", color: "#16a34a", bgColor: "#f0fdf4" }; // green

      // Presentations
      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      case "application/vnd.oasis.opendocument.presentation":
        return { icon: "monitor", color: "#ea580c", bgColor: "#fff7ed" }; // orange

      // Images
      case "image/png":
      case "image/jpeg":
      case "image/gif":
      case "image/bmp":
      case "image/webp":
        return { icon: "image", color: "#10b981", bgColor: "#ecfdf5" }; // emerald

      // Audio
      case "audio/mpeg":
      case "audio/wav":
        return { icon: "music", color: "#8b5cf6", bgColor: "#faf5ff" }; // violet

      // Video
      case "video/mp4":
      case "video/quicktime":
      case "video/x-msvideo":
        return { icon: "video", color: "#ec4899", bgColor: "#fdf2f8" }; // pink

      // Archives
      case "application/zip":
      case "application/vnd.rar":
      case "application/x-7z-compressed":
      case "application/x-tar":
      case "application/gzip":
        return { icon: "archive", color: "#f59e0b", bgColor: "#fef3c7" }; // yellow

      // Default
      default:
        return { icon: "file", color: "#6b7280", bgColor: "#f9fafb" }; // gray
    }
  };

  const { icon, color, bgColor } = getFileIconAndColor(mimeType);

  return (
    <View className="w-12 h-12 rounded-lg items-center justify-center" style={{ backgroundColor: bgColor }}>
      <Feather name={icon as any} size={20} color={color} />
    </View>
  );
};

export default FileTypeIcon;
