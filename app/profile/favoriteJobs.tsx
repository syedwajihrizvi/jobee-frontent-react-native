import BackBar from '@/components/BackBar'
import JobListing from '@/components/JobListing'
import { useJobsByUserFavorites } from '@/lib/services/useJobs'
import useAuthStore from '@/store/auth.store'
import { Job } from '@/type'
import { router } from 'expo-router'
import React from 'react'
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FavoriteJobs = () => {
  const { user, isLoading: isLoadingUser } = useAuthStore()
  const { data: jobs, isLoading: isLoadingJobs } = useJobsByUserFavorites(user?.id)

  return (
    <SafeAreaView className='relative flex-1 bg-white'>
        <BackBar label="My Favorite Jobs"/>
        {isLoadingUser || isLoadingJobs ? 
        <ActivityIndicator size="large" color="#0000ff" className='flex-1 justify-center items-center'/> : 
        <FlatList
            className='w-full p-2'
            data={jobs || []} // Simulating multiple job listings
            renderItem={({item, index}: {item: Job; index: number}) => (
            <TouchableOpacity activeOpacity={0.2} onPress={() => router.push(`/jobs/${item.id}`)}>
            <JobListing key={index} {...item} />
            </TouchableOpacity>
        )}
            ItemSeparatorComponent={() => <View className='divider'/>}
        />}
    </SafeAreaView>
  )
}

export default FavoriteJobs