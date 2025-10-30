import FileSelector from "@/components/FileSelector";
import ImportFromLinkedInButton from "@/components/ImportFromLinkedinButton";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const AddResume = () => {
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleImportFromLinkedIn = () => {
    console.log("Import from LinkedIn clicked");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAwareScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll
      >
        {uploadSuccess && (
          <SuccessfulUpdate
            type="uploadDocument"
            editingField="Document"
            handleConfirm={() => router.back()}
            handleReedit={() => setUploadSuccess(false)}
          />
        )}
        <ImportFromLinkedInButton />
        <View className="items-center justify-center">
          <Text className="font-quicksand-bold text-md">OR</Text>
        </View>
        <View className="items-center">
          <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-2">Add Your Resume</Text>
          <Text className="font-quicksand-medium text-gray-600 text-center leading-5">
            Upload your resume to showcase your skills and experience to potential employers
          </Text>
        </View>
        <View className="my-4 p-4 bg-white rounded-xl border border-gray-200">
          <Text className="font-quicksand-bold text-gray-800 text-sm mb-3">📄 Resume Tips:</Text>
          <View className="gap-2">
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Upload in PDF format for best compatibility
            </Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Keep file size under 5MB for faster loading
            </Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Ensure all text is readable and well-formatted
            </Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Include relevant keywords for your industry
            </Text>
          </View>
        </View>
        <FileSelector
          selectedDocumentType="RESUME"
          handleUploadSuccess={() => console.log("Upload successful")}
          customHandleUploadMethod={true}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddResume;
