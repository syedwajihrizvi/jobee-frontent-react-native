import { useRecommendedJobs } from "@/lib/services/useJobs";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const RecommendedJobsPreview = () => {
  const { data: recommendedJobs, isLoading: isLoadingRecommended } =
    useRecommendedJobs();
  const [open, setOpen] = useState(true);
  const height = useSharedValue(50);

  const toggleDropdown = () => {
    setOpen(!open);
    height.value = withTiming(open ? 0 : 50, { duration: 300 });
  };
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: "hidden",
  }));

  return (
    <View className="w-full px-4 mt-2 bg-gray-100 rounded-2xl py-2">
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex flex-row items-center justify-between"
        onPress={toggleDropdown}
      >
        <Text className="font-quicksand-bold text-md">
          Recommended {`(${recommendedJobs?.length})`}
        </Text>
        <Entypo
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="black"
        />
      </TouchableOpacity>
      <Animated.View style={animatedStyle}>
        {isLoadingRecommended ? (
          <ActivityIndicator color="green" />
        ) : recommendedJobs && recommendedJobs?.length > 0 ? (
          <View className="flex flex-row justify-between items-end">
            <View>
              {recommendedJobs
                ?.slice(0, Math.min(recommendedJobs.length, 3))
                ?.map((job, index) => (
                  <Pressable
                    key={index}
                    onPress={() => router.push(`/jobs/${job.id}`)}
                    className="flex flex-row items-center justify-between gap-1"
                  >
                    <Text className="font-quicksand-medium text-md">
                      {job.title}
                    </Text>
                    <Entypo name="chevron-right" size={16} color="black" />
                  </Pressable>
                ))}
            </View>
            <TouchableOpacity className="bg-green-500 rounded-full px-8 py-1">
              <Text className="font-quicksand">View All</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text className="font-quicksand text-sm">
            No recommended jobs at the moment. Please upload a resume to get
            recommendations.
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

export default RecommendedJobsPreview;
