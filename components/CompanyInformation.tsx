import React from "react";
import { Text, View } from "react-native";
import RenderCompanyLogo from "./RenderCompanyLogo";

type Props = {
  companyName: string;
  companyLogoUrl: string;
  jobTitle?: string;
};

const CompanyInformation = ({ companyName, companyLogoUrl, jobTitle }: Props) => {
  if (jobTitle) {
    return (
      <View className="flex-row items-center gap-2 w-2/3">
        <RenderCompanyLogo logoUrl={companyLogoUrl} />
        <View>
          <Text className="font-quicksand-bold text-sm">{companyName}</Text>
          <Text className="font-quicksand-bold text-lg" numberOfLines={2} style={{ lineHeight: 20 }}>
            {jobTitle}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View className="flex-row items-center gap-2 w-2/3">
      <RenderCompanyLogo logoUrl={companyLogoUrl} />
      <Text className="font-quicksand-bold text-xl" numberOfLines={2}>
        {companyName}
      </Text>
    </View>
  );
};

export default CompanyInformation;
