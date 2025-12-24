import BusinessDashboard from "@/components/dashboard/BusinessDashboard";
import useAuthStore from "@/store/auth.store";
import { BusinessUser } from "@/type";
import React from "react";
import { ActivityIndicator } from "react-native";

const Dashboard = () => {
  const { isLoading: isLoadingUser, user: authUser } = useAuthStore();
  const user = authUser as BusinessUser | null;

  if (isLoadingUser) {
    return <ActivityIndicator size="large" />;
  }
  return <BusinessDashboard userType={user?.role || "EMPLOYEE"} />;
};

export default Dashboard;
