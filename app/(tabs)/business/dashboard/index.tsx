import BusinessDashboard from "@/components/dashboard/BusinessDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";
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
  if (user?.role === "ADMIN") {
    return <BusinessDashboard userType="ADMIN" />;
  }
  if (user?.role === "RECRUITER") {
    return <BusinessDashboard userType="RECRUITER" />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;
