import React from "react";
import { TouchableOpacity } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

const PulsatingButton = ({
  pulsating,
  children,
  handlePress,
  disabled = false,
}: {
  pulsating: boolean;
  children: React.ReactNode;
  handlePress: () => void;
  disabled?: boolean;
}) => {
  const borderOpacity = useSharedValue(0);

  if (pulsating) {
    borderOpacity.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
  } else {
    borderOpacity.value = withTiming(0, { duration: 200 });
  }

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: 3,
    borderColor: `rgba(59,130,246,${borderOpacity.value})`, // Tailwind blue-500 with fading
  }));

  return (
    <Animated.View
      style={[
        {
          borderRadius: 9999,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        className={`rounded-full shadow-md p-2 size-16 justify-center items-center ${
          disabled ? "bg-gray-400 dark:bg-gray-700 opacity-50" : "bg-emerald-500 dark:bg-[#1e1e1e]"
        }`}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default PulsatingButton;
