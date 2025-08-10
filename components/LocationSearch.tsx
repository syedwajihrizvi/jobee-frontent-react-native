import React from 'react'
import { Text, TextInput, View } from 'react-native'

const LocationSearch = () => {
  return (
    <View>
      <Text>Location</Text>
      <TextInput 
        placeholder="Search for a location" 
        autoCapitalize='none'
        className='input'
      />
    </View>
  )
}

export default LocationSearch