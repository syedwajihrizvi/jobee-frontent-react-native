import { images } from "@/constants";
import React from "react";
import { Image, Text, View } from "react-native";

const CompanyInformation = ({ company }: { company: string }) => {
  return (
    <View className="flex-row items-center gap-2">
      <Image
        source={{ uri: images.companyLogo }}
        className="size-8"
        resizeMode="contain"
      />
      <Text className="font-quicksand-bold text-xl">{company}</Text>
    </View>
  );
};

export default CompanyInformation;
