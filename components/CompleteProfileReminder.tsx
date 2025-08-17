import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const CompleteProfileReminder = ({ onComplete, onLater }: { onComplete: () => void; onLater: () => void; }) => {
  return (
    <View 
        className='profile-reminder'>
      <Text className='text-white font-quicksand-bold text-lg'>
        Complete your profile now
      </Text>
      <View className='flex flex-row gap-4 mt-2'>
        <TouchableOpacity className='action-button bg-green-500' onPress={onComplete}>
            <Text className='action-button__text'>Complete Now</Text>
        </TouchableOpacity>
        <TouchableOpacity className='action-button bg-red-500' onPress={onLater}>
            <Text className='action-button__text'>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CompleteProfileReminder