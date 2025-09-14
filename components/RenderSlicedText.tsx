import React from 'react'
import { Text } from 'react-native'

const RenderSlicedText = ({ text, maxLength, textClassName }: { text: string, maxLength: number, textClassName?: string }) => {
  return (
    <Text className={`font-quicksand-regular text-sm ${textClassName}`}>
        {text.length > maxLength ? `${text.slice(0, maxLength)}...` : text}
    </Text>
      
  )
}

export default RenderSlicedText