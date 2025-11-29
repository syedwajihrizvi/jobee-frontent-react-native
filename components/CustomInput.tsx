import { CustomInputProps } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ReturnKeyTypeOptions, Text, TextInput, TouchableOpacity, View } from "react-native";

const CustomInput = ({
  placeholder,
  label,
  customLabelClass,
  value,
  returnKeyType = "default",
  secureField = false,
  keyboardType = "default",
  autoCapitalize = "none",
  fontSize = 14,
  multiline = false,
  autocorrect = true,
  fullWidth = false,
  customClass,
  onChangeText,
  onSubmitEditing,
}: CustomInputProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <View className={`relative form-input${fullWidth ? " w-full" : ""}`}>
      {label && <Text className={customLabelClass ? customLabelClass : "form-input__label"}>{label}</Text>}
      <TextInput
        secureTextEntry={secureField && !passwordVisible}
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
          fontSize,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      />
      {secureField && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 16,
            top: 40,
            zIndex: 1,
          }}
          onPressIn={() => {
            setPasswordVisible(!passwordVisible);
          }}
        >
          <Feather name="eye" size={20} color="gray" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomInput;
