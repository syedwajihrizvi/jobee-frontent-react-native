import { COMMON_TIMEZONES, mapTimezoneValueToLabel } from "@/constants";
import { requestRescheduleInterview } from "@/lib/interviewEndpoints";
import { formatDateForDisplay, formatTime, formatTimeForDisplay } from "@/lib/utils";
import { InterviewDetails, RequestRescheduleInterviewForm } from "@/type";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import CustomMultilineInput from "./CustomMultilineInput";
import ModalWithBg from "./ModalWithBg";

type Props = {
  interviewDetails: InterviewDetails;
  visible: boolean;
  handleClose: () => void;
};

const RescheduleModal = ({ interviewDetails, visible, handleClose }: Props) => {
  const [reasonForm, setReasonForm] = useState<RequestRescheduleInterviewForm>({
    startTime: "",
    timezone: { label: mapTimezoneValueToLabel(interviewDetails.timezone), value: interviewDetails.timezone },
    interviewDate: "",
    reason: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showTimeZonePicker, setShowTimeZonePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const deadline = new Date(date);
      deadline.setHours(0, 0, 0, 0);
      const formattedDateTime = deadline.toISOString().slice(0, 19);
      setReasonForm({ ...reasonForm, interviewDate: formattedDateTime });
    }
  };

  const handleStartTimeChange = (event: any, time?: Date) => {
    setShowStartTimePicker(false);
    if (time) {
      setStartTime(time);
      const formattedTime = formatTimeForDisplay(time);
      setReasonForm({ ...reasonForm, startTime: formattedTime });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await requestRescheduleInterview({
        interviewId: interviewDetails.id,
        request: reasonForm,
      });
      if (res) {
        setSubmitSuccess(true);
      } else {
        Alert.alert("Error", "There was an error submitting your request. Please try again later.");
      }
    } catch (error) {
      Alert.alert("Error", "There was an error submitting your request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseWrapper = () => {
    handleClose();
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 500);
  };

  return (
    <ModalWithBg visible={visible} customHeight={0.65} customWidth={0.9}>
      {showTimeZonePicker ? (
        <View className="flex-1">
          <View className="px-4 py-3 border-b border-gray-200 bg-white flex-row items-center justify-between">
            <Text className="font-quicksand-semibold text-lg text-gray-900">Select Timezone</Text>
            <TouchableOpacity onPress={() => setShowTimeZonePicker(false)}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 bg-white">
            {COMMON_TIMEZONES.map((tz) => (
              <TouchableOpacity
                key={tz.value}
                className={`px-6 py-4 border-b border-gray-200 ${reasonForm.timezone?.value === tz.value ? "bg-emerald-100" : "bg-white"}`}
                onPress={() => {
                  setReasonForm({ ...reasonForm, timezone: tz });
                  setShowTimeZonePicker(false);
                }}
              >
                <Text className="font-quicksand-medium text-base text-gray-900">{tz.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1">
          <View className="px-4 py-3 border-b border-gray-200 bg-white flex-row items-center justify-between">
            <Text className="font-quicksand-bold text-lg text-gray-900">Reschedule Interview</Text>
            <TouchableOpacity onPress={handleCloseWrapper}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {submitSuccess ? (
            <View className="flex-1 items-center justify-center px-4">
              <Feather name="check-circle" size={64} color="#22c55e" />
              <Text className="font-quicksand-bold text-xl text-gray-900 mt-4">Request Submitted!</Text>
              <Text className="font-quicksand-medium text-base text-gray-700 text-center mt-2">
                Your request to reschedule the interview has been submitted successfully. We will notify you if your
                interview updates.
              </Text>
              <TouchableOpacity
                className="bg-emerald-500 rounded-md px-4 py-3 items-center justify-center mt-6 w-1/2"
                activeOpacity={0.8}
                onPress={handleCloseWrapper}
              >
                <Text className="font-quicksand-semibold text-white text-base">Thanks</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView className="p-4">
              <View className="mb-4">
                <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Requested Date</Text>
                <TouchableOpacity
                  className="form-input__input bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  onPress={() => {
                    setShowStartTimePicker(false);
                    setShowDatePicker(!showDatePicker);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-quicksand-medium text-sm ${
                      reasonForm.interviewDate ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {reasonForm.interviewDate
                      ? formatDateForDisplay(reasonForm.interviewDate)
                      : "Select interview date"}
                  </Text>
                  <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                    <Text className="text-emerald-600 font-quicksand-bold text-xs">📅</Text>
                  </View>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    textColor="#000000"
                  />
                )}
              </View>
              <View className="mb-4">
                <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Requested Start Time</Text>
                <TouchableOpacity
                  className="form-input__input bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  onPress={() => {
                    setShowStartTimePicker(!showStartTimePicker);
                    setShowDatePicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-quicksand-medium text-sm ${reasonForm.startTime ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {reasonForm.startTime ? formatTime(reasonForm.startTime) : "Start Time"}
                  </Text>
                  <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                    <Text className="text-emerald-600 font-quicksand-bold text-xs">⏰</Text>
                  </View>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleStartTimeChange}
                    textColor="#000000"
                  />
                )}
              </View>
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 bg-emerald-500 rounded-lg px-1 py-3"
                onPress={() => setShowTimeZonePicker(true)}
              >
                <Feather name="globe" size={16} color="white" />
                <Text className="font-quicksand-semibold text-white text-sm">
                  {reasonForm.timezone ? reasonForm.timezone.label : "Select Timezone"}
                </Text>
              </TouchableOpacity>
              <View className="bg-white mt-4">
                <CustomMultilineInput
                  label="Reason/Clarification *"
                  numberOfLines={4}
                  customLabelClass="font-quicksand-semibold text-sm text-gray-700"
                  placeholder="e.g. I would like to reschedule my interview to a later date due to unforeseen circumstances."
                  value={reasonForm.reason}
                  customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-sm text-gray-900 min-h-[100px]"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                  onChangeText={(text) => setReasonForm({ ...reasonForm, reason: text })}
                />
              </View>
              <View className="gap-2 mt-4 flex-row items-center justify-center">
                <TouchableOpacity
                  className="bg-emerald-500 rounded-md px-4 py-3 items-center justify-center w-1/2"
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="font-quicksand-semibold text-white text-base">Submit</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-500 rounded-md px-4 py-3 items-center justify-center w-1/2"
                  activeOpacity={0.8}
                  onPress={() => {}}
                >
                  <Text className="font-quicksand-semibold text-white text-base">Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      )}
    </ModalWithBg>
  );
};

export default RescheduleModal;
