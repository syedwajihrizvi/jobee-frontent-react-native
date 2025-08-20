import { Education } from '@/type'
import React from 'react'
import { Text, View } from 'react-native'

const ProfileEducationCard = ({ education }: { education: Education }) => {
  return (
    <View className='bg-white p-4 rounded-lg shadow-md w-full'>
      <View className='w-full flex-row items-center justify-between'>
        <Text className='font-quicksand-bold italic'>{education.institution}</Text>
        <Text className='font-quicksand-bold italic'>{education.fromYear}-{education.toYear ? education.toYear : "Present"}</Text>
      </View>
      <Text className='font-quicksand-semibold text-sm'>{education.degree}</Text>
    </View>
  )
}

export default ProfileEducationCard