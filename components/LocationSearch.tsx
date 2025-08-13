import React from 'react';
import { Text, TextInput, View } from 'react-native';

const LocationSearch = ({value, onChange}: {value: string; onChange: (text: string) => void}) => {
  return (
    <View>
      <Text className='label'>Location</Text>
      <View className='rounded-full border border-gray-300 bg-white p-1'>
        <TextInput 
          placeholder="Search for a location" 
          autoCapitalize='none'
          className='p-2'
          value={value}
          onChangeText={onChange}
        />
      </View>
    </View>
  )
}

export default LocationSearch