import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import GoogleMeetingCreator from "@/components/GoogleMeetingCreator";
import MicrosoftTeamsMeetingCreator from "@/components/MicrosoftTeamsMeetingCreator";
import ModalWithBg from "@/components/ModalWithBg";
import PlatformButton from "@/components/PlatformButton";
import RenderMeetingPlatformIcon from "@/components/RenderMeetingPlatformIcon";
import WebexMeetingCreator from "@/components/WebexMeetingCreator";
import ZoomMeeetingCreator from "@/components/ZoomMeeetingCreator";
import { meetingPlatforms } from "@/constants";
import { createInterview, getMostRecentInterviewForJob } from "@/lib/interviewEndpoints";
import {
  convert10DigitNumberToPhoneFormat,
  formatDateForDisplay,
  validateMeetingLink,
  validatePhoneNumber,
  validateTime,
  validateTimes,
} from "@/lib/utils";
import useApplicationStore from "@/store/applications.store";
import useAuthStore from "@/store/auth.store";
import useBusinessJobsStore from "@/store/businessJobs.store";
import { BusinessUser, CreateInterviewForm } from "@/type";
import { Feather, FontAwesome } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const getMeetingLinkPlaceholder = (platformType: string) => {
  switch (platformType) {
    case "ZOOM":
      return "https://zoom.us/j/1234567890";
    case "GOOGLE_MEET":
      return "https://meet.google.com/abc-defg-hij";
    case "MICROSOFT_TEAMS":
      return "https://teams.microsoft.com/l/meetup-join/19%3Ameeting_MjA1Y2Q0Y2QtMTIzOC00NTY3LTg5MDctYWJjZGVmZ2hpamts%40thread.v2/0?context=%7B%22Tid%22%3A%22aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee%22%2C%22Oid%22%3A%22ffffffff-1111-2222-3333-444444444444%22%7D";
    case "WEBEX":
      return "https://example.webex.com/meet/johndoe";
    case "OTHER":
      return "Enter your meeting link here";
    default:
      return "Enter your meeting link here";
  }
};

