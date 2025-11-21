import { favoriteJob } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import useUserJobsStore from "@/store/userJobsStore";
import { Job, User } from "@/type";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const FavoriteJob = ({ job, showText = true }: { job: Job; showText?: boolean }) => {
  const { user: authUser, setUser, isAuthenticated, userType } = useAuthStore();
  const { addJobToFavorites, removeJobFromFavorites } = useUserJobsStore();
  const [showModal, setShowModal] = useState(false);
  const user = authUser as User | null;
  const isFavorite =
    isAuthenticated && user && userType !== "business" && user.favoriteJobs.some((fav) => fav.id === job.id);

  const handlePress = async () => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    try {
      const result = await favoriteJob(job.id);
      if (result && user) {
        let newFavoriteJobs = [];
        if (isFavorite) {
          newFavoriteJobs = [...user.favoriteJobs.filter((fav) => fav.id !== job.id)];
          removeJobFromFavorites(job.id);
        } else {
          newFavoriteJobs = [...user.favoriteJobs, { id: job.id }];
          addJobToFavorites(job);
        }
        const updatedUser = {
          ...user,
          favoriteJobs: newFavoriteJobs,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Error favoriting job:", error);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        className={`px-3 py-2 rounded-full items-center justify-center flex-row gap-2 border ${
          isFavorite ? "border-amber-300 bg-amber-50" : "border-gray-300 bg-white"
        }`}
        style={{
          shadowColor: isFavorite ? "#f59e0b" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFavorite ? 0.15 : 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
        activeOpacity={0.8}
      >
        {showText && (
          <Text className={`font-quicksand-semibold text-sm ${isFavorite ? "text-amber-700" : "text-gray-700"}`}>
            {isFavorite ? "Saved" : "Save"}
          </Text>
        )}
        <FontAwesome name={isFavorite ? "star" : "star-o"} size={16} color={isFavorite ? "#f59e0b" : "#6b7280"} />
      </TouchableOpacity>
      <Modal transparent animationType="fade" visible={showModal}>
        <View className="flex-1 bg-black/45 justify-center items-center">
          <View
            style={{
              width: 300,
              height: 300,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              gap: 10,
            }}
          >
            <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-4">
              <AntDesign name="star" size={28} color="#f59e0b" />
            </View>
            <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">Sign in to Favorite Jobs</Text>
            <Text className="font-quicksand-medium text-center text-gray-600 mb-6 px-2 leading-5">
              You need to be signed in to save jobs to your favorites and build your personalized job list.
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

export default FavoriteJob;
