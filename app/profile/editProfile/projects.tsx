import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import UpdatingProfileView from "@/components/UpdatingProfileView";
import { useProjects } from "@/lib/services/useProjects";
import { addProject, deleteProject, editProject } from "@/lib/updateUserProfile";
import { AddProjectForm, Project } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Projects = () => {
  const { data: userProjects, isLoading } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>(userProjects || []);
  const [projectForm, setProjectForm] = useState<AddProjectForm>({
    id: 0,
    name: "",
    description: "",
    link: "",
    yearCompleted: "",
  });

  useEffect(() => {
    if (!isLoading && userProjects) {
      setProjects(userProjects);
    }
  }, [userProjects, isLoading]);

  const handleAddProject = () => {
    resetStates();
    setIsAdding(true);
    setShowModal(true);
  };

  const handleEditProject = (project: Project) => {
    resetStates();
    setIsEditing(true);
    setProjectForm({
      id: project.id,
      name: project.name,
      description: project.description,
      link: project.link,
      yearCompleted: project.yearCompleted,
    });
    setShowModal(true);
  };

  const resetStates = () => {
    setIsSubmitting(false);
    setAddSuccess(false);
    setEditSuccess(false);
    setDeleteSuccess(false);
    setIsEditing(false);
    setIsAdding(false);
    setProjectForm({
      id: 0,
      name: "",
      description: "",
      link: "",
      yearCompleted: "",
    });
    setShowModal(false);
  };

  const submitNewProject = async () => {
    setIsSubmitting(true);
    try {
      const res = await addProject(projectForm);
      if (res) {
        setProjects([res, ...(projects || [])]);
        setAddSuccess(true);
      }
    } catch (error) {
      console.log("Error adding project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditProject = async () => {
    console.log("Submitting edited project:", projectForm.id);
    setIsSubmitting(true);
    try {
      const res = await editProject(projectForm.id, projectForm);
      if (res) {
        const index = projects.findIndex((proj) => proj.id === projectForm.id);
        if (typeof index === "number" && index >= 0) {
          const updatedProjects = [...projects];
          updatedProjects[index] = res;
          setProjects(updatedProjects);
          setEditSuccess(true);
        }
      }
    } catch (error) {
      console.log("Error editing project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDeleteProject = async () => {
    Alert.alert("Delete Project", "Are you sure you want to delete this project? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsSubmitting(true);
          try {
            const res = await deleteProject(projectForm.id);
            if (res) {
              const updatedProjects = projects.filter((proj) => proj.id !== projectForm.id);
              setProjects(updatedProjects);
              setDeleteSuccess(true);
            }
          } catch (error) {
            console.log("Error deleting project:", error);
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView>
      <BackBar label="Project" />
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
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">View and edit your projects.</Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              These are automatically extracted from your resume, but you can update, add, or delete projects to better
              reflect your background.
            </Text>
          </View>
        </View>
        <View className="px-6 pb-6">
          {isLoading ? (
            <View className="flex items-center justify-center py-12">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-medium text-gray-600 mt-4">Loading Projects...</Text>
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
                onPress={handleAddProject}
              >
                <Feather name="plus" size={18} color="white" />
                <Text className="text-white font-quicksand-bold text-base ml-2">Add New Project</Text>
              </TouchableOpacity>
              {projects && projects.length > 0 ? (
                <View className="gap-4">
                  {projects.map((proj, index) => (
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
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                              <FontAwesome5 name="university" size={14} color="#3b82f6" />
                            </View>
                            <View className="bg-blue-100 px-2 py-1 rounded-full">
                              <Text className="font-quicksand-bold text-xs text-blue-700">PROJECT</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity className="p-1" onPress={() => handleEditProject(proj)}>
                          <Feather name="edit-2" size={16} color="#6b7280" />
                        </TouchableOpacity>
                      </View>

                      <Text className="font-quicksand-bold text-gray-800 text-lg mb-2" numberOfLines={2}>
                        {proj.name}
                      </Text>

                      <Text className="font-quicksand-semibold text-gray-600 text-base mb-2">{proj.link}</Text>

                      <View className="flex-row items-center mb-2">
                        <Text className="font-quicksand-semibold text-gray-600 text-base">{proj.description}</Text>
                      </View>

                      <View className="flex-row items-center gap-2 mb-3">
                        <Feather name="calendar" size={14} color="#6b7280" />
                        <Text className="font-quicksand-medium text-gray-500 text-sm">
                          {proj.yearCompleted || "Present"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Feather name="award" size={24} color="#9ca3af" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Projects Added Yet</Text>
                  <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">
                    Showcase your experience to attract potential employers and highlight your qualifications.
                  </Text>
                  <TouchableOpacity className="bg-green-500 px-6 py-3 rounded-xl" onPress={handleAddProject}>
                    <Text className="font-quicksand-semibold text-white text-sm">Add Your First Project</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <ModalWithBg visible={showModal} customHeight={0.8} customWidth={0.9}>
        <ScrollView className="flex-1 h-full">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">
              {isAdding ? "Add New Project" : "Edit Project"}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View className="flex-1 gap-4 pt-4">
            {!isSubmitting ? (
              <View className="flex-1 gap-4 pb-6">
                {addSuccess && (
                  <SuccessfulUpdate
                    editingField="Project"
                    type="add"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setAddSuccess(false)}
                  />
                )}
                {editSuccess && (
                  <SuccessfulUpdate
                    editingField="Project"
                    type="edit"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setEditSuccess(false)}
                  />
                )}
                {deleteSuccess && (
                  <SuccessfulUpdate
                    editingField="Project"
                    type="delete"
                    handleConfirm={() => setShowModal(false)}
                    handleReedit={() => setDeleteSuccess(false)}
                  />
                )}
                {!addSuccess && !editSuccess && !deleteSuccess && (
                  <>
                    <View className="px-6">
                      <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <View className="flex-row items-start gap-2">
                          <Feather name="info" size={14} color="#3b82f6" />
                          <Text className="font-quicksand-medium text-xs text-blue-700 leading-4 flex-1">
                            {isAdding
                              ? "Add details about your projects to showcase your skills."
                              : "Update the details of your current projects."}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-1 gap-2">
                      <View className="px-6">
                        <View>
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="font-quicksand-medium text-sm text-gray-600">Title</Text>
                            <Text className="font-quicksand-medium text-xs text-gray-500">
                              {projectForm.name.length}/50 characters
                            </Text>
                          </View>
                          <CustomInput
                            placeholder="e.g. Stock Trading App"
                            autoCapitalize="words"
                            label=""
                            onChangeText={(text) => setProjectForm({ ...projectForm, name: text })}
                            value={projectForm.name}
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
                            <Text className="font-quicksand-medium text-sm text-gray-600">Description</Text>
                            <Text className="font-quicksand-medium text-xs text-gray-500">
                              {projectForm.description.length}/150 characters
                            </Text>
                          </View>
                          <CustomMultilineInput
                            placeholder="e.g. A stock trading app built with React"
                            onChangeText={(text) => setProjectForm({ ...projectForm, description: text })}
                            value={projectForm.description}
                          />
                        </View>
                      </View>
                      <View className="px-6">
                        <View>
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="font-quicksand-medium text-sm text-gray-600">Link</Text>
                            <Text className="font-quicksand-medium text-xs text-gray-500">
                              {projectForm.link.length}/50 characters
                            </Text>
                          </View>
                          <CustomInput
                            placeholder="e.g. https://github.com/yourusername/yourproject"
                            label=""
                            onChangeText={(text) => setProjectForm({ ...projectForm, link: text })}
                            value={projectForm.link}
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
                            <Text className="font-quicksand-medium text-sm text-gray-600">Year Completed</Text>
                            <Text className="font-quicksand-medium text-xs text-gray-500">
                              {projectForm.name.length}/4 characters
                            </Text>
                          </View>
                          <CustomInput
                            placeholder="e.g. 2023"
                            label=""
                            onChangeText={(text) => setProjectForm({ ...projectForm, yearCompleted: text })}
                            value={projectForm.yearCompleted}
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
                      <View className="px-6 gap-2 mt-2">
                        {isAdding ? (
                          <View className="gap-2">
                            <ProfileButton
                              color="green-500"
                              buttonText="Add Project"
                              handlePress={submitNewProject}
                              disabled={isSubmitting}
                            />
                            <ProfileButton
                              color="red-400"
                              buttonText="Cancel"
                              handlePress={() => setShowModal(false)}
                              disabled={isSubmitting}
                            />
                          </View>
                        ) : (
                          <View className="gap-3">
                            <ProfileButton
                              color="green-500"
                              buttonText="Update Project"
                              handlePress={submitEditProject}
                              disabled={isSubmitting}
                            />
                            <ProfileButton
                              color="red-400"
                              buttonText="Delete Project"
                              handlePress={submitDeleteProject}
                              disabled={isSubmitting}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </>
                )}
              </View>
            ) : (
              <View className="h-[300px] items-center justify-center">
                <UpdatingProfileView />
              </View>
            )}
          </View>
        </ScrollView>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default Projects;
