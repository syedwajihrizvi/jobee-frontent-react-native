import ApplicantCard from "@/components/ApplicantCard";
import BackBar from "@/components/BackBar";
import FilterStatus from "@/components/FilterStatus";
import { useApplicantsForJob, useShortListedCandidatesForJob } from "@/lib/services/useJobs";
import { ApplicantFilters } from "@/type";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const panelWidth = screenWidth * 0.8;

const Applications = () => {
  const { id, shortListed } = useLocalSearchParams();
  console.log("Job ID:", id, "Shortlisted:", shortListed);
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [filterCount, setFilterCount] = useState(0);
  const [filters, setFilters] = useState<ApplicantFilters>({ locations: [], skills: [], educations: "Any" });
  const { data: applicants, isLoading } = useApplicantsForJob(Number(id), filters);
  const { data: shortListedApplicants } = useShortListedCandidatesForJob(Number(id));
  const applicantList = shortListed ? applicants?.filter((app) => shortListedApplicants?.includes(app.id)) : applicants;
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<ApplicantFilters>({ locations: [], skills: [], educations: "Any" });
  const skillInputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);
  const slideX = useSharedValue(panelWidth);
  const [open, setOpen] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideX.value }],
    };
  });

  const openFilters = () => {
    setIsOpen(true);
    slideX.value = withTiming(0, { duration: 300 });
  };

  const closeFilters = () => {
    slideX.value = withTiming(screenWidth, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setIsOpen)(false);
      }
    });
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setFilterCount(tempFilterCount);
  };

  const clearFilters = () => {
    setTempFilters({ locations: [], skills: [], educations: "Any" });
    setFilters({ locations: [], skills: [], educations: "Any" });
    setFilterCount(0);
    setTempFilterCount(0);
  };

  const addSkill = (skill: string) => {
    if (skill && !tempFilters.skills.includes(skill)) {
      setTempFilterCount((prev) => prev + 1);
      setTempFilters({
        ...tempFilters,
        skills: [...tempFilters.skills, skill],
      });
    }
    skillInputRef.current?.clear();
  };

  const addLocation = (location: string) => {
    if (location && !tempFilters.locations.includes(location)) {
      setTempFilterCount((prev) => prev + 1);
      setTempFilters({
        ...tempFilters,
        locations: [...tempFilters.locations, location],
      });
    }
    locationInputRef.current?.clear();
  };

  const removeSkill = (skillToRemove: string) => {
    setTempFilterCount((prev) => prev - 1);
    setTempFilters({
      ...tempFilters,
      skills: tempFilters.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const removeLocation = (locationToRemove: string) => {
    setTempFilterCount((prev) => prev - 1);
    setTempFilters({
      ...tempFilters,
      locations: tempFilters.locations.filter((location) => location !== locationToRemove),
    });
  };

  const isShortListed = (applicantId: number) => {
    return shortListedApplicants?.includes(applicantId);
  };

  if (shortListed && applicantList?.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <BackBar label="Shortlisted Applications" />
        <View className="flex-1 justify-center items-center p-6">
          <View
            className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#f59e0b",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="star" size={32} color="#f59e0b" />
          </View>
          <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">
            No Shortlisted Applications
          </Text>
          <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
            Shortlisted applications will appear here when you shortlist candidates for this job.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label={shortListed ? "Shortlisted Applications" : "All Applications"} />
      <View
        className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-gray-100 mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-quicksand-bold text-2xl text-gray-900">{applicantList?.length || 0}</Text>
            <Text className="font-quicksand-medium text-base text-gray-600">
              {applicantList?.length === 1 ? "Application" : "Applications"}
            </Text>
          </View>

          <TouchableOpacity
            className={`rounded-xl px-4 py-3 flex-row items-center gap-2 ${
              filterCount > 0 ? "bg-green-500" : "bg-gray-100 border border-gray-200"
            }`}
            style={{
              shadowColor: filterCount > 0 ? "#6366f1" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: filterCount > 0 ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={openFilters}
            activeOpacity={0.8}
          >
            <Feather name="filter" size={16} color={filterCount > 0 ? "white" : "#6b7280"} />
            <Text className={`font-quicksand-bold text-sm ${filterCount > 0 ? "text-white" : "text-gray-700"}`}>
              {filterCount > 0 ? `${filterCount} Filter${filterCount > 1 ? "s" : ""}` : "Filters"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <FilterStatus
        filterCount={filterCount}
        filters={filters as ApplicantFilters}
        openFilters={openFilters}
        handleClearFilters={clearFilters}
        filterType="applicant"
      />
      <View className="flex-1 mt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <View
              className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4"
              style={{
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
            <Text className="font-quicksand-semibold text-lg text-gray-700">Loading applications...</Text>
          </View>
        ) : (
          <FlatList
            data={applicantList}
            renderItem={({ item }) => (
              <ApplicantCard item={item} isShortListed={!!(item.id && isShortListed(item.id))} />
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center p-6">
                <View
                  className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
                  style={{
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Feather name="users" size={32} color="#3b82f6" />
                </View>
                <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">No Applications Yet</Text>
                <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
                  Applications will appear here when candidates apply for this job.
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>
      {!isOpen && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl py-4 items-center justify-center"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={() => console.log("Find Applicants")}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="search" size={18} color="white" />
              <Text className="font-quicksand-bold text-white text-base">Find More Applicants</Text>
              <MaterialIcons name="auto-awesome" size={18} color="#fbbf24" />
            </View>
          </TouchableOpacity>
        </View>
      )}
      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={closeFilters}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "100%",
                height: "200%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 9,
              }}
            />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                right: 0,
                width: panelWidth,
                height: "120%",
                backgroundColor: "white",
                zIndex: 100,
              },
              animatedStyle,
            ]}
          >
            <View className="px-6 py-20">
              <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-6">Filter Applicants</Text>
              <View className="mb-6">
                <Text className="font-quicksand-bold text-lg text-gray-900 mb-3">Location</Text>
                <TextInput
                  ref={locationInputRef}
                  className="border border-gray-300 rounded-xl p-4 mb-3"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                  placeholder="e.g. New York, San Francisco"
                  returnKeyType="done"
                  onSubmitEditing={(event) => addLocation(event.nativeEvent.text)}
                />
                <View className="flex-row flex-wrap gap-2">
                  {tempFilters.locations.map((location, index) => (
                    <TouchableOpacity key={index} onPress={() => removeLocation(location)} activeOpacity={0.7}>
                      <View className="bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl flex-row items-center gap-1">
                        <Text className="text-emerald-800 font-quicksand-medium text-sm">{location}</Text>
                        <Feather name="x" size={12} color="#059669" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="mb-6">
                <Text className="font-quicksand-bold text-lg text-gray-900 mb-3">Desired Skills</Text>
                <TextInput
                  ref={skillInputRef}
                  className="border border-gray-300 rounded-xl p-4 mb-3"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                  placeholder="e.g. Python, React, SQL"
                  returnKeyType="done"
                  onSubmitEditing={(event) => {
                    addSkill(event.nativeEvent.text);
                  }}
                />
                <View className="flex-row flex-wrap gap-2">
                  {tempFilters.skills.map((skill, index) => (
                    <TouchableOpacity key={index} onPress={() => removeSkill(skill)} activeOpacity={0.7}>
                      <View className="bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl flex-row items-center gap-1">
                        <Text className="text-blue-800 font-quicksand-medium text-sm">{skill}</Text>
                        <Feather name="x" size={12} color="#2563eb" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="mb-8">
                <Text className="font-quicksand-bold text-lg text-gray-900 mb-3">Education Level</Text>
                <DropDownPicker
                  open={open}
                  value={tempFilters.educations}
                  items={[
                    { label: "Any", value: "Any" },
                    { label: "High School", value: "High School" },
                    { label: "Diploma", value: "Diploma" },
                    { label: "Associates", value: "Associates" },
                    { label: "Undergraduate", value: "Undergraduate" },
                    { label: "Postgraduate", value: "Postgraduate" },
                    { label: "PHD", value: "PHD" },
                    { label: "Post Doctorate", value: "Post Doctorate" },
                  ]}
                  setOpen={setOpen}
                  setValue={(callback) => {
                    const value = typeof callback === "function" ? callback(tempFilters.educations) : callback;
                    if (value !== "Any") setTempFilterCount((prev) => prev + 1);
                    else setTempFilterCount((prev) => prev - 1);
                    setTempFilters({ ...tempFilters, educations: value });
                  }}
                  setItems={() => {}}
                  style={{
                    borderColor: "#d1d5db",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                  dropDownContainerStyle={{
                    borderColor: "#d1d5db",
                    borderRadius: 12,
                  }}
                  placeholder="Any"
                />
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-green-500 rounded-xl py-4 items-center justify-center"
                  style={{
                    shadowColor: "#6366f1",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={() => {
                    applyFilters();
                    closeFilters();
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="font-quicksand-bold text-white text-base">Apply Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={clearFilters}
                  activeOpacity={0.7}
                >
                  <Text className="font-quicksand-bold text-gray-700 text-base">Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Applications;
