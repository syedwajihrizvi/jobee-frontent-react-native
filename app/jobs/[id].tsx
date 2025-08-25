import BoldLabeledText from '@/components/BoldLabeledText'
import CompanyInformation from '@/components/CompanyInformation'
import CustomButton from '@/components/CustomButton'
import DocumentItem from '@/components/DocumentItem'
import FavoriteJob from '@/components/FavoriteJob'
import ViewMore from '@/components/ViewMore'
import { applyToJob } from '@/lib/jobEndpoints'
import { useJob } from '@/lib/services/useJobs'
import useAuthStore from '@/store/auth.store'
import { CreateApplication, UserDocument } from '@/type'
import AntDesign from '@expo/vector-icons/AntDesign'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
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
    if (user && user.documents) {
      const resumes = user.documents.filter(doc => doc.documentType === 'RESUME');
      const coverLetters = user.documents.filter(doc => doc.documentType === 'COVER_LETTER');
      setUserDocuments({
        'RESUMES': resumes,
        'COVER_LETTERS': coverLetters
      });
      if (resumes.length > 0) {
        setSelectedResume(String(resumes[0].id));
      }
    }
  }, [isLoadingUser, user])
  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
    return formatter.format(parsedDate)
  }
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

  const getUserDocumentById = (id: number): UserDocument | undefined => {
    return user?.documents.find(doc => doc.id === id);
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
    } catch (error) {
      
    } finally {
      setIsSubmittingApplication(false);
    }
  }
  const application = user?.applications.find(app => app.jobId === Number(jobId))

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
          <View className='p-4 bg-white flex-1'>
            <Text className='font-quicksand-bold text-2xl'>Job Tags</Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet ref={companyBottomRef} index={-1} snapPoints={["40%", "50%"]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          <View className='p-4 bg-white flex-1'>
            <Text className='font-quicksand-bold text-2xl'>Company Info</Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet ref={viewApplicationBottomRef} index={-1} snapPoints={["50%"]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          <View className='p-4'>
            <Text className='font-quicksand-bold text-2xl'>Application Status</Text>
            <Text className='font-quicksand-semibold text-base mt-2'>
              You have already applied to this job. Our team is reviewing your application and will get back to you soon.
            </Text>
            <View className='divider'/>
            <Text className='font-quicksand-bold text-xl'>Application Details</Text>
            <View className='mt-2'>
              <Text className='font-quicksand-semibold text-base'>Job Title: {job?.title}</Text>
              <Text className='font-quicksand-semibold text-base'>Applied On: {formatDate(application?.appliedAt!)}</Text>
              <Text className='font-quicksand-semibold text-base'>Status: {application?.status}</Text>
          </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet ref={applyBottomRef} index={-1} snapPoints={[`${65}%`]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          {(isAuthenticated && user) ? 
          <View className='p-4 bg-white flex-1'>
            <View className='w-full flex-row items-center justify-between'>
              <Text className='font-quicksand-bold text-2xl'>Please confirm details</Text>
              <TouchableOpacity onPress={() => console.log("Show AI information")} className='p-1 rounded-full border border-black'>
                <AntDesign name="info" size={16} color="black"/>
              </TouchableOpacity>
            </View>
            <View>
            <Text className='font-quicksand-bold text-xl'>Resume</Text>
            <View className='flex-row gap-2 my-2'>
              {selectedResume && <DocumentItem document={getUserDocumentById(Number(selectedResume))!} />}
              <View className='w-1/2'>
                {user && user.documents && user.documents.length > 0?
                <View className='flex-col gap-2'>
                  <DropDownPicker
                    open={openResumeDropdown}
                    value={selectedResume}
                    items={userDocuments?.RESUMES.map((doc) => ({label: doc.filename, value: String(doc.id)})) ?? []}
                    setOpen={setOpenResumeDropdown}
                    setValue={setSelectedResume}
                    onChangeValue={(value) => setSelectedResume(value)}
                    containerStyle={{width: '100%'}}
                    placeholder="Select a resume"
                  />
                  <Text className='font-quicksand-bold text-md color-blue-500'>Last Updated - {formatDate(user.documents[0].createdAt)}</Text>
                </View> : <Text>Upload a resume please</Text>}
              </View>
            </View>
            </View>
            <View className='divider'/>
            <View className='flex flex-col gap-2'>
              <Text className='font-quicksand-bold text-xl'>Cover Letter (Optional)</Text>
              <View className='flex-row gap-2 my-2'>
                {
                selectedCoverLetter && 
                <DocumentItem 
                  document={getUserDocumentById(Number(selectedCoverLetter))!}
                  customAction={() => {setSelectedCoverLetter(null); setOpenCoverLetterDropdown(false)}} 
                  actionIcon='delete'/>
                }
                <View className='w-1/2'>
                  {user && user.documents && user.documents.length > 0?
                  <View className='flex-col gap-2'>
                    <DropDownPicker
                      open={openCoverLetterDropdown}
                      value={selectedCoverLetter}
                      items={userDocuments?.COVER_LETTERS.map((doc) => ({label: doc.filename, value: String(doc.id)})) ?? []}
                      setOpen={setOpenCoverLetterDropdown}
                      setValue={setSelectedCoverLetter}
                      onChangeValue={(value) => setSelectedCoverLetter(value)}
                      containerStyle={{width: '100%'}}
                      placeholder="Select a cover letter"
                    />
                    <Text className='font-quicksand-bold text-md color-blue-500'>Last Updated - {formatDate(user.documents[0].createdAt)}</Text>
                  </View> : <Text>Upload a resume please</Text>}
                </View>
              </View>
            </View>
            <View className='divider'/>
            <View>
              <Text>Company specific questions: Please answer below</Text>
            </View>
            <View className='w-full flex flex-row gap-2'>
              {/** TODO: New feature coming soon - Save for later */}
              <CustomButton
                customClass='apply-button w-1/2 items-center justify-center h-14 mt-4'
                onClick={handleSubmitApplication}
                text="Submit Application"
                isLoading={isSubmittingApplication}
                />
              <CustomButton
                customClass='cancel-button w-1/2 items-center justify-center h-14 mt-4'
                onClick={() => applyBottomRef.current?.close()}
                text="Cancel"
                />
            </View>
          </View> : <Text>Sign up or login to apply</Text>}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  )
}

export default JobDetails