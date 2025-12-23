import { HiringTeamMemberForm } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RenderBusinessProfileImage from "./RenderBusinessProfileImage";

type Props = {
  teamMember: HiringTeamMemberForm;
  profileImageUrl?: string;
  handleRemove: () => void;
};

const HiringTeamCard = ({ teamMember, profileImageUrl, handleRemove }: Props) => {
  const { firstName, lastName, email } = teamMember;
  return (
    <View
      className="bg-white rounded-xl border border-gray-200 p-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          {profileImageUrl ? (
            <RenderBusinessProfileImage profileImageUrl={profileImageUrl} />
          ) : (
            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
              <Text className="font-quicksand-bold text-emerald-600 text-sm">
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-quicksand-bold text-sm text-gray-900">
              {firstName} {lastName}
            </Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">{email}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-6 h-6 bg-red-100 rounded-full items-center justify-center"
          onPress={handleRemove}
          activeOpacity={0.7}
        >
          <Feather name="x" size={12} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HiringTeamCard;
