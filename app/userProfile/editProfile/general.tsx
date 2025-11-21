import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import ProfileCard from "@/components/ProfileCard";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import { mapGeneralInfoFieldToAPIField, updateGeneralInfo, updateUserLocation } from "@/lib/updateUserProfile";
import { convert10DigitNumberToPhoneFormat, getCustomProfilePlaceholderForField } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getFieldMaxLength = (field: string) => {
  switch (field) {
    case "First Name":
    case "Last Name":
      return 30;
    case "Title":
      return 100;
    case "Company":
      return 50;
    case "Email":
      return 100;
    case "Phone Number":
      return 15;
    case "City":
      return 100;
    case "County":
      return 100;
    case "State":
      return 100;
    case "Province":
      return 2;
    default:
      return 100;
  }
};

const getFieldInfo = (field: string) => {
  switch (field) {
    case "First Name":
    case "Last Name":
      return "Enter your legal name as it appears on official documents.";
    case "Title":
      return "Your current job title or professional role (e.g., Senior Software Engineer, Marketing Manager).";
    case "Company":
      return "The name of your current employer or organization.";
    case "Email":
      return "Use a professional email address that you check regularly.";
    case "Phone Number":
      return "Enter your phone number with area code for professional contact.";
    case "Location":
      return "Your current city and state/country (e.g., San Francisco, CA or London, UK).";
    default:
      return "Update this field with your current information.";
  }
};
const General = () => {
  const queryClient = useQueryClient();
  const { user: authUser, setUser, isLoading } = useAuthStore();
  const user = authUser as User | null;
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    value: "",
  });
  const [locationForm, setLocationForm] = useState({
    city: "",
    country: "",
    state: "",
    province: "",
  });

  const handleEditPress = (field: string) => {
    setUpdateSuccess(false);
    setEditingField(field);
    // Pre-fill the form with current value
    if (field !== "Location") {
      const currentValue = getCurrentFieldValue(field);
      setProfileForm({ value: currentValue || "" });
    } else {
      setLocationForm({
        city: user?.city || "",
        country: user?.country || "",
        state: user?.state || "",
        province: user?.province || "",
      });
    }
    setShowModal(true);
  };

  const getCurrentFieldValue = (field: string) => {
    switch (field) {
      case "First Name":
        return user?.firstName || "";
      case "Last Name":
        return user?.lastName || "";
      case "Title":
        return user?.title || "";
      case "Company":
        return user?.company || "";
      case "Email":
        return user?.email || "";
      case "Phone Number":
        return user?.phoneNumber || "";
      case "Location":
        return user?.location || "";
      default:
        return "";
    }
  };

  const submitProfileUpdate = async () => {
    if (!editingField) return;
    const fieldName = mapGeneralInfoFieldToAPIField(editingField);
    setIsSubmitting(true);
    try {
      if (editingField !== "Location") {
        const res = await updateGeneralInfo({ field: fieldName, value: profileForm.value });
        if (res) setUser({ ...user, [fieldName]: profileForm.value } as User);
      } else {
        const res = await updateUserLocation({
          city: locationForm.city,
          country: locationForm.country,
          state: locationForm.state,
        });
        if (res)
          setUser({
            ...user,
            location: `${locationForm.city}, ${locationForm.state}, ${locationForm.country}`,
            city: locationForm.city,
            country: locationForm.country,
            state: locationForm.state,
          } as User);
      }
      setUpdateSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["profile-completeness"] });
    } catch (error) {
      console.log("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="General Information" />
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
              View and edit your general information
            </Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              Update your personal details such as name, email, phone number, and address to keep your profile current.
            </Text>
          </View>
        </View>
        <View className="py-3 px-6">
          {isLoading ? (
            <View className="flex flex-col items-center justify-center gap-4 mt-10">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-semibold text-lg">Fetching Profile Information...</Text>
            </View>
          ) : (
            <View className="flex flex-col gap-3">
              <ProfileCard
                label="First Name"
                subtitle={user?.firstName}
                icon={<Feather name="user" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Last Name"
                subtitle={user?.lastName}
                icon={<Feather name="user" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Title"
                subtitle={user?.title || "Not Provided"}
                icon={<Feather name="briefcase" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Company"
                subtitle={user?.company || "Not Provided"}
                icon={<FontAwesome5 name="building" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Email"
                subtitle={user?.email}
                icon={<Feather name="mail" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Phone Number"
                subtitle={convert10DigitNumberToPhoneFormat(user?.phoneNumber) || "Not Provided"}
                icon={<Feather name="phone" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Location"
                subtitle={user?.location || "Not Provided"}
                icon={<Feather name="map-pin" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <ModalWithBg visible={showModal} customHeight={editingField === "Location" ? 0.55 : 0.5} customWidth={0.75}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">Update {editingField || ""}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {!isSubmitting ? (
            <View className="flex-1 gap-4 pt-4">
              {updateSuccess ? (
                <SuccessfulUpdate
                  editingField={editingField}
                  handleConfirm={() => setShowModal(false)}
                  handleReedit={() => setUpdateSuccess(false)}
                />
              ) : (
                <>
                  <View className="px-6">
                    <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <View className="flex-row items-start gap-2">
                        <Feather name="info" size={14} color="#3b82f6" />
                        <Text className="font-quicksand-medium text-xs text-blue-700 leading-4 flex-1">
                          {getFieldInfo(editingField || "")}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {editingField !== "Location" ? (
                    <>
                      <View className="px-6">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">{editingField}</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {profileForm.value.length}/{getFieldMaxLength(editingField || "")} characters
                          </Text>
                        </View>
                        <CustomInput
                          placeholder={getCustomProfilePlaceholderForField(editingField || "")}
                          label=""
                          autoCapitalize="words"
                          onChangeText={(text) => setProfileForm({ value: text })}
                          value={profileForm.value}
                          customClass="border border-gray-300 rounded-xl p-3 w-full font-quicksand-medium"
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
                      {editingField === "Email" && profileForm.value && (
                        <View className="px-6">
                          <View
                            className={`p-3 rounded-lg border ${
                              profileForm.value.includes("@") && profileForm.value.includes(".")
                                ? "bg-emerald-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <View className="flex-row items-center gap-2">
                              <Feather
                                name={
                                  profileForm.value.includes("@") && profileForm.value.includes(".") ? "check" : "x"
                                }
                                size={14}
                                color={
                                  profileForm.value.includes("@") && profileForm.value.includes(".")
                                    ? "#22c55e"
                                    : "#ef4444"
                                }
                              />
                              <Text
                                className={`font-quicksand-medium text-xs ${
                                  profileForm.value.includes("@") && profileForm.value.includes(".")
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {profileForm.value.includes("@") && profileForm.value.includes(".")
                                  ? "Valid email format"
                                  : "Please enter a valid email address"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <View className="px-6">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">City</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {locationForm.city.length}/{getFieldMaxLength("City")} characters
                          </Text>
                        </View>
                        <CustomInput
                          placeholder="e.g. Seattle"
                          label=""
                          onChangeText={(text) => setLocationForm({ ...locationForm, city: text })}
                          value={locationForm.city}
                          autoCapitalize="words"
                          customClass="border border-gray-300 rounded-xl p-3 w-full font-quicksand-medium"
                          style={{
                            fontSize: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                        />
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">Country</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {locationForm.country.length}/{getFieldMaxLength("Country")} characters
                          </Text>
                        </View>
                        <CustomInput
                          placeholder="e.g. United States"
                          label=""
                          autoCapitalize="words"
                          onChangeText={(text) => setLocationForm({ ...locationForm, country: text })}
                          value={locationForm.country}
                          customClass="border border-gray-300 rounded-xl p-3 w-full font-quicksand-medium"
                          style={{
                            fontSize: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                        />
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">State/Province</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {locationForm.state.length}/{getFieldMaxLength("State")} characters
                          </Text>
                        </View>
                        <CustomInput
                          placeholder="e.g. WA"
                          label=""
                          onChangeText={(text) => setLocationForm({ ...locationForm, state: text })}
                          autoCapitalize="characters"
                          autocorrect={false}
                          value={locationForm.state}
                          customClass="border border-gray-300 rounded-xl p-3 w-full font-quicksand-medium"
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
                    </>
                  )}
                  <View className="flex-1" />
                  <View className="px-6 pb-4">
                    <ProfileButton
                      color="emerald-500"
                      buttonText="Update Information"
                      handlePress={submitProfileUpdate}
                      disabled={
                        !profileForm.value.trim() &&
                        !locationForm.city.trim() &&
                        !locationForm.state.trim() &&
                        !locationForm.country.trim()
                      }
                    />
                  </View>
                </>
              )}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center gap-4 pt-4">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-semibold text-lg">Updating Profile Information...</Text>
            </View>
          )}
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default General;
