import useAuthStore from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const QuickApplyModal = ({
  visible,
  label,
  canQuickApply,
  handleClose,
  handleUnAuthenticatedQuickApply,
}: {
  visible: boolean;
  label: string;
  canQuickApply: boolean;
  handleClose: (apply: boolean, signedIn: boolean) => void;
  handleUnAuthenticatedQuickApply?: () => void;
}) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/45 justify-center items-center">
        <View
          style={{
            width: 300,
            height: 300,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            gap: 10,
          }}
        >
          {!isAuthenticated ? (
            <View className="items-center">
              <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                <Feather name="lock" size={28} color="#10b981" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">Sign in to Quick Apply</Text>
              <Text className="font-quicksand-medium text-center text-gray-600 mb-6 px-2 leading-5">
                You need to be signed in to use Quick Apply and access personalized job features.
              </Text>
              <View className="flex flex-row items-center justify-center w-full gap-3">
                <TouchableOpacity
                  className="bg-emerald-500 w-1/2 items-center justify-center h-12 rounded-lg flex-row gap-2"
                  style={{
                    shadowColor: "#10b981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={handleUnAuthenticatedQuickApply}
                  activeOpacity={0.8}
                >
                  <Feather name="log-in" size={16} color="white" />
                  <Text className="font-quicksand-semibold text-white">Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-200 w-1/2 items-center justify-center h-12 rounded-lg flex-row gap-2"
                  onPress={() => handleClose(false, true)}
                  activeOpacity={0.8}
                >
                  <Feather name="x" size={16} color="#6b7280" />
                  <Text className="font-quicksand-semibold text-gray-700">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : canQuickApply ? (
            <>
              <Text className="font-quicksand-bold text-xl">Quick Apply</Text>
              <Text className="font-quicksand-medium text-center">{label} with primary resume: Resume.pdf</Text>
              <View className="flex flex-row items-center justify-center w-full gap-2">
                <TouchableOpacity
                  className="apply-button w-1/2 items-center justify-center h-14"
                  onPress={() => handleClose(true, false)}
                >
                  <Text className="font-quicksand-bold">Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="apply-button w-1/2 items-center justify-center h-14"
                  onPress={() => handleClose(false, false)}
                >
                  <Text className="font-quicksand-bold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View className="items-center"></View>
              <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                <Feather name="file" size={28} color="#10b981" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">Resume Required</Text>
              <Text className="font-quicksand-medium text-center text-gray-600 mb-6 px-2 leading-5">
                You need to upload a resume to use Quick Apply for jobs.
              </Text>
              <View className="flex flex-row items-center justify-center w-full gap-3">
                <TouchableOpacity
                  className="bg-emerald-500 w-1/2 items-center justify-center h-12 rounded-lg flex-row gap-2"
                  style={{
                    shadowColor: "#10b981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => {
                    handleClose(false, false);
                    router.push("/userProfile/manageDocs");
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="upload" size={16} color="white" />
                  <Text className="font-quicksand-semibold text-white">Upload</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-200 w-1/2 items-center justify-center h-12 rounded-lg flex-row gap-2"
                  onPress={() => handleClose(false, false)}
                  activeOpacity={0.8}
                >
                  <Feather name="x" size={16} color="#6b7280" />
                  <Text className="font-quicksand-semibold text-gray-700">Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default QuickApplyModal;
