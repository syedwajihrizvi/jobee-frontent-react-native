import ApplicantCard from "@/components/ApplicantCard";
import BackBar from "@/components/BackBar";
import CandidateCard from "@/components/CandidateCard";
import CollapsibleSection from "@/components/CollapsibleSection";
import FilterStatus from "@/components/FilterStatus";
import ModalWithBg from "@/components/ModalWithBg";
import SearchBar from "@/components/SearchBar";
import { applicationStatusOptions, appliedWithinOptions } from "@/constants";
import { getApplicationFilterText } from "@/lib/utils";
import useApplicationStore from "@/store/applications.store";
import { ApplicantFilters, CandidateForJob } from "@/type";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
  const { id } = useLocalSearchParams();
  const {
    fetchApplicationsForJob,
    getApplicationsForJob,
    getPaginationForJobAndFilter,
    isLoadingApplicationStatesForJob,
    isLoadingCandidatesStatesForJob,
    hasValidApplicantCache,
    refreshApplicationsForJobAndFilter,
    getCandidatesForJob,
    refreshCandidatesForJob,
    hasValidCandidatesCache,
    refreshShortListedApplicationsForJob,
    getShortListedApplicationsForJob,
    hasValidShortListedCache,
    getApplicationsCountForJob,
  } = useApplicationStore();
  const [viewingStatusFilter, setViewingStatusFilter] = useState(false);
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [filterCount, setFilterCount] = useState(0);
  const [filters, setFilters] = useState<ApplicantFilters>({
    locations: [],
    skills: [],
    educations: "Any",
    experiences: "Any",
  });
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
  const [isExpDropdownOpen, setIsExpDropdownOpen] = useState(false);
  const [isEduDropdownOpen, setIsEduDropdownOpen] = useState(false);
  const [showFindCandidatesModal, setShowFindCandidatesModal] = useState(false);
  const skillInputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);
  const handleCandidateCardPress = (candidate: CandidateForJob) => {
    setShowFindCandidatesModal(false);
    router.push(`/businessJobs/candidates/${candidate.id}`);
  };

  const slideX = useSharedValue(panelWidth);

  useEffect(() => {
    if (id) {
      const jobId = Number(id);
      const cacheValid = hasValidShortListedCache(jobId);
      if (!cacheValid) {
        refreshShortListedApplicationsForJob(jobId);
      }
    }
  }, []);

  useEffect(() => {
    if (id) {
      const jobId = Number(id);
      const cacheValid = hasValidApplicantCache(jobId, filters);
      if (!cacheValid) {
        refreshApplicationsForJobAndFilter(jobId, filters);
      }
    }
  }, []);

  useEffect(() => {
    if (id) {
      const jobId = Number(id);
      const cacheValid = hasValidApplicantCache(jobId, filters);
      if (!cacheValid) {
        refreshApplicationsForJobAndFilter(jobId, filters);
      }
    }
  }, [filters]);

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setFilterCount(tempFilterCount);
  };

  const clearFilters = () => {
    setTempFilters({
      ...tempFilters,
      locations: [],
      skills: [],
      educations: "Any",
      experiences: "Any",
      applicationDateRange: undefined,
      hasCoverLetter: false,
      hasVideoIntro: false,
    });
    setFilters({
      ...filters,
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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideX.value }],
    };
  });

  const renderYesClass = (active: boolean) => {
    return active
      ? "bg-green-100 border border-green-500 px-3 py-1 rounded-xl items-center justify-center"
      : "bg-gray-100 border border-gray-300 px-3 py-1 rounded-xl items-center justify-center";
  };

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

  const removeSkill = (skillToRemove: string) => {
    setTempFilterCount((prev) => prev - 1);
    setTempFilters({
      ...tempFilters,
      skills: tempFilters.skills.filter((skill) => skill !== skillToRemove),
    });
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

  const removeLocation = (locationToRemove: string) => {
    setTempFilterCount((prev) => prev - 1);
    setTempFilters({
      ...tempFilters,
      locations: tempFilters.locations.filter((location) => location !== locationToRemove),
    });
  };

  const setApplicationDateRange = (range: number | undefined) => {
    setTempFilters({ ...tempFilters, applicationDateRange: range });
    if (!range) {
      setTempFilterCount((prev) => prev - 1);
    } else {
      setTempFilterCount((prev) => prev + 1);
    }
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

  const handleFindCandidates = async () => {
    setShowFindCandidatesModal(true);
    if (!hasValidCandidatesCache(Number(id))) {
      refreshCandidatesForJob(Number(id));
    }
  };

  const handleApplicationStatusFilterChange = (applicationFilter: string) => {
    if (applicationFilter === filters.applicationStatus) {
      setFilters({ ...filters, applicationStatus: undefined });
    } else {
      setFilters({ ...filters, applicationStatus: applicationFilter });
    }
  };

  const renderApplicationsCount = () => {
    const count = getApplicationsCountForJob(Number(id), filters);
    const text = getApplicationFilterText(filters.applicationStatus || "", count || 0);
    return (
      <View className="mx-4 mb-2">
        <View
          className="bg-white rounded-xl p-2 border border-emerald-200"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
              <Feather name="users" size={12} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-sm text-gray-900">{text}</Text>
              <Text className="font-quicksand-medium text-xs text-gray-600">
                {count === 0 ? "Start reviewing applications" : "Ready for review"}
              </Text>
            </View>
            <View className="bg-emerald-500 rounded-full px-3 py-1">
              <Text className="font-quicksand-bold text-white text-xs">{count || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Applications" />
      <View className="justify-center items-center mt-2">
        <SearchBar
          placeholder="Search applicants by name, city, or country"
          onSubmit={(text: string) => setFilters({ ...filters, search: text })}
        />
      </View>
      <View className="mx-4 my-2">
        <FilterStatus
          filterCount={filterCount}
          filters={filters as ApplicantFilters}
          openFilters={openFilters}
          handleClearFilters={clearFilters}
          filterType="applicant"
        />
      </View>
      <View className="mx-4 mb-2">
        <CollapsibleSection
          title="Application Status"
          boldness="bold"
          padding={2}
          titleSize="text-sm"
          icon={<Feather name="file-text" size={12} color="#6b7280" />}
          isOpen={viewingStatusFilter}
          onToggle={() => setViewingStatusFilter(!viewingStatusFilter)}
        >
          <View className="flex-row gap-2 flex-wrap">
            {applicationStatusOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                className="px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: filters.applicationStatus === option.value ? option.activeBgColor : option.bgColor,
                }}
                onPress={() => handleApplicationStatusFilterChange(option.value)}
              >
                <Text
                  className="font-quicksand-semibold text-xs"
                  style={{
                    color: filters.applicationStatus === option.value ? option.activeTextColor : option.textColor,
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </CollapsibleSection>
      </View>
      {renderApplicationsCount()}
      <View className="flex-1">
        <FlatList
          data={getApplicationsForJob(Number(id), filters)}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ApplicantCard
              jobId={Number(id)}
              item={item}
              isShortListed={getShortListedApplicationsForJob(Number(id))?.includes(item.id) ?? false}
            />
          )}
          onEndReached={() => {
            const pagination = getPaginationForJobAndFilter(Number(id), filters);
            if (pagination?.hasMore) {
              const nextPage = pagination.currentPage + 1;
              fetchApplicationsForJob(Number(id), filters, nextPage);
            }
          }}
          ListFooterComponent={() => {
            const loading = isLoadingApplicationStatesForJob(Number(id), filters);
            if (!loading) return null;
            return (
              <View className="py-4">
                <ActivityIndicator size="small" color="#0000ff" />
              </View>
            );
          }}
        />
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
            onPress={handleFindCandidates}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-2">
              {isLoadingCandidatesStatesForJob(Number(id)) ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name="search" size={18} color="white" />
                  <Text className="font-quicksand-bold text-white text-base">Find More Applicants</Text>
                  <MaterialIcons name="auto-awesome" size={18} color="#fbbf24" />
                </>
              )}
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
              <View className="mb-2">
                <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Location</Text>
                <View className="relative">
                  <TextInput
                    ref={locationInputRef}
                    autoCapitalize="words"
                    className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900"
                    style={{
                      fontSize: 14,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                    placeholder="e.g. New York, San Francisco"
                    placeholderTextColor="#9ca3af"
                    returnKeyType="done"
                    onSubmitEditing={(event) => addLocation(event.nativeEvent.text.trim())}
                  />
                  <View className="absolute right-3 top-3">
                    <Feather name="map-pin" size={16} color="#9ca3af" />
                  </View>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {tempFilters.locations.map((location, index) => (
                    <TouchableOpacity key={index} onPress={() => removeLocation(location)} activeOpacity={0.7}>
                      <View
                        className="bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-lg flex-row items-center gap-2"
                        style={{
                          shadowColor: "#10b981",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Text className="text-emerald-800 font-quicksand-semibold text-sm">{location}</Text>
                        <Feather name="x" size={12} color="#059669" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="mb-2">
                <Text className="font-quicksand-semibold text-base text-gray-900 mb-2">Skills</Text>
                <View className="relative">
                  <TextInput
                    ref={skillInputRef}
                    className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900"
                    style={{
                      fontSize: 14,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                    placeholder="e.g. JavaScript, Python, React"
                    placeholderTextColor="#9ca3af"
                    returnKeyType="done"
                    onSubmitEditing={(event) => addSkill(event.nativeEvent.text.trim())}
                  />
                  <View className="absolute right-3 top-3">
                    <FontAwesome5 name="wrench" size={16} color="#9ca3af" />
                  </View>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {tempFilters.skills.map((skill, index) => (
                    <TouchableOpacity key={index} onPress={() => removeSkill(skill)} activeOpacity={0.7}>
                      <View
                        className="bg-blue-100 border border-blue-300 px-3 py-2 rounded-lg flex-row items-center gap-2"
                        style={{
                          shadowColor: "#3b82f6",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Text className="text-blue-800 font-quicksand-semibold text-sm">{skill}</Text>
                        <Feather name="x" size={12} color="#2563eb" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="mb-2">
                <Text className="form-input__label mb-2">Has Video Introduction</Text>
                <TouchableOpacity
                  onPress={handleHasVideoIntroToggle}
                  className={renderYesClass(tempFilters.hasVideoIntro || false)}
                >
                  <Text className="text-green-800 font-quicksand text-sm">Yes</Text>
                </TouchableOpacity>
              </View>
              <View className="mb-2">
                <Text className="form-input__label mb-2">Has Cover Letter</Text>
                <TouchableOpacity
                  onPress={handleHasCoverLetterToggle}
                  className={renderYesClass(tempFilters.hasCoverLetter || false)}
                >
                  <Text className="text-green-800 font-quicksand text-sm">Yes</Text>
                </TouchableOpacity>
              </View>
              <View className="mb-2">
                <Text className="form-input__label">Applied Within</Text>
                <View className="flex-row flex-wrap gap-4 mt-2">
                  {appliedWithinOptions.map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      className={renderYesClass(tempFilters.applicationDateRange === option.value)}
                      onPress={() => setApplicationDateRange(option.value)}
                    >
                      <Text className="font-quicksand-semibold text-sm">{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="mb-2">
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
              <View className="mb-4">
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
      <ModalWithBg visible={showFindCandidatesModal} customHeight={0.8} customWidth={0.9}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">Candidates For Job</Text>
            <TouchableOpacity onPress={() => setShowFindCandidatesModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={getCandidatesForJob(Number(id)) || []}
            renderItem={({ item }) => (
              <CandidateCard item={item} handleCandidateCardPress={() => handleCandidateCardPress(item)} />
            )}
            ItemSeparatorComponent={() => <View className="h-2" />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
          />
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default Applications;
