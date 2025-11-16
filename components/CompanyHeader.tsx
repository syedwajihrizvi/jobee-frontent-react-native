import { getApplicationStatus, getStatusColor } from "@/lib/utils";
import useUserStore from "@/store/user.store";
import { Job } from "@/type";
import React from "react";
import { Text, View } from "react-native";
import CompanyInformation from "./CompanyInformation";
import FavoriteJob from "./FavoriteJob";

const CompanyHeader = ({ job }: { job: Job }) => {
  const { hasUserAppliedToJob } = useUserStore();
  const application = hasUserAppliedToJob(job.id);
  const statusColors = getStatusColor(getApplicationStatus(application?.status || ""));

  return (
    <View className="flex-row items-start justify-between mb-3">
      <View className="flex-1 mr-3">
        <CompanyInformation companyName={job.businessName} companyLogoUrl={job.companyLogoUrl} jobTitle={job.title} />
      </View>
      {application ? (
        <View className={`${statusColors.bg} ${statusColors.border} border rounded-lg px-2 py-1`}>
          <Text className={`font-quicksand-bold text-xs ${statusColors.text}`}>
            {getApplicationStatus(application.status)}
          </Text>
        </View>
      ) : (
        <FavoriteJob job={job} />
      )}
    </View>
  );
};

export default CompanyHeader;
