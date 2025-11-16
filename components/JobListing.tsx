import { Job } from "@/type";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import CompanyHeader from "./CompanyHeader";
import JobActions from "./JobActions";
import JobDetails from "./JobDetails";
import JobMetrics from "./JobMetrics";
import JobTags from "./JobTags";

const JobListing = ({
  job,
  matchScore,
  showViewDetails = true,
  showQuickApply = true,
  canQuickApply = true,
  handleQuickApply,
}: {
  job: Job;
  matchScore?: number;
  showViewDetails?: boolean;
  showQuickApply?: boolean;
  canQuickApply?: boolean;
  handleQuickApply?: () => void;
}) => {
  return (
    <View
      className="bg-white rounded-xl p-4 my-2 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/jobs/${job.id}`)}>
        <CompanyHeader job={job} />

        <JobMetrics job={job} />
        <JobDetails job={job} />
      </TouchableOpacity>

      {job.tags && job.tags.length > 0 && <JobTags tags={job.tags} />}

      <JobActions
        job={job}
        matchScore={matchScore}
        showViewDetails={showViewDetails}
        showQuickApply={showQuickApply}
        canQuickApply={canQuickApply}
        handleQuickApply={handleQuickApply}
      />
    </View>
  );
};

export default JobListing;
