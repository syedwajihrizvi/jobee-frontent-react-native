import { Company } from "@/type";
import React from "react";
import { View } from "react-native";
import BoldLabeledText from "./BoldLabeledText";

const CompanyInfo = ({ company }: { company: Company }) => {
  return (
    <View className="p-4 bg-white flex-1 gap-2">
      <BoldLabeledText label="Location" value={company.location} />
      <BoldLabeledText label="Website" value={company.website} />
      <BoldLabeledText label="Founded" value={company.foundedYear} />
      <BoldLabeledText label="Employees" value={company.numEmployees} />
      <BoldLabeledText label="Industry" value={company.industry} />
    </View>
  );
};

export default CompanyInfo;
