import { CustomInputProps } from "@/type";
import React from "react";
import { ReturnKeyTypeOptions, Text, TextInput, View } from "react-native";

const CustomOnSubmitInput = ({
  placeholder,
  label,
  returnKeyType = "default",
  keyboardType = "default",
  autoCapitalize = "none",
  multiline = false,
  autocorrect = true,
  customClass,
  onSubmitEditing = () => {},
}: CustomInputProps) => {
  return (
    <View className="form-input">
      {label && <Text className="form-input__label">{label}</Text>}
      <TextInput
        placeholder={placeholder}
        autoCapitalize={autoCapitalize as "none" | "sentences" | "words" | "characters"}
        keyboardType={keyboardType as "default" | "email-address" | "numeric" | "phone-pad"}
        multiline={multiline}
        autoCorrect={autocorrect}
        onSubmitEditing={(event) => onSubmitEditing(event.nativeEvent.text)}
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

export default CustomOnSubmitInput;
