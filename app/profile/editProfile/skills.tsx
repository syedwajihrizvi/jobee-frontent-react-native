import BackBar from "@/components/BackBar";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { AntDesign, Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const Skills = () => {
  // TODO: Get skills from its own endpoint
  const { user: authUser, isLoading } = useAuthStore();
  const user = authUser as User | null;

  const getExperienceLevel = (years: number) => {
    if (years >= 5) return { label: "Expert", color: "green-600" };
    if (years >= 3) return { label: "Advanced", color: "green-500" };
    if (years >= 1) return { label: "Intermediate", color: "yellow-500" };
    return { label: "Beginner", color: "gray-400" };
  };

  const handleEditSkill = (skill: any) => {
    // Navigate to edit skill modal or screen
    console.log("Edit skill:", skill);
  };

  const handleAddSkill = () => {
    // Navigate to add skill modal or screen
    console.log("Add new skill");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Skills" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          <View
            className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">View and edit your skills</Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              These are automatically extracted from your resume, but you can add or remove skills to better reflect
              your expertise.
            </Text>
          </View>
        </View>

        <View className="px-6 pb-6">
          {isLoading ? (
            <View className="flex items-center justify-center py-12">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-medium text-gray-600 mt-4">Loading skills...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                className="bg-green-500 rounded-xl px-6 py-4 flex-row items-center justify-center mb-6"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                onPress={handleAddSkill}
              >
                <AntDesign name="plus" size={18} color="white" />
                <Text className="text-white font-quicksand-bold text-base ml-2">Add New Skill</Text>
              </TouchableOpacity>

              {user?.skills && user.skills.length > 0 ? (
                <View className="gap-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-quicksand-bold text-lg text-gray-800">Your Skills</Text>
                    <Text className="font-quicksand-medium text-gray-600 text-sm">
                      {user.skills.length} skill{user.skills.length !== 1 ? "s" : ""}
                    </Text>
                  </View>

                  <View className="flex flex-row flex-wrap gap-3">
                    {user.skills.map((userSkill, index) => {
                      const experienceLevel = getExperienceLevel(userSkill.experience);
                      return (
                        <TouchableOpacity
                          key={index}
                          className="bg-white border-2 border-gray-100 rounded-2xl p-4 min-w-[45%] flex-1"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 4,
                            elevation: 3,
                            maxWidth: "48%",
                          }}
                          onPress={() => handleEditSkill(userSkill)}
                        >
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="bg-green-100 px-2 py-1 rounded-full">
                              <Text className="font-quicksand-bold text-md text-green-700">{userSkill.skill.name}</Text>
                            </View>
                            <Feather name="edit-2" size={14} color="#6b7280" />
                          </View>
                          <View className="flex-row items-center gap-1 mb-3">
                            <Feather name="clock" size={12} color="#6b7280" />
                            <Text className="font-quicksand-medium text-gray-500 text-sm">
                              {userSkill.experience} {userSkill.experience === 1 ? "year" : "years"}
                            </Text>
                          </View>
                          <View>
                            <View className="flex-row justify-between items-center mb-1">
                              <Text className="font-quicksand-medium text-xs text-gray-500">Level</Text>
                              <Text className={`font-quicksand-bold text-xs text-${experienceLevel.color}`}>
                                {experienceLevel.label}
                              </Text>
                            </View>
                            <View className="w-full bg-gray-200 rounded-full h-2">
                              <View
                                className={`h-2 rounded-full bg-${experienceLevel.color}`}
                                style={{
                                  width: `${Math.min((userSkill.experience / 5) * 100, 100)}%`,
                                }}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Feather name="award" size={24} color="#9ca3af" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Skills Added Yet</Text>
                  <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">
                    Showcase your expertise by adding skills that highlight your professional abilities
                  </Text>
                  <TouchableOpacity className="bg-green-500 px-6 py-3 rounded-xl" onPress={handleAddSkill}>
                    <Text className="font-quicksand-semibold text-white text-sm">Add Your First Skill</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Skills;
