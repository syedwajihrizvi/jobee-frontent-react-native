import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Pressable, TextInput, View } from "react-native";

type Props = {
  value: string;
  handleChangeText: (text: string) => void;
  onIconPress?: () => void;
  placeholder?: string;
};

const LinkInput = ({ value, handleChangeText, onIconPress, placeholder = "Paste public share link here." }: Props) => {
  return (
    <View className="flex-row items-center rounded-xl border border-gray-300 bg-white px-3">
      <TextInput
        className="flex-1 py-3 font-quicksand-regular"
        value={value}
        onChangeText={(text) => handleChangeText(text)}
        placeholder={placeholder}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
      />
      <Pressable hitSlop={8} onPress={onIconPress} className="pl-2 py-2">
        <AntDesign name="link" size={20} />
      </Pressable>
    </View>
  );
};

export default LinkInput;
