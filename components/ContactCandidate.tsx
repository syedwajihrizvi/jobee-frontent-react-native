import { images } from "@/constants";
import { createConversationBetweenUsers, fetchConversationBetweenUsers } from "@/lib/chat";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { User } from "@/type";
import { Feather } from "@expo/vector-icons";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React from "react";
import { Alert, Image, Linking, Text, TouchableOpacity, View } from "react-native";

type Props = {
  userProfile: User;
  customSMSBody?: string;
  customEmailSubject?: string;
};

const ContactCandidate = ({ userProfile, customSMSBody, customEmailSubject }: Props) => {
  const handleEmailApplicant = () => {
    console.log("Email Applicant @ ", userProfile?.email);
    let emailUrl = `mailto:${userProfile?.email}`;
    const query = [];
    query.push(`subject=${encodeURIComponent(customEmailSubject || "Subject")}`);
    if (query.length > 0) {
      emailUrl += `?${query.join("&")}`;
    }

    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert("Error", "Unable to open email client.");
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const handleCallApplicant = () => {
    console.log("Call Applicant @ ", userProfile?.phoneNumber);
    const phoneURL = `tel:${userProfile?.phoneNumber}`;
    Linking.canOpenURL(phoneURL)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneURL);
        } else {
          Alert.alert("Error", "Unable to open phone dialer. Please call candidate at " + userProfile?.phoneNumber);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const handleJobeeMsgApplicant = async () => {
    try {
      const res = await fetchConversationBetweenUsers(userProfile.id, "USER");
      if (res == null) {
        console.log("No existing conversation found. Creating a new one.");
        // Need to create a new conversation
        const conversationId = await createConversationBetweenUsers(userProfile.id, "USER");
        console.log("Created new conversation with ID:", conversationId);
        router.push(
          `/messages/${userProfile.id}?name=${userProfile.firstName}%20${userProfile.lastName}&role=USER&conversationId=${conversationId}`
        );
      }
      console.log("In-app messaging to Applicant ID:", userProfile?.id, "Conversation:", res);
    } catch {
    } finally {
      console.log("In-app messaging to Applicant ID:", userProfile?.id);
    }
  };

  const handleSMSApplicant = () => {
    console.log("Sending SMS to Applicant @ ", userProfile?.phoneNumber);
    const body = "?body=Hello " + encodeURIComponent(userProfile?.firstName || "") + `. ${customSMSBody}`;
    const smsURL = `sms:${userProfile?.phoneNumber}${body}`;
    Linking.canOpenURL(smsURL)
      .then((supported) => {
        if (supported) {
          Linking.openURL(smsURL);
        } else {
          Alert.alert("Error", "Unable to open SMS app. Please send a message to " + userProfile?.phoneNumber);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };
  return (
    <BottomSheetView>
      <View className="items-center py-2 border-b border-gray-100">
        <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
            <Image
              source={{
                uri: userProfile?.profileImageUrl
                  ? getS3ProfileImage(userProfile?.profileImageUrl)
                  : images.companyLogo,
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View>
            <Text className="font-quicksand-bold text-lg text-gray-900">
              Contact {userProfile?.firstName} {userProfile?.lastName}
            </Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">Choose your preferred contact method</Text>
          </View>
        </View>
      </View>
      <View className="flex-1 items-center justify-center gap-3 px-4 py-4">
        {userProfile?.email && (
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl p-3 flex-row items-center justify-center gap-3 w-2/3"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={handleEmailApplicant}
            activeOpacity={0.8}
          >
            <View className="w-8 h-8 bg-white bg-opacity-20 rounded-full items-center justify-center">
              <Feather name="mail" size={16} color="#10b981" />
            </View>
            <View>
              <Text className="font-quicksand-bold text-white text-sm">Email</Text>
              <Text className="font-quicksand-medium text-white text-xs opacity-90">Send a professional email</Text>
            </View>
          </TouchableOpacity>
        )}

        {userProfile?.phoneNumber && (
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl p-3 flex-row items-center justify-center gap-3 w-2/3"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={handleCallApplicant}
            activeOpacity={0.8}
          >
            <View className="w-8 h-8 bg-white bg-opacity-20 rounded-full items-center justify-center">
              <Feather name="phone" size={16} color="#10b981" />
            </View>
            <View>
              <Text className="font-quicksand-bold text-white text-sm">Call</Text>
              <Text className="font-quicksand-medium text-white text-xs opacity-90">Make a direct phone call</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="bg-emerald-500 rounded-xl p-3 flex-row items-center justify-center gap-3 w-2/3"
          style={{
            shadowColor: "#8b5cf6",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={handleJobeeMsgApplicant}
          activeOpacity={0.8}
        >
          <View className="w-8 h-8 bg-white bg-opacity-20 rounded-full items-center justify-center">
            <Feather name="message-circle" size={16} color="#10b981" />
          </View>
          <View>
            <Text className="font-quicksand-bold text-white text-sm">Send message</Text>
            <Text className="font-quicksand-medium text-white text-xs opacity-90">Send an in-app message</Text>
          </View>
        </TouchableOpacity>

        {userProfile?.phoneNumber && (
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl p-3 flex-row items-center justify-center gap-3 w-2/3"
            style={{
              shadowColor: "#f97316",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={handleSMSApplicant}
            activeOpacity={0.8}
          >
            <View className="w-8 h-8 bg-white bg-opacity-20 rounded-full items-center justify-center">
              <Feather name="smartphone" size={16} color="#10b981" />
            </View>
            <View>
              <Text className="font-quicksand-bold text-white text-sm">Send SMS</Text>
              <Text className="font-quicksand-medium text-white text-xs opacity-90">Send a text message</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </BottomSheetView>
  );
};

export default ContactCandidate;
