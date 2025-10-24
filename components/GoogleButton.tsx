import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const GoogleButton = () => {
  return (
    <View className="flex-row gap-4 mb-4">
      <TouchableOpacity
        className="flex-1 bg-white border border-gray-200 rounded-xl py-3 items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-center gap-2">
          <MaterialCommunityIcons name="gmail" size={20} color="#EA4335" />
          <Text className="font-quicksand-semibold text-base text-gray-700">Google</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default GoogleButton;
