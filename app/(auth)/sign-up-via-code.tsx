import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { signUpBusinessViaCode } from "@/lib/auth";
import { SignUpViaCodeParams } from "@/type";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const SignUpViaCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signUpForm, setSignUpForm] = useState<SignUpViaCodeParams>({
    companyCode: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
  });

  const handleSignUpViaCode = async () => {
    const { companyCode, email, phoneNumber, password } = signUpForm;
    if (!companyCode || !email || !phoneNumber || !password) {
      Alert.alert("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const res = await signUpBusinessViaCode(signUpForm);
      if (res) {
        Alert.alert("Sign up successful! Please sign in.");
        router.push("/(auth)/sign-in");
        return;
      }
      Alert.alert("Sign up failed. Please check your details and try again.");
    } catch (error) {
      Alert.alert("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      <View className="gap-6 mb-4">
        <View>
          <TouchableOpacity
            className="bg-blue-50 border border-blue-200 rounded-xl py-3 px-4 flex-row items-center justify-center gap-2"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text className="font-quicksand-bold text-blue-600 text-sm">Back to Sign Up</Text>
          </TouchableOpacity>

          <Text className="font-quicksand-medium text-xs text-gray-500 text-center mt-2">Do not have an invite?</Text>
        </View>
        <Text className="font-quicksand-bold text-xl">Sign up via Company Code</Text>
        <View className="flex-1">
          <CustomInput
            label="Company Code"
            placeholder="X-ABCD"
            value={signUpForm.companyCode}
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
            onChangeText={(text) => setSignUpForm({ ...signUpForm, companyCode: text })}
          />
        </View>
        <View className="flex-1">
          <CustomInput
            label="Email"
            placeholder="Enter your invited email"
            value={signUpForm.email}
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
            onChangeText={(text) => setSignUpForm({ ...signUpForm, email: text })}
          />
        </View>
        <View className="flex-1">
          <CustomInput
            label="First Name"
            autoCapitalize="words"
            placeholder="Enter your first name"
            value={signUpForm.firstName}
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
            onChangeText={(text) => setSignUpForm({ ...signUpForm, firstName: text })}
          />
        </View>
        <View className="flex-1">
          <CustomInput
            label="Last Name"
            autoCapitalize="words"
            placeholder="Enter your last name"
            value={signUpForm.lastName}
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
            onChangeText={(text) => setSignUpForm({ ...signUpForm, lastName: text })}
          />
        </View>
        <View className="flex-1">
          <CustomInput
            label="Phone Number"
            placeholder="Enter your phone number"
            value={signUpForm.phoneNumber}
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
            onChangeText={(text) => setSignUpForm({ ...signUpForm, phoneNumber: text })}
          />
        </View>
        <View className="flex-1">
          <CustomInput
            secureField={true}
            label="Password"
            placeholder="Create a password"
            value={signUpForm.password}
            customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
            onChangeText={(text) => setSignUpForm({ ...signUpForm, password: text })}
          />
        </View>
        <CustomButton
          text="Sign Up"
          customClass="bg-emerald-500 py-4 rounded-xl"
          onClick={handleSignUpViaCode}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

export default SignUpViaCode;
