import BackBar from '@/components/BackBar'
import JobListing from '@/components/JobListing'
import { useJobsByUserApplications } from '@/lib/services/useJobs'
import useAuthStore from '@/store/auth.store'
import { Job } from '@/type'
import { router } from 'expo-router'
import React from 'react'
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const AppliedJobs = () => {
  const { user } = useAuthStore()
  const { data: jobs, isLoading: isLoadingJobs } = useJobsByUserApplications(user?.id)
  
  return (
    <SafeAreaView className='relative flex-1 bg-white'>
        <BackBar label="Jobs I've Applied To"/>
        {isLoadingJobs ? 
        <ActivityIndicator size="large" color="#0000ff" className='flex-1 justify-center items-center'/> : 
        <FlatList
            className='w-full p-2'
            data={jobs || []} // Simulating multiple job listings
            renderItem={({item, index}: {item: {job: Job, status: string}; index: number}) => (
            <TouchableOpacity activeOpacity={0.2} onPress={() => router.push(`/jobs/${item.job.id}`)}>
                <JobListing 
                    key={index} job={item.job} showFavorite={false} showStatus={true} 
                    status={item.status}/>
            </TouchableOpacity>
        )}
            ItemSeparatorComponent={() => <View className='divider'/>}
        />}
    </SafeAreaView>
  )
}

export default AppliedJobs