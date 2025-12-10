import { EvilIcons, Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

const SearchBar = ({ placeholder, onSubmit }: { placeholder: string; onSubmit: (text: string) => void }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  return (
    <View
      className="search-bar-container"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        borderRadius: 30,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <EvilIcons name="search" size={22} color="#6b7280" className="left-4 z-10" />
      <TextInput
        className="search-bar pl-2"
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => setValue(text)}
        ref={inputRef}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit(value)}
      />
      {value.length > 0 && (
        <TouchableOpacity
          className="absolute right-3"
          style={{
            width: 24,
            height: 24,
            backgroundColor: "#f3f4f6",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
          onPress={() => {
            setValue("");
            inputRef.current?.blur();
            onSubmit("");
          }}
          activeOpacity={0.7}
        >
          <Feather name="x" size={16} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
