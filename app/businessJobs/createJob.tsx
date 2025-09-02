import BackBar from '@/components/BackBar'
import { createJob } from '@/lib/jobEndpoints'
import useAuthStore from '@/store/auth.store'
import { BusinessUser, CreateJobForm } from '@/type'
import { useQueryClient } from '@tanstack/react-query'
import React, { useRef, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'

const CreateJob = () => {
  const queryClient = useQueryClient()
  const defaultJobForm: CreateJobForm = {
    title: '',
    location: '',
    description: '',
    minSalary: '',
    maxSalary: '',
    experience: '',
    employmentType: '',
    tags: []
  } 
  const { user: authUser } = useAuthStore();
  const [createJobForm, setCreateJobForm] = useState<CreateJobForm>(defaultJobForm);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addingJob, setAddingJob] = useState(false);
  const tagInputRef = useRef<TextInput>(null)

  const user = authUser as BusinessUser | null
  const handleCreateJob = async () => {
    const { title, location, description, minSalary, maxSalary, experience, employmentType, tags } = createJobForm;
    if (!title || !location || !description || !minSalary || !maxSalary || !experience || !employmentType) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (isNaN(Number(minSalary)) || isNaN(Number(maxSalary)) || isNaN(Number(experience))) {
      Alert.alert('Error', 'Please enter valid numbers for salary and experience');
      setAddingJob(false);
      return;
    }
    if (Number(minSalary) < 0 || Number(maxSalary) < 0 || Number(experience) < 0) {
      Alert.alert('Error', 'Salary and experience cannot be negative');
      setAddingJob(false);
      return;
    }
    if (Number(minSalary) > Number(maxSalary)) {
      Alert.alert('Error', 'Minimum salary cannot be greater than maximum salary');
      setAddingJob(false);
      return;
    }
    if (tags.length === 0) {
      Alert.alert('Error', 'Please enter at least one skill');
      setAddingJob(false);
      return;
    }
    console.log("Creating Job with data:", createJobForm);
    setAddingJob(true);
    try {
        const result = await createJob(createJobForm, user?.id!);
        if (!result) {
            Alert.alert('Error', 'Failed to create job. Please try again.');
            return
        }
        Alert.alert('Success', 'Job created successfully');
        setCreateJobForm({...defaultJobForm});
        queryClient.invalidateQueries({queryKey: ['jobs', 'company', user?.companyId]})
        tagInputRef.current?.clear();
    } catch (error) {
        Alert.alert('Error', 'Failed to create job. Please try again.');
        return
    } finally {
        setAddingJob(false);
    }
  }

  const handleAddTag = (tag: string) => {
    if (tag && !createJobForm.tags.includes(tag)) {
      setCreateJobForm({...createJobForm, tags: [...createJobForm.tags, tag]})
    }
    tagInputRef.current?.clear();
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
        <BackBar label="Create Job"/>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : "height"}// adjust depending on header height
      >
        <ScrollView
          contentContainerStyle={{ padding: 10 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View className='p-4 flex flex-col gap-4'>
        <View className='form-input'>
            <Text className='form-input__label'>Title</Text>
            <TextInput 
                className='form-input__input'
                value={createJobForm.title}
                onChangeText={(text) => setCreateJobForm({...createJobForm, title: text})}
                placeholder="eg. Software Engineer"
            />
        </View>
        <View className='form-input'>
            <Text className='form-input__label'>Location</Text>
            <TextInput 
                className='form-input__input'
                value={createJobForm.location}
                onChangeText={(text) => setCreateJobForm({...createJobForm, location: text})}
                placeholder="eg. New York, NY"
            />
        </View>
        <View className='form-input'>
            <Text className='form-input__label'>Description</Text>
            <TextInput
                placeholder="eg. We are looking for a skilled software engineer to join our team..."
                className="form-input__input"
                multiline={true}
                blurOnSubmit={true}
                textAlignVertical="top"
                value={createJobForm.description}
                onChangeText={(text) => setCreateJobForm({...createJobForm, description: text})}
                />
        </View>
        <View className='form-input'>
            <Text className='form-input__label'>Minimum Experience (in years)</Text>
            <TextInput 
                className='form-input__input w-1/2'
                placeholder='eg. 3'
                value={createJobForm.experience}
                onChangeText={(text) => setCreateJobForm({...createJobForm, experience: text})}
                keyboardType='numeric'/>
        </View>
        <View className='form-input'>
            <Text className='form-input__label'>Employment Type</Text>
            <DropDownPicker
                open={dropdownOpen}
                value={createJobForm.employmentType}
                items={[
                    {label: 'Full-time', value: 'FULL_TIME'},
                    {label: 'Part-time', value: 'PART_TIME'},
                    {label: 'Contract', value: 'CONTRACT'},
                    {label: 'Intern', value: 'INTERN'},
                    {label: 'Freelance', value: 'FREELANCE'},
                ]}
                setOpen={setDropdownOpen}
                setValue={(callback) => {
                    const value = typeof callback === 'function' ? callback(createJobForm.employmentType) : callback;
                    setCreateJobForm({...createJobForm, employmentType: value});
                }}
                containerStyle={{width: '75%'}}
                style={{borderColor: '#000'}}
        />
        </View>
        <View className='flex flex-row gap-2'>
            <View className='w-1/2 form-input'>
                <Text className='form-input__label'>Min Salary</Text>
                <TextInput
                    value={createJobForm.minSalary}
                    onChangeText={(text) => setCreateJobForm({...createJobForm, minSalary: text})}
                    className='form-input__input'
                    placeholder='eg. 80000'/>
            </View>
            <View className='w-1/2 form-input'>
                <Text className='form-input__label'>Max Salary</Text>
                <TextInput
                    value={createJobForm.maxSalary}
                    onChangeText={(text) => setCreateJobForm({...createJobForm, maxSalary: text})}
                    className='form-input__input'
                    placeholder='eg. 120000'/>
            </View>
        </View>
        <View className='flex flex-col gap-2'>
            <View className='form-input'>
                <Text className='form-input__label'>Skills</Text>
                <TextInput
                    className='form-input__input'
                    onSubmitEditing={(event) => handleAddTag(event.nativeEvent.text.trim())}
                    ref={tagInputRef}
                    placeholder='eg. JavaScript, React, Node.js'/>
            </View>
            {
            createJobForm.tags.length > 0 
            && 
            <View className='flex-row flex-wrap gap-2'>
                {createJobForm.tags.map((tag) => (
                    <View key={tag} className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-800 font-quicksand-medium">{tag}</Text>
                    </View>
                ))}
            </View>}
        </View>
            <View className='flex-row justify-center items-center gap-2'>
            <TouchableOpacity 
                className='mt-6 apply-button px-6 py-3 w-1/2 rounded-full flex items-center justify-center'
                onPress={handleCreateJob}
                disabled={addingJob}
                >
                {addingJob ? 
                <ActivityIndicator size="small" color="#ffffff" /> : 
                <Text className='font-quicksand-semibold text-md text-white'>
                    Create Job
                </Text>
                }
            </TouchableOpacity>
            <TouchableOpacity 
                className='mt-6 apply-button px-6 py-3 w-1/2 rounded-full flex items-center justify-center'>
                <Text className='font-quicksand-semibold text-md text-white'>
                    Cancel
                </Text>
            </TouchableOpacity>
            </View>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default CreateJob