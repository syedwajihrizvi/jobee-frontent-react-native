import { sounds } from "@/constants";
import { quickApplyToJob } from "@/lib/jobEndpoints";
import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import useUserJobsStore from "@/store/userJobsStore";
import { Application, Job, User } from "@/type";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ModalWithBg from "./ModalWithBg";
import QuickApplyModal from "./QuickApplyModal";
import RenderCompanyLogo from "./RenderCompanyLogo";

type Props = {
  job: Job;
  size?: "small" | "large";
};

const QuickApply = ({ job, size = "small" }: Props) => {
  const { user: authUser } = useAuthStore();
  const user = authUser as User | null;
  const { addApplication, setLastApplication, lastApplication } = useUserStore();
  const { addAppliedJob } = useUserJobsStore();
  const [quickApplyLabel, setQuickApplyLabel] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    setShowQuickApplyModal(false);
    if (apply && job) {
      const res = await quickApplyToJob(job.id);
      console.log("Quick Apply Response: ", res?.job.id);
      if (res != null) {
        setLastApplication(res);
        addAppliedJob(job);
        player.seekTo(0);
        player.play();
        setShowSuccessModal(true);
      }
    }
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
      <ModalWithBg visible={showSuccessModal} customHeight={0.5} customWidth={0.8}>
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View className="w-16 h-16 bg-emerald-500 rounded-full items-center justify-center">
            <Feather name="check" size={28} color="white" />
          </View>

          <View className="items-center gap-1">
            <Text className="font-quicksand-bold text-lg text-gray-800">Applied Successfully!</Text>
            <Text className="font-quicksand-semibold text-sm text-gray-600 text-center">
              Applied to {job.title} at {job.businessName}. Check your dashboard for updates.
            </Text>
          </View>

          <RenderCompanyLogo logoUrl={job.companyLogoUrl} size={12} />

          <TouchableOpacity
            className="bg-emerald-500 py-3 px-6 rounded-xl mt-4 w-full items-center justify-center"
            onPress={() => {
              setShowSuccessModal(false);
              const newApplication = {
                id: lastApplication?.id,
                appliedAt: lastApplication?.appliedAt,
                job: lastApplication?.job,
                jobId: lastApplication?.job.id,
                status: lastApplication?.status,
              } as Application;
              addApplication(newApplication);
            }}
          >
            <Text className="font-quicksand-bold text-white text-base">Perfect Thanks!</Text>
          </TouchableOpacity>
        </View>
      </ModalWithBg>
    </>
  );
};

export default QuickApply;
