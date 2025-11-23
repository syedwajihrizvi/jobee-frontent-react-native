import BackBar from "@/components/BackBar";
import FileSelector from "@/components/FileSelector";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import { convertDocumentTypeToLabel, documentTypes } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const renderSubtitle = (type: string) => {
  switch (type) {
    case "RESUME":
      return "Upload a resume to apply to jobs.";
    case "COVER_LETTER":
      return "Add cover letters for job applications.";
    case "CERTIFICATE":
      return "Show your certifications";
    case "TRANSCRIPT":
      return "Highlight your educational background.";
    case "RECOMMENDATION":
      return "Upload recommendation letters to strengthen your profile.";
    default:
      return "Upload a document to enhance your professional library.";
  }
};
const UploadNewDoc = () => {
  const { initialType } = useLocalSearchParams();
  const [selectedDocumentType, setSelectedDocumentType] = useState((initialType as string) || "RESUME");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find((doc) => doc.value === type) || documentTypes[0];
  };

  const selectedDocInfo = getDocumentTypeInfo(selectedDocumentType);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackBar
        label="Upload Document"
        optionalCallback={() => {
          setUploadSuccess(false);
        }}
      />
      <KeyboardAwareScrollView className="flex-1 p-6 bg-gray-50" showsVerticalScrollIndicator={false}>
        {uploadSuccess && (
          <SuccessfulUpdate
            type="uploadResume"
            editingField="Document"
            handleConfirm={() => router.back()}
            handleReedit={() => setUploadSuccess(false)}
          />
        )}
        {!uploadSuccess && (
          <>
            <View className="items-center mb-2">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${selectedDocInfo.color}20` }}
              >
                <Feather name={selectedDocInfo.icon as any} size={28} color={selectedDocInfo.color} />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">
                Add New {convertDocumentTypeToLabel(selectedDocumentType)}
              </Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 text-center">
                {renderSubtitle(selectedDocumentType)}
              </Text>
            </View>
            <View className="mb-4">
              <Text className="font-quicksand-bold text-base text-gray-900 mb-4">Document Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {documentTypes.map((doc) => (
                  <TouchableOpacity
                    key={doc.value}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${
                      selectedDocumentType === doc.value ? "border-green-200 bg-emerald-50" : "border-gray-200 bg-white"
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
            <FileSelector
              selectedDocumentType={selectedDocumentType}
              handleUploadSuccess={() => setUploadSuccess(true)}
            />
          </>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default UploadNewDoc;
