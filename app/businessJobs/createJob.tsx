import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import HiringTeamCard from "@/components/HiringTeamCard";
import ModalWithBg from "@/components/ModalWithBg";
import RemovableBadge from "@/components/RemovableBadge";
import { employmentTypes, experienceLevels, sounds, workArrangements } from "@/constants";
import { createJob, getAIJobDescription } from "@/lib/jobEndpoints";
import useAuthStore from "@/store/auth.store";
import useBusinessProfileSummaryStore from "@/store/business-profile-summary.store";
import useBusinessJobsStore from "@/store/businessJobs.store";
import { BusinessUser, CreateJobForm, HiringTeamMemberForm, JobFilters } from "@/type";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAudioPlayer } from "expo-audio";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";

import RenderMarkdown from "@/components/RenderMarkdown";
import { formatDateForDisplay } from "@/lib/utils";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateJob = () => {
  const defaultJobForm: CreateJobForm = {
    title: "",
    location: "",
    description: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    country: "",
    department: "",
    minSalary: "",
    maxSalary: "",
    experience: "",
    employmentType: "",
    tags: [],
    setting: "",
    appDeadline: "",
    state: "",
  };
  const { user: authUser, isReady } = useAuthStore();
  const user = authUser as BusinessUser | null;
  const addTeamSound = useAudioPlayer(sounds.popSound);
  const successSound = useAudioPlayer(sounds.successSound);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAddHiringTeamModal, setShowAddHiringTeamModal] = useState(false);
  const [hiringTeam, setHiringTeam] = useState<HiringTeamMemberForm[]>([]);
  const [hiringTeamMemberForm, setHiringTeamMemberForm] = useState<HiringTeamMemberForm>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const { profileSummary, setProfileSummary } = useBusinessProfileSummaryStore();
  const { refreshJobsForBusinessAndFilter } = useBusinessJobsStore();
  const [createJobForm, setCreateJobForm] = useState<CreateJobForm>(defaultJobForm);
  const [addingJob, setAddingJob] = useState(false);
  const [generatingAIDescription, setGeneratingAIDescription] = useState(false);
  const tagInputRef = useRef<TextInput>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!isReady || !user) return;
    const { email, firstName, lastName } = user;
    setHiringTeam([{ firstName, lastName, email }]);
  }, [user, isReady]);
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const deadline = new Date(date);
      deadline.setHours(0, 0, 0, 0); // Set to end of the selected day
      // Format date as YYYY-MM-DD for the form
      const formattedDateTime = deadline.toISOString().slice(0, 19);
      setCreateJobForm({ ...createJobForm, appDeadline: formattedDateTime });
    }
  };

  const handleCreateJob = async () => {
    const {
      title,
      streetAddress,
      city,
      postalCode,
      country,
      department,
      description,
      minSalary,
      maxSalary,
      experience,
      employmentType,
      tags,
    } = createJobForm;
    if (
      !title ||
      !streetAddress ||
      !city ||
      !postalCode ||
      !country ||
      !department ||
      !description ||
      !minSalary ||
      !maxSalary ||
      !experience ||
      !employmentType
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (isNaN(Number(minSalary)) || isNaN(Number(maxSalary))) {
      Alert.alert("Error", "Please enter valid numbers for salary and experience");
      setAddingJob(false);
      return;
    }
    if (Number(minSalary) < 0 || Number(maxSalary) < 0 || Number(experience) < 0) {
      Alert.alert("Error", "Salary and experience cannot be negative");
      setAddingJob(false);
      return;
    }
    if (Number(minSalary) > Number(maxSalary)) {
      Alert.alert("Error", "Minimum salary cannot be greater than maximum salary");
      setAddingJob(false);
      return;
    }
    if (tags.length === 0) {
      Alert.alert("Error", "Please enter at least one skill");
      setAddingJob(false);
      return;
    }
    if (hiringTeam.length === 0) {
      Alert.alert("Warning", "You have not added any hiring team members. You can add them later.");
    }
    setShowConfirmationModal(true);
  };

  const handleGenerateAIDescription = async () => {
    Alert.alert("Confirmation", "Have you ensured all other fields are filled out correctly?", [
      {
        text: "No",
        style: "cancel",
        onPress: () => {
          return;
        },
      },
      {
        text: "Yes",
        onPress: async () => {
          setGeneratingAIDescription(true);
          try {
            const res = await getAIJobDescription(createJobForm);
            if (res) {
              setCreateJobForm({ ...createJobForm, description: res });
              Alert.alert("Success", "AI-generated job description has been added.");
              successSound.seekTo(0);
              successSound.play();
            }
          } catch (error) {
            Alert.alert("Error", "Failed to generate job description. Please try again.");
          } finally {
            setGeneratingAIDescription(false);
          }
        },
      },
    ]);
  };

  const handlePostJob = async () => {
    try {
      const result = await createJob(createJobForm, user?.id!, hiringTeam);
      if (!result) {
        Alert.alert("Error", "Failed to create job. Please try again.");
        return;
      }
      Alert.alert("Success", "Job created successfully");
      refreshJobsForBusinessAndFilter({} as JobFilters);
      setCreateJobForm({ ...defaultJobForm });
      router.replace(`/businessJobs/${result.id}`);
      setProfileSummary({
        ...profileSummary,
        totalJobsPosted: (profileSummary?.totalJobsPosted || 0) + 1,
      } as any);
      tagInputRef.current?.clear();
      setShowConfirmationModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create job. Please try again.");
      return;
    } finally {
      setAddingJob(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !createJobForm.tags.includes(tag)) {
      setCreateJobForm({
        ...createJobForm,
        tags: [...createJobForm.tags, tag],
      });
    }
    tagInputRef.current?.clear();
  };

  const handleAddTeamMember = () => {
    const { firstName, lastName, email } = hiringTeamMemberForm;
    if (!firstName || !lastName || !email) {
      Alert.alert("Error", "Please fill in all fields for the team member");
      return;
    }
    setHiringTeam([...hiringTeam, hiringTeamMemberForm]);
    setHiringTeamMemberForm({
      firstName: "",
      lastName: "",
      email: "",
    });
    addTeamSound.seekTo(0);
    addTeamSound.play();
  };

  const removeTeamMember = (member: HiringTeamMemberForm) => {
    setHiringTeam(hiringTeam.filter((m) => m !== member));
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackBar label="Create Job" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // adjust depending on header height
      >
        <ScrollView
          contentContainerStyle={{ padding: 10 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-4 flex flex-col gap-4">
            <View className="form-input">
              <CustomInput
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                label="Title"
                fontSize={12}
                placeholder="eg. Software Engineer"
                autoCapitalize="words"
                value={createJobForm.title}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, title: text })}
              />
            </View>
            <View className="form-input">
              <CustomInput
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                label="Street Address"
                autoCapitalize="words"
                fontSize={12}
                placeholder="eg. 123 Main St"
                value={createJobForm.streetAddress}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, streetAddress: text })}
              />
            </View>
            <View className="form-input">
              <CustomInput
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                label="Country"
                autoCapitalize="words"
                placeholder="eg. United States"
                fontSize={12}
                value={createJobForm.country}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, country: text })}
              />
            </View>
            <View className="form-input">
              <CustomInput
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                label="City"
                autoCapitalize="words"
                placeholder="eg. New York City"
                fontSize={12}
                value={createJobForm.city}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, city: text })}
              />
            </View>
            <View className="form-input">
              <CustomInput
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                label="State/Province"
                autoCapitalize="words"
                placeholder="eg. New York"
                value={createJobForm.state}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, state: text })}
              />
            </View>
            <View className="form-input">
              <CustomInput
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                autoCapitalize="characters"
                label="Postal Code/ZIP"
                fontSize={12}
                placeholder="eg. 12345-6789 "
                value={createJobForm.postalCode}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, postalCode: text })}
              />
            </View>
            <View className="form-input">
              <CustomMultilineInput
                label="Description"
                numberOfLines={2}
                value={createJobForm.description}
                placeholder="Give a description of the role. We'll use AI to expand and clean it up for you."
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, description: text })}
              />
            </View>
            <View className="form-input">
              <CustomInput
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                label="Department"
                fontSize={12}
                autoCapitalize="words"
                placeholder="eg. Engineering"
                value={createJobForm.department}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, department: text })}
              />
            </View>
            <View className="form-input">
              <Text className="form-input__label">Job Setting</Text>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {workArrangements.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() => setCreateJobForm({ ...createJobForm, setting: level.value })}
                    className={`px-4 py-2 rounded-xl border ${
                      createJobForm.setting === level.value
                        ? "bg-emerald-500 border-emerald-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-quicksand-semibold text-sm ${
                        createJobForm.setting === level.value ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="form-input">
              <Text className="form-input__label">Application Deadline</Text>
              <TouchableOpacity
                className="form-input__input bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-quicksand-medium text-base ${
                    createJobForm.appDeadline ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {createJobForm.appDeadline
                    ? formatDateForDisplay(createJobForm.appDeadline)
                    : "Select application deadline"}
                </Text>
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center">
                  <Text className="text-blue-600 font-quicksand-bold text-xs">📅</Text>
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  minimumDate={new Date()} // Prevent selecting past dates
                  textColor="#000000"
                />
              )}
            </View>
            <View className="form-input">
              <Text className="form-input__label">Experience</Text>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {experienceLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() => setCreateJobForm({ ...createJobForm, experience: level.value })}
                    className={`px-4 py-2 rounded-xl border ${
                      createJobForm.experience === level.value
                        ? "bg-emerald-500 border-emerald-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-quicksand-semibold text-sm ${
                        createJobForm.experience === level.value ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="form-input">
              <Text className="form-input__label">Employment Type</Text>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {employmentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    className={`px-4 py-2 rounded-xl border ${
                      createJobForm.employmentType === type.value
                        ? "bg-emerald-500 border-emerald-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    onPress={() => setCreateJobForm({ ...createJobForm, employmentType: type.value })}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-quicksand-semibold text-sm ${
                        createJobForm.employmentType === type.value ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex flex-row gap-2">
              <View className="w-1/2 form-input">
                <CustomInput
                  placeholder="eg. 80000"
                  fontSize={12}
                  keyboardType="numeric"
                  customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                  label="Min Salary"
                  value={createJobForm.minSalary}
                  onChangeText={(text) => setCreateJobForm({ ...createJobForm, minSalary: text })}
                />
              </View>
              <View className="w-1/2 form-input">
                <CustomInput
                  placeholder="eg. 120000"
                  keyboardType="numeric"
                  fontSize={12}
                  customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                  label="Max Salary"
                  value={createJobForm.maxSalary}
                  onChangeText={(text) => setCreateJobForm({ ...createJobForm, maxSalary: text })}
                />
              </View>
            </View>
            <View className="flex flex-col gap-2">
              <View className="form-input">
                <Text className="form-input__label">Skills</Text>
                <TextInput
                  autoCapitalize="words"
                  style={{ fontSize: 12 }}
                  className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-sm text-gray-900"
                  onSubmitEditing={(event) => handleAddTag(event.nativeEvent.text.trim())}
                  ref={tagInputRef}
                  placeholder="eg. JavaScript, React, Node.js"
                />
              </View>
              {createJobForm.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {createJobForm.tags.map((tag) => (
                    <RemovableBadge
                      key={tag}
                      text={tag}
                      handlePress={() => {
                        setCreateJobForm({
                          ...createJobForm,
                          tags: createJobForm.tags.filter((t) => t !== tag),
                        });
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
            <View className="flex flex-col gap-2">
              <Text className="form-input__label">Hiring Team</Text>
              <TouchableOpacity
                className="flex-row items-center justify-center bg-emerald-50 w-1/2 px-4 py-2 rounded-lg border border-green-200 mb-3"
                onPress={() => setShowAddHiringTeamModal(true)}
              >
                <Feather name="plus-circle" size={20} color="#10b981" />
                <Text className="font-quicksand-semibold text-sm text-emerald-600 ml-2">Add Team Member</Text>
              </TouchableOpacity>
              <View>
                {hiringTeam.map((member, index) => (
                  <HiringTeamCard key={index} teamMember={member} handleRemove={() => removeTeamMember(member)} />
                ))}
              </View>
            </View>
            <View className="flex-row justify-center items-center gap-2">
              <TouchableOpacity
                className="mt-6 apply-button px-6 py-3 w-1/2 rounded-lg flex items-center justify-center"
                onPress={handleCreateJob}
                disabled={addingJob}
              >
                {addingJob ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-quicksand-semibold text-md text-white">Create Job</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity className="mt-6 bg-red-500 px-6 py-3 w-1/2 rounded-lg flex items-center justify-center">
                <Text className="font-quicksand-semibold text-md text-white">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ModalWithBg visible={showAddHiringTeamModal}>
        <View className="flex-1 bg-white rounded-xl p-6 gap-2">
          <Text className="font-quicksand-bold text-xl text-gray-900 mb-4">Add Hiring Team Member</Text>
          <CustomInput
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
            autoCapitalize="words"
            label="First Name"
            placeholder="eg. John"
            value={hiringTeamMemberForm.firstName}
            onChangeText={(text) => setHiringTeamMemberForm({ ...hiringTeamMemberForm, firstName: text })}
          />
          <CustomInput
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
            autoCapitalize="words"
            label="Last Name"
            placeholder="eg. Doe"
            value={hiringTeamMemberForm.lastName}
            onChangeText={(text) => setHiringTeamMemberForm({ ...hiringTeamMemberForm, lastName: text })}
          />
          <CustomInput
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
            label="Email"
            placeholder="eg. john.doe@example.com"
            value={hiringTeamMemberForm.email}
            onChangeText={(text) => setHiringTeamMemberForm({ ...hiringTeamMemberForm, email: text })}
          />
          <View className="flex-row items-center justify-center gap-2 w-full mt-4">
            <TouchableOpacity
              className="w-1/2 bg-emerald-500 px-4 py-2 rounded-lg items-center"
              onPress={handleAddTeamMember}
            >
              <Text className="font-quicksand-semibold text-sm text-white">Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-1/2 bg-red-500 px-4 py-2 rounded-lg items-center"
              onPress={() => setShowAddHiringTeamModal(false)}
            >
              <Text className="font-quicksand-semibold text-sm text-white">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalWithBg>
      <ModalWithBg visible={showConfirmationModal} customHeight={0.85} customWidth={0.95}>
        <View className="flex-1">
          <View className="px-6 py-5 border-b border-gray-200 bg-white">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                <FontAwesome name="briefcase" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-bold text-xl text-gray-900">Confirm Job Posting</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">Review job details before posting</Text>
              </View>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 py-4 space-y-6 flex-col gap-4">
              <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <Text className="font-quicksand-bold text-lg text-blue-900">{createJobForm.title}</Text>
                <View className="flex-row items-center gap-2">
                  <FontAwesome name="map-marker" size={12} color="#3b82f6" />
                  <Text className="font-quicksand-medium text-blue-800 text-sm">
                    {createJobForm.streetAddress && `${createJobForm.streetAddress}, `}
                    {createJobForm.city}
                    {createJobForm.state && `, ${createJobForm.state}`}
                    {createJobForm.country && `, ${createJobForm.country}`} ,
                    {createJobForm.postalCode && ` ${createJobForm.postalCode}`}
                  </Text>
                </View>
              </View>
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-quicksand-semibold text-base text-gray-900">Job Description</Text>
                  <TouchableOpacity
                    className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center gap-2 border-2 border-amber-300"
                    style={{
                      shadowColor: "#10b981",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                    onPress={handleGenerateAIDescription}
                    activeOpacity={0.8}
                    disabled={generatingAIDescription}
                  >
                    {generatingAIDescription ? (
                      <>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text className="font-quicksand-bold text-white text-sm">Writing...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={16} color="#fbbf24" />
                        <Text className="font-quicksand-bold text-white text-sm">AI Write</Text>
                        <Text className="font-quicksand-medium text-emerald-100 text-xs">NEW</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                  <RenderMarkdown text={createJobForm.description} />
                </View>
              </View>
              <View>
                <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Salary Range</Text>
                <View className="bg-emerald-50 p-4 rounded-xl border border-green-200 flex-row items-center gap-2">
                  <Text className="font-quicksand-semibold text-green-800 text-sm">
                    ${Number(createJobForm.minSalary).toLocaleString()} - $
                    {Number(createJobForm.maxSalary).toLocaleString()} per year
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Employment Type</Text>
                  <View className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                    <Text className="font-quicksand-semibold text-purple-800 text-center text-sm">
                      {employmentTypes.find((type) => type.value === createJobForm.employmentType)?.label}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Experience Level</Text>
                  <View className="bg-orange-50 p-3 rounded-xl border border-orange-200">
                    <Text className="font-quicksand-semibold text-orange-800 text-center text-sm">
                      {experienceLevels.find((level) => level.value === createJobForm.experience)?.label}
                    </Text>
                  </View>
                </View>
              </View>
              {createJobForm.setting && (
                <View>
                  <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Work Setting</Text>
                  <View className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 flex-row items-center gap-2">
                    <FontAwesome name="laptop" size={16} color="#6366f1" />
                    <Text className="font-quicksand-semibold text-indigo-800 text-sm">
                      {workArrangements.find((arrangement) => arrangement.value === createJobForm.setting)?.label}
                    </Text>
                  </View>
                </View>
              )}
              {createJobForm.appDeadline && (
                <View>
                  <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Application Deadline</Text>
                  <View className="bg-red-50 p-4 rounded-xl border border-red-200 flex-row items-center gap-2">
                    <FontAwesome name="calendar" size={16} color="#dc2626" />
                    <Text className="font-quicksand-semibold text-red-800 text-sm">
                      {formatDateForDisplay(createJobForm.appDeadline)}
                    </Text>
                  </View>
                </View>
              )}
              {createJobForm.tags.length > 0 && (
                <View>
                  <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Required Skills</Text>
                  <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <View className="flex-row flex-wrap gap-2">
                      {createJobForm.tags.map((tag, index) => (
                        <View key={index} className="bg-blue-100 border border-blue-300 px-3 py-2 rounded-lg">
                          <Text className="font-quicksand-semibold text-blue-800 text-sm">{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              {createJobForm.department && (
                <View>
                  <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Department</Text>
                  <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <Text className="font-quicksand-medium text-gray-700 text-sm">{createJobForm.department}</Text>
                  </View>
                </View>
              )}
              {hiringTeam.length > 0 ? (
                <View>
                  <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Hiring Team</Text>
                  <View className="bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <View className="space-y-3">
                      {hiringTeam.map((member, index) => (
                        <View key={index} className="flex-row items-center gap-3 py-2">
                          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                            <Text className="font-quicksand-bold text-blue-600 text-sm">
                              {member.firstName.charAt(0)}
                              {member.lastName.charAt(0)}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="font-quicksand-semibold text-sm text-gray-900">
                              {member.firstName} {member.lastName}
                            </Text>
                            <Text className="font-quicksand-medium text-xs text-gray-600">{member.email}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="font-quicksand-semibold text-md">You did not specify a hiring team</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View className="px-6 py-4 border-t border-gray-200 bg-white">
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-emerald-500 py-3 px-4 rounded-xl"
                style={{
                  shadowColor: "#16a34a",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={handlePostJob}
                activeOpacity={0.8}
                disabled={addingJob}
              >
                {addingJob || generatingAIDescription ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-quicksand-bold text-white text-center text-base">Confirm</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-3 px-4 rounded-xl border border-gray-300"
                onPress={() => setShowConfirmationModal(false)}
                activeOpacity={0.7}
              >
                <Text className="font-quicksand-bold text-gray-700 text-center text-base">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default CreateJob;
