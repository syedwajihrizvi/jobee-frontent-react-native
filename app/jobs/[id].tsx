import ApplicationInfo from '@/components/ApplicationInfo'
import ApplyBottomSheet from '@/components/ApplyBottomSheet'
import BoldLabeledText from '@/components/BoldLabeledText'
import CompanyInfo from '@/components/CompanyInfo'
import CompanyInformation from '@/components/CompanyInformation'
import FavoriteJob from '@/components/FavoriteJob'
import JobInfo from '@/components/JobInfo'
import ViewMore from '@/components/ViewMore'
import { UserDocumentType } from '@/constants'
import { applyToJob } from '@/lib/jobEndpoints'
import { useJob } from '@/lib/services/useJobs'
import { isApplied } from '@/lib/utils'
import useAuthStore from '@/store/auth.store'
import { CreateApplication, User, UserDocument } from '@/type'
import AntDesign from '@expo/vector-icons/AntDesign'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const JobDetails = () => {
  const { id: jobId } = useLocalSearchParams()
  const { user, isAuthenticated, isLoading: isLoadingUser } = useAuthStore()
  const {data:job, isLoading} = useJob(Number(jobId))
  const [openResumeDropdown, setOpenResumeDropdown] = useState(false);
  const [openCoverLetterDropdown, setOpenCoverLetterDropdown] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string | null>(null);
  const jobBottomRef = useRef<BottomSheet>(null)
  const companyBottomRef = useRef<BottomSheet>(null)
  const applyBottomRef = useRef<BottomSheet>(null)
  const viewApplicationBottomRef = useRef<BottomSheet>(null)
  const [userDocuments, setUserDocuments] = useState<{'RESUMES': UserDocument[], 'COVER_LETTERS': UserDocument[]} | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  useEffect(() => {
    if (user && (user as User).documents) {
      const resumes = (user as User).documents.filter(doc => doc.documentType === UserDocumentType.RESUME);
      const coverLetters = (user as User).documents.filter(doc => doc.documentType === UserDocumentType.COVER_LETTER);
      setUserDocuments({
        'RESUMES': resumes,
        'COVER_LETTERS': coverLetters
      });
      if (resumes.length > 0) {
        setSelectedResume(String(resumes[0].id));
      }
    }
  }, [isLoadingUser, user])

  const handleJobBottomOpen = () => {
    companyBottomRef.current?.close();
    applyBottomRef.current?.close();
    viewApplicationBottomRef.current?.close();
    jobBottomRef.current?.expand();
  }

  const handleCompanyBottomOpen = () => {
    jobBottomRef.current?.close();
    applyBottomRef.current?.close();
    viewApplicationBottomRef.current?.close();
    companyBottomRef.current?.expand();
  }

  const handleApplyBottomOpen = () => {
    companyBottomRef.current?.close();
    jobBottomRef.current?.close();
    viewApplicationBottomRef.current?.close();
    applyBottomRef.current?.expand();
  }
  
  const handleViewApplicationBottomOpen = () => {
    companyBottomRef.current?.close();
    jobBottomRef.current?.close();
    applyBottomRef.current?.close();
    viewApplicationBottomRef.current?.expand();
  }

  const handleSubmitApplication = async () => {
    if (!selectedResume) {
      Alert.alert('Please select a resume to proceeed.')
      return
    }
    setIsSubmittingApplication(true);
    try {
      const applicationInfo : CreateApplication = {
        jobId: Number(jobId),
        resumeDocumentId: Number(selectedResume),
        coverLetterDocumentId: selectedCoverLetter ? Number(selectedCoverLetter) : undefined
      }
        
      await applyToJob(applicationInfo)
      Alert.alert('Application submitted successfully!')
      applyBottomRef.current?.close();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('Failed to submit application. Please try again.')
      return
    } finally {
      setIsSubmittingApplication(false);
    }
  }

  const application = isApplied((user as User)!, String(jobId));

  return (
    <SafeAreaView className='flex-1 bg-white relative'>
      <View className='w-full flex-row px-4'>
        <TouchableOpacity onPress={() => router.back()} >
          <AntDesign name="arrowleft" size={24} color="black"/>
        </TouchableOpacity>
      </View>
      {isLoading ? <ActivityIndicator/> : 
      <View className='w-full p-4'>
      <View>
        <View className='w-full flex-row items-center justify-between'>
          <CompanyInformation company={job?.businessName!} />
          <FavoriteJob jobId={job?.id!} />
        </View>
        <Text className='font-quicksand-bold text-2xl'>{job?.title}</Text>
        <Text className='font-quicksand-semibold text-sm'>{job?.location}</Text>
      </View>
      <View className='divider'/>
      <View className='flex-col gap-1'>
        <Text className='font-quicksand-bold text-2xl'>Job Description</Text>
        <Text className='font-quicksand-semibold text-base'>{job?.description}</Text>
        <View className='mt-2 flex-col gap-2'>
          <BoldLabeledText label="Location" value={job?.location!} />
          <BoldLabeledText label="Salary" value={`$${job?.minSalary} - $${job?.maxSalary} per year`}/>
          <BoldLabeledText label="Experience" value={job?.experience.toLocaleString()!} />
          <BoldLabeledText label="Employment Type" value={job?.employmentType!} />
          <BoldLabeledText label="Posted On" value="August 1st 2025"/>
          <BoldLabeledText label="Apply By" value="August 31st 2025"/>
        </View>
        <ViewMore label="View More About Job" onClick={handleJobBottomOpen} />
        <View className='divider'/>
        <View className='flex-col gap-2'>
          <Text className='font-quicksand-bold text-2xl'>Company Overview</Text>
          <BoldLabeledText label="Business Name" value={job?.businessName!} />
          <BoldLabeledText label="Employee Count" value={"10000+"}/>
          <BoldLabeledText label="Founded" value={"2005"}/>
          <BoldLabeledText label="Industry" value={"Information Technology and Services"}/>
          <BoldLabeledText label="Website" value={"www.example.com"}/>
        </View>
        <ViewMore label="View More About Company" onClick={handleCompanyBottomOpen} />
        <View className='divider'/>
      </View>
      </View>}
      <View className="w-full absolute bottom-0 bg-slate-100 p-4 pb-10 flex-row gap-2 items-center justify-center">
        <TouchableOpacity 
          className='apply-button w-4/6 items-center justify-center h-14'
          onPress={application ? handleViewApplicationBottomOpen : handleApplyBottomOpen}>
          <Text className='font-quicksand-semibold text-md'>
            {application ? 'View Application Status' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className='favorite-button h-14 w-1/6 items-center justify-center'>
          <FavoriteJob jobId={job?.id!} />
        </TouchableOpacity>
      </View>
      
      <BottomSheet ref={jobBottomRef} index={-1} snapPoints={["40%", "50%"]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          <JobInfo/>
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet ref={companyBottomRef} index={-1} snapPoints={["40%", "50%"]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          <CompanyInfo/>
        </BottomSheetView>
      </BottomSheet>
      {application && <BottomSheet ref={viewApplicationBottomRef} index={-1} snapPoints={["50%"]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          <ApplicationInfo job={job!} application={application!}/>
        </BottomSheetView>
      </BottomSheet>}
      <BottomSheet ref={applyBottomRef} index={-1} snapPoints={[`${isAuthenticated ? '65' : '30'}%`]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          {(isAuthenticated && user) ?
          <ApplyBottomSheet
            selectedResume={selectedResume} setSelectedResume={setSelectedResume} openResumeDropdown={openResumeDropdown}
            setOpenResumeDropdown={setOpenResumeDropdown} selectedCoverLetter={selectedCoverLetter} setSelectedCoverLetter={setSelectedCoverLetter}
            openCoverLetterDropdown={openCoverLetterDropdown} setOpenCoverLetterDropdown={setOpenCoverLetterDropdown} userDocuments={userDocuments}
            isSubmittingApplication={isSubmittingApplication} handleSubmitApplication={handleSubmitApplication} closeSheet={() => applyBottomRef.current?.close()}
            /> : 
            <View className='flex-1 justify-center items-center px-4'>
              <Text>Sign up or login to get started</Text>
              <TouchableOpacity className='bg-blue-500 p-4 w-full rounded-lg mt-4 mb-2 items-center' onPress={() => router.push('/(auth)/sign-in')}>
                <Text>Create an Account</Text>
              </TouchableOpacity>
              <TouchableOpacity className='bg-blue-500 p-4 w-full rounded-lg mt-4 mb-2 items-center' onPress={() => router.push('/(auth)/sign-in')}>
                <Text>Sign In</Text>
              </TouchableOpacity>
            </View>}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  )
}

export default JobDetails