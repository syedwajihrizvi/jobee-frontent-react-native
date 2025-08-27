import { formatDate } from '@/lib/utils'
import { Job } from '@/type'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const BusinessJobListings= ({job}: {job: Job}) => {
  return (
    <View className='w-full px-4 py-2 rounded-full'>
      <TouchableOpacity activeOpacity={0.2}>
        <View className='flex-row items-start justify-between'>
          <Text className='font-quicksand-bold text-2xl w-2/3'>{job.title}</Text>
          <Text className='font-quicksand-semibold text-sm text-black border border-black px-2 py-1 rounded-full'>{job.applicants} Applicants</Text>
        </View>
        <Text className='font-quicksand-medium text-lg'>{job.location}</Text>
        <Text className='font-quicksand-semibold text-sm'>${job.minSalary} - ${job.maxSalary} | {job.employmentType}</Text>
        <Text className='font-quicksand-semibold text-sm'>{formatDate(job.createdAt)}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default BusinessJobListings