import React from "react";
import { Dimensions, Text, View } from "react-native";

const screenWidth = Dimensions.get("window").width;

type Props = {
  showFilters: boolean;
  showApplicationStatusFilters: boolean;
};

const RenderJobs = () => {
  return (
    <View>
      <Text>RenderJobs</Text>
    </View>
  );
};

export default RenderJobs;
