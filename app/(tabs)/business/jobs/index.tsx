import BusinessJobListings from "@/components/BusinessJobListings";
import SearchBar from "@/components/SearchBar";
import {
  employmentTypes,
  experienceLevels,
  images,
  workArrangements,
} from "@/constants";
import { useJobsByCompany } from "@/lib/services/useJobs";
import useAuthStore from "@/store/auth.store";
import { BusinessUser, JobFilters } from "@/type";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

const Jobs = () => {
  const defaultFilters: JobFilters = {
    search: "",
    locations: [],
    tags: [],
    minSalary: undefined,
    maxSalary: undefined,
    employmentTypes: [],
    workArrangements: [],
    experience: undefined,
  };

  const locationInputRef = useRef<TextInput>(null);
  const { user: businessUser } = useAuthStore();
  const user = businessUser as BusinessUser | null;
  const slideX = useSharedValue(screenWidth);
  const [filters, setFilters] = useState<JobFilters>({ ...defaultFilters });
  const [filterCount, setFilterCount] = useState(0);
  const [tempFilters, setTempFilters] = useState<JobFilters>({
    ...defaultFilters,
  });
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { data: jobs, isLoading } = useJobsByCompany(filters, user?.companyId);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideX.value }],
    };
  });

  const openFilters = () => {
    slideX.value = withTiming(0, { duration: 300 });
    setIsOpen(true);
  };

  const closeFilters = () => {
    slideX.value = withTiming(screenWidth, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setIsOpen)(false);
      }
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

  const handleSearchSubmit = (text: string) => {
    setFilters((prev) => ({ ...prev, search: text }));
    closeFilters();
  };

  const addTag = (tag: string) => {
    if (tag && !tempFilters.tags.includes(tag)) {
      setTempFilterCount((prev) => prev + 1);
      setTempFilters({ ...tempFilters, tags: [...tempFilters.tags, tag] });
    }
    locationInputRef.current?.clear();
  };

  const addEmploymentType = (type: string) => {
    if (type && !tempFilters.employmentTypes?.includes(type)) {
      setTempFilterCount((prev) => prev + 1);
      setTempFilters({
        ...tempFilters,
        employmentTypes: [...(tempFilters.employmentTypes || []), type],
      });
    } else if (type && tempFilters.employmentTypes?.includes(type)) {
      setTempFilterCount((prev) => prev - 1);
      setTempFilters({
        ...tempFilters,
        employmentTypes: tempFilters.employmentTypes.filter((t) => t !== type),
      });
    }
  };

  const addWorkArrangement = (type: string) => {
    if (type && !tempFilters.workArrangements?.includes(type)) {
      setTempFilterCount((prev) => prev + 1);
      setTempFilters({
        ...tempFilters,
        workArrangements: [...(tempFilters.workArrangements || []), type],
      });
    } else if (type && tempFilters.workArrangements?.includes(type)) {
      setTempFilterCount((prev) => prev - 1);
      setTempFilters({
        ...tempFilters,
        workArrangements: tempFilters.workArrangements.filter(
          (t) => t !== type
        ),
      });
    }
  };

  const addExperienceLevel = (level: string) => {
    if (level && tempFilters.experience !== level) {
      setTempFilterCount((prev) => prev + 1);
      setTempFilters({ ...tempFilters, experience: level });
    } else if (level && tempFilters.experience === level) {
      setTempFilterCount((prev) => prev - 1);
      setTempFilters({ ...tempFilters, experience: "" });
    }
  };

  const handleMinSalary = (text: string) => {
    const salary = Number(text);
    if (isNaN(salary)) {
      Alert.alert("Invalid Input", "Please enter a valid number for salary.");
      return;
    }
    setTempFilterCount((prev) => prev + 1);
    setTempFilters({ ...tempFilters, minSalary: salary });
  };

  const handleMaxSalary = (text: string) => {
    const salary = Number(text);
    if (isNaN(salary)) {
      Alert.alert("Invalid Input", "Please enter a valid number for salary.");
      return;
    }
    if (tempFilters.minSalary && salary < tempFilters.minSalary) {
      Alert.alert(
        "Invalid Input",
        "Max salary cannot be less than min salary."
      );
      return;
    }
    setTempFilterCount((prev) => prev + 1);
    setTempFilters({ ...tempFilters, maxSalary: salary });
  };

  const handleFilterApply = () => {
    setFilters(tempFilters);
    setFilterCount(tempFilterCount);
    closeFilters();
  };

  const handleClearFilters = () => {
    setTempFilterCount(0);
    setFilterCount(0);
    setTempFilters({ ...defaultFilters });
    setFilters({ ...defaultFilters });
    closeFilters();
  };

  return (
    <SafeAreaView>
      <StatusBar hidden={true} />
      <View className="w-full flex-row items-center justify-center px-2 gap-4">
        <SearchBar
          placeholder="Search for Jobs..."
          onSubmit={(text) => handleSearchSubmit(text)}
        />
        <TouchableOpacity className="relative" onPress={openFilters}>
          <Ionicons name="filter-circle-outline" size={30} color="black" />
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
            <Text className="text-white font-quicksand-bold">
              {filterCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center px-4 py-2">
        <Image
          source={{ uri: images.companyLogo }}
          className="size-8"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold p-4">
          {user?.companyName} Job Listings
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" className="mt-20" />
      ) : (
        <FlatList
          data={jobs}
          renderItem={({ item }) => <BusinessJobListings job={item} />}
          ItemSeparatorComponent={() => <View className="divider" />}
          contentContainerClassName="pb-60"
        />
      )}
      {isOpen && (
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
                height: "150%",
                backgroundColor: "white",
                zIndex: 100,
              },
              animatedStyle,
            ]}
          >
            <ScrollView className="px-4 pb-10">
              <Text className="font-quicksand-bold text-lg text-gray-900 text-center my-4">
                Filter Jobs
              </Text>
              <View>
                <Text className="font-quicksand-medium text-md text-gray-900">
                  Location
                </Text>
                <TextInput
                  ref={locationInputRef}
                  className="border border-black rounded-lg p-3 mt-2"
                  placeholder="e.g. New York, San Francisco"
                  returnKeyType="done"
                  onSubmitEditing={(event) =>
                    addLocation(event.nativeEvent.text.trim())
                  }
                />
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {tempFilters.locations.map((location, index) => (
                    <TouchableOpacity key={index}>
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-800 font-quicksand-medium">
                          {location}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="divider" />
              <View>
                <Text className="font-quicksand-medium text-md text-gray-900">
                  Employment Type
                </Text>
                <View className="flex flex-row flex-wrap gap-2 mt-2">
                  {employmentTypes.map((type) => (
                    <TouchableOpacity
                      className={`${tempFilters.employmentTypes?.includes(type.value) ? "bg-green-500" : "bg-green-200"} px-3 py-1 rounded-full`}
                      onPress={() => addEmploymentType(type.value)}
                      activeOpacity={1}
                      key={type.value}
                    >
                      <Text className="font-quicksand-medium text-green-800 text-sm">
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="divider" />
              <View>
                <Text className="font-quicksand-medium text-md text-gray-900">
                  Work Arrangement
                </Text>
                <View className="flex flex-row flex-wrap gap-2 mt-2">
                  {workArrangements.map((type) => (
                    <TouchableOpacity
                      className={`${tempFilters.workArrangements?.includes(type.value) ? "bg-green-500" : "bg-green-200"} px-3 py-1 rounded-full`}
                      onPress={() => addWorkArrangement(type.value)}
                      activeOpacity={1}
                      key={type.value}
                    >
                      <Text className="font-quicksand-medium text-green-800 text-sm">
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="divider" />
              <View>
                <Text className="font-quicksand-medium text-md text-gray-900">
                  Experience (Years)
                </Text>
                <View className="flex flex-row flex-wrap gap-2 mt-2">
                  {experienceLevels.map((type) => (
                    <TouchableOpacity
                      className={`${tempFilters.experience === type.value ? "bg-green-500" : "bg-green-200"} px-3 py-1 rounded-full`}
                      onPress={() => addExperienceLevel(type.value)}
                      activeOpacity={1}
                      key={type.value}
                    >
                      <Text className="font-quicksand-medium text-green-800 text-sm">
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="divider" />
              <View>
                <Text className="font-quicksand-medium text-md text-gray-900">
                  Skills
                </Text>
                <TextInput
                  ref={locationInputRef}
                  className="border border-black rounded-lg p-3 mt-2"
                  placeholder="e.g. JavaScript, Python"
                  returnKeyType="done"
                  onSubmitEditing={(event) =>
                    addTag(event.nativeEvent.text.trim())
                  }
                />
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {tempFilters.tags.map((tag, index) => (
                    <TouchableOpacity key={index}>
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-800 font-quicksand-medium">
                          {tag}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="divider" />
              <View className="flex flex-row justify-between items-center gap-2">
                <View className="w-1/2">
                  <Text>Min Salary</Text>
                  <TextInput
                    ref={locationInputRef}
                    className="border border-black rounded-lg p-3 mt-2"
                    returnKeyType="done"
                    placeholder="e.g. 50000"
                    onSubmitEditing={(event) =>
                      handleMinSalary(event.nativeEvent.text)
                    }
                  />
                </View>
                <View className="w-1/2">
                  <Text>Max Salary</Text>
                  <TextInput
                    ref={locationInputRef}
                    className="border border-black rounded-lg p-3 mt-2"
                    placeholder="e.g. 150000"
                    returnKeyType="done"
                    onSubmitEditing={(event) =>
                      handleMaxSalary(event.nativeEvent.text)
                    }
                  />
                </View>
              </View>
              <View className="flex-row justify-center items-center gap-2">
                <TouchableOpacity
                  className="mt-6 apply-button px-6 py-3 w-1/2 rounded-lg flex items-center justify-center"
                  onPress={handleFilterApply}
                >
                  <Text className="font-quicksand-semibold text-md">Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="mt-6 apply-button px-6 py-3 w-1/2 rounded-lg flex items-center justify-center"
                  onPress={handleClearFilters}
                >
                  <Text className="font-quicksand-semibold text-md">Clear</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Jobs;
