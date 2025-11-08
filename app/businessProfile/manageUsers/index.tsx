import BackBar from "@/components/BackBar";
import ModalWithBg from "@/components/ModalWithBg";
import SearchBar from "@/components/SearchBar";
import { sounds } from "@/constants";
import { sendInviteForJobee } from "@/lib/auth";
import useAuthStore from "@/store/auth.store";
import { BusinessUser } from "@/type";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React, { useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: "ADMIN" | "RECRUITER" | "EMPLOYEE";
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  joinedDate: string;
  profileImageUrl?: string;
}

const ManageUsers = () => {
  const { user: authUser, isLoading } = useAuthStore();
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<"ADMIN" | "RECRUITER" | "EMPLOYEE">("EMPLOYEE");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const player = useAudioPlayer(sounds.popSound);
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);

  const user = authUser as BusinessUser | null;
  // Mock data - replace with actual data from your API
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@company.com",
      phoneNumber: "+1234567890",
      userType: "ADMIN",
      status: "ACTIVE",
      joinedDate: "2024-01-15",
    },
    {
      id: 2,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@company.com",
      phoneNumber: "+1234567891",
      userType: "RECRUITER",
      status: "ACTIVE",
      joinedDate: "2024-02-20",
    },
    {
      id: 3,
      firstName: "Mike",
      lastName: "Davis",
      email: "mike.davis@company.com",
      userType: "EMPLOYEE",
      status: "PENDING",
      joinedDate: "2024-03-10",
    },
  ]);

  const userTypes = [
    { value: "ADMIN", label: "Admin", color: "#dc2626", bgColor: "#fee2e2" },
    { value: "RECRUITER", label: "Recruiter", color: "#3b82f6", bgColor: "#dbeafe" },
    { value: "EMPLOYEE", label: "Employee", color: "#16a34a", bgColor: "#dcfce7" },
  ];

  const renderUserTypes = () => {
    if (user?.role === "RECRUITER") {
      return userTypes.filter((t) => t.value !== "ADMIN");
    }
    return userTypes;
  };

  const getUserTypeStyle = (type: string) => {
    const userType = userTypes.find((t) => t.value === type);
    return userType || userTypes[2]; // Default to employee
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { color: "#16a34a", bgColor: "#dcfce7" };
      case "PENDING":
        return { color: "#f59e0b", bgColor: "#fef3c7" };
      case "INACTIVE":
        return { color: "#6b7280", bgColor: "#f3f4f6" };
      default:
        return { color: "#6b7280", bgColor: "#f3f4f6" };
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail && !invitePhone) {
      Alert.alert("Error", "Please provide at least an email or phone number to send an invite.");
      return;
    }
    sendInviteForJobee(inviteEmail, invitePhone, selectedUserType);
    Alert.alert("Success", "Invitation sent successfully.");
    setShowInviteUserModal(false);
    setInviteEmail("");
    setInvitePhone("");
    setSelectedUserType("EMPLOYEE");
    player.seekTo(0);
    player.play();
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const userTypeStyle = getUserTypeStyle(item.userType);
    const statusStyle = getStatusColor(item.status);

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
            <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
              {item.profileImageUrl ? (
                <View className="w-full h-full rounded-full bg-gray-300" />
              ) : (
                <Feather name="user" size={20} color="#6b7280" />
              )}
            </View>

            <View className="flex-1">
              <Text className="font-quicksand-bold text-base text-gray-900">
                {item.firstName} {item.lastName}
              </Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 mb-2">{item.email}</Text>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: userTypeStyle.bgColor }}>
                  <Text className="font-quicksand-bold text-xs" style={{ color: userTypeStyle.color }}>
                    {userTypeStyle.label}
                  </Text>
                </View>

                <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: statusStyle.bgColor }}>
                  <Text className="font-quicksand-bold text-xs" style={{ color: statusStyle.color }}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text className="font-quicksand-medium text-xs text-gray-500">
                Joined: {new Date(item.joinedDate).toLocaleDateString()}
              </Text>
            </View>
            {user?.role === "ADMIN" && (
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
              {users.length} member{users.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-green-500 px-4 py-2 rounded-xl flex-row items-center gap-2"
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
        <SearchBar placeholder={"Search users by name"} onSubmit={() => console.log("Search submitted")} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />
      <ModalWithBg visible={showInviteUserModal} customHeight={0.8} customWidth={0.9}>
        <View
          className="bg-white rounded-2xl p-6"
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
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
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
                keyboardType="phone-pad"
              />
            </View>
            <View className="mb-6">
              <Text className="font-quicksand-semibold text-sm text-gray-700 mb-3">User Role</Text>
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
                      className={`font-quicksand-bold text-center text-sm ${
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
                className="flex-1 bg-green-500 py-3 px-4 rounded-xl"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={handleSendInvite}
                activeOpacity={0.8}
              >
                <Text className="font-quicksand-bold text-white text-center">Send Invite</Text>
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
