import { emailInterviewPrepResources } from "@/lib/interviewEndpoints";
import { InterviewPreparation } from "@/type";
import { Entypo, Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from "react-native";

const ResourcesList = ({
  interviewPrep,
  interviewId,
}: {
  interviewPrep: InterviewPreparation;
  interviewId: number;
}) => {
  const [currIndex, setCurrIndex] = useState(0);
  const [isEmailingRequest, setIsEmailingRequest] = useState(false);
  const [emailResourcesSent, setEmailResourcesSent] = useState(false);
  const handleResourceClick = async (resource: { link: string }) => {
    const supported = await Linking.canOpenURL(resource.link);
    if (!supported) {
      Alert.alert(`Cannot open URL: ${resource.link}`);
    } else {
      await Linking.openURL(resource.link);
    }
  };

  const emailAllResources = async () => {
    setIsEmailingRequest(true);
    try {
      const res = await emailInterviewPrepResources(interviewId);
      if (res) {
        Alert.alert("Success", "Interview resources have been emailed to you. Please check your inbox.");
      }
    } catch (error) {
      Alert.alert("Error", "There was an error sending the email. Please try again later.");
    } finally {
      setIsEmailingRequest(false);
      setEmailResourcesSent(true);
    }
  };

  const getColor = (index: number) => {
    return getResourceColor(interviewPrep?.resources?.[index]?.type || "");
  };

  const getResourceColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "article":
        return { bg: "bg-blue-50", border: "border-blue-200", icon: "#3b82f6", accent: "bg-blue-500" };
      case "video":
        return { bg: "bg-red-50", border: "border-red-200", icon: "#ef4444", accent: "bg-red-500" };
      case "website":
        return { bg: "bg-emerald-50", border: "border-green-200", icon: "#22c55e", accent: "bg-emerald-500" };
      case "pdf":
        return { bg: "bg-orange-50", border: "border-orange-200", icon: "#f97316", accent: "bg-orange-500" };
      case "course":
        return { bg: "bg-purple-50", border: "border-purple-200", icon: "#8b5cf6", accent: "bg-purple-500" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", icon: "#6b7280", accent: "bg-gray-500" };
    }
  };

  return (
    <View className="w-full h-full px-3 py-4">
      <View className="items-center mb-4">
        <View
          className="w-14 h-14 bg-indigo-100 rounded-full items-center justify-center mb-2"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Feather name="book-open" size={28} color="#6366f1" />
        </View>
        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-7 mb-2">
          Curated Resources for You
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          Click on any resource below to open it. You can also email or share the entire collection.
        </Text>
      </View>
      <View
        className="bg-white rounded-xl p-4 border border-gray-100 mb-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-center gap-3">
          <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
            <Text className="font-quicksand-bold text-indigo-600 text-sm">{interviewPrep?.resources?.length || 0}</Text>
          </View>
          <Text className="font-quicksand-semibold text-gray-700 text-base">
            Resource{(interviewPrep?.resources?.length || 0) > 1 ? "s" : ""} Available
          </Text>
        </View>
      </View>
      <View className="gap-2 mb-3">
        <TouchableOpacity
          onPress={() => handleResourceClick(interviewPrep?.resources?.[currIndex] || { link: "" })}
          className={`bg-white rounded-2xl p-3 h-[190px] border ${getColor(currIndex).border}`}
          style={{
            shadowColor: getColor(currIndex).icon,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.7}
        >
          <View className="flex-row items-start gap-4 px-3 py-2">
            <View className="flex-1">
              <View className={`self-start px-3 py-1 ${getColor(currIndex).bg} rounded-full mb-1`}>
                <Text
                  className="font-quicksand-bold text-xs uppercase tracking-wide"
                  style={{ color: getColor(currIndex).icon }}
                >
                  {interviewPrep?.resources?.[currIndex]?.type}
                </Text>
              </View>
              <Text className="font-quicksand-bold text-gray-800 text-base leading-6 mb-2">
                {interviewPrep?.resources?.[currIndex]?.title}
              </Text>
              <Text className="font-quicksand-medium text-gray-600 text-sm leading-5 mb-2">
                {interviewPrep?.resources?.[currIndex]?.description}
              </Text>
              <View className="flex-row items-center gap-2">
                <View className={`w-2 h-2 ${getColor(currIndex).accent} rounded-full`} />
                <Text className="font-quicksand-semibold text-xs" style={{ color: getColor(currIndex).icon }}>
                  Tap to open
                </Text>
              </View>
            </View>
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
              <Feather name="external-link" size={14} color="#6b7280" />
            </View>
          </View>
        </TouchableOpacity>
        <Text className="text-center font-quicksand-semibold text-gray-600 mb-1">
          {currIndex + 1} of {interviewPrep?.resources?.length}
        </Text>
        <View className="flex-row items-center justify-center gap-4">
          <TouchableOpacity disabled={currIndex === 0} onPress={() => setCurrIndex((prev) => Math.max(prev - 1, 0))}>
            <Feather name="arrow-left-circle" size={24} color={currIndex === 0 ? "gray" : "black"} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={currIndex === (interviewPrep?.resources?.length || 1) - 1}
            onPress={() => setCurrIndex((prev) => Math.min(prev + 1, (interviewPrep?.resources?.length || 1) - 1))}
          >
            <Feather
              name="arrow-right-circle"
              size={24}
              color={currIndex === (interviewPrep?.resources?.length || 1) - 1 ? "gray" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="bg-blue-50 rounded-xl p-3 border border-blue-200 mb-3">
        <View className="flex-row items-center gap-2">
          <Feather name="info" size={14} color="#3b82f6" />
          <Text className="font-quicksand-medium text-blue-700 text-xs">
            Resources will open in your default browser or app
          </Text>
        </View>
      </View>
      <View className="gap-4">
        <View className="flex-row items-center justify-center gap-4">
          <TouchableOpacity
            className="bg-indigo-500 py-3 px-6 rounded-xl flex-row items-center justify-center gap-3 flex-1"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={emailAllResources}
            disabled={isEmailingRequest}
            activeOpacity={0.8}
          >
            {isEmailingRequest ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="font-quicksand-bold text-white text-sm">Sending Email</Text>
              </>
            ) : emailResourcesSent ? (
              <>
                <Entypo name="emoji-happy" size={18} color="white" />
                <Text className="font-quicksand-bold text-white text-sm">Email Sent</Text>
              </>
            ) : (
              <>
                <Feather name="mail" size={18} color="white" />
                <Text className="font-quicksand-bold text-white text-sm">Email Me All</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ResourcesList;
