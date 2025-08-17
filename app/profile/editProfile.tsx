import BackBar from "@/components/BackBar";
import EditProfileCard from "@/components/EditProfileCard";
import ProfileSkillCard from "@/components/ProfileSkillCard";
import { Skill } from "@/type";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function EditProfile() {
  const [openGeneral, setOpenGeneral] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const [openEducation, setOpenEducation] = useState(false);
  const [openSocials, setOpenSocials] = useState(false);
  const [openExperience, setOpenExperience] = useState(false);
  const [openPortfolio, setOpenPortfolio] = useState(false);
  
  // TODO: Replace with actual data fetching logic
  // This is just a placeholder for demonstration purposes
  const skills: Skill[] = [
        { id: 1, name: "JavaScript", experience: 5 },
        { id: 2, name: "React Native", experience: 3 },
        { id: 3, name: "Python", experience: 4 },
        { id: 4, name: "Django", experience: 2 },
        { id: 5, name: "Flask", experience: 3 },
        { id: 6, name: "Node.js", experience: 4 },
        { id: 7, name: "TypeScript", experience: 2 },
        { id: 8, name: "GraphQL", experience: 1 },
        { id: 9, name: "SQL", experience: 5 },
        { id: 10, name: "NoSQL", experience: 3 },
        { id: 11, name: "Docker", experience: 2 },
        { id: 12, name: "Kubernetes", experience: 1 }
    ];
  function chunkArray(array: Skill[], size: number): Skill[][] {
    const result: Skill[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  const skillChunks = chunkArray(skills, 2);
  return (
    <SafeAreaView className="flex-1 bg-white h-full">
      <BackBar label="Edit Profile" />
      
      <ScrollView>
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
                <EditProfileCard label="First Name" value="John" />
                <EditProfileCard label="Last Name" value="Doe" />
                <EditProfileCard label="Title" value="Software Engineer"/>
                <EditProfileCard label="Company" value="Tech Corp" />
                <EditProfileCard label="Email" value="john.doe@example.com" />
                <EditProfileCard label="Phone" value="+123456789" />
                <EditProfileCard label="Location" value="New York, USA" />
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
                    A brief summary about yourself goes here. 
                    Highlight your skills, experiences, and what you are looking for in your next role.
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
                            <ProfileSkillCard key={idx} skill={s.name} experience={s.experience}/>
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
                <Text>Education</Text> 
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
      </ScrollView>
    </SafeAreaView>
  );
}
