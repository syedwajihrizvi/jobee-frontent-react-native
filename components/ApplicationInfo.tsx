import { formatDate } from '@/lib/utils'
import { Application, Job } from '@/type'
import React from 'react'
import { Text, View } from 'react-native'

const ApplicationInfo = ({job, application}: {job: Job, application: Application}) => {
  return (
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
  )
}

export default ApplicationInfo