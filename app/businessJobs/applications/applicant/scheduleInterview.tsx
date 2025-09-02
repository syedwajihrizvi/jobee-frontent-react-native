import BackBar from '@/components/BackBar'
import { createInterview } from '@/lib/interviewEndpoints'
import useAuthStore from '@/store/auth.store'
import { BusinessUser, CreateInterviewForm } from '@/type'
import { AntDesign } from '@expo/vector-icons'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useQueryClient } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

const ScheduleInterview = () => {
  const defaultInterviewForm = {
    title: '',
    description: '',
    conductors: [],
    interviewDate: '',
    startTime: '',
    endTime: '',
    interviewType: 'ONLINE',
    timezone: '',
    location: '',
    meetingLink: '',
    phoneNumber: ''
  }
  const { applicantId, jobId, candidateId} = useLocalSearchParams()
  const queryClient = useQueryClient()
  const { user: authUser } = useAuthStore()
  const conductorNameRef = useRef<TextInput>(null);
  const conductorEmailRef = useRef<TextInput>(null);
  const addConductorBottomSheetRef = useRef<BottomSheet>(null)
  const [interviewDetails, setInterviewDetails] = useState<CreateInterviewForm>({...defaultInterviewForm})
  const [conductorName, setConductorName] = useState('');
  const [conductorEmail, setConductorEmail] = useState('');
  const [loadingNewInterview, setLoadingNewInterview] = useState(false);
  const [addedSelf, setAddedSelf] = useState(false);
  const user = authUser as BusinessUser | null

  const handleInterviewFormSubmit = async () => {
    const { title, description, conductors: conductors, interviewDate, interviewType, startTime, endTime, location } = interviewDetails
    if (!title) {
        Alert.alert('Error', 'Please enter interview title.')
        return
    }
    if (!description) {
        Alert.alert('Error', 'Please enter interview description.')
        return
    }
    if (conductors.length === 0) {
        Alert.alert('Error', 'Please add at least one conductor.')
        return
    }
    if (!interviewDate) {
        Alert.alert('Error', 'Please enter interview date.')
        return
    }
    if (!startTime) {
        Alert.alert('Error', 'Please enter interview start time.')
        return
    }
    if (!endTime) {
        Alert.alert('Error', 'Please enter interview end time.')
        return
    }
    if (interviewType === 'IN_PERSON' &&!location) {
        Alert.alert('Error', 'Please enter interview location.')
        return
    }
    if (interviewType === 'ONLINE' && !interviewDetails.meetingLink) {
        Alert.alert('Error', 'Please enter meeting link.')
        return
    }
    if (interviewType === 'PHONE' && !interviewDetails.phoneNumber) {
        Alert.alert('Error', 'Please enter phone number.')
        return
    }
    if (!interviewDetails.timezone) {
        Alert.alert('Error', 'Please enter timezone.')
        return
    }
    setLoadingNewInterview(true)
    try {
        const res = await createInterview(
            interviewDetails, Number(jobId), 
            Number(candidateId),
            Number(applicantId)
        )
        if (res) {
            Alert.alert('Success', 'Interview created successfully.')
            console.log("Invalidating applicant query for applicantId:", applicantId);
            queryClient.invalidateQueries({queryKey: ['applicant', Number(applicantId)]})
            setTimeout(() => {
                setInterviewDetails({...defaultInterviewForm})
                router.back()
            }, 2000)
            return
        }
        Alert.alert('Error', 'Error creating interview. Please try again.')
        return
    } catch (error) {
        console.log(error)
        return
    } finally {
        setLoadingNewInterview(false)
    }
  }

  const addBusinessUserToConductors = () => {
    if (user) {
        const { firstName, lastName, email } = user
        const currInterviewConductors = interviewDetails?.conductors || []
        currInterviewConductors.push({ name: `${firstName} ${lastName}`, email })
        setInterviewDetails((prev) => ({...prev, conductors: currInterviewConductors}))
        setAddedSelf(true)
    }
  }

  const removeBusinessUserFromConductors = () => {
    if (user) {
        const { firstName, lastName, email } = user
        const fullName = firstName + " " + lastName
        const index = interviewDetails?.conductors.findIndex(conductor => conductor.email === email && conductor.name === fullName)
        if (index > -1) {
            const currInterviewConductors = interviewDetails?.conductors || []
            currInterviewConductors.splice(index, 1)
            setInterviewDetails((prev) => ({...prev, conductors: currInterviewConductors}))
            setAddedSelf(false)
        }
        setAddedSelf(false)
    }
  }

  const addConductorToConductors = () => {
    console.log(conductorName, conductorEmail)
    const currInterviewConductors = interviewDetails?.conductors || []
    const index = currInterviewConductors.findIndex(conductor => conductor.email === conductorEmail && conductor.name === conductorName)
    if (index > -1) {
        Alert.alert('Error', 'This conductor is already added.')
        return
    }
    currInterviewConductors.push({ name: conductorName, email: conductorEmail })
    setInterviewDetails((prev) => ({...prev, conductors: currInterviewConductors}))
    setConductorEmail('')
    setConductorName('')
    conductorEmailRef.current?.clear()
    conductorNameRef.current?.clear()
    addConductorBottomSheetRef.current?.close()
  }

  const closeAddConductorBottomSheet = () => {
    setConductorEmail('')
    setConductorName('')
    conductorEmailRef.current?.clear()
    conductorNameRef.current?.clear()
    addConductorBottomSheetRef.current?.close()
  }

  const renderInterviewTypeButtonClass = (type: string) => {
    const baseColor = interviewDetails.interviewType === type ? 'bg-green-100' : 'border border-black'
    return `${baseColor} px-4 py-2 rounded-full flex-row items-center gap-1`
  }

  return (
        <SafeAreaView className='flex-1 bg-white'>
            <BackBar label="Schedule Interview"/>
            <KeyboardAvoidingView
                style={{ flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0} 
            >
            <ScrollView 
                contentContainerStyle={{ paddingBottom: 10 }} 
                keyboardShouldPersistTaps='handled' 
                showsVerticalScrollIndicator={false}>
                <View className='flex flex-col gap-4 mt-4 p-4'>
                    <View className='form-input'>
                        <Text className='form-input__label'>Title</Text>
                        <TextInput
                            placeholder="eg. Technical Interview"
                            value={interviewDetails?.title}
                            onFocus={() => addConductorBottomSheetRef.current?.close()}
                            onChangeText={(text) => setInterviewDetails((prev) => ({...prev, title: text}))}
                            className="form-input__input"
                        />
                    </View>
                    <View className='form-input'>
                        <Text className='form-input__label'>Interview Description</Text>
                        <TextInput
                            placeholder="eg. Discuss project experience and technical skills"
                            className="form-input__input"
                            onFocus={() => addConductorBottomSheetRef.current?.close()}
                            value={interviewDetails?.description}
                            onChangeText={(text) => setInterviewDetails((prev) => ({...prev, description: text}))}
                            multiline={true}
                            blurOnSubmit={true}
                            textAlignVertical="top"
                            />
                    </View>
                    <View className='form-input'>
                        <Text className='form-input__label'>Conducted By</Text>
                        <View className='flex-row items-center gap-2'>
                            {!addedSelf ? <TouchableOpacity 
                                className="bg-green-100 px-4 py-2 rounded-full flex-row items-center gap-1"
                                onPress={addBusinessUserToConductors}>
                                <Text className="font-quicksand-medium text-black text-sm">Add Yourself</Text>
                                <AntDesign name="plus" size={12} color="black" />
                            </TouchableOpacity> : <TouchableOpacity 
                                className="bg-red-100 px-4 py-2 rounded-full flex-row items-center gap-1"
                                onPress={removeBusinessUserFromConductors}>
                                <Text className="font-quicksand-medium text-black text-sm">Remove Yourself</Text>
                                <AntDesign name="minus" size={12} color="black" />
                            </TouchableOpacity>}
                            <TouchableOpacity 
                                className="bg-green-100 px-4 py-2 rounded-full flex-row items-center gap-1"
                                onPress={() => addConductorBottomSheetRef.current?.expand()}>
                                <Text className="font-quicksand-medium text-black text-sm">Add Conductor</Text>
                                <AntDesign name="plus" size={12} color="black" />
                            </TouchableOpacity>           
                        </View>
                        {interviewDetails.conductors && interviewDetails.conductors.length > 0 && <View>
                            {interviewDetails.conductors.map((conductor, index) => {
                                return (
                                    <Text key={index}>
                                        {conductor.name} | {conductor.email}
                                    </Text>
                                )
                            })}
                        </View>}

                    </View>
                    <View className='flex-row gap-2 items-center justify-between'>
                        <View className='form-input w-1/2'>
                            <Text className='form-input__label'>Date</Text>
                            <TextInput
                                placeholder="eg. YYYY-MM-DD"
                                onFocus={() => addConductorBottomSheetRef.current?.close()}
                                value={interviewDetails?.interviewDate}
                                onChangeText={(text) => setInterviewDetails((prev) => ({...prev, interviewDate: text}))}
                                className="form-input__input"
                            />
                        </View>
                        <View className='form-input w-1/2'>
                            <Text className='form-input__label'>Start Time</Text>
                            <TextInput
                                value={interviewDetails?.startTime}
                                onFocus={() => addConductorBottomSheetRef.current?.close()}
                                placeholder="eg. 10:00 AM"
                                onChangeText={(text) => setInterviewDetails((prev) => ({...prev, startTime: text}))}
                                className="form-input__input"
                            />
                        </View>
                    </View>
                    <View className='flex-row gap-2 items-center justify-between'>
                        <View className='form-input w-1/2'>
                            <Text className='form-input__label'>End Time</Text>
                            <TextInput
                                value={interviewDetails?.endTime}
                                onFocus={() => addConductorBottomSheetRef.current?.close()}
                                placeholder="eg. 12:00 PM"
                                onChangeText={(text) => setInterviewDetails((prev) => ({...prev, endTime: text}))}
                                className="form-input__input"
                            />
                        </View>
                        <View className='form-input w-1/2'>
                            <Text className='form-input__label'>Timezone</Text>
                            <TextInput
                                value={interviewDetails?.timezone}
                                onFocus={() => addConductorBottomSheetRef.current?.close()}
                                placeholder="eg. EST, PST"
                                onChangeText={(text) => setInterviewDetails((prev) => ({...prev, timezone: text}))}
                                className="form-input__input"
                            />
                        </View>
                    </View>
                    <View className='form-input'>
                        <Text className='form-input__label'>Interview Type</Text>
                        <View className='flex-row flex-wrap gap-2'>
                            <TouchableOpacity
                                className={renderInterviewTypeButtonClass('IN_PERSON')}
                                onPress={() => setInterviewDetails((prev) => ({...prev, interviewType: 'IN_PERSON'}))}>
                                <Text className='font-quicksand-medium text-sm'>In-Person</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={renderInterviewTypeButtonClass('ONLINE')}
                                onPress={() => setInterviewDetails((prev) => ({...prev, interviewType: 'ONLINE'}))}>
                                <Text className='font-quicksand-medium text-sm'>Online</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={renderInterviewTypeButtonClass('PHONE')}
                                onPress={() => setInterviewDetails((prev) => ({...prev, interviewType: 'PHONE'}))}>
                                <Text className='font-quicksand-medium text-sm'>Phone</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className='form-input__label mt-4'>Additional Details</Text>
                        {interviewDetails.interviewType === 'IN_PERSON' && 
                        <TextInput
                            value={interviewDetails?.location}
                            onFocus={() => addConductorBottomSheetRef.current?.close()}
                            placeholder="eg. 123 Main St, City, State"
                            onChangeText={(text) => setInterviewDetails((prev) => ({...prev, location: text}))}
                            className="form-input__input mt-2"
                        />}
                        {interviewDetails.interviewType === 'PHONE' && 
                        <TextInput
                            value={interviewDetails?.location}
                            onFocus={() => addConductorBottomSheetRef.current?.close()}
                            placeholder="eg. +1 234 567 8901"
                            onChangeText={(text) => setInterviewDetails((prev) => ({...prev, phoneNumber: text}))}
                            className="form-input__input mt-2"
                        />}
                        {interviewDetails.interviewType === 'ONLINE' && 
                        <TextInput
                            value={interviewDetails?.meetingLink}
                            onFocus={() => addConductorBottomSheetRef.current?.close()}
                            placeholder="eg. https://zoom.us/j/1234567890"
                            onChangeText={(text) => setInterviewDetails((prev) => ({...prev, meetingLink: text}))}
                            className="form-input__input mt-2"
                        />}
                    </View>
                    <View className='flex-row justify-center items-center gap-2 pt-6'>
                        <TouchableOpacity 
                            className='apply-button w-1/2 items-center justify-center h-14'
                            onPress={handleInterviewFormSubmit}
                        >
                            <Text className='font-quicksand-semibold text-lg'>Done</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='apply-button w-1/2 items-center justify-center h-14'>
                            <Text className='font-quicksand-semibold text-lg'>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <BottomSheet ref={addConductorBottomSheetRef} index={-1} snapPoints={["60%", "70%"]} enablePanDownToClose>
                    <BottomSheetView className='flex-1 bg-white p-4'>
                        <View className='flex flex-col gap-4'>
                            <View className='form-input'>
                                <Text>Full Name</Text>
                                <TextInput
                                    ref={conductorNameRef}
                                    value={conductorName}
                                    autoCapitalize='words'
                                    onChangeText={(text) => setConductorName(text)}
                                    placeholder="eg. Mike Wilson, Emma Johnson"
                                    className="form-input__input"/>
                            </View>
                            <View className='form-input'>
                                <Text>Email</Text>
                                <TextInput
                                    ref={conductorEmailRef}
                                    value={conductorEmail}
                                    autoCapitalize='none'
                                    onChangeText={(text) => setConductorEmail(text)}
                                    placeholder="eg. mike.wilson@example.com"
                                    className="form-input__input"/>
                            </View> 
                            <View className='flex-row justify-center items-center px-2 gap-2'>
                                <TouchableOpacity 
                                    className='apply-button w-1/2 items-center justify-center h-14 mt-2'
                                    onPress={addConductorToConductors}>
                                    <Text className='font-quicksand-medium text-black text-lg'>Done</Text>
                                </TouchableOpacity> 
                                <TouchableOpacity 
                                    className='apply-button w-1/2 items-center justify-center h-14 mt-2'
                                    onPress={closeAddConductorBottomSheet}>
                                    <Text className='font-quicksand-medium text-black text-lg'>Cancel</Text>
                                </TouchableOpacity> 
                            </View> 
                        </View>   
                    </BottomSheetView>
                </BottomSheet>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
  )
}

export default ScheduleInterview