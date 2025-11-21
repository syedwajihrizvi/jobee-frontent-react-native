import { Feather } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
};
const ViewMore = ({ label, onClick, icon }: Props) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      className="flex-row gap-2 items-center bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 self-start"
      style={{
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={0.8}
    >
      <Text className="font-quicksand-semibold text-emerald-600 text-ms">{label}</Text>
      {icon ? icon : <Feather name="chevron-right" size={16} color="#10b981" />}
    </TouchableOpacity>
  );
};

export default ViewMore;
