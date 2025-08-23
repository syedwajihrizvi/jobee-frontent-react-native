import { Experience } from '@/type'
import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const ProfileExperienceCard = ({ experience, onEditExperience }: { experience: Experience, onEditExperience: () => void }) => {
  return (
    <View className='bg-white p-4 rounded-lg shadow-md w-full relative'>
      <View className='w-full flex-row items-center justify-between'>
        <Text className='font-bold text-lg'>{experience.title}</Text>
        <Text className='font-semibold text-md'>{experience.from} - {experience.currentlyWorking ? 'Present' : experience.to}</Text>
      </View>
      <Text className='italic text-md'>{experience.company}</Text>
      <Text className='text-md'>{experience.description}</Text>
        <TouchableOpacity className="absolute -top-2 -right-2 rounded-full p-1" onPress={onEditExperience}>
            <AntDesign name="edit" size={20} color="black" />
        </TouchableOpacity>
    </View>
  )
}
2
export default ProfileExperienceCard