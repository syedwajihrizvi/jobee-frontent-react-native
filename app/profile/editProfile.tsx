import BackBar from "@/components/BackBar";
import EditProfileCard from "@/components/EditProfileCard";
import ProfileEducationCard from "@/components/ProfileEducationCard";
import ProfileSkillCard from "@/components/ProfileSkillCard";
import useAuthStore from "@/store/auth.store";
import { UserSkill } from "@/type";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function EditProfile() {
  const { isLoading, user } = useAuthStore()
  const [openGeneral, setOpenGeneral] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const [openEducation, setOpenEducation] = useState(false);
  const [openSocials, setOpenSocials] = useState(false);
  const [openExperience, setOpenExperience] = useState(false);
  const [openPortfolio, setOpenPortfolio] = useState(false);
  const [skillChunks, setSkillChunks] = useState<UserSkill[][]>([]);
  
  // TODO: Replace with actual data fetching logic
  // This is just a placeholder for demonstration purposes
  function chunkArray(array: UserSkill[], size: number): UserSkill[][] {
    const result: UserSkill[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  useEffect(() => {
    if (user) {
      setSkillChunks(chunkArray(user.skills, 2));
      console.log(user.education)
    }
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-white h-full">
      <BackBar label="Edit Profile" />
      
      <ScrollView>
        {isLoading ? 
        <ActivityIndicator size='large' className='flex-1 justify-center items-center'/> :
        <>
            <View className="px-4 py-2">
                <View className="flex flex-row justify-between items-start">
                    <Text className="font-quicksand-bold text-xl">
                        General Information
                    </Text>
                    <AntDesign 
                    name={openGeneral ? "up" : "down"} 
                    size={20} 
                    color="black" 
                    onPress={() => setOpenGeneral(!openGeneral)}
                    />
                </View>
                {openGeneral && 
                <View className="flex flex-row flex-wrap gap-4">
                    <EditProfileCard label="First Name" value={user?.firstName || ""} />
                    <EditProfileCard label="Last Name" value={user?.lastName || ""} />
                    <EditProfileCard label="Title" value={user?.title || ""} />
                    <EditProfileCard label="Company" value={user?.company || ""} />
                    <EditProfileCard label="Email" value={user?.email || ""} />
                    <EditProfileCard label="Phone" value={user?.phoneNumber || ""} />
                    <EditProfileCard label="Location" value={user?.location || ""} />
                </View>}
                    </View>
                    <View className="divider"/>
                    <View className="px-4 py-2">
                        <View className="flex flex-row justify-between items-start">
                            <View className="fkex flex-row items-center gap-2">
                                <Text className="font-quicksand-bold text-xl">Summary</Text>
                                <TouchableOpacity>
                                    <AntDesign name="edit" size={20} color="black" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity>
                                <AntDesign name={openSummary ? "up" : "down"} size={20} color="black" onPress={() => setOpenSummary(!openSummary)} />
                            </TouchableOpacity>
                        </View>
                        {openSummary && 
                        <View className="flex flex-row flex-wrap">
                            <Text className="font-quicksand-semibold text-md text-gray-900">
                               {user?.summary || "No summary provided."}
                            </Text>
                        </View>}
                    </View>
                    <View className="divider"/>
                    <View className="px-4 py-2">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Skills</Text>
                            <AntDesign 
                            name={openSkills ? "up" : "down"} 
                            size={20} 
                            color="black" 
                            onPress={() => setOpenSkills(!openSkills)}
                            />
                        </View>
                        {openSkills &&
                        <View className="flex flex-col flex-wrap gap-4 p-2">
                            <FlatList
                                data={skillChunks}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 12, paddingTop: 8, paddingBottom: 8}}
                                renderItem={({ item }) => (
                                    <View style={{ flexDirection: "column", gap: 12 }}>
                                    {item.map((s, idx) => (
                                        <ProfileSkillCard key={idx} skill={s.skill.name} experience={s.experience}/>
                                    ))}
                                    </View>
                                )}
                                keyExtractor={(item) => item[0].id.toString()}
                            />
                            <TouchableOpacity className="w-2/5">
                                <View className="p-4 bg-green-500 rounded-2xl shadow-md border border-gray-100 flex-row justify-center items-center">
                                    <Text className="text-white">Add new skill</Text>
                                    <AntDesign name="plus" size={20} color="white" className="ml-2" />
                                </View>
                            </TouchableOpacity>
                        </View>}
                    </View>
                    <View className="divider"/>
                    <View className="px-4 py-2">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Education</Text>
                            <AntDesign 
                            name={openEducation ? "up" : "down"} 
                            size={20} 
                            color="black" 
                            onPress={() => setOpenEducation(!openEducation)}
                            />
                        </View>
                        {openEducation &&
                        <View className="flex flex-row flex-wrap gap-4">
                            {user?.education?.map((edu) => (
                                <ProfileEducationCard key={edu.id} education={edu} />
                            ))}
                            <TouchableOpacity>
                                <View className="p-4 bg-green-500 rounded-2xl shadow-md border border-gray-100 flex-row justify-start items-center">
                                    <Text className="text-white">Add new education</Text>
                                    <AntDesign name="plus" size={20} color="white" className="ml-2" />
                                </View>
                            </TouchableOpacity>
                        </View>}
                    </View>
                    <View className="divider"/>
                    <View className="px-4 py-2">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Socials</Text>
                            <AntDesign 
                            name={openSocials ? "up" : "down"} 
                            size={20} 
                            color="black" 
                            onPress={() => setOpenSocials(!openSocials)}
                            />
                        </View>
                        {openSocials &&
                        <View className="flex flex-row flex-wrap gap-4">
                            <Text>Socials</Text> 
                        </View>}
                    </View>
                    <View className="divider"/>
                    <View className="px-4 py-2">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Experience</Text>
                            <AntDesign 
                            name={openExperience ? "up" : "down"} 
                            size={20} 
                            color="black" 
                            onPress={() => setOpenExperience(!openExperience)}
                            />
                        </View>
                        {openExperience &&
                        <View className="flex flex-row flex-wrap gap-4">
                            <Text>Experience</Text> 
                        </View>}
                    </View>
                    <View className="divider"/>
                    <View className="px-4 py-2">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Portfolio</Text>
                            <AntDesign 
                            name={openPortfolio ? "up" : "down"} 
                            size={20} 
                            color="black" 
                            onPress={() => setOpenPortfolio(!openPortfolio)}
                            />
                        </View>
                        {openPortfolio &&
                        <View className="flex flex-row flex-wrap gap-4">
                            <Text>Experience</Text> 
                        </View>}
                    </View>
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}
