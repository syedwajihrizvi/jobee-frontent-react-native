import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ModalWithBg from "./ModalWithBg";
import RenderCompanyLogo from "./RenderCompanyLogo";

const PrepareWithJobee = ({
  visible,
  context,
  isPreparing,
  handlePrepareWithJobeeConfirm,
  handleClose,
}: {
  visible: boolean;
  isPreparing: boolean;
  context: {
    companyName: string;
    companyLogoUrl: string;
    positionTitle: string;
  };
  handlePrepareWithJobeeConfirm: () => void;
  handleClose: () => void;
}) => {
  return (
    <ModalWithBg visible={visible} customHeight={0.6} customWidth={0.9}>
      {isPreparing ? (
        <View className="p-4">
          <View className="items-center mb-4">
            <View className="bg-emerald-100 rounded-full p-4 mb-3">
              <Feather name="book-open" size={32} color="#059669" />
            </View>
            <Text className="font-quicksand-bold text-2xl text-gray-900 text-center">
              Interview Prepartion In Progress
            </Text>
          </View>
          <View className="items-center">
            <RenderCompanyLogo logoUrl={context.companyLogoUrl} size={16} />
          </View>
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <Text className="font-quicksand-semibold text-sm text-gray-700 text-center leading-5">
              We are currently generating your interview preparation with{" "}
              <Text className="font-quicksand-bold text-emerald-600">{context.companyName}</Text> for the position of{" "}
              <Text className="font-quicksand-bold text-emerald-600">{context.positionTitle}</Text>.
            </Text>
            <Text className="font-quicksand-semibold text-sm text-center text-gray-500">
              We are notify you once it is ready.
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="check-circle" size={18} color="white" />
                <Text className="font-quicksand-bold text-white text-base">Thanks</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="p-4">
          <View className="items-center mb-4">
            <View className="bg-emerald-100 rounded-full p-4 mb-3">
              <Feather name="book-open" size={32} color="#059669" />
            </View>
            <Text className="font-quicksand-bold text-2xl text-gray-900">Prepare with Jobee</Text>
          </View>
          <View className="items-center mb-4">
            <RenderCompanyLogo logoUrl={context.companyLogoUrl} size={16} />
          </View>
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <Text className="font-quicksand-semibold text-sm text-gray-700 text-center leading-5">
              Get ready for your interview with{" "}
              <Text className="font-quicksand-bold text-emerald-600">{context.companyName}</Text> for the position of{" "}
              <Text className="font-quicksand-bold text-emerald-600">{context.positionTitle}</Text>. We will provide you
              with tailored interview questions, tips, and resources to help you succeed.
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handlePrepareWithJobeeConfirm}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="check-circle" size={18} color="white" />
                <Text className="font-quicksand-bold text-white text-base">Prepare</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ModalWithBg>
  );
};

export default PrepareWithJobee;
