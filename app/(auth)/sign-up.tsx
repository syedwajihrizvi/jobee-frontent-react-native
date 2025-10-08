import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { registerForPushNotifications, signUpBusiness, signUpUser } from "@/lib/auth";
import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import { BusinessSignUpParams, UserSignUpParams } from "@/type";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const SignUp = () => {
  const [form, setForm] = useState<UserSignUpParams>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [businessForm, setBusinessForm] = useState<BusinessSignUpParams>({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { fetchAuthenticatedUser, setIsAuthenticated } = useAuthStore();
  const { type, setType } = useUserStore();

  const handleSignUpForUser = async () => {
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
    } else {
      setIsLoading(true);
      try {
        const result = await signUpUser(form);
        if (!result) {
          Alert.alert("Error", "Failed to create account");
          return;
        }
        await fetchAuthenticatedUser();
        setIsAuthenticated(true);
        setType("user");
        AsyncStorage.setItem("profileReminderShown", "false");
        router.replace("/(tabs)/users/jobs");
        await registerForPushNotifications();
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Failed to create account. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignUpForBusiness = async () => {
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
    } else {
      setIsLoading(true);
      try {
        const result = await signUpBusiness(businessForm);
        if (!result) {
          Alert.alert("Error", "Failed to create business account");
          return;
        }
        await fetchAuthenticatedUser();
        setIsAuthenticated(true);
        setType("business");
        router.replace("/(tabs)/business/jobs");
      } catch (error) {
        Alert.alert("Error", "Failed to create business account. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      enableOnAndroid
      extraScrollHeight={275}
      keyboardShouldPersistTaps="handled"
      enableAutomaticScroll
    >
      <View
        className="bg-white rounded-2xl pb-10 pt-1 px-8"
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
              className={`flex-1 py-3 rounded-lg items-center ${type === "user" ? "bg-green-500" : "bg-transparent"}`}
              style={{
                shadowColor: type === "user" ? "#10b981" : "transparent",
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
              className={`flex-1 py-3 rounded-lg items-center ${
                type === "business" ? "bg-green-500" : "bg-transparent"
              }`}
              style={{
                shadowColor: type === "business" ? "#10b981" : "transparent",
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
          {type === "user" ? (
            <>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <CustomInput
                    placeholder="First name"
                    label="First Name"
                    value={form.firstName}
                    customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                    onChangeText={(text) => setForm({ ...form, firstName: text })}
                  />
                </View>
                <View className="flex-1">
                  <CustomInput
                    placeholder="Last name"
                    label="Last Name"
                    value={form.lastName}
                    customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                    onChangeText={(text) => setForm({ ...form, lastName: text })}
                  />
                </View>
              </View>

              <CustomInput
                placeholder="Enter your email"
                label="Email Address"
                value={form.email}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                onChangeText={(text) => setForm({ ...form, email: text })}
              />

              <CustomInput
                placeholder="Create a strong password"
                label="Password"
                value={form.password}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                onChangeText={(text) => setForm({ ...form, password: text })}
              />

              <CustomInput
                placeholder="Confirm Password"
                label="Confirm Password"
                value={form.confirmPassword}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                onChangeText={(text) => setForm({ ...form, password: text })}
              />
            </>
          ) : (
            <>
              <CustomInput
                placeholder="e.g. Acme Corp"
                label="Company Name"
                value={businessForm.companyName}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                onChangeText={(text) => setForm({ ...form, firstName: text })}
              />
              <CustomInput
                placeholder="Enter your email"
                label="Email Address"
                value={businessForm.email}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                onChangeText={(text) => setForm({ ...form, lastName: text })}
              />
              <CustomInput
                placeholder="Enter your password"
                label="Password"
                value={businessForm.password}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                onChangeText={(text) => setForm({ ...form, email: text })}
              />

              <CustomInput
                placeholder="Confirm Password"
                label="Confirm Password"
                value={form.password}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
                onChangeText={(text) => setForm({ ...form, password: text })}
              />
            </>
          )}
        </View>

        <View className="mb-4">
          <Text className="font-quicksand-medium text-xs text-gray-600 text-center leading-5">
            By creating an account, you agree to our{" "}
            <Text className="text-green-600 font-quicksand-bold">Terms of Service</Text> and{" "}
            <Text className="text-green-600 font-quicksand-bold">Privacy Policy</Text>
          </Text>
        </View>
        <CustomButton
          text={type === "user" ? "Create Account" : "Create Business Account"}
          customClass="bg-green-500 py-4 rounded-xl"
          onClick={type === "user" ? handleSignUpForUser : handleSignUpForBusiness}
          isLoading={isLoading}
        />
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="font-quicksand-medium text-sm text-gray-500 px-4">or sign up with</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>
        <View className="flex-row gap-4 mb-4">
          <TouchableOpacity
            className="flex-1 bg-white border border-gray-200 rounded-xl py-3 items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="mail" size={18} color="#374151" />
              <Text className="font-quicksand-semibold text-sm text-gray-700">Google</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="items-center">
          <Text className="font-quicksand-medium text-sm text-gray-600">
            Already have an account?{" "}
            <Text className="text-green-600 font-quicksand-bold" onPress={() => router.navigate("/(auth)/sign-in")}>
              Sign In
            </Text>
          </Text>
        </View>
      </View>
      <View className="flex-1" />
    </KeyboardAwareScrollView>
  );
};

export default SignUp;
