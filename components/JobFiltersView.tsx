import { employmentTypes, experienceLevels, workArrangements } from "@/constants";
import { JobFilters } from "@/type";
import { Feather, FontAwesome5, Foundation } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Alert, Dimensions, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import RemovableBadge from "./RemovableBadge";
const screenWidth = Dimensions.get("window").width;

type Props = {
  slideX: SharedValue<number>;
  closeFilters: () => void;
  defaultFilters: JobFilters;
  tempFilterCount: number;
  setTempFilterCount: (count: number) => void;
  handleFilterApply: (filters: JobFilters) => void;
  handleClearFilters: () => void;
};

const JobFiltersView = ({
  closeFilters,
  defaultFilters,
  tempFilterCount,
  setTempFilterCount,
  handleFilterApply,
  handleClearFilters,
  slideX,
}: Props) => {
  const [tempFilters, setTempFilters] = useState<JobFilters>({
    ...defaultFilters,
  });
  const locationInputRef = useRef<TextInput>(null);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideX.value }],
    };
  });
  const addLocation = (location: string) => {
    if (location && !tempFilters.locations.includes(location)) {
      setTempFilterCount(tempFilterCount + 1);
      setTempFilters({
        ...tempFilters,
        locations: [...tempFilters.locations, location],
      });
    }
    locationInputRef.current?.clear();
  };

  const addCompany = (company: string) => {
    if (company && !tempFilters.companies?.includes(company)) {
      setTempFilterCount(tempFilterCount + 1);
      setTempFilters({
        ...tempFilters,
        companies: [...(tempFilters.companies || []), company],
      });
    }
    locationInputRef.current?.clear();
  };

  const addEmploymentType = (type: string) => {
    if (type && !tempFilters.employmentTypes?.includes(type)) {
      setTempFilterCount(tempFilterCount + 1);
      setTempFilters({
        ...tempFilters,
        employmentTypes: [...(tempFilters.employmentTypes || []), type],
      });
    } else if (type && tempFilters.employmentTypes?.includes(type)) {
      setTempFilterCount(tempFilterCount - 1);
      setTempFilters({
        ...tempFilters,
        employmentTypes: tempFilters.employmentTypes.filter((t) => t !== type),
      });
    }
  };

  const addWorkArrangement = (type: string) => {
    if (type && !tempFilters.workArrangements?.includes(type)) {
      setTempFilterCount(tempFilterCount + 1);
      setTempFilters({
        ...tempFilters,
        workArrangements: [...(tempFilters.workArrangements || []), type],
      });
    } else if (type && tempFilters.workArrangements?.includes(type)) {
      setTempFilterCount(tempFilterCount - 1);
      setTempFilters({
        ...tempFilters,
        workArrangements: tempFilters.workArrangements.filter((t) => t !== type),
      });
    }
  };

  const addExperienceLevel = (level: string) => {
    if (level && !tempFilters.experience?.includes(level)) {
      setTempFilterCount(tempFilterCount + 1);
      setTempFilters({
        ...tempFilters,
        experience: [...(tempFilters.experience || []), level],
      });
    } else if (level && tempFilters.experience?.includes(level)) {
      setTempFilterCount(tempFilterCount - 1);
      setTempFilters({
        ...tempFilters,
        experience: tempFilters.experience.filter((t) => t !== level),
      });
    }
  };
  const addTag = (tag: string) => {
    if (tag && !tempFilters.tags.includes(tag)) {
      setTempFilterCount(tempFilterCount + 1);
      setTempFilters({ ...tempFilters, tags: [...tempFilters.tags, tag] });
    }
    locationInputRef.current?.clear();
  };

  const handleMinSalary = (text: string) => {
    const salary = Number(text);
    if (isNaN(salary)) {
      Alert.alert("Invalid Input", "Please enter a valid number for salary.");
      return;
    }
    setTempFilterCount(tempFilterCount + 1);
    setTempFilters({ ...tempFilters, minSalary: salary });
  };

  const handleMaxSalary = (text: string) => {
    const salary = Number(text);
    if (isNaN(salary)) {
      Alert.alert("Invalid Input", "Please enter a valid number for salary.");
      return;
    }
    if (tempFilters.minSalary && salary < tempFilters.minSalary) {
      Alert.alert("Invalid Input", "Max salary cannot be less than min salary.");
      return;
    }
    setTempFilterCount(tempFilterCount + 1);
    setTempFilters({ ...tempFilters, maxSalary: salary });
  };
  return (
    <>
      <TouchableWithoutFeedback onPress={closeFilters}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "200%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9,
          }}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        className="animated-view"
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            width: screenWidth * 0.8,
            height: "120%",
            backgroundColor: "white",
            zIndex: 100,
          },
          animatedStyle,
        ]}
      >
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <Text className="font-quicksand-bold text-lg text-gray-900 text-center my-2">Filter Jobs</Text>
          <View>
            <Text className="font-quicksand-medium text-md text-gray-900">Location</Text>
            <View className="relative">
              <TextInput
                ref={locationInputRef}
                autoCapitalize="words"
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900 mt-2"
                placeholder="e.g. New York, San Francisco"
                returnKeyType="done"
                onSubmitEditing={(event) => addLocation(event.nativeEvent.text.trim())}
              />
              <View className="absolute right-3 top-5">
                <Feather name="map-pin" size={16} color="#22c55e" />
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {tempFilters.locations.map((location, index) => (
                <TouchableOpacity key={index}>
                  <View className="bg-emerald-100 px-3 py-1 rounded-full">
                    <Text className="text-green-800 font-quicksand-medium">{location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="divider" />
          {defaultFilters.companies !== undefined && (
            <>
              <View>
                <Text className="font-quicksand-medium text-md text-gray-900">Companies</Text>
                <View className="relative">
                  <TextInput
                    ref={locationInputRef}
                    className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900 mt-2"
                    placeholder="e.g. Google, Microsoft"
                    returnKeyType="done"
                    onSubmitEditing={(event) => addCompany(event.nativeEvent.text.trim())}
                  />
                  <View className="absolute right-3 top-5">
                    <FontAwesome5 name="building" size={18} color="#22c55e" />
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2 mt-3">
                  {tempFilters.companies?.map((company, index) => (
                    <RemovableBadge
                      key={index}
                      text={company}
                      handlePress={() => {
                        setTempFilterCount(tempFilterCount - 1);
                        setTempFilters({
                          ...tempFilters,
                          companies: tempFilters.companies?.filter((c) => c !== company) || [],
                        });
                      }}
                    />
                  ))}
                </View>
              </View>
              <View className="divider" />
            </>
          )}
          <View>
            <Text className="font-quicksand-medium text-md text-gray-900">Employment Type</Text>
            <View className="flex flex-row flex-wrap gap-2 mt-2">
              {employmentTypes.map((type) => (
                <TouchableOpacity
                  className={`${tempFilters.employmentTypes?.includes(type.value) ? "bg-emerald-500" : "bg-emerald-200"} px-3 py-1 rounded-full`}
                  onPress={() => addEmploymentType(type.value)}
                  activeOpacity={1}
                  key={type.value}
                >
                  <Text className="font-quicksand-medium text-green-800 text-sm">{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="divider" />
          <View>
            <Text className="font-quicksand-medium text-md text-gray-900">Work Arrangement</Text>
            <View className="flex flex-row flex-wrap gap-2 mt-2">
              {workArrangements.map((type) => (
                <TouchableOpacity
                  className={`${tempFilters.workArrangements?.includes(type.value) ? "bg-emerald-500" : "bg-emerald-200"} px-3 py-1 rounded-full`}
                  onPress={() => addWorkArrangement(type.value)}
                  activeOpacity={1}
                  key={type.value}
                >
                  <Text className="font-quicksand-medium text-green-800 text-sm">{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="divider" />
          <View>
            <Text className="font-quicksand-medium text-md text-gray-900">Experience Level</Text>
            <View className="flex flex-row flex-wrap gap-2 mt-2">
              {experienceLevels.map((type, index) => (
                <TouchableOpacity
                  className={`${tempFilters.experience?.includes(type.value) ? "bg-emerald-500" : "bg-emerald-200"} px-3 py-1 rounded-full`}
                  onPress={() => addExperienceLevel(type.value!)}
                  key={index}
                >
                  <Text className="font-quicksand-medium text-green-800 text-sm">{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="divider" />
          <View>
            <Text className="font-quicksand-medium text-md text-gray-900">Skills</Text>
            <View className="relative">
              <TextInput
                ref={locationInputRef}
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900 mt-2"
                placeholder="e.g. JavaScript, Python"
                returnKeyType="done"
                onSubmitEditing={(event) => addTag(event.nativeEvent.text.trim())}
              />
              <View className="absolute right-3 top-5">
                <FontAwesome5 name="wrench" size={16} color="#22c55e" />
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2 mt-3">
              {tempFilters.tags.map((tag, index) => (
                <RemovableBadge
                  key={index}
                  text={tag}
                  handlePress={() => {
                    setTempFilterCount(tempFilterCount - 1);
                    setTempFilters({
                      ...tempFilters,
                      tags: tempFilters.tags?.filter((t) => t !== tag) || [],
                    });
                  }}
                />
              ))}
            </View>
          </View>
          <View className="divider" />
          <View>
            <Text>Min Salary</Text>
            <View className="relative">
              <TextInput
                ref={locationInputRef}
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900 mt-2"
                returnKeyType="done"
                placeholder="e.g. 50000"
                onSubmitEditing={(event) => handleMinSalary(event.nativeEvent.text)}
              />
              <View className="absolute right-3 top-5">
                <Foundation name="dollar" size={20} color="#22c55e" />
              </View>
            </View>
          </View>
          <View className="divider" />
          <View>
            <Text>Max Salary</Text>
            <View className="relative">
              <TextInput
                ref={locationInputRef}
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900 mt-2"
                returnKeyType="done"
                placeholder="e.g. 150000"
                onSubmitEditing={(event) => handleMaxSalary(event.nativeEvent.text)}
              />
              <View className="absolute right-3 top-5">
                <Foundation name="dollar" size={20} color="#22c55e" />
              </View>
            </View>
          </View>
          <View className="flex-col justify-center items-center gap-2 mb-20 mt-2">
            <TouchableOpacity
              className="apply-button px-6 py-3 w-full rounded-lg flex items-center justify-center"
              onPress={() => handleFilterApply(tempFilters)}
            >
              <Text className="font-quicksand-semibold text-md">Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="apply-button px-6 py-3 w-full rounded-lg flex items-center justify-center"
              onPress={handleClearFilters}
            >
              <Text className="font-quicksand-semibold text-md">Clear</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </Animated.View>
    </>
  );
};

export default JobFiltersView;
