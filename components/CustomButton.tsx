import { CustomButtonProps } from '@/type'
import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'

const CustomButton = ({text, customClass, onClick, isLoading}: CustomButtonProps) => {
  return (
    <TouchableOpacity 
        className={`${customClass}`}
        style={{flex:1, alignItems: 'center'}}
        onPress={onClick}
        disabled={isLoading}>
        {isLoading ? <ActivityIndicator color='white'/> : 
        <Text className='font-quicksand-semibold text-md'>{text}</Text>}
    </TouchableOpacity>
  )
}

export default CustomButton