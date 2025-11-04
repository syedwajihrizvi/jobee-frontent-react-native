import React from "react";
import { Text, View } from "react-native";
import RenderCompanyLogo from "./RenderCompanyLogo";

type Props = {
  companyName: string;
  companyLogoUrl: string;
};

const CompanyInformation = ({ companyName, companyLogoUrl }: Props) => {
  return (
    <View className="flex-row items-center gap-2">
      <RenderCompanyLogo logoUrl={companyLogoUrl} />
      <Text className="font-quicksand-bold text-xl">{companyName}</Text>
    </View>
  );
};

export default CompanyInformation;
