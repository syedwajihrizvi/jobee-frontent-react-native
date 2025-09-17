import { favoriteJob } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { AntDesign } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const FavoriteJob = ({ jobId }: { jobId: number }) => {
  const queryClient = useQueryClient();
  const { user: authUser, setUser, isAuthenticated } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const user = authUser as User | null;
  const isFavorite =
    isAuthenticated &&
    user &&
    user.favoriteJobs.some((fav) => fav.id === jobId);

  const handlePress = async () => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    try {
      const result = await favoriteJob(jobId);
      if (result && user) {
        let newFavoriteJobs = [];
        if (isFavorite) {
          newFavoriteJobs = [
            ...user.favoriteJobs.filter((fav) => fav.id !== jobId),
          ];
        } else {
          newFavoriteJobs = [...user.favoriteJobs, { id: jobId }];
        }
        const updatedUser = {
          ...user,
          favoriteJobs: newFavoriteJobs,
        };
        queryClient.invalidateQueries({ queryKey: ["jobs", "favorites"] });
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Error favoriting job:", error); // Revert to original state on error
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        className="p-2 rounded-full"
        activeOpacity={1}
      >
        <AntDesign
          name="star"
          size={28}
          color={isFavorite ? "gold" : "black"}
        />
      </TouchableOpacity>
      <Modal transparent animationType="fade" visible={showModal}>
        <View className="flex-1 bg-black/45 justify-center items-center">
          <View
            style={{
              width: 300,
              height: 200,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 10,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              gap: 10,
            }}
          >
            <Text className="font-quicksand-bold text-xl">
              Sign in to use feature
            </Text>
            <Text className="font-quicksand-medium text-center">
              You need to be signed in to favorite a job.
            </Text>
            <View className="flex flex-row items-center justify-center w-full gap-2">
              <TouchableOpacity
                className="apply-button w-1/2 items-center justify-center h-14"
                onPress={() => {
                  setShowModal(false);
                  router.push("/(auth)/sign-in");
                }}
              >
                <Text className="font-quicksand-semibold text-md">Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="apply-button w-1/2 items-center justify-center h-14"
                onPress={() => setShowModal(false)}
              >
                <Text className="font-quicksand-semibold text-md">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FavoriteJob;
