import BackBar from "@/components/BackBar";
import CustomInput from "@/components/CustomInput";
import ModalWithBg from "@/components/ModalWithBg";
import ProfileButton from "@/components/ProfileButton";
import SocialMediaCard from "@/components/SocialMediaCard";
import { createBusinessSocialMediaLink, updateBusinessSocialMediaLink } from "@/lib/updateProfiles/businessProfile";
import { convertEnumToSocialMediaType } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { Entypo, Feather, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import React, { ReactNode, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type BusinessSocials = {
  linkedin: { id: number; url: string };
  github: { id: number; url: string };
  stackOverflow: { id: number; url: string };
  twitter: { id: number; url: string };
  personalWebsite: { id: number; url: string };
};

const SocialMedia = () => {
  const { user, isLoading, setUser } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<{ name: string; icon: ReactNode } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userSocials, setUserSocials] = useState<BusinessSocials>({
    linkedin: { id: 0, url: "" },
    github: { id: 0, url: "" },
    stackOverflow: { id: 0, url: "" },
    twitter: { id: 0, url: "" },
    personalWebsite: { id: 0, url: "" },
  });
  const [updateForm, setUpdateForm] = useState({ type: "", url: "" });

  useEffect(() => {
    if (user && !isLoading) {
      user.socialMedias.forEach((social) => {
        const convertType = convertEnumToSocialMediaType(social.type);
        if (convertType in userSocials) {
          setUserSocials((prev) => ({ ...prev, [convertType]: { id: social.id, url: social.url } }));
        }
      });
    }
  }, [user, isLoading]);

  const handleFormUpdateSubmit = async () => {
    console.log("Submitting update for:", updateForm);
    setIsUpdating(true);
    try {
      const hasValue = userSocials[updateForm.type as keyof BusinessSocials].url !== "";
      let res = null;
      if (hasValue) {
        const id = userSocials[updateForm.type as keyof BusinessSocials].id;
        res = await updateBusinessSocialMediaLink(updateForm.type, updateForm.url, id);
        console.log("Update response:", res);
      } else {
        res = await createBusinessSocialMediaLink(updateForm.type, updateForm.url);
        console.log("Create response:", res);
      }
      if (res != null) {
        const { id, type, url } = res;
        const convertType = convertEnumToSocialMediaType(type);
        console.log("Converted type:", convertType);
        if (convertType in userSocials) {
          const updatedSocialIndex = user?.socialMedias.findIndex((social) => social.type === type) ?? -1;
          if (updatedSocialIndex !== -1) {
            const newSocials = [...(user?.socialMedias ?? [])];
            newSocials[updatedSocialIndex] = { id, type, url };
            console.log("Updated socials:", newSocials);
            setUser({ ...(user as any), socialMedias: newSocials });
          } else {
            const newSocials = [...(user?.socialMedias ?? []), { id, type, url }];
            console.log("Added new social to socials:", newSocials);
            setUser({ ...(user as any), socialMedias: newSocials });
          }
        }
        setShowModal(false);
        setEditingField(null);
        setUpdateForm({ type: "", url: "" });
      }
    } catch (error) {
      console.error("Error updating social media link:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditPress = (name: string) => {
    let icon: ReactNode = null;
    switch (name) {
      case "Linkedin":
        icon = <Entypo name="linkedin" size={30} color="#0A66C2" />;
        setUpdateForm({ type: "linkedin", url: userSocials.linkedin.url });
        break;
      case "GitHub":
        icon = <Feather name="github" size={30} color="#171515" />;
        setUpdateForm({ type: "github", url: userSocials.github.url });
        break;
      case "Stack Overflow":
        icon = <FontAwesome name="stack-overflow" size={30} color="#F48024" />;
        setUpdateForm({ type: "stackOverflow", url: userSocials.stackOverflow.url });
        break;
      case "Twitter":
        icon = <FontAwesome6 name="x-twitter" size={30} color="black" />;
        setUpdateForm({ type: "twitter", url: userSocials.twitter.url });
        break;
      case "Personal Website":
        icon = <Feather name="globe" size={30} color="#374151" />;
        setUpdateForm({ type: "personalWebsite", url: userSocials.personalWebsite.url });
        break;
      default:
        break;
    }
    setEditingField({ name, icon });

    setShowModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Social Media Links" />
      <ScrollView>
        <View className="px-6 py-6">
          <View
            className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">
              View and edit your social media links
            </Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              Update your personal social media links so potential clients can learn more about you and your work.
            </Text>
          </View>
        </View>
        <View className="py-3 px-6">
          <View className="flex flex-col gap-3">
            <SocialMediaCard
              label="Linkedin"
              subtitle={userSocials.linkedin.url || "Add your Linkedin profile link"}
              icon={<Entypo name="linkedin" size={22} color="#0A66C2" />}
              handleEditPress={() => handleEditPress("Linkedin")}
            />
            <SocialMediaCard
              label="GitHub"
              subtitle={userSocials.github.url || "Add your GitHub profile link"}
              icon={<Feather name="github" size={22} color="#171515" />}
              handleEditPress={() => handleEditPress("GitHub")}
            />
            <SocialMediaCard
              label="Stack Overflow"
              subtitle={userSocials.stackOverflow.url || "Add your Stack Overflow profile link"}
              icon={<FontAwesome name="stack-overflow" size={22} color="#F48024" />}
              handleEditPress={() => handleEditPress("Stack Overflow")}
            />
            <SocialMediaCard
              label="Twitter"
              subtitle={userSocials.twitter.url || "Add your Twitter (X) profile link"}
              icon={<FontAwesome6 name="x-twitter" size={22} color="black" />}
              handleEditPress={() => handleEditPress("Twitter")}
            />
            <SocialMediaCard
              label="Personal Website"
              subtitle={userSocials.personalWebsite.url || "Add your personal or portfolio website"}
              icon={<Feather name="globe" size={22} color="#374151" />}
              handleEditPress={() => handleEditPress("Personal Website")}
            />
          </View>
        </View>
      </ScrollView>
      <ModalWithBg visible={showModal} customHeight={0.4} customWidth={0.7}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">Update {editingField?.name}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View className="items-center gap-4 py-5 px-4">
            {editingField?.icon}
            <CustomInput
              placeholder={`Enter your ${editingField?.name} link`}
              label=""
              autoCapitalize="none"
              onChangeText={(text) => setUpdateForm((prev) => ({ ...prev, url: text }))}
              fullWidth={true}
              value={updateForm.url}
              customClass="border border-gray-300 rounded-xl p-3 w-full font-quicksand-medium"
              style={{
                fontSize: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            />
            <View className="w-full gap-3">
              <ProfileButton
                color="emerald-500"
                buttonText={`Update ${editingField?.name}`}
                handlePress={handleFormUpdateSubmit}
                disabled={false}
                fullWidth={true}
              />
              <ProfileButton
                color="red-500"
                buttonText="Cancel"
                handlePress={() => setShowModal(false)}
                disabled={false}
                fullWidth={true}
              />
            </View>
          </View>
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};

export default SocialMedia;
