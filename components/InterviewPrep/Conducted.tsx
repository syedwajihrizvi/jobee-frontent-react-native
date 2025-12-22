import { meetingPlatforms } from "@/constants";
import { convert11Or10DigitNumberToPhoneFormat } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import RenderMeetingPlatformIcon from "../RenderMeetingPlatformIcon";
import OnlineMeetingInfo from "./OnlineMeetingInfo";

const Conducted = ({ interviewDetails }: { interviewDetails: InterviewDetails | undefined }) => {
  const interviewType = interviewDetails?.interviewType || "";

  const renderInterviewFormatInformation = () => {
    switch (interviewType?.toLowerCase()) {
      case "phone":
        return (
          <View className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                <Feather name="phone" size={20} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-bold text-blue-800 text-base">Phone Interview</Text>
            </View>

            <View className="bg-white rounded-lg p-3 mb-3 border border-blue-100">
              <Text className="font-quicksand-medium text-blue-700 text-sm">Phone Number</Text>
              <Text className="font-quicksand-bold text-blue-900 text-base mt-1">
                {convert11Or10DigitNumberToPhoneFormat(interviewDetails?.phoneNumber) || "Will be provided"}
              </Text>
            </View>

            <View className="gap-2 mt-2">
              <Text className="font-quicksand-semibold text-blue-800 text-sm mb-1">💡 Preparation Tips</Text>
              <Text className="font-quicksand-medium text-blue-700 text-xs leading-5">
                • Find a quiet space with good reception
              </Text>
              <Text className="font-quicksand-medium text-blue-700 text-xs leading-5">
                • Have your resume and notes ready
              </Text>
              <Text className="font-quicksand-medium text-blue-700 text-xs leading-5">
                • Test your phone beforehand and ensure it is fully charged
              </Text>
            </View>
          </View>
        );
      case "online":
        return (
          <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            {interviewDetails?.interviewMeetingPlatform && (
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-2">
                  <RenderMeetingPlatformIcon
                    size={24}
                    active={false}
                    platformType={interviewDetails.interviewMeetingPlatform}
                    platformColor={
                      meetingPlatforms.find((p) => p.value === interviewDetails?.interviewMeetingPlatform)?.textColor ||
                      "#059669"
                    }
                  />
                  <Text className="font-quicksand-bold text-xl text-emerald-900">
                    {meetingPlatforms.find((p) => p.value === interviewDetails?.interviewMeetingPlatform)?.label}
                  </Text>
                </View>
              </View>
            )}
            <OnlineMeetingInfo interviewDetails={interviewDetails!} />
            <View className="mt-4 pt-4 border-t border-amber-200 gap-2">
              <Text className="font-quicksand-semibold text-amber-800 text-sm mb-1">💡 Preparation Tips</Text>
              <Text className="font-quicksand-medium text-amber-700 text-xs leading-5">
                • Ensure your device (computer, tablet, or smartphone) is fully charged and has a working camera and
                microphone. Do not use extravagent background filters in the video call.
              </Text>
              <Text className="font-quicksand-medium text-amber-700 text-xs leading-5">
                • Test your internet connection and device beforehand. We recommend using a wired connection if
                possible.
              </Text>
              <Text className="font-quicksand-medium text-amber-700 text-xs leading-5">
                • Choose a quiet, well-lit location free from distractions
              </Text>
              <Text className="font-quicksand-medium text-amber-700 text-xs leading-5">
                • Dress professionally and have your resume and notes ready
              </Text>
              <Text className="font-quicksand-medium text-amber-700 text-xs leading-5">
                • Familiarize yourself with the online meeting platform being used
              </Text>
              <Text className="font-quicksand-medium text-amber-700 text-xs leading-5">
                • Keep a glass of water nearby and remember to smile!
              </Text>
            </View>
          </View>
        );
      case "in_person":
        return (
          <View className="bg-emerald-50 rounded-xl p-5 border border-green-200">
            <View className="gap-3">
              {interviewDetails?.streetAddress && (
                <View className="flex-row gap-3">
                  <Feather name="map-pin" size={16} color="#22c55e" className="mt-1" />
                  <View className="flex-1">
                    <Text className="font-quicksand-semibold text-green-800 text-sm">Address</Text>
                    <Text className="font-quicksand-medium text-green-700 text-sm leading-5">
                      {interviewDetails.streetAddress}
                    </Text>
                  </View>
                </View>
              )}
              {interviewDetails?.buildingName && (
                <View className="flex-row gap-3">
                  <Feather name="home" size={16} color="#22c55e" className="mt-1" />
                  <View className="flex-1">
                    <Text className="font-quicksand-semibold text-green-800 text-sm">Building</Text>
                    <Text className="font-quicksand-medium text-green-700 text-sm leading-5">
                      {interviewDetails.buildingName}
                    </Text>
                  </View>
                </View>
              )}
              {interviewDetails?.contactInstructionsOnArrival && (
                <View className="flex-row gap-3 items-start">
                  <Feather name="info" size={16} color="#22c55e" className="mt-1" />
                  <View className="flex-1">
                    <Text className="font-quicksand-semibold text-green-800 text-sm">On Arrival</Text>
                    <Text className="font-quicksand-medium text-green-700 text-sm leading-5">
                      {interviewDetails.contactInstructionsOnArrival}
                    </Text>
                  </View>
                </View>
              )}

              {interviewDetails?.parkingInfo && (
                <View className="flex-row gap-3">
                  <Feather name="navigation" size={16} color="#22c55e" className="mt-1" />
                  <View className="flex-1">
                    <Text className="font-quicksand-semibold text-green-800 text-sm">Parking</Text>
                    <Text className="font-quicksand-medium text-green-700 text-sm leading-5">
                      {interviewDetails.parkingInfo}
                    </Text>
                  </View>
                </View>
              )}

              <View className="mt-2 pt-4 border-t border-green-200 gap-2">
                <Text className="font-quicksand-semibold text-green-800 text-sm mb-1">💡 Tips</Text>
                <Text className="font-quicksand-medium text-green-700 text-xs leading-5">
                  • Plan your route and parking in advance
                </Text>
                <Text className="font-quicksand-medium text-green-700 text-xs leading-5">
                  • Arrive 10-15 minutes early
                </Text>
                <Text className="font-quicksand-medium text-green-700 text-xs leading-5">
                  • Dress professionally and bring copies of your resume
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-8">
        <View
          className="w-14 h-14 bg-indigo-100 rounded-full items-center justify-center mb-4"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="settings" size={28} color="#6366f1" />
        </View>

        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-8 mb-2">Interview Format</Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          Understanding how your interview will be conducted is crucial for optimal preparation and performance.
        </Text>
      </View>
      <View
        className="bg-white rounded-2xl border border-gray-100 mb-8"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {renderInterviewFormatInformation()}
      </View>

      <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="alert-triangle" size={16} color="#f59e0b" />
          <Text className="font-quicksand-bold text-amber-800 text-sm">Important</Text>
        </View>
        <Text className="font-quicksand-medium text-amber-700 text-xs leading-4">
          The interview format can significantly impact your performance. Make sure you&apos;re well-prepared for the
          specific type of interview you&apos;ll be having.
        </Text>
      </View>
    </ScrollView>
  );
};

export default Conducted;
