import BoldLabeledText from '@/components/BoldLabeledText'
import CompanyInformation from '@/components/CompanyInformation'
import FavoriteJob from '@/components/FavoriteJob'
import ViewMore from '@/components/ViewMore'
import { useJob } from '@/lib/services/useJobs'
import AntDesign from '@expo/vector-icons/AntDesign'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useRef } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const JobDetails = () => {
  const { id } = useLocalSearchParams()
  const {data:job, isLoading} = useJob(Number(id))
  const jobBottomRef = useRef<BottomSheet>(null)
  const compantBottomRef = useRef<BottomSheet>(null)

  const handleJobBottomOpen = () => {
    compantBottomRef.current?.close();
    jobBottomRef.current?.expand();
  }

  const handleCompanyBottomOpen = () => {
    jobBottomRef.current?.close();
    compantBottomRef.current?.expand();
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
          <FavoriteJob/> 
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
      <View className="w-full absolute bottom-0 bg-slate-100 p-4 flex-row gap-2 items-center justify-center">
        <TouchableOpacity className='apply-button w-4/6 items-center justify-center h-14'>
          <Text className='font-quicksand-semibold text-md'>Apply Now</Text>
        </TouchableOpacity>
        <TouchableOpacity className='favorite-button h-14 w-1/6 items-center justify-center'>
          <FavoriteJob/>
        </TouchableOpacity>
      </View>

      <BottomSheet ref={jobBottomRef} index={-1} snapPoints={["40%", "50%"]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          <View className='p-4 bg-white flex-1'>
            <Text className='font-quicksand-bold text-2xl'>Job Tags</Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet ref={compantBottomRef} index={-1} snapPoints={["40%", "50%"]} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white'>
          <View className='p-4 bg-white flex-1'>
            <Text className='font-quicksand-bold text-2xl'>Company Info</Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  )
}

export default JobDetails