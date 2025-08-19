import useAuthStore from '@/store/auth.store';
import { Job } from '@/type';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import CompanyInformation from './CompanyInformation';
import FavoriteJob from './FavoriteJob';

const JobListing = (job: Job) => {
  const { user } = useAuthStore();
  return (
    <View className='w-full p-4 rounded-full'>
      <View className='flex-row items-center justify-between'>
        <CompanyInformation company={job.businessName} />
        <FavoriteJob jobId={job.id} />
      </View>
      <Text className='font-quicksand-bold text-2xl'>{job.title}</Text>
      <Text className='font-quicksand-medium text-lg'>{job.businessName} {'\u00B7'} {job.location}</Text>
      <Text className='font-quicksand-semibold text-sm'>${job.minSalary} - ${job.maxSalary}</Text>
      <ScrollView className='flex-row flex-wrap gap-2 mt-2' horizontal showsHorizontalScrollIndicator={false}>
        {job.tags?.map((tag, index) => (
          <Text key={index} className='bg-gray-200 rounded-full px-3 py-1 text-sm mx-1'>{tag.name}</Text>
        ))}
      </ScrollView>
    </View>
  )
}

export default JobListing