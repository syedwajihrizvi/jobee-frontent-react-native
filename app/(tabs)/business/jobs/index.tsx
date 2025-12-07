import RenderBusinessJobs from "@/components/RenderBusinessJobs";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Jobs = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-20">
      <RenderBusinessJobs />
    </SafeAreaView>
  );
};

export default Jobs;
