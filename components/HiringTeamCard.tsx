import { HiringTeamMemberForm } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  teamMember: HiringTeamMemberForm;
  handleRemove: () => void;
};

const HiringTeamCard = ({ teamMember, handleRemove }: Props) => {
  const { firstName, lastName, email } = teamMember;
  return (
    <View
      className="bg-white rounded-xl border border-gray-200 p-4 mb-3"
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
          <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
            <Text className="font-quicksand-bold text-emerald-600 text-sm">
              {firstName.charAt(0)}
              {lastName.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-quicksand-bold text-base text-gray-900">
              {firstName} {lastName}
            </Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">{email}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
          onPress={handleRemove}
          activeOpacity={0.7}
        >
          <Feather name="x" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HiringTeamCard;
