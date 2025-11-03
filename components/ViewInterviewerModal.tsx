import { getS3BusinessProfileImage } from "@/lib/s3Urls";
import { InterviewerProfileSummary } from "@/type";
import { Entypo, Feather, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  interviewerDetails: InterviewerProfileSummary | null;
  loadingInterviewer?: boolean;
  handleClose: (value: boolean) => void;
};

const { height, width } = Dimensions.get("window");

const ViewInterviewerModal = ({ visible, handleClose, loadingInterviewer, interviewerDetails }: Props) => {
  const renderFirstName = () => {
    if (!interviewerDetails) return "Unknown Interviewer";
    return `${interviewerDetails.firstName} ${interviewerDetails.lastName}`;
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={() => handleClose(false)}>
      <View className="flex-1 bg-black/60 justify-end">
        <View
          style={{
            height: height * 0.85,
            width: width,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 15,
          }}
        >
          <View className="relative px-6 py-4 border-b border-gray-100">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <View className="flex-row justify-between items-center">
              <Text className="font-quicksand-bold text-xl text-gray-800">Interviewer Profile</Text>
              <TouchableOpacity onPress={() => handleClose(false)} className="p-2 bg-gray-100 rounded-full">
                <Entypo name="cross" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {loadingInterviewer ? (
              <View className="flex-1 justify-center items-center gap-6 px-8 py-16">
                <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                  <ActivityIndicator size="large" color="#22c55e" />
                </View>
                <Text className="font-quicksand-bold text-xl text-gray-800 text-center">Finding Your Interviewer</Text>
                <Text className="font-quicksand-regular text-base text-gray-500 text-center leading-6">
                  We&apos;re gathering the interviewer&apos;s profile information for you
                </Text>
              </View>
            ) : (
              <View className="px-6 py-6">
                <View className="items-center mb-8">
                  <View
                    className="relative mb-4"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    {interviewerDetails?.profileImageUrl ? (
                      <Image
                        source={{ uri: getS3BusinessProfileImage(interviewerDetails.profileImageUrl) }}
                        className="w-24 h-24 rounded-full" // Add explicit sizing and rounded
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center">
                        <Feather name="user" size={40} color="#6b7280" />
                      </View>
                    )}
                    {interviewerDetails?.verified && (
                      <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full items-center justify-center border-4 border-white">
                        <Entypo name="check" size={12} color="white" />
                      </View>
                    )}
                  </View>

                  <Text className="font-quicksand-bold text-2xl text-gray-800 mb-1">{renderFirstName()}</Text>
                  {interviewerDetails?.title && (
                    <Text className="font-quicksand-medium text-base text-blue-600 mb-2">
                      {interviewerDetails.title}
                    </Text>
                  )}
                </View>

                <View className="gap-4">
                  {interviewerDetails?.email && (
                    <View
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    >
                      <View className="flex-row items-center gap-3 mb-1">
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                          <Feather name="mail" size={16} color="#3b82f6" />
                        </View>
                        <Text className="font-quicksand-bold text-base text-gray-800">Contact</Text>
                      </View>
                      <Text className="font-quicksand-medium text-gray-600 ml-11">{interviewerDetails.email}</Text>
                    </View>
                  )}

                  {interviewerDetails?.verified ? (
                    <>
                      {interviewerDetails?.summary && (
                        <View
                          className="bg-blue-50 rounded-xl p-4 border border-blue-100"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                        >
                          <View className="flex-row items-center gap-3 mb-1">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                              <Feather name="user" size={16} color="#3b82f6" />
                            </View>
                            <Text className="font-quicksand-bold text-base text-gray-800">About</Text>
                          </View>
                          <Text className="font-quicksand-medium text-gray-700 leading-6 ml-11">
                            {interviewerDetails.summary}
                          </Text>
                        </View>
                      )}

                      <View
                        className="bg-white rounded-xl p-5 border border-gray-200"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.08,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        {interviewerDetails.socialLinks ? (
                          <>
                            <View className="flex-row items-center gap-3 mb-4">
                              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                                <Feather name="link" size={16} color="#8b5cf6" />
                              </View>
                              <Text className="font-quicksand-bold text-base text-gray-800">Connect</Text>
                            </View>

                            <View className="flex-row items-center justify-between px-2">
                              <TouchableOpacity
                                className="items-center gap-2 flex-1"
                                onPress={() => console.log("LinkedIn pressed")}
                              >
                                <View
                                  className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center"
                                  style={{
                                    shadowColor: "#0077b5",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    elevation: 2,
                                  }}
                                >
                                  <Entypo name="linkedin-with-circle" size={24} color="#0077b5" />
                                </View>
                                <Text className="font-quicksand-medium text-xs text-gray-600">LinkedIn</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                className="items-center gap-2 flex-1"
                                onPress={() => console.log("Twitter pressed")}
                              >
                                <View
                                  className="w-12 h-12 bg-sky-50 rounded-xl items-center justify-center"
                                  style={{
                                    shadowColor: "#1da1f2",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    elevation: 2,
                                  }}
                                >
                                  <FontAwesome6 name="square-x-twitter" size={24} color="#1da1f2" />
                                </View>
                                <Text className="font-quicksand-medium text-xs text-gray-600">Twitter</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                className="items-center gap-2 flex-1"
                                onPress={() => console.log("GitHub pressed")}
                              >
                                <View
                                  className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center"
                                  style={{
                                    shadowColor: "#24292e",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    elevation: 2,
                                  }}
                                >
                                  <FontAwesome5 name="github" size={24} color="#24292e" />
                                </View>
                                <Text className="font-quicksand-medium text-xs text-gray-600">GitHub</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                className="items-center gap-2 flex-1"
                                onPress={() => console.log("Website pressed")}
                              >
                                <View
                                  className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center"
                                  style={{
                                    shadowColor: "#22c55e",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 3,
                                    elevation: 2,
                                  }}
                                >
                                  <Feather name="globe" size={24} color="#22c55e" />
                                </View>
                                <Text className="font-quicksand-medium text-xs text-gray-600">Website</Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        ) : (
                          <Text className="font-quicksand-bold text-center">
                            Interviewer did not provide social links
                          </Text>
                        )}
                      </View>
                    </>
                  ) : (
                    <View className="items-center py-12">
                      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <Feather name="user-x" size={24} color="#9ca3af" />
                      </View>
                      <Text className="font-quicksand-semibold text-gray-500 text-center">
                        Limited profile information available
                      </Text>
                      <Text className="font-quicksand-regular text-sm text-gray-400 text-center mt-1">
                        The interviewer will provide more details during the interview
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          <View className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <TouchableOpacity
              onPress={() => handleClose(false)}
              className="bg-green-500 py-4 rounded-xl items-center"
              style={{
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="font-quicksand-bold text-white text-base">Got it, thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ViewInterviewerModal;
