import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const ProfileSkillCard = ({skill, experience}: {skill: string, experience: number}) => {
  return (
    <View className="relative p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
        <Text className="font-quicksand-bold text-lg text-gray-900">{skill}</Text>
        <Text className="font-quicksand-semibold text-md text-gray-600">Experience: {experience}</Text>
        <TouchableOpacity className="absolute -top-2 -right-2 rounded-full p-1">
            <AntDesign name="edit" size={20} color="black" />
        </TouchableOpacity>
    </View>
  )
}

export default ProfileSkillCard