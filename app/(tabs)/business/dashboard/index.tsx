import AdminDashboard from "@/components/dashboard/AdminDashboard";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";
import useAuthStore from "@/store/auth.store";
import { BusinessUser } from "@/type";
import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  const { isLoading: isLoadingUser, user: authUser } = useAuthStore();
  const user = authUser as BusinessUser | null;

  if (isLoadingUser) {
    return <ActivityIndicator size="large" />;
  }
  if (user?.role === "ADMIN") {
    return <AdminDashboard />;
  }
  if (user?.role === "RECRUITER") {
    return <RecruiterDashboard />;
  }
  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <Text>other information</Text>
    </SafeAreaView>
  );
};

export default Dashboard;
