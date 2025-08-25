import { Job } from '@/type';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CompanyInformation from './CompanyInformation';
import FavoriteJob from './FavoriteJob';

const JobListing = ({job, showFavorite = true, showStatus = false, status}: {job: Job, showFavorite?: boolean, showStatus?: boolean, status?: string}) => {
  return (
    <View className='w-full p-4 rounded-full'>
      <TouchableOpacity activeOpacity={0.2} onPress={() => router.push(`/jobs/${job.id}`)}>
        <View className='flex-row items-center justify-between'>
          <CompanyInformation company={job.businessName} />
          {showFavorite && <FavoriteJob jobId={job.id} />}
          {(showStatus && status) && 
          <Text className='font-quicksand-semibold text-sm text-black border border-black px-2 py-1 rounded-full'>{status}</Text>}
        </View>
        <Text className='font-quicksand-bold text-2xl'>{job.title}</Text>
        <Text className='font-quicksand-medium text-lg'>{job.businessName} {'\u00B7'} {job.location}</Text>
        <Text className='font-quicksand-semibold text-sm'>${job.minSalary} - ${job.maxSalary}</Text>
      </TouchableOpacity>
      <ScrollView className='flex-row flex-wrap gap-2 mt-2' horizontal showsHorizontalScrollIndicator={false}>
        {job.tags?.map((tag, index) => (
          <Text key={index} className='bg-gray-200 rounded-full px-3 py-1 text-sm mx-1'>{tag.name}</Text>
        ))}
      </ScrollView>
    </View>
  )
}

export default JobListing