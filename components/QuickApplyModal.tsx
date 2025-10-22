import useAuthStore from "@/store/auth.store";
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
  handleUnAuthenticatedQuickApply: () => void;
}) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/45 justify-center items-center">
        <View
          style={{
            width: 300,
            height: 200,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            gap: 10,
          }}
        >
          {!isAuthenticated ? (
            <>
              <Text className="font-quicksand-bold text-xl">Sign in to Quick Apply</Text>
              <Text className="font-quicksand-medium text-center">You need to be signed in to use Quick Apply.</Text>
              <View className="flex flex-row items-center justify-center w-full gap-2">
                <TouchableOpacity
                  className="apply-button w-1/2 items-center justify-center h-14"
                  onPress={handleUnAuthenticatedQuickApply}
                >
                  <Text className="font-quicksand-bold">Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="apply-button w-1/2 items-center justify-center h-14"
                  onPress={() => handleClose(false, true)}
                >
                  <Text className="font-quicksand-bold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
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
              <Text className="font-quicksand-bold text-xl">Cannot Quick Apply</Text>
              <Text className="font-quicksand-medium text-center">
                You need to upload a resume to quick apply for jobs.
              </Text>
              <TouchableOpacity
                className="apply-button w-1/2 items-center justify-center h-14"
                onPress={() => {
                  handleClose(false, false);
                  router.push("/userProfile/manageDocs");
                }}
              >
                <Text className="font-quicksand-bold">Upload Resume</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default QuickApplyModal;
