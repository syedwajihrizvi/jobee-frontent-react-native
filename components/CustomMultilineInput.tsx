import React from "react";
import { Keyboard, TextInput } from "react-native";

type Props = {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
};

const CustomMultilineInput = ({ value, placeholder, onChangeText }: Props) => {
  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === "Enter") {
      e.preventDefault();
      Keyboard.dismiss();
    }
  };

  const handleSubmitEditing = () => {
    console.log("Submitted:", value);
    Keyboard.dismiss();
  };

  const handleChangeText = (text: string) => {
    // If text ends with newline and previous text was empty,
    // it means user pressed Enter on empty field
    if (text === "\n" && value === "") {
      Keyboard.dismiss();
      return; // Don't update the text
    }

    console.log("Text changed:", text, text.length);
    onChangeText(text);
  };

  return (
    <TextInput
      multiline
      numberOfLines={8}
      placeholder={placeholder}
      value={value}
      onKeyPress={handleKeyPress}
      onSubmitEditing={handleSubmitEditing}
      onChangeText={handleChangeText}
      maxLength={500}
      textAlignVertical="top"
      returnKeyType="done"
      className="border border-gray-300 rounded-xl p-2 font-quicksand-medium text-gray-800 bg-white"
      style={{
        minHeight: 200,
        fontSize: 12,
        lineHeight: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      placeholderTextColor="#9ca3af"
    />
  );
};

export default CustomMultilineInput;
