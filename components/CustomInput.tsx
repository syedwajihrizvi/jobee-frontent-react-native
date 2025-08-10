import { CustomInputProps } from '@/type'
import React from 'react'
import { Text, TextInput, View } from 'react-native'

const CustomInput = ({placeholder, label, value, onChangeText}: CustomInputProps) => {
  return (
    <View className='w-full'>
      <Text className='label'>{label}</Text>
      <TextInput 
        placeholder={placeholder} 
        autoCapitalize='none'
        value={value}
        onChangeText={onChangeText}
        className='input'
      />
    </View>
  )
}

export default CustomInput