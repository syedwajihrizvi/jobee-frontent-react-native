import CustomInput from "@/components/CustomInput";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import { CompleteProfileForm } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  detailsForm: CompleteProfileForm;
  setDetailsForm: React.Dispatch<React.SetStateAction<CompleteProfileForm>>;
};

const AddGeneralInfo = ({ detailsForm, setDetailsForm }: Props) => {
  const getFieldIcon = (field: string) => {
    switch (field) {
      case "title":
        return "briefcase";
      case "city":
        return "map-pin";
      case "country":
        return "globe";
      case "phoneNumber":
        return "phone";
      case "summary":
        return "file-text";
      default:
        return "edit";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-2 py-8">
          <View className="items-center mb-8">
            <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-2">General Information</Text>
            <Text className="font-quicksand-medium text-gray-600 text-center leading-5">
              Let&apos;s start with some basic information about yourself to create your professional profile
            </Text>
          </View>

          <View className="gap-6">
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name={getFieldIcon("title")} size={16} color="#22c55e" />
                <Text className="font-quicksand-medium text-sm text-gray-600">Title</Text>
                <Text className="font-quicksand-medium text-xs text-red-500">*</Text>
              </View>
              <CustomInput
                placeholder="e.g. Software Engineer, Marketing Manager"
                label={null}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                value={detailsForm.title}
                onChangeText={(text) => setDetailsForm({ ...detailsForm, title: text })}
                style={{
                  fontSize: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name={getFieldIcon("city")} size={16} color="#22c55e" />
                  <Text className="font-quicksand-medium text-sm text-gray-600">City</Text>
                  <Text className="font-quicksand-medium text-xs text-red-500">*</Text>
                </View>
                <CustomInput
                  placeholder="e.g. Seattle"
                  label={null}
                  customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                  value={detailsForm.city}
                  onChangeText={(text) => setDetailsForm({ ...detailsForm, city: text })}
                  style={{
                    fontSize: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name={getFieldIcon("country")} size={16} color="#22c55e" />
                  <Text className="font-quicksand-medium text-sm text-gray-600">Country</Text>
                  <Text className="font-quicksand-medium text-xs text-red-500">*</Text>
                </View>
                <CustomInput
                  placeholder="e.g. United States"
                  label={null}
                  customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                  value={detailsForm.country}
                  onChangeText={(text) => setDetailsForm({ ...detailsForm, country: text })}
                  style={{
                    fontSize: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name={getFieldIcon("phoneNumber")} size={16} color="#22c55e" />
                <Text className="font-quicksand-medium text-sm text-gray-600">Phone Number</Text>
                <View className="bg-blue-100 px-2 py-1 rounded-full">
                  <Text className="font-quicksand-bold text-xs text-blue-700">OPTIONAL</Text>
                </View>
              </View>
              <CustomInput
                placeholder="e.g. (123) 456-7890"
                label={null}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                value={detailsForm.phoneNumber}
                onChangeText={(text) => setDetailsForm({ ...detailsForm, phoneNumber: text })}
                style={{
                  fontSize: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />
            </View>

            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name={getFieldIcon("summary")} size={16} color="#22c55e" />
                <Text className="font-quicksand-medium text-sm text-gray-600">Professional Summary</Text>
                <Text className="font-quicksand-medium text-xs text-red-500">*</Text>
              </View>
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <View className="flex-row items-start gap-2">
                  <Feather name="info" size={14} color="#3b82f6" />
                  <Text className="font-quicksand-medium text-xs text-blue-700 leading-4 flex-1">
                    Write a brief summary highlighting your key skills, experience, and career goals
                  </Text>
                </View>
              </View>
              <CustomMultilineInput
                value={detailsForm.summary}
                placeholder="e.g. Experienced software engineer with 5+ years in mobile development. Passionate about creating user-friendly applications..."
                onChangeText={(text) => setDetailsForm({ ...detailsForm, summary: text })}
              />
              <View className="absolute bottom-3 right-3">
                <Text className="font-quicksand-medium text-xs text-gray-400">{detailsForm.summary.length}/500</Text>
              </View>
            </View>
          </View>
          <View className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
            <Text className="font-quicksand-bold text-gray-800 text-sm mb-3">💡 Quick Tips:</Text>
            <View className="gap-2">
              <Text className="font-quicksand-medium text-gray-600 text-xs">
                • Use your current or most recent job title
              </Text>
              <Text className="font-quicksand-medium text-gray-600 text-xs">
                • Be specific about your location for better job matches
              </Text>
              <Text className="font-quicksand-medium text-gray-600 text-xs">
                • Keep your summary concise but highlight key achievements
              </Text>
              <Text className="font-quicksand-medium text-gray-600 text-xs">
                • Phone number helps employers contact you faster
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddGeneralInfo;
