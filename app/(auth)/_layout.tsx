import useUserStore from "@/store/user.store";
import { Slot } from "expo-router";
import React from "react";
import { Dimensions, ImageBackground, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { images } from "../../constants";

const AuthLayout = () => {
  const { type } = useUserStore();
  return (
    <View className="bg-white h-full">
      <View className="w-full relative" style={{ height: Dimensions.get("window").height / 3.235 }}>
        <ImageBackground
          source={{ uri: images.placeholder }}
          className="w-full h-full rounded-b-lg"
          resizeMode="contain"
        />
        <View className="absolute top-48 w-80 px-10">
          <Text className="font-quicksand-bold text-xl">Get Started Now</Text>
          <Text className="font-quicksand-semibold text-lg">
            {type === "user"
              ? "Create an account or login to explore your dream job."
              : "Create an account or login to manage your business."}
          </Text>
        </View>
      </View>
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        keyboardShouldPersistTaps="always"
        enableResetScrollToCoords={false}
        resetScrollToCoords={{ x: 0, y: 0 }}
        extraScrollHeight={0}
        extraHeight={0}
      >
        <Slot />
        <View className="flex-1" />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AuthLayout;
