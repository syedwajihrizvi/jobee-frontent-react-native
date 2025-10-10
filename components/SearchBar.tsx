import { EvilIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
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
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <EvilIcons name="search" size={20} color="black" className="left-4 z-10" />
      <TextInput
        className="search-bar"
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => setValue(text)}
        ref={inputRef}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit(value)}
      />
      {value.length > 0 && (
        <TouchableOpacity
          className="absolute right-4"
          onPress={() => {
            setValue("");
            inputRef.current?.blur();
            onSubmit("");
          }}
        >
          <AntDesign name="close" size={18} color="red" />
        </TouchableOpacity>
      )}
    </View>
  );
};
export default SearchBar;
