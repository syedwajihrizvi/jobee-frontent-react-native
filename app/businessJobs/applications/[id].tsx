import ApplicantCard from "@/components/ApplicantCard";
import BackBar from "@/components/BackBar";
import FilterStatus from "@/components/FilterStatus";
import SearchBar from "@/components/SearchBar";
import { useApplicantsForJob, useShortListedCandidatesForJob } from "@/lib/services/useJobs";
import useApplicantsForJobStore from "@/store/applicants.store";
import { ApplicantFilters } from "@/type";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  const { id, shortListed, initialFilter } = useLocalSearchParams();
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string | null>(
    (initialFilter as string) || null
  );
  const [filterCount, setFilterCount] = useState(0);
  const [filters, setFilters] = useState<ApplicantFilters>({
    locations: [],
    skills: [],
    educations: "Any",
    experiences: "Any",
  });
  const { applications: storeApplications, setApplications: setStoreApplications } = useApplicantsForJobStore();
  const { data: applicantsData, isLoading } = useApplicantsForJob(Number(id), filters);
  const { data: shortListedApplicants } = useShortListedCandidatesForJob(Number(id));
  const [applicants, setApplicants] = useState(applicantsData || []);
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<ApplicantFilters>({
    locations: [],
    skills: [],
    educations: "Any",
    experiences: "Any",
    hasVideoIntro: false,
    hasCoverLetter: false,
    applicationDateRange: undefined,
    search: "",
  });
  const skillInputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);
  const slideX = useSharedValue(panelWidth);
  const [isExpDropdownOpen, setIsExpDropdownOpen] = useState(false);
  const [isEduDropdownOpen, setIsEduDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setStoreApplications(applicantsData || []);
    }
  }, [applicantsData, isLoading, setStoreApplications]);

  useEffect(() => {
    if (!storeApplications || isLoading) return;

    let filteredApplicantsData = [...storeApplications];
    if (applicationStatusFilter) {
      if (applicationStatusFilter === "reviewed") {
        filteredApplicantsData = filteredApplicantsData.filter((app) => app.status !== "PENDING");
      } else if (applicationStatusFilter === "pending") {
        filteredApplicantsData = filteredApplicantsData.filter((app) => app.status === "PENDING");
      } else if (applicationStatusFilter === "interview_scheduled") {
        filteredApplicantsData = filteredApplicantsData.filter((app) => app.status === "INTERVIEW_SCHEDULED");
      } else if (applicationStatusFilter === "rejected") {
        filteredApplicantsData = filteredApplicantsData.filter((app) => app.status === "REJECTED");
      }
    }
    if (shortListed) {
      filteredApplicantsData = filteredApplicantsData.filter((app) => shortListedApplicants?.includes(app.id));
    }
    setApplicants(filteredApplicantsData);
  }, [setStoreApplications, storeApplications, applicationStatusFilter, isLoading, shortListed, shortListedApplicants]);

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
    setTempFilters({
      locations: [],
      skills: [],
      educations: "Any",
      experiences: "Any",
      applicationDateRange: undefined,
      hasCoverLetter: false,
      hasVideoIntro: false,
    });
    setFilters({
      locations: [],
      skills: [],
      educations: "Any",
      experiences: "Any",
      applicationDateRange: undefined,
      hasCoverLetter: false,
      hasVideoIntro: false,
    });
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

  const setApplicationDateRange = (range: number | undefined) => {
    setTempFilters({ ...tempFilters, applicationDateRange: range });
    if (!range) {
      setTempFilterCount((prev) => prev - 1);
    } else {
      setTempFilterCount((prev) => prev + 1);
    }
  };

  const renderYesClass = (active: boolean) => {
    return active
      ? "bg-green-100 border border-green-500 px-3 py-1 rounded-xl items-center justify-center"
      : "bg-gray-100 border border-gray-300 px-3 py-1 rounded-xl items-center justify-center";
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

  const handleHasVideoIntroToggle = () => {
    const oldValue = tempFilters.hasVideoIntro;
    setTempFilters({ ...tempFilters, hasVideoIntro: !oldValue });
    setTempFilterCount((prev) => prev + (oldValue ? -1 : 1));
  };

  const handleHasCoverLetterToggle = () => {
    const oldValue = tempFilters.hasCoverLetter;
    setTempFilters({ ...tempFilters, hasCoverLetter: !oldValue });
    setTempFilterCount((prev) => prev + (oldValue ? -1 : 1));
  };

  if (shortListed && applicants?.length === 0) {
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
      <View className="justify-center items-center mb-1">
        <SearchBar
          placeholder="Search applicants by name, city, or country"
          onSubmit={(text: string) => setFilters({ ...filters, search: text })}
        />
      </View>
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
            <Text className="font-quicksand-bold text-2xl text-gray-900">{applicants?.length || 0}</Text>
            <Text className="font-quicksand-medium text-base text-gray-600">
              {applicants?.length === 1 ? "Application" : "Applications"}
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
      <View className="flex flex-row flex-wrap gap-2 px-4 mb-2">
        <TouchableOpacity
          className={`px-4 py-2 rounded-full flex-row items-center gap-1 border ${
            applicationStatusFilter === null ? "bg-yellow-500 border-yellow-500" : "bg-yellow-50 border-yellow-200"
          }`}
          style={{
            shadowColor: applicationStatusFilter === null ? "#eab308" : "transparent",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: applicationStatusFilter === null ? 0.3 : 0,
            shadowRadius: 4,
            elevation: applicationStatusFilter === null ? 3 : 0,
          }}
          onPress={() => setApplicationStatusFilter(null)}
          activeOpacity={0.8}
        >
          <Text
            className={`font-quicksand-semibold text-sm ${
              applicationStatusFilter === null ? "text-white" : "text-yellow-800"
            }`}
          >
            All
          </Text>
          {applicationStatusFilter === null && (
            <View className="w-5 h-5 bg-yellow-400 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-full flex-row items-center gap-1 border ${
            applicationStatusFilter === "reviewed" ? "bg-green-500 border-green-500" : "bg-green-50 border-green-200"
          }`}
          style={{
            shadowColor: applicationStatusFilter === "reviewed" ? "#22c55e" : "transparent",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: applicationStatusFilter === "reviewed" ? 0.3 : 0,
            shadowRadius: 4,
            elevation: applicationStatusFilter === "reviewed" ? 3 : 0,
          }}
          onPress={() => setApplicationStatusFilter("reviewed")}
          activeOpacity={0.8}
        >
          <Text
            className={`font-quicksand-semibold text-sm ${
              applicationStatusFilter === "reviewed" ? "text-white" : "text-green-800"
            }`}
          >
            Reviewed
          </Text>
          {applicationStatusFilter === "reviewed" && (
            <View className="w-5 h-5 bg-green-400 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-full flex-row items-center gap-1 border ${
            applicationStatusFilter === "pending" ? "bg-orange-500 border-orange-500" : "bg-orange-50 border-orange-200"
          }`}
          style={{
            shadowColor: applicationStatusFilter === "pending" ? "#ef4444" : "transparent",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: applicationStatusFilter === "pending" ? 0.3 : 0,
            shadowRadius: 4,
            elevation: applicationStatusFilter === "pending" ? 3 : 0,
          }}
          onPress={() => setApplicationStatusFilter("pending")}
          activeOpacity={0.8}
        >
          <Text
            className={`font-quicksand-semibold text-sm ${
              applicationStatusFilter === "pending" ? "text-white" : "text-orange-800"
            }`}
          >
            Pending
          </Text>
          {applicationStatusFilter === "pending" && (
            <View className="w-5 h-5 bg-orange-400 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-full flex-row items-center gap-1 border ${
            applicationStatusFilter === "interview_scheduled"
              ? "bg-blue-500 border-blue-500"
              : "bg-blue-50 border-blue-200"
          }`}
          style={{
            shadowColor: applicationStatusFilter === "interview_scheduled" ? "#3b82f6" : "transparent",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: applicationStatusFilter === "interview_scheduled" ? 0.3 : 0,
            shadowRadius: 4,
            elevation: applicationStatusFilter === "interview_scheduled" ? 3 : 0,
          }}
          onPress={() => setApplicationStatusFilter("interview_scheduled")}
          activeOpacity={0.8}
        >
          <Text
            className={`font-quicksand-semibold text-sm ${
              applicationStatusFilter === "interview_scheduled" ? "text-white" : "text-blue-800"
            }`}
          >
            Interview Scheduled
          </Text>
          {applicationStatusFilter === "interview_scheduled" && (
            <View className="w-5 h-5 bg-blue-400 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-full flex-row items-center gap-1 border ${
            applicationStatusFilter === "rejected" ? "bg-red-500 border-red-500" : "bg-red-50 border-red-200"
          }`}
          style={{
            shadowColor: applicationStatusFilter === "rejected" ? "#3b82f6" : "transparent",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: applicationStatusFilter === "rejected" ? 0.3 : 0,
            shadowRadius: 4,
            elevation: applicationStatusFilter === "rejected" ? 3 : 0,
          }}
          onPress={() => setApplicationStatusFilter("rejected")}
          activeOpacity={0.8}
        >
          <Text
            className={`font-quicksand-semibold text-sm ${
              applicationStatusFilter === "rejected" ? "text-white" : "text-red-800"
            }`}
          >
            Rejected
          </Text>
          {applicationStatusFilter === "rejected" && (
            <View className="w-5 h-5 bg-red-400 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>
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
            data={applicants}
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
              <View className="mb-3">
                <Text className="font-quicksand-medium text-md text-gray-900">Location</Text>
                <TextInput
                  ref={locationInputRef}
                  autoCapitalize="words"
                  className="border border-black rounded-lg p-3 mt-2"
                  placeholder="e.g. New York, San Francisco"
                  returnKeyType="done"
                  onSubmitEditing={(event) => addLocation(event.nativeEvent.text.trim())}
                />
                <View className="flex-row flex-wrap gap-2 mt-2">
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
              <View className="mb-3">
                <Text className="font-quicksand-medium text-md text-gray-900">Skills</Text>
                <TextInput
                  ref={skillInputRef}
                  className="border border-black rounded-lg p-3 mt-2"
                  placeholder="e.g. JavaScript, Python"
                  returnKeyType="done"
                  onSubmitEditing={(event) => addSkill(event.nativeEvent.text.trim())}
                />
                <View className="flex-row flex-wrap gap-2 mt-2">
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
              <View className="mb-3">
                <Text className="form-input__label mb-2">Has Video Introduction</Text>
                <TouchableOpacity
                  onPress={handleHasVideoIntroToggle}
                  className={renderYesClass(tempFilters.hasVideoIntro || false)}
                >
                  <Text className="text-green-800 font-quicksand text-sm">Yes</Text>
                </TouchableOpacity>
              </View>
              <View className="mb-3">
                <Text className="form-input__label mb-2">Has Cover Letter</Text>
                <TouchableOpacity
                  onPress={handleHasCoverLetterToggle}
                  className={renderYesClass(tempFilters.hasCoverLetter || false)}
                >
                  <Text className="text-green-800 font-quicksand text-sm">Yes</Text>
                </TouchableOpacity>
              </View>
              <View className="mb-3">
                <Text className="form-input__label">Applied Within</Text>
                <View className="flex-row flex-wrap gap-4 mt-2">
                  <TouchableOpacity
                    className={renderYesClass(!tempFilters.applicationDateRange)}
                    onPress={() => setApplicationDateRange(undefined)}
                  >
                    <Text>Any</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={renderYesClass(tempFilters.applicationDateRange === 1)}
                    onPress={() => setApplicationDateRange(1)}
                  >
                    <Text>24 Hours</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={renderYesClass(tempFilters.applicationDateRange === 3)}
                    onPress={() => setApplicationDateRange(3)}
                  >
                    <Text>3 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={renderYesClass(tempFilters.applicationDateRange === 7)}
                    onPress={() => setApplicationDateRange(7)}
                  >
                    <Text>7 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={renderYesClass(tempFilters.applicationDateRange === 14)}
                    onPress={() => setApplicationDateRange(14)}
                  >
                    <Text>14 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={renderYesClass(tempFilters.applicationDateRange === 30)}
                    onPress={() => setApplicationDateRange(30)}
                  >
                    <Text>30 Days</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="mb-3">
                <Text className="form-input__label mb-3">Experience Level</Text>
                <DropDownPicker
                  open={isExpDropdownOpen}
                  value={tempFilters.experiences}
                  items={[
                    { label: "Any", value: "Any" },
                    { label: "Intern", value: "Intern" },
                    { label: "Junior", value: "Junior" },
                    { label: "Mid", value: "Mid" },
                    { label: "Senior", value: "Senior" },
                    { label: "Lead", value: "Lead" },
                  ]}
                  setOpen={setIsExpDropdownOpen}
                  setValue={(callback) => {
                    const value = typeof callback === "function" ? callback(tempFilters.experiences) : callback;
                    if (value !== "Any") setTempFilterCount((prev) => prev + 1);
                    else setTempFilterCount((prev) => prev - 1);
                    setTempFilters({ ...tempFilters, experiences: value });
                  }}
                  style={{
                    backgroundColor: "#f9fafb",
                    borderColor: "#e5e7eb",
                    borderRadius: 10,
                    minHeight: 35,
                  }}
                  textStyle={{
                    fontSize: 14,
                    fontFamily: "Quicksand-Medium",
                    color: "#111827",
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: "white",
                    borderColor: "#e5e7eb",
                    borderRadius: 12,
                  }}
                  labelStyle={{
                    fontSize: 14,
                    fontFamily: "Quicksand-Regular",
                    color: "#111827",
                  }}
                  listItemContainerStyle={{
                    paddingVertical: 8,
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  placeholder="Any"
                />
              </View>
              <View className="mb-8">
                <Text className="form-input__label mb-3">Education Level</Text>
                <DropDownPicker
                  open={isEduDropdownOpen}
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
                  setOpen={setIsEduDropdownOpen}
                  setValue={(callback) => {
                    const value = typeof callback === "function" ? callback(tempFilters.educations) : callback;
                    if (value !== "Any") setTempFilterCount((prev) => prev + 1);
                    else setTempFilterCount((prev) => prev - 1);
                    setTempFilters({ ...tempFilters, educations: value });
                  }}
                  style={{
                    backgroundColor: "#f9fafb",
                    borderColor: "#e5e7eb",
                    borderRadius: 10,
                    minHeight: 35,
                  }}
                  textStyle={{
                    fontSize: 14,
                    fontFamily: "Quicksand-Medium",
                    color: "#111827",
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: "white",
                    borderColor: "#e5e7eb",
                    borderRadius: 12,
                  }}
                  labelStyle={{
                    fontSize: 14,
                    fontFamily: "Quicksand-Regular",
                    color: "#111827",
                  }}
                  listItemContainerStyle={{
                    paddingVertical: 8,
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  placeholder="Any"
                />
              </View>
              <View className="flex-col justify-center items-center gap-2 mb-20 mt-2">
                <TouchableOpacity
                  className="apply-button px-6 py-3 w-full rounded-lg flex items-center justify-center"
                  onPress={() => {
                    applyFilters();
                    closeFilters();
                  }}
                >
                  <Text className="font-quicksand-semibold text-md">Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="apply-button px-6 py-3 w-full rounded-lg flex items-center justify-center"
                  onPress={clearFilters}
                >
                  <Text className="font-quicksand-semibold text-md">Clear</Text>
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
