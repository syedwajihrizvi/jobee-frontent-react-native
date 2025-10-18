import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

type Props = {
  icon: React.ReactNode;
  color: string;
  label: string;
  loading?: boolean;
  shadowColor: string;
  handlePress: () => void;
};

const RenderAppStatusButton = ({ icon, color, shadowColor, loading = false, label, handlePress }: Props) => {
  return (
    <TouchableOpacity
      className={`bg-${color}-500 rounded-xl px-4 py-3 flex-row items-center gap-2`}
      style={{
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {icon}
          <Text className="font-quicksand-bold text-white text-sm">{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default RenderAppStatusButton;
