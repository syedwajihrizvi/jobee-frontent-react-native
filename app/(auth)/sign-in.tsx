import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import GoogleButton from "@/components/GoogleButton";
import { registerForPushNotifications, signInBusiness, signInUser } from "@/lib/auth";
import useAuthStore from "@/store/auth.store";
import useBusinessProfileSummaryStore from "@/store/business-profile-summary.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import useUserStore from "@/store/user.store";
import { SignInParams } from "@/type";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const SignIn = () => {
  const [form, setForm] = useState<SignInParams>({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { fetchAuthenticatedUser, setIsAuthenticated } = useAuthStore();
  const { fetchProfileSummary } = useProfileSummaryStore();
  const { fetchProfileSummary: fetchBusinessProfileSummary } = useBusinessProfileSummaryStore();
  const { type, setType } = useUserStore();

  const handleSignInForUser = async () => {
    const { email, password } = form;
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
    } else {
      setIsLoading(true);
      try {
        const result = await signInUser(form);
        if (!result) {
          Alert.alert("Error", "Invalid email or password");
          return;
        }
        await fetchAuthenticatedUser();
        await fetchProfileSummary();
        setIsAuthenticated(true);
        setType("user");
        AsyncStorage.setItem("profileReminderShown", "false");
        router.replace("/(tabs)/users/jobs");
        await registerForPushNotifications();
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Failed to sign in. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignInForBusiness = async () => {
    const { email, password } = form;
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
    } else {
      setIsLoading(true);
      try {
        const result = await signInBusiness(form);
        if (!result) {
          Alert.alert("Error", "Invalid email or password");
          return;
        }
        await fetchAuthenticatedUser();
        await fetchBusinessProfileSummary();
        setIsAuthenticated(true);
        setType("business");
        router.replace("/(tabs)/business/jobs");
      } catch (error) {
        Alert.alert("Error", "Failed to sign in. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View
      className="bg-white rounded-2xl px-8 pt-1 pb-10"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      <View className="mb-8">
        <Text className="font-quicksand-semibold text-lg text-gray-800 mb-4 text-center">Choose Account Type</Text>

        <View
          className="bg-gray-100 rounded-xl p-1 flex-row"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${type === "user" ? "bg-emerald-500" : "bg-transparent"}`}
            style={{
              shadowColor: type === "user" ? "#6366f1" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: type === "user" ? 0.2 : 0,
              shadowRadius: 4,
              elevation: type === "user" ? 3 : 0,
            }}
            onPress={() => setType("user")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="user" size={16} color={type === "user" ? "white" : "#6b7280"} />
              <Text className={`font-quicksand-bold text-sm ${type === "user" ? "text-white" : "text-gray-600"}`}>
                Job Seeker
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${type === "business" ? "bg-emerald-500" : "bg-transparent"}`}
            style={{
              shadowColor: type === "business" ? "#6366f1" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: type === "business" ? 0.2 : 0,
              shadowRadius: 4,
              elevation: type === "business" ? 3 : 0,
            }}
            onPress={() => setType("business")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="briefcase" size={16} color={type === "business" ? "white" : "#6b7280"} />
              <Text className={`font-quicksand-bold text-sm ${type === "business" ? "text-white" : "text-gray-600"}`}>
                Employer
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="gap-6 mb-8">
        <CustomInput
          placeholder="Enter your email"
          label="Email Address"
          value={form.email}
          customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
          onChangeText={(text) => setForm({ ...form, email: text })}
          style={{
            fontSize: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        />
        <CustomInput
          placeholder="Enter your password"
          label="Password"
          value={form.password}
          customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
          onChangeText={(text) => setForm({ ...form, password: text })}
          style={{
            fontSize: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        />
      </View>
      <TouchableOpacity className="mb-4" activeOpacity={0.7}>
        <Text className="font-quicksand-medium text-sm text-green-600 text-right">Forgot Password?</Text>
      </TouchableOpacity>

      <CustomButton
        text={type === "user" ? "Sign In" : "Sign In to Dashboard"}
        customClass="bg-emerald-500 py-4 rounded-xl"
        onClick={type === "user" ? handleSignInForUser : handleSignInForBusiness}
        isLoading={isLoading}
      />
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="font-quicksand-medium text-sm text-gray-500 px-4">or continue with</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>
      <GoogleButton />
      <View className="items-center">
        <Text className="font-quicksand-medium text-sm text-gray-600">
          {type === "user" ? "Don't have an account?" : "Business not registered?"}{" "}
          <Text className="text-green-600 font-quicksand-bold" onPress={() => router.navigate("/(auth)/sign-up")}>
            {type === "user" ? "Sign Up" : "Register Now"}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default SignIn;
