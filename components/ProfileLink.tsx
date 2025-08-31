import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const ProfileLink = ({icon, label, onPress, rightIcon=true}:{icon: React.ReactNode, label:string, onPress:() => void, rightIcon?: boolean}) => {
  return (
    <TouchableOpacity className='flex flex-row items-center w-full p-2' onPress={onPress}>
      <View className='flex-row items-center gap-2'>
        {icon}
        <Text className='ml-2 font-quicksand-semibold text-xl'>{label}</Text>
      </View>
      {rightIcon && <AntDesign name="right" size={20} color="black" className='ml-auto' />}
    </TouchableOpacity>
  )
}

export default ProfileLink