import { CustomInputProps } from "@/type";
import React from "react";
import { ReturnKeyTypeOptions, Text, TextInput, View } from "react-native";

const CustomInput = ({
  placeholder,
  label,
  value,
  returnKeyType = "default",
  style,
  autoCapitalize = "none",
  multiline = false,
  customClass,
  onChangeText,
}: CustomInputProps) => {
  return (
    <View className="form-input">
      {label && <Text className="form-input__label">{label}</Text>}
      <TextInput
        placeholder={placeholder}
        autoCapitalize={autoCapitalize as "none" | "sentences" | "words" | "characters"}
        value={value}
        multiline={multiline}
        onChangeText={onChangeText}
        className={customClass ? customClass : "form-input__input"}
        blurOnSubmit={true}
        returnKeyType={returnKeyType as ReturnKeyTypeOptions}
        style={style}
      />
    </View>
  );
};

export default CustomInput;
