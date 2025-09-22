import { Job } from "@/type";
import React from "react";
import { View } from "react-native";
import BoldLabeledText from "./BoldLabeledText";

const JobInfo = ({ job }: { job: Job }) => {
  return (
    <View className="p-4 bg-white flex-1 gap-2">
      <View className="mt-2 flex-col gap-2">
        <BoldLabeledText
          label="Experience"
          value={job?.experience.toLocaleString()!}
        />
        <BoldLabeledText label="Posted On" value="August 1st 2025" />
        <BoldLabeledText label="Apply By" value="August 31st 2025" />
      </View>
    </View>
  );
};

export default JobInfo;
