import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const QuickApplyModal = (
    {visible, label, canQuickApply, handleClose}: 
    {visible: boolean, label: string, canQuickApply: boolean, handleClose: (apply: boolean, showPopup: boolean) => void}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

//   const renderPressableClass = () => {
//     if (dontShowAgain)
//         return {width: 15, height: 15, borderRadius: '100%', backgroundColor: 'black'}
//     return {width: 15, height: 15, borderRadius: '100%', borderWidth: 1, border: '1px solid black'}
//   }

  return (
    <Modal
        transparent
        animationType="fade"
        visible={visible}
    >
      <View className='flex-1 bg-black/45 justify-center items-center'>
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
            }}>
            {canQuickApply ?
            <>
                <Text className='font-quicksand-bold text-xl'>Quick Apply</Text>
                <Text className='font-quicksand-medium text-center'>{label} with primary resume: Resume.pdf</Text>
                {/* <Pressable onPress={() => setDontShowAgain(!dontShowAgain)} className='flex flex-row items-center gap-2 my-4'>
                    <View style={renderPressableClass()}/>
                    <Text>Do not show confirmation dialogue again</Text>
                </Pressable> */}
                <View className='flex flex-row items-center justify-center w-full gap-2'>
                    <TouchableOpacity 
                        className='apply-button w-1/2 items-center justify-center h-14'
                        onPress={() => handleClose(true, dontShowAgain)}>
                        <Text className='font-quicksand-bold'>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className='apply-button w-1/2 items-center justify-center h-14'
                        onPress={() => handleClose(false, dontShowAgain)}>
                        <Text className='font-quicksand-bold'>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </> :
            <>
                <Text className='font-quicksand-bold text-xl'>Cannot Quick Apply</Text>
                <Text className='font-quicksand-medium text-center'>You need to upload a resume to quick apply for jobs.</Text>
                    <TouchableOpacity 
                        className='apply-button w-1/2 items-center justify-center h-14'
                        onPress={() => {
                            handleClose(false, false);
                            router.push('/profile/manageDocs')
                        }}>
                        <Text className='font-quicksand-bold'>Upload Resume</Text>
                    </TouchableOpacity>
            </>}

        </View>
      </View>
    </Modal>
  )
}

export default QuickApplyModal