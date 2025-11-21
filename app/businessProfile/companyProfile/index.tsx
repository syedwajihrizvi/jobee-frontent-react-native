import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import ProfileCard from "@/components/ProfileCard";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import { getS3CompanyLogoUrl } from "@/lib/s3Urls";
import {
  getCustomCompanyFormPlaceholderField,
  updateCompanyLocation,
  updateCompanyLogo,
  updateCompanyProfile,
} from "@/lib/updateProfiles/businessProfile";
import { mapCompanyProfileToAPIField } from "@/lib/updateUserProfile";
import { handleProfileImagePicker } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useCompanyStore from "@/store/company.store";
import { BusinessUser } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const getFieldMaxLength = (field: string) => {
  switch (field) {
    case "Company Name":
      return 30;
    case "Founded Year":
      return 4;
    case "Industry":
      return 55;
    case "Number of Employees":
      return 6;
    case "City":
      return 28;
    case "Country":
      return 28;
    case "State":
      return 28;
    case "Description":
      return 500;
    case "Website":
      return 100;
    default:
      return 30;
  }
};

const getFieldInfo = (field: string) => {
  switch (field) {
    case "Company Name":
      return "Enter the name of your company.";
    case "Founded Year":
      return "Enter the year the company was founded.";
    case "Industry":
      return "Enter the industry the company is a part of.";
    case "Location":
      return "Company's headquarters current city and state/country (e.g., San Francisco, CA or London, UK).";
    case "Number of Employees":
      return "Enter the total number of employees in your company.";
    case "Description":
      return "Provide a brief description of your company.";
    case "Website":
      return "Enter the official website URL of your company.";
    default:
      return "Update this field with your current information.";
  }
};

