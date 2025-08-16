import { UserDocument } from '@/type'
import React from 'react'
import { Text, View } from 'react-native'

const DocumentItem = ({document}: {document: UserDocument}) => {
  return (
    <View className='document-item'>
      <Text>DocumentItem</Text>
    </View>
  )
}

export default DocumentItem