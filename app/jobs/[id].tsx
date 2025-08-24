import BoldLabeledText from '@/components/BoldLabeledText'
import CompanyInformation from '@/components/CompanyInformation'
import DocumentItem from '@/components/DocumentItem'
import FavoriteJob from '@/components/FavoriteJob'
import ViewMore from '@/components/ViewMore'
import { useJob } from '@/lib/services/useJobs'
import useAuthStore from '@/store/auth.store'
import AntDesign from '@expo/vector-icons/AntDesign'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useRef } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const JobDetails = () => {
  const { id } = useLocalSearchParams()
  const { user, isAuthenticated } = useAuthStore()
  const {data:job, isLoading} = useJob(Number(id))
  const jobBottomRef = useRef<BottomSheet>(null)
  const companyBottomRef = useRef<BottomSheet>(null)
  const applyBottomRef = useRef<BottomSheet>(null)

  const handleJobBottomOpen = () => {
    companyBottomRef.current?.close();
    applyBottomRef.current?.close();
    jobBottomRef.current?.expand();
  }

  const handleCompanyBottomOpen = () => {
    jobBottomRef.current?.close();
    applyBottomRef.current?.close();
    companyBottomRef.current?.expand();
  }

  const handleApplyBottomOpen = () => {
    companyBottomRef.current?.close();
    jobBottomRef.current?.close();
    applyBottomRef.current?.expand();
  }

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
          onPress={handleApplyBottomOpen}>
          <Text className='font-quicksand-semibold text-md'>Apply Now</Text>
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
      <BottomSheet ref={applyBottomRef} index={-1} snapPoints={["60%","70%"]} enablePanDownToClose>
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
              <Text>Resume being used - {user.documents[0].documentUrl}</Text>
              <Text>Last Updated - {user.documents[0].createdAt.toString()}</Text>
              <DocumentItem document={user.documents[0]} customAction={() => console.log("Edit document")} />
            </View>
            <View>
              <Text>Optionally, add a cover letter</Text>
            </View>
            <View>
              <Text>Company specific questions: Please apply below</Text>
            </View>
            <View className='w-full flex flex-row gap-2'>
              {/** TODO: New feature coming soon - Save for later */}
              <TouchableOpacity className='apply-button w-1/2 items-center justify-center h-14 mt-4' onPress={() => console.log("Apply to job")}>
                <Text className='font-quicksand-semibold text-md'>Submit Application</Text>
              </TouchableOpacity>
              <TouchableOpacity className='cancel-button w-1/2 items-center justify-center h-14 mt-4' onPress={() => console.log("Cancel")}>
                <Text className='font-quicksand-semibold text-md'>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View> : <Text>Sign up or login to apply</Text>}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  )
}

export default JobDetails