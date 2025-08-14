import React from 'react'
import { Text } from 'react-native'

const BoldLabeledText = ({label, value}: {label: string, value: string}) => {
  return (
    <Text>
        <Text className='font-quicksand-bold'>{label}: </Text>
        <Text className='font-quicksand-regular'>{value}</Text>
    </Text>
  )
}

export default BoldLabeledText