import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";

const ExpandableText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= 100) {
    return <Text className="font-quicksand-regular text-sm text-gray-700">{text}</Text>;
  }

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
      <Text className="font-quicksand-regular text-sm text-gray-700">
        {expanded ? text : text.substring(0, 100)}
        {!expanded && "... "}
        <Text className="font-quicksand-semibold text-blue-600">{expanded ? " Show less" : "Read more"}</Text>
      </Text>
    </TouchableOpacity>
  );
};

export default ExpandableText;
