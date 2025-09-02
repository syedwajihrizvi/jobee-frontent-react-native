import BackBar from '@/components/BackBar'
import DocumentModal from '@/components/DocumentModal'
import UserVideoIntro from '@/components/UserVideoIntro'
import { images } from '@/constants'
import { shortListCandidate, unshortListCandidate } from '@/lib/jobEndpoints'
import { useShortListedCandidatesForJob } from '@/lib/services/useJobs'
import { useApplicant } from '@/lib/services/useProfile'
import { AntDesign, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ApplicantForBusiness = () => {
  const queryClient = useQueryClient()
  const { id } = useLocalSearchParams()
  const { data: application, isLoading } = useApplicant(Number(id))
  const { data: shortListedCandidates } = useShortListedCandidatesForJob(Number(application?.jobId))
  const { userProfile } = application || {}
  const [showSkills, setShowSkills] = useState(false)
  const [showExperience, setShowExperience] = useState(false)
  const [showEducation, setShowEducation] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [showCertificates, setShowCertificates] = useState(false)
  const [makingShortListRequest, setMakingShortListRequest] = useState(false)
  const [isShortListed, setIsShortListed] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<string | undefined>()

  useEffect(() => {
    if (shortListedCandidates && application) {
      setIsShortListed(shortListedCandidates?.includes(application?.id) || false)
    }
  }, [shortListedCandidates, application])

  console.log("Application Data:", application);
  const handleShortList = async () => {
    if (!application) return
    setMakingShortListRequest(true)
    try {
        const result = await shortListCandidate({applicationId: application.id})
        if (result) {
            Alert.alert('Success', 'Candidate added to shortlist successfully.')
            setIsShortListed(true)
            queryClient.invalidateQueries({ queryKey: [application.jobId, 'shortlist'] })
        } else {
            Alert.alert('Error', 'Failed to add candidate to shortlist.')
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to add candidate to shortlist.')
    } finally {
        setMakingShortListRequest(false)
    }
  }

  const handleResumePress = () => {
    setViewingDocument(application?.resumeUrl)
  }

  const handleCoverLetterPress = () => {
    setViewingDocument(application?.coverLetterUrl)
  }

  const handleUnshortList = async () => {
    if (!application) return
    setMakingShortListRequest(true)
    try {
        const result = await unshortListCandidate({applicationId: application.id})
        if (result) {
            Alert.alert('Success', 'Candidate removed from shortlist successfully.')
            setIsShortListed(false)
            queryClient.invalidateQueries({ queryKey: [application.jobId, 'shortlist'] })
        } else {
            Alert.alert('Error', 'Failed to remove candidate from shortlist.')
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to remove candidate from shortlist.')
    } finally {
        setMakingShortListRequest(false)
    }

  }

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
            <View className="flex-row flex-wrap gap-3 mt-2">
                <TouchableOpacity 
                    className="bg-green-100 px-4 py-2 rounded-full"
                    onPress={handleResumePress}>
                    <Text className="font-quicksand-medium text-black text-sm">View Resume</Text>
                </TouchableOpacity>
                {application?.coverLetterUrl &&<TouchableOpacity 
                    className="bg-green-100 px-4 py-2 rounded-full"
                    onPress={handleCoverLetterPress}>
                    <Text className="font-quicksand-medium text-black text-sm">View Cover Letter</Text>
                </TouchableOpacity>}
            </View>
            {
            application?.status === 'PENDING' ?
             <TouchableOpacity 
                className="bg-blue-100 px-4 py-2 rounded-full w-2/5 mt-2 flex-row items-start gap-1 justify-center"
                onPress={() => (
                    router.push(`/businessJobs/applications/applicant/scheduleInterview?applicantId=${application?.id}&jobId=${application?.jobId}&candidateId=${application.userProfile.id}`)
                )}>
                <Text className="font-quicksand-medium text-black text-sm">Schedule Interview</Text>
            </TouchableOpacity> :
             <TouchableOpacity 
                className="bg-blue-100 px-4 py-2 rounded-full w-2/5 mt-2 flex-row items-start gap-1 justify-center"
                onPress={() => (
                    console.log('View interview details via bottom sheet')
                )}>
                <Text className="font-quicksand-medium text-black text-sm">Interview Scheduled</Text>
            </TouchableOpacity>
            }
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
            <TouchableOpacity 
                className='apply-button w-1/2 items-center justify-center h-14'
                onPress={isShortListed ? handleUnshortList : handleShortList}
                disabled={makingShortListRequest}>
                {makingShortListRequest ? 
                <ActivityIndicator color="white" /> : 
                <Text className='font-quicksand-semibold text-lg'>
                    {isShortListed ? "Unshortlist" : "Shortlist"}
                </Text>}
            </TouchableOpacity>
        </View>
      </>}
      {viewingDocument &&
      <DocumentModal
        documentType='User Document'
        documentUrl={viewingDocument}
        visible={!!viewingDocument}
        handleClose={() => setViewingDocument(undefined)}
      />}
    </SafeAreaView>
  )
}

export default ApplicantForBusiness