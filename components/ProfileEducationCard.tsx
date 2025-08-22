import { Education } from '@/type'
import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const ProfileEducationCard = ({ education }: { education: Education }) => {
  return (
    <View className='bg-white p-4 rounded-lg shadow-md w-full relative'>
      <View className='w-full flex-row items-center justify-between'>
        <Text className='font-quicksand-bold italic'>{education.institution}</Text>
        <Text className='font-quicksand-bold italic'>{education.fromYear}-{education.toYear ? education.toYear : "Present"}</Text>
      </View>
      <Text className='font-quicksand-semibold text-sm'>{education.degree}</Text>
        <TouchableOpacity className="absolute -top-2 -right-2 rounded-full p-1">
            <AntDesign name="edit" size={20} color="black" />
        </TouchableOpacity>
    </View>
  )
}

export default ProfileEducationCard