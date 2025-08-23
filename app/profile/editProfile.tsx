import BackBar from "@/components/BackBar";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import EditProfileCard from "@/components/EditProfileCard";
import ProfileEducationCard from "@/components/ProfileEducationCard";
import ProfileExperienceCard from "@/components/ProfileExperienceCard";
import ProfileSkillCard from "@/components/ProfileSkillCard";
import { addEducation, addSkill, editEducation } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { AddUserEducationForm, AddUserSkillForm, Education, UserSkill } from "@/type";
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
  const [isEditingSkill, setIsEditingSkill] = useState<UserSkill | null>(null)
  const [isEditingEducation, setIsEditingEducation] = useState<Education | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [addSkillForm, setAddSkillForm] = useState<AddUserSkillForm>({skill: '', experience: ''})
  const [addEducationForm, setAddEducationForm] = useState<AddUserEducationForm>({institution: '', degree: '', fromYear: '', toYear: ''})
  const [isLoadingNewSkill, setIsLoadingNewSkill] = useState(false);
  const [isLoadingNewEducation, setIsLoadingNewEducation] = useState(false);

  function chunkArray(array: UserSkill[], size: number): UserSkill[][] {
    const result: UserSkill[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
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
    }
  }, [user]);

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
        console.log("Add skill result:", result);
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
        setAddSkillForm({ skill: '', experience: '' });
        bottomSheetRef.current?.close();
    } catch (error) {
        Alert.alert("Failed to add skill. Please try again.");
    } finally {
        setIsLoadingNewSkill(false);
    }
  }

  const handleAddEducation = async () => {
    const { institution, degree, fromYear, toYear } = addEducationForm;
    if (!institution || !degree || !fromYear) {
        Alert.alert("Please fill in all required fields before adding education.");
        return;
    }
    else if (isNaN(Number(fromYear)) || Number(fromYear) < 1900 || Number(fromYear) > new Date().getFullYear()) {
        Alert.alert("From Year must be a valid year.");
        return;
    }
    else if (toYear && (isNaN(Number(toYear)) || Number(toYear) < 1900 || Number(toYear) > new Date().getFullYear()+10)) {
        Alert.alert("To Year must be a valid year or left empty if ongoing.");
        return;
    }
    else if (toYear && Number(toYear) < Number(fromYear)) {
        Alert.alert("To Year must be greater than or equal to From Year.");
        return;
    }
    setIsLoadingNewEducation(true);
    try {
        const result = await addEducation({institution, degree, fromYear, toYear});
        console.log("Add education result:", result);
        if (!result) {
            Alert.alert("Failed to add education. Please try again.");
            return;
        }
        const newEducation : Education = {
            id: result.id,
            institution: result.institution,
            degree: result.degree,
            fromYear: result.fromYear,
            toYear: result.toYear
        }
    
        Alert.alert("Education added successfully!");
        setAddEducationForm({ institution: '', degree: '', fromYear: '', toYear: '' });
        let newUserEducation = [...(user?.education ?? []), newEducation];
        if (user) {
            setUser({...user, education: newUserEducation})
        }
        bottomSheetRef.current?.close();
    } catch (error) {
        Alert.alert("Failed to add education. Please try again.");
    } finally {
        setIsLoadingNewEducation(false);
    }
  }

  const handleEditEducation = async () => {
    const { institution, degree, fromYear, toYear } = addEducationForm;
    if (!institution || !degree || !fromYear) {
        Alert.alert("Please fill in all required fields before adding education.");
        return;
    }
    else if (isNaN(Number(fromYear)) || Number(fromYear) < 1900 || Number(fromYear) > new Date().getFullYear()) {
        Alert.alert("From Year must be a valid year.");
        return;
    }
    else if (toYear && (isNaN(Number(toYear)) || Number(toYear) < 1900 || Number(toYear) > new Date().getFullYear()+10)) {
        Alert.alert("To Year must be a valid year or left empty if ongoing.");
        return;
    }
    else if (toYear && Number(toYear) < Number(fromYear)) {
        Alert.alert("To Year must be greater than or equal to From Year.");
        return;
    }
    setIsLoadingNewEducation(true);
    try {
        const result = await editEducation(isEditingEducation!.id, addEducationForm);
        console.log("Edit education result:", result);
        if (!result) {
            Alert.alert("Failed to edit education. Please try again.");
            return;
        }
        const newEducation : Education = {
            id: result.id,
            institution: result.institution,
            degree: result.degree,
            fromYear: result.fromYear,
            toYear: result.toYear
        }
    
        Alert.alert("Education updated successfully!");
        setAddEducationForm({ institution: '', degree: '', fromYear: '', toYear: '' });
        let newUserEducation = [...(user?.education?.filter(e => e.id !== result.id) ?? []), newEducation]
        if (user) {
            setUser({...user, education: newUserEducation})
        }
        bottomSheetRef.current?.close();
    } catch (error) {
        Alert.alert("Failed to add education. Please try again.");
    } finally {
        setIsLoadingNewEducation(false);
    }
  }

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

  const handleIsEditingSkill = (skill: UserSkill | null) => {
    setIsEditingSkill(skill); 
    setAddSkillForm({ skill: skill?.skill.name || '', experience: skill?.experience.toString() || '' });
    bottomSheetRef.current?.expand();
  }

  const handleCloseSkillsForm = () => {
    setIsAddingSkill(false);
    setIsEditingSkill(null);
    setAddSkillForm({ skill: '', experience: '' });
    bottomSheetRef.current?.close();
  }

  const handleIsEditingEducation = (education: Education | null) => {
    setIsEditingEducation(education);
    setAddEducationForm({ 
        institution: education?.institution || '', degree: education?.degree || '', 
        fromYear: education?.fromYear.toString() || '', toYear: education?.toYear?.toString() || ''});
    bottomSheetRef.current?.expand();
  }
  const handleCloseEducationForm = () => {
    setIsAddingEducation(false);
    setIsEditingEducation(null);
    setAddEducationForm({ institution: '', degree: '', fromYear: '', toYear: '' });
    bottomSheetRef.current?.close();
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
                    <TouchableOpacity onPress={() => setOpenGeneral(!openGeneral)}>
                        <AntDesign 
                        name={openGeneral ? "up" : "down"} 
                        size={20} 
                        color="black" 
                        />
                    </TouchableOpacity>
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
                            <TouchableOpacity onPress={() => setOpenSummary(!openSummary)} >
                                <AntDesign name={openSummary ? "up" : "down"} size={20} color="black"/>
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
                            <TouchableOpacity onPress={() => setOpenSkills(!openSkills)}>
                                <AntDesign 
                                name={openSkills ? "up" : "down"} 
                                size={20} 
                                color="black" 
                                />
                            </TouchableOpacity>
                        </View>
                        {openSkills &&
                        <View className="flex flex-col flex-wrap gap-4 p-2 w-full">
                            {/*TODO: Fix horizontal scroll issue on skill card flat list*/}
                            <FlatList
                                data={skillChunks}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 12, paddingTop: 8, paddingBottom: 8}}
                                renderItem={({ item }) => (
                                    <View style={{ flexDirection: "column", gap: 12 }}>
                                    {item.map((s, idx) => (
                                        <ProfileSkillCard
                                            onEditSkill={() => handleIsEditingSkill(s)}
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
                    <View className="px-4 py-2 gap-4">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Education</Text>
                            <TouchableOpacity onPress={() => setOpenEducation(!openEducation)}>
                                <AntDesign 
                                    name={openEducation ? "up" : "down"} 
                                    size={20} 
                                    color="black" 
                                />
                            </TouchableOpacity>
                        </View>
                        {openEducation &&
                        <View className="flex flex-row flex-wrap gap-4">
                            {/*TODO: Fix edit button placement on the profile cards*/}
                            {user?.education?.map((edu) => (
                                <ProfileEducationCard 
                                    key={edu.id} education={edu}
                                    onEditEducation={() => handleIsEditingEducation(edu)} />
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
                    <View className="px-4 py-2 gap-4">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Experience</Text>
                            <TouchableOpacity onPress={() => setOpenExperience(!openExperience)}>
                                <AntDesign 
                                    name={openExperience ? "up" : "down"} 
                                    size={20} 
                                    color="black" 
                                />
                            </TouchableOpacity>
                        </View>
                        {openExperience &&
                        <View className="flex flex-col flex-wrap gap-2">
                            {user?.experiences?.map((exp) => (
                                <ProfileExperienceCard
                                    key={exp.id} experience={exp} onEditExperience={() => {}}/>
                            ))}
                        </View>}
                    </View>
                    <View className="divider"/>
                   <View className="px-4 py-2">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Socials</Text>
                            <TouchableOpacity onPress={() => setOpenSocials(!openSocials)}>
                                <AntDesign 
                                    name={openSocials ? "up" : "down"} 
                                    size={20} 
                                    color="black" 
                                />
                            </TouchableOpacity>
                        </View>
                        {openSocials &&
                        <View className="flex flex-row flex-wrap gap-4">
                            <Text>Socials</Text> 
                        </View>}
                    </View>
                    <View className="divider"/>
                    <View className="px-4 py-2">
                        <View className="flex flex-row justify-between items-start">
                            <Text className="font-quicksand-bold text-xl">Portfolio</Text>
                            <TouchableOpacity onPress={() => setOpenPortfolio(!openPortfolio)}>
                                <AntDesign 
                                    name={openPortfolio ? "up" : "down"} 
                                    size={20} 
                                    color="black" 
                                    onPress={() => setOpenPortfolio(!openPortfolio)}
                                />
                            </TouchableOpacity>
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
                {(isAddingSkill || isEditingSkill) &&
                <>
                    {/* TODO: User should not be able to enter any skill. Create autocomplete feature for skills */}
                    <CustomInput 
                        label="Skill Name" 
                        placeholder={isAddingSkill ? "e.g. JavaScript" : (isEditingSkill?.skill.name!)} 
                        value={addSkillForm.skill}
                        autoCapitalize="words"
                        returnKeyType="done"
                        onChangeText={(skill) => setAddSkillForm({...addSkillForm, skill})}/>
                    <CustomInput 
                        label="Experience (in years)" 
                        placeholder={isAddingSkill ? "e.g. 3" : (isEditingSkill?.experience.toString()!)}
                        value={addSkillForm.experience.toString()}
                        returnKeyType="done" 
                        onChangeText={(experience) => setAddSkillForm({...addSkillForm, experience})}/>
                    <View className="flex flex-row gap-2">
                        <CustomButton
                            isLoading={isLoadingNewSkill}
                            text={isEditingSkill ? 'Update' : 'Add Skill'}
                            customClass="bg-green-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                            onClick={handleAddSkill}/>
                        <CustomButton 
                            text='Cancel'
                            customClass="bg-red-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                            onClick={handleCloseSkillsForm}/>
                    </View>
                </>}
                {(isAddingEducation || isEditingEducation) &&
                <>
                    <CustomInput 
                        label="Institution Name" 
                        placeholder="e.g. Harvard University"
                        autoCapitalize="words"
                        value={addEducationForm.institution} 
                        returnKeyType="done"
                        onChangeText={(institution) => setAddEducationForm({...addEducationForm, institution})}/>
                    <CustomInput 
                        label="Degree (Achieve or Pursuing)" 
                        placeholder="e.g. BASc in Computer Science"
                        autoCapitalize="words"
                        value={addEducationForm.degree}
                        returnKeyType="done" 
                        onChangeText={(degree) => setAddEducationForm({...addEducationForm, degree})}/>
                    <View className="flex flex-row gap-2">
                        <View className="w-1/2">
                            <CustomInput 
                                label="Start Year" 
                                placeholder="e.g. 2016" 
                                value={addEducationForm.fromYear}
                                returnKeyType="done" 
                                onChangeText={(fromYear) => setAddEducationForm({...addEducationForm, fromYear})}/>
                        </View>
                        <View className="w-1/2">
                            <CustomInput 
                                label="End Year (or expected)" 
                                placeholder="e.g. 2020 (leave empty if ongoing)" 
                                value={addEducationForm.toYear}
                                returnKeyType="done" 
                                onChangeText={(toYear) => setAddEducationForm({...addEducationForm, toYear})}/>
                        </View>
                    </View>
                        <View className="flex flex-row gap-2">
                            <CustomButton 
                                isLoading={isLoadingNewEducation}
                                text={isEditingEducation ? 'Update' : 'Add Education'}
                                customClass="bg-green-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                                onClick={() => {
                                    if (isEditingEducation) {
                                        handleEditEducation();
                                    } else {
                                        handleAddEducation();
                                    }
                                }}/>
                            <CustomButton 
                                text='Cancel'
                                customClass="bg-red-500 p-4 rounded-2xl shadow-md border border-gray-100 flex-1"
                                onClick={handleCloseEducationForm}/>
                        </View>
                </>}
            </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
