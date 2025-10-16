import BackBar from "@/components/BackBar";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import { updateProfileSummary } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Summary = () => {
  const { user: authUser, setUser } = useAuthStore();
  const user = authUser as User | null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [summaryText, setSummaryText] = useState(user?.summary || "");
  const [showModal, setShowModal] = useState(false);

  const handleEditSummary = () => {
    setUpdateSuccess(false);
    setSummaryText(user?.summary || "");
    setShowModal(true);
  };

  const submitUpdatedProfile = async () => {
    if (summaryText.trim().length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await updateProfileSummary(summaryText);
      if (res) {
        setUser({ ...user, summary: summaryText } as User);
      }
      setUpdateSuccess(true);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
    console.log("Submitting updated profile summary:");
  };

  return (
    <SafeAreaView>
      <BackBar label="Education" />
      <ScrollView>
        <View className="px-6 py-6">
          <View
            className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">
              View and edit your professional summary
            </Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              Update your professional summary to reflect your current skills, experiences, and career goals. This helps
              potential employers understand your background and what you bring to the table.
            </Text>
          </View>
        </View>
        {user?.summary ? (
          <View className="py-3 px-6">
            <View className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-quicksand-bold text-lg text-gray-800">Profile Summary</Text>
                <TouchableOpacity onPress={handleEditSummary}>
                  <Feather name="edit" size={20} color="#22c55e" />
                </TouchableOpacity>
              </View>
              <Text className="font-quicksand-medium text-gray-600 leading-5">
                {user?.summary || "No summary provided."}
              </Text>
            </View>
          </View>
        ) : (
          <View className="py-3 px-6">
            <TouchableOpacity
              className="bg-green-500 rounded-xl px-6 py-4 flex-row items-center justify-center mb-6"
              style={{
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={() => setShowModal(true)}
            >
              <AntDesign name="plus" size={18} color="white" />
              <Text className="text-white font-quicksand-bold text-base ml-2">Add Summary</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <ModalWithBg visible={showModal} customHeight={0.7} customWidth={0.85}>
        <View>
          <View className="flex-row justify-between items-center px-6 py-2 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">Update Professional Summary</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
        {!isSubmitting ? (
          <View className="flex-1 gap-4 pt-4">
            {updateSuccess ? (
              <SuccessfulUpdate
                editingField="Summary"
                handleConfirm={() => setShowModal(false)}
                handleReedit={() => setUpdateSuccess(false)}
              />
            ) : (
              <>
                <View className="px-6">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-quicksand-medium text-sm text-gray-600">Professional Summary</Text>
                    <Text className="font-quicksand-medium text-xs text-gray-500">
                      {summaryText.length}/500 characters
                    </Text>
                  </View>
                  <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <View className="flex-row items-start gap-2">
                      <Feather name="info" size={14} color="#3b82f6" />
                      <Text className="font-quicksand-medium text-xs text-blue-700 leading-4 flex-1">
                        Include your key skills, experience highlights, and career objectives. Keep it concise and
                        impactful.
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="flex-1 px-6">
                  <CustomMultilineInput
                    value={summaryText}
                    placeholder="Write your professional summary here...
Example: Experienced software developer with 5+ years in mobile app development. Skilled in React Native, TypeScript, and API integration. Passionate about creating user-friendly applications and solving complex technical challenges..."
                    onChangeText={setSummaryText}
                  />
                </View>
                <View className="px-6 pb-4">
                  <ProfileButton
                    color="green-500"
                    buttonText="Update Summary"
                    handlePress={submitUpdatedProfile}
                    disabled={summaryText.trim().length === 0}
                  />
                </View>
              </>
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center gap-4 pt-4">
            <ActivityIndicator size="large" color="#22c55e" />
            <Text className="font-quicksand-semibold text-lg">Updating Your Summary..</Text>
          </View>
        )}
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default Summary;
