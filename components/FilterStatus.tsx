import { employmentTypes, experienceLevels, workArrangements } from "@/constants";
import { JobFilters } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  filterCount: number;
  filters: JobFilters;
  openFilters: () => void;
  handleClearFilters: () => void;
};

const FilterStatus = ({ filterCount, filters, openFilters, handleClearFilters }: Props) => {
  return (
    <View
      className="mx-4 mb-2 bg-white rounded-xl p-3 border border-gray-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-6 h-6 bg-indigo-100 rounded-full items-center justify-center">
            <Feather name="filter" size={12} color="#6366f1" />
          </View>
          <Text className="font-quicksand-bold text-sm text-gray-800">Active Filters ({filterCount})</Text>
        </View>
        <View className="flex-row gap-1">
          <TouchableOpacity
            onPress={openFilters}
            className="bg-green-50 border border-green-200 px-3 py-1 rounded-full"
            activeOpacity={0.7}
          >
            <Text className="font-quicksand-semibold text-xs text-green-600">Open Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearFilters}
            className="bg-red-50 border border-red-200 px-3 py-1 rounded-full"
            activeOpacity={0.7}
          >
            <Text className="font-quicksand-semibold text-xs text-red-600">Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
      {filterCount > 0 && <View className="h-2" />}
      <View className="flex-row flex-wrap gap-2">
        {filters.search && (
          <View className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-full flex-row items-center gap-1">
            <Feather name="search" size={10} color="#3b82f6" />
            <Text className="font-quicksand-medium text-xs text-blue-800" numberOfLines={1}>
              {filters.search}
            </Text>
          </View>
        )}
        {filters.locations.map((location, index) => (
          <View
            key={index}
            className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex-row items-center gap-1"
          >
            <Feather name="map-pin" size={10} color="#10b981" />
            <Text className="font-quicksand-medium text-xs text-emerald-800">{location}</Text>
          </View>
        ))}
        {filters.companies?.map((company, index) => (
          <View
            key={index}
            className="bg-purple-50 border border-purple-200 px-3 py-1 rounded-full flex-row items-center gap-1"
          >
            <FontAwesome5 name="building" size={10} color="#8b5cf6" />
            <Text className="font-quicksand-medium text-xs text-purple-800">{company}</Text>
          </View>
        ))}
        {filters.employmentTypes?.map((type, index) => (
          <View
            key={index}
            className="bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full flex-row items-center gap-1"
          >
            <Feather name="clock" size={10} color="#6366f1" />
            <Text className="font-quicksand-medium text-xs text-indigo-800">
              {employmentTypes.find((et) => et.value === type)?.label || type}
            </Text>
          </View>
        ))}
        {filters.workArrangements?.map((arrangement, index) => (
          <View
            key={index}
            className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex-row items-center gap-1"
          >
            <Feather name="home" size={10} color="#f59e0b" />
            <Text className="font-quicksand-medium text-xs text-amber-800">
              {workArrangements.find((wa) => wa.value === arrangement)?.label || arrangement}
            </Text>
          </View>
        ))}
        {filters.experience && (
          <View className="bg-green-50 border border-green-200 px-3 py-1 rounded-full flex-row items-center gap-1">
            <Feather name="trending-up" size={10} color="#22c55e" />
            <Text className="font-quicksand-medium text-xs text-green-800">
              {experienceLevels.find((el) => el.value === filters.experience)?.label || filters.experience} years
            </Text>
          </View>
        )}
        {filters.tags.map((tag, index) => (
          <View
            key={index}
            className="bg-orange-50 border border-orange-200 px-3 py-1 rounded-full flex-row items-center gap-1"
          >
            <Feather name="code" size={10} color="#f97316" />
            <Text className="font-quicksand-medium text-xs text-orange-800">{tag}</Text>
          </View>
        ))}
        {(filters.minSalary || filters.maxSalary) && (
          <View className="bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex-row items-center gap-1">
            <Feather name="dollar-sign" size={10} color="#14b8a6" />
            <Text className="font-quicksand-medium text-xs text-teal-800">
              {filters.minSalary ? `$${filters.minSalary.toLocaleString()}` : "$0"}
              {" - "}
              {filters.maxSalary ? `$${filters.maxSalary.toLocaleString()}` : "∞"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FilterStatus;
