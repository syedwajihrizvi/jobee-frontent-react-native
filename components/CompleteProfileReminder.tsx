import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const CompleteProfileReminder = ({ onComplete, onLater }: { onComplete: () => void; onLater: () => void; }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const handleProfileComplete = () => {
    setModalVisible(false);
    onComplete()
    
  }
    
  const handleProfileLater = () => {
    setModalVisible(false);
    onLater()
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}>
        <View className="flex-1 bg-black/45 justify-center items-center">
          <View 
            style={{ 
                width: 300,
                height: 200,
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                gap: 10
            }}
          >
            <Text className='text-black font-quicksand-bold text-lg'>Complete your profile now</Text>
            <Text className='text-black font-quicksand-medium text-center'>Complete your profile to increase your chances of getting hired! Simple as uploading a resume.</Text>
            <View className='flex flex-row items-center justify-center w-full gap-2'>
                <TouchableOpacity 
                    className='apply-button w-1/2 items-center justify-center h-14'
                    onPress={handleProfileComplete}>
                    <Text className='font-quicksand-bold'>Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className='apply-button w-1/2 items-center justify-center h-14'
                    onPress={handleProfileLater}>
                    <Text className='font-quicksand-bold'>Later</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
    </Modal>
  )
}

export default CompleteProfileReminder