import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RenderMarkdown from "./RenderMarkdown";

type Props = {
  text: string;
  length?: number;
};

const ExpandableText = ({ text, length = 100 }: Props) => {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= length) {
    return <RenderMarkdown text={text} />;
  }

  const truncatedText = text.substring(0, length);

  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
      <View>
        <RenderMarkdown text={expanded ? text : `${truncatedText}...`} />
        {!expanded && <Text className="font-quicksand-semibold text-blue-600 text-sm">... Read more</Text>}
        {expanded && <Text className="font-quicksand-semibold text-blue-600 text-sm">Show less</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default ExpandableText;
