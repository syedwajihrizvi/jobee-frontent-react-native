import { CustomInputProps } from "@/type";
import React from "react";
import { ReturnKeyTypeOptions, Text, TextInput, View } from "react-native";

const CustomInput = ({
  placeholder,
  label,
  value,
  returnKeyType = "default",
  keyboardType = "default",
  style,
  autoCapitalize = "none",
  multiline = false,
  autocorrect = true,
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
        keyboardType={keyboardType as "default" | "email-address" | "numeric" | "phone-pad"}
        multiline={multiline}
        autoCorrect={autocorrect}
        onChangeText={onChangeText}
        className={customClass ? customClass : "form-input__input"}
        returnKeyType={returnKeyType as ReturnKeyTypeOptions}
        style={{
          fontSize: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      />
    </View>
  );
};

export default CustomInput;
