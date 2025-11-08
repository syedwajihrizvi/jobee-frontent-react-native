import AdminDashboard from "@/components/dashboard/AdminDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";
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
    return <AdminDashboard />;
  }
  if (user?.role === "RECRUITER") {
    return <RecruiterDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;
