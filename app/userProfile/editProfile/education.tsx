import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import UpdatingProfileView from "@/components/UpdatingProfileView";
import { addEducation, deleteEducation, editEducation } from "@/lib/updateUserProfile";
import useUserStore from "@/store/user.store";
import { AddUserEducationForm, Education } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const Educations = () => {
  const {
    getEducations,
    fetchUserEducations,
    isLoadingEducations,
    hasValidEducations,
    updateEducations,
    removeEducation,
  } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [educationForm, setEducationForm] = useState<AddUserEducationForm>({
    id: 0,
    institution: "",
    degree: "",
    fromYear: "",
    toYear: "",
    level: "",
  });

  useEffect(() => {
    if (!hasValidEducations()) {
      fetchUserEducations();
    }
  }, []);

  const resetStates = () => {
    setIsSubmitting(false);
    setIsEditing(false);
    setIsAdding(false);
    setShowModal(false);
    setEducationForm({
      id: 0,
      institution: "",
      degree: "",
      fromYear: "",
      toYear: "",
      level: "",
    });
    setAddSuccess(false);
    setEditSuccess(false);
    setDeleteSuccess(false);
  };

  const handleAddNewEducation = () => {
    resetStates();
    setIsAdding(true);
    setShowModal(true);
  };

  const handleEditEducation = (education: Education) => {
    resetStates();
    setEducationForm({
      id: education.id,
      institution: education.institution,
      degree: education.degree,
      fromYear: education.fromYear,
      toYear: education.toYear || "Present",
      level: education.level,
    });
    setShowModal(true);
  };

  const submitNewEducation = async () => {
    setIsSubmitting(true);
    console.log("Submitting new education:", educationForm);
    try {
      const res = await addEducation(educationForm);
      if (res) {
        updateEducations(res);
        setAddSuccess(true);
      }
    } catch (error) {
      console.log("Error adding education:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditEducation = async () => {
    setIsSubmitting(true);
    try {
      const res = await editEducation(educationForm.id, educationForm);
      if (res) {
        const index = educations.findIndex((edu) => edu.id === educationForm.id);
        if (typeof index === "number" && index >= 0) {
          updateEducations(res);
          setEditSuccess(true);
        }
      }
    } catch (error) {
      console.log("Error editing education:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDeleteEducation = async () => {
    Alert.alert("Delete Education", "Are you sure you want to delete this education? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsSubmitting(true);
          try {
            const res = await deleteEducation(educationForm.id);
            if (res) {
              removeEducation(educationForm.id);
              setDeleteSuccess(true);
            }
          } catch (error) {
            console.log("Error deleting education:", error);
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  const educations = getEducations();
  console.log("Educations:", educations);
  const isLoading = isLoadingEducations;
  return (
    <SafeAreaView>
      <BackBar label="Education" />
      <ScrollView>
        <View className="px-6 py-6">
          <View
            className="relative mb-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center">
                <FontAwesome5 name="graduation-cap" size={18} color="white" />
              </View>
              <View className="bg-emerald-100 px-3 py-1.5 rounded-full">
                <Text className="font-quicksand-bold text-xs text-emerald-700">ACADEMIC BACKGROUND</Text>
              </View>
            </View>
            <Text className="font-quicksand-bold text-xl text-gray-800 mb-3">View and edit your educations.</Text>
            <Text className="font-quicksand-medium text-gray-600 leading-6 text-base">
              These are automatically extracted from your resume, but you can update, add, or delete educations to
              better reflect your academic background.
            </Text>
          </View>
        </View>
        <View className="px-6 pb-6">
          {isLoading ? (
            <View className="flex items-center justify-center py-12">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-medium text-gray-600 mt-4">Loading Educations...</Text>
            </View>
          ) : (
            <View className="flex flex-col gap-4">
              <TouchableOpacity
                className="bg-emerald-500 rounded-xl px-6 py-4 flex-row items-center justify-center mb-2"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                onPress={handleAddNewEducation}
              >
                <Feather name="plus" size={18} color="white" />
                <Text className="text-white font-quicksand-bold text-base ml-2">Add New Education</Text>
              </TouchableOpacity>
              {educations && educations.length > 0 ? (
                <View className="gap-4">
                  {educations.map((edu, index) => (
                    <View
                      key={index}
                      className="bg-white rounded-2xl p-5 border border-gray-100"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <View className="flex-row items-start justify-between">
                        <Text className="font-quicksand-bold text-gray-800 text-lg mb-1 w-3/4" numberOfLines={4}>
                          {edu.degree}
                        </Text>
                        <TouchableOpacity
                          className="bg-emerald-100 p-2 rounded-full -top-2"
                          onPress={() => handleEditEducation(edu)}
                        >
                          <Feather name="edit-2" size={16} color="#10b981" />
                        </TouchableOpacity>
                      </View>
                      <View className="flex-row items-center mb-1">
                        <Text className="font-quicksand-semibold text-gray-600 text-base">{edu.institution}</Text>
                      </View>

                      <View className="flex-row items-center gap-2 mb-3">
                        <Feather name="calendar" size={14} color="#6b7280" />
                        <Text className="font-quicksand-medium text-gray-500 text-sm">
                          {edu.fromYear || "Unknown"} - {edu.toYear || "Present"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
                  <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                    <Feather name="book-open" size={24} color="#10b981" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Educations Added Yet</Text>
                  <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">
                    Showcase your academic experience to attract potential employers and highlight your qualifications.
                  </Text>
                  <TouchableOpacity className="bg-emerald-500 px-6 py-3 rounded-xl" onPress={() => {}}>
                    <Text className="font-quicksand-semibold text-white text-sm">Add Your First Education</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <ModalWithBg visible={showModal} customHeight={0.8} customWidth={0.9}>
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
          <Text className="font-quicksand-bold text-lg text-gray-800">
            {isAdding ? "Add New Eductation" : "Edit Education"}
          </Text>
          <TouchableOpacity onPress={() => setShowModal(false)} className="p-2">
            <Feather name="x" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <KeyboardAwareScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 gap-4 pt-4">
            <View className="px-6">
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <View className="flex-row items-start gap-2">
                  <Feather name="info" size={14} color="#3b82f6" />
                  <Text className="font-quicksand-medium text-xs text-blue-700 leading-4 flex-1">
                    {isAdding
                      ? "Add details about your previous or present educations."
                      : "Update the details of your education to keep your profile current."}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="flex-1 gap-2">
            {!isSubmitting ? (
              <>
                {addSuccess && (
                  <SuccessfulUpdate
                    editingField="Education"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setAddSuccess(false)}
                  />
                )}
                {editSuccess && (
                  <SuccessfulUpdate
                    editingField="Education"
                    type="edit"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setEditSuccess(false)}
                  />
                )}
                {deleteSuccess && (
                  <SuccessfulUpdate
                    editingField="Education"
                    type="delete"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setDeleteSuccess(false)}
                  />
                )}
                {!addSuccess && !editSuccess && !deleteSuccess && (
                  <>
                    <View className="px-6">
                      <View>
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">Institution</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {educationForm.institution.length}/75 characters
                          </Text>
                        </View>
                        <CustomInput
                          fontSize={12}
                          placeholder="e.g. Harvard University"
                          autoCapitalize="words"
                          label=""
                          onChangeText={(text) => setEducationForm({ ...educationForm, institution: text })}
                          value={educationForm.institution}
                          customClass="border border-gray-300 rounded-xl p-2 w-full font-quicksand-medium"
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
                    <View className="px-6">
                      <Text className="font-quicksand-medium text-sm text-gray-600 mb-3">Degree Type</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {[
                          { label: "High School", value: "HIGH_SCHOOL" },
                          { label: "Associate's", value: "ASSOCIATES" },
                          { label: "Bachelor's", value: "BACHELORS" },
                          { label: "Master's", value: "MASTERS" },
                          { label: "Doctorate", value: "PHD" },
                          { label: "Postdoctoral", value: "POSTDOCTORATE" },
                          { label: "Other", value: "Other" },
                        ].map((item) => (
                          <TouchableOpacity
                            key={item.value}
                            className={`px-4 py-2 rounded-full border ${
                              educationForm.level === item.value
                                ? "bg-emerald-500 border-emerald-500"
                                : "bg-gray-50 border-gray-300"
                            }`}
                            style={{
                              shadowColor: educationForm.level === item.value ? "#3b82f6" : "transparent",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: educationForm.level === item.value ? 0.2 : 0,
                              shadowRadius: 4,
                              elevation: educationForm.level === item.value ? 2 : 0,
                            }}
                            onPress={() => setEducationForm({ ...educationForm, level: item.value })}
                            activeOpacity={0.7}
                          >
                            <View className="flex-row items-center gap-2">
                              <Text
                                className={`font-quicksand-semibold text-xs ${
                                  educationForm.level === item.value ? "text-white" : "text-gray-700"
                                }`}
                              >
                                {item.label}
                              </Text>
                              {educationForm.level === item.value && (
                                <View className="w-4 h-4 bg-emerald-400 rounded-full items-center justify-center">
                                  <Feather name="check" size={10} color="white" />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View className="px-6">
                      <View>
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">Degree Title</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {educationForm.degree.length}/75 characters
                          </Text>
                        </View>
                        <CustomInput
                          placeholder="e.g. Bachelor of Science in Computer Science"
                          fontSize={12}
                          autoCapitalize="words"
                          label=""
                          onChangeText={(text) => setEducationForm({ ...educationForm, degree: text })}
                          value={educationForm.degree}
                          customClass="border border-gray-300 rounded-xl p-2 w-full font-quicksand-medium"
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
                    <View className="px-6">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-quicksand-medium text-sm text-gray-600">From (Year)</Text>
                      </View>
                      <CustomInput
                        placeholder="e.g. 2018"
                        fontSize={12}
                        label=""
                        onChangeText={(text) => setEducationForm({ ...educationForm, fromYear: text })}
                        value={educationForm.fromYear}
                        customClass="border border-gray-300 rounded-xl p-2 w-1/2 font-quicksand-medium"
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
                    <View className="px-6">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-quicksand-medium text-sm text-gray-600">To (Year)</Text>
                      </View>
                      <CustomInput
                        placeholder="e.g. 2023 or Present"
                        fontSize={12}
                        label=""
                        onChangeText={(text) => setEducationForm({ ...educationForm, toYear: text })}
                        value={educationForm.toYear}
                        customClass="border border-gray-300 rounded-xl p-2 w-1/2 font-quicksand-medium"
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
                    <View className="flex-1" />
                    <View className="px-6 gap-2 mt-2 mb-10">
                      {isAdding ? (
                        <ProfileButton
                          color="emerald-500"
                          buttonText="Add Experience"
                          handlePress={submitNewEducation}
                          disabled={isSubmitting}
                        />
                      ) : (
                        <View className="gap-3">
                          <ProfileButton
                            color="emerald-500"
                            buttonText="Update Experience"
                            handlePress={submitEditEducation}
                            disabled={isSubmitting}
                          />
                          <ProfileButton
                            color="red-400"
                            buttonText="Delete Experience"
                            handlePress={submitDeleteEducation}
                            disabled={isSubmitting}
                          />
                        </View>
                      )}
                    </View>
                  </>
                )}
              </>
            ) : (
              <UpdatingProfileView />
            )}
          </View>
        </KeyboardAwareScrollView>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default Educations;
