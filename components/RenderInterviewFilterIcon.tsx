import { InterviewFilter } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";

type Props = {
  filter: InterviewFilter;
  color: string;
  size?: number;
};

const RenderInterviewFilterIcon = ({ filter, color, size = 12 }: Props) => {
  switch (filter) {
    case "PENDING":
      return <Feather name="clock" size={size} color={color} />;
    case "SCHEDULED":
      return <Feather name="calendar" size={size} color={color} />;
    case "COMPLETED":
      return <Feather name="check-circle" size={size} color={color} />;
    case "REJECTED":
      return <Feather name="x-circle" size={size} color={color} />;
    case "CANCELLED":
      return <Feather name="slash" size={size} color={color} />;
    default:
      return <Feather name="briefcase" size={size} color={color} />;
  }
};

export default RenderInterviewFilterIcon;
