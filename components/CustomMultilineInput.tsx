import React from "react";
import { Keyboard, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  label?: string;
  placeholder: string;
  numberOfLines?: number;
  customClass?: string;
  style?: object;
  onChangeText: (text: string) => void;
};

const CustomMultilineInput = ({
  value,
  label,
  placeholder,
  numberOfLines = 8,
  customClass,
  style,
  onChangeText,
}: Props) => {
  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === "Enter") {
      e.preventDefault();
      Keyboard.dismiss();
    }
  };

  const handleSubmitEditing = () => {
    onChangeText(value.trim());
    Keyboard.dismiss();
  };

  const handleChangeText = (text: string) => {
    // If text ends with newline and previous text was empty,
    // it means user pressed Enter on empty field
    if (text === "\n" && value === "") {
      Keyboard.dismiss();
      onChangeText(text.trim());
      return; // Don't update the text
    }

    console.log("Text changed:", text, text.length);
    onChangeText(text);
  };

  return (
    <View className="form-input">
      {label && <Text className="form-input__label">{label}</Text>}
      <TextInput
        multiline
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        value={value}
        onKeyPress={handleKeyPress}
        onSubmitEditing={handleSubmitEditing}
        onChangeText={handleChangeText}
        maxLength={500}
        textAlignVertical="top"
        returnKeyType="done"
        className={
          !customClass
            ? "border border-gray-300 rounded-xl p-2 font-quicksand-medium text-gray-800 bg-white"
            : customClass
        }
        style={
          !style
            ? {
                minHeight: 200,
                fontSize: 12,
                lineHeight: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }
            : { ...style }
        }
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
};

export default CustomMultilineInput;
