import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import UpdatingProfileView from "@/components/UpdatingProfileView";
import { useSkills } from "@/lib/services/useSkills";
import { addSkill, deleteSkill } from "@/lib/updateUserProfile";
import { AddUserSkillForm, UserSkill } from "@/type";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const Skills = () => {
  const { data: userSkills, isLoading } = useSkills();
  const [showModal, setShowModal] = useState(false);
  const [skillForm, setSkillForm] = useState<AddUserSkillForm>({ id: 0, skill: "", experience: "", skillId: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [_, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [skills, setSkills] = useState<UserSkill[] | undefined>(userSkills);
  const getExperienceLevel = (years: number) => {
    if (years >= 5) return { label: "Expert", color: "green-600" };
    if (years >= 3) return { label: "Advanced", color: "green-500" };
    if (years >= 1) return { label: "Intermediate", color: "yellow-500" };
    return { label: "Beginner", color: "gray-400" };
  };

  useEffect(() => {
    if (!isLoading && userSkills) {
      setSkills(userSkills);
    }
  }, [userSkills, isLoading]);

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
    // Navigate to edit skill modal or screen
    console.log("Editing skill:", skill);
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
    // Navigate to add skill modal or screen
    resetStates();
    setSkillForm({ id: 0, skill: "", experience: "", skillId: 0 });
    setIsAdding(true);
    setShowModal(true);
  };

  const submitNewSkill = async () => {
    console.log("Submitting updated skill:", skillForm);
    setIsSubmitting(true);
    console.log("Current skills before adding:", skills);
    try {
      const res = await addSkill(skillForm);
      console.log("Add skill response:", res);
      if (res) {
        const index = skills?.findIndex((s) => {
          console.log(`Comparing: ${s.skill.id}, ${res.skill.id}`);
          return s.skill.id === res.skill.id;
        });
        console.log("Skill index:", index);
        const updatedSkills = [...(skills || [])];
        if (typeof index === "number" && index >= 0) {
          console.log("Updating existing skill at index:", index);
          updatedSkills[index] = res;
          setSkills(updatedSkills);
          setAddSuccess(true);
        } else {
          console.log("Adding new skill");
          console.log(res);
          updatedSkills.push(res);
          setSkills(updatedSkills);
          setAddSuccess(true);
        }
      }
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitUpdatedSkill = async () => {
    console.log("Submitting updated skill:", skillForm);
    setIsSubmitting(true);
    console.log("Current skills before adding:", skills);
    try {
      const res = await addSkill(skillForm);
      console.log("Add skill response:", res);
      if (res) {
        console.log(res.skill.id);
        console.log("Current skills:", skills);
        const index = skills?.findIndex((s) => {
          console.log(`Comparing: ${s.skill.id}, ${res.skill.id}`);
          return s.skill.id === res.skill.id;
        });
        console.log("Skill index:", index);
        const updatedSkills = [...(skills || [])];
        if (typeof index === "number" && index >= 0) {
          console.log("Updating existing skill at index:", index);
          updatedSkills[index] = res;
          setSkills(updatedSkills);
          setEditSuccess(true);
        }
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
            console.log("Delete skill response:", res);
            console.log(skillForm.skillId);
            if (res) {
              console.log("Skill deleted successfully");
              console.log("Current skills before deletion:", skills);
              const index = skills?.findIndex((s) => s.id === skillForm.id);
              console.log("Deleted skill index:", index);
              const updatedSkills = skills?.filter((s) => s.id !== skillForm.id);
              setSkills(updatedSkills);
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
                className="bg-green-500 rounded-xl px-6 py-4 flex-row items-center justify-center mb-6"
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
                      const experienceLevel = getExperienceLevel(userSkill.experience);
                      return (
                        <TouchableOpacity
                          key={index}
                          className="bg-white border-2 border-gray-100 rounded-2xl p-4 min-w-[45%] flex-1"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 4,
                            elevation: 3,
                            maxWidth: "48%",
                          }}
                          onPress={() => handleEditSkill(userSkill)}
                        >
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="bg-green-100 px-2 py-1 rounded-full">
                              <Text className="font-quicksand-bold text-md text-green-700">{userSkill.skill.name}</Text>
                            </View>
                            <Feather name="edit-2" size={14} color="#6b7280" />
                          </View>
                          <View className="flex-row items-center gap-1 mb-3">
                            <Feather name="clock" size={12} color="#6b7280" />
                            <Text className="font-quicksand-medium text-gray-500 text-sm">
                              {userSkill.experience} {userSkill.experience === 1 ? "year" : "years"}
                            </Text>
                          </View>
                          <View>
                            <View className="flex-row justify-between items-center mb-1">
                              <Text className="font-quicksand-medium text-xs text-gray-500">Level</Text>
                              <Text className={`font-quicksand-bold text-xs text-${experienceLevel.color}`}>
                                {experienceLevel.label}
                              </Text>
                            </View>
                            <View className="w-full bg-gray-200 rounded-full h-2">
                              <View
                                className={`h-2 rounded-full bg-${experienceLevel.color}`}
                                style={{
                                  width: `${Math.min(userSkill.experience * 100, 100)}%`,
                                }}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Feather name="award" size={24} color="#9ca3af" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Skills Added Yet</Text>
                  <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">
                    Showcase your expertise by adding skills that highlight your professional abilities
                  </Text>
                  <TouchableOpacity className="bg-green-500 px-6 py-3 rounded-xl" onPress={handleAddSkill}>
                    <Text className="font-quicksand-semibold text-white text-sm">Add Your First Skill</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      <ModalWithBg visible={showModal} customHeight={0.8} customWidth={0.9}>
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
                    <View className="px-6">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-quicksand-medium text-sm text-gray-600">Years of Experience</Text>
                        <Text className="font-quicksand-medium text-xs text-gray-500">
                          {skillForm.experience.length > 0 ? `${skillForm.experience} years` : "Required"}
                        </Text>
                      </View>
                      <CustomInput
                        placeholder="e.g. 3"
                        label=""
                        keyboardType="default"
                        onChangeText={(text) => setSkillForm({ ...skillForm, experience: text })}
                        value={skillForm.experience}
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
                      {skillForm.experience && !isNaN(Number(skillForm.experience)) && (
                        <View className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <View className="flex-row items-center justify-between">
                            <Text className="font-quicksand-medium text-sm text-green-700">Experience Level:</Text>
                            <Text className="font-quicksand-bold text-sm text-green-800">
                              {getExperienceLevel(Number(skillForm.experience)).label}
                            </Text>
                          </View>
                          <View className="w-full bg-green-200 rounded-full h-2 mt-2">
                            <View
                              className={`h-2 rounded-full bg-green-600`}
                              style={{
                                width: `${Math.min((Number(skillForm.experience) / 5) * 100, 100)}%`,
                              }}
                            />
                          </View>
                        </View>
                      )}
                    </View>
                    <View className="px-6">
                      <View className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <Text className="font-quicksand-bold text-base text-gray-700 mb-2">Experience Guide:</Text>
                        <View className="gap-1">
                          <Text className="font-quicksand-medium text-sm text-gray-600">• 0-1 years: Beginner</Text>
                          <Text className="font-quicksand-medium text-sm text-gray-600">• 1-3 years: Intermediate</Text>
                          <Text className="font-quicksand-medium text-sm text-gray-600">• 3-5 years: Advanced</Text>
                          <Text className="font-quicksand-medium text-sm text-gray-600">• 5+ years: Expert</Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-1" />
                    <View className="px-6 pb-4">
                      {isAdding ? (
                        <ProfileButton
                          color="green-500"
                          buttonText="Add Skill"
                          handlePress={submitNewSkill}
                          disabled={!skillForm.skill.trim() || !skillForm.experience.trim()}
                        />
                      ) : (
                        <View className="gap-3">
                          <ProfileButton
                            color="green-500"
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
