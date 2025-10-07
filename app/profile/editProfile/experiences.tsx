import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import UpdatingProfileView from "@/components/UpdatingProfileView";
import { useExperiences } from "@/lib/services/useExperiences";
import { addExperience, deleteExperience } from "@/lib/updateUserProfile";
import { AddExperienceForm, Experience } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Experiences = () => {
  const { data: userExperiences, isLoading } = useExperiences();
  const [experiences, setExperiences] = useState<Experience[]>(userExperiences || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [experienceForm, setExperienceForm] = useState<AddExperienceForm>({
    id: 0,
    title: "",
    company: "",
    city: "",
    country: "",
    from: "",
    to: "",
    description: "",
  });

  useEffect(() => {
    if (!isLoading && userExperiences) {
      setExperiences(userExperiences);
    }
  }, [userExperiences, isLoading]);

  const resetStates = () => {
    setIsSubmitting(false);
    setDeleteSuccess(false);
    setEditSuccess(false);
    setAddSuccess(false);
    setIsEditing(false);
    setIsAdding(false);
    setExperienceForm({
      id: 0,
      title: "",
      company: "",
      city: "",
      country: "",
      from: "",
      to: "",
      description: "",
    });
    setShowModal(false);
  };

  const handleAddNewExperience = () => {
    resetStates();
    setIsAdding(true);
    setShowModal(true);
  };

  const handleEditExperience = (experience: Experience) => {
    resetStates();
    setExperienceForm({
      id: experience.id,
      title: experience.title,
      company: experience.company,
      city: experience.city || "",
      country: experience.country || "",
      from: experience.from,
      to: experience.to || "",
      description: experience.description || "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const submitNewExperience = async () => {
    console.log("Submitting new experience:", experienceForm);
    setIsSubmitting(true);
    try {
      const res = await addExperience(experienceForm);
      if (res) {
        console.log("Experience added successfully:", res);
        setExperiences((prev) => [res, ...prev]);
        setAddSuccess(true);
      }
    } catch (error) {
      console.error("Error adding experience:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditExperience = async () => {
    console.log("Submitting edited experience:", experienceForm);
    console.log("Editing experience:", experienceForm);
    setIsSubmitting(true);
    try {
      const res = await addExperience(experienceForm);
      if (res) {
        console.log("Experience added successfully:", res);
        const index = experiences.findIndex((exp) => exp.id === experienceForm.id);
        if (typeof index === "number" && index !== -1) {
          const updatedExperiences = [...experiences];
          updatedExperiences[index] = res;
          setExperiences(updatedExperiences);
        }
        setEditSuccess(true);
      }
    } catch (error) {
      console.error("Error adding experience:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDeleteExperience = async () => {
    console.log("Deleting experience with ID:", experienceForm.id);
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this experience? This action cannot be undone.", [
      { text: "Cancel", style: "cancel", onPress: () => {} },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteExperience(experienceForm.id);
            console.log("Delete experience response:", res);
            if (res) {
              const updatedExperiences = experiences.filter((exp) => exp.id !== experienceForm.id);
              setExperiences(updatedExperiences);
              setDeleteSuccess(true);
            }
          } catch (error) {
            console.error("Error deleting experience:", error);
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView>
      <BackBar label="Experiences" />
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
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">View and edit your work experiences</Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              These are automatically extracted from your resume, but you can update, add, or delete experiences to
              better reflect your professional background.
            </Text>
          </View>
        </View>

        <View className="px-6 pb-6">
          {isLoading ? (
            <View className="flex items-center justify-center py-12">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-medium text-gray-600 mt-4">Loading Experiences...</Text>
            </View>
          ) : (
            <View className="flex flex-col gap-4">
              <TouchableOpacity
                className="bg-green-500 rounded-xl px-6 py-4 flex-row items-center justify-center mb-2"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                onPress={handleAddNewExperience}
              >
                <Feather name="plus" size={18} color="white" />
                <Text className="text-white font-quicksand-bold text-base ml-2">Add New Experience</Text>
              </TouchableOpacity>
              {experiences && experiences.length > 0 ? (
                <View className="gap-4">
                  {experiences.map((exp, index) => (
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
                      <View className="flex-row items-start justify-between mb-1">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                              <Feather name="briefcase" size={14} color="#3b82f6" />
                            </View>
                            <View className="bg-blue-100 px-2 py-1 rounded-full">
                              <Text className="font-quicksand-bold text-xs text-blue-700">EXPERIENCE</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity className="p-1" onPress={() => handleEditExperience(exp)}>
                          <Feather name="edit-2" size={16} color="#6b7280" />
                        </TouchableOpacity>
                      </View>

                      <Text className="font-quicksand-bold text-gray-800 text-lg mb-1" numberOfLines={2}>
                        {exp.title}
                      </Text>

                      <View className="flex-row items-center mb-1">
                        <Text className="font-quicksand-semibold text-gray-600 text-base">{exp.company}</Text>
                      </View>

                      <View className="flex-row items-center gap-2 mb-1">
                        <Feather name="calendar" size={14} color="#6b7280" />
                        <Text className="font-quicksand-medium text-gray-500 text-sm">
                          {exp.from} - {exp.to || "Present"}
                        </Text>
                      </View>

                      {exp.city && (
                        <View className="flex-row items-center gap-2 mb-3">
                          <Feather name="map-pin" size={14} color="#6b7280" />
                          <Text className="font-quicksand-medium text-gray-500 text-sm">
                            {exp.city}, {exp.country}
                          </Text>
                        </View>
                      )}

                      {exp.description && (
                        <View className="mt-2 p-3 bg-gray-50 rounded-xl">
                          <Text className="font-quicksand-medium text-gray-700 text-sm leading-5" numberOfLines={3}>
                            {exp.description}
                          </Text>
                        </View>
                      )}
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <Feather name="clock" size={12} color="#22c55e" />
                            <Text className="font-quicksand-medium text-green-600 text-xs">
                              {/* Calculate duration here */}
                              Duration: 2 years 3 months
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Feather name="arrow-right" size={12} color="#9ca3af" />
                            <Text className="font-quicksand-medium text-gray-400 text-xs">Tap to edit</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Feather name="award" size={24} color="#9ca3af" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Experiences Added Yet</Text>
                  <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">
                    Showcase your professional experiences to attract potential employers and highlight your expertise.
                  </Text>
                  <TouchableOpacity className="bg-green-500 px-6 py-3 rounded-xl" onPress={() => {}}>
                    <Text className="font-quicksand-semibold text-white text-sm">Add Your First Experience</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <ModalWithBg visible={showModal} customHeight={0.8} customWidth={0.9}>
        <ScrollView className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">
              {isAdding ? "Add New Experience" : "Edit Experience"}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View className="flex-1 gap-4 pt-4">
            <View className="px-6">
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <View className="flex-row items-start gap-2">
                  <Feather name="info" size={14} color="#3b82f6" />
                  <Text className="font-quicksand-medium text-xs text-blue-700 leading-4 flex-1">
                    {isAdding
                      ? "Add details about your previous or present work experiences."
                      : "Update the details of your work experience to keep your profile current."}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="flex-1 gap-2">
            {!isSubmitting ? (
              <View className="flex-1 gap-4 pb-6">
                {addSuccess && (
                  <SuccessfulUpdate
                    editingField="Experience"
                    type="edit"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setAddSuccess(false)}
                  />
                )}
                {editSuccess && (
                  <SuccessfulUpdate
                    editingField="Experience"
                    type="edit"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setEditSuccess(false)}
                  />
                )}
                {deleteSuccess && (
                  <SuccessfulUpdate
                    editingField="Experience"
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
                          <Text className="font-quicksand-medium text-sm text-gray-600">Title</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {experienceForm.title.length}/50 characters
                          </Text>
                        </View>
                        <CustomInput
                          placeholder="e.g. Full Stack Developer"
                          autoCapitalize="words"
                          label=""
                          onChangeText={(text) => setExperienceForm({ ...experienceForm, title: text })}
                          value={experienceForm.title}
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
                      <View>
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">Company</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-500">
                            {experienceForm.title.length}/75 characters
                          </Text>
                        </View>
                        <CustomInput
                          placeholder="e.g. Amazon, Google, Microsoft"
                          autoCapitalize="words"
                          label=""
                          onChangeText={(text) => setExperienceForm({ ...experienceForm, company: text })}
                          value={experienceForm.company}
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
                    <View className="px-6 flex-row justify-between gap-1">
                      <View className="w-1/3">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">From (Year)</Text>
                        </View>
                        <CustomInput
                          placeholder="e.g. 2018"
                          label=""
                          onChangeText={(text) => setExperienceForm({ ...experienceForm, from: text })}
                          value={experienceForm.from}
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
                      <View className="w-1/3">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-quicksand-medium text-sm text-gray-600">To (Year)</Text>
                        </View>
                        <CustomInput
                          placeholder="e.g. 2023"
                          label=""
                          onChangeText={(text) => setExperienceForm({ ...experienceForm, to: text })}
                          value={experienceForm.to}
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
                        <Text className="font-quicksand-medium text-sm text-gray-600">City</Text>
                        <Text className="font-quicksand-medium text-xs text-gray-500">
                          {experienceForm.title.length}/30 characters
                        </Text>
                      </View>
                      <CustomInput
                        placeholder="e.g. New York, San Francisco"
                        label=""
                        autoCapitalize="words"
                        onChangeText={(text) => setExperienceForm({ ...experienceForm, city: text })}
                        value={experienceForm.city}
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
                    <View className="px-6">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-quicksand-medium text-sm text-gray-600">Country</Text>
                        <Text className="font-quicksand-medium text-xs text-gray-500">
                          {experienceForm.title.length}/30 characters
                        </Text>
                      </View>
                      <CustomInput
                        placeholder="e.g. United States, Canada"
                        autoCapitalize="words"
                        label=""
                        onChangeText={(text) => setExperienceForm({ ...experienceForm, country: text })}
                        value={experienceForm.country}
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
                    <View className="px-6">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-quicksand-medium text-sm text-gray-600">Description</Text>
                        <Text className="font-quicksand-medium text-xs text-gray-500">
                          {experienceForm.title.length}/30 characters
                        </Text>
                      </View>
                      <CustomMultilineInput
                        placeholder="Describe your experience"
                        value={experienceForm.description}
                        onChangeText={(text) => setExperienceForm({ ...experienceForm, description: text })}
                      />
                    </View>
                    <View className="px-6 gap-2 mt-2">
                      {isAdding ? (
                        <ProfileButton
                          color="green-500"
                          buttonText="Add Experience"
                          handlePress={submitNewExperience}
                          disabled={isSubmitting}
                        />
                      ) : (
                        <View className="gap-3">
                          <ProfileButton
                            color="green-500"
                            buttonText="Update Experience"
                            handlePress={submitEditExperience}
                            disabled={isSubmitting}
                          />
                          <ProfileButton
                            color="red-400"
                            buttonText="Delete Experience"
                            handlePress={submitDeleteExperience}
                            disabled={isSubmitting}
                          />
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>
            ) : (
              <UpdatingProfileView />
            )}
          </View>
        </ScrollView>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default Experiences;
