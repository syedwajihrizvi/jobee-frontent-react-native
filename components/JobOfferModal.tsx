import { sounds } from "@/constants";
import { updateJobOfferStatus } from "@/lib/jobEndpoints";
import { useJobOffer } from "@/lib/services/useJobOffer";
import { onActionSuccess } from "@/lib/utils";
import useUserStore from "@/store/user.store";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ModalWithBg from "./ModalWithBg";
import RenderCompanyLogo from "./RenderCompanyLogo";

type Props = {
  visible: boolean;
  handleClose: () => void;
  applicationId: number;
  jobTitle: string;
  jobId: number;
  companyName: string;
  companyLogoUrl: string;
};

const JobOfferModal = ({
  visible,
  handleClose,
  applicationId,
  jobTitle,
  jobId,
  companyName,
  companyLogoUrl,
}: Props) => {
  const queryClient = useQueryClient();
  const { setApplicationStatus } = useUserStore();
  const { data: jobOffer, isLoading } = useJobOffer(Number(applicationId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState<{ offerAccepted: boolean; userAction: boolean }>({
    offerAccepted: false,
    userAction: false,
  });
  const player = useAudioPlayer(sounds.successSound);

  useEffect(() => {
    if (jobOffer && !isLoading) {
      setOfferAccepted({ offerAccepted: jobOffer.accepted, userAction: jobOffer.userAction });
    }
  }, [jobOffer, isLoading]);

  const handleOfferAction = async (accepted: boolean) => {
    Alert.alert(
      accepted ? "Accept Offer" : "Decline Offer",
      accepted
        ? "Are you sure you want to accept this unofficial job offer? This action cannot be undone."
        : "Are you sure you want to decline this unofficial job offer? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Proceed",
          onPress: async () => {
            setApplicationStatus(applicationId, accepted ? "OFFER_ACCEPTED" : "OFFER_REJECTED", jobId);
            setIsSubmitting(true);
            player.seekTo(0);
            player.play();
            await onActionSuccess();
            // Optimistic UI Update
            setOfferAccepted({ offerAccepted: accepted, userAction: true });
            try {
              const res = await updateJobOfferStatus(applicationId, accepted);
              if (res) {
                queryClient.invalidateQueries({ queryKey: ["jobOffer", applicationId] });
              }
            } catch (error) {
              setOfferAccepted({ offerAccepted: !accepted, userAction: false });
              Alert.alert("Error", "There was an error processing your request. Please try again.");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ModalWithBg visible={visible} customHeight={0.7} customWidth={0.9}>
      <View className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-6 py-4 bg-white border-b border-gray-100">
          <Text className="font-quicksand-bold text-lg text-gray-900">Unofficial Job Offer</Text>
          <TouchableOpacity onPress={handleClose} className="p-2 bg-gray-50 rounded-full">
            <Feather name="x" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <View className="bg-white px-6 py-3 border-b border-gray-100">
          <View className="items-center">
            <RenderCompanyLogo logoUrl={companyLogoUrl} size={10} />
          </View>
          <Text className="font-quicksand-semibold text-gray-600 text-center text-sm mb-0.5">{companyName}</Text>
          <Text className="font-quicksand-bold text-base text-gray-900 text-center mb-2">{jobTitle}</Text>
          <Text className="font-quicksand-medium text-sm text-center text-gray-600">
            An unofficial job offer has been extended to you! If you accept, the company will begin the hiring process.
          </Text>
        </View>
        <View className="flex-1 px-6 py-5">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : (
            <View className="flex-1 justify-between">
              {offerAccepted.userAction ? (
                offerAccepted.offerAccepted ? (
                  <View className="bg-white p-6 rounded-2xl shadow-sm items-center">
                    <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">
                      Congratulations!
                    </Text>
                    <Text className="font-quicksand-semibold text-emerald-600 text-center text-lg mb-4">
                      You have accepted the unofficial offer
                    </Text>
                    <Text className="font-quicksand text-gray-700 text-center text-base leading-6 mb-4">
                      We hope you enjoyed your experience with Jobee. From now on, the hiring process will be handled
                      directly by the hiring company.
                    </Text>
                    <Text className="font-quicksand-semibold text-gray-600 text-center">
                      Farewell and Good Luck! 🎉
                    </Text>
                  </View>
                ) : (
                  <View className="bg-white p-6 rounded-2xl shadow-sm items-center">
                    <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                      <MaterialCommunityIcons name="hand-wave" size={48} color="#6b7280" />
                    </View>
                    <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">Offer Declined</Text>
                    <Text className="font-quicksand-semibold text-gray-600 text-center text-lg mb-4">
                      You have declined the unofficial offer
                    </Text>
                    <Text className="font-quicksand text-gray-700 text-center text-base leading-6 mb-4">
                      You can continue exploring other job opportunities on Jobee. We wish you the best in your job
                      search!
                    </Text>
                    <Text className="font-quicksand-semibold text-gray-600 text-center">Good Luck! 💪</Text>
                  </View>
                )
              ) : (
                <>
                  <ScrollView className="bg-white p-4 rounded-2xl shadow-sm">
                    <Text className="font-quicksand-semibold text-emerald-600 text-sm mb-2">Message From Company</Text>
                    <Text className="font-quicksand text-gray-700 text-base leading-6">{jobOffer?.offerDetails}</Text>
                  </ScrollView>
                  <View className="mt-6">
                    <TouchableOpacity
                      className="bg-emerald-500 py-4 px-6 rounded-2xl mb-3"
                      style={{
                        shadowColor: "#10b981",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                      onPress={() => handleOfferAction(true)}
                      disabled={isSubmitting}
                      activeOpacity={0.85}
                    >
                      <Text className="font-quicksand-bold text-white text-center text-lg">Accept Offer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-white py-4 px-6 rounded-2xl border-2 border-gray-200"
                      onPress={() => handleOfferAction(false)}
                      disabled={isSubmitting}
                      activeOpacity={0.7}
                    >
                      <Text className="font-quicksand-bold text-gray-700 text-center text-lg">Decline</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </ModalWithBg>
  );
};

export default JobOfferModal;
