import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const CompleteProfileReminder = ({ onComplete, onLater }: { onComplete: () => void; onLater: () => void }) => {
  const [modalVisible, setModalVisible] = useState(true);

  const handleProfileComplete = () => {
    setModalVisible(false);
    onComplete();
  };

  const handleProfileLater = () => {
    setModalVisible(false);
    onLater();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            width: Math.min(width - 48, 350),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <View className="bg-gradient-to-r from-green-500 to-blue-500 px-3 py-2 items-center">
            <View
              className="w-16 h-16 bg-white/20 rounded-full items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Feather name="user-plus" size={28} color="#21c55e" />
            </View>
            <Text className="font-quicksand-bold text-xl text-center">Complete Your Profile</Text>
          </View>

          <View className="px-6 py-3">
            <Text className="text-gray-800 font-quicksand-semibold text-base text-center mb-3">
              Stand out to employers!
            </Text>
            <Text className="text-gray-600 font-quicksand-medium text-sm text-center leading-5 mb-6">
              Complete your profile to increase your chances of getting hired by up to 85%. It&apos;s as simple as
              uploading your resume.
            </Text>

            <View className="gap-3 mb-6">
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="check" size={14} color="#22c55e" />
                </View>
                <Text className="text-gray-700 font-quicksand-medium text-sm flex-1">
                  Get matched with better job opportunities
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="check" size={14} color="#22c55e" />
                </View>
                <Text className="text-gray-700 font-quicksand-medium text-sm flex-1">
                  Showcase your skills and experience
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="check" size={14} color="#22c55e" />
                </View>
                <Text className="text-gray-700 font-quicksand-medium text-sm flex-1">
                  Quick setup in under 5 minutes
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <TouchableOpacity
                className="bg-emerald-500 py-4 rounded-xl items-center justify-center"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
                }}
                onPress={handleProfileComplete}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="arrow-right" size={18} color="white" />
                  <Text className="text-white font-quicksand-bold text-base">Complete Now</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-100 py-3 rounded-xl items-center justify-center border border-gray-200"
                onPress={handleProfileLater}
                activeOpacity={0.7}
              >
                <Text className="text-gray-600 font-quicksand-semibold text-sm">Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CompleteProfileReminder;
