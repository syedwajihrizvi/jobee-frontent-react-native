import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { TextInput, View } from 'react-native'

const SearchBar = ({ placeholder, onChange }: {placeholder: string, onChange: (text: string) => void}) => {
  return (
    <View 
        className='search-bar-container'
        style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        }}>
        <AntDesign name="search1" size={18} color="black" className='left-4 z-10' />
        <TextInput className='search-bar' placeholder={placeholder} onChangeText={onChange} returnKeyType='search'/>
    </View>
  )
}

export default SearchBar