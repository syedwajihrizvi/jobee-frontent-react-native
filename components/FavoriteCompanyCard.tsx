import { Company } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  isFavorited: boolean;
  company: Company;
  onPress?: () => void;
  onFavoritePress?: () => void;
};

const FavoriteCompanyCard = ({ isFavorited, company, onPress, onFavoritePress }: Props) => {
  return (
    <TouchableOpacity
      className="bg-white border border-gray-200 rounded-2xl p-5 mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
              <FontAwesome5 name="building" size={18} color="#6b7280" />
            </View>

            <View className="flex-1">
              <Text className="font-quicksand-bold text-lg text-gray-900 leading-5">{company.name}</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 mt-1">{company.industry}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
          onPress={onFavoritePress}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="heart" size={16} color="#ef4444" solid={isFavorited} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="bg-gray-100 border border-gray-200 rounded-xl p-3 mt-3 items-center"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-2">
          <Feather name="eye" size={14} color="#6b7280" />
          <Text className="font-quicksand-semibold text-gray-700">View Jobs</Text>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default FavoriteCompanyCard;