const CompanyProfile = () => {
  const { user: authUser } = useAuthStore();
  const user = authUser as BusinessUser | null;
  const {
    hasValidCompanyInformation,
    refreshCompanyInformation,
    isLoadingCompanyInformation,
    getCompanyInformation,
    updateCompanyLogoUrl,
    updateCompany,
  } = useCompanyStore();
  const [uploadingUserProfileImage, setUploadingUserProfileImage] = useState(false);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    value: "",
  });
  const [locationForm, setLocationForm] = useState({
    city: "",
    country: "",
    state: "",
  });

  const company = getCompanyInformation(user?.companyId as number);
  const isLoading = isLoadingCompanyInformation();

  useEffect(() => {
    const cacheValid = hasValidCompanyInformation(user?.companyId as number);
    if (user?.companyId && !cacheValid) {
      refreshCompanyInformation(user.companyId);
    }
  }, [user?.companyId]);

  const getCurrentFieldValue = (field: string) => {
    switch (field) {
      case "Company Name":
        return company?.name || "";
      case "Founded Year":
        return company?.foundedYear ? company.foundedYear.toString() : "";
      case "Industry":
        return company?.industry || "";
      case "Number of Employees":
        return company?.numEmployees ? company.numEmployees.toString() : "";
      case "Location":
        return company?.location || "";
      case "Description":
        return company?.description || "";
      case "Company Website":
        return company?.website || "";
      default:
        return "";
    }
  };

  const handleEditPress = (field: string) => {
    setUpdateSuccess(false);
    setEditingField(field);
    console.log("Editing field:", field);
    if (field !== "Location") {
      const currentValue = getCurrentFieldValue(field);
      setCompanyForm({ value: currentValue || "" });
    } else {
      setLocationForm({
        city: company?.hqCity || "",
        country: company?.hqCountry || "",
        state: company?.hqState || "",
      });
    }
    setShowModal(true);
  };

  const submitProfileUpdate = async () => {
    setIsSubmitting(true);
    if (!editingField) return;
    try {
      if (editingField !== "Location") {
        const fieldName = mapCompanyProfileToAPIField(editingField);
        const res = await updateCompanyProfile({
          field: fieldName,
          value: companyForm.value.trim(),
          companyId: user?.companyId as number,
        });
        if (res) {
          setCompanyForm({ value: "" });
          setEditingField(null);
          updateCompany(user?.companyId as number, { [fieldName]: companyForm.value.trim() });
          setUpdateSuccess(true);
        }
      } else {
        const { city, country, state } = locationForm;
        const res = await updateCompanyLocation({
          city: city.trim(),
          country: country.trim(),
          state: state.trim(),
          companyId: user?.companyId as number,
        });
        if (res) {
          updateCompany(user?.companyId as number, {
            location: `${city.trim()}, ${state.trim()}, ${country.trim()}`,
            hqCity: city.trim(),
            hqCountry: country.trim(),
            hqState: state.trim(),
          });
          setLocationForm({ city: "", country: "", state: "" });
          setEditingField(null);
          setUpdateSuccess(true);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCompanyLogo = () => {
    if (uploadingUserProfileImage) return <ActivityIndicator size="small" color="#0000ff" />;
    if (uploadedProfileImage) {
      return (
        <Image
          source={{ uri: uploadedProfileImage }}
          className="rounded-md"
          style={{ width: 30, height: 30 }}
          resizeMode="contain"
        />
      );
    }
    if (company && company.logoUrl) {
      return (
        <Image
          source={{ uri: getS3CompanyLogoUrl(company.logoUrl) }}
          className="rounded-md"
          style={{ width: 30, height: 30 }}
          resizeMode="contain"
        />
      );
    }
    return <Feather name="image" size={20} color="#10b981" />;
  };

  const uploadCompanyLogo = async (image: ImagePicker.ImagePickerResult) => {
    if (!image || !image.assets || image.assets.length === 0) {
      Alert.alert("No Image Selected", "Please select an image to upload.");
      return;
    }
    setUploadingUserProfileImage(true);
    try {
      const response = await updateCompanyLogo(image, user?.companyId as number);
      if (response) {
        Alert.alert("Success", "Profile image updated successfully.");
        setUploadedProfileImage(response.profileImageUrl);
        updateCompanyLogoUrl(user?.companyId as number, response.profileImageUrl);
      } else {
        Alert.alert("Error", "Failed to update profile image. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while uploading the profile image. Please try again.");
    } finally {
      setUploadingUserProfileImage(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden={true} />
      <BackBar label="Edit Company Profile" />
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
              View and edit your company information
            </Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              Update your company details, size, location, media, and more.
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
                label="Company Logo"
                withBackground={company?.logoUrl ? false : true}
                subtitle={"Upload or change your company logo"}
                icon={renderCompanyLogo()}
                handleEditPress={() => handleProfileImagePicker({ onSuccess: uploadCompanyLogo })}
              />
              <ProfileCard
                label="Company Name"
                subtitle={company?.name || "Not Provided"}
                icon={<FontAwesome5 name="building" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Company Website"
                subtitle={company?.website || "Not Provided"}
                icon={<FontAwesome5 name="link" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Description"
                subtitle={(company?.description && company?.description.slice(0, 100)) || "Not Provided"}
                icon={<FontAwesome5 name="building" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Founded Year"
                subtitle={company?.foundedYear ? company.foundedYear.toString() : "Not Provided"}
                icon={<FontAwesome5 name="calendar" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Industry"
                subtitle={company?.industry || "Not Provided"}
                icon={<Feather name="layers" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Number of Employees"
                subtitle={company?.numEmployees ? company.numEmployees.toString() : "Not Provided"}
                icon={<FontAwesome5 name="users" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
              <ProfileCard
                label="Location"
                subtitle={company?.location || "Not Provided"}
                icon={<Feather name="map-pin" size={18} color="#22c55e" />}
                handleEditPress={handleEditPress}
              />
            </View>
          )}
        </View>
      </ScrollView>
      <ModalWithBg
        visible={showModal}
        customHeight={editingField === "Location" || editingField === "Description" ? 0.55 : 0.5}
        customWidth={0.75}
      >
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          enableResetScrollToCoords={false}
        >
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
                  {editingField === "Description" && (
                    <View className="px-6">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-quicksand-medium text-sm text-gray-600">{editingField}</Text>
                        <Text className="font-quicksand-medium text-xs text-gray-500">
                          {companyForm.value.length}/{getFieldMaxLength(editingField || "")} characters
                        </Text>
                      </View>
                      <CustomMultilineInput
                        value={companyForm.value}
                        placeholder={getCustomCompanyFormPlaceholderField(editingField || "")}
                        onChangeText={(text) => setCompanyForm({ value: text })}
                      />
                    </View>
                  )}
                  {editingField === "Location" && (
                    <View className="px-6">
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">City</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {locationForm.city.length}/{getFieldMaxLength("City")} characters
                          </Text>
                        </View>
                        <CustomInput
                          placeholder="e.g., San Francisco"
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
                          placeholder="e.g., USA"
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
                          placeholder="e.g., CA"
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
                    </View>
                  )}
                  {editingField !== "Location" && editingField !== "Description" && (
                    <View className="px-6">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-quicksand-medium text-sm text-gray-600">{editingField}</Text>
                        <Text className="font-quicksand-medium text-xs text-gray-500">
                          {companyForm.value.length}/{getFieldMaxLength(editingField || "")} characters
                        </Text>
                      </View>
                      <CustomInput
                        placeholder={getCustomCompanyFormPlaceholderField(editingField || "")}
                        label=""
                        autoCapitalize={editingField === "Company Website" ? "none" : "words"}
                        onChangeText={(text) => setCompanyForm({ value: text })}
                        value={companyForm.value}
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
                  )}
                  <View className="px-6 pb-4">
                    <ProfileButton
                      color="emerald-500"
                      buttonText="Update Information"
                      handlePress={submitProfileUpdate}
                      disabled={
                        !companyForm.value.trim() &&
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
        </KeyboardAwareScrollView>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default CompanyProfile;
