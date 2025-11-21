import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import UpdatingProfileView from "@/components/UpdatingProfileView";
import { addSkill, deleteSkill } from "@/lib/updateUserProfile";
import useUserStore from "@/store/user.store";
import { AddUserSkillForm } from "@/type";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const Skills = () => {
  const { getSkills, hasValidSkills, isLoadingSkills, fetchUserSkills, updateSkills, removeSkill } = useUserStore();
  const [showModal, setShowModal] = useState(false);
  const [skillForm, setSkillForm] = useState<AddUserSkillForm>({ id: 0, skill: "", experience: "", skillId: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [_, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const getExperienceLevel = (years: number) => {
    if (years >= 5) return { label: "Expert", color: "green-600" };
    if (years >= 3) return { label: "Advanced", color: "green-500" };
    if (years >= 1) return { label: "Intermediate", color: "yellow-500" };
    return { label: "Beginner", color: "gray-400" };
  };

  useEffect(() => {
    if (!hasValidSkills()) {
      fetchUserSkills();
    }
  }, []);

  const resetStates = () => {
    setAddSuccess(false);
    setEditSuccess(false);
    setDeleteSuccess(false);
    setIsSubmitting(false);
    setIsAdding(false);
    setIsEditing(false);
    setSkillForm({ id: 0, skill: "", experience: "", skillId: 0 });
    setShowModal(false);
  };

  const handleEditSkill = (skill: any) => {
    resetStates();
    setSkillForm({
      id: skill.id,
      skill: skill.skill.name,
      skillId: skill.skill.id,
      experience: skill.experience ? skill.experience.toString() : "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleAddSkill = () => {
    resetStates();
    setSkillForm({ id: 0, skill: "", experience: "", skillId: 0 });
    setIsAdding(true);
    setShowModal(true);
  };

  const submitNewSkill = async () => {
    setIsSubmitting(true);
    try {
      const res = await addSkill(skillForm);
      if (res) {
        updateSkills(res);
        setAddSuccess(true);
      }
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitUpdatedSkill = async () => {
    setIsSubmitting(true);
    try {
      const res = await addSkill(skillForm);
      if (res) {
        updateSkills(res);
        setEditSuccess(true);
      }
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDeletedSkill = async () => {
    Alert.alert("Delete Skill", "Are you sure you want to delete this skill?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsSubmitting(true);
          try {
            const res = await deleteSkill(skillForm.id);
            if (res) {
              removeSkill(skillForm.id);
              setDeleteSuccess(true);
            }
          } catch (error) {
            console.error("Error deleting skill:", error);
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  const skills = getSkills();
  const isLoading = isLoadingSkills;
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Skills" />
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">View and edit your skills</Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              These are automatically extracted from your resume, but you can add or remove skills to better reflect
              your expertise.
            </Text>
          </View>
        </View>

        <View className="px-6 pb-6">
          {isLoading ? (
            <View className="flex items-center justify-center py-12">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-medium text-gray-600 mt-4">Loading skills...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                className="bg-emerald-500 rounded-xl px-6 py-4 flex-row items-center justify-center mb-6"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                onPress={handleAddSkill}
              >
                <AntDesign name="plus" size={18} color="white" />
                <Text className="text-white font-quicksand-bold text-base ml-2">Add New Skill</Text>
              </TouchableOpacity>

              {skills && skills.length > 0 ? (
                <View className="gap-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-quicksand-bold text-lg text-gray-800">Your Skills</Text>
                    <Text className="font-quicksand-medium text-gray-600 text-sm">
                      {skills.length} skill{skills.length !== 1 ? "s" : ""}
                    </Text>
                  </View>

                  <View className="flex flex-row flex-wrap gap-3">
                    {skills.map((userSkill, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl p-5 min-w-[45%] flex-1"
                          style={{
                            shadowColor: "#10b981",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            elevation: 4,
                            maxWidth: "48%",
                          }}
                          onPress={() => handleEditSkill(userSkill)}
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-1 pr-2">
                              <Text className="font-quicksand-bold text-base text-emerald-700 mb-1" numberOfLines={1}>
                                {userSkill.skill.name}
                              </Text>
                            </View>
                            <View className="bg-emerald-100 p-2 rounded-full">
                              <Feather name="edit-2" size={14} color="#10b981" />
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
                  <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                    <Feather name="award" size={24} color="#10b981" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Skills Added Yet</Text>
                  <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">
                    Showcase your expertise by adding skills that highlight your professional abilities
                  </Text>
                  <TouchableOpacity className="bg-emerald-500 px-6 py-3 rounded-xl" onPress={handleAddSkill}>
                    <Text className="font-quicksand-semibold text-white text-sm">Add Your First Skill</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      <ModalWithBg visible={showModal} customHeight={0.5} customWidth={0.7}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">
              {isAdding ? "Add New Skill" : "Edit Skill"}
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
                      ? "Add skills that showcase your expertise. Include both technical and soft skills that are relevant to your career goals."
                      : "Update your skill details to keep your profile current and accurately reflect your experience level."}
                  </Text>
                </View>
              </View>
            </View>
            {!isSubmitting ? (
              <View className="flex-1 gap-4 pt-4">
                {deleteSuccess && (
                  <SuccessfulUpdate
                    editingField="Skill"
                    type="delete"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setDeleteSuccess(false)}
                  />
                )}
                {editSuccess && (
                  <SuccessfulUpdate
                    editingField="Skill"
                    type="edit"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setEditSuccess(false)}
                  />
                )}
                {addSuccess && (
                  <SuccessfulUpdate
                    editingField="Skill"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setAddSuccess(false)}
                  />
                )}
                {!editSuccess && !addSuccess && !deleteSuccess && (
                  <>
                    <View className="px-6">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-quicksand-medium text-sm text-gray-600">Skill Name</Text>
                        <Text className="font-quicksand-medium text-xs text-gray-500">
                          {skillForm.skill.length}/50 characters
                        </Text>
                      </View>
                      <CustomInput
                        placeholder="e.g. JavaScript, Project Management, Leadership"
                        label=""
                        autoCapitalize="words"
                        onChangeText={(text) => setSkillForm({ ...skillForm, skill: text })}
                        value={skillForm.skill}
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
                    <View className="flex-1" />
                    <View className="px-6 pb-4">
                      {isAdding ? (
                        <ProfileButton
                          color="emerald-500"
                          buttonText="Add Skill"
                          handlePress={submitNewSkill}
                          disabled={!skillForm.skill.trim() || !skillForm.experience.trim()}
                        />
                      ) : (
                        <View className="gap-3">
                          <ProfileButton
                            color="emerald-500"
                            buttonText="Update Skill"
                            handlePress={submitUpdatedSkill}
                            disabled={!skillForm.skill.trim() || !skillForm.experience.trim()}
                          />
                          <ProfileButton color="red-400" buttonText="Delete Skill" handlePress={submitDeletedSkill} />
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
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default Skills;
