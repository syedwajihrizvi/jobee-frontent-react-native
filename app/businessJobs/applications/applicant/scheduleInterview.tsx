import BackBar from "@/components/BackBar";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import { createInterview, getMostRecentInterviewForJob } from "@/lib/interviewEndpoints";
import useAuthStore from "@/store/auth.store";
import { BusinessUser, CreateInterviewForm } from "@/type";
import { Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

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
    location: "",
    meetingLink: "",
    phoneNumber: "",
    preparationTipsFromInterviewer: [],
  };
  const { applicantId, jobId, candidateId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();
  const conductorNameRef = useRef<TextInput>(null);
  const conductorEmailRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const notesFooterRef = useRef<View>(null);
  const interviewerConductorsRef = useRef<View>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const [interviewDetails, setInterviewDetails] = useState<CreateInterviewForm>({ ...defaultInterviewForm });
  const [conductorName, setConductorName] = useState("");
  const [conductorEmail, setConductorEmail] = useState("");
  const [preparationTip, setPreparationTip] = useState("");
  const [viewingBottomSheetFor, setViewingBottomSheetFor] = useState<"interviewer" | "note">("interviewer");
  const [loadingNewInterview, setLoadingNewInterview] = useState(false);
  const [addedSelf, setAddedSelf] = useState(false);
  const [snapPoints, setSnapPoints] = useState<string[]>(["30%", "40%"]);
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
      location,
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
    if (interviewType === "IN_PERSON" && !location) {
      Alert.alert("Error", "Please enter interview location.");
      return;
    }
    if (interviewType === "ONLINE" && !interviewDetails.meetingLink) {
      Alert.alert("Error", "Please enter meeting link.");
      return;
    }
    if (interviewType === "PHONE" && !interviewDetails.phoneNumber) {
      Alert.alert("Error", "Please enter phone number.");
      return;
    }
    if (!interviewDetails.timezone) {
      Alert.alert("Error", "Please enter timezone.");
      return;
    }
    setLoadingNewInterview(true);
    try {
      const res = await createInterview(interviewDetails, Number(jobId), Number(candidateId), Number(applicantId));
      if (res) {
        Alert.alert("Success", "Interview created successfully.");
        queryClient.invalidateQueries({
          queryKey: ["applicant", Number(applicantId)],
        });
        setTimeout(() => {
          setInterviewDetails({ ...defaultInterviewForm });
          router.back();
        }, 2000);
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
        isSelected ? "bg-green-500 border-green-500" : "bg-white border-gray-300"
      }`,
      text: `font-quicksand-semibold text-sm ${isSelected ? "text-white" : "text-gray-700"}`,
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
          className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
              <Feather name="calendar" size={20} color="#6366f1" />
            </View>
            <Text className="font-quicksand-bold text-xl text-gray-900">Interview Details</Text>
          </View>
          <Text className="font-quicksand-medium text-base text-gray-600 leading-6">
            Fill in the details below to schedule an interview with the candidate.
          </Text>
        </View>

        <View className="px-4 mt-6 gap-6">
          {/* Basic Information */}
          <View
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-lg text-gray-900 mb-4">Basic Information</Text>

            <View className="gap-4">
              <View>
                <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Interview Title *</Text>
                <TextInput
                  placeholder="e.g. Technical Interview"
                  value={interviewDetails?.title}
                  autoCapitalize="words"
                  onFocus={() => bottomSheetRef.current?.close()}
                  onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, title: text }))}
                  className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                />
              </View>

              <View>
                <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Description *</Text>
                <CustomMultilineInput
                  numberOfLines={4}
                  placeholder="Discuss project experience and technical skills..."
                  value={interviewDetails?.description}
                  customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900 min-h-[100px]"
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
          </View>

          <View
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-lg text-gray-900 mb-4">Interview Panel *</Text>
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
                  <Text className="font-quicksand-semibold text-white text-sm">Add Yourself</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-red-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
                  style={{
                    shadowColor: "#ef4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={removeBusinessUserFromConductors}
                  activeOpacity={0.8}
                >
                  <Feather name="user-minus" size={14} color="white" />
                  <Text className="font-quicksand-semibold text-white text-sm">Remove Yourself</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="bg-blue-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
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
                <Feather name="plus" size={14} color="white" />
                <Text className="font-quicksand-semibold text-white text-sm">Add Interviewer</Text>
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
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-base text-gray-900">{conductor.name}</Text>
                      <Text className="font-quicksand-medium text-sm text-gray-600">{conductor.email}</Text>
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
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-lg text-gray-900 mb-1">Interview Notes for Candidate</Text>
            <Text className="font-quicksand-medium text-base text-gray-600 leading-6 mb-3">
              These notes will be shared with the candidate to help them prepare for the interview.
            </Text>
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                className="bg-blue-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
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
                <Feather name="plus" size={14} color="white" />
                <Text className="font-quicksand-semibold text-white text-sm">Add Note</Text>
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
                        <Text className="font-quicksand-medium text-base text-gray-800 leading-6">{tip}</Text>
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
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-lg text-gray-900 mb-4">Schedule</Text>

            <View className="gap-4">
              <View>
                <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Date *</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  onFocus={() => bottomSheetRef.current?.close()}
                  value={interviewDetails?.interviewDate}
                  onChangeText={(text) =>
                    setInterviewDetails((prev) => ({
                      ...prev,
                      interviewDate: text,
                    }))
                  }
                  className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Start Time *</Text>
                  <TextInput
                    value={interviewDetails?.startTime}
                    onFocus={() => bottomSheetRef.current?.close()}
                    placeholder="10:00 AM"
                    onChangeText={(text) =>
                      setInterviewDetails((prev) => ({
                        ...prev,
                        startTime: text.toUpperCase(),
                      }))
                    }
                    className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                    style={{
                      shadowColor: "#000",
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
                    onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, endTime: text.toUpperCase() }))}
                    className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                    style={{
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
                  onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, timezone: text }))}
                  className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                  style={{
                    shadowColor: "#000",
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
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-lg text-gray-900 mb-4">Interview Format</Text>

            <View className="gap-3">
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
                <TextInput
                  value={interviewDetails?.location}
                  onFocus={() => bottomSheetRef.current?.close()}
                  placeholder="123 Main St, City, State"
                  onChangeText={(text) => setInterviewDetails((prev) => ({ ...prev, location: text }))}
                  className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                />
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
                  className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                />
              )}
              {interviewDetails.interviewType === "ONLINE" && (
                <TextInput
                  value={interviewDetails?.meetingLink}
                  onFocus={() => bottomSheetRef.current?.close()}
                  placeholder="https://zoom.us/j/1234567890"
                  onChangeText={(text) =>
                    setInterviewDetails((prev) => ({
                      ...prev,
                      meetingLink: text,
                    }))
                  }
                  className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
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
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View
        className="bg-white border-t border-gray-200 px-4 py-6 absolute bottom-0 left-0 right-0"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-green-500 rounded-xl py-4 items-center justify-center"
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
                <Feather name="check" size={18} color="white" />
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
              <Feather name="x" size={18} color="#6b7280" />
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
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                  <Feather name="user-plus" size={20} color="#3b82f6" />
                </View>
                <Text className="font-quicksand-bold text-xl text-gray-900">Add Interviewer</Text>
              </View>

              <View className="gap-6">
                <View>
                  <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Full Name *</Text>
                  <BottomSheetTextInput
                    value={conductorName}
                    autoCapitalize="words"
                    onChangeText={(text) => setConductorName(text)}
                    placeholder="Mike Wilson, Emma Johnson"
                    className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                    style={{
                      shadowColor: "#000",
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
                    className="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  />
                </View>

                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    className="flex-1 bg-blue-500 rounded-xl py-4 items-center justify-center"
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
                      <Feather name="plus" size={16} color="white" />
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
                      <Feather name="x" size={16} color="#6b7280" />
                      <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-3 mb-6">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                  <Feather name="user-plus" size={20} color="#3b82f6" />
                </View>
                <Text className="font-quicksand-bold text-xl text-gray-900">Add Note For Candidate</Text>
              </View>

              <View className="gap-6">
                <View>
                  <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Preparation Note</Text>
                  <BottomSheetTextInput
                    value={preparationTip}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    autoCapitalize="sentences"
                    onChangeText={(text) => {
                      // Handle the case where Enter was pressed
                      if (text.endsWith("\n") && text.trim() !== "") {
                        // Remove the newline and trim the text
                        const cleanText = text.replace(/\n$/, "").trim();
                        setPreparationTip(cleanText);
                        Keyboard.dismiss();
                        return;
                      }

                      // Handle empty input with just newline
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
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  />
                </View>

                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    className="flex-1 bg-blue-500 rounded-xl py-4 items-center justify-center"
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
                      <Feather name="plus" size={16} color="white" />
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
                      <Feather name="x" size={16} color="#6b7280" />
                      <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ScheduleInterview;
