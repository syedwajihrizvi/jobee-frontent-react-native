import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const EditProfileCard = ({label, value}: {label: string, value: string}) => {
  return (
          <View className="flex-grow min-w-[45%] p-4 rounded-2xl bg-white shadow-md border border-gray-100 flex-row justify-between items-start">
            <View>
              <Text className="font-quicksand-bold text-base text-gray-600">{label}</Text>
              <Text className="font-quicksand-semibold text-lg text-gray-900" numberOfLines={1}>{value}</Text>
            </View>
            <TouchableOpacity>
              <AntDesign name="edit" size={20} color="black" />
            </TouchableOpacity>
          </View>
  )
}

export default EditProfileCard