import { getApplicationStatusLabel, getStatusColor } from "@/lib/utils";
import useUserStore from "@/store/user.store";
import { Job } from "@/type";
import React from "react";
import { Text, View } from "react-native";
import CompanyInformation from "./CompanyInformation";
import FavoriteJob from "./FavoriteJob";

const CompanyHeader = ({ job }: { job: Job }) => {
  const { getApplicationStatus } = useUserStore();
  const application = getApplicationStatus(job.id);

  const renderApplicationInfo = () => {
    if (application) {
      const applicationStatus = application.status;
      const statusColors = getStatusColor(getApplicationStatusLabel(applicationStatus || ""));
      return (
        <View className={`${statusColors.bg} ${statusColors.border} border rounded-lg px-2 py-1`}>
          <Text className={`font-quicksand-bold text-xs ${statusColors.text}`}>
            {getApplicationStatusLabel(applicationStatus || "")}
          </Text>
        </View>
      );
    }
  };

  return (
    <View className="flex-row items-start justify-between mb-3">
      <View className="flex-1 mr-3">
        <CompanyInformation companyName={job.businessName} companyLogoUrl={job.companyLogoUrl} jobTitle={job.title} />
      </View>
      {application ? renderApplicationInfo() : <FavoriteJob job={job} showText={false} />}
    </View>
  );
};

export default CompanyHeader;
