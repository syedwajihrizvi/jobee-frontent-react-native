import BackBar from "@/components/BackBar";
import ProfileCard from "@/components/ProfileCard";
import { convert10DigitNumberToPhoneFormat } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const General = () => {
  const { user: authUser, isLoading } = useAuthStore();
  const user = authUser as User | null;
  return (
    <SafeAreaView>
      <BackBar label="General Information" />
      <ScrollView>
        <View className="px-6 py-6">
          <View
            className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">
              View and edit your general information
            </Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              Update your personal details such as name, email, phone number, and address to keep your profile current.
            </Text>
          </View>
        </View>
        <View className="py-3 px-6">
          {isLoading ? (
            <View className="flex flex-col items-center justify-center gap-4 mt-10">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-semibold text-lg">Fetching Profile Information...</Text>
            </View>
          ) : (
            <View className="flex flex-col gap-3">
              <ProfileCard label="First Name" subtitle={user?.firstName} handleEditPress={() => {}} />
              <ProfileCard label="Last Name" subtitle={user?.lastName} handleEditPress={() => {}} />
              <ProfileCard label="Title" subtitle={user?.title || "Not Provided"} handleEditPress={() => {}} />
              <ProfileCard label="Company" subtitle={user?.company || "Not Provided"} handleEditPress={() => {}} />
              <ProfileCard label="Email" subtitle={user?.email} handleEditPress={() => {}} />
              <ProfileCard
                label="Phone Number"
                subtitle={convert10DigitNumberToPhoneFormat(user?.phoneNumber) || "Not Provided"}
                handleEditPress={() => {}}
              />
              <ProfileCard label="Location" subtitle={user?.location || "Not Provided"} handleEditPress={() => {}} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default General;
