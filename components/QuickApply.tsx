import { sounds } from "@/constants";
import { quickApplyToJob } from "@/lib/jobEndpoints";
import { onActionSuccess } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import useUserJobsStore from "@/store/userJobsStore";
import { Application, Job, User } from "@/type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import QuickApplyModal from "./QuickApplyModal";

type Props = {
  job: Job;
  size?: "small" | "large";
};

const QuickApply = ({ job, size = "small" }: Props) => {
  const { user: authUser } = useAuthStore();
  const user = authUser as User | null;
  const { setApplications, applications, setLastApplication } = useUserStore();
  const { addAppliedJob } = useUserJobsStore();
  const [quickApplyLabel, setQuickApplyLabel] = useState("");
  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const player = useAudioPlayer(sounds.popSound);

  const handleQuickApply = () => {
    setQuickApplyLabel(`Quick Apply for ${job.title} at ${job.businessName}`);
    setShowQuickApplyModal(true);
  };

  const handleUnAuthenticatedQuickApply = () => {
    setShowQuickApplyModal(false);
    router.push("/(auth)/sign-in");
  };

  const handleQuickApplyClose = async (apply: boolean) => {
    if (apply && job) {
      const res = await quickApplyToJob(job.id);
      if (res != null) {
        const newApplication = {
          id: res.id,
          appliedAt: res.appliedAt,
          jobId: job.id,
          status: res.status,
        } as Application;
        setApplications([newApplication, ...applications]);
        setLastApplication(res);
        addAppliedJob(job);
        player.seekTo(0);
        player.play();
        await onActionSuccess();
      }
    }
    setShowQuickApplyModal(false);
  };

  return (
    <>
      {size === "small" && (
        <TouchableOpacity
          onPress={handleQuickApply}
          className="bg-emerald-500 px-4 py-2 rounded-lg"
          activeOpacity={0.8}
        >
          <Text className="font-quicksand-bold text-sm text-white">Quick Apply</Text>
        </TouchableOpacity>
      )}
      {size === "large" && (
        <TouchableOpacity
          className="bg-emerald-500 rounded-xl px-2 py-3 items-center justify-center flex-row gap-2 mb-2 w-1/2"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
          activeOpacity={0.8}
          onPress={handleQuickApply}
        >
          <Text className="font-quicksand-bold text-sm text-white">Quick Apply</Text>
          <MaterialCommunityIcons name="lightning-bolt" size={16} color="white" />
        </TouchableOpacity>
      )}
      <QuickApplyModal
        visible={showQuickApplyModal}
        label={quickApplyLabel}
        handleClose={handleQuickApplyClose}
        canQuickApply={!!user?.primaryResume}
        handleUnAuthenticatedQuickApply={handleUnAuthenticatedQuickApply}
      />
    </>
  );
};

export default QuickApply;
