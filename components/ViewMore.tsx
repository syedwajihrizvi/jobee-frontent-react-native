import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const ViewMore = ({label, onClick}:{label:string, onClick: () => void}) => {
  return (
    <View className='flex-row gap-1 items-center'>
     <TouchableOpacity onPress={onClick}>
        <Text className='font-quicksand-bold text-lg underline'>{label}</Text>
     </TouchableOpacity>
     <AntDesign name="arrow-right" size={20} color="black" className='mt-1'/>
    </View>
  )
}

export default ViewMore