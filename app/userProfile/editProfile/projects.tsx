import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import ExpandableText from "@/components/ExpandableText";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import SuccessfulUpdate from "@/components/SuccessfulUpdate";
import UpdatingProfileView from "@/components/UpdatingProfileView";
import { addProject, deleteProject, editProject } from "@/lib/updateUserProfile";
import useUserStore from "@/store/user.store";
import { AddProjectForm, Project } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Projects = () => {
  const { getProjects, updateProjects, removeProject, fetchUserProjects, hasValidProjects, isLoadingProjects } =
    useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [projectForm, setProjectForm] = useState<AddProjectForm>({
    id: 0,
    name: "",
    description: "",
    link: "",
    yearCompleted: "",
  });

  useEffect(() => {
    if (!hasValidProjects()) {
      fetchUserProjects();
    }
  }, []);

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
        updateProjects(res);
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
        updateProjects(res);
        setEditSuccess(true);
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
              removeProject(projectForm.id);
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

  const projects = getProjects();
  const isLoading = isLoadingProjects;
  return (
    <SafeAreaView>
      <BackBar label="Project" />
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
              <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center mr-3">
                <Feather name="folder" size={20} color="white" />
              </View>
              <View className="bg-emerald-100 px-3 py-1.5 rounded-full">
                <Text className="font-quicksand-bold text-xs text-emerald-700">PROJECTS</Text>
              </View>
            </View>
            <Text className="font-quicksand-bold text-xl text-gray-800 mb-3">View and edit your work projects.</Text>
            <Text className="font-quicksand-medium text-gray-600 text-sm leading-6">
              These are automatically extracted from your resume, but you can update, add, or delete projects to better
              reflect your professional background.
            </Text>
            <View className="pt-3">
              <View className="flex-row items-center gap-2">
                <Feather name="check-circle" size={14} color="#10b981" />
                <Text className="font-quicksand-semibold text-emerald-700 text-xs">
                  Keep your profile up to date for better job matches
                </Text>
              </View>
            </View>
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
                className="bg-emerald-500 rounded-xl px-6 py-4 flex-row items-center justify-center mb-2"
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
                <View className="gap-2">
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
                      <View className="flex-row items-start justify-between">
                        <Text className="font-quicksand-bold text-gray-800 text-lg" numberOfLines={2}>
                          {proj.name}
                        </Text>
                        <TouchableOpacity
                          className="bg-emerald-100 p-2 rounded-full -top-2"
                          onPress={() => handleEditProject(proj)}
                        >
                          <Feather name="edit-2" size={16} color="#10b981" />
                        </TouchableOpacity>
                      </View>
                      {proj.link && (
                        <Text className="font-quicksand-semibold text-gray-600 text-base">{proj.link}</Text>
                      )}

                      <View className="flex-row items-center">
                        <ExpandableText text={proj.description} length={300} />
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Feather name="calendar" size={14} color="#6b7280" />
                        <Text className="font-quicksand-medium text-gray-500 text-sm">
                          {proj.yearCompleted || "Year not specified"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
                  <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                    <Feather name="folder" size={24} color="#10b981" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Projects Added Yet</Text>
                  <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">
                    Showcase your experience to attract potential employers and highlight your qualifications.
                  </Text>
                  <TouchableOpacity className="bg-emerald-500 px-6 py-3 rounded-xl" onPress={handleAddProject}>
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
                            fontSize={12}
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
                              {projectForm.description.length}/500 characters
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
                            fontSize={12}
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
                              {projectForm.yearCompleted.length}/7 characters
                            </Text>
                          </View>
                          <CustomInput
                            fontSize={12}
                            placeholder="e.g. 2023 or Present"
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
                              color="emerald-500"
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
                              color="emerald-500"
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
