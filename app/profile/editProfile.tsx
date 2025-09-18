import BackBar from "@/components/BackBar";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import EditProfileCard from "@/components/EditProfileCard";
import ProfileEducationCard from "@/components/ProfileEducationCard";
import ProfileExperienceCard from "@/components/ProfileExperienceCard";
import UserVideoIntro from "@/components/UserVideoIntro";
import { getS3VideoIntroUrl } from "@/lib/s3Urls";
import {
  addEducation,
  addExperience,
  addSkill,
  editEducation,
  editExperience,
  removeVideoIntro,
  updateUserVideoIntro,
} from "@/lib/updateUserProfile";
import { convert10DigitNumberToPhoneFormat } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import {
  AddExperienceForm,
  AddUserEducationForm,
  AddUserSkillForm,
  Education,
  Experience,
  User,
  UserSkill,
} from "@/type";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfile() {
  const { isLoading, user: authUser, setUser } = useAuthStore();
  const defaultOpenSectionValue = {
    general: false,
    skills: false,
    summary: false,
    education: false,
    experience: false,
    socials: false,
    portfolio: false,
    videoIntro: false,
  };
  const [openSection, setOpenSection] = useState(defaultOpenSectionValue);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isEditingSkill, setIsEditingSkill] = useState<UserSkill | null>(null);
  const [isEditingEducation, setIsEditingEducation] =
    useState<Education | null>(null);
  const [isEditingExperience, setIsEditingExperience] =
    useState<Experience | null>(null);
  const [skillChunks, setSkillChunks] = useState<UserSkill[][]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [uploadedVideoIntro, setUploadedVideoIntro] =
    useState<ImagePicker.ImagePickerResult | null>(null);
  const [addSkillForm, setAddSkillForm] = useState<AddUserSkillForm>({
    skill: "",
    experience: "",
  });
  const [addEducationForm, setAddEducationForm] =
    useState<AddUserEducationForm>({
      institution: "",
      degree: "",
      fromYear: "",
      toYear: "",
    });
  const [addExperienceForm, setAddExperienceForm] = useState<AddExperienceForm>(
    {
      title: "",
      city: "",
      country: "",
      company: "",
      description: "",
      from: "",
      to: "",
    }
  );
  const [isLoadingNewSkill, setIsLoadingNewSkill] = useState(false);
  const [isLoadingNewVideoIntro, setIsLoadingNewVideoIntro] = useState(false);
  const [isLoadingNewEducation, setIsLoadingNewEducation] = useState(false);
  const [isLoadingNewExperience, setIsLoadingNewExperience] = useState(false);
  const user = authUser as User | null; // Cast once at the top

  function chunkArray(array: UserSkill[], size: number): UserSkill[][] {
    const result: UserSkill[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height + 20)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      setSkillChunks(chunkArray(user.skills, 2));
    }
  }, [user]);

  const handleAddSkill = async () => {
    const { skill, experience } = addSkillForm;
    if (!skill || !experience) {
      Alert.alert("Please fill in all fields before adding a skill.");
      return;
    } else if (isNaN(Number(experience)) || Number(experience) < 0) {
      Alert.alert(
        "Experience must be a valid number greater than or equal to 0."
      );
      return;
    }
    setIsLoadingNewSkill(true);
    try {
      const result = await addSkill({ skill, experience });
      if (!result) {
        Alert.alert("Failed to add skill. Please try again.");
        return;
      }
      const newSkill: UserSkill = {
        id: result.id,
        skill: result.skill,
        experience: result.experience,
      };
      let newSkills = [];
      const userContainsSkill =
        user?.skills && user?.skills.some((s) => s.id === newSkill.id);
      if (userContainsSkill) {
        newSkills = [
          ...user.skills.filter((s) => s.id !== newSkill.id),
          newSkill,
        ];
      } else {
        newSkills = [...(user?.skills ?? []), newSkill];
      }
      if (user) {
        setUser({ ...user, skills: newSkills });
      }
      Alert.alert("Skill added successfully!");
      setAddSkillForm({ skill: "", experience: "" });
      bottomSheetRef.current?.close();
    } catch (error) {
      Alert.alert("Failed to add skill. Please try again.");
    } finally {
      setIsLoadingNewSkill(false);
    }
  };

  const handleAddEducation = async () => {
    const { institution, degree, fromYear, toYear } = addEducationForm;
    if (!institution || !degree || !fromYear) {
      Alert.alert(
        "Please fill in all required fields before adding education."
      );
      return;
    } else if (
      isNaN(Number(fromYear)) ||
      Number(fromYear) < 1900 ||
      Number(fromYear) > new Date().getFullYear()
    ) {
      Alert.alert("From Year must be a valid year.");
      return;
    } else if (
      toYear &&
      (isNaN(Number(toYear)) ||
        Number(toYear) < 1900 ||
        Number(toYear) > new Date().getFullYear() + 10)
    ) {
      Alert.alert("To Year must be a valid year or left empty if ongoing.");
      return;
    } else if (toYear && Number(toYear) < Number(fromYear)) {
      Alert.alert("To Year must be greater than or equal to From Year.");
      return;
    }
    setIsLoadingNewEducation(true);
    try {
      const result = await addEducation({
        institution,
        degree,
        fromYear,
        toYear,
      });
      if (!result) {
        Alert.alert("Failed to add education. Please try again.");
        return;
      }
      const newEducation: Education = {
        id: result.id,
        institution: result.institution,
        degree: result.degree,
        fromYear: result.fromYear,
        toYear: result.toYear,
      };

      Alert.alert("Education added successfully!");
      setAddEducationForm({
        institution: "",
        degree: "",
        fromYear: "",
        toYear: "",
      });
      let newUserEducation = [...(user?.education ?? []), newEducation];
      if (user) {
        setUser({ ...user, education: newUserEducation });
      }
      bottomSheetRef.current?.close();
    } catch (error) {
      Alert.alert("Failed to add education. Please try again.");
    } finally {
      setIsLoadingNewEducation(false);
    }
  };

  const handleEditEducation = async () => {
    const { institution, degree, fromYear, toYear } = addEducationForm;
    if (!institution || !degree || !fromYear) {
      Alert.alert(
        "Please fill in all required fields before adding education."
      );
      return;
    } else if (
      isNaN(Number(fromYear)) ||
      Number(fromYear) < 1900 ||
      Number(fromYear) > new Date().getFullYear()
    ) {
      Alert.alert("From Year must be a valid year.");
      return;
    } else if (
      toYear &&
      (isNaN(Number(toYear)) ||
        Number(toYear) < 1900 ||
        Number(toYear) > new Date().getFullYear() + 10)
    ) {
      Alert.alert("To Year must be a valid year or left empty if ongoing.");
      return;
    } else if (toYear && Number(toYear) < Number(fromYear)) {
      Alert.alert("To Year must be greater than or equal to From Year.");
      return;
    }
    setIsLoadingNewEducation(true);
    try {
      const result = await editEducation(
        isEditingEducation!.id,
        addEducationForm
      );
      if (!result) {
        Alert.alert("Failed to edit education. Please try again.");
        return;
      }
      const newEducation: Education = {
        id: result.id,
        institution: result.institution,
        degree: result.degree,
        fromYear: result.fromYear,
        toYear: result.toYear,
      };

      Alert.alert("Education updated successfully!");
      setAddEducationForm({
        institution: "",
        degree: "",
        fromYear: "",
        toYear: "",
      });
      let newUserEducation = [
        ...(user?.education?.filter((e) => e.id !== result.id) ?? []),
        newEducation,
      ];
      if (user) {
        setUser({ ...user, education: newUserEducation });
      }
      bottomSheetRef.current?.close();
    } catch (error) {
      Alert.alert("Failed to add education. Please try again.");
    } finally {
      setIsLoadingNewEducation(false);
    }
  };

  const handleAddExperience = async () => {
    const { title, company, description, from, to } = addExperienceForm;
    if (!title || !company || !from || !description) {
      Alert.alert(
        "Please fill in all required fields before adding experience"
      );
      return;
    } else if (
      isNaN(Number(from)) ||
      Number(from) < 1900 ||
      Number(from) > new Date().getFullYear()
    ) {
      Alert.alert("From Year must be a valid year.");
      return;
    } else if (
      to &&
      (isNaN(Number(to)) ||
        Number(to) < 1900 ||
        Number(to) > new Date().getFullYear() + 10)
    ) {
      Alert.alert("To Year must be a valid year or left empty if ongoing.");
      return;
    } else if (
      to &&
      Number(to) &&
      from &&
      Number(from) &&
      Number(to) < Number(from)
    ) {
      Alert.alert("To Year must be greater than or equal to From Year.");
      return;
    }
    setIsLoadingNewExperience(true);
    try {
      const result = await addExperience(addExperienceForm);
      if (!result) {
        Alert.alert("Failed to add experience. Please try again.");
        return;
      }
      const newExperience: Experience = {
        id: result.id,
        title: result.title,
        description: result.description,
        company: result.company,
        city: result.city,
        country: result.country,
        from: result.from,
        to: result.to,
        currentlyWorking: result.currentlyWorking,
      };
      const newExperiences = [...(user?.experiences ?? []), newExperience];
      if (user) {
        setUser({ ...user, experiences: newExperiences });
      }
      Alert.alert("Experience added successfully!");
      setAddExperienceForm({
        title: "",
        company: "",
        description: "",
        city: "",
        country: "",
        from: "",
        to: "",
      });
      bottomSheetRef.current?.close();
    } catch (error) {
      console.log(error);
      Alert.alert("Failed to add experience. Please try again.");
      return;
    } finally {
      setIsLoadingNewExperience(false);
    }
  };

  const handleEditExperience = async () => {
    const { title, company, from, to } = addExperienceForm;
    if (!title || !company || !from) {
      Alert.alert(
        "Please fill in all required fields before adding experience"
      );
      return;
    } else if (
      isNaN(Number(from)) ||
      Number(from) < 1900 ||
      Number(from) > new Date().getFullYear()
    ) {
      Alert.alert("From Year must be a valid year.");
      return;
    } else if (
      to &&
      (isNaN(Number(to)) ||
        Number(to) < 1900 ||
        Number(to) > new Date().getFullYear() + 10)
    ) {
      Alert.alert("To Year must be a valid year or left empty if ongoing.");
      return;
    } else if (
      to &&
      Number(to) &&
      from &&
      Number(from) &&
      Number(to) < Number(from)
    ) {
      Alert.alert("To Year must be greater than or equal to From Year.");
      return;
    }
    setIsLoadingNewExperience(true);
    try {
      const newExperience = await editExperience(
        isEditingExperience!.id,
        addExperienceForm
      );
      if (!newExperience) {
        Alert.alert("Failed to edit experience. Please try again.");
        return;
      }
      let newExperiences = [
        newExperience,
        ...(user?.experiences.filter((e) => e.id !== newExperience.id) ?? []),
      ];
      if (user) {
        setUser({ ...user, experiences: newExperiences });
      }
      Alert.alert("Experience updated successfully!");
      setAddExperienceForm({
        title: "",
        company: "",
        description: "",
        city: "",
        country: "",
        from: "",
        to: "",
      });
      bottomSheetRef.current?.close();
    } catch (error) {
      console.log(error);
      Alert.alert("Failed to edit experience. Please try again.");
      return;
    } finally {
      setIsLoadingNewExperience(false);
    }
  };

  const openBottomSheet = (type: "skill" | "education" | "experience") => {
    setAddEducationForm({
      institution: "",
      degree: "",
      fromYear: "",
      toYear: "",
    });
    setAddExperienceForm({
      title: "",
      company: "",
      description: "",
      city: "",
      country: "",
      from: "",
      to: "",
    });
    setAddSkillForm({ skill: "", experience: "" });
    if (type === "skill") {
      setIsAddingSkill(true);
      setIsEditingSkill(null);
      setIsEditingEducation(null);
      setIsEditingExperience(null);
      setIsAddingEducation(false);
      setIsAddingExperience(false);
    } else if (type === "education") {
      setIsAddingEducation(true);
      setIsAddingSkill(false);
      setIsEditingExperience(null);
      setIsEditingSkill(null);
      setIsAddingExperience(false);
    } else if (type === "experience") {
      setIsAddingExperience(true);
      setIsEditingEducation(null);
      setIsEditingSkill(null);
      setIsAddingEducation(false);
    }
    bottomSheetRef.current?.expand();
  };

  const handleIsEditingSkill = (skill: UserSkill | null) => {
    setIsEditingSkill(skill);
    setAddSkillForm({
      skill: skill?.skill.name || "",
      experience: skill?.experience.toString() || "",
    });
    bottomSheetRef.current?.expand();
  };

  const handleCloseSkillsForm = () => {
    setIsAddingSkill(false);
    setIsEditingSkill(null);
    setAddSkillForm({ skill: "", experience: "" });
    bottomSheetRef.current?.close();
  };

  const handleIsEditingEducation = (education: Education | null) => {
    setIsEditingEducation(education);
    setIsEditingExperience(null);
    setIsEditingSkill(null);
    setAddEducationForm({
      institution: education?.institution || "",
      degree: education?.degree || "",
      fromYear: education?.fromYear.toString() || "",
      toYear: education?.toYear?.toString() || "",
    });
    bottomSheetRef.current?.expand();
  };

  const handleCloseEducationForm = () => {
    setIsAddingEducation(false);
    setIsEditingEducation(null);
    setAddEducationForm({
      institution: "",
      degree: "",
      fromYear: "",
      toYear: "",
    });
    bottomSheetRef.current?.close();
  };

  const handleCloseExperienceForm = () => {
    setIsAddingExperience(false);
    setIsEditingExperience(null);
    setAddExperienceForm({
      title: "",
      company: "",
      description: "",
      city: "",
      country: "",
      from: "",
      to: "",
    });
    bottomSheetRef.current?.close();
  };

  const handleIsEditingExperience = (experience: Experience | null) => {
    setIsEditingExperience(experience);
    setAddExperienceForm({
      title: experience?.title || "",
      company: experience?.company || "",
      description: experience?.description || "",
      city: experience?.city || "",
      country: experience?.country || "",
      from: experience?.from.toString() || "",
      to: (experience?.to && experience?.to.toString()) || "",
    });
    bottomSheetRef.current?.expand();
  };

  const handleAddUserVideoIntro = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!result.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to allow media library access to upload a video. Please enable in settings",
        [
          {
            text: "Go to Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }
    Alert.alert("Add Video Introduction", "", [
      {
        text: "Gallery",
        onPress: async () => {
          const galleryResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "videos",
            allowsEditing: true,
            videoMaxDuration: 60,
            aspect: [4, 3],
            quality: 1,
          });
          if (
            !galleryResult.canceled &&
            galleryResult.assets &&
            galleryResult.assets.length > 0
          ) {
            setUploadedVideoIntro(galleryResult);
          }
          return;
        },
      },
      {
        text: "Camera",
        onPress: async () => {
          const galleryResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "videos",
            allowsEditing: true,
            videoMaxDuration: 60,
            aspect: [4, 3],
            quality: 1,
          });
          if (
            !galleryResult.canceled &&
            galleryResult.assets &&
            galleryResult.assets.length > 0
          ) {
            setUploadedVideoIntro(galleryResult);
          }
          return;
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleVideoIntroSubmit = async () => {
    setIsLoadingNewVideoIntro(true);
    try {
      const result = await updateUserVideoIntro(uploadedVideoIntro!);
      if (!result) {
        Alert.alert("Failed to upload video introduction. Please try again.");
        return;
      }
      if (user) {
        setUser({ ...user, videoIntroUrl: result.videoIntroUrl });
      }
    } catch (error) {
    } finally {
      setIsLoadingNewVideoIntro(false);
    }
  };

  const handleRemoveVideoIntro = () => {
    Alert.alert(
      "Remove Video Introduction",
      "Are you sure you want to remove your video introduction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            if (!user) return;

            setIsLoadingNewVideoIntro(true);

            // run async logic without blocking the alert system
            (async () => {
              try {
                const result = await removeVideoIntro();
                if (result) {
                  setUploadedVideoIntro(null);
                  setUser({ ...user, videoIntroUrl: null });
                }
              } catch (error) {
                console.error("Error removing video intro:", error);
              } finally {
                setIsLoadingNewVideoIntro(false);
              }
            })();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white h-full">
      <BackBar label="Edit Profile" />
      <ScrollView>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            className="flex-1 justify-center items-center"
          />
        ) : (
          <>
            <View className="px-4 py-2">
              <View className="flex flex-row justify-between items-start">
                <Text className="font-quicksand-semibold text-lg">
                  General Information
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setOpenSection((prev) => ({
                      ...defaultOpenSectionValue,
                      general: !prev.general,
                    }))
                  }
                >
                  <AntDesign
                    name={openSection.general ? "up" : "down"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {openSection.general && (
                <View className="flex flex-row flex-wrap gap-4">
                  <EditProfileCard
                    label="First Name"
                    value={user?.firstName || ""}
                  />
                  <EditProfileCard
                    label="Last Name"
                    value={user?.lastName || ""}
                  />
                  <EditProfileCard label="Title" value={user?.title || ""} />
                  <EditProfileCard
                    label="Company"
                    value={user?.company || ""}
                  />
                  <EditProfileCard label="Email" value={user?.email || ""} />
                  <EditProfileCard
                    label="Phone"
                    value={
                      convert10DigitNumberToPhoneFormat(user?.phoneNumber!) ||
                      ""
                    }
                  />
                  <EditProfileCard
                    label="Location"
                    value={user?.location || ""}
                  />
                </View>
              )}
            </View>
            <View className="divider" />
            <View className="px-4 py-2">
              <View className="flex flex-row justify-between items-start">
                <View className="flex flex-row items-center gap-2">
                  <Text className="font-quicksand-semibold text-lg">
                    Summary
                  </Text>
                  {isEditingSummary ? (
                    <View className="flex flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => setIsEditingSummary(false)}
                      >
                        <AntDesign name="check" size={20} color="green" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsEditingSummary(false)}
                      >
                        <AntDesign name="close" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingSummary(true)}>
                      <Feather name="edit" size={16} color="black" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setOpenSection((prev) => ({
                      ...defaultOpenSectionValue,
                      summary: !prev.summary,
                    }))
                  }
                >
                  <AntDesign
                    name={openSection.summary ? "up" : "down"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {(isEditingSummary || openSection.summary) && (
                <View className="flex flex-row flex-wrap">
                  {isEditingSummary ? (
                    <TextInput
                      placeholder="Enter your summary"
                      value={user?.summary}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      multiline={true}
                      textAlignVertical="top"
                    />
                  ) : (
                    <Text className="font-quicksand-semibold text-md text-gray-900">
                      {user?.summary || "No summary provided."}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <View className="divider" />
            <View className="px-4 py-2">
              <View className="flex flex-row justify-between items-start">
                <Text className="font-quicksand-semibold text-lg">
                  Video Introduction
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setOpenSection((prev) => ({
                      ...defaultOpenSectionValue,
                      videoIntro: !prev.videoIntro,
                    }))
                  }
                >
                  <AntDesign
                    name={openSection.videoIntro ? "up" : "down"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {openSection.videoIntro && (
                <View className="p-4">
                  {user?.videoIntroUrl ? (
                    <View className="flex flex-col items-center justify-center gap-2">
                      <UserVideoIntro
                        videoSource={getS3VideoIntroUrl(user.videoIntroUrl)}
                      />
                      <TouchableOpacity
                        className="bg-red-500 rounded-lg w-1/2 px-2 py-4 items-center justify-center"
                        onPress={() => handleRemoveVideoIntro()}
                        disabled={isLoadingNewVideoIntro}
                      >
                        {isLoadingNewVideoIntro ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text className="font-quicksand-semibold text-md">
                            Remove
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex flex-col items-center justify-center gap-2">
                      <Text className="font-quicksand-medium text-md">
                        No video introduction provided. We highly recommend
                        adding one to enhance your profile.
                      </Text>
                      {uploadedVideoIntro && uploadedVideoIntro.assets ? (
                        <>
                          <UserVideoIntro
                            videoSource={uploadedVideoIntro.assets[0].uri}
                          />
                          <View
                            className="flex flex-row w-full gap-4 px-2"
                            style={{ marginBottom: keyboardHeight }}
                          >
                            <TouchableOpacity
                              className="apply-button rounded-lg w-1/2 px-2 py-4 items-center justify-center"
                              onPress={handleVideoIntroSubmit}
                              disabled={isLoadingNewVideoIntro}
                            >
                              {isLoadingNewVideoIntro ? (
                                <ActivityIndicator color="white" />
                              ) : (
                                <Text className="font-quicksand-semibold text-md">
                                  Submit
                                </Text>
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              className="bg-red-500 rounded-lg w-1/2 px-2 py-4 items-center justify-center"
                              onPress={() => setUploadedVideoIntro(null)}
                            >
                              <Text className="font-quicksand-semibold text-md">
                                Remove
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <TouchableOpacity
                          className="apply-button w-1/2 px-2 py-4 items-center justify-center"
                          onPress={handleAddUserVideoIntro}
                        >
                          <Text className="font-quicksand-semibold text-md">
                            Add Video
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
            <View className="divider" />
            <View className="px-4 py-2">
              <View className="flex flex-row justify-between items-start">
                <Text className="font-quicksand-semibold text-lg">Skills</Text>
                <TouchableOpacity
                  onPress={() =>
                    setOpenSection((prev) => ({
                      ...defaultOpenSectionValue,
                      skills: !prev.skills,
                    }))
                  }
                >
                  <AntDesign
                    name={openSection.skills ? "up" : "down"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {openSection.skills && (
                <View className="flex flex-col flex-wrap gap-4 w-full">
                  <View className="flex flex-row flex-wrap gap-2">
                    {user?.skills.map((skill) => (
                      <TouchableOpacity
                        className="relative bg-green-100 px-4 py-2 rounded-full flex-row items-center gap-1"
                        onPress={() => handleIsEditingSkill(skill)}
                        key={skill.id}
                      >
                        <Text className="font-quicksand-semibold text-md text-green-800">
                          {skill.skill.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    className="apply-button flex-row  gap-1 items-center justify-center w-1/4 py-2"
                    onPress={() => openBottomSheet("skill")}
                  >
                    <Text className="font-quicksand-semibold text-md">
                      New Skill
                    </Text>
                    <Feather name="plus" size={16} color="black" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View className="divider" />
            <View className="px-4 py-2 gap-4">
              <View className="flex flex-row justify-between items-start">
                <Text className="font-quicksand-semibold text-lg">
                  Education
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setOpenSection((prev) => ({
                      ...defaultOpenSectionValue,
                      education: !prev.education,
                    }))
                  }
                >
                  <AntDesign
                    name={openSection.education ? "up" : "down"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {openSection.education && (
                <View className="flex flex-row flex-wrap gap-4">
                  {/*TODO: Fix edit button placement on the profile cards*/}
                  {user?.education?.map((edu) => (
                    <ProfileEducationCard
                      key={edu.id}
                      education={edu}
                      onEditEducation={() => handleIsEditingEducation(edu)}
                    />
                  ))}
                  <TouchableOpacity
                    className="apply-button flex-row gap-1 items-center justify-center w-1/2 py-2"
                    onPress={() => openBottomSheet("education")}
                  >
                    <Text className="font-quicksand-semibold">
                      New education
                    </Text>
                    <AntDesign name="plus" size={16} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View className="divider" />
            <View className="px-4 py-2 gap-4">
              <View className="flex flex-row justify-between items-start">
                <Text className="font-quicksand-semibold text-lg">
                  Experience
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setOpenSection((prev) => ({
                      ...defaultOpenSectionValue,
                      experience: !prev.experience,
                    }))
                  }
                >
                  <AntDesign
                    name={openSection.experience ? "up" : "down"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {openSection.experience && (
                <View className="flex flex-row flex-wrap gap-4">
                  {user?.experiences?.map((exp) => (
                    <ProfileExperienceCard
                      key={exp.id}
                      experience={exp}
                      onEditExperience={() => handleIsEditingExperience(exp)}
                    />
                  ))}
                  <TouchableOpacity
                    className="apply-button flex-row gap-1 items-center justify-center w-1/2 py-2"
                    onPress={() => openBottomSheet("experience")}
                  >
                    <Text className="font-quicksand-semibold">
                      New experience
                    </Text>
                    <AntDesign name="plus" size={18} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View className="divider" />
            <View className="px-4 py-2">
              <View className="flex flex-row justify-between items-start">
                <Text className="font-quicksand-semibold text-lg">Socials</Text>
                <TouchableOpacity
                  onPress={() =>
                    setOpenSection((prev) => ({
                      ...defaultOpenSectionValue,
                      socials: !prev.socials,
                    }))
                  }
                >
                  <AntDesign
                    name={openSection.socials ? "up" : "down"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {openSection.socials && (
                <View className="flex flex-row flex-wrap gap-4">
                  <Text>Socials</Text>
                </View>
              )}
            </View>
            <View className="divider" />
            <View className="px-4 py-2">
              <View className="flex flex-row justify-between items-start">
                <Text className="font-quicksand-semibold text-lg">
                  Portfolio
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setOpenSection((prev) => ({
                      ...defaultOpenSectionValue,
                      portfolio: !prev.portfolio,
                    }))
                  }
                >
                  <AntDesign
                    name={openSection.portfolio ? "up" : "down"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {openSection.portfolio && (
                <View className="flex flex-row flex-wrap gap-4">
                  <Text>Experience</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["40%"]}
        enablePanDownToClose
      >
        <BottomSheetView
          className="flex-1 bg-white p-4 gap-4 w-full justify-center items-center"
          style={{ paddingBottom: keyboardHeight }}
        >
          <View className="w-full flex flex-col gap-4">
            {(isAddingSkill || isEditingSkill) && (
              <>
                {/* TODO: User should not be able to enter any skill. Create autocomplete feature for skills */}
                <CustomInput
                  label="Skill Name"
                  placeholder={
                    isAddingSkill
                      ? "e.g. JavaScript"
                      : isEditingSkill?.skill.name!
                  }
                  value={addSkillForm.skill}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onChangeText={(skill) =>
                    setAddSkillForm({ ...addSkillForm, skill })
                  }
                />
                <CustomInput
                  label="Experience (in years)"
                  placeholder={
                    isAddingSkill
                      ? "e.g. 3"
                      : isEditingSkill?.experience.toString()!
                  }
                  value={addSkillForm.experience.toString()}
                  returnKeyType="done"
                  onChangeText={(experience) =>
                    setAddSkillForm({ ...addSkillForm, experience })
                  }
                />
                <View className="flex flex-row gap-2">
                  <CustomButton
                    isLoading={isLoadingNewSkill}
                    text={isEditingSkill ? "Update" : "Add Skill"}
                    customClass="bg-green-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                    onClick={handleAddSkill}
                  />
                  <CustomButton
                    text="Cancel"
                    customClass="bg-red-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                    onClick={handleCloseSkillsForm}
                  />
                </View>
              </>
            )}
            {(isAddingEducation || isEditingEducation) && (
              <>
                <CustomInput
                  label="Institution Name"
                  placeholder="e.g. Harvard University"
                  autoCapitalize="words"
                  value={addEducationForm.institution}
                  returnKeyType="done"
                  onChangeText={(institution) =>
                    setAddEducationForm({ ...addEducationForm, institution })
                  }
                />
                <CustomInput
                  label="Degree (Achieve or Pursuing)"
                  placeholder="e.g. BASc in Computer Science"
                  autoCapitalize="words"
                  value={addEducationForm.degree}
                  returnKeyType="done"
                  onChangeText={(degree) =>
                    setAddEducationForm({ ...addEducationForm, degree })
                  }
                />
                <View className="flex flex-row gap-2">
                  <View className="w-1/2">
                    <CustomInput
                      label="Start Year"
                      placeholder="e.g. 2016"
                      value={addEducationForm.fromYear}
                      returnKeyType="done"
                      onChangeText={(fromYear) =>
                        setAddEducationForm({ ...addEducationForm, fromYear })
                      }
                    />
                  </View>
                  <View className="w-1/2">
                    <CustomInput
                      label="End Year (or expected)"
                      placeholder="e.g. 2020 (leave empty if ongoing)"
                      value={addEducationForm.toYear}
                      returnKeyType="done"
                      onChangeText={(toYear) =>
                        setAddEducationForm({ ...addEducationForm, toYear })
                      }
                    />
                  </View>
                </View>
                <View className="flex flex-row gap-2">
                  <CustomButton
                    isLoading={isLoadingNewEducation}
                    text={isEditingEducation ? "Update" : "Add Education"}
                    customClass="bg-green-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                    onClick={() => {
                      if (isEditingEducation) {
                        handleEditEducation();
                      } else {
                        handleAddEducation();
                      }
                    }}
                  />
                  <CustomButton
                    text="Cancel"
                    customClass="bg-red-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                    onClick={handleCloseEducationForm}
                  />
                </View>
              </>
            )}
            {(isAddingExperience || isEditingExperience) && (
              <View className="flex flex-col gap-4 pb-10">
                <CustomInput
                  label="Title"
                  placeholder="e.g. Software Engineer"
                  autoCapitalize="words"
                  value={addExperienceForm.title}
                  returnKeyType="done"
                  onChangeText={(title) =>
                    setAddExperienceForm({ ...addExperienceForm, title })
                  }
                />
                <CustomInput
                  label="Company"
                  placeholder="e.g. Amazon"
                  autoCapitalize="words"
                  value={addExperienceForm.company}
                  returnKeyType="done"
                  onChangeText={(company) =>
                    setAddExperienceForm({ ...addExperienceForm, company })
                  }
                />
                <View className="flex flex-row gap-2">
                  <View className="w-1/2">
                    <CustomInput
                      label="Start Year"
                      placeholder="e.g. 2016"
                      value={addExperienceForm.from}
                      returnKeyType="done"
                      onChangeText={(fromYear) =>
                        setAddExperienceForm({
                          ...addExperienceForm,
                          from: fromYear,
                        })
                      }
                    />
                  </View>
                  <View className="w-1/2">
                    <CustomInput
                      label="End Year"
                      placeholder="e.g. 2020 (leave empty if present)"
                      value={addExperienceForm.to}
                      returnKeyType="done"
                      onChangeText={(toYear) =>
                        setAddExperienceForm({
                          ...addExperienceForm,
                          to: toYear,
                        })
                      }
                    />
                  </View>
                </View>
                <View className="flex flex-row gap-2">
                  <View className="w-1/2">
                    <CustomInput
                      label="City"
                      placeholder="e.g. San Francisco"
                      value={addExperienceForm.city}
                      autoCapitalize="words"
                      returnKeyType="done"
                      onChangeText={(city) =>
                        setAddExperienceForm({ ...addExperienceForm, city })
                      }
                    />
                  </View>
                  <View className="w-1/2">
                    <CustomInput
                      label="Country"
                      placeholder="e.g. USA"
                      autoCapitalize="words"
                      value={addExperienceForm.country}
                      returnKeyType="done"
                      onChangeText={(country) =>
                        setAddExperienceForm({ ...addExperienceForm, country })
                      }
                    />
                  </View>
                </View>
                <CustomInput
                  label="Description (Sentences about your role, achievements, etc.)"
                  placeholder="Enter your description"
                  value={addExperienceForm.description}
                  onChangeText={(description) =>
                    setAddExperienceForm({ ...addExperienceForm, description })
                  }
                  multiline={true}
                  returnKeyType="done"
                  customClass="w-full p-3 border border-gray-300 rounded-lg"
                />
                <View className="flex flex-row gap-2">
                  <CustomButton
                    isLoading={isLoadingNewExperience}
                    text={isEditingExperience ? "Update" : "Add Experience"}
                    customClass="bg-green-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                    onClick={() => {
                      if (isEditingExperience) {
                        handleEditExperience();
                      } else {
                        handleAddExperience();
                      }
                    }}
                  />
                  <CustomButton
                    text="Cancel"
                    customClass="bg-red-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                    onClick={handleCloseExperienceForm}
                  />
                </View>
              </View>
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
