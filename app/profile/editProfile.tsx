import BackBar from "@/components/BackBar";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import EditProfileCard from "@/components/EditProfileCard";
import ProfileEducationCard from "@/components/ProfileEducationCard";
import ProfileSkillCard from "@/components/ProfileSkillCard";
import { addSkill } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { AddUserSkillForm, UserSkill } from "@/type";
import AntDesign from "@expo/vector-icons/AntDesign";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Keyboard, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditProfile() {
  // TODO: Combine common states into one state object
  const { isLoading, user, setUser } = useAuthStore()
  const [openGeneral, setOpenGeneral] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const [openEducation, setOpenEducation] = useState(false);
  const [openSocials, setOpenSocials] = useState(false);
  const [openExperience, setOpenExperience] = useState(false);
  const [openPortfolio, setOpenPortfolio] = useState(false);
  const [skillChunks, setSkillChunks] = useState<UserSkill[][]>([]);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [addSkillForm, setAddSkillForm] = useState<AddUserSkillForm>({skill: '', experience: ''})
  const [isLoadingNewSkill, setIsLoadingNewSkill] = useState(false);

  function chunkArray(array: UserSkill[], size: number): UserSkill[][] {
    const result: UserSkill[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  const handleAddSkill = async () => {
    const { skill, experience } = addSkillForm;
    if (!skill || !experience) {
        Alert.alert("Please fill in all fields before adding a skill.");
        return;
    }
    else if (isNaN(Number(experience)) || Number(experience) < 0) {
        Alert.alert("Experience must be a valid number greater than or equal to 0.");
        return;
    }
    setIsLoadingNewSkill(true);
    try {
        const result = await addSkill({skill, experience});
        if (!result) {
            Alert.alert("Failed to add skill. Please try again.");
            return;
        }
        const newSkill : UserSkill = {
            id: result.id,
            skill: result.skill,
            experience: result.experience
        };
        let newSkills = []
        const userContainsSkill = user?.skills && user?.skills.some(s => s.id === newSkill.id);
        if (userContainsSkill) {
            newSkills = [...user.skills.filter(s => s.id !== newSkill.id), newSkill];
        } else {
            newSkills = [...(user?.skills ?? []), newSkill];
        }
        if (user) {
            setUser({ ...user, skills: newSkills });
        }
        Alert.alert("Skill added successfully!");
    } catch (error) {
        Alert.alert("Failed to add skill. Please try again.");
    } finally {
        setIsLoadingNewSkill(false);
    }
    console.log("Adding skill:", addSkillForm);
  }

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height+20)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      setSkillChunks(chunkArray(user.skills, 2));
      console.log(user.education)
    }
  }, [user]);

  const openBottomSheet = (type: 'skill' | 'education') => {
    if (type === 'skill') {
        setIsAddingSkill(true);
        setIsAddingEducation(false);
    } else if (type === 'education') {
        setIsAddingEducation(true);
        setIsAddingSkill(false);
    }
    bottomSheetRef.current?.expand();
  }

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
                                {isEditingSummary ? 
                                <View className="flex flex-row gap-2">
                                    <TouchableOpacity onPress={() => setIsEditingSummary(false)}>
                                        <AntDesign name="check" size={20} color="green" />
                                    </TouchableOpacity>    
                                    <TouchableOpacity onPress={() => setIsEditingSummary(false)}>
                                        <AntDesign name="close" size={20} color="red" />
                                    </TouchableOpacity>  
                                </View> : <TouchableOpacity onPress={() => setIsEditingSummary(true)}>
                                    <AntDesign name="edit" size={20} color="black" />
                                </TouchableOpacity>}
                            </View>
                            <TouchableOpacity>
                                <AntDesign name={openSummary ? "up" : "down"} size={20} color="black" onPress={() => setOpenSummary(!openSummary)} />
                            </TouchableOpacity>
                        </View>
                        {(isEditingSummary || openSummary) &&
                        <View className="flex flex-row flex-wrap">
                            {isEditingSummary ? 
                            <TextInput
                                placeholder="Enter your summary"
                                value={user?.summary}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                multiline={true}
                                textAlignVertical="top"
                            /> :
                            <Text className="font-quicksand-semibold text-md text-gray-900">
                               {user?.summary || "No summary provided."}
                            </Text>}
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
                                        <ProfileSkillCard 
                                            key={idx} skill={s.skill.name} experience={s.experience}/>
                                    ))}
                                    </View>
                                )}
                                keyExtractor={(_, index) => `chunk-${index}`}
                            />
                            <TouchableOpacity className="w-2/5" onPress={() => openBottomSheet('skill')}>
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
                            <TouchableOpacity onPress={() => openBottomSheet('education')}>
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
      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={["40%"]} enablePanDownToClose>
        <BottomSheetView 
            className="flex-1 bg-white p-4 gap-4 w-full justify-center items-center"
            style={{ paddingBottom: keyboardHeight }}>
            <View className="w-full flex flex-col gap-4">
                {isAddingSkill &&
                <>
                    {/* TODO: User should not be able to enter any skill. Create autocomplete feature for skills */}
                    <CustomInput 
                        label="Skill Name" 
                        placeholder="e.g. JavaScript" 
                        value={addSkillForm.skill}
                        autoCapitalize="words"
                        returnKeyType="done"
                        onChangeText={(skill) => setAddSkillForm({...addSkillForm, skill})}/>
                    <CustomInput 
                        label="Experience (in years)" 
                        placeholder="e.g. 3" 
                        value={addSkillForm.experience.toString()}
                        returnKeyType="done" 
                        onChangeText={(experience) => setAddSkillForm({...addSkillForm, experience})}/>
                    <View className="flex flex-row gap-2">
                        <CustomButton
                            isLoading={isLoadingNewSkill}
                            text='Add Skill'
                            customClass="bg-green-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                            onClick={handleAddSkill}/>
                        <CustomButton 
                            text='Cancel'
                            customClass="bg-red-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                            onClick={() => {setIsAddingSkill(false); bottomSheetRef.current?.close();}}/>
                    </View>
                </>}
                {isAddingEducation &&
                <>
                    <CustomInput 
                        label="Institution Name" 
                        placeholder="e.g. Harvard University" 
                        value="" 
                        returnKeyType="done"
                        onChangeText={(text) => {}}/>
                    <CustomInput 
                        label="Degree" 
                        placeholder="e.g. BASc in Computer Science" 
                        value=""
                        returnKeyType="done" 
                        onChangeText={(text) => {}}/>
                    <View className="flex flex-row gap-2">
                        <View className="w-1/2">
                            <CustomInput 
                                label="Start Year" 
                                placeholder="e.g. 2016" 
                                value=""
                                returnKeyType="done" 
                                onChangeText={(text) => {}}/>
                        </View>
                        <View className="w-1/2">
                            <CustomInput 
                                label="End Year" 
                                placeholder="e.g. 2020 (leave empty if ongoing)" 
                                value=""
                                returnKeyType="done" 
                                onChangeText={(text) => {}}/>
                        </View>
                    </View>
                                        <View className="flex flex-row gap-2">
                        <CustomButton 
                            text='Add Skill'
                            customClass="bg-green-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                            onClick={() => console.log("Done")}/>
                        <CustomButton 
                            text='Cancel'
                            customClass="bg-red-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                            onClick={() => console.log("Done")}/>
                    </View>
                </>}
            </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
