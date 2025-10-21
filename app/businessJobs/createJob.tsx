import BackBar from "@/components/BackBar";
import { employmentTypes, experienceLevels, workArrangements } from "@/constants";
import { createJob } from "@/lib/jobEndpoints";
import useAuthStore from "@/store/auth.store";
import useBusinessProfileSummaryStore from "@/store/business-profile-summary.store";
import { BusinessUser, CreateJobForm } from "@/type";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
  const queryClient = useQueryClient();
  const defaultJobForm: CreateJobForm = {
    title: "",
    location: "",
    description: "",
    minSalary: "",
    maxSalary: "",
    experience: "",
    employmentType: "",
    tags: [],
    setting: "",
    appDeadline: "",
  };
  const { user: authUser } = useAuthStore();
  const { profileSummary, setProfileSummary } = useBusinessProfileSummaryStore();
  const [createJobForm, setCreateJobForm] = useState<CreateJobForm>(defaultJobForm);
  const [addingJob, setAddingJob] = useState(false);
  const tagInputRef = useRef<TextInput>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const user = authUser as BusinessUser | null;

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

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const handleCreateJob = async () => {
    const { title, location, description, minSalary, maxSalary, experience, employmentType, tags } = createJobForm;
    if (!title || !location || !description || !minSalary || !maxSalary || !experience || !employmentType) {
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
    setAddingJob(true);
    try {
      const result = await createJob(createJobForm, user?.id!);
      if (!result) {
        Alert.alert("Error", "Failed to create job. Please try again.");
        return;
      }
      console.log("Job created successfully:", result);
      Alert.alert("Success", "Job created successfully");
      setCreateJobForm({ ...defaultJobForm });
      queryClient.invalidateQueries({
        queryKey: ["jobs", "company", user?.companyId],
      });
      router.push(`/businessJobs/${result.id}?companyId=${user?.companyId}`);
      setProfileSummary({
        ...profileSummary,
        totalJobsPosted: (profileSummary?.totalJobsPosted || 0) + 1,
      } as any);
      tagInputRef.current?.clear();
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
              <Text className="form-input__label">Title</Text>
              <TextInput
                className="form-input__input"
                autoCapitalize="words"
                value={createJobForm.title}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, title: text })}
                placeholder="eg. Software Engineer"
              />
            </View>
            <View className="form-input">
              <Text className="form-input__label">Location</Text>
              <TextInput
                className="form-input__input"
                autoCapitalize="words"
                value={createJobForm.location}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, location: text })}
                placeholder="eg. New York, NY"
              />
            </View>
            <View className="form-input">
              <Text className="form-input__label">Description</Text>
              <TextInput
                placeholder="eg. We are looking for a skilled software engineer to join our team..."
                className="form-input__input"
                autoCapitalize="sentences"
                multiline={true}
                blurOnSubmit={true}
                textAlignVertical="top"
                value={createJobForm.description}
                onChangeText={(text) => setCreateJobForm({ ...createJobForm, description: text })}
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
                <Text className="form-input__label">Min Salary</Text>
                <TextInput
                  value={createJobForm.minSalary}
                  onChangeText={(text) => setCreateJobForm({ ...createJobForm, minSalary: text })}
                  className="form-input__input"
                  placeholder="eg. 80000"
                />
              </View>
              <View className="w-1/2 form-input">
                <Text className="form-input__label">Max Salary</Text>
                <TextInput
                  value={createJobForm.maxSalary}
                  onChangeText={(text) => setCreateJobForm({ ...createJobForm, maxSalary: text })}
                  className="form-input__input"
                  placeholder="eg. 120000"
                />
              </View>
            </View>
            <View className="flex flex-col gap-2">
              <View className="form-input">
                <Text className="form-input__label">Skills</Text>
                <TextInput
                  className="form-input__input"
                  onSubmitEditing={(event) => handleAddTag(event.nativeEvent.text.trim())}
                  ref={tagInputRef}
                  placeholder="eg. JavaScript, React, Node.js"
                />
              </View>
              {createJobForm.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {createJobForm.tags.map((tag) => (
                    <View key={tag} className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-800 font-quicksand-medium">{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View className="flex-row justify-center items-center gap-2">
              <TouchableOpacity
                className="mt-6 apply-button px-6 py-3 w-1/2 rounded-full flex items-center justify-center"
                onPress={handleCreateJob}
                disabled={addingJob}
              >
                {addingJob ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-quicksand-semibold text-md text-white">Create Job</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity className="mt-6 apply-button px-6 py-3 w-1/2 rounded-full flex items-center justify-center">
                <Text className="font-quicksand-semibold text-md text-white">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateJob;
