import BackBar from '@/components/BackBar'
import UserVideoIntro from '@/components/UserVideoIntro'
import { images } from '@/constants'
import { useApplicant } from '@/lib/services/useProfile'
import { AntDesign, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ApplicantForBusiness = () => {
  const { id } = useLocalSearchParams()
  const { data: application, isLoading } = useApplicant(Number(id))
  const { userProfile } = application || {}
  const [showSkills, setShowSkills] = useState(false)
  const [showExperience, setShowExperience] = useState(false)
  const [showEducation, setShowEducation] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [showCertificates, setShowCertificates] = useState(false)

  return (
    <SafeAreaView className='flex-1 bg-white relative'>
      {isLoading ? 
      <>
        <BackBar label="Back"/>
        <ActivityIndicator size="large" className='mt-10' />
      </> : 
      <>
      <BackBar label="Applicant Details"/>
      <ScrollView className='p-4'>
        <View className='flex- flex-row items-center justify-between'>
            <View className='flex flex-row items-start gap-2'>
                <Image source={{uri: images.companyLogo}} className='size-14 rounded-full' resizeMode='contain' />
                <View>
                    <Text className='font-quicksand-bold text-xl'>{userProfile?.firstName} {userProfile?.lastName}</Text>
                    <Text className='font-quicksand-medium text-md text-gray-600'>
                        {userProfile?.title} | {userProfile?.location}
                    </Text>
                </View>
            </View>
        </View>
        <View>
            <Text className='font-quicksand-semibold text-lg'>Professional Summary</Text>
            <Text className='font-quicksand-medium text-md text-gray-600'>{userProfile?.summary}</Text>
            <View className="flex-row gap-3 mt-2">
                <TouchableOpacity className="bg-blue-100 px-4 py-2 rounded-full">
                <Text className="font-quicksand-medium text-blue-800 text-sm">View Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-blue-100 px-4 py-2 rounded-full">
                <Text className="font-quicksand-medium text-blue-800 text-sm">View Cover Letter</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View className='divider'/>
        <View>
            <TouchableOpacity onPress={() => setShowSkills(!showSkills)}>
                <View className='flex-row justify-between items-center'>
                    <View className='flex-row items-center gap-2'>
                        <Text className='font-quicksand-semibold text-lg'>Skills</Text>
                        <Ionicons name="bulb" size={16} color="black" />
                    </View>
                    <AntDesign name={showSkills ? "up" : "down"} size={16} color="black" />
                </View>
            </TouchableOpacity>
            {showSkills &&<View className='flex-row flex-wrap gap-2'>
                {userProfile?.skills.map(skill => (
                    <View key={skill.id} className='bg-blue-100 px-3 py-1 rounded-full'>
                        <Text className='text-blue-800 font-quicksand-medium'>{skill.skill.name}</Text>
                    </View>
                ))}
            </View>}
        </View>
        <View className='divider'/>
        <View>
            <TouchableOpacity onPress={() => setShowExperience(!showExperience)}>
                <View className='flex-row justify-between items-center'>
                    <View className='flex-row items-center gap-2'>
                        <Text className='font-quicksand-semibold text-lg'>Work Experience</Text>
                        <FontAwesome5 name="briefcase" size={16} color="black" />
                    </View>
                    <AntDesign name={showExperience ? "up" : "down"} size={16} color="black" />
                </View>
            </TouchableOpacity>
            {showExperience && userProfile?.experiences.map(exp => (
                <View key={exp.id} className='mb-2'>
                    <Text className='font-quicksand-bold text-md'>{exp.title} at {exp.company}</Text>
                    <Text className='font-quicksand-medium text-sm text-gray-600'>{exp.from} - {exp.to || 'Present'}</Text>
                    <Text className='font-quicksand-regular text-base mt-1'>{exp.description}</Text>
                </View>
            ))}
        </View>
        <View className='divider'/>
        <View>
            <TouchableOpacity onPress={() => setShowEducation(!showEducation)}>
                <View className='flex-row justify-between items-center'>
                    <View className='flex-row items-center gap-2'>
                        <Text className='font-quicksand-semibold text-lg'>Education</Text>
                        <FontAwesome name="university" size={16} color="black" />
                    </View>
                    <AntDesign name={showEducation ? "up" : "down"} size={16} color="black" />
                </View>
            </TouchableOpacity>
            {showEducation && userProfile?.education.map(edu => (
                <View key={edu.id} className='mb-2'>
                    <Text className='font-quicksand-bold text-md'>{edu.degree}</Text>
                    <Text className='font-quicksand-medium text-sm text-gray-600'>{edu.institution} | {edu.fromYear} - {edu.toYear || 'Present'}</Text>
                </View>
            ))}
        </View>
        <View className='divider'/>
        <View>
            <TouchableOpacity onPress={() => setShowProjects(!showProjects)}>
                <View className='flex-row justify-between items-center'>
                    <View className='flex-row items-center gap-2'>
                        <Text className='font-quicksand-semibold text-lg'>Projects</Text>
                        <FontAwesome5 name="project-diagram" size={16} color="black" />
                    </View>
                    <AntDesign name={showProjects ? "up" : "down"} size={16} color="black" />
                </View>
            </TouchableOpacity>
        </View>
        <View className='divider'/>
        <View>
            <TouchableOpacity onPress={() => setShowCertificates(!showCertificates)}>
                <View className='flex-row justify-between items-center'>
                    <View className='flex-row items-center gap-2'>
                        <Text className='font-quicksand-semibold text-lg'>Certificates & Awards</Text>
                        <FontAwesome5 name="award" size={16} color="black" />
                    </View>
                    <AntDesign name={showCertificates ? "up" : "down"} size={16} color="black" />
                </View>
            </TouchableOpacity>
        </View>
        <View className='mt-4'>
            <UserVideoIntro videoSource='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'/>
        </View>
      </ScrollView>
        <View className='w-full absolute bottom-0 bg-slate-100 p-4 pb-10 flex-row gap-2 items-center justify-center'>
            <TouchableOpacity className='apply-button w-1/2 items-center justify-center h-14'>
                <Text className='font-quicksand-semibold text-lg'>Contact Applicant</Text>
            </TouchableOpacity>
            <TouchableOpacity className='apply-button w-1/2 items-center justify-center h-14'>
                <Text className='font-quicksand-semibold text-lg'>Shortlist</Text>
            </TouchableOpacity>
        </View>
      </>}
    </SafeAreaView>
  )
}

export default ApplicantForBusiness