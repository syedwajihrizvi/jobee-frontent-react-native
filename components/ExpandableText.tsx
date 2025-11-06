import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";

const ExpandableText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);

  const renderText = () => {
    if (text.length <= 100) {
      return text;
    }
    if (expanded) {
      return text;
    }
    return text.substring(0, 100) + "...";
  };

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
      <Text className="font-quicksand-regular text-sm">{renderText()}</Text>
    </TouchableOpacity>
  );
};

export default ExpandableText;
