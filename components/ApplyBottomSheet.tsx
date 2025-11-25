import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import { User, UserDocument } from "@/type";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "./CustomButton";
import DocumentItem from "./DocumentItem";

type ApplyBottomSheetProps = {
  isSubmittingApplication: boolean;
  handleSubmitApplication: (selectedResume: UserDocument | null, selectedCoverLetter: UserDocument | null) => void;
  closeSheet: () => void;
};

const ApplyBottomSheet = ({ isSubmittingApplication, handleSubmitApplication, closeSheet }: ApplyBottomSheetProps) => {
  const { user: authUser } = useAuthStore();
  const { getCoverLetterDocuments, getResumeDocuments, fetchUserDocuments, hasValidDocuments } = useUserStore();
  const user = authUser as User | null;
  const [selectedResume, setSelectedResume] = useState<UserDocument | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<UserDocument | null>(null);

  useEffect(() => {
    if (!hasValidDocuments()) {
      fetchUserDocuments();
    }
  }, []);

  const resumeDocuments = getResumeDocuments(user?.primaryResume?.id || null);
  const coverLetterDocuments = getCoverLetterDocuments();

  return (
    <View className="flex-1 rounded-t-2xl shadow-lg p-6">
      {user?.primaryResume ? (
        <>
          <View className="w-full flex-row items-center justify-between mb-4">
            <Text className="font-quicksand-bold text-lg">Confirm Application</Text>
            <TouchableOpacity
              onPress={() => router.push("/userProfile/uploadNewDoc")}
              className="px-3 py-2 rounded-lg bg-emerald-500"
            >
              <Text className="font-quicksand-semibold text-white text-sm">Add Document</Text>
            </TouchableOpacity>
          </View>
          <View className="mb-6">
            <Text className="font-quicksand-bold text-md mb-4">Resume</Text>
            <FlatList
              data={resumeDocuments}
              horizontal
              ItemSeparatorComponent={() => <View className="w-4" />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{
                paddingHorizontal: 2,
                flexGrow: 1,
                minWidth: "100%",
                flexDirection: "row",
                marginBottom: 8,
              }}
              renderItem={({ item }) => (
                <DocumentItem
                  canEdit={false}
                  document={item}
                  customAction={() => setSelectedResume(item)}
                  highlightPrimary={false}
                  standOut={item.id === selectedResume?.id}
                />
              )}
            />
          </View>
          <View className="h-px bg-gray-200" />
          <View className="mb-6 mt-2">
            <Text className="font-quicksand-bold text-md mb-2">Cover Letter (Optional)</Text>
            <View className="flex-row gap-3">
              <FlatList
                data={coverLetterDocuments}
                horizontal
                ItemSeparatorComponent={() => <View className="w-4" />}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{
                  paddingHorizontal: 2,
                  flexGrow: 1,
                  minWidth: "100%",
                  flexDirection: "row",
                  marginBottom: 8,
                }}
                renderItem={({ item }) => (
                  <DocumentItem
                    canEdit={false}
                    document={item}
                    highlightPrimary={false}
                    customAction={() => setSelectedCoverLetter(item)}
                    standOut={item.id === selectedCoverLetter?.id}
                  />
                )}
              />
            </View>
          </View>
          <View className="h-px bg-gray-200" />
          <View className="flex-row gap-3">
            <CustomButton
              customClass="apply-button flex-1 items-center justify-center h-14"
              onClick={() => handleSubmitApplication(selectedResume, selectedCoverLetter)}
              text="Submit Application"
              isLoading={isSubmittingApplication}
            />
            <CustomButton
              customClass="cancel-button flex-1 items-center justify-center h-14"
              onClick={closeSheet}
              text="Cancel"
            />
          </View>
        </>
      ) : (
        <View>
          <Text className="font-quicksand-bold text-xl mb-2">You need to upload a resume</Text>
          <Text className="font-quicksand-medium text-base text-gray-600 mb-4">
            You can upload multiple resumes and cover letters in your profile settings and select them when applying.
            You can also choose a primary resume to apply quickly.
          </Text>
          <CustomButton
            customClass="apply-button items-center justify-center h-14"
            onClick={() => router.push("/userProfile/manageDocs")}
            text="Upload Resume"
            isLoading={isSubmittingApplication}
          />
        </View>
      )}
    </View>
  );
};

export default ApplyBottomSheet;