const ScheduleInterview = () => {
  const defaultInterviewForm = {
    title: "",
    description: "",
    conductors: [],
    interviewDate: "",
    startTime: "",
    endTime: "",
    interviewType: "ONLINE",
    timezone: "",
    streetAddress: "",
    buildingName: "",
    meetingLink: "",
    parkingInfo: "",
    contactInstructionsOnArrival: "",
    phoneNumber: "",
    meetingPlatform: "",
    preparationTipsFromInterviewer: [],
  };
  const { applicantId, jobId, candidateId, previousInterviewId } = useLocalSearchParams();
  const { setApplicationStatus } = useApplicationStore();
  const { incrementInterviewsForJob, decrementPendingApplicationsForJob } = useBusinessJobsStore();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();
  const conductorNameRef = useRef<TextInput>(null);
  const conductorEmailRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const notesFooterRef = useRef<View>(null);
  const interviewerConductorsRef = useRef<View>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState<CreateInterviewForm>({ ...defaultInterviewForm });
  const [conductorName, setConductorName] = useState("");
  const [conductorEmail, setConductorEmail] = useState("");
  const [preparationTip, setPreparationTip] = useState("");
  const [showMeetingCreatorModal, setShowMeetingCreatorModal] = useState(false);
  const [viewingBottomSheetFor, setViewingBottomSheetFor] = useState<"interviewer" | "note">("interviewer");
  const [loadingNewInterview, setLoadingNewInterview] = useState(false);
  const [addedSelf, setAddedSelf] = useState(false);
  const [snapPoints, setSnapPoints] = useState<string[]>(["30%", "40%"]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const user = authUser as BusinessUser | null;

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setSnapPoints(["60%", "70%"]);
    });
    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setSnapPoints(["30%", "40%"]);
    });
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAnExistingInterview = async () => {
      try {
        const interview = await getMostRecentInterviewForJob(Number(jobId));
        if (isMounted && interview) {
          const { title, description, interviewType, interviewers, otherInterviewers } = interview;
          const conductors = [
            ...interviewers.map((interviewer) => ({
              name: interviewer.name,
              email: interviewer.email,
            })),
            ...otherInterviewers,
          ];
          if (conductors.findIndex((conductor) => conductor.email === user?.email) > -1) {
            setAddedSelf(true);
          }
          setInterviewDetails((prev) => ({
            ...prev,
            title,
            description,
            interviewType,
            conductors,
          }));
        } else {
          setInterviewDetails({ ...defaultInterviewForm });
        }
      } catch (error) {
        console.log("Error fetching interview: ", error);
      }
    };
    fetchAnExistingInterview();
    return () => {
      isMounted = false;
    };
  }, [user, jobId]);

  const handleInterviewFormSubmit = async () => {
    const {
      title,
      description,
      conductors: conductors,
      interviewDate,
      interviewType,
      startTime,
      endTime,
      streetAddress,
      meetingLink,
      phoneNumber,
      meetingPlatform,
    } = interviewDetails;
    if (!title) {
      Alert.alert("Error", "Please enter interview title.");
      return;
    }
    if (!description) {
      Alert.alert("Error", "Please enter interview description.");
      return;
    }
    if (conductors.length === 0) {
      Alert.alert("Error", "Please add at least one conductor.");
      return;
    }
    if (!interviewDate) {
      Alert.alert("Error", "Please enter interview date.");
      return;
    }
    if (!startTime) {
      Alert.alert("Error", "Please enter interview start time.");
      return;
    }
    if (!endTime) {
      Alert.alert("Error", "Please enter interview end time.");
      return;
    }
    if (!interviewDate) {
      Alert.alert("Error", "Please enter an interview date.");
      return;
    }
    if (!validateTime(startTime)) {
      Alert.alert("Error", "Please enter a valid start time in HH:MM AM/PM format.");
      return;
    }
    if (!validateTime(endTime)) {
      Alert.alert("Error", "Please enter a valid end time in HH:MM AM/PM format.");
      return;
    }
    if (!validateTimes(startTime, endTime)) {
      Alert.alert("Error", "Please ensure that end time is after start time.");
      return;
    }
    if (interviewType === "IN_PERSON") {
      if (!streetAddress) {
        Alert.alert("Error", "Please enter street address.");
        return;
      }
    }
    if (interviewType === "ONLINE") {
      if (!meetingPlatform) {
        Alert.alert("Error", "Please select meeting platform.");
        return;
      }
      if (!meetingLink && meetingPlatform !== "OTHER") {
        Alert.alert("Error", "Please enter meeting link.");
        return;
      }
      if (!validateMeetingLink(meetingLink, meetingPlatform)) {
        Alert.alert("Error", "Please enter a valid meeting link.");
        return;
      }
    }
    if (interviewType === "PHONE") {
      if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
        Alert.alert("Error", "Please enter a valid phone number.");
        return;
      }
    }
    if (!interviewDetails.timezone) {
      Alert.alert("Error", "Please enter timezone.");
      return;
    }
    setShowConfirmationModal(true);
  };

  const createOnlineMeetingOnPlatform = () => {};

  const handleScheduleInterviewConfirm = async () => {
    setLoadingNewInterview(true);
    try {
      // TODO: If meeting platform is selected, create meeting via respective API and set meeting link in interviewDetails
      if (interviewDetails.interviewType === "ONLINE") {
        console.log("Creating online meeting on platform: ", interviewDetails.meetingPlatform);
      }
      const res = await createInterview(
        interviewDetails,
        Number(jobId),
        Number(candidateId),
        Number(applicantId),
        Number(previousInterviewId)
      );
      if (res) {
        queryClient.invalidateQueries({
          queryKey: ["applicant", Number(applicantId)],
        });
        setApplicationStatus(Number(jobId), Number(applicantId), "INTERVIEW_SCHEDULED");
        Alert.alert("Success", "Interview created successfully.");
        setInterviewDetails({ ...defaultInterviewForm });
        incrementInterviewsForJob(Number(jobId));
        decrementPendingApplicationsForJob(Number(jobId));
        router.back();
        return;
      }
      Alert.alert("Error", "Error creating interview. Please try again.");
      return;
    } catch (error) {
      console.log(error);
      return;
    } finally {
      setLoadingNewInterview(false);
    }
  };

  const addBusinessUserToConductors = () => {
    if (user) {
      const { firstName, lastName, email } = user;
      const currInterviewConductors = interviewDetails?.conductors || [];
      currInterviewConductors.push({ name: `${firstName} ${lastName}`, email });
      setInterviewDetails((prev) => ({
        ...prev,
        conductors: currInterviewConductors,
      }));
      setAddedSelf(true);
    }
  };

  const removeBusinessUserFromConductors = () => {
    if (user) {
      const { firstName, lastName, email } = user;
      const fullName = firstName + " " + lastName;
      const index = interviewDetails?.conductors.findIndex(
        (conductor) => conductor.email === email && conductor.name === fullName
      );
      if (index > -1) {
        const currInterviewConductors = interviewDetails?.conductors || [];
        currInterviewConductors.splice(index, 1);
        setInterviewDetails((prev) => ({
          ...prev,
          conductors: currInterviewConductors,
        }));
        setAddedSelf(false);
      }
      setAddedSelf(false);
    }
  };

  const addConductorToConductors = () => {
    const currInterviewConductors = interviewDetails?.conductors || [];
    const index = currInterviewConductors.findIndex(
      (conductor) => conductor.email === conductorEmail && conductor.name === conductorName
    );
    if (index > -1) {
      Alert.alert("Error", "This conductor is already added.");
      return;
    }
    currInterviewConductors.push({
      name: conductorName,
      email: conductorEmail,
    });
    setInterviewDetails((prev) => ({
      ...prev,
      conductors: currInterviewConductors,
    }));
    setConductorEmail("");
    setConductorName("");
    conductorNameRef.current?.clear();
    conductorEmailRef.current?.clear();
    bottomSheetRef.current?.close();
    setTimeout(() => {
      interviewerConductorsRef.current?.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollToPosition(0, pageY - 150, true);
      });
    }, 300);
  };

  const removeConductor = (index: number) => {
    const currInterviewConductors = interviewDetails?.conductors || [];
    currInterviewConductors.splice(index, 1);
    setInterviewDetails((prev) => ({
      ...prev,
      conductors: currInterviewConductors,
    }));
    if (user && currInterviewConductors.findIndex((conductor) => conductor.email === user.email) === -1) {
      setAddedSelf(false);
    }
  };

  const addNoteToPrepatationTips = () => {
    const currPreparationTips = interviewDetails?.preparationTipsFromInterviewer || [];
    const index = currPreparationTips.findIndex(
      (tip) => tip.replace(" ", "").trim() === preparationTip.replace(" ", "").trim()
    );
    if (index > -1) {
      Alert.alert("Error", "This note is already added.");
    }
    currPreparationTips.push(preparationTip.trim());
    setInterviewDetails((prev) => ({
      ...prev,
      preparationTipsFromInterviewer: currPreparationTips,
    }));
    setPreparationTip("");
    bottomSheetRef.current?.close();
    Keyboard.dismiss();

    setTimeout(() => {
      notesFooterRef.current?.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollToPosition(0, pageY - 150, true);
      });
    }, 300);
  };

  const removeNote = (index: number) => {
    const currPreparationTips = interviewDetails?.preparationTipsFromInterviewer || [];
    currPreparationTips.splice(index, 1);
    setInterviewDetails((prev) => ({
      ...prev,
      preparationTipsFromInterviewer: currPreparationTips,
    }));
  };

  const closeAddConductorBottomSheet = () => {
    setConductorEmail("");
    setConductorName("");
    setPreparationTip("");
    conductorEmailRef.current?.clear();
    conductorNameRef.current?.clear();
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
  };

  const getInterviewTypeButtonStyle = (type: string) => {
    const isSelected = interviewDetails.interviewType === type;
    return {
      container: `px-4 py-3 rounded-xl flex-row items-center gap-2 border ${
        isSelected ? "bg-emerald-500 border-green-500" : "bg-white border-gray-300"
      }`,
      text: `font-quicksand-semibold text-xs ${isSelected ? "text-white" : "text-gray-700"}`,
      shadow: isSelected
        ? {
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }
        : {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          },
    };
  };

  const handleBottomSheetExpand = (type: "interviewer" | "note") => {
    setViewingBottomSheetFor(type);
    bottomSheetRef.current?.expand();
  };

  const getInterviewTypeIcon = (type: string) => {
    const isSelected = interviewDetails.interviewType === type;
    const color = isSelected ? "white" : "#6b7280";

    switch (type) {
      case "IN_PERSON":
        return <Feather name="users" size={16} color={color} />;
      case "ONLINE":
        return <Feather name="video" size={16} color={color} />;
      case "PHONE":
        return <Feather name="phone" size={16} color={color} />;
      default:
        return null;
    }
  };

  function renderInterviewTypeText(interviewType: string): string {
    if (interviewType === "IN_PERSON") return "Location";
    if (interviewType === "ONLINE") return "Meeting Link";
    if (interviewType === "PHONE") return "Phone Number";
    return "";
  }

  const updateTimeValue = (text: string) => {
    const lowercase = text.toLowerCase().replace(" ", "").trim();
    if (lowercase.includes("am") || lowercase.includes("pm")) {
      const index = lowercase.indexOf("am") > -1 ? lowercase.indexOf("am") : lowercase.indexOf("pm");
      return text.slice(0, index) + " " + text.slice(index).toUpperCase();
    }
    return text.toUpperCase();
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const deadline = new Date(date);
      deadline.setHours(0, 0, 0, 0); // Set to end of the selected day
      // Format date as YYYY-MM-DD for the form
      const formattedDateTime = deadline.toISOString().slice(0, 19);
      setInterviewDetails({ ...interviewDetails, interviewDate: formattedDateTime });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 relative">
      <BackBar label="Schedule Interview" />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        enableResetScrollToCoords={false}
      >
        <View
          className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3 mb-1">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
              <Feather name="calendar" size={18} color="#10b981" />
            </View>
            <Text className="font-quicksand-bold text-lg text-gray-900">Interview Details</Text>
          </View>
          <Text className="font-quicksand-medium text-sm text-gray-600 leading-6">
            Fill in the details below to schedule an interview with the candidate.
          </Text>
        </View>

        <View className="px-4 mt-6 gap-6">
          <View
            className="bg-white rounded-2xl p-4 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">Basic Information</Text>

            <View className="gap-4">
              <CustomInput
                placeholder="e.g. Technical Interview"
                fontSize={12}
                label="Interview Title *"
                customLabelClass="font-quicksand-semibold text-sm text-gray-700"
                autoCapitalize="words"
                value={interviewDetails?.title}
                onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, title: text }))}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-md text-gray-900"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />
              <CustomMultilineInput
                label="Description *"
                numberOfLines={4}
                customLabelClass="font-quicksand-semibold text-sm text-gray-700"
                placeholder="e.g. Discuss project experience and technical skills..."
                value={interviewDetails?.description}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-sm text-gray-900 min-h-[100px]"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                onChangeText={(text) =>
                  setInterviewDetails((prev) => ({
                    ...prev,
                    description: text,
                  }))
                }
              />
            </View>
          </View>

          <View
            className="bg-white rounded-2xl p-4 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-md text-gray-900 mb-2">Interview Panel *</Text>
            <View className="flex-row gap-3 mb-4">
              {!addedSelf ? (
                <TouchableOpacity
                  className="bg-emerald-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
                  style={{
                    shadowColor: "#10b981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={addBusinessUserToConductors}
                  activeOpacity={0.8}
                >
                  <Feather name="user-plus" size={14} color="white" />
                  <Text className="font-quicksand-semibold text-white text-xs">Add Yourself</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-red-100 border border-red-300 rounded-xl px-4 py-3 flex-row items-center gap-2"
                  style={{
                    shadowColor: "#ef4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                  onPress={removeBusinessUserFromConductors}
                  activeOpacity={0.8}
                >
                  <Feather name="user-minus" size={14} color="#ef4444" />
                  <Text className="font-quicksand-semibold text-red-700 text-xs">Remove Yourself</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="bg-blue-100 border border-blue-300 rounded-xl px-4 py-3 flex-row items-center gap-2"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleBottomSheetExpand("interviewer")}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={14} color="#3b82f6" />
                <Text className="font-quicksand-semibold text-blue-700 text-xs">Add Interviewer</Text>
              </TouchableOpacity>
            </View>

            {interviewDetails.conductors && interviewDetails.conductors.length > 0 && (
              <View className="gap-3">
                <Text className="font-quicksand-semibold text-sm text-gray-700">
                  Interview Panel ({interviewDetails.conductors.length})
                </Text>
                {interviewDetails.conductors.map((conductor, index) => (
                  <View
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex-row items-center justify-between"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-sm text-gray-900">{conductor.name}</Text>
                      <Text className="font-quicksand-medium text-xs text-gray-600">{conductor.email}</Text>
                    </View>
                    <TouchableOpacity
                      className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
                      onPress={() => removeConductor(index)}
                      activeOpacity={0.7}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View ref={interviewerConductorsRef} />
          </View>

          <View
            className="bg-white rounded-2xl p-4 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-md text-gray-900 mb-1">Interview Notes for Candidate</Text>
            <Text className="font-quicksand-medium text-sm text-gray-600 leading-6 mb-3">
              These notes will be shared with the candidate to help them prepare for the interview.
            </Text>
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                className="bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 flex-row items-center gap-2"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleBottomSheetExpand("note")}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={14} color="#b45309" />
                <Text className="font-quicksand-semibold text-amber-700 text-xs">Add Note</Text>
              </TouchableOpacity>
            </View>

            {interviewDetails.preparationTipsFromInterviewer &&
              interviewDetails.preparationTipsFromInterviewer.length > 0 && (
                <View className="gap-3">
                  <Text className="font-quicksand-semibold text-sm text-gray-700">
                    Interview Notes ({interviewDetails.preparationTipsFromInterviewer.length})
                  </Text>
                  {interviewDetails.preparationTipsFromInterviewer.map((tip, index) => (
                    <View
                      key={index}
                      className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-row items-start gap-3"
                      style={{
                        shadowColor: "#f59e0b",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <View
                        className="w-6 h-6 bg-emerald-500 rounded border-2 border-emerald-600 items-center justify-center mt-0.5"
                        style={{
                          shadowColor: "#10b981",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.2,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Feather name="check" size={12} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-quicksand-medium text-sm text-gray-800 leading-6">{tip}</Text>
                      </View>
                      <TouchableOpacity
                        className="w-7 h-7 bg-red-100 rounded-full items-center justify-center ml-2"
                        onPress={() => removeNote(index)}
                        activeOpacity={0.7}
                        style={{
                          shadowColor: "#ef4444",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Feather name="x" size={12} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <View ref={notesFooterRef} />
                </View>
              )}
          </View>

          <View
            className="bg-white rounded-2xl p-4 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-md text-gray-900 mb-2">Schedule</Text>
            <View className="gap-4">
              <View>
                <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Date *</Text>
                <TouchableOpacity
                  className="form-input__input bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-quicksand-medium text-sm ${
                      interviewDetails.interviewDate ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {interviewDetails.interviewDate
                      ? formatDateForDisplay(interviewDetails.interviewDate)
                      : "Select interview date"}
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

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Start Time *</Text>
                  <TextInput
                    value={interviewDetails?.startTime}
                    onFocus={() => bottomSheetRef.current?.close()}
                    placeholder="10:00 AM"
                    onChangeText={(text) =>
                      setInterviewDetails((prev) => {
                        const updatedText = updateTimeValue(text);
                        return {
                          ...prev,
                          startTime: updatedText,
                        };
                      })
                    }
                    className="border border-gray-300 rounded-xl p-3 font-quicksand-medium text-base text-gray-900"
                    style={{
                      shadowColor: "#000",
                      fontSize: 12,
                      lineHeight: 16,
                      paddingTop: 10,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">End Time *</Text>
                  <TextInput
                    value={interviewDetails?.endTime}
                    onFocus={() => bottomSheetRef.current?.close()}
                    placeholder="12:00 PM"
                    onChangeText={(text) =>
                      setInterviewDetails((prev) => {
                        const updatedText = updateTimeValue(text);
                        return {
                          ...prev,
                          endTime: updatedText,
                        };
                      })
                    }
                    className="border border-gray-300 rounded-xl p-3 font-quicksand-medium text-base text-gray-900"
                    style={{
                      fontSize: 12,
                      lineHeight: 16,
                      paddingTop: 10,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  />
                </View>
              </View>

              <View>
                <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Timezone *</Text>
                <TextInput
                  value={interviewDetails?.timezone}
                  onFocus={() => bottomSheetRef.current?.close()}
                  placeholder="EST, PST, GMT"
                  onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, timezone: text.toUpperCase() }))}
                  className="border border-gray-300 rounded-xl p-3 font-quicksand-medium text-base text-gray-900"
                  style={{
                    shadowColor: "#000",
                    fontSize: 12,
                    lineHeight: 16,
                    paddingTop: 10,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                />
              </View>
            </View>
          </View>

          <View
            className="bg-white rounded-2xl p-4 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-md text-gray-900 mb-2">Interview Format</Text>

            <View className="gap-3 flex-row">
              {["IN_PERSON", "ONLINE", "PHONE"].map((type) => {
                const style = getInterviewTypeButtonStyle(type);
                const labels = {
                  IN_PERSON: "In-Person",
                  ONLINE: "Online",
                  PHONE: "Phone Call",
                };

                return (
                  <TouchableOpacity
                    key={type}
                    className={style.container}
                    style={style.shadow}
                    onPress={() =>
                      setInterviewDetails((prev) => ({
                        ...prev,
                        interviewType: type as any,
                      }))
                    }
                    activeOpacity={0.8}
                  >
                    {getInterviewTypeIcon(type)}
                    <Text className={style.text}>{labels[type as keyof typeof labels]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="mt-6">
              <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">
                {renderInterviewTypeText(interviewDetails.interviewType)}
              </Text>
              {interviewDetails.interviewType === "IN_PERSON" && (
                <View className="gap-2">
                  <CustomInput
                    placeholder="123 Main St, City, State"
                    label="Address *"
                    customLabelClass="font-quicksand-semibold text-sm text-gray-700"
                    fontSize={12}
                    autoCapitalize="words"
                    value={interviewDetails?.streetAddress}
                    onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, streetAddress: text }))}
                    customClass="border border-gray-300 rounded-xl p-2 font-quicksand-medium text-md text-gray-900"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  />
                  <CustomInput
                    placeholder="Techhub Tower, 5th Floor"
                    autoCapitalize="words"
                    fontSize={12}
                    label="Building or Office Name"
                    customLabelClass="font-quicksand-semibold text-sm text-gray-700"
                    value={interviewDetails?.buildingName}
                    onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, buildingName: text }))}
                    customClass="border border-gray-300 rounded-xl p-2 font-quicksand-medium text-md text-gray-900"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  />
                  <CustomMultilineInput
                    placeholder="Parking available at rear entrance"
                    label="Parking Information"
                    customLabelClass="font-quicksand-semibold text-sm text-gray-700"
                    value={interviewDetails?.parkingInfo}
                    onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, parkingInfo: text }))}
                    customClass="border border-gray-300 rounded-xl p-2 font-quicksand-medium text-sm text-gray-900"
                    style={{
                      fontSize: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      height: 80,
                    }}
                  />
                  <CustomMultilineInput
                    placeholder="Show ID at first floor reception"
                    label="Contact Instructions"
                    customLabelClass="font-quicksand-semibold text-sm text-gray-700"
                    value={interviewDetails?.contactInstructionsOnArrival}
                    onChangeText={(text) =>
                      setInterviewDetails((prev) => ({ ...prev, contactInstructionsOnArrival: text }))
                    }
                    customClass="border border-gray-300 rounded-xl p-2 font-quicksand-medium text-sm text-gray-900"
                    style={{
                      fontSize: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      height: 80,
                    }}
                  />
                </View>
              )}
              {interviewDetails.interviewType === "PHONE" && (
                <TextInput
                  value={interviewDetails?.phoneNumber}
                  onFocus={() => bottomSheetRef.current?.close()}
                  placeholder="+1 234 567 8901"
                  onChangeText={(text) =>
                    setInterviewDetails((prev) => ({
                      ...prev,
                      phoneNumber: text,
                    }))
                  }
                  onSubmitEditing={() => {
                    let phoneNumber = interviewDetails.phoneNumber;
                    phoneNumber = phoneNumber.replaceAll(" ", "").replaceAll("-", "").trim();
                    if (phoneNumber.length === 10) {
                      const formattedNumber = convert10DigitNumberToPhoneFormat(phoneNumber);
                      setInterviewDetails((prev) => ({
                        ...prev,
                        phoneNumber: formattedNumber,
                      }));
                    }
                    if (phoneNumber.length >= 11) {
                      const length = phoneNumber.length;
                      const formattedNumber =
                        phoneNumber.slice(0, length - 10) +
                        " " +
                        convert10DigitNumberToPhoneFormat(phoneNumber.slice(length - 10, length));
                      setInterviewDetails((prev) => ({
                        ...prev,
                        phoneNumber: formattedNumber,
                      }));
                    }
                  }}
                  className="border border-gray-300 rounded-xl p-2 font-quicksand-medium text-base text-gray-900"
                  style={{
                    fontSize: 12,
                    lineHeight: 16,
                    paddingTop: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                />
              )}
              {interviewDetails.interviewType === "ONLINE" && (
                <View className="gap-2">
                  <View className="gap-2">
                    <Text className="font-quicksand-semibold">Platform Type</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                      {meetingPlatforms.map((platform) => (
                        <PlatformButton
                          key={platform.value}
                          textColor={platform.textColor}
                          bgColor={platform.bgColor}
                          label={platform.label}
                          icon={
                            <RenderMeetingPlatformIcon
                              platformColor={platform.textColor}
                              platformType={platform.value}
                              active={interviewDetails.meetingPlatform !== platform.value}
                            />
                          }
                          onPress={() => {
                            setInterviewDetails((prev) => ({
                              ...prev,
                              meetingPlatform: platform.value,
                            }));
                            if (platform.value !== "OTHER") setShowMeetingCreatorModal(true);
                          }}
                          isSelected={interviewDetails.meetingPlatform === platform.value}
                        />
                      ))}
                    </View>
                  </View>
                  {interviewDetails.meetingPlatform === "OTHER" && (
                    <CustomInput
                      value={interviewDetails?.meetingLink}
                      placeholder={getMeetingLinkPlaceholder(interviewDetails.meetingPlatform)}
                      fontSize={12}
                      onChangeText={(text) =>
                        setInterviewDetails((prev) => ({
                          ...prev,
                          meetingLink: text,
                        }))
                      }
                      customClass="border border-gray-300 rounded-xl p-2 font-quicksand-medium text-md text-gray-900"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                      autoCapitalize="none"
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View
        className="bg-white border-t border-gray-200 px-4 pb-10 pt-6 absolute bottom-0 left-0 right-0"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={handleInterviewFormSubmit}
            disabled={loadingNewInterview}
            activeOpacity={0.8}
          >
            {loadingNewInterview ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="font-quicksand-bold text-white text-base">Schedule Interview</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => router.back()}
            disabled={loadingNewInterview}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="extend"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        <BottomSheetScrollView
          className="flex-1 bg-white p-6"
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
        >
          {viewingBottomSheetFor === "interviewer" ? (
            <>
              <View className="flex-row items-center gap-3 mb-6">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="user-plus" size={20} color="#10b981" />
                </View>
                <Text className="font-quicksand-semibold text-lg text-gray-900">Add Interviewer</Text>
              </View>

              <View className="gap-6">
                <View>
                  <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Full Name *</Text>
                  <BottomSheetTextInput
                    value={conductorName}
                    autoCapitalize="words"
                    onChangeText={(text) => setConductorName(text)}
                    placeholder="Mike Wilson, Emma Johnson"
                    className="border border-gray-300 rounded-xl p-3 font-quicksand-medium text-base text-gray-900"
                    style={{
                      shadowColor: "#000",
                      fontSize: 12,
                      lineHeight: 16,
                      paddingVertical: 10,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  />
                </View>

                <View>
                  <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Email Address *</Text>
                  <BottomSheetTextInput
                    value={conductorEmail}
                    autoCapitalize="none"
                    onChangeText={(text) => setConductorEmail(text)}
                    placeholder="mike.wilson@example.com"
                    className="border border-gray-300 rounded-xl p-3 font-quicksand-medium text-base text-gray-900"
                    style={{
                      shadowColor: "#000",
                      fontSize: 12,
                      lineHeight: 16,
                      paddingVertical: 10,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  />
                </View>

                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
                    style={{
                      shadowColor: "#3b82f6",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    onPress={addConductorToConductors}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="font-quicksand-bold text-white text-base">Add Interviewer</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={closeAddConductorBottomSheet}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-3 mb-6">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="user-plus" size={20} color="#10b981" />
                </View>
                <Text className="font-quicksand-bold text-md text-gray-900">Add Note For Candidate</Text>
              </View>

              <View className="gap-6">
                <View>
                  <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Preparation Note</Text>
                  <View className="relative">
                    <BottomSheetTextInput
                      value={preparationTip}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      autoCapitalize="sentences"
                      onChangeText={(text) => {
                        if (text.endsWith("\n") && text.trim() !== "") {
                          const cleanText = text.replace(/\n$/, "").trim();
                          setPreparationTip(cleanText);
                          Keyboard.dismiss();
                          return;
                        }
                        if (text === "\n" && preparationTip === "") {
                          Keyboard.dismiss();
                          return;
                        }

                        setPreparationTip(text);
                      }}
                      placeholder="e.g. Please be prepared to discuss your previous projects and technical skills."
                      returnKeyType="done"
                      maxLength={100}
                      className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                      style={{
                        shadowColor: "#000",
                        height: 80,
                        fontSize: 12,
                        lineHeight: 16,
                        paddingVertical: 10,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    />
                    <Text className="absolute bottom-2 right-4 font-quicksand-medium text-xs text-gray-400">
                      {preparationTip.length}/100
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
                    style={{
                      shadowColor: "#3b82f6",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    onPress={addNoteToPrepatationTips}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="font-quicksand-bold text-white text-base">Add Note</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={closeAddConductorBottomSheet}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
      <ModalWithBg visible={showConfirmationModal} customHeight={0.85} customWidth={0.95}>
        <View className="flex-1">
          <View className="px-6 py-5 border-b border-gray-200 bg-white">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                <FontAwesome name="calendar-check-o" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-bold text-xl text-gray-900">Confirm Interview</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">
                  Review interview details before scheduling
                </Text>
              </View>
            </View>
          </View>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 py-4 gap-3">
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <View className="gap-1">
                  <View>
                    <Text className="font-quicksand-bold text-base">Title</Text>
                    <Text className="font-quicksand-medium text-sm text-gray-800 leading-5">
                      {interviewDetails.title || "No description provided"}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-quicksand-bold text-base">Description</Text>
                    <Text className="font-quicksand-medium text-sm text-gray-800 leading-5">
                      {interviewDetails.description || "No description provided"}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Text className="font-quicksand-bold text-base text-blue-900 mb-1">Interview Panel</Text>

                {interviewDetails.conductors && interviewDetails.conductors.length > 0 ? (
                  <View className="gap-2">
                    {interviewDetails.conductors.map((conductor, index) => (
                      <View key={index} className="flex-row items-center gap-3 bg-white rounded-lg p-3">
                        <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                          <Text className="font-quicksand-bold text-white text-xs">
                            {conductor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-quicksand-bold text-sm text-gray-900">{conductor.name}</Text>
                          <Text className="font-quicksand-medium text-xs text-gray-600">{conductor.email}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="font-quicksand-medium text-sm text-blue-700">No interviewers added</Text>
                )}
              </View>
              <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <Text className="font-quicksand-bold text-base text-purple-900 mb-2">Schedule</Text>

                <View className="gap-2">
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="font-quicksand-semibold text-sm text-purple-700">Date</Text>
                      <Text className="font-quicksand-bold text-sm text-purple-900 mt-1">
                        {interviewDetails.interviewDate || "Not specified"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-semibold text-sm text-purple-700">Timezone</Text>
                      <Text className="font-quicksand-bold text-sm text-purple-900 mt-1">
                        {interviewDetails.timezone || "Not specified"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="font-quicksand-semibold text-sm text-purple-700">Start Time</Text>
                      <Text className="font-quicksand-bold text-sm text-purple-900 mt-1">
                        {interviewDetails.startTime || "Not specified"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-semibold text-sm text-purple-700">End Time</Text>
                      <Text className="font-quicksand-bold text-sm text-purple-900 mt-1">
                        {interviewDetails.endTime || "Not specified"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <Text className="font-quicksand-bold text-base text-emerald-900 mb-2">Interview Format</Text>

                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                    {getInterviewTypeIcon(interviewDetails.interviewType)}
                  </View>
                  <View>
                    <Text className="font-quicksand-bold text-base text-emerald-900">
                      {interviewDetails.interviewType === "IN_PERSON"
                        ? "In-Person Interview"
                        : interviewDetails.interviewType === "ONLINE"
                          ? "Online Interview"
                          : interviewDetails.interviewType === "PHONE"
                            ? "Phone Interview"
                            : "Not specified"}
                    </Text>
                  </View>
                </View>
                {interviewDetails.interviewType === "IN_PERSON" && (
                  <View className="bg-white rounded-lg p-3 gap-2">
                    <View>
                      <Text className="font-quicksand-semibold text-sm text-emerald-700">Address</Text>
                      <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1">
                        {interviewDetails.streetAddress || "Address not provided"}
                      </Text>
                    </View>
                    {interviewDetails.buildingName && (
                      <View>
                        <Text className="font-quicksand-semibold text-sm text-emerald-700">Building</Text>
                        <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1">
                          {interviewDetails.buildingName}
                        </Text>
                      </View>
                    )}
                    {interviewDetails.parkingInfo && (
                      <View>
                        <Text className="font-quicksand-semibold text-sm text-emerald-700">Parking</Text>
                        <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1">
                          {interviewDetails.parkingInfo.trim() || "No parking information provided"}
                        </Text>
                      </View>
                    )}
                    {interviewDetails.contactInstructionsOnArrival && (
                      <View>
                        <Text className="font-quicksand-semibold text-sm text-emerald-700">Instructions</Text>
                        <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1">
                          {interviewDetails.contactInstructionsOnArrival.trim() || "No instructions provided"}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {interviewDetails.interviewType === "ONLINE" && (
                  <View className="bg-white rounded-lg p-3 gap-2">
                    {interviewDetails.meetingPlatform && (
                      <View className="flex-row items-center gap-2 mb-2">
                        <Text className="font-quicksand-semibold text-sm text-emerald-700">Platform:</Text>
                        <View className="flex-row items-center gap-2">
                          <RenderMeetingPlatformIcon
                            platformColor="#059669"
                            platformType={interviewDetails.meetingPlatform}
                            active={true}
                          />
                          <Text className="font-quicksand-bold text-sm text-emerald-900">
                            {meetingPlatforms.find((p) => p.value === interviewDetails.meetingPlatform)?.label}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View>
                      <Text className="font-quicksand-semibold text-sm text-emerald-700">Meeting Link</Text>
                      <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1" numberOfLines={2}>
                        {interviewDetails.meetingLink || "Meeting link not provided"}
                      </Text>
                    </View>
                  </View>
                )}
                {interviewDetails.interviewType === "PHONE" && (
                  <View className="bg-white rounded-lg p-3">
                    <Text className="font-quicksand-semibold text-sm text-emerald-700">Phone Number</Text>
                    <Text className="font-quicksand-bold text-base text-emerald-900 mt-1">
                      {interviewDetails.phoneNumber || "Phone number not provided"}
                    </Text>
                  </View>
                )}
              </View>
              {interviewDetails.preparationTipsFromInterviewer &&
                interviewDetails.preparationTipsFromInterviewer.length > 0 && (
                  <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <Text className="font-quicksand-bold text-base text-amber-900 mb-3">
                      Preparation Notes ({interviewDetails.preparationTipsFromInterviewer.length})
                    </Text>

                    <View className="gap-2">
                      {interviewDetails.preparationTipsFromInterviewer.map((tip, index) => (
                        <View key={index} className="flex-row items-start gap-3 bg-white rounded-lg p-3">
                          <View className="w-5 h-5 bg-amber-500 rounded-full items-center justify-center mt-0.5">
                            <Text className="font-quicksand-bold text-white text-xs">{index + 1}</Text>
                          </View>
                          <Text className="font-quicksand-medium text-sm text-amber-900 flex-1 leading-5">{tip}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
            </View>
          </ScrollView>
          <View className="px-6 py-4 border-t border-gray-200 bg-white">
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
                style={{
                  shadowColor: "#16a34a",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() => {
                  setShowConfirmationModal(false);
                  handleScheduleInterviewConfirm();
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-bold text-white text-base">Confirm</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 border border-gray-200 rounded-xl py-4 items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => setShowConfirmationModal(false)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-bold text-white text-base">Cancel</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ModalWithBg>
      <ModalWithBg visible={showMeetingCreatorModal} customHeight={0.3} customWidth={0.8}>
        <View className="flex-1">
          <View className="px-4 py-3 border-b border-gray-200 bg-white flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <RenderMeetingPlatformIcon
                platformType={interviewDetails.meetingPlatform}
                platformColor="purple"
                active={true}
                size={24}
              />
            </View>
            <TouchableOpacity onPress={() => setShowMeetingCreatorModal(false)}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {interviewDetails.meetingPlatform === "GOOGLE_MEET" && <GoogleMeetingCreator />}
            {interviewDetails.meetingPlatform === "MICROSOFT_TEAMS" && <MicrosoftTeamsMeetingCreator />}
            {interviewDetails.meetingPlatform === "ZOOM" && <ZoomMeeetingCreator />}
            {interviewDetails.meetingPlatform === "WEBEX" && <WebexMeetingCreator />}
          </ScrollView>
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default ScheduleInterview;
