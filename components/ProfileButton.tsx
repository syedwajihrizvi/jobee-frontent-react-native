import React from "react";
import { Text, TouchableOpacity } from "react-native";

type Props = {
  color: string;
  buttonText: string;
  disabled?: boolean;
  fullWidth?: boolean;
  handlePress: () => void;
};

const ProfileButton = ({ color, buttonText, disabled = false, fullWidth = false, handlePress }: Props) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      className={`bg-${color} rounded-lg px-6 py-3 flex-row items-center justify-center${fullWidth ? " w-full" : ""}`}
      style={{
        shadowColor: "#22c55e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
      }}
      onPress={handlePress}
    >
      <Text className="text-white font-quicksand-bold text-md ml-2">{buttonText}</Text>
    </TouchableOpacity>
  );
};

export default ProfileButton;
