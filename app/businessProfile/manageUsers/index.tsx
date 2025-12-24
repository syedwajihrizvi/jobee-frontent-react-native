import BackBar from "@/components/BackBar";
import ModalWithBg from "@/components/ModalWithBg";
import RenderBusinessProfileImage from "@/components/RenderBusinessProfileImage";
import SearchBar from "@/components/SearchBar";
import { sounds } from "@/constants";
import { sendInviteForJobee } from "@/lib/auth";
import { useCompanyMembers } from "@/lib/services/useCompanyMembers";
import useAuthStore from "@/store/auth.store";
import { BusinessUser, CompanyMember } from "@/type";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const userFilterTypes = [
  { value: "ALL", label: "All" },
  { value: "ADMIN", label: "Admin" },
  { value: "RECRUITER", label: "Recruiter" },
  { value: "EMPLOYEE", label: "Employee" },
];

const ManageUsers = () => {
  const { user: authUser } = useAuthStore();
  const user = authUser as BusinessUser | null;
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<"ALL" | "ADMIN" | "RECRUITER" | "EMPLOYEE">("ALL");
  const [selectedUserType, setSelectedUserType] = useState<"ADMIN" | "RECRUITER" | "EMPLOYEE">("EMPLOYEE");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const player = useAudioPlayer(sounds.popSound);
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const { data, isLoading } = useCompanyMembers(user?.companyId!, currentPage, searchQuery, userTypeFilter);
  const content = data?.pages.flatMap((page) => page.members) || [];
  const hasMore = data?.pages[data.pages.length - 1].hasMore || false;
  const totalItems = data?.pages[0].totalElements;

  const userTypes = [
    { value: "ADMIN", label: "Admin", color: "#dc2626", bgColor: "#fee2e2" },
    { value: "RECRUITER", label: "Recruiter", color: "#3b82f6", bgColor: "#dbeafe" },
    { value: "EMPLOYEE", label: "Employee", color: "#16a34a", bgColor: "#dcfce7" },
  ];

  const renderUserTypes = () => {
    if (user?.role === "RECRUITER") {
      return userTypes.filter((t) => t.value !== "ADMIN");
    }
    if (user?.role === "EMPLOYEE") {
      return userTypes.filter((t) => t.value === "EMPLOYEE");
    }
    return userTypes;
  };

  const getUserTypeStyle = (type: string) => {
    const userType = userTypes.find((t) => t.value === type);
    return userType || userTypes[2]; // Default to employee
  };

  const handleSendInvite = async () => {
    if (!inviteEmail && !invitePhone) {
      Alert.alert("Error", "Please provide at least an email or phone number to send an invite.");
      return;
    }
    setSendingInvite(true);
    try {
      const res = await sendInviteForJobee(inviteEmail, invitePhone, selectedUserType);
      if (res) {
        Alert.alert("Success", "Invitation sent successfully.");
        setShowInviteUserModal(false);
        setInviteEmail("");
        setInvitePhone("");
        setSelectedUserType("EMPLOYEE");
        player.seekTo(0);
        player.play();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send invitation. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  const renderUserItem = ({ item }: { item: CompanyMember }) => {
    const userTypeStyle = getUserTypeStyle(item.userType);

    return (
      <View
        className="mx-4 mb-3 bg-white rounded-xl border border-gray-200"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="p-4">
          <View className="flex-row items-start gap-3">
            <RenderBusinessProfileImage
              profileImageUrl={item.isMe ? user?.profileImageUrl : item.profileImageUrl}
              firstName={item.firstName}
              lastName={item.lastName}
            />

            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-quicksand-bold text-base text-gray-900">
                  {item.firstName} {item.lastName}
                </Text>
                {item.isMe && (
                  <View className="bg-emerald-100 px-2 py-0.5 rounded-md">
                    <Text className="font-quicksand-bold text-xs text-emerald-700">You</Text>
                  </View>
                )}
              </View>
              <Text className="font-quicksand-medium text-sm text-gray-600 mb-2">{item.email}</Text>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: userTypeStyle.bgColor }}>
                  <Text className="font-quicksand-bold text-xs" style={{ color: userTypeStyle.color }}>
                    {userTypeStyle.label}
                  </Text>
                </View>
              </View>
              <Text className="font-quicksand-medium text-xs text-gray-500">
                Joined: {new Date(item.joinedDate).toLocaleDateString()}
              </Text>
            </View>
            {user?.role === "ADMIN" && item.isMe === false && (
              <TouchableOpacity
                className="w-8 h-8 items-center justify-center"
                onPress={() => {
                  Alert.alert("User Actions", `Actions for ${item.firstName} ${item.lastName}`, [
                    { text: "Edit Role", onPress: () => console.log("Edit role") },
                    { text: "Remove User", style: "destructive", onPress: () => console.log("Remove user") },
                    { text: "Cancel", style: "cancel" },
                  ]);
                }}
                activeOpacity={0.7}
              >
                <Feather name="more-vertical" size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Manage Users" />
      <View className="px-4 py-4 mt-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-quicksand-bold text-xl text-gray-900">Team Members</Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">
              {totalItems || 0} member{totalItems !== 1 ? "s" : ""}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-emerald-500 px-4 py-2 rounded-xl flex-row items-center gap-2"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => setShowInviteUserModal(true)}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={16} color="white" />
            <Text className="font-quicksand-bold text-white text-sm">Invite User</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="items-center mt-2">
        <SearchBar placeholder={"Search users by name"} onSubmit={(text: string) => setSearchQuery(text)} />
      </View>
      <View className="flex-row gap-2 px-4 mt-4">
        {userFilterTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            className={`py-2 px-4 rounded-xl border-2 ${
              userTypeFilter === type.value ? "border-green-500" : "border-gray-200"
            }`}
            style={{
              backgroundColor: userTypeFilter === type.value ? "#d1fae5" : "#f9fafb",
            }}
            onPress={() => setUserTypeFilter(type.value as any)}
            activeOpacity={0.7}
          >
            <Text
              className={`font-quicksand-bold text-center text-sm ${
                userTypeFilter === type.value ? "text-gray-900" : "text-gray-600"
              }`}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={content}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasMore) {
            setCurrentPage(currentPage + 1);
          }
        }}
        ListFooterComponent={() => {
          return isLoading ? <ActivityIndicator size="small" color="green" /> : null;
        }}
        ListEmptyComponent={() => {
          return !isLoading ? (
            <View className="flex-1 items-center justify-center px-4 py-12">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Feather name="users" size={32} color="#9ca3af" />
              </View>
              <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">No Team Members Found</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 text-center">
                {searchQuery || userTypeFilter !== "ALL"
                  ? "Try adjusting your search or filters"
                  : "Start building your team by inviting new members"}
              </Text>
            </View>
          ) : null;
        }}
      />
      <ModalWithBg visible={showInviteUserModal} customHeight={0.5} customWidth={0.9}>
        <View
          className="rounded-2xl p-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View>
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                <Feather name="user-plus" size={20} color="#4ade80" />
              </View>
              <Text className="font-quicksand-bold text-lg text-gray-900">Invite New User</Text>
            </View>
            <View className="mb-4">
              <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Email Address</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900"
                placeholder="user@company.com"
                placeholderTextColor="#9ca3af"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View className="mb-4">
              <Text className="font-quicksand-semibold text-sm text-gray-700 mb-2">Phone Number (Optional)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-quicksand-medium text-gray-900"
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9ca3af"
                value={invitePhone}
                onChangeText={setInvitePhone}
              />
            </View>
            <View className="mb-6">
              <Text className="font-quicksand-semibold text-sm text-gray-700 mb-3">Invite As</Text>
              <View className="flex-row gap-2">
                {renderUserTypes().map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                      selectedUserType === type.value ? "border-green-500" : "border-gray-200"
                    }`}
                    style={{
                      backgroundColor: selectedUserType === type.value ? type.bgColor : "#f9fafb",
                    }}
                    onPress={() => setSelectedUserType(type.value as any)}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-quicksand-semibold text-center text-sm ${
                        selectedUserType === type.value ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-emerald-500 py-3 px-4 rounded-xl"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={handleSendInvite}
                disabled={sendingInvite}
                activeOpacity={0.8}
              >
                {sendingInvite ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-quicksand-bold text-white text-center">Send Invite</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-3 px-4 rounded-xl border border-gray-300"
                onPress={() => {
                  setShowInviteForm(false);
                  setInviteEmail("");
                  setInvitePhone("");
                  setSelectedUserType("EMPLOYEE");
                  setShowInviteUserModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text className="font-quicksand-bold text-gray-700 text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default ManageUsers;
