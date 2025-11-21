import React from "react";
import Markdown from "react-native-markdown-display";

const markdownStyles = {
  body: {
    fontSize: 12,
    fontFamily: "Quicksand-Medium", // Add font family
  },
  strong: {
    fontSize: 12,
    fontWeight: "700" as const,
    fontFamily: "Quicksand-Bold", // Add bold font family
  },
  heading1: {
    fontFamily: "Quicksand-Bold",
    fontSize: 18,
  },
  heading2: {
    fontFamily: "Quicksand-Bold",
    fontSize: 16,
  },
  heading3: {
    fontFamily: "Quicksand-SemiBold",
    fontSize: 14,
  },
  paragraph: {
    fontFamily: "Quicksand-Medium",
    fontSize: 12,
    marginBottom: 8,
  },
  listItem: {
    fontFamily: "Quicksand-Medium",
    fontSize: 12,
  },
  em: {
    fontFamily: "Quicksand-Medium",
    fontStyle: "italic" as const,
  },
};

type Props = {
  text: string;
};

const RenderMarkdown = ({ text }: Props) => {
  return <Markdown style={markdownStyles}>{text}</Markdown>;
};

export default RenderMarkdown;
