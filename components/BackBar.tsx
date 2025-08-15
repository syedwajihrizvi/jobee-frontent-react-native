import AntDesign from '@expo/vector-icons/AntDesign'
import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const BackBar = ({label}: {label:string}) => {
  return (
      <View className='flex-row w-full justify-between items-center'>
        <TouchableOpacity onPress={() => router.back()} >
          <AntDesign name="arrowleft" size={24} color="black"/>
        </TouchableOpacity>
        <Text className='text-lg font-semibold '>{label}</Text>
        <View style={{width:24}}/>
      </View> 
  )
}

export default BackBar