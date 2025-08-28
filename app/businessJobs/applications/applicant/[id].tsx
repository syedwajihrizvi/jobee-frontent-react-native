import BackBar from '@/components/BackBar'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ApplicantForBusiness = () => {
  const { id } = useLocalSearchParams()
  return (
    <SafeAreaView className='flex-1 bg-white relative'>
      <BackBar label="Applicant Details"/>
      <Text className='font-quicksand-bold text-lg text-gray-900'>
        Applicant ID: {id}
      </Text>
    </SafeAreaView>
  )
}

export default ApplicantForBusiness