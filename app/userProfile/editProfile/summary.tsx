import BackBar from "@/components/BackBar";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import ModalWithBg from "@/components/ModalWithBg";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import { getAIProfileSummary, updateProfileSummary } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const summaryPlaceholder =
  "Experienced software developer with 5+ years in mobile app development. Skilled in React Native, TypeScript, and API integration. Passionate about creating user-friendly applications and solving complex technical challenges. Seeking to leverage my expertise to contribute to innovative projects and drive business success. Open to new opportunities and collaborations in the tech industry. Also open to relocation for the right role.";

const Summary = () => {
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAuthStore();
  const user = authUser as User | null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [summaryText, setSummaryText] = useState(user?.summary || "");
  const [showModal, setShowModal] = useState(false);

  const handleEditSummary = () => {
    setUpdateSuccess(false);
    setSummaryText(user?.summary || "");
    setShowModal(true);
  };

  const submitUpdatedProfile = async () => {
    if (summaryText.trim().length === 0) {
      Alert.alert("Validation Error", "Summary cannot be empty.");
      return;
    }
    if (summaryText.length > 700) {
      Alert.alert("Validation Error", "Summary cannot exceed 700 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await updateProfileSummary(summaryText);
      if (res) {
        setUser({ ...user, summary: summaryText } as User);
        queryClient.invalidateQueries({ queryKey: ["profile-completeness"] });
      }
      setUpdateSuccess(true);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAISummary = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await getAIProfileSummary();
      if (res) {
        setSummaryText(res);
      } else {
        Alert.alert("AI Summary Generation Failed", "Please add more details to your profile and try again.");
        return;
      }
    } catch (error) {
      console.log("Error generating AI summary:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <SafeAreaView>
      <BackBar label="Professional Summary" />
      <ScrollView className="bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 py-8">
          <View
            className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-100"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center gap-4 mb-4">
              <View
                className="w-14 h-14 bg-emerald-100 rounded-2xl items-center justify-center"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                }}
              >
                <Feather name="file-text" size={28} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-bold text-2xl text-gray-900 mb-1">Professional Summary</Text>
                <Text className="font-quicksand-medium text-emerald-600 text-sm">
                  ✨ Make your first impression count
                </Text>
              </View>
            </View>

            <Text className="font-quicksand-medium text-gray-700 leading-6 mb-4 text-sm">
              Your professional summary is the first thing employers see. Make it compelling and highlight your unique
              value proposition to stand out from the competition.
            </Text>

            {/* Benefits */}
            <View className="flex-row gap-4">
              <View className="flex-1 bg-white/70 rounded-xl p-3 border border-emerald-200">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center">
                    <Feather name="trending-up" size={12} color="#10b981" />
                  </View>
                  <Text className="font-quicksand-bold text-emerald-800 text-xs">40% More Views</Text>
                </View>
                <Text className="font-quicksand-medium text-gray-600 text-xs">Profiles with summaries get noticed</Text>
              </View>

              <View className="flex-1 bg-white/70 rounded-xl p-3 border border-purple-200">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="w-5 h-5 bg-purple-100 rounded-full items-center justify-center">
                    <Feather name="zap" size={12} color="#8b5cf6" />
                  </View>
                  <Text className="font-quicksand-bold text-purple-800 text-xs">AI Powered</Text>
                </View>
                <Text className="font-quicksand-medium text-gray-600 text-xs">Generate in seconds</Text>
              </View>
            </View>
          </View>
        </View>

        {user?.summary ? (
          <View className="px-6 pb-6">
            <View
              className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center">
                    <Feather name="check-circle" size={20} color="#10b981" />
                  </View>
                  <View>
                    <Text className="font-quicksand-bold text-lg text-gray-900">Your Summary</Text>
                    <Text className="font-quicksand-medium text-emerald-600 text-sm">Looking great! 👍</Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-emerald-50 rounded-xl p-3 border border-emerald-200"
                  style={{
                    shadowColor: "#10b981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                  onPress={handleEditSummary}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-2" size={13} color="#10b981" />
                </TouchableOpacity>
              </View>

              <View className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <Text className="font-quicksand-medium text-gray-800 leading-6 text-sm">
                  {user?.summary || "No summary provided."}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="px-6 pb-6">
            <View
              className="bg-white rounded-2xl p-6 border-2 border-dashed border-emerald-200"
              style={{
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="items-center mb-6">
                <View
                  className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center mb-4 border-4 border-emerald-100"
                  style={{
                    shadowColor: "#10b981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  <Feather name="edit-3" size={32} color="#10b981" />
                </View>

                <Text className="font-quicksand-bold text-xl text-gray-900 mb-2 text-center">
                  Ready to Create Your Summary?
                </Text>
                <Text className="font-quicksand-medium text-gray-600 text-center leading-5 mb-6">
                  Stand out to employers with a compelling professional summary that showcases your expertise.
                </Text>
              </View>

              <View className="gap-3">
                <TouchableOpacity
                  className="bg-emerald-500 rounded-xl px-6 py-4 flex-row items-center justify-center gap-3"
                  style={{
                    shadowColor: "#10b981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                  onPress={() => setShowModal(true)}
                  activeOpacity={0.8}
                >
                  <Feather name="edit-3" size={20} color="white" />
                  <Text className="text-white font-quicksand-bold text-lg">Write Summary</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-blue-500 rounded-xl px-6 py-4 flex-row items-center justify-center gap-3"
                  style={{
                    shadowColor: "#8b5cf6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                  onPress={() => {
                    setShowModal(true);
                    handleGenerateAISummary();
                  }}
                  activeOpacity={0.9}
                >
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="sparkles" size={18} color="#fbbf24" />
                  </View>
                  <Text className="text-white font-quicksand-bold text-lg">Generate with AI</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      <ModalWithBg visible={showModal} customHeight={0.8} customWidth={0.9}>
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
                      {summaryText.length}/700 characters
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
                <View className="flex-1 px-6 gap-2">
                  <CustomMultilineInput
                    value={summaryText}
                    minHeight={350}
                    placeholder={summaryPlaceholder}
                    onChangeText={setSummaryText}
                  />
                  <TouchableOpacity
                    className="bg-blue-500 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg border border-blue-400"
                    style={{
                      shadowColor: "#3b82f6",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.25,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    onPress={handleGenerateAISummary}
                    disabled={isGeneratingAI}
                    activeOpacity={0.8}
                  >
                    {isGeneratingAI ? (
                      <>
                        <Text className="font-quicksand-bold text-white text-sm">Generating Summary</Text>
                        <ActivityIndicator size="small" color="white" />
                      </>
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={14} color="#fbbf24" />
                        <Text className="font-quicksand-bold text-white text-sm">
                          {user?.summary ? "Enhance" : "Generate"} with AI
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View className="px-6 pb-8">
                  <TouchableOpacity
                    className="bg-emerald-500 flex-row items-center justify-center gap-2 rounded-md px-6 py-4"
                    onPress={submitUpdatedProfile}
                    disabled={summaryText.trim().length === 0 || isGeneratingAI}
                  >
                    <Text className="font-quicksand-bold text-white text-lg">Update Summary</Text>
                    <Feather name="check-circle" size={18} color="white" className="mt-1" />
                  </TouchableOpacity>
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
