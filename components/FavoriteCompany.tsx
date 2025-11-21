import { toggleFavoriteCompany } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import { Company } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
  company: Company;
};

const FavoriteCompany = ({ company }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const { profileSummary } = useProfileSummaryStore();
  const { isAuthenticated } = useAuthStore();
  const checkIfCompanyIsFavorited = (companyId: number) => {
    if (!profileSummary) return false;
    return profileSummary?.favoriteCompanies.some((company) => company.id === companyId);
  };
  const handleFavoriteCompany = async (company: Company) => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    try {
      const result = await toggleFavoriteCompany(Number(company.id));
      if (result) {
        const currFavorites = profileSummary?.favoriteCompanies || [];
        const index = currFavorites.findIndex((c) => c.id === Number(company.id));
        if (index > -1) {
          const newFavorites = currFavorites.filter((c) => c.id !== Number(company.id));
          useProfileSummaryStore.getState().setProfileSummary({
            ...profileSummary!,
            favoriteCompanies: newFavorites,
          });
        } else {
          useProfileSummaryStore.getState().setProfileSummary({
            ...profileSummary!,
            favoriteCompanies: [company, ...currFavorites],
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite company:", error);
    }
  };
  return (
    <>
      <TouchableOpacity
        className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
        onPress={() => handleFavoriteCompany(company!)}
        activeOpacity={0.7}
      >
        <FontAwesome5 name="heart" size={16} color="#ef4444" solid={checkIfCompanyIsFavorited(company?.id!)} />
      </TouchableOpacity>
      <Modal transparent animationType="fade" visible={showModal}>
        <View className="flex-1 bg-black/45 justify-center items-center">
          <View
            style={{
              width: 300,
              height: 280,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              gap: 10,
            }}
          >
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
              <FontAwesome5 name="heart" size={28} color="#ef4444" />
            </View>
            <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">Sign in to Favorite Companies</Text>
            <Text className="font-quicksand-medium text-center text-gray-600 mb-6 px-2 leading-5">
              You need to be signed in to follow companies and stay updated with their latest job postings.
            </Text>
            <View className="flex flex-row items-center justify-center w-full gap-3">
              <TouchableOpacity
                className="bg-emerald-500 w-1/2 items-center justify-center h-12 rounded-lg flex-row gap-2"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => {
                  setShowModal(false);
                  router.push("/(auth)/sign-in");
                }}
                activeOpacity={0.8}
              >
                <Feather name="log-in" size={16} color="white" />
                <Text className="font-quicksand-semibold text-white">Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-200 w-1/2 items-center justify-center h-12 rounded-lg flex-row gap-2"
                onPress={() => setShowModal(false)}
                activeOpacity={0.8}
              >
                <Feather name="x" size={16} color="#6b7280" />
                <Text className="font-quicksand-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FavoriteCompany;
