import { CustomInputProps } from '@/type'
import React from 'react'
import { ReturnKeyTypeOptions, Text, TextInput, View } from 'react-native'

const CustomInput = ({
  placeholder, label, value, returnKeyType='default', autoCapitalize='none', multiline=false, customClass, onChangeText
}: CustomInputProps) => {
  return (
    <View className='w-full'>
      {label &&<Text className='label'>{label}</Text>}
      <TextInput 
        placeholder={placeholder} 
        autoCapitalize={autoCapitalize as 'none' | 'sentences' | 'words' | 'characters'}
        value={value}
        multiline={multiline}
        onChangeText={onChangeText}
        className={customClass ? customClass : 'input'}
        blurOnSubmit={true}
        returnKeyType={returnKeyType as ReturnKeyTypeOptions}
      />
    </View>
  )
}

export default CustomInput